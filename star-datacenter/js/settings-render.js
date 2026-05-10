function rCfg(C,T){
  T.innerText='⚙️ 설정';
  if(!isLoggedIn){
    // (요청사항) 설정탭은 관리자 로그인 후만 접근 가능
    C.innerHTML='<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;gap:16px"><div style="font-size:48px">🔒</div><div style="font-size:18px;font-weight:800;color:var(--text)">관리자 전용 페이지</div><div style="font-size:13px;color:var(--gray-l)">설정 탭은 관리자 로그인 후 이용할 수 있습니다.</div><button class="btn btn-b" onclick="om(&#39;loginModal&#39;)">&#128273; 로그인</button></div>';
    return;
  }
  if(!window._cfgCat || window._cfgCat==='전체') window._cfgCat='🧩 운영/콘텐츠';
  const _cfgCats=(window._cfgCatOrder && Array.isArray(window._cfgCatOrder) ? window._cfgCatOrder : Object.keys(_catSecs||{}));
  const _cfgCatIcons={
    '🧩 운영/콘텐츠':'🧩',
    '🖼️ 스트리머/프로필':'🖼️',
    '🧾 카드/기록':'🧾',
    '🎨 UI/테마':'🎨',
    '🧠 자동화/도구':'🧠',
    '🧩 현황판/펨코':'🧩',
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
    '🖼️ 스트리머/프로필':'이미지탭/스트리머 상세/경기 상세(팝업)/상태아이콘',
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
    pd:'🎨 스트리머 상세 스타일', matchdetail:'🎮 경기 상세(팝업)',
    univlogoimg:'🏫 대학 로고 이미지(URL)',
    b2femco:'🧩 펨코스타일', femcoorder:'🔀 펨코스타일 스타대학 순서', boardchip:'🏷️ 현황판 칩/대학로고', oldbright:'🎨 구현황판 밝기', boardbg:'🧱 현황판 배경',
    tablabels:'🏷️ 탭 이름(라벨) 설정',
    uisize:'📱 모바일/태블릿 UI 크기',
    siAssign:'🎭 스트리머별 상태 아이콘 지정',
    cfgmenu:'🧭 설정 메뉴 정리', autofitall:'📱 전역 자동 맞춤', reccard:'🧾 기록 카드', tourneycard:'🏆 대회 카드', h2hpanel:'🎮 개인전/끝장전(프로리그 끝장전) 카드', sharecard:'🪪 공유카드 디자인', calui:'📅 캘린더', appfont:'🅰️ 전역 폰트',
    bgm:'🎵 유튜브 배경음악(BGM)', soopmv:'📺 SOOP(숲) 멀티뷰', pasteRoute:'🧠 붙여넣기 자동 분리',
    designv2:'✨ 디자인 모드', hdr:'🧩 헤더 상단바',
    fab:'📱 플로팅(FAB)', storage:'💾 저장소', selfcheck:'🧪 설정 점검',
    sync:'🔄 동기화', firebase:'☁️ GitHub(깃허브) 동기화', bulkdate:'📅 일괄 날짜', bulkmap:'🗺️ 일괄 맵', bulktier:'🎯 일괄 티어', bulkdel:'🗑️ 일괄 삭제', bulkconv:'🧾 변환'
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
  const _regBtn = (!isSubAdmin ? `<button class="btn btn-b no-export" onclick="openB2PlayerCreateModal()" style="padding:6px 10px;border-radius:14px;font-size:11px;font-weight:900;white-space:nowrap;flex-shrink:0">🎬 스트리머 등록</button>` : ``);
  const _menuBtn = `<button class="btn btn-w no-export" onclick="cfgGo('cfgmenu')" style="padding:6px 10px;border-radius:14px;font-size:11px;font-weight:900;white-space:nowrap;flex-shrink:0" title="설정 하위 메뉴 이름 변경/정리">🧭 메뉴정리</button>`;
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
  const _avaScale = Math.round((parseFloat(localStorage.getItem('su_avatar_scale') ?? '1') || 1) * 100);
  const _cfgViewMode = (localStorage.getItem('su_cfg_view_mode') || 'basic') === 'advanced' ? 'advanced' : 'basic';
  const _cfgBottomOpen = (()=>{ try{
    const saved=localStorage.getItem('su_cfg_bottom_open');
    if(saved==='1' || saved==='0') return saved==='1';
  }catch(e){}
  return _cfgViewMode==='advanced'; })();
  const _quickBtns = [
    {id:'pd', icon:'🎨', title:'스트리머 상세', desc:'배경/배지/프로필'},
    {id:'matchdetail', icon:'🎮', title:'경기 상세', desc:'헤더/프로필/색상'},
    {id:'profileshape', icon:'🖼️', title:'프로필 모양', desc:'원형/네모/효과'},
    {id:'uisize', icon:'📱', title:'UI 크기', desc:'모바일/태블릿 크기'},
    {id:'tablabels', icon:'🏷️', title:'탭 이름', desc:'상단/하위 메뉴명'},
    {id:'hdr', icon:'🧩', title:'헤더 바', desc:'제목/아이콘/배경'},
    {id:'reccard', icon:'🧾', title:'기록 카드', desc:'CK/프로 버튼색 포함'},
    {id:'cfgmenu', icon:'🧭', title:'메뉴 정리', desc:'자주 쓰는 설정 정리'}
  ];
  const _basicQuickBtns = _quickBtns.slice(0,4);
  const _moreQuickBtns = _quickBtns.slice(4);
  const _catButtons = _cfgCats.map(c=>{
    const on=window._cfgCat===c;
    return `<button type="button" onclick="cfgApplyCat('${c}')" class="no-export" data-cat="${c}" data-cfg-cat="${c}"
      style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px 12px;border-radius:16px;cursor:pointer;text-align:left;background:${on?'linear-gradient(135deg,var(--blue),#7c3aed)':'var(--white)'};color:${on?'#fff':'var(--text2)'};border:1px solid ${on?'transparent':'var(--border)'};box-shadow:${on?'0 10px 24px rgba(37,99,235,.22)':'0 4px 12px rgba(15,23,42,.04)'};min-height:82px">
      <span style="font-size:18px;line-height:1">${_cfgCatIcons[c]||'🗂️'}</span>
      <span style="font-size:12px;font-weight:900;line-height:1.25">${_catLabel(c)}</span>
      <span data-cfg-cat-desc="1" style="font-size:10px;opacity:${on?'.9':'.72'};font-weight:700;line-height:1.35">${_cfgCatDesc[c]||''}</span>
    </button>`;
  }).join('');
  const _cfgSecDesc = (window._cfgSecDescMap||{});
  const _secButtons = _curSecs.map(id=>{
    const title=_cfgSecTitle[id]||id;
    const desc=_cfgSecDesc[id]||'세부 설정 열기';
    return `<button type="button" class="btn btn-w no-export" onclick="cfgGo('${id}')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white);justify-content:flex-start;min-height:86px">
      <span style="font-size:15px;line-height:1">${String(title).match(/^[^\s]+/)?.[0]||'⚙️'}</span>
      <span style="font-size:12px;font-weight:900;color:var(--text2);line-height:1.3;word-break:keep-all;white-space:normal">${title.replace(/^[^\s]+\s*/,'')}</span>
      <span style="font-size:10px;color:var(--gray-l);font-weight:700;line-height:1.35;white-space:normal">${desc}</span>
    </button>`;
  }).join('');

  let h=`<div class="no-export cfg-topbar" style="position:sticky;top:0;z-index:10;background:var(--bg);padding:6px 0 0;margin-bottom:10px;border-bottom:1px solid var(--border)">
    <div class="cfg-topbar-inner" style="display:flex;align-items:center;gap:10px;padding-bottom:6px;flex-wrap:wrap">
      <div class="cfg-tools-row" style="display:flex;align-items:center;gap:6px;margin-left:auto;flex:1;min-width:220px;justify-content:flex-end">
        <div class="cfg-search-wrap" style="position:relative;flex:1;max-width:360px;min-width:220px">
          <input id="cfgSearchInp" placeholder="설정 검색..." value="${esc(String(window._cfgSearchQ||''))}" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:12px;font-size:12px;font-weight:700" oninput="cfgSearchSettings(this.value)">
          <div id="cfgSearchSug" class="cfg-search-sug" style="display:none"></div>
        </div>
        <span id="cfgSearchCnt" style="font-size:11px;color:var(--gray-l);font-weight:900;white-space:nowrap"></span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn ${_cfgViewMode==='basic'?'btn-b':'btn-w'} btn-xs" onclick="cfgSetViewMode('basic')">1단계 초보</button>
        <button class="btn ${_cfgViewMode==='advanced'?'btn-b':'btn-w'} btn-xs" onclick="cfgSetViewMode('advanced')">2단계 고급</button>
      </div>
      ${_cfgViewMode==='advanced' ? _menuBtn : ''}
      ${_regBtn}
    </div>
  </div>
  <div class="no-export" style="margin:0 0 14px;padding:12px;border:1px solid var(--border);border-radius:16px;background:linear-gradient(135deg,var(--surface),rgba(255,255,255,.92));box-shadow:0 8px 18px rgba(15,23,42,.04)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <div>
        <div style="font-size:13px;font-weight:900;color:var(--text2)">⚡ 1단계 초보 설정</div>
        <div style="font-size:11px;color:var(--gray-l)">지금은 자주 쓰는 설정만 간단하게 보여줍니다. 더 많은 메뉴는 2단계 고급에서 확인할 수 있습니다.</div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-w btn-xs" onclick="window.cfgFocusSearch&&window.cfgFocusSearch()">🔎 설정 검색</button>
        <button class="btn btn-w btn-xs" onclick="window.cfgCollapseAll&&window.cfgCollapseAll()">📦 보이는 항목 접기</button>
        <button class="btn btn-w btn-xs" onclick="window.cfgOpenFavorites&&window.cfgOpenFavorites()">⭐ 자주 쓰는 것만 열기</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:8px">
      ${(_cfgViewMode==='basic' ? _basicQuickBtns : _quickBtns).map(x=>`<button type="button" class="btn btn-w no-export" onclick="cfgGo('${x.id}')" style="display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:10px 12px;border-radius:14px;text-align:left;background:var(--white)">
        <span style="font-size:16px;line-height:1">${x.icon}</span>
        <span style="font-size:12px;font-weight:900;color:var(--text2)">${x.title}</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">${x.desc}</span>
      </button>`).join('')}
    </div>
    ${_cfgViewMode==='basic' ? `<details class="no-export" style="margin-top:10px;border:1px solid var(--border);border-radius:14px;background:rgba(255,255,255,.7)">
      <summary style="padding:11px 12px;cursor:pointer;font-size:12px;font-weight:900;color:var(--text2)">➕ 더 많은 빠른 이동 보기</summary>
      <div style="padding:0 10px 10px;display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:8px">
        ${_moreQuickBtns.map(x=>`<button type="button" class="btn btn-w no-export" onclick="cfgGo('${x.id}')" style="display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:10px 12px;border-radius:14px;text-align:left;background:var(--white)">
          <span style="font-size:16px;line-height:1">${x.icon}</span>
          <span style="font-size:12px;font-weight:900;color:var(--text2)">${x.title}</span>
          <span style="font-size:10px;color:var(--gray-l);font-weight:700">${x.desc}</span>
        </button>`).join('')}
      </div>
    </details>` : ''}
  </div>
  ${_cfgViewMode==='basic'
    ? `<details class="no-export" style="margin:0 0 14px;border:1px solid var(--border);border-radius:16px;background:var(--surface);box-shadow:0 8px 18px rgba(15,23,42,.03)">
    <summary style="padding:12px 14px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;font-weight:900;color:var(--text2)">🎨 디자인 빠른 이동 <span style="font-size:11px;color:var(--gray-l);font-weight:800">필요할 때만 열기</span></summary>
    <div style="padding:0 12px 12px">
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">현황판 디자인과 공유카드 디자인을 같은 카드형 버튼으로 바로 이동할 수 있습니다.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px">`
    : `<div class="no-export" style="margin:0 0 14px;padding:12px;border:1px solid var(--border);border-radius:16px;background:var(--surface);box-shadow:0 8px 18px rgba(15,23,42,.03)">
    <div style="margin-bottom:10px">
      <div style="font-size:13px;font-weight:900;color:var(--text2)">🎨 디자인 빠른 이동</div>
      <div style="font-size:11px;color:var(--gray-l)">현황판 디자인과 공유카드 디자인을 같은 카드형 버튼으로 바로 이동할 수 있습니다.</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px">`}
      <button type="button" class="btn btn-w no-export" onclick="cfgGo('sharecard')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white)">
        <span style="font-size:16px;line-height:1">🪪</span>
        <span style="font-size:12px;font-weight:900;color:var(--text2)">공유카드 디자인</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">모드, 색상, 승자 배경, 타입별 오버라이드</span>
      </button>
      <button type="button" class="btn btn-w no-export" onclick="cfgGo('boardchip')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white)">
        <span style="font-size:16px;line-height:1">🏷️</span>
        <span style="font-size:12px;font-weight:900;color:var(--text2)">현황판 칩/로고</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">프로필 크기, 대학 로고, 칩 크기 조절</span>
      </button>
      <button type="button" class="btn btn-w no-export" onclick="cfgGo('boardbg')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white)">
        <span style="font-size:16px;line-height:1">🖼️</span>
        <span style="font-size:12px;font-weight:900;color:var(--text2)">현황판 배경</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">배경 이미지/라벨 배경/표시 방식</span>
      </button>
      <button type="button" class="btn btn-w no-export" onclick="cfgGo('oldbright')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white)">
        <span style="font-size:16px;line-height:1">✨</span>
        <span style="font-size:12px;font-weight:900;color:var(--text2)">현황판 밝기</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">카드 배경/라벨 밝기 세부 조절</span>
      </button>
    </div>
  ${_cfgViewMode==='basic' ? `</div></details>` : `</div>`}
  ${_cfgViewMode==='advanced' ? `<details class="no-export" open style="margin:0 0 14px;border:1px solid var(--border);border-radius:18px;background:linear-gradient(135deg,var(--surface),rgba(255,255,255,.96));box-shadow:0 10px 22px rgba(15,23,42,.04)">
    <summary style="padding:14px 16px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px;font-weight:900;color:var(--text2)">🧭 2단계 고급 설정 전체 보기 <span style="font-size:11px;color:var(--gray-l);font-weight:800">카테고리별 전체 메뉴</span></summary>
    <div style="padding:0 12px 12px">
      <div style="margin:0 0 12px;padding:12px;border:1px solid var(--border);border-radius:16px;background:var(--white)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px">
          <div>
            <div style="font-size:13px;font-weight:900;color:var(--text2)">🧭 설정 카테고리</div>
            <div style="font-size:11px;color:var(--gray-l)">설정을 주제별로 나눠서 찾을 수 있습니다.</div>
          </div>
          <div data-cfg-cur-cat-label="1" style="font-size:11px;color:var(--gray-l);font-weight:800">현재: ${_catLabel(window._cfgCat)}</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px">
          ${_catButtons}
        </div>
      </div>
      <div style="padding:12px;border:1px solid var(--border);border-radius:16px;background:var(--surface);box-shadow:0 8px 18px rgba(15,23,42,.03)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px">
          <div>
            <div style="font-size:13px;font-weight:900;color:var(--text2)">📚 현재 카테고리 전체 메뉴</div>
            <div data-cfg-cur-cat-desc="1" style="font-size:11px;color:var(--gray-l)">${_catLabel(window._cfgCat)} 안의 세부 메뉴를 버튼으로 바로 엽니다.</div>
          </div>
          <button class="btn btn-w btn-xs" onclick="window.cfgCollapseAll&&window.cfgCollapseAll()">현재 화면 정리</button>
        </div>
        <div data-cfg-cur-sec-buttons="1" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px">
          ${_secButtons}
        </div>
      </div>
    </div>
  </details>` : `<div class="no-export" style="margin:0 0 14px;padding:12px;border:1px dashed var(--border2);border-radius:16px;background:var(--surface)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
      <div>
        <div style="font-size:13px;font-weight:900;color:var(--text2)">🧭 2단계 고급 설정 숨김 상태</div>
        <div style="font-size:11px;color:var(--gray-l)">세부 설정은 숨겨져 있습니다. 필요한 경우에만 2단계 고급을 열어 전체 메뉴를 볼 수 있습니다.</div>
      </div>
      <button class="btn btn-w btn-xs" onclick="cfgSetViewMode('advanced')">2단계 고급 열기</button>
    </div>
  </div>`}
  <div class="no-export" style="margin:0 0 14px;padding:12px;border:1px dashed var(--border2);border-radius:16px;background:var(--surface)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
      <div>
        <div style="font-size:13px;font-weight:900;color:var(--text2)">🧩 하단 세부 설정</div>
        <div style="font-size:11px;color:var(--gray-l)">아래 긴 설정 목록은 필요할 때만 펼쳐서 볼 수 있습니다. 검색 중에는 자동으로 표시됩니다.</div>
      </div>
      <button class="btn btn-w btn-xs" onclick="window.cfgToggleBottomSections&&window.cfgToggleBottomSections()">${_cfgBottomOpen?'🧩 세부 설정 접기 ▲':'🧩 세부 설정 펼치기 ▼'}</button>
    </div>
  </div>
${_scfgD('notice','📢 공지 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">접속 시 팝업으로 표시됩니다. 활성화된 공지만 보여집니다.</div>
    <div id="notice-list-area" style="margin-bottom:16px">
    ${notices.length===0?`<div style="padding:18px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px;font-size:13px">등록된 공지 없음</div>`:
      notices.map((n,i)=>`<div style="border:1px solid var(--border);border-radius:10px;padding:12px 14px;margin-bottom:8px;background:${n.active?'var(--white)':'var(--surface)'};opacity:${n.active?1:0.6}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span style="font-size:18px">${n.type||'📢'}</span>
          <span style="font-weight:700;flex:1;font-size:13px">${n.title||'(제목 없음)'}</span>
          <span style="font-size:11px;color:var(--gray-l)">${n.date||''}</span>
          <button class="btn btn-xs" style="background:${n.active?'#f0fdf4':'#f1f5f9'};color:${n.active?'#16a34a':'#64748b'};border:1px solid ${n.active?'#86efac':'#cbd5e1'};min-width:52px"
            onclick="notices[${i}].active=!notices[${i}].active;save();render()">
            ${n.active?'✅ 활성':'⭕ 비활성'}</button>
          <button class="btn btn-r btn-xs" onclick="if(confirm('공지를 삭제할까요?')){notices.splice(${i},1);save();render()}">🗑️</button>
        </div>
        ${(n.body||'').length>120
          ? `<div id="notice-body-${i}" style="font-size:12px;color:var(--text2);white-space:pre-wrap;max-height:60px;overflow:hidden">${(n.body||'').slice(0,120)}...</div>
             <button onclick="(function(){const el=document.getElementById('notice-body-${i}');const btn=document.getElementById('notice-exp-${i}');const open=el.style.maxHeight!=='none';el.style.maxHeight=open?'none':'60px';el.textContent=open?notices[${i}].body:notices[${i}].body.slice(0,120)+'...';btn.textContent=open?'▲ 접기':'▼ 전체보기';})()" id="notice-exp-${i}" style="background:none;border:none;color:var(--blue);font-size:11px;cursor:pointer;padding:2px 0;font-weight:600">▼ 전체보기</button>`
          : `<div style="font-size:12px;color:var(--text2);white-space:pre-wrap">${n.body||''}</div>`
        }
      </div>`).join('')
    }
    </div>
    <div style="border:1.5px dashed var(--border2);border-radius:12px;padding:16px;background:var(--surface)">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px">+ 새 공지 작성</div>
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">
        <select id="new-notice-type" style="width:140px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
          ${typeOpts.map(o=>`<option value="${o.v}">${o.l}</option>`).join('')}
        </select>
        <input type="text" id="new-notice-title" placeholder="공지 제목" style="flex:1;min-width:180px">
      </div>
      <textarea id="new-notice-body" placeholder="공지 내용을 입력하세요..." style="width:100%;height:80px;resize:vertical;border:1px solid var(--border2);border-radius:8px;padding:8px 10px;font-size:13px;box-sizing:border-box"></textarea>
      <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
        <label style="display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer">
          <input type="checkbox" id="new-notice-active" checked> 즉시 활성화
        </label>
        <button class="btn btn-b" style="margin-left:auto" onclick="
          const t=document.getElementById('new-notice-title').value.trim();
          const b=document.getElementById('new-notice-body').value.trim();
          const tp=document.getElementById('new-notice-type').value;
          const ac=document.getElementById('new-notice-active').checked;
          if(!t){alert('제목을 입력하세요');return;}
          notices.unshift({id:Date.now(),type:tp,title:t,body:b,active:ac,date:new Date().toLocaleDateString('ko-KR')});
          save();render();">📢 공지 등록</button>
      </div>
    </div>
  </details>
  ${(()=>{
    const seen={};const dupNames=[];
    players.forEach(p=>{if(seen[p.name])dupNames.push(p.name);else seen[p.name]=true;});
    const uniq=[...new Set(dupNames)];
    if(!uniq.length) return '';
    return `<div class="ssec" style="border:2px solid #fca5a5;background:#fff5f5">
      <h4 style="color:#dc2626">⚠️ 동명이인 감지 (${uniq.length}건)</h4>
      <div style="font-size:12px;color:#7f1d1d;margin-bottom:12px">중복 이름이 있으면 승패·기록이 뒤섞입니다. 한 명의 이름을 바꿔 구분하세요.</div>
      ${uniq.map(name=>{
        const dupes=players.map((p,i)=>({p,i})).filter(({p})=>p.name===name);
        return `<div style="background:var(--white);border:1px solid #fca5a5;border-radius:8px;padding:10px 12px;margin-bottom:8px">
          <div style="font-weight:800;color:#dc2626;font-size:13px;margin-bottom:6px">👥 "${name}" — ${dupes.length}명 중복</div>
          ${dupes.map(({p,i})=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            <span style="font-size:11px;background:#fee2e2;color:#991b1b;border-radius:4px;padding:1px 7px;font-weight:700">${p.univ||'무소속'}</span>
            <span style="font-size:11px;color:var(--gray-l)">${p.tier||'-'} · ${p.race||'-'}</span>
            <input type="text" id="dupfix-${i}" placeholder="새 이름..." style="flex:1;min-width:100px;padding:3px 7px;border-radius:5px;border:1px solid #fca5a5;font-size:12px">
            <button class="btn btn-xs" style="background:#dc2626;color:#fff;border-color:#dc2626" onclick="(function(){
              const inp=document.getElementById('dupfix-${i}');
              const nw=(inp?.value||'').trim();
              if(!nw){alert('새 이름을 입력하세요.');return;}
              if(players.find((x,xi)=>x.name===nw&&xi!==${i})){alert('이미 존재하는 이름입니다.');return;}
              editName=players[${i}].name;
              document.getElementById('emBody').innerHTML='';
              const oldN=players[${i}].name;
              players[${i}].name=nw;
              players.forEach(other=>{(other.history||[]).forEach(h=>{if(h.opp===oldN)h.opp=nw;});});
              [miniM,univM,comps,ckM,proM,ttM].forEach(arr=>(arr||[]).forEach(m=>{
                if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;
                (m.sets||[]).forEach(s=>(s.games||[]).forEach(g=>{if(g.playerA===oldN)g.playerA=nw;if(g.playerB===oldN)g.playerB=nw;}));
              }));
              (tourneys||[]).forEach(tn=>{
                (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});});
                const br=tn.bracket||{};
                Object.values(br.matchDetails||{}).forEach(m=>{if(m&&m.a===oldN)m.a=nw;if(m&&m.b===oldN)m.b=nw;});
                (br.manualMatches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});
              });
              (proTourneys||[]).forEach(tn=>{
                (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{if(m.a===oldN)m.a=nw;if(m.b===oldN)m.b=nw;});});
              });
              save();render();
            })()">✅ 적용</button>
          </div>`).join('')}
        </div>`;
      }).join('')}
    </div>`;
  })()}
  ${_scfgD('univ','🏛️ 대학 관리')}
    <div style="font-size:11px;color:var(--gray-l);margin:8px 0 10px">👁️ 숨김 처리된 대학은 비로그인 상태에서 현황판에 표시되지 않습니다.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <button class="btn btn-w btn-sm" onclick="cfgGo('univlogoimg')">🏫 대학 로고 이미지(URL) 설정</button>
      <span style="font-size:11px;color:var(--gray-l)">※ 대학명 옆 로고(아이콘) 표시용</span>
    </div>
    ${univCfg.map((u,idx)=>({u,idx})).filter(x=>x.u && !x.u.dissolved).map(({u,idx:i})=>{
      const isHidden = !!u.hidden;
      const _dSz = parseInt(u.logoSizeDetail || '', 10);
      const _pSz = parseInt(u.logoSizePlayers || '', 10);
      return `<div class="srow" style="background:${isHidden?'var(--surface)':'transparent'};border-radius:8px;padding:4px 6px;margin:-2px -6px;flex-wrap:wrap;gap:4px">
        <div class="cdot" style="background:${u.color};opacity:${isHidden?0.4:1}"></div>
        <input type="text" value="${u.name}" style="flex:1;max-width:130px;opacity:${isHidden?0.5:1}" onblur="const oldName=univCfg[${i}].name;const v=this.value.trim();if(!v){this.value=oldName;return;}if(v!==oldName&&univCfg.some((x,xi)=>xi!==${i}&&x.name===v)){alert('이미 추가된 대학명입니다.');this.value=oldName;return;}if(v!==oldName){renameUnivAcrossData(oldName,v);univCfg[${i}].name=v;save();render();}">
        <input id="cfg-univ-c-${i}" type="color" value="${u.color}" style="width:36px;height:30px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)" title="대학 색상"
          onchange="cfgUnivSetColor(${i},this.value)">
        <input id="cfg-univ-hex-${i}" type="text" value="${u.color}" placeholder="#RRGGBB" title="대학 색상 HEX 입력" style="width:96px;padding:4px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800"
          onblur="cfgUnivSetColor(${i},this.value)">
        <button class="btn btn-w btn-xs" title="스포이드로 색상 찍기" onclick="cfgUnivPickColor(${i})">🎯</button>
        <button class="btn btn-xs" style="background:${isHidden?'#fef2f2':'#f0fdf4'};color:${isHidden?'#dc2626':'#16a34a'};border:1px solid ${isHidden?'#fca5a5':'#86efac'};min-width:58px"
          onclick="univCfg[${i}].hidden=!univCfg[${i}].hidden;saveCfg();render()">
          ${isHidden?'👁️ 숨김':'✅ 표시'}</button>
        <button class="btn btn-xs" style="background:#fff7ed;color:#ea580c;border:1px solid #fed7aa" onclick="openDissolveModal(${i})">🏚️ 해체</button>
        <button class="btn btn-r btn-xs" onclick="delUniv(${i})">🗑️ 삭제</button>
        <div style="width:100%;padding:6px 0 2px 16px;display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <div style="font-size:11px;font-weight:800;color:var(--text2);min-width:154px">🏛️ 대학상세 로고 크기</div>
            <input type="range" min="28" max="72" step="2" value="${isNaN(_dSz)?46:Math.max(28,Math.min(72,_dSz))}" style="flex:1;min-width:140px;accent-color:var(--blue)"
              oninput="univCfg[${i}].logoSizeDetail=+this.value;saveCfg();try{if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();}catch(e){};render()">
            <span style="font-size:11px;color:var(--gray-l);min-width:42px;font-weight:900">${isNaN(_dSz)?46:Math.max(28,Math.min(72,_dSz))}px</span>
            <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizeDetail;saveCfg();render()" title="대학별 값 제거(기본값 사용)">초기화</button>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <div style="font-size:11px;font-weight:800;color:var(--text2);min-width:154px">🎬 스트리머탭 로고 크기</div>
            <input type="range" min="16" max="40" step="1" value="${isNaN(_pSz)?26:Math.max(16,Math.min(40,_pSz))}" style="flex:1;min-width:140px;accent-color:var(--blue)"
              oninput="univCfg[${i}].logoSizePlayers=+this.value;saveCfg();render()">
            <span style="font-size:11px;color:var(--gray-l);min-width:42px;font-weight:900">${isNaN(_pSz)?26:Math.max(16,Math.min(40,_pSz))}px</span>
            <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizePlayers;saveCfg();render()" title="대학별 값 제거(기본값 사용)">초기화</button>
          </div>
        </div>
      </div>`;
    }).join('')}
    ${(()=>{
      const dis = univCfg.map((u,idx)=>({u,idx})).filter(x=>x.u && x.u.dissolved);
      if(!dis.length) return '';
      return `<details style="margin-top:14px;border:1px dashed #fca5a5;background:#fff5f5;border-radius:12px;padding:10px 12px">
        <summary style="cursor:pointer;font-weight:900;color:#dc2626;list-style:none">🏚️ 해체된 대학 (${dis.length}) <span style="font-size:11px;font-weight:600;color:#7f1d1d">(펼치기)</span></summary>
        <div style="margin-top:10px;display:flex;flex-direction:column;gap:8px">
          ${dis.map(({u,idx:i})=>{
            const _dSz = parseInt(u.logoSizeDetail || '', 10);
            const _pSz = parseInt(u.logoSizePlayers || '', 10);
            return `<div class="srow" style="background:var(--white);border:1px solid #fecaca;border-radius:10px;padding:8px 10px;flex-wrap:wrap;gap:6px">
              <div class="cdot" style="background:${u.color};opacity:.8"></div>
              <div style="font-weight:900;color:#7f1d1d;min-width:120px">${esc(u.name||'')}</div>
              <span style="font-size:10px;background:#fee2e2;color:#dc2626;border:1px solid #fca5a5;border-radius:5px;padding:1px 6px;font-weight:800">🏚️ 해체 ${u.dissolvedDate||''}</span>
              <button class="btn btn-xs" style="background:#f0fdf4;color:#16a34a;border:1px solid #86efac" onclick="univCfg[${i}].dissolved=false;univCfg[${i}].hidden=false;delete univCfg[${i}].dissolvedDate;saveCfg();render()">🔄 복구</button>
              <button class="btn btn-r btn-xs" onclick="delUniv(${i})">🗑️ 삭제</button>
              <div style="width:100%;padding:6px 0 0 16px;display:flex;flex-direction:column;gap:8px">
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                  <div style="font-size:11px;font-weight:800;color:#7f1d1d;min-width:154px">🏛️ 대학상세 로고 크기</div>
                  <input type="range" min="28" max="72" step="2" value="${isNaN(_dSz)?46:Math.max(28,Math.min(72,_dSz))}" style="flex:1;min-width:140px;accent-color:#dc2626"
                    oninput="univCfg[${i}].logoSizeDetail=+this.value;saveCfg();try{if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();}catch(e){};render()">
                  <span style="font-size:11px;color:#7f1d1d;min-width:42px;font-weight:900">${isNaN(_dSz)?46:Math.max(28,Math.min(72,_dSz))}px</span>
                  <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizeDetail;saveCfg();render()">초기화</button>
                </div>
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                  <div style="font-size:11px;font-weight:800;color:#7f1d1d;min-width:154px">🎬 스트리머탭 로고 크기</div>
                  <input type="range" min="16" max="40" step="1" value="${isNaN(_pSz)?26:Math.max(16,Math.min(40,_pSz))}" style="flex:1;min-width:140px;accent-color:#dc2626"
                    oninput="univCfg[${i}].logoSizePlayers=+this.value;saveCfg();render()">
                  <span style="font-size:11px;color:#7f1d1d;min-width:42px;font-weight:900">${isNaN(_pSz)?26:Math.max(16,Math.min(40,_pSz))}px</span>
                  <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizePlayers;saveCfg();render()">초기화</button>
                </div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </details>`;
    })()}
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <input type="text" id="nu-n" placeholder="새 대학명" style="width:150px">
      <input type="color" id="nu-c" value="#2563eb" style="width:40px;height:34px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)">
      <button class="btn btn-b" onclick="addUniv()">+ 대학 추가</button>
    </div></details>
  ${_scfgD('univlogoimg','🏫 대학 로고 이미지(URL)')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px;line-height:1.6">
      대학명 옆에 표시되는 <b>로고(아이콘) 이미지 URL</b>을 대학별로 지정합니다.<br>
      권장: <code>https://</code>로 시작하는 직접 이미지 링크(png/jpg/webp/svg)
    </div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      ${univCfg.map((u,i)=>{
        const url=String(u.icon||u.img||'');
        const disp=url?toHttpsUrl(url):'';
        return `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;border:1px solid var(--border);border-radius:12px;padding:10px 12px;background:var(--white);margin-bottom:8px">
          <div class="cdot" style="background:${u.color||'#64748b'}"></div>
          <div style="min-width:120px;font-weight:900;color:var(--text2)">${esc(u.name||'')}</div>
          ${disp?`<img src="${esc(disp)}" alt="" style="width:28px;height:28px;object-fit:contain;border-radius:6px;background:#fff;border:1px solid var(--border2)" onerror="this.style.display='none'">`
               :`<div style="width:28px;height:28px;border-radius:6px;background:var(--surface);border:1px dashed var(--border2)"></div>`}
          <input type="text" value="${esc(url)}" placeholder="https://... (로고 이미지 URL)" style="flex:1;min-width:240px"
            onblur="const v=this.value.trim(); if(v){univCfg[${i}].icon=toHttpsUrl(v);} else {delete univCfg[${i}].icon;} saveCfg(); if(typeof showToast==='function')showToast('✅ 저장됨');">
          <button class="btn btn-w btn-xs" onclick="const inp=this.parentElement.querySelector('input'); if(inp) inp.value=''; delete univCfg[${i}].icon; delete univCfg[${i}].img; saveCfg(); if(typeof showToast==='function')showToast('🧹 로고 삭제됨');">삭제</button>
        </div>`;
      }).join('')}
      <div style="font-size:11px;color:var(--gray-l);margin-top:10px">※ URL이 막히면(깨짐/CORS) 다른 이미지 호스팅을 사용해 주세요.</div>
    </div>
  </details>
  ${_scfgD('maps','🗺️ 맵 관리')}<div id="map-list">
    ${maps.map((m,i)=>`<div class="srow">
      <span style="font-size:14px">📍</span>
      <input type="text" value="${m}" style="flex:1" onblur="maps[${i}]=this.value;saveCfg();refreshSel()">
      <button class="btn btn-r btn-xs" onclick="delMap(${i})">🗑️ 삭제</button>
    </div>`).join('')}
  </div><div style="margin-top:12px;display:flex;gap:8px">
    <input type="text" id="nm" placeholder="새 맵 이름" style="width:200px" onkeydown="if(event.key==='Enter')addMap()">
    <button class="btn btn-b" onclick="addMap()">+ 맵 추가</button>
  </div></details>
  ${_scfgD('mAlias','⚡ 맵 약자 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">
      약자를 입력하면 경기 결과 붙여넣기 시 자동으로 전체 맵 이름으로 변환됩니다.<br>
      <span style="color:var(--blue);font-weight:600">예:</span> <code style="background:var(--surface);padding:1px 6px;border-radius:4px">녹 → 녹아웃</code>, <code style="background:var(--surface);padding:1px 6px;border-radius:4px">폴 → 폴리포이드</code>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:6px">📦 기본 내장 약자 <span style="font-weight:400;color:var(--gray-l);font-size:10px">(✕ 클릭 시 비활성화)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${Object.entries(PASTE_MAP_ALIAS_DEFAULT).filter(([k,v])=>k!==v).map(([k,v])=>{
          const disabled=(userMapAlias||{}).hasOwnProperty(k+'__disabled');
          return disabled
            ? `<span style="display:inline-flex;align-items:center;gap:3px;background:#f1f5f9;border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:11px;opacity:.5;text-decoration:line-through"><span style="font-family:monospace"><b>${k}</b> → ${v}</span><button onclick="restoreDefaultMapAlias('${encodeURIComponent(k)}')" style="background:none;border:none;cursor:pointer;color:#16a34a;font-size:10px;padding:0 2px;line-height:1;text-decoration:none" title="복원">↩</button></span>`
            : `<span style="display:inline-flex;align-items:center;gap:3px;background:var(--white);border:1px solid var(--border);border-radius:6px;padding:2px 6px 2px 9px;font-size:11px"><span style="font-family:monospace"><b>${k}</b> → ${v}</span><button onclick="delDefaultMapAlias('${encodeURIComponent(k)}','${encodeURIComponent(v)}')" style="background:none;border:none;cursor:pointer;color:#dc2626;font-size:10px;padding:0 2px;line-height:1" title="비활성화">✕</button></span>`;
        }).join('')}
      </div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🔧 사용자 정의 약자</div>
    <div id="alias-list" style="margin-bottom:10px"></div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="alias-key" placeholder="약자 (예: 녹)" style="width:90px" maxlength="10" onkeydown="if(event.key==='Enter')addMapAlias()">
      <span style="color:var(--gray-l)">→</span>
      <input type="text" id="alias-val" list="alias-val-list" placeholder="맵 이름 입력..." autocomplete="off" style="width:180px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px" onkeydown="if(event.key==='Enter')addMapAlias()">
      <datalist id="alias-val-list">${maps.map(m=>`<option value="${m}">`).join('')}</datalist>
      <button class="btn btn-b" onclick="addMapAlias()">+ 약자 추가</button>
    </div>
    <div style="margin-top:12px;padding:10px 12px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:6px">🧪 약자 변환 테스트</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="text" id="alias-test-in" placeholder="예: 폴 / 투혼II / 녹" style="width:200px"
          oninput="try{const v=this.value.trim();const out=document.getElementById('alias-test-out');if(!out)return; if(!v){out.textContent='';return;} if(typeof resolveMapName==='function'){out.textContent='→ '+resolveMapName(v);} else {out.textContent='(resolveMapName 로딩 전)';}}catch(e){}">
        <div id="alias-test-out" style="font-size:12px;color:var(--text2);font-weight:900"></div>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 붙여넣기 자동인식에서 실제로 적용되는 변환과 동일합니다.</div>
    </div>
    <div id="alias-msg" style="font-size:12px;margin-top:6px;min-height:16px"></div>
  </details>
  ${(typeof window.renderCfgTabLabelsSection==='function' ? window.renderCfgTabLabelsSection(_scfgD) : '')}
  ${_scfgD('hdr','🖼️ 헤더(상단바) 커스텀')}
    ${(()=>{ 
      const _t = (localStorage.getItem('su_hdr_title')||'스타대학 데이터 센터');
      const _li = (localStorage.getItem('su_hdr_left_icon')||'🏆');
      const _ls = parseInt(localStorage.getItem('su_hdr_left_size')||'22',10)||22;
      const _ri = (localStorage.getItem('su_hdr_right_img')||'');
      const _rs = parseInt(localStorage.getItem('su_hdr_right_size')||'32',10)||32;
      const _bg = (localStorage.getItem('su_hdr_bg_img')||'');
      const _hh = parseInt(localStorage.getItem('su_hdr_height')||'0',10)||0;
      const _fx = (localStorage.getItem('su_hdr_fx')||'classic');
      const _c1 = (localStorage.getItem('su_hdr_c1')||'#1e3a8a');
      const _c2 = (localStorage.getItem('su_hdr_c2')||'#2563eb');
      const _sync = (localStorage.getItem('su_hdr_sync_theme')||'0')==='1';
      // 프리셋
      let _ps=[], _sel='';
      try{ _ps = JSON.parse(localStorage.getItem('su_hdr_presets_v1')||'null'); if(!Array.isArray(_ps)) _ps=[]; }catch(e){ _ps=[]; }
      try{ _sel = localStorage.getItem('su_hdr_preset_sel_v1')||''; }catch(e){ _sel=''; }
      if(!_ps.length){ _ps=[{id:'tmp',name:'기본'}]; _sel=_ps[0].id; }
      if(!_sel || !_ps.some(p=>p.id===_sel)) _sel=_ps[0].id;
      return `
        <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">상단 헤더의 제목/아이콘/이미지/배경을 커스텀합니다. (URL은 https:// 로 시작)</div>
        <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:84px">프리셋</div>
            <select id="cfg-hdr-preset" onchange="hdrPresetSelect(this.value)" style="min-width:220px">
              ${_ps.map(p=>`<option value="${p.id}"${p.id===_sel?' selected':''}>${esc(p.name||'')}</option>`).join('')}
            </select>
            <button class="btn btn-w btn-xs" onclick="hdrPresetAdd()">+ 추가</button>
            <button class="btn btn-w btn-xs" onclick="hdrPresetRename()">이름변경</button>
            <button class="btn btn-b btn-xs" onclick="hdrPresetSaveCurrent()">현재값 저장</button>
            <button class="btn btn-r btn-xs" onclick="hdrPresetDelete()">삭제</button>
            <button class="btn btn-p btn-xs" onclick="hdrPresetInstallThemePack()" title="봄/여름/가을/겨울, 기념일, 스타크래프트 테마 프리셋 자동 추가">🎨 테마팩 추가</button>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:84px">스타일</div>
            <select id="cfg-hdr-fx" onchange="cfgSetHeaderSettings()" style="min-width:220px">
              <option value="classic"${_fx==='classic'?' selected':''}>클래식(기본)</option>
              <option value="solid"${_fx==='solid'?' selected':''}>솔리드(단색)</option>
              <option value="glass"${_fx==='glass'?' selected':''}>글래스(유리)</option>
              <option value="aurora"${_fx==='aurora'?' selected':''}>오로라(움직임)</option>
              <option value="mesh"${_fx==='mesh'?' selected':''}>메쉬(패턴)</option>
            </select>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:900;color:var(--text2);cursor:pointer">
              <input type="checkbox" id="cfg-hdr-sync" ${_sync?'checked':''} onchange="cfgSetHeaderSettings()">
              헤더색 → 전체 주색
            </label>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:84px">색상</div>
            <input id="cfg-hdr-c1" type="color" value="${esc(_c1)}" onchange="cfgSetHeaderSettings()" style="width:42px;height:34px;padding:2px;border-radius:8px;border:1px solid var(--border2);background:var(--white);cursor:pointer">
            <input id="cfg-hdr-c2" type="color" value="${esc(_c2)}" onchange="cfgSetHeaderSettings()" style="width:42px;height:34px;padding:2px;border-radius:8px;border:1px solid var(--border2);background:var(--white);cursor:pointer">
            <span style="font-size:11px;color:var(--gray-l)">왼쪽/오른쪽(그라데이션 기준)</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">제목</div>
            <input id="cfg-hdr-title" type="text" value="${esc(_t)}" placeholder="예: 스타대학 데이터 센터" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">좌측 아이콘</div>
            <input id="cfg-hdr-left" type="text" value="${esc(_li)}" placeholder="이모지 또는 이미지 URL" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
            <span style="font-size:11px;color:var(--text3);font-weight:800">크기</span>
            <input id="cfg-hdr-left-sz" type="range" min="14" max="44" step="2" value="${Math.max(14,Math.min(44,_ls))}" oninput="document.getElementById('cfg-hdr-left-sz-v').textContent=this.value+'px'" onchange="cfgSetHeaderSettings()" style="width:160px">
            <span id="cfg-hdr-left-sz-v" style="font-size:11px;color:var(--gray-l);min-width:40px;font-weight:900">${Math.max(14,Math.min(44,_ls))}px</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">우측 이미지</div>
            <input id="cfg-hdr-right" type="text" value="${esc(_ri)}" placeholder="이미지 URL (없으면 비움)" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
            <span style="font-size:11px;color:var(--text3);font-weight:800">크기</span>
            <input id="cfg-hdr-right-sz" type="range" min="18" max="70" step="2" value="${Math.max(18,Math.min(70,_rs))}" oninput="document.getElementById('cfg-hdr-right-sz-v').textContent=this.value+'px'" onchange="cfgSetHeaderSettings()" style="width:160px">
            <span id="cfg-hdr-right-sz-v" style="font-size:11px;color:var(--gray-l);min-width:40px;font-weight:900">${Math.max(18,Math.min(70,_rs))}px</span>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">배경 이미지</div>
            <input id="cfg-hdr-bg" type="text" value="${esc(_bg)}" placeholder="배경 이미지 URL (없으면 비움)" style="flex:1;min-width:220px" onblur="cfgSetHeaderSettings()">
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:84px">헤더 높이</div>
            <input id="cfg-hdr-h" type="range" min="0" max="120" step="4" value="${Math.max(0,Math.min(120,_hh))}" oninput="document.getElementById('cfg-hdr-h-v').textContent=(this.value==0?'자동':this.value+'px')" onchange="cfgSetHeaderSettings()" style="width:240px">
            <span id="cfg-hdr-h-v" style="font-size:11px;color:var(--gray-l);min-width:56px;font-weight:900">${_hh?(_hh+'px'):'자동'}</span>
          </div>
        </div>
      </details>`;
    })()}
  ${(()=>{ 
    const on = (localStorage.getItem('su_bgm_enabled') ?? '1') === '1';
    const vol = parseInt(localStorage.getItem('su_bgm_volume')||'50',10) || 50;
    const sh = (localStorage.getItem('su_bgm_shuffle') ?? '0') === '1';
    const list = (localStorage.getItem('su_bgm_list') || '').trim();
    return _scfgD('bgm','🎵 유튜브 배경음악(BGM)') + `
      <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">
        상단 검색바 왼쪽의 ▶/⏸ 버튼으로 재생/일시정지합니다. (모바일은 첫 재생 시 사용자 터치가 필요할 수 있습니다)
      </div>
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-bgm-on" style="width:15px;height:15px" ${on?'checked':''} onchange="cfgSaveBgmSettings()">
          BGM 기능 사용
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-bgm-shuffle" style="width:15px;height:15px" ${sh?'checked':''} onchange="cfgSaveBgmSettings()">
          랜덤 재생(셔플)
        </label>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <div style="font-size:12px;font-weight:900;color:var(--text2);min-width:84px">볼륨</div>
          <input id="cfg-bgm-vol" type="range" min="0" max="100" step="5" value="${Math.max(0,Math.min(100,vol))}"
            oninput="document.getElementById('cfg-bgm-vol-v').textContent=this.value" onchange="cfgSaveBgmSettings()" style="width:220px">
          <span id="cfg-bgm-vol-v" style="font-size:11px;color:var(--gray-l);min-width:24px;font-weight:900">${Math.max(0,Math.min(100,vol))}</span>
        </div>
        <div style="font-size:12px;font-weight:900;color:var(--text2)">유튜브 링크 목록 (한 줄에 1개)</div>
        <textarea id="cfg-bgm-list" rows="6" placeholder="예) https://www.youtube.com/watch?v=xxxxxxxxxxx" style="width:100%;border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;resize:vertical;background:var(--white);color:var(--text1);box-sizing:border-box" oninput="cfgSaveBgmSettings()" onblur="cfgSaveBgmSettings()">${esc(list)}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-b btn-sm" onclick="cfgSaveBgmSettings();if(typeof showToast==='function')showToast('저장됨');">저장</button>
          <button class="btn btn-w btn-sm" onclick="document.getElementById('cfg-bgm-list').value='';cfgSaveBgmSettings();">목록 비우기</button>
        </div>
      </div>
    </details>`;
  })()}
  ${(()=>{ 
    const list = (localStorage.getItem('su_soop_list') || '').trim();
    return _scfgD('soopmv','📺 SOOP(숲) 멀티뷰') + `
      <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px;line-height:1.6">
        상단에 <b>SOOP</b> 버튼이 생기며, 버튼을 누르면 <b>2분할 멀티뷰</b> 팝업이 열립니다.<br>
        (주소가 1개도 없으면 버튼은 숨겨집니다)
      </div>
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
        <div style="font-size:12px;font-weight:1000;color:var(--text2)">SOOP 주소 목록 (한 줄에 1개)</div>
        <textarea id="cfg-soop-list" rows="7" placeholder="예) https://...." style="width:100%;border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;resize:vertical;background:var(--white);color:var(--text1);box-sizing:border-box" oninput="cfgSaveSoopSettings()" onblur="cfgSaveSoopSettings()">${esc(list)}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-b btn-sm" onclick="cfgSaveSoopSettings();if(typeof showToast==='function')showToast('저장됨');">저장</button>
          <button class="btn btn-w btn-sm" onclick="document.getElementById('cfg-soop-list').value='';cfgSaveSoopSettings();">목록 비우기</button>
        </div>
      </div>
    </details>`;
  })()}
  ${(()=>{ 
    const rules = (localStorage.getItem('su_paste_route_rules') || '').trim();
    return _scfgD('pasteRoute','🧠 결과 붙여넣기 자동 분리') + `
      <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px;line-height:1.6">
        붙여넣기 텍스트의 <b>메모/원문</b>에 특정 키워드가 포함되면, 저장 시 자동으로 기록탭을 분리합니다.<br>
        형식: <code>/정규식/flags =&gt; 모드</code> 또는 <code>키워드 =&gt; 모드</code><br>
        예) <code>E-SCORE TOURNAMENT =&gt; 끝장전</code> / <code>/ASL\\s*S\\d+/i =&gt; 개인전</code>
      </div>
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
        <div style="font-size:12px;font-weight:1000;color:var(--text2)">규칙 목록 (한 줄에 1개)</div>
        <textarea id="cfg-paste-route" rows="7" placeholder="예)\nE-SCORE TOURNAMENT => 끝장전\n/mini\\s*league/i => 미니대전\n/civil\\s*war/i => 시빌워" style="width:100%;border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;resize:vertical;background:var(--white);color:var(--text1);box-sizing:border-box" oninput="cfgSavePasteRouteRules()" onblur="cfgSavePasteRouteRules()">${esc(rules)}</textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-b btn-sm" onclick="cfgSavePasteRouteRules();if(typeof showToast==='function')showToast('저장됨');">저장</button>
          <button class="btn btn-w btn-sm" onclick="document.getElementById('cfg-paste-route').value='';cfgSavePasteRouteRules();">규칙 비우기</button>
        </div>
        <div style="font-size:11px;color:var(--gray-l);line-height:1.5">
          모드 예시: 개인전 / 끝장전 / 미니대전 / 시빌워 / 대학대전 / 대학CK / 프로리그 / 티어대회 / 대회<br>
          ※ 현재 자동 분리는 우선 <b>개인전/끝장전/미니대전(시빌워)</b>에 가장 안정적으로 동작합니다.
        </div>
      </div>
    </details>`;
  })()}
  ${_scfgD('si','🎭 상태 아이콘 (목록/추가)')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px;line-height:1.6">
      상태 아이콘의 <b>기본 목록</b>과 <b>커스텀 아이콘 추가</b>를 관리합니다.<br>
      스트리머별로 아이콘을 지정하는 기능은 아래의 <b>“🎭 스트리머별 상태 아이콘 지정”</b> 메뉴에서 합니다.
    </div>
    <!-- 커스텀 아이콘 추가 (URL/링크) -->
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">🔗 커스텀 아이콘 추가 (URL · 이모지)</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <input type="text" id="si-url" placeholder="이미지 URL 또는 이모지 입력" style="flex:1;min-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <input type="text" id="si-label" placeholder="이름 (선택)" style="width:110px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
        <button class="btn btn-b btn-sm" onclick="var e=document.getElementById('si-url').value.trim(),l=document.getElementById('si-label').value.trim();if(!e){alert('URL 또는 이모지를 입력하세요.');return;}addCustomStatusIcon(l||'커스텀',e);document.getElementById('si-url').value='';document.getElementById('si-label').value='';render()">+ 추가</button>
      </div>
      ${_customStatusIcons.length?`<div style="display:flex;flex-wrap:wrap;gap:6px">${_customStatusIcons.map((c,i)=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:7px;background:var(--white);border:1.5px solid var(--blue);font-size:14px"><span style="display:inline-flex;align-items:center">${_siRender(c.emoji,'20px')||c.emoji}</span><span style="font-size:11px;color:var(--gray-l);max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.label||''}</span><button onclick="removeCustomStatusIcon(${i});render()" style="background:none;border:none;color:#dc2626;cursor:pointer;font-size:14px;padding:0;line-height:1;margin-left:2px" title="삭제">×</button></span>`).join('')}</div>`
      :'<div style="font-size:11px;color:var(--gray-l)">추가된 커스텀 아이콘 없음</div>'}
    </div>
    <!-- 기본 아이콘 목록 -->
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">🎭 기본 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${Object.entries(STATUS_ICON_DEFS).filter(([id])=>id!=='none'&&!id.startsWith('_c')).map(([id,d])=>`<span style="padding:4px 10px;border-radius:7px;background:var(--white);border:1px solid var(--border);font-size:16px" title="${d.label}">${_siRender(d.emoji,'20px')||d.emoji}</span>`).join('')}
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:8px">지정은 “스트리머별 상태 아이콘 지정” 메뉴에서 합니다.</div>
    </div>
    <button class="btn btn-r btn-sm" onclick="if(confirm('모든 상태 아이콘 지정(스트리머별)을 초기화할까요?')){try{playerStatusIcons={};playerStatusExpiry={};if(typeof _iconPersistState==='function')_iconPersistState();}catch(e){};render();}">전체 초기화</button>
  </details>
  ${_scfgD('siAssign','🎭 스트리머별 상태 아이콘 지정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px;line-height:1.6">
      스트리머별로 표시될 상태 아이콘을 지정합니다. (현황판·순위표·이미지 저장 모두 반영)<br>
      검색 후 선택만 하면 바로 저장됩니다.
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
      <input id="cfg-si-assign-q" type="text" placeholder="🔍 이름/대학/티어 검색..." style="flex:1;min-width:220px;padding:6px 10px;border:1px solid var(--border2);border-radius:10px;font-size:12px"
        oninput="try{window._cfgSiAssignQ=this.value; if(typeof _renderCfgSiAssignList==='function') _renderCfgSiAssignList();}catch(e){}">
      <button class="btn btn-w btn-sm" onclick="document.getElementById('cfg-si-assign-q').value='';window._cfgSiAssignQ=''; if(typeof _renderCfgSiAssignList==='function') _renderCfgSiAssignList();">초기화</button>
    </div>
    <div id="cfg-si-assign-list" style="max-height:380px;overflow-y:auto;border:1px solid var(--border);border-radius:10px;background:var(--white)">
      <div style="padding:16px;text-align:center;color:var(--gray-l);font-size:12px">로딩 중...</div>
    </div>
  </details>
  ${_scfgD('tier','🎭 티어 관리')}
    ${(()=>{ 
      const th = (typeof getTierTheme==='function') ? getTierTheme() : {bg:{},icon:{},sat:1,bri:1};
      const bri = Math.round((parseFloat(th.bri)||1)*100);
      const sat = Math.round((parseFloat(th.sat)||1)*100);
      const _safeHex = (h) => {
        const s=String(h||'').trim();
        return /^#([0-9a-fA-F]{6})$/.test(s) ? s : '#64748b';
      };
      const _attr = (s)=>String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      const _jsq = (s)=>String(s??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      return `
      <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;margin-bottom:14px">
        <div style="font-size:12px;font-weight:1000;color:var(--text2);margin-bottom:10px">🎨 티어 색상/밝기/이모지 커스텀</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center;margin-bottom:12px">
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">밝기</div>
            <input type="range" min="60" max="160" step="1" value="${bri}" style="width:100%" oninput="document.getElementById('cfg-tier-bri-v').textContent=this.value+'%';cfgTierThemeSetBri(this.value)">
            <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tier-bri-v">${bri}%</span></div>
          </div>
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">채도</div>
            <input type="range" min="50" max="160" step="1" value="${sat}" style="width:100%" oninput="document.getElementById('cfg-tier-sat-v').textContent=this.value+'%';cfgTierThemeSetSat(this.value)">
            <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tier-sat-v">${sat}%</span></div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
          <button class="btn btn-w btn-sm" onclick="cfgTierThemeReset()">기본값으로 초기화</button>
          <span style="font-size:11px;color:var(--gray-l);align-self:center">※ 변경 즉시 전체 화면(배지/그래프)에 반영됩니다.</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px">
          ${TIERS.map((t,i)=>{
            const c=_safeHex(th.bg?.[t]||'');
            const ic=String(th.icon?.[t]||'');
            return `<div style="padding:10px 10px;background:var(--white);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:8px">
              <div id="cfg-tier-prev-${i}" style="display:flex;justify-content:center">${getTierBadge(t)}</div>
              <div style="display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap">
                <input id="cfg-tier-c-${encodeURIComponent(t)}" type="color" value="${c}" title="티어 색상" onchange="cfgTierThemeSetColor('${_jsq(t)}',this.value)">
                <input id="cfg-tier-hex-${encodeURIComponent(t)}" type="text" value="${c}" placeholder="#RRGGBB" title="티어 색상 HEX 입력" style="width:92px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800;text-align:center" onblur="cfgTierThemeSetColor('${_jsq(t)}',this.value)">
                <button class="btn btn-w btn-xs" title="스포이드로 색상 찍기" onclick="cfgTierThemePickColor('${_jsq(t)}')">🎯</button>
                <input type="text" value="${_attr(ic)}" placeholder="이모지" title="티어 이모지" style="width:64px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:13px;text-align:center" oninput="cfgTierThemeSetIcon('${_jsq(t)}',this.value)">
              </div>
              <div style="font-size:10px;color:var(--gray-l);text-align:center">${t}</div>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    })()}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      ${TIERS.map((t,i)=>`<div style="text-align:center;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;display:flex;flex-direction:column;align-items:center;gap:4px">
        ${getTierBadge(t)}
        <div style="font-size:10px;color:var(--gray-l)">${i+1}순위</div>
        ${!['G','K','JA','J','S','0티어'].includes(t)?`<button class="btn btn-r btn-xs" onclick="delTier('${t}')">🗑️ 삭제</button>`:''}
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="nt-name" placeholder="티어 이름 (예: 9티어)" style="width:160px">
      <button class="btn btn-b" onclick="addTier()">+ 티어 추가</button>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 기본 티어(G/K/JA/J/S/0티어)는 삭제할 수 없습니다.</div>
  </details>
  ${_scfgD('acct','👤 관리자 계정 관리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:4px">• <b>관리자</b>: 모든 기능 + 설정 접근 가능</div>
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">• <b>부관리자</b>: 경기 기록 입력만 가능 (설정/회원관리 불가)</div>
    <div style="margin-bottom:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">등록된 계정 (<span id="adm-count">-</span>명)</div>
      <div id="adm-list"></div>
      <button class="btn btn-r btn-xs" style="margin-top:10px" onclick="clearAllAdmins()">⚠️ 전체 초기화 (기본값 리셋)</button>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">+ 새 계정 추가</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
      <input type="text" id="adm-id" placeholder="아이디" style="width:140px" autocomplete="off">
      <input type="password" id="adm-pw" placeholder="비밀번호 (8자 이상)" style="width:150px" autocomplete="new-password">
      <select id="adm-role" style="border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
        <option value="admin">👑 총관리자</option>
        <option value="sub-admin">🔰 부관리자</option>
      </select>
      <button class="btn btn-p" onclick="addAdminAccount()">+ 추가</button>
    </div>
    <div id="adm-msg" style="font-size:12px;min-height:18px"></div>
  </details>
  ${_scfgD('storage','💾 로컬 저장소 사용량')}
    <div id="cfg-storage-wrap2">
      <div id="cfg-storage-info"><div style="color:var(--gray-l);font-size:12px">계산 중...</div></div>
      <button class="btn btn-w btn-sm" style="margin-top:8px" onclick="renderStorageInfo()">🔄 새로고침</button>
    </div>
  </details>
  ${_scfgD('selfcheck','🧪 설정 기능 점검')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">설정 화면에서 버튼/토글이 “눌러도 안되는” 경우, 핸들러(함수) 누락이 원인일 수 있습니다.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <button class="btn btn-b btn-sm" onclick="cfgRunSettingsSelfCheck()">🔎 설정 핸들러 점검</button>
      <button class="btn btn-g btn-sm" onclick="cfgRunFullQaDryRun()">🧪 전체 QA(드라이런) 점검</button>
      <span style="font-size:11px;color:var(--gray-l)">※ 실제 데이터는 건드리지 않고, 임시 더미 데이터로 동작만 확인합니다.</span>
    </div>
    <div id="cfg-selfcheck-out" style="margin-top:10px"></div>
  </details>
  ${_scfgD('autofitall','📱 전역 자동 맞춤 (모든 탭)')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">모바일/태블릿에서 <b>간격·패딩·카드/그리드 밀도·테이블</b>을 화면에 맞춰 자동 조절합니다. (전 탭 공통)</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-autofitall-on" style="width:15px;height:15px" ${_afOn?'checked':''}
          onchange="cfgSetAutoFitAllTabs(this.checked)">
        전체 탭 자동 맞춤 사용
      </label>
      <div style="font-size:11px;color:var(--gray-l)">※ 켜면 화면 크기 변화(가로/세로 전환 포함)에 따라 자동 적용됩니다.</div>
    </div>
  </details>
  ${_scfgD('uisize','📱 모바일/태블릿 UI 크기 (버튼/메뉴/배지)')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">모바일/태블릿에서 버튼/메뉴가 너무 커 보일 때 여기서 한 번에 조절합니다. (코드 수정 없이)</div>
    <div id="cfg-uisize-body" style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;color:var(--gray-l)">로딩 중...</div>
    </div>
  </details>
  ${_scfgD('reccard','🧾 기록 카드(기록탭) 스타일')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">개인전/끝장전/미니/프로리그/대회 기록 목록에 쓰이는 “기록 카드” 스타일입니다. (대회탭 조별리그 일정 카드는 별도 설정)</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-rc-theme-on" style="width:15px;height:15px" ${_rcOn?'checked':''} onchange="cfgSetRecCardSettings()">
        승리 대학색을 카드 배경/헤더에 연하게 적용
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-rc-bgfx-all" style="width:15px;height:15px" ${(_rcOn && _sfxOn)?'checked':''} onchange="cfgSetRecBgFxAll(this.checked)">
        기록 카드 배경 효과 전체 사용 (배경/양끝 효과)
      </label>

      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">디자인 모드</div>
        <select id="cfg-rc-accent" onchange="cfgSetRecCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="none" ${_rcAccent==='none'?'selected':''}>무색</option>
          <option value="header" ${_rcAccent==='header'?'selected':''}>헤더만 포인트</option>
          <option value="border" ${_rcAccent==='border'?'selected':''}>테두리만 포인트</option>
          <option value="full" ${_rcAccent==='full'?'selected':''}>전체 배경 포인트</option>
          <option value="gradient" ${_rcAccent==='gradient'?'selected':''}>그라디언트 헤더</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">※ 체크를 끄면 무조건 무색</span>
      </div>

      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">스코어/좌우 배치(PC)</div>
        <select id="cfg-rc-vs-align" onchange="cfgSetRecCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="left" ${(localStorage.getItem('su_rc_vs_align')||'center')==='left'?'selected':''}>좌측</option>
          <option value="center" ${(localStorage.getItem('su_rc_vs_align')||'center')==='center'?'selected':''}>가운데</option>
          <option value="right" ${(localStorage.getItem('su_rc_vs_align')||'center')==='right'?'selected':''}>우측</option>
        </select>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--text3);font-weight:800">스코어 크기</span>
          <input type="range" id="cfg-rc-score-scale" min="80" max="130" step="5" value="${Math.max(80,Math.min(130,parseInt(localStorage.getItem('su_rc_score_scale')||'108',10)||108))}" oninput="document.getElementById('cfg-rc-score-scale-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:140px">
          <span id="cfg-rc-score-scale-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(80,Math.min(130,parseInt(localStorage.getItem('su_rc_score_scale')||'108',10)||108))}%</span>
        </div>
      </div>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">스코어 숫자 색상(공통)</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">승</span>
          <input type="color" id="cfg-score-win" value="${(()=>{try{return (localStorage.getItem('su_score_win')||'#16a34a');}catch(e){return '#16a34a';}})()}" onchange="cfgSetScoreColors()" style="width:36px;height:28px;border:1px solid var(--border2);border-radius:8px;cursor:pointer;padding:2px;background:none">
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">패</span>
          <input type="color" id="cfg-score-lose" value="${(()=>{try{return (localStorage.getItem('su_score_lose')||'#dc2626');}catch(e){return '#dc2626';}})()}" onchange="cfgSetScoreColors()" style="width:36px;height:28px;border:1px solid var(--border2);border-radius:8px;cursor:pointer;padding:2px;background:none">
        </div>
        <div style="flex:1;min-width:180px;max-width:280px;border:1px solid var(--border2);border-radius:12px;padding:8px 12px;background:var(--white);display:flex;align-items:center;justify-content:center;gap:10px">
          <span class="wt" style="font-size:18px">3</span><span style="color:var(--gray-l);font-weight:900">:</span><span class="lt" style="font-size:18px">2</span>
        </div>
        <span style="font-size:11px;color:var(--gray-l)">대회탭 조별/토너, 프로리그 대회, 기록탭 스코어에 공통 적용</span>
      </div>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">대학/팀 버튼 크기(기록탭/프로리그/티어대회 등)</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">PC</span>
          <input type="range" id="cfg-mbtn-pc" min="80" max="150" step="5"
            value="${Math.max(80,Math.min(150,parseInt(localStorage.getItem('su_match_btn_scale_pc')||'100',10)||100))}"
            oninput="document.getElementById('cfg-mbtn-pc-v').textContent=this.value+'%'" onchange="cfgSetMatchBtnScaleSettings()" style="width:140px">
          <span id="cfg-mbtn-pc-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(80,Math.min(150,parseInt(localStorage.getItem('su_match_btn_scale_pc')||'100',10)||100))}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-mbtn-mb" min="80" max="150" step="5"
            value="${Math.max(80,Math.min(150,parseInt(localStorage.getItem('su_match_btn_scale_mb')||'100',10)||100))}"
            oninput="document.getElementById('cfg-mbtn-mb-v').textContent=this.value+'%'" onchange="cfgSetMatchBtnScaleSettings()" style="width:140px">
          <span id="cfg-mbtn-mb-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(80,Math.min(150,parseInt(localStorage.getItem('su_match_btn_scale_mb')||'100',10)||100))}%</span>
        </div>
        <span style="font-size:11px;color:var(--gray-l)">※ 미니/시빌워/대학대전/대학CK/티어대회/프로리그/일반 기록카드에 적용 (대회탭 조별/토너는 아래 “대회 카드”에서 별도)</span>
      </div>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">참가자(👥) 버튼 크기(기록탭)</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">PC</span>
          <input type="range" id="cfg-rc-mem-pc" min="40" max="240" step="5"
            value="${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_rc_mem_btn_scale_pc')||'100',10)||100))}"
            oninput="document.getElementById('cfg-rc-mem-pc-v').textContent=this.value+'%'" onchange="cfgSetRecMemBtnScaleSettings()" style="width:140px">
          <span id="cfg-rc-mem-pc-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_rc_mem_btn_scale_pc')||'100',10)||100))}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-rc-mem-mb" min="40" max="240" step="5"
            value="${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_rc_mem_btn_scale_mb')||'100',10)||100))}"
            oninput="document.getElementById('cfg-rc-mem-mb-v').textContent=this.value+'%'" onchange="cfgSetRecMemBtnScaleSettings()" style="width:140px">
          <span id="cfg-rc-mem-mb-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_rc_mem_btn_scale_mb')||'100',10)||100))}%</span>
        </div>
        <span style="font-size:11px;color:var(--gray-l)">※ 미니/시빌워/대학대전/대학CK/티어대회/프로리그/대회(기록탭) 참가자 버튼에 적용</span>
      </div>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">대학 ↔ 스코어 간격(기록탭)</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">PC</span>
          <input type="range" id="cfg-rc-gap-pc" min="0" max="30" step="1"
            value="${Math.max(0,Math.min(30,parseInt(localStorage.getItem('su_rc_vs_gap_pc')||'12',10)||12))}"
            oninput="document.getElementById('cfg-rc-gap-pc-v').textContent=this.value+'px'" onchange="cfgSetRecVsGapSettings()" style="width:140px">
          <span id="cfg-rc-gap-pc-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(0,Math.min(30,parseInt(localStorage.getItem('su_rc_vs_gap_pc')||'12',10)||12))}px</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-rc-gap-mb" min="0" max="30" step="1"
            value="${Math.max(0,Math.min(30,parseInt(localStorage.getItem('su_rc_vs_gap_mb')||'8',10)||8))}"
            oninput="document.getElementById('cfg-rc-gap-mb-v').textContent=this.value+'px'" onchange="cfgSetRecVsGapSettings()" style="width:140px">
          <span id="cfg-rc-gap-mb-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(0,Math.min(30,parseInt(localStorage.getItem('su_rc_vs_gap_mb')||'8',10)||8))}px</span>
        </div>
        <span style="font-size:11px;color:var(--gray-l)">※ “스코어 - 대학버튼” 좌우 간격</span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">카드 배경 색상 강도</div>
          <input type="range" id="cfg-rc-bg" min="0" max="30" step="1" value="${Math.max(0,Math.min(30,_rcBg))}" oninput="document.getElementById('cfg-rc-bg-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-rc-bg-v">${Math.max(0,Math.min(30,_rcBg))}%</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">카드 헤더 색상 강도</div>
          <input type="range" id="cfg-rc-hd" min="0" max="30" step="1" value="${Math.max(0,Math.min(30,_rcHd))}" oninput="document.getElementById('cfg-rc-hd-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-rc-hd-v">${Math.max(0,Math.min(30,_rcHd))}%</span></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">대학 아이콘 크기(기록 카드)</div>
          <input type="range" id="cfg-rc-uicon" min="12" max="34" step="1" value="${Math.max(12,Math.min(34,_rcIc))}" oninput="document.getElementById('cfg-rc-ic-v').textContent=this.value+'px'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-rc-ic-v">${Math.max(12,Math.min(34,_rcIc))}px</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">스트리머 프로필 이미지 크기(전역 배율)</div>
          <input type="range" id="cfg-ava-scale" min="70" max="160" step="5" value="${Math.max(70,Math.min(160,_avaScale))}" oninput="document.getElementById('cfg-ava-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-ava-v">${Math.max(70,Math.min(160,_avaScale))}%</span></div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">대학명 글자 크기(기록 카드)</div>
          <input type="range" id="cfg-rc-univ-font" min="90" max="150" step="5"
            value="${Math.max(90,Math.min(150,_rcUnivFont))}"
            oninput="document.getElementById('cfg-rc-univ-font-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-rc-univ-font-v">${Math.max(90,Math.min(150,_rcUnivFont))}%</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">연/월 필터 크기(기록탭)</div>
          <input type="range" id="cfg-ym-scale" min="80" max="140" step="5"
            value="${Math.max(80,Math.min(140,_ymScale))}"
            oninput="document.getElementById('cfg-ym-scale-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-ym-scale-v">${Math.max(80,Math.min(140,_ymScale))}%</span></div>
        </div>
      </div>

      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-rc-memo-on" style="width:15px;height:15px" ${_rcMemoOn?'checked':''} onchange="cfgSetRecCardSettings()">
        기록 카드에서 메모 입력 기능 사용(관리자)
      </label>
      <div style="font-size:11px;color:var(--gray-l)">※ 메모가 이미 저장된 경우는 항상 표시됩니다. 이 옵션은 “입력칸”만 켜고 끕니다.</div>
      
      <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:4px">
        <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:10px">🖼️ 기록 카드 프로필 이미지 설정</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start">
          <div>
            <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">프로필 이미지 크기 <span id="cfg-rc-avatar-size-v" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_rec_avatar_size')||'38',10);}catch(e){return 38;}})()}px</span></div>
            <input type="range" id="cfg-rc-avatar-size" min="20" max="80" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_rec_avatar_size')||'38',10);}catch(e){return 38;}})()}" oninput="document.getElementById('cfg-rc-avatar-size-v').textContent=this.value+'px'" onchange="cfgSetRecCardSettings()" style="width:100%">
            <div style="font-size:10px;color:var(--gray-l);margin-top:2px">기록 카드 내 프로필 이미지 지름 (px)</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">이미지 맞춤 방식</div>
            <select id="cfg-rc-avatar-fit" onchange="cfgSetRecCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900;width:100%">
              <option value="contain" ${(localStorage.getItem('su_rec_avatar_fit')||'contain')==='contain'?'selected':''}>맞춤(contain)</option>
              <option value="cover" ${(localStorage.getItem('su_rec_avatar_fit')||'contain')==='cover'?'selected':''}>채우기(cover)</option>
            </select>
            <div style="font-size:10px;color:var(--gray-l);margin-top:4px"><b>맞춤</b>: 이미지 전체 보임 · <b>채우기</b>: 원형 꽉 채움</div>
          </div>
        </div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 전역 배율(위 슬라이더)과 별개로 기록 카드만 따로 설정됩니다.</div>
      </div>

      <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:4px">
        <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:10px">🎨 기록 카드 양쪽 끝 색상 효과</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">기록 카드 좌우 끝에 A·B팀 대학 색상 그라디언트를 표시합니다.</div>
        <div style="font-size:11px;color:#475569;margin-bottom:8px"><b>대학CK</b> / <b>프로리그 일반</b>의 양쪽 끝 색상은 바로 아래 나오는 <b>팀 버튼 색상</b> 블록에서 바꿉니다.</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
            <input type="checkbox" id="cfg-sidefx-on" style="width:15px;height:15px" ${_sfxOn?'checked':''} onchange="(window.cfgSetRecSideFxEnabled||function(){})(this.checked)">
            색상 효과 사용
          </label>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800">효과 종류</div>
            <select id="cfg-sidefx-mode" onchange="(window.cfgSetRecSideFxMode||function(){})(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
              <option value="soft" ${_sfxMode==='soft'?'selected':''}>소프트 (기본)</option>
              <option value="glow" ${_sfxMode==='glow'?'selected':''}>글로우 (발광)</option>
              <option value="panel" ${_sfxMode==='panel'?'selected':''}>패널 (선명)</option>
              <option value="line" ${_sfxMode==='line'?'selected':''}>라인 (세로 바)</option>
              <option value="ribbon" ${_sfxMode==='ribbon'?'selected':''}>리본</option>
              <option value="frame" ${_sfxMode==='frame'?'selected':''}>프레임</option>
              <option value="spotlight" ${_sfxMode==='spotlight'?'selected':''}>스포트라이트</option>
              <option value="fade" ${_sfxMode==='fade'?'selected':''}>페이드(은은)</option>
              <option value="double" ${_sfxMode==='double'?'selected':''}>더블라인</option>
            </select>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">색상 강도 <span id="cfg-sidefx-int-v" style="font-weight:400;color:var(--gray-l)">${_sfxInt}</span></div>
            <input type="range" id="cfg-sidefx-int" min="20" max="100" step="4" value="${_sfxInt}" oninput="document.getElementById('cfg-sidefx-int-v').textContent=this.value" onchange="(window.cfgSetRecSideFxIntensity||function(){})(this.value)" style="width:100%;max-width:260px">
          </div>
          <div>
            <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">양쪽 효과 길이 <span id="cfg-sidefx-len-v" style="font-weight:400;color:var(--gray-l)">${_sfxLen}%</span></div>
            <input type="range" id="cfg-sidefx-len" min="4" max="80" step="2" value="${_sfxLen}" oninput="document.getElementById('cfg-sidefx-len-v').textContent=this.value+'%'" onchange="(window.cfgSetRecSideFxLength||function(){})(this.value)" style="width:100%;max-width:260px">
          </div>
          <div>
            <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">양쪽 끝 진하기 <span id="cfg-sidefx-tail-v" style="font-weight:400;color:var(--gray-l)">${_sfxTail}%</span></div>
            <input type="range" id="cfg-sidefx-tail" min="0" max="140" step="4" value="${_sfxTail}" oninput="document.getElementById('cfg-sidefx-tail-v').textContent=this.value+'%'" onchange="(window.cfgSetRecSideFxTail||function(){})(this.value)" style="width:100%;max-width:260px">
          </div>
        </div>
      </div>
      ${(typeof window.buildSettingsTeamColorBlock==='function' ? window.buildSettingsTeamColorBlock() : '')}
    </div>
  </details>
  ${(()=>{ 
    const _tcOn = (localStorage.getItem('su_tc_theme_on') ?? '0') === '1';
    const _tcAccent = (localStorage.getItem('su_tc_accent_mode') ?? 'none');
    const _tcHd = parseInt(localStorage.getItem('su_tc_hd_alpha') ?? '12',10) || 12;
    const _tcBw = parseInt(localStorage.getItem('su_tc_border_w') ?? '4',10) || 4;
    const _tcIc = parseInt(localStorage.getItem('su_tc_uicon') ?? '34',10) || 34;
    const _tcLw = parseInt(localStorage.getItem('su_tc_line_w') ?? '2',10) || 2;
    const _tcLa = parseInt(localStorage.getItem('su_tc_line_a') ?? '70',10) || 70;
    const _tcPreset = (localStorage.getItem('su_tc_preset') ?? '기본');
    const _dateMenuStyle = (localStorage.getItem('su_date_menu_style') ?? 'pill'); // pill | asl
    return _scfgD('tourneycard','🏆 대회 카드(대회탭) 스타일') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">대회탭 “조별리그 일정/대진표” 카드 스타일입니다. 기록탭 카드와 <b>별도</b>로 설정됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-tc-theme-on" style="width:15px;height:15px" ${_tcOn?'checked':''} onchange="cfgSetTourneyCardSettings()">
        대회 카드 디자인 모드 사용
      </label>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">날짜 버튼 메뉴</div>
        <select id="cfg-date-menu-style" onchange="cfgSetDateMenuStyle()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="pill" ${_dateMenuStyle!=='asl'?'selected':''}>기본 (pill)</option>
          <option value="asl" ${_dateMenuStyle==='asl'?'selected':''}>ASL 스타일 (날짜+미니매치업)</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">대회탭/프로리그 대회탭 상단 날짜 필터에 적용</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">토너먼트/대진표 프리셋</div>
        <select id="cfg-tc-preset" onchange="localStorage.setItem('su_tc_preset',this.value);cfgApplyBracketPreset(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="기본" ${_tcPreset==='기본'?'selected':''}>기본</option>
          <option value="월드컵" ${_tcPreset==='월드컵'?'selected':''}>월드컵</option>
          <option value="프로리그" ${_tcPreset==='프로리그'?'selected':''}>프로리그</option>
          <option value="컴팩트" ${_tcPreset==='컴팩트'?'selected':''}>컴팩트</option>
          <option value="미니멀" ${_tcPreset==='미니멀'?'selected':''}>미니멀 (깔끔함)</option>
          <option value="다크리그" ${_tcPreset==='다크리그'?'selected':''}>다크리그 (강한 포인트)</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">※ 아래 슬라이더 값도 같이 변경됩니다</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">디자인 모드</div>
        <select id="cfg-tc-accent" onchange="cfgSetTourneyCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="none" ${_tcAccent==='none'?'selected':''}>무색</option>
          <option value="header" ${_tcAccent==='header'?'selected':''}>상단 바 포인트</option>
          <option value="border" ${_tcAccent==='border'?'selected':''}>테두리 포인트</option>
        </select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">상단 바 색상 강도</div>
          <input type="range" id="cfg-tc-hd" min="0" max="30" step="1" value="${Math.max(0,Math.min(30,_tcHd))}" oninput="document.getElementById('cfg-tc-hd-v').textContent=this.value+'%'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-hd-v">${Math.max(0,Math.min(30,_tcHd))}%</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">테두리 두께</div>
          <input type="range" id="cfg-tc-bw" min="2" max="6" step="1" value="${Math.max(2,Math.min(6,_tcBw))}" oninput="document.getElementById('cfg-tc-bw-v').textContent=this.value+'px'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-bw-v">${Math.max(2,Math.min(6,_tcBw))}px</span></div>
        </div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">대학 로고 크기(대회 카드)</div>
        <input type="range" id="cfg-tc-uicon" min="24" max="48" step="2" value="${Math.max(24,Math.min(48,_tcIc))}" oninput="document.getElementById('cfg-tc-ic-v').textContent=this.value+'px'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
        <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-ic-v">${Math.max(24,Math.min(48,_tcIc))}px</span></div>
      </div>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">대학 버튼 크기(대회탭)</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">PC</span>
          <input type="range" id="cfg-tc-team-pc" min="40" max="220" step="5"
            value="${Math.max(40,Math.min(220,parseInt(localStorage.getItem('su_tc_team_btn_scale_pc')||'100',10)||100))}"
            oninput="document.getElementById('cfg-tc-team-pc-v').textContent=this.value+'%'" onchange="cfgSetTourneyTeamBtnScaleSettings()" style="width:140px">
          <span id="cfg-tc-team-pc-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(40,Math.min(220,parseInt(localStorage.getItem('su_tc_team_btn_scale_pc')||'100',10)||100))}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-tc-team-mb" min="40" max="220" step="5"
            value="${Math.max(40,Math.min(220,parseInt(localStorage.getItem('su_tc_team_btn_scale_mb')||'100',10)||100))}"
            oninput="document.getElementById('cfg-tc-team-mb-v').textContent=this.value+'%'" onchange="cfgSetTourneyTeamBtnScaleSettings()" style="width:140px">
          <span id="cfg-tc-team-mb-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(40,Math.min(220,parseInt(localStorage.getItem('su_tc_team_btn_scale_mb')||'100',10)||100))}%</span>
        </div>
        <span style="font-size:11px;color:var(--gray-l)">※ 조별리그/토너 기록 카드의 대학 버튼에 적용</span>
      </div>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">대학 버튼 폰트 크기(대회탭)</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">PC</span>
          <input type="range" id="cfg-tc-team-font-pc" min="40" max="240" step="5"
            value="${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_tc_team_font_scale_pc')||'100',10)||100))}"
            oninput="document.getElementById('cfg-tc-team-font-pc-v').textContent=this.value+'%'" onchange="cfgSetTourneyTeamBtnDetailScaleSettings()" style="width:140px">
          <span id="cfg-tc-team-font-pc-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_tc_team_font_scale_pc')||'100',10)||100))}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-tc-team-font-mb" min="40" max="240" step="5"
            value="${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_tc_team_font_scale_mb')||'100',10)||100))}"
            oninput="document.getElementById('cfg-tc-team-font-mb-v').textContent=this.value+'%'" onchange="cfgSetTourneyTeamBtnDetailScaleSettings()" style="width:140px">
          <span id="cfg-tc-team-font-mb-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_tc_team_font_scale_mb')||'100',10)||100))}%</span>
        </div>
      </div>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">대학 로고(아이콘) 크기(대회탭)</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">PC</span>
          <input type="range" id="cfg-tc-team-ico-pc" min="40" max="240" step="5"
            value="${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_tc_team_icon_scale_pc')||'100',10)||100))}"
            oninput="document.getElementById('cfg-tc-team-ico-pc-v').textContent=this.value+'%'" onchange="cfgSetTourneyTeamBtnDetailScaleSettings()" style="width:140px">
          <span id="cfg-tc-team-ico-pc-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_tc_team_icon_scale_pc')||'100',10)||100))}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-tc-team-ico-mb" min="40" max="240" step="5"
            value="${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_tc_team_icon_scale_mb')||'100',10)||100))}"
            oninput="document.getElementById('cfg-tc-team-ico-mb-v').textContent=this.value+'%'" onchange="cfgSetTourneyTeamBtnDetailScaleSettings()" style="width:140px">
          <span id="cfg-tc-team-ico-mb-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_tc_team_icon_scale_mb')||'100',10)||100))}%</span>
        </div>
        <span style="font-size:11px;color:var(--gray-l)">※ 위 “대학 로고 크기(대회 카드)”는 기본값(px), 여기서는 버튼 안 아이콘만 추가 배율</span>
      </div>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">참가자(👥) 버튼 크기(대회탭)</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">PC</span>
          <input type="range" id="cfg-tc-mem-pc" min="40" max="240" step="5"
            value="${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_tc_mem_btn_scale_pc')||'100',10)||100))}"
            oninput="document.getElementById('cfg-tc-mem-pc-v').textContent=this.value+'%'" onchange="cfgSetTourneyMemBtnScaleSettings()" style="width:140px">
          <span id="cfg-tc-mem-pc-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_tc_mem_btn_scale_pc')||'100',10)||100))}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-tc-mem-mb" min="40" max="240" step="5"
            value="${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_tc_mem_btn_scale_mb')||'100',10)||100))}"
            oninput="document.getElementById('cfg-tc-mem-mb-v').textContent=this.value+'%'" onchange="cfgSetTourneyMemBtnScaleSettings()" style="width:140px">
          <span id="cfg-tc-mem-mb-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(40,Math.min(240,parseInt(localStorage.getItem('su_tc_mem_btn_scale_mb')||'100',10)||100))}%</span>
        </div>
      </div>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">대학 ↔ 스코어 간격(대회탭)</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">PC</span>
          <input type="range" id="cfg-tc-gap-pc" min="0" max="36" step="1"
            value="${Math.max(0,Math.min(36,parseInt(localStorage.getItem('su_tc_vs_gap_pc')||'12',10)||12))}"
            oninput="document.getElementById('cfg-tc-gap-pc-v').textContent=this.value+'px'" onchange="cfgSetTourneyVsGapSettings()" style="width:140px">
          <span id="cfg-tc-gap-pc-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(0,Math.min(36,parseInt(localStorage.getItem('su_tc_vs_gap_pc')||'12',10)||12))}px</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-tc-gap-mb" min="0" max="36" step="1"
            value="${Math.max(0,Math.min(36,parseInt(localStorage.getItem('su_tc_vs_gap_mb')||'8',10)||8))}"
            oninput="document.getElementById('cfg-tc-gap-mb-v').textContent=this.value+'px'" onchange="cfgSetTourneyVsGapSettings()" style="width:140px">
          <span id="cfg-tc-gap-mb-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(0,Math.min(36,parseInt(localStorage.getItem('su_tc_vs_gap_mb')||'8',10)||8))}px</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">브라켓 연결선 두께</div>
          <input type="range" id="cfg-tc-line-w" min="1" max="4" step="1" value="${Math.max(1,Math.min(4,_tcLw))}" oninput="document.getElementById('cfg-tc-lw-v').textContent=this.value+'px'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-lw-v">${Math.max(1,Math.min(4,_tcLw))}px</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">브라켓 연결선 진하기</div>
          <input type="range" id="cfg-tc-line-a" min="25" max="100" step="5" value="${Math.max(25,Math.min(100,_tcLa))}" oninput="document.getElementById('cfg-tc-la-v').textContent=this.value+'%'" onchange="cfgSetTourneyCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-tc-la-v">${Math.max(25,Math.min(100,_tcLa))}%</span></div>
        </div>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const pc = parseInt(localStorage.getItem('su_h2h_panel_pc')||'150',10)||150;
    const mb = parseInt(localStorage.getItem('su_h2h_panel_mb')||'126',10)||126;
    const fit = (localStorage.getItem('su_h2h_panel_fit')||'cover');
    const gpc = parseInt(localStorage.getItem('su_h2h_score_gap_pc')||'10',10)||10;
    const gmb = parseInt(localStorage.getItem('su_h2h_score_gap_mb')||'8',10)||8;
    const spc = parseInt(localStorage.getItem('su_h2h_score_pad_pc')||'10',10)||10;
    const smb = parseInt(localStorage.getItem('su_h2h_score_pad_mb')||'6',10)||6;
    return _scfgD('h2hpanel','🎮 개인전/끝장전(프로리그 끝장전) 카드') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">대전기록 탭의 개인전/끝장전/프로리그 끝장전 카드에서 선수 패널(프로필 배경 카드) 크기와 이미지 맞춤을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:90px">이미지 맞춤</div>
        <select id="cfg-h2h-panel-fit" onchange="cfgSetH2HPanelSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="contain" ${fit==='contain'?'selected':''}>맞춤(contain)</option>
          <option value="cover" ${fit!=='contain'&&fit!=='fill'?'selected':''}>채우기(cover)</option>
          <option value="fill" ${fit==='fill'?'selected':''}>늘리기(fill)</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">※ 추천: 채우기(cover)</span>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">PC</div>
        <input type="range" id="cfg-h2h-panel-pc" min="110" max="230" step="2" value="${Math.max(110,Math.min(230,pc))}"
          oninput="document.getElementById('cfg-h2h-panel-pc-v').textContent=this.value+'px'"
          onchange="cfgSetH2HPanelSettings()" style="width:100%">
        <div id="cfg-h2h-panel-pc-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(110,Math.min(230,pc))}px</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">모바일</div>
        <input type="range" id="cfg-h2h-panel-mb" min="96" max="210" step="2" value="${Math.max(96,Math.min(210,mb))}"
          oninput="document.getElementById('cfg-h2h-panel-mb-v').textContent=this.value+'px'"
          onchange="cfgSetH2HPanelSettings()" style="width:100%">
        <div id="cfg-h2h-panel-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(96,Math.min(210,mb))}px</div>
      </div>

      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">PC 간격</div>
        <input type="range" id="cfg-h2h-gap-pc" min="0" max="50" step="1" value="${Math.max(0,Math.min(50,gpc))}"
          oninput="document.getElementById('cfg-h2h-gap-pc-v').textContent=this.value+'px'" onchange="cfgSetH2HPanelSettings()" style="width:100%">
        <div id="cfg-h2h-gap-pc-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(0,Math.min(50,gpc))}px</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">모바일 간격</div>
        <input type="range" id="cfg-h2h-gap-mb" min="0" max="50" step="1" value="${Math.max(0,Math.min(50,gmb))}"
          oninput="document.getElementById('cfg-h2h-gap-mb-v').textContent=this.value+'px'" onchange="cfgSetH2HPanelSettings()" style="width:100%">
        <div id="cfg-h2h-gap-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(0,Math.min(50,gmb))}px</div>
      </div>

      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">PC 스코어 여백</div>
        <input type="range" id="cfg-h2h-scorepad-pc" min="0" max="24" step="1" value="${Math.max(0,Math.min(24,spc))}"
          oninput="document.getElementById('cfg-h2h-scorepad-pc-v').textContent=this.value+'px'" onchange="cfgSetH2HPanelSettings()" style="width:100%">
        <div id="cfg-h2h-scorepad-pc-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(0,Math.min(24,spc))}px</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">모바일 스코어 여백</div>
        <input type="range" id="cfg-h2h-scorepad-mb" min="0" max="24" step="1" value="${Math.max(0,Math.min(24,smb))}"
          oninput="document.getElementById('cfg-h2h-scorepad-mb-v').textContent=this.value+'px'" onchange="cfgSetH2HPanelSettings()" style="width:100%">
        <div id="cfg-h2h-scorepad-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(0,Math.min(24,smb))}px</div>
      </div>

      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">PC 좌우</div>
        <input type="range" id="cfg-h2h-w-pc" min="10" max="300" step="2" value="${(()=>{try{return Math.max(10,Math.min(300,parseInt(localStorage.getItem('su_h2h_panel_wmul_pc')||'105',10)||105));}catch(e){return 105;}})()}"
          oninput="document.getElementById('cfg-h2h-w-pc-v').textContent=this.value+'%'" onchange="cfgSetH2HPanelSettings()" style="width:100%">
        <div id="cfg-h2h-w-pc-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${(()=>{try{return Math.max(10,Math.min(300,parseInt(localStorage.getItem('su_h2h_panel_wmul_pc')||'105',10)||105));}catch(e){return 105;}})()}%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">PC 상하</div>
        <input type="range" id="cfg-h2h-h-pc" min="10" max="300" step="2" value="${(()=>{try{return Math.max(10,Math.min(300,parseInt(localStorage.getItem('su_h2h_panel_hmul_pc')||'100',10)||100));}catch(e){return 100;}})()}"
          oninput="document.getElementById('cfg-h2h-h-pc-v').textContent=this.value+'%'" onchange="cfgSetH2HPanelSettings()" style="width:100%">
        <div id="cfg-h2h-h-pc-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${(()=>{try{return Math.max(10,Math.min(300,parseInt(localStorage.getItem('su_h2h_panel_hmul_pc')||'100',10)||100));}catch(e){return 100;}})()}%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">모바일 좌우</div>
        <input type="range" id="cfg-h2h-w-mb" min="10" max="300" step="2" value="${(()=>{try{return Math.max(10,Math.min(300,parseInt(localStorage.getItem('su_h2h_panel_wmul_mb')||'100',10)||100));}catch(e){return 100;}})()}"
          oninput="document.getElementById('cfg-h2h-w-mb-v').textContent=this.value+'%'" onchange="cfgSetH2HPanelSettings()" style="width:100%">
        <div id="cfg-h2h-w-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${(()=>{try{return Math.max(10,Math.min(300,parseInt(localStorage.getItem('su_h2h_panel_wmul_mb')||'100',10)||100));}catch(e){return 100;}})()}%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">모바일 상하</div>
        <input type="range" id="cfg-h2h-h-mb" min="10" max="300" step="2" value="${(()=>{try{return Math.max(10,Math.min(300,parseInt(localStorage.getItem('su_h2h_panel_hmul_mb')||'100',10)||100));}catch(e){return 100;}})()}"
          oninput="document.getElementById('cfg-h2h-h-mb-v').textContent=this.value+'%'" onchange="cfgSetH2HPanelSettings()" style="width:100%">
        <div id="cfg-h2h-h-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${(()=>{try{return Math.max(10,Math.min(300,parseInt(localStorage.getItem('su_h2h_panel_hmul_mb')||'100',10)||100));}catch(e){return 100;}})()}%</div>
      </div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6">※ 값 변경 후 자동으로 재렌더링됩니다.</div>

      <div style="height:1px;background:var(--border);margin:4px 0"></div>
      <div style="font-size:12px;font-weight:900;color:var(--text2)">스트리머별 얼굴 위치 보정(채우기/늘리기 모드에서)</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6">
        채우기(cover)에서 얼굴이 잘리는 경우, 스트리머별로 배경 위치(가로/세로 %)를 저장할 수 있습니다.
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input id="cfg-h2h-bgpos-name" placeholder="스트리머 이름" style="padding:8px 10px;border:1px solid var(--border2);border-radius:10px;font-size:12px;font-weight:900;min-width:180px">
        <button class="btn btn-w btn-xs" onclick="cfgH2HBgPosLoad()" style="padding:6px 10px">불러오기</button>
        <button class="btn btn-b btn-xs" onclick="cfgH2HBgPosSave()" style="padding:6px 10px">저장</button>
        <button class="btn btn-w btn-xs" onclick="cfgH2HBgPosReset()" style="padding:6px 10px">초기화</button>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">가로(X)</div>
        <input type="range" id="cfg-h2h-bgpos-x" min="0" max="100" step="1" value="50"
          oninput="document.getElementById('cfg-h2h-bgpos-xv').textContent=this.value+'%'" style="width:100%">
        <div id="cfg-h2h-bgpos-xv" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">50%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">세로(Y)</div>
        <input type="range" id="cfg-h2h-bgpos-y" min="0" max="100" step="1" value="50"
          oninput="document.getElementById('cfg-h2h-bgpos-yv').textContent=this.value+'%'" style="width:100%">
        <div id="cfg-h2h-bgpos-yv" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">50%</div>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const pc = parseInt(localStorage.getItem('su_procomp_avatar_pc')||'52',10)||52;
    const mb = parseInt(localStorage.getItem('su_procomp_avatar_mb')||'40',10)||40;
    const fit = (localStorage.getItem('su_procomp_avatar_fit')||'cover');
    return _scfgD('procompcard','⭐ 프로리그 대회 카드(프로리그탭)') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">프로리그탭 → 프로리그 대회 → 조별리그/대진표 기록 카드에서 선수(스트리머) 프로필 크기를 조절합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:90px">이미지 맞춤</div>
        <select id="cfg-procomp-ava-fit" onchange="cfgSetProCompAvatarSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="contain" ${fit==='contain'?'selected':''}>맞춤(contain)</option>
          <option value="cover" ${fit!=='contain'&&fit!=='fill'?'selected':''}>채우기(cover)</option>
          <option value="fill" ${fit==='fill'?'selected':''}>늘리기(fill)</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">※ 추천: 채우기(cover)</span>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">PC</div>
        <input type="range" id="cfg-procomp-ava-pc" min="28" max="84" step="2" value="${Math.max(28,Math.min(84,pc))}"
          oninput="document.getElementById('cfg-procomp-ava-pc-v').textContent=this.value+'px'"
          onchange="cfgSetProCompAvatarSettings()" style="width:100%">
        <div id="cfg-procomp-ava-pc-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(28,Math.min(84,pc))}px</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">모바일</div>
        <input type="range" id="cfg-procomp-ava-mb" min="24" max="72" step="2" value="${Math.max(24,Math.min(72,mb))}"
          oninput="document.getElementById('cfg-procomp-ava-mb-v').textContent=this.value+'px'"
          onchange="cfgSetProCompAvatarSettings()" style="width:100%">
        <div id="cfg-procomp-ava-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(24,Math.min(72,mb))}px</div>
      </div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6">
        ※ 값 변경 후 자동으로 재렌더링됩니다. 카드가 너무 커지면 크기를 조금 낮춰주세요.
      </div>
    </div>
  </details>`;
  })()}
  ${(typeof window.buildShareCardSettingsSection==='function' ? window.buildShareCardSettingsSection(_scfgD) : '')}
  ${(()=>{ 
    const _chip = (localStorage.getItem('su_cal_chip_mode') ?? 'types');
    const _shareAdm = (localStorage.getItem('su_share_admin_only') ?? '0') === '1';
    return _scfgD('calui','📅 캘린더 표시/버튼') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">캘린더 탭의 날짜 칸 표시와 카드 버튼 구성을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">월간/주간 날짜칸 요약</div>
        <select id="cfg-cal-chip" onchange="cfgSetCalendarUiSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="total" ${_chip==='total'?'selected':''}>총 경기수만</option>
          <option value="types" ${_chip!=='total'?'selected':''}>총 + 상위2종류</option>
        </select>
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-share-adminonly" style="width:15px;height:15px" ${_shareAdm?'checked':''} onchange="cfgSetCalendarUiSettings()">
        공유 버튼 숨기기(관리자만 표시)
      </label>
      <div style="font-size:11px;color:var(--gray-l)">※ 관리자=로그인 상태. 기록/대회/캘린더 카드의 공유 버튼이 함께 적용됩니다.</div>
    </div>
  </details>`;
  })()}
  ${(typeof window.renderCfgDesignV2Section==='function' ? window.renderCfgDesignV2Section(_scfgD) : '')}
  ${(typeof window.renderCfgDesignV2ColorsSection==='function' ? window.renderCfgDesignV2ColorsSection(_scfgD) : '')}
  ${(typeof window.renderCfgTabColorSection==='function' ? window.renderCfgTabColorSection(_scfgD) : '')}
  ${(()=>{ 
    const p = (localStorage.getItem('su_app_font_preset') ?? 'noto');
    const css = (localStorage.getItem('su_app_font_css') ?? '');
    const fam = (localStorage.getItem('su_app_font_family') ?? '');
    const cssTxt = (localStorage.getItem('su_app_font_css_text') ?? '');
    const uiPctPc = parseInt(localStorage.getItem('su_ui_scale_pc_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const uiPctTb = parseInt(localStorage.getItem('su_ui_scale_tb_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const uiPctMb = parseInt(localStorage.getItem('su_ui_scale_mb_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const appFontScalePc = parseInt(localStorage.getItem('su_app_font_scale_pc_pct')||localStorage.getItem('su_app_font_scale_pct')||'100',10)||100;
    const appFontScaleTb = parseInt(localStorage.getItem('su_app_font_scale_tb_pct')||localStorage.getItem('su_app_font_scale_pct')||'100',10)||100;
    const appFontScaleMb = parseInt(localStorage.getItem('su_app_font_scale_mb_pct')||localStorage.getItem('su_app_font_scale_pct')||'100',10)||100;
    // CSS 직접입력에서 font-family 자동 추출 → 프리셋 드롭다운에도 합치기(요청)
    const customFams = (()=>{
      const out=[]; const seen=new Set();
      const re=/font-family\s*:\s*['"]?([^;'"\\n\\r]+)['"]?\s*;/gi;
      let m;
      while((m=re.exec(String(cssTxt||'')))){
        const name=String(m[1]||'').trim();
        if(!name) continue;
        const key=name.toLowerCase();
        if(seen.has(key)) continue;
        seen.add(key); out.push(name);
      }
      return out;
    })();
    const aliasMap = (()=>{
      try{ return JSON.parse(localStorage.getItem('su_app_font_alias_map')||'{}')||{}; }catch(e){ return {}; }
    })();
    const _dispFontName = (n)=>{
      const a = aliasMap[n];
      return a ? `${a} (${n})` : n;
    };
    const ffChoices = (()=>{
      const list=[];
      // 내장 추천
      list.push({k:'Pretendard, \"Noto Sans KR\", system-ui, -apple-system, Segoe UI, Roboto, sans-serif', l:'(추천) Pretendard'});
      list.push({k:'GmarketSans, \"Noto Sans KR\", system-ui, -apple-system, Segoe UI, Roboto, sans-serif', l:'(추천) GmarketSans'});
      list.push({k:'\"Noto Sans KR\", system-ui, -apple-system, Segoe UI, Roboto, sans-serif', l:'Noto Sans KR'});
      // 커스텀 폰트들 자동 생성(입력 없이 선택 가능)
      customFams.forEach(n=>{
        list.push({k:`${n}, \"Noto Sans KR\", sans-serif`, l:_dispFontName(n)});
      });
      // 중복 제거
      const seen=new Set(); return list.filter(x=>{const kk=x.k.toLowerCase(); if(seen.has(kk)) return false; seen.add(kk); return true;});
    })();
    const customPreset = (()=>{
      // 현재 fam의 첫 토큰이 커스텀 font인지 추정
      const curMain = String(fam||'').split(',')[0].replace(/['"]/g,'').trim().toLowerCase();
      if(!curMain) return '';
      const hit = customFams.find(x=>x.toLowerCase()===curMain);
      return hit ? ('custom:'+hit) : '';
    })();
    return _scfgD('appfont','🅰️ 전역 폰트') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">앱 전체 폰트를 변경합니다. (프리셋 + 사용자 CSS URL 지원)</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px">프리셋</div>
        <select id="cfg-appfont-preset" onchange="cfgSetAppFontSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="system" ${p==='system'?'selected':''}>시스템</option>
          <option value="noto" ${p==='noto'?'selected':''}>Noto Sans KR</option>
          <option value="pretendard" ${p==='pretendard'?'selected':''}>Pretendard</option>
          <option value="nanum" ${p==='nanum'?'selected':''}>나눔고딕</option>
          <option value="gmarket" ${p==='gmarket'?'selected':''}>GmarketSans</option>
          <option value="dohyeon" ${p==='dohyeon'?'selected':''}>Do Hyeon (개성있는 한글)</option>
          <option value="blackhansans" ${p==='blackhansans'?'selected':''}>Black Han Sans (굵은 헤드라인)</option>
          <option value="ibmplexsans" ${p==='ibmplexsans'?'selected':''}>IBM Plex Sans KR (정갈함)</option>
          ${customFams.length?`<option value="" disabled>──────── 커스텀(저장한 폰트) ────────</option>`:''}
          ${customFams.map(n=>`<option value="custom:${esc(n)}" ${customPreset===('custom:'+n)?'selected':''}>${esc(_dispFontName(n))}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px">추가 CSS URL</div>
        <input type="text" id="cfg-appfont-css" value="${css.replace(/\"/g,'&quot;')}" placeholder="예) https://.../font.css" style="flex:1;min-width:260px" onchange="cfgSetAppFontSettings()">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px">font-family</div>
        <input type="text" id="cfg-appfont-family" value="${fam.replace(/\"/g,'&quot;')}" placeholder="비우면 프리셋 기본값 사용" style="flex:1;min-width:260px" onchange="cfgSetAppFontSettings()">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px">font-family 선택</div>
        <select onchange="cfgApplyFontFamilyChoice(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900;flex:1;min-width:260px">
          <option value="">(입력 없이 선택)</option>
          ${ffChoices.map(o=>`<option value="${esc(o.k)}">${esc(o.l)}</option>`).join('')}
        </select>
      </div>
      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:11px;color:var(--text3);font-weight:900;margin-bottom:8px">전역 폰트 크기 (글자 전용)</div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-bottom:6px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">PC</div>
          <input type="range" id="cfg-appfont-scale-pc" min="85" max="130" step="5" value="${Math.max(85,Math.min(130,appFontScalePc))}" oninput="cfgSetAppFontScalePct('pc',this.value)" style="width:100%">
          <div id="cfg-appfont-scale-pc-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(85,Math.min(130,appFontScalePc))}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-bottom:6px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">태블릿</div>
          <input type="range" id="cfg-appfont-scale-tb" min="85" max="130" step="5" value="${Math.max(85,Math.min(130,appFontScaleTb))}" oninput="cfgSetAppFontScalePct('tb',this.value)" style="width:100%">
          <div id="cfg-appfont-scale-tb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(85,Math.min(130,appFontScaleTb))}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">모바일</div>
          <input type="range" id="cfg-appfont-scale-mb" min="85" max="130" step="5" value="${Math.max(85,Math.min(130,appFontScaleMb))}" oninput="cfgSetAppFontScalePct('mb',this.value)" style="width:100%">
          <div id="cfg-appfont-scale-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(85,Math.min(130,appFontScaleMb))}%</div>
        </div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:6px;line-height:1.6">
          글자 크기만 전반적으로 조절합니다. 버튼/아이콘/탭 크기는 아래 <b>🎛️ 버튼 스타일 → 전역 UI 배율</b>에서 따로 조절할 수 있습니다.<br>
          현재 UI 배율: PC ${Math.max(80,Math.min(140,uiPctPc))}% / 태블릿 ${Math.max(80,Math.min(140,uiPctTb))}% / 모바일 ${Math.max(80,Math.min(140,uiPctMb))}%
          <button class="btn btn-w btn-xs" style="margin-left:8px" onclick="cfgResetAppFontScalePct()">초기화</button>
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px">커스텀 프리셋</div>
        <select id="cfg-appfont-custompreset" onchange="cfgApplyCustomFontPreset(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900;flex:1;min-width:260px">
          <option value="">(직접입력에서 자동 추출)</option>
        </select>
        <button class="btn btn-w btn-xs" onclick="cfgRenderCustomFontPresetOptions()" style="padding:6px 10px">🔄 새로고침</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start">
        <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:120px;padding-top:8px">CSS 직접 입력</div>
        <div style="flex:1;min-width:260px">
          <textarea id="cfg-appfont-csstext" rows="7" placeholder="@font-face { ... }\n(여기에 붙여넣으면 자동 저장/적용됩니다)\n\n여러 개는 @font-face 블록을 연달아 추가하세요."
            style="width:100%;resize:vertical"
            oninput="cfgSetAppFontSettings(); try{cfgRenderCustomFontPresetOptions();}catch(e){}">${esc(cssTxt)}</textarea>
          <div style="display:flex;gap:8px;align-items:center;margin-top:6px;flex-wrap:wrap">
            <button class="btn btn-w btn-xs" onclick="cfgSetAppFontSettings();alert('✅ 저장됨')" style="padding:6px 10px">💾 저장</button>
            <span style="font-size:11px;color:var(--gray-l)">※ 입력 후 다른 곳을 클릭하지 않아도 자동 저장됩니다.</span>
          </div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.5">
        • 예: <span style="font-family:ui-monospace,monospace">Pretendard Variable, Pretendard, Noto Sans KR, sans-serif</span><br>
        • 유튜브/트위치 같은 외부 사이트 폰트는 적용되지 않을 수 있습니다.
      </div>

      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:11px;color:var(--text3);font-weight:900;margin-bottom:8px">미리보기</div>
        <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:8px">
          <div style="font-family:var(--app-font);font-size:22px;font-weight:800">가나다ABC 123</div>
          <div style="font-family:var(--app-font);font-size:14px;font-weight:400">빠른 갈색 여우가 게으른 개를 뛰어넘는다. (The quick brown fox)</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <div style="font-family:var(--app-font);font-size:14px;font-weight:400">Regular 400</div>
          <div style="font-family:var(--app-font);font-size:14px;font-weight:700">Bold 700</div>
          <div style="font-family:var(--app-font);font-size:14px;font-weight:900">Black 900</div>
        </div>
      </div>

      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:11px;color:var(--text3);font-weight:900;margin-bottom:8px">커스텀 폰트 별칭(표시 이름)</div>
        <div id="cfg-appfont-alias-wrap"></div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 별칭을 저장하면 ‘프리셋/선택 드롭다운’에 표시됩니다.</div>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const pct = parseInt(localStorage.getItem('su_btn_scale_pct')||'100',10)||100;
    const br  = parseInt(localStorage.getItem('su_btn_r')||'8',10)||8;
    const pr  = parseInt(localStorage.getItem('su_pill_r')||'20',10)||20;
    const uiPctPc = parseInt(localStorage.getItem('su_ui_scale_pc_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const uiPctTb = parseInt(localStorage.getItem('su_ui_scale_tb_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const uiPctMb = parseInt(localStorage.getItem('su_ui_scale_mb_pct')||localStorage.getItem('su_ui_scale_pct')||'100',10)||100;
    const topTabMbFont = parseInt(localStorage.getItem('su_top_tab_font_mb_px')||'10',10)||10;
    const topTabMbGap = parseInt(localStorage.getItem('su_top_tab_gap_mb_px')||'2',10)||2;
    const topTabMbAlign = (localStorage.getItem('su_top_tab_align_mb')||'start').trim();
    return _scfgD('uibtn','🎛️ 버튼 스타일') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">앱 전체 버튼/필(탭·필터) 크기와 라운드를 조절합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:6px">전역 UI 배율(글자/아이콘)</div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-bottom:6px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">PC</div>
          <input type="range" id="cfg-uiscale-pc" min="80" max="140" step="5" value="${Math.max(80,Math.min(140,uiPctPc))}" oninput="cfgSetUiScalePct('pc',this.value)" style="width:100%">
          <div id="cfg-uiscale-pc-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(80,Math.min(140,uiPctPc))}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center;margin-bottom:6px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">태블릿</div>
          <input type="range" id="cfg-uiscale-tb" min="80" max="140" step="5" value="${Math.max(80,Math.min(140,uiPctTb))}" oninput="cfgSetUiScalePct('tb',this.value)" style="width:100%">
          <div id="cfg-uiscale-tb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(80,Math.min(140,uiPctTb))}%</div>
        </div>
        <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">모바일</div>
          <input type="range" id="cfg-uiscale-mb" min="80" max="140" step="5" value="${Math.max(80,Math.min(140,uiPctMb))}" oninput="cfgSetUiScalePct('mb',this.value)" style="width:100%">
          <div id="cfg-uiscale-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(80,Math.min(140,uiPctMb))}%</div>
        </div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:4px">※ 자동(기기 폭) 스케일에 추가로 곱해집니다. (100%=기본)
          <button class="btn btn-w btn-xs" style="margin-left:8px" onclick="cfgResetUiScalePct()">초기화</button>
        </div>
      </div>
      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:11px;color:var(--text3);font-weight:900;margin-bottom:8px">📱 모바일 상단 메뉴(탭)</div>
        <div style="display:grid;grid-template-columns:96px 1fr 54px;gap:10px;align-items:center;margin-bottom:8px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">글자 크기</div>
          <input type="range" id="cfg-top-tab-font-mb" min="8" max="16" step="1" value="${Math.max(8,Math.min(16,topTabMbFont))}" oninput="document.getElementById('cfg-top-tab-font-mb-v').textContent=this.value+'px'" onchange="cfgSetTopTabUiSettings()" style="width:100%">
          <div id="cfg-top-tab-font-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(8,Math.min(16,topTabMbFont))}px</div>
        </div>
        <div style="display:grid;grid-template-columns:96px 1fr 54px;gap:10px;align-items:center;margin-bottom:8px">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">탭 간격</div>
          <input type="range" id="cfg-top-tab-gap-mb" min="0" max="16" step="1" value="${Math.max(0,Math.min(16,topTabMbGap))}" oninput="document.getElementById('cfg-top-tab-gap-mb-v').textContent=this.value+'px'" onchange="cfgSetTopTabUiSettings()" style="width:100%">
          <div id="cfg-top-tab-gap-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(0,Math.min(16,topTabMbGap))}px</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <div style="font-size:12px;font-weight:800;color:var(--text2);min-width:96px">정렬</div>
          <select id="cfg-top-tab-align-mb" onchange="cfgSetTopTabUiSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
            <option value="start" ${topTabMbAlign==='start'?'selected':''}>좌측 시작</option>
            <option value="center" ${topTabMbAlign==='center'?'selected':''}>가운데</option>
          </select>
          <button class="btn btn-w btn-xs" onclick="cfgResetTopTabUiSettings()">초기화</button>
        </div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 이 설정은 상단 메인 탭 메뉴 전용입니다. 경기 팝업 상단 카드 정렬과는 별개입니다.</div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">버튼 크기</div>
        <input type="range" id="cfg-btnscale" min="85" max="125" step="5" value="${Math.max(85,Math.min(125,pct))}"
          oninput="document.getElementById('cfg-btnscale-v').textContent=this.value+'%'" onchange="cfgSetUiBtnStyleSettings()" style="width:100%">
        <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-btnscale-v">${Math.max(85,Math.min(125,pct))}%</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">버튼 라운드</div>
          <input type="range" id="cfg-btnr" min="4" max="18" step="1" value="${Math.max(4,Math.min(18,br))}"
            oninput="document.getElementById('cfg-btnr-v').textContent=this.value+'px'" onchange="cfgSetUiBtnStyleSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-btnr-v">${Math.max(4,Math.min(18,br))}px</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">필(탭/정렬) 라운드</div>
          <input type="range" id="cfg-pillr" min="12" max="28" step="1" value="${Math.max(12,Math.min(28,pr))}"
            oninput="document.getElementById('cfg-pillr-v').textContent=this.value+'px'" onchange="cfgSetUiBtnStyleSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-pillr-v">${Math.max(12,Math.min(28,pr))}px</span></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-w btn-sm" onclick="cfgResetUiBtnStyleSettings()">초기화</button>
        <span style="font-size:11px;color:var(--gray-l)">※ 모바일에서는 터치 편의 때문에 최소 높이가 유지될 수 있습니다.</span>
      </div>
      <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:11px;color:var(--text3);font-weight:900;margin-bottom:8px">미리보기</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
          <button class="btn btn-b">기본</button>
          <button class="btn btn-w">화이트</button>
          <button class="btn btn-p">포인트</button>
          <button class="btn btn-r">삭제</button>
          <button class="btn btn-w btn-sm">SM</button>
          <button class="btn btn-w btn-xs">XS</button>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
          <button class="pill on">필 ON</button>
          <button class="pill">필 OFF</button>
          <button class="sort-btn on">정렬 ON</button>
          <button class="sort-btn">정렬</button>
        </div>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const lock = (localStorage.getItem('su_filter_lock_open') ?? '1') === '1';
    const enabled = (localStorage.getItem('su_submenu_filter_enabled') ?? '1') === '1';
    return _scfgD('uifilter','🔽 필터/하위메뉴') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">대전기록/통계/개인전/대학대전/대회/프로리그 등의 하위메뉴 표시 방식을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-filter-lock" style="width:15px;height:15px" ${lock?'checked':''} onchange="cfgSetUiFilterMenuSettings()">
        필터 항상 펼치기(접기 비활성)
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-submenu-filter" style="width:15px;height:15px" ${enabled?'checked':''} onchange="cfgSetUiFilterMenuSettings()">
        하위메뉴를 ‘필터’로 접기/펼치기 사용
      </label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px">
        <button class="btn btn-w btn-sm" onclick="cfgResetUiFilterMenuSettings()">초기화</button>
        <span style="font-size:11px;color:var(--gray-l)">※ 체크 해제 시 하위 메뉴가 항상 보이게 됩니다.</span>
      </div>
    </div>
  </details>`;
  })()}
  ${(()=>{ 
    const compat = (localStorage.getItem('su_paste_compat') ?? '1') === '1';
    const fmt = (function(){
      try{
        const d={includeRace:true,includeMap:true,mapBrackets:true,winnerEmphasis:'none',hideUnknownRace:true};
        const obj=JSON.parse(localStorage.getItem('su_auto_outfmt')||'{}')||{};
        return {...d,...obj};
      }catch(e){
        return {includeRace:true,includeMap:true,mapBrackets:true,winnerEmphasis:'none',hideUnknownRace:true};
      }
    })();
    return _scfgD('paste','🤖 자동인식') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">경기 결과 붙여넣기 ‘자동인식’이 잘 안 될 때 호환 옵션을 켜두면 인식률이 올라갑니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-paste-compat" style="width:15px;height:15px" ${compat?'checked':''} onchange="cfgSetPasteCompatSettings()">
        호환 모드 (전각괄호/🆚/VS 공백 없음 등)
      </label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px">
        <button class="btn btn-w btn-sm" onclick="cfgResetPasteCompatSettings()">초기화</button>
        <span style="font-size:11px;color:var(--gray-l)">※ 기본값 ON 권장</span>
      </div>
    </div>
    <div style="height:12px"></div>
    <div style="padding:14px;background:var(--white);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:1000;color:var(--text2);margin-bottom:8px">🎛️ 출력 포맷(전역)</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">붙여넣기 자동인식/변환툴 등에서 결과를 같은 형식으로 통일합니다.</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-auto-outfmt-race" style="width:15px;height:15px" ${fmt.includeRace?'checked':''} onchange="cfgAutoOutfmtUpd('includeRace', this.checked)">
          종족 포함 (선수(T))
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-auto-outfmt-hideN" style="width:15px;height:15px" ${fmt.hideUnknownRace?'checked':''} onchange="cfgAutoOutfmtUpd('hideUnknownRace', this.checked)">
          미정(N) 숨김
        </label>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:6px">
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-auto-outfmt-map" style="width:15px;height:15px" ${fmt.includeMap?'checked':''} onchange="cfgAutoOutfmtUpd('includeMap', this.checked)">
          맵 포함
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-auto-outfmt-mapb" style="width:15px;height:15px" ${fmt.mapBrackets?'checked':''} onchange="cfgAutoOutfmtUpd('mapBrackets', this.checked)">
          맵을 [ ]로 표시
        </label>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:8px">
        <div style="font-size:12px;font-weight:900;color:var(--text2);min-width:120px">승자 강조</div>
        <select id="cfg-auto-outfmt-emph" onchange="cfgAutoOutfmtUpd('winnerEmphasis', this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="none"${fmt.winnerEmphasis==='none'?' selected':''}>없음</option>
          <option value="star"${fmt.winnerEmphasis==='star'?' selected':''}>★ 표시</option>
          <option value="md"${fmt.winnerEmphasis==='md'?' selected':''}>굵게(마크다운)</option>
        </select>
        <button class="btn btn-w btn-xs" onclick="cfgAutoOutfmtReset()">초기화</button>
      </div>
      <div style="margin-top:10px;font-size:11px;color:var(--gray-l)">미리보기</div>
      <pre id="cfg-auto-outfmt-preview" style="margin-top:6px;white-space:pre-wrap;word-break:break-word;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;min-height:46px"></pre>
    </div>
    <div style="height:12px"></div>
    <div style="padding:14px;background:var(--white);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:1000;color:var(--text2);margin-bottom:8px">🧩 선수 별명 매핑 (자동인식 보강)</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        예: <b>샤이니</b> → <b>김재현</b> 처럼, 붙여넣기에서 들어오는 별명을 실제 스트리머로 강제 매핑합니다.
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <input id="cfg-pal-alias" type="text" placeholder="별명 입력 (예: 샤이니)" style="width:160px" onkeydown="if(event.key==='Enter')cfgAddPlayerAlias()">
        <select id="cfg-pal-player" style="min-width:170px;border:1px solid var(--border2);border-radius:8px;padding:6px 10px;font-size:13px">
          ${(players||[]).map(p=>`<option value="${esc(p.name)}">${esc(p.name)}</option>`).join('')}
        </select>
        <button class="btn btn-b btn-sm" onclick="cfgAddPlayerAlias()">+ 추가</button>
        <button class="btn btn-w btn-sm" onclick="cfgResetPlayerAliasMap()">초기화</button>
      </div>
      <div id="cfg-pal-list" style="border:1px solid var(--border);border-radius:10px;max-height:220px;overflow:auto;background:var(--surface);padding:10px"></div>
    </div>
    <div style="padding:14px;background:var(--white);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:1000;color:var(--text2);margin-bottom:8px">🔁 변환툴 (리포트 포맷)</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        가공되지 않은 텍스트를 붙여넣으면 아래 규칙으로 변환합니다: <b>승자 굵게</b> · ✅/⬜ · 🆚️ · 맵 약어 교정 · 최종 스코어 출력
      </div>
      <textarea id="cfg-paste-conv-in" rows="7" placeholder="여기에 원본 경기 텍스트를 붙여넣기..." style="width:100%;border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.6;resize:vertical;background:var(--surface);color:var(--text1);box-sizing:border-box"></textarea>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="btn btn-b btn-sm" onclick="cfgPasteConvertRun()">변환</button>
        <button class="btn btn-w btn-sm" onclick="cfgPasteConvertCopy()">복사</button>
      </div>
      <pre id="cfg-paste-conv-out" style="margin-top:12px;white-space:pre-wrap;word-break:break-word;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px;font-size:12px;line-height:1.6;min-height:70px"></pre>
    </div>
  </details>`;
  })()}
  ${_scfgD('firebase','☁️ GitHub(깃허브) data.json 동기화')}
    <div id="cfg-fb-body">
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">관리자가 데이터를 저장할 때 GitHub <code>star-datacenter/data/</code> 폴더에 분리 저장됩니다. 다른 기기는 인덱스를 읽고 필요한 파일들을 합쳐 반영합니다.</p>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:6px">설정 변경 GitHub 자동 반영</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        기본값은 <b>ON</b>입니다. 경기 기록 저장, 경기 수정, 스트리머/대학 상세 수정, 설정탭 설정 변경은 GitHub에도 반영되고, <b>새로고침만으로는 저장되지 않게</b> 유지합니다.
      </div>
      <label style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <input type="checkbox" ${(localStorage.getItem('su_cfg_remote_auto') ?? '1')==='1'?'checked':''} onchange="cfgSetRemoteCfgAuto(this.checked)">
        <span style="font-size:12px;font-weight:700;color:var(--text2)">설정 변경 시 GitHub에도 자동 반영</span>
      </label>
      <div id="cfg-remote-auto-status" style="font-size:11px;margin-top:8px;color:${(localStorage.getItem('su_cfg_remote_auto') ?? '1')==='1'?'#16a34a':'var(--gray-l)'}">${(localStorage.getItem('su_cfg_remote_auto') ?? '1')==='1'?'ON · 설정/상세 수정은 GitHub에도 반영, 새로고침만으로는 저장되지 않음':'OFF · 설정 변경은 로컬만 저장'}</div>
    </div>
    <div id="cfg-fb-sync-panel" style="margin-bottom:12px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
        <span style="font-size:12px;font-weight:700;color:var(--blue)">🔄 동기화 상태</span>
        <button class="btn btn-w btn-xs" onclick="checkFbSyncStatus()">🔍 지금 확인</button>
      </div>
      <div id="cfg-fb-sync-result" style="font-size:12px;color:var(--gray-l)">확인 버튼을 눌러 상태를 확인하세요.</div>
    </div>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:8px">보조 신호 비밀번호</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">실제 데이터 원본은 GitHub에 저장하고, 보조 신호 채널은 다른 기기에 <b>새 데이터 신호</b>를 더 빨리 전달하는 용도로만 사용합니다.</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="password" id="cfg-fb-pw" placeholder="보조 신호 비밀번호 입력..." style="width:220px" autocomplete="new-password">
        <button class="btn btn-b" onclick="saveFbPw()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="clearFbPw()">지우기</button>
      </div>
      <div id="fb-pw-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--gray-l)">${localStorage.getItem('su_fb_pw')?'✅ 보조 신호 비밀번호 설정됨':'미설정'}</div>
    </div>
    <div style="margin-bottom:10px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:#16a34a;margin-bottom:8px">GitHub 토큰 (관람자 수천 명 무료 지원)</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:6px">설정 시: 동기화 섹션의 수동 업로드 버튼으로 GitHub <code>star-datacenter/data/</code> 아래 인덱스/코어/월별 기록 파일을 올릴 수 있습니다. 다른 기기/관람자는 이를 합쳐 반영합니다.</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:4px">권장: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained token 사용. 대상 저장소는 <code>nada1004/star-system</code>, 권한은 <code>Contents: Read and Write</code>만 부여.</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">Classic PAT의 <code>repo</code> 전체 권한은 사용하지 마세요.</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <input type="password" id="cfg-gh-token" placeholder="ghp_xxxxxxxxxxxx" style="width:260px" autocomplete="new-password">
        <button class="btn btn-b" onclick="saveGhToken()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="clearGhToken()">지우기</button>
      </div>
      <div id="gh-token-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--gray-l)">${localStorage.getItem('su_gh_token')?'✅ 토큰 설정됨 (수동 GitHub 업로드 가능)':'미설정 (GitHub 저장 불가, 로컬만 저장)'}</div>
    </div>
    </div>
  </details>
  ${_scfgD('aibot','🤖 AI봇(Groq) 서버 설정')}
    <div style="font-size:12px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">
      펨붕이봇(AI봇)은 기본적으로 <code>/api/aibot</code> 프록시 서버가 필요합니다.<br>
      관리자 전용으로 <b>API Key를 직접 입력</b>해서 사용할 수도 있습니다. (동기화 ON이면 다른 기기에도 적용)
    </div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:800;color:var(--text2)">AI봇 서버 주소</label>
        <input id="cfg-ai-proxy-url" type="text" placeholder="예: http://내서버:3000" style="width:320px;max-width:100%">
        <button class="btn btn-b btn-sm" onclick="cfgSaveAiProxyUrl()">💾 저장</button>
        <button class="btn btn-w btn-sm" onclick="cfgTestAiProxy()">🔍 테스트</button>
      </div>
      <div style="font-size:11px;color:var(--gray-l)">※ 저장 후 (관리자+동기화 ON이면) 다른 기기에도 자동 반영됩니다.</div>
      <div id="cfg-ai-proxy-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--blue)"></div>
    </div>
    <div style="height:10px"></div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:6px">Groq API Key (관리자 전용)</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6;margin-bottom:10px">
        • 키를 저장하면 서버 없이도 AI봇을 바로 호출할 수 있습니다.<br>
        • <b>동기화 ON</b>이면 다른 기기에도 반영됩니다. (다른 기기에서 토큰이 없어도 pull로 받아옵니다)<br>
        • 주의: 이 경우 Gist를 아는 사람이면 키를 볼 수 있어 <b>유출 위험</b>이 있습니다.
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input type="password" id="cfg-ai-api-key" placeholder="gsk_..." style="width:320px;max-width:100%" autocomplete="new-password">
        <button class="btn btn-b btn-sm" onclick="cfgSaveAiApiKey()">💾 저장</button>
        <button class="btn btn-r btn-xs" onclick="cfgClearAiApiKey()">지우기</button>
      </div>
      <div id="cfg-ai-key-status" style="font-size:12px;margin-top:8px;min-height:16px;color:var(--gray-l)"></div>
    </div>
  </details>
  ${_scfgD('season','🏆 시즌 관리','id="cfg-season-sec"')}
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">시즌을 정의하면 대전기록·통계 등 모든 탭에서 시즌 단위로 필터링할 수 있습니다.</p>
    <div id="cfg-season-list" style="margin-bottom:12px"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">시즌 이름</label>
        <input type="text" id="cfg-season-name" placeholder="예: 2025 스프링" style="width:140px;font-size:12px">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">시작일</label>
        <input type="date" id="cfg-season-from" style="font-size:12px">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--text3);display:block;margin-bottom:4px">종료일</label>
        <input type="date" id="cfg-season-to" style="font-size:12px">
      </div>
      <button class="btn btn-b btn-sm" onclick="addSeason()">+ 시즌 추가</button>
    </div>
  </details>
  ${_scfgD('teammatch','👥 팀 매치 설정 (2:2 / 3:3 / 4:4전)')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">붙여넣기 자동 인식 및 경기 입력에서 팀 매치(2:2·3:3·4:4전)를 지원합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">⚙️ 기본 팀 규모</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${['1v1','2v2','3v3','4v4'].map(t=>`<button class="pill ${(localStorage.getItem('su_teamMatchSize')||'1v1')===t?'on':''}" id="cfg-tm-${t.replace(':','')}" onclick="localStorage.setItem('su_teamMatchSize','${t}');document.querySelectorAll('[id^=cfg-tm-]').forEach(b=>b.classList.remove('on'));this.classList.add('on')">${t}전</button>`).join('')}
        </div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:6px">경기 입력 모달에서 사용할 기본 팀 규모 (기본: 1v1)</div>
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:6px">📋 자동인식 형식 안내</div>
        <div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-size:11px;color:var(--text2);line-height:2">
          <div>• <code>선수A+선수B 승 선수C+선수D</code> → 2:2전 승리</div>
          <div>• <code>선수A+선수B+선수C 승 선수D+선수E+선수F</code> → 3:3전</div>
          <div>• <code>선수A+선수B > 선수C+선수D [맵명]</code> → 맵 포함</div>
          <div style="color:var(--gray-l);margin-top:4px">※ 붙여넣기 모달에서 "+" 기호로 팀원을 연결하면 자동 인식됩니다.</div>
        </div>
      </div>
    </div>
  </details>
    ${_scfgD('bulkdate','📅 날짜 일괄 변경')}
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">변경 전 날짜</label>
        <input type="date" id="bulk-date-from" style="font-size:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 변경 후</label>
        <input type="date" id="bulk-date-to" style="font-size:12px">
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
          <input type="checkbox" id="bulk-date-chk-${m}" checked style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회', ind:'개인전', gj:'끝장전', comp:'대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeDate()">📅 날짜 일괄 변경</button>
      <span id="bulk-date-result" style="font-size:12px;margin-left:8px;color:var(--green)"></span>
    </div>
  </details>
  ${_scfgD('bulkmap','🗺️ 맵 이름 일괄 교체')}
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">※ 띄어쓰기 차이(예: 투혼 II ↔ 투혼II)는 자동으로 무시하고 교체됩니다.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">교체 전</label>
        <input type="text" id="bulk-map-from" placeholder="예: 투혼II" style="font-size:12px;width:120px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 교체 후</label>
        <input type="text" id="bulk-map-to" placeholder="예: 투혼" style="font-size:12px;width:120px">
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeMap()">🗺️ 맵 일괄 교체</button>
      <span id="bulk-map-result" style="font-size:12px;margin-left:8px;color:var(--green)"></span>
    </div>
  </details>
  ${_scfgD('bulktier','🎖️ 선수 일괄 티어 변경')}
    <div style="padding:14px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">현재 티어</label>
        <select id="bulk-tier-from" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">전체 (상관없음)</option>
          ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
          <option value="미정">미정</option>
        </select>
        <label style="font-size:12px;font-weight:600;color:var(--text2)">→ 변경할 티어</label>
        <select id="bulk-tier-to" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">선택</option>
          ${TIERS.map(t=>`<option value="${t}">${getTierLabel(t)||t}</option>`).join('')}
          <option value="미정">미정</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">대상 대학</label>
        <select id="bulk-tier-univ" style="font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid var(--border2)">
          <option value="">전체 대학</option>
          ${getAllUnivs().map(u=>`<option value="${u.name}">${u.name}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-b btn-sm" onclick="bulkChangeTier()">🎖️ 티어 일괄 변경</button>
      <span id="bulk-tier-result" style="font-size:12px;margin-left:8px;color:var(--blue)"></span>
    </div>
  </details>
  ${_scfgD('bulkdel','🗑️ 날짜 범위 일괄 삭제')}
    <div style="padding:14px;background:#fff5f5;border:1px solid #fca5a5;border-radius:10px">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">시작일</label>
        <input type="date" id="bulk-del-from" style="font-size:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2)">~</label>
        <input type="date" id="bulk-del-to" style="font-size:12px">
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt','ind','gj','comp'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
          <input type="checkbox" id="bulk-del-chk-${m}" style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회', ind:'개인전', gj:'끝장전', comp:'대회' }[m]}
        </label>`).join('')}
      </div>
      <button class="btn btn-r btn-sm" onclick="bulkDeleteByDate()">🗑️ 범위 삭제 (되돌릴 수 없음)</button>
      <span id="bulk-del-result" style="font-size:12px;margin-left:8px;color:var(--red)"></span>
    </div>
  </details>
  ${_scfgD('bulkconv','🔄 세트제 → 게임수 합산 일괄 변환')}
    <div style="padding:14px;background:#fefce8;border:1px solid #fde68a;border-radius:10px">
      <div style="font-size:11px;color:var(--text3);margin-bottom:10px">
        sets 배열 기준으로 점수를 다시 계산합니다.<br>
        • <b>게임수(경기제)</b>: 각 세트의 scoreA/scoreB 합산<br>
        • <b>세트승(세트제)</b>: 각 세트의 winner(A/B) 개수 합산
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <label style="font-size:11px;font-weight:600;color:var(--text3)">대상:</label>
        ${['mini','univm','ck','pro','tt'].map(m=>`
        <label style="display:inline-flex;align-items:center;gap:3px;font-size:11px;cursor:pointer">
          <input type="checkbox" id="bulk-conv-chk-${m}" checked style="cursor:pointer">
          ${{ mini:'미니대전', univm:'대학대전', ck:'CK', pro:'프로리그', tt:'티어대회' }[m]}
        </label>`).join('')}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-b btn-sm" onclick="bulkConvertToGameScore()">🔄 게임수 합산으로 변환</button>
        <button class="btn btn-b btn-sm" onclick="bulkConvertToSetScore()">🔄 세트승으로 변환</button>
        <button class="btn btn-p btn-sm" onclick="bulkRecalcScoreByMode()">🧩 저장형식대로 재계산</button>
        <span id="bulk-conv-result" style="font-size:12px;color:var(--blue)"></span>
        <span id="bulk-conv2-result" style="font-size:12px;color:var(--blue)"></span>
        <span id="bulk-conv3-result" style="font-size:12px;color:var(--blue)"></span>
      </div>
    </div>
  </details>
  ${_scfgD('boardbg','🖼️ 현황판 라벨 배경 이미지별 설정')}
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">각 대학 라벨에 배경 이미지를 설정할 수 있습니다. 이미지 위치와 크기도 조절 가능합니다.</p>
    <div id="cfg-board-bg-list" style="max-height:400px;overflow-y:auto"></div>
  </details>
  ${_scfgD('sync','🔄 데이터 동기화')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">경기 기록을 각 탭 기록 및 스트리머 최근 경기에 반영합니다.</div>
    <div style="display:flex;flex-direction:column;gap:10px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:12px">
        <div style="font-weight:1000;font-size:12px;margin-bottom:6px">📦 설정 내보내기/가져오기 (다른 기기 적용)</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">설정만 코드로 복사해 다른 기기(모바일/태블릿/PC)에 붙여넣어 적용할 수 있습니다. (경기 데이터는 포함 안됨)</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
          <button class="btn btn-w btn-sm" onclick="cfgFillSettingsCode()">코드 생성</button>
          <button class="btn btn-w btn-sm" onclick="cfgCopySettingsCode()">복사</button>
          <button class="btn btn-b btn-sm" onclick="cfgImportSettingsCode()">이 기기에 적용</button>
        </div>
        <textarea id="cfg-sync-code" placeholder="여기에 코드가 표시됩니다 (또는 다른 기기에서 복사한 코드를 붙여넣으세요)" style="width:100%;min-height:90px;border:1px solid var(--border2);border-radius:10px;padding:10px;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;resize:vertical"></textarea>
      </div>
      <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:12px">
        <div style="font-weight:1000;font-size:12px;margin-bottom:6px">☁️ 설정/메모 동기화 (GitHub Gist)</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">
          Gist ID만 있으면 다른 기기에서 불러오기가 가능합니다. 저장(업로드)은 관리자+토큰이 필요합니다. (이전 파일은 자동 마이그레이션)
        </div>
        <div id="cfg-gist-sync-status" style="font-size:12px;color:var(--text2);background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;line-height:1.6">
          동기화 상태를 불러오는 중...
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px">
          <label style="font-size:12px;font-weight:800;color:var(--text2)">Gist ID</label>
          <input id="cfg-gist-id" type="text" placeholder="예: a1b2c3d4..." style="width:240px;max-width:100%">
          ${(!isSubAdmin?`<label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;color:var(--text2);cursor:pointer"><input id="cfg-gist-enabled" type="checkbox"> 동기화 ON</label>`:'')}
          ${(!isSubAdmin?`<input id="cfg-gist-token" type="password" placeholder="GitHub 토큰(gist)" style="width:220px;max-width:100%" autocomplete="new-password">`:'')}
          ${(!isSubAdmin?`<button class="btn btn-b btn-sm" onclick="cfgGistSyncSaveCfg()">💾 저장</button>`:`<button class="btn btn-w btn-sm" onclick="cfgGistSyncSaveCfg()">💾 저장</button>`)}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px">
          <button class="btn btn-w btn-sm" onclick="cfgGistSyncPull()">⬇️ 원격 불러오기</button>
          ${(!isSubAdmin?`<button class="btn btn-b btn-sm" onclick="cfgGistSyncPush()">⬆️ 원격 저장</button>`:'')}
          ${(!isSubAdmin?`<label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;color:var(--text2);cursor:pointer;margin-left:6px">
            <input id="cfg-gist-auto-push" type="checkbox" ${(window.SettingsStore && window.SettingsStore.getPrefsAutoPush && window.SettingsStore.getPrefsAutoPush())?'checked':''}
              onchange="cfgGistSyncSetAutoPush(this.checked)"> 설정 변경 시 자동 저장</label>`:'')}
          <span id="cfg-gist-sync-msg" style="font-size:11px;color:var(--gray-l)"></span>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="
          _ttMigrated=false;_migrateTierTourneys();
          const n=syncAllHistory?syncAllHistory():0;
          alert('✅ 티어대회 기록 동기화 + '+n+'건 스트리머 반영 완료');render();">🔄 전체 동기화 (기록탭 + 스트리머)</button>
        <span style="font-size:11px;color:var(--gray-l)">티어대회 기록탭·대전기록 반영 + 스트리머 최근 경기 소급 반영</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-p btn-sm" onclick="
          _ttMigrated=false;_migrateTierTourneys();
          const before=ttM.length;save();render();
          alert('✅ 티어대회 기록 동기화 완료\\n추가된 기록: '+(ttM.length-before)+'건');">🎯 티어대회 기록 동기화</button>
        <span style="font-size:11px;color:var(--gray-l)">조별리그·토너먼트 경기를 기록탭·대전기록에 반영 (누락 시 사용)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b btn-sm" onclick="syncAllHistoryBtn()">📋 스트리머 최근 경기 반영</button>
        <span style="font-size:11px;color:var(--gray-l)">모든 경기를 스트리머 상세의 최근 경기에 소급 반영</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-w btn-sm" onclick="
          const seen=new Set();let removed=0;
          ttM=ttM.filter(m=>{if(!m._id)return true;if(seen.has(m._id)){removed++;return false;}seen.add(m._id);return true;});
          save();render();alert('✅ ttM 중복 제거 완료: '+removed+'건 삭제');
        ">🗑️ 중복 경기 제거</button>
        <span style="font-size:11px;color:var(--gray-l)">같은 _id로 이중 등록된 티어대회 경기 제거</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-y btn-sm" onclick="deduplicatePlayerHistory()">🧹 중복 기록 제거</button>
        <span style="font-size:11px;color:var(--gray-l)">스트리머 history에서 중복 항목만 제거 (승패/ELO 재계산)</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-r btn-sm" onclick="rebuildAllPlayerHistory()">🔄 전체 경기 기록 복구</button>
        <span style="font-size:11px;color:var(--gray-l)">대전 데이터에서 스트리머 history 재구성 (기존 history 초기화됨)</span>
      </div>
    </div>
  </details>
  ${_scfgD('b2layout','📐 이미지탭 레이아웃')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">이미지탭(프로필 탭)의 좌우 비율과 높이를 설정합니다. 저장 즉시 반영됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-b" onclick="cfgAutoFitBoard()">📱 이미지탭 자동 맞춤(원클릭)</button>
        <span style="font-size:11px;color:var(--gray-l)">※ “전역 자동 맞춤(모든 탭)”과 별개로, <b>이미지탭(프로필)</b> 전용 프리셋입니다.</span>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">좌측(이미지) 너비</label>
          <span id="cfg-b2-left-size-val" style="font-size:12px;font-weight:700;color:var(--blue)">55%</span>
        </div>
        <input type="range" id="cfg-b2-left-size" min="30" max="70" step="1" value="55" style="width:100%;accent-color:var(--blue)"
          oninput="this.value=Math.min(70,Math.max(30,this.value));document.getElementById('cfg-b2-left-size-val').textContent=this.value+'%';document.getElementById('cfg-b2-right-size').value=100-parseInt(this.value);document.getElementById('cfg-b2-right-size-val').textContent=(100-parseInt(this.value))+'%'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>30%</span><span>70%</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">우측(목록) 너비</label>
          <span id="cfg-b2-right-size-val" style="font-size:12px;font-weight:700;color:var(--blue)">45%</span>
        </div>
        <input type="range" id="cfg-b2-right-size" min="30" max="70" step="1" value="45" style="width:100%;accent-color:var(--blue)"
          oninput="this.value=Math.min(70,Math.max(30,this.value));document.getElementById('cfg-b2-right-size-val').textContent=this.value+'%';document.getElementById('cfg-b2-left-size').value=100-parseInt(this.value);document.getElementById('cfg-b2-left-size-val').textContent=(100-parseInt(this.value))+'%'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>30%</span><span>70%</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">PC 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-pc-height" value="600" min="400" max="900" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">태블릿 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-tablet-height" value="400" min="300" max="700" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div>
          <label style="font-size:12px;font-weight:700;color:var(--text2);display:block;margin-bottom:4px">모바일 높이 <span style="font-weight:400;color:var(--gray-l)">(px)</span></label>
          <input type="number" id="cfg-b2-mobile-height" value="320" min="200" max="600" step="20" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700">
        </div>
        <div style="display:flex;align-items:flex-end;padding-bottom:4px">
          <div style="display:flex;flex-direction:column;gap:8px">
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:700">
              <input type="checkbox" id="cfg-b2-auto-resize" checked style="width:15px;height:15px"> 자동 크기 조절(좌우 비율)
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:700">
              <input type="checkbox" id="cfg-b2-auto-height" checked style="width:15px;height:15px"> 모바일/태블릿 높이 자동 맞춤(추천)
            </label>
          </div>
        </div>
      </div>
      <button class="btn btn-b" onclick="saveB2LayoutSettings()" style="align-self:flex-start">💾 레이아웃 저장</button>
    </div>
  </details>
  ${_scfgD('femcoorder','🔀 펨코스타일 스타대학 순서')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px;line-height:1.6">
      <b>펨코스타일</b> 및 <b>대학별 신현황판</b>에서 대학이 표시되는 순서(= <code>univCfg</code> 순서)를 조정합니다.<br>
      ※ 순서 변경 즉시 저장되며, 현황판에 바로 반영됩니다.
    </div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      ${(univCfg||[]).map((u,idx)=>({u,idx})).filter(x=>x.u && !x.u.dissolved).map(({u,idx:i})=>`
        <div class="srow" style="gap:8px;align-items:center;flex-wrap:wrap">
          <div class="cdot" style="background:${u.color||'#64748b'}"></div>
          <div style="flex:1;min-width:140px;font-weight:900;color:var(--text2)">${esc(u.name||'')}</div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button class="btn btn-w btn-xs" onclick="cfgUnivOrderMove(${i},'up')">▲</button>
            <button class="btn btn-w btn-xs" onclick="cfgUnivOrderMove(${i},'down')">▼</button>
          </div>
        </div>
      `).join('')}
      <div style="font-size:11px;color:var(--gray-l);margin-top:8px">팁: ‘대학 관리’에서 대학명/색상도 함께 수정할 수 있습니다.</div>
    </div>
  </details>
  ${_scfgD('b2femco','🧩 펨코스타일 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">현황판 &gt; <b>펨코스타일</b> 탭에서 사용하는 전용 설정입니다. 저장 즉시 반영됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
          <input type="checkbox" id="cfg-femco-autoLayout" style="width:15px;height:15px" onchange="cfgFemcoUpd('autoLayout', this.checked?1:0)">
          인원수/화면폭에 맞춰 자동 레이아웃(추천)
        </label>
        <button class="btn btn-w btn-xs" style="margin-left:auto" onclick="(function(){cfgFemcoUpd('autoLayout',1);try{document.getElementById('cfg-femco-autoLayout').checked=true;}catch(e){};alert('✅ 자동 레이아웃으로 되돌렸습니다');render();})()">🔄 자동으로 되돌리기</button>
        <span style="font-size:11px;color:var(--gray-l)">※ 아래 수동 값을 조절하면 자동 레이아웃이 자동으로 꺼집니다</span>
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학 로고 크기</div>
        <input type="range" id="cfg-femco-logoSize" min="60" max="520" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-logoSizeNum').value=this.value;cfgFemcoUpd('logoSize',this.value)">
        <input type="number" id="cfg-femco-logoSizeNum" min="60" max="520" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-logoSize').value=this.value;cfgFemcoUpd('logoSize',this.value)">
      </div>
      <!-- (버그픽스) 설정 모달에서 summary 클릭 시 바깥 클릭으로 인식되어 팝업이 닫히는 케이스가 있어 이벤트 전파 차단 -->
      <details style="border:1px dashed var(--border2);border-radius:12px;padding:10px 12px;background:var(--white)" onclick="event.stopPropagation()">
        <summary style="cursor:pointer;font-weight:900;color:var(--text2);list-style:none" onclick="event.stopPropagation()">🏫 대학별 로고 크기 (펨코스타일) <span style="font-size:11px;color:var(--gray-l);font-weight:600">(선택)</span></summary>
        <div style="font-size:11px;color:var(--gray-l);margin:8px 0 10px;line-height:1.6">
          위의 “대학 로고 크기”가 <b>기본(공통)</b>이고, 아래는 대학별로 <b>예외값</b>을 줄 때만 사용합니다.<br>
          초기화하면 공통값을 따릅니다.
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${(univCfg||[]).map((u,idx)=>({u,idx})).filter(x=>x.u && !x.u.dissolved).map(({u,idx:i})=>{
            const _v = parseInt(u.logoSizeFemco||'',10);
            const cur = isNaN(_v) ? '' : Math.max(60, Math.min(520,_v));
            return `
              <div class="srow" style="gap:10px;align-items:center;flex-wrap:wrap">
                <div class="cdot" style="background:${u.color||'#64748b'}"></div>
                <div style="flex:1;min-width:120px;font-weight:900;color:var(--text2)">${esc(u.name||'')}</div>
                <input type="range" min="60" max="520" step="1" value="${cur||(()=>{try{return Math.max(60,Math.min(520,parseInt((J('su_femco_settings')||{}).logoSize||150,10)||150));}catch(e){return 150;}})()}" style="flex:1;min-width:180px;accent-color:var(--blue)"
                  oninput="univCfg[${i}].logoSizeFemco=+this.value;saveCfg();render()">
                <span style="font-size:11px;color:var(--gray-l);min-width:52px;font-weight:900">${cur?cur+'px':'(기본)'}</span>
                <button class="btn btn-w btn-xs" onclick="delete univCfg[${i}].logoSizeFemco;saveCfg();render()">초기화</button>
              </div>
            `;
          }).join('')}
        </div>
      </details>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">배경 투명(오버레이)</div>
        <input type="range" id="cfg-femco-bgOverlay" min="0" max="70" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-bgOverlayNum').value=this.value;cfgFemcoUpd('bgOverlay',this.value)">
        <input type="number" id="cfg-femco-bgOverlayNum" min="0" max="70" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-bgOverlay').value=this.value;cfgFemcoUpd('bgOverlay',this.value)">
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:-6px">0=투명(원본 그대로) · 70=글자 잘 보이게 진하게</div>

      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:800;color:var(--text2)">
        <input type="checkbox" id="cfg-femco-logoAttachTitle" style="width:14px;height:14px" onchange="cfgFemcoUpd('logoAttachTitle', this.checked?1:0)">
        로고를 대학명과 같이 이동(체크 해제 시 ‘로고만’ 위치 이동)
      </label>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학 로고 위치</div>
        <select id="cfg-femco-logoPos" onchange="cfgFemcoUpd('logoPos',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="left">좌측</option>
          <option value="right">우측</option>
          <option value="top">상단</option>
          <option value="bottom">하단</option>
          <option value="center">가운데</option>
        </select>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학명 위치(로고 기준)</div>
        <select id="cfg-femco-titlePos" onchange="cfgFemcoUpd('titlePos',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="right">로고 우측</option>
          <option value="left">로고 좌측</option>
          <option value="bottom">로고 아래</option>
          <option value="top">로고 위</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">※ ‘로고를 대학명과 같이 이동’ 켠 상태에서 적용</span>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">로고 좌우 이동</div>
        <input type="range" id="cfg-femco-logoOffsetX" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-logoOffsetXNum').value=this.value;cfgFemcoUpd('logoOffsetX',this.value)">
        <input type="number" id="cfg-femco-logoOffsetXNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-logoOffsetX').value=this.value;cfgFemcoUpd('logoOffsetX',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">로고 상하 이동</div>
        <input type="range" id="cfg-femco-logoOffsetY" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-logoOffsetYNum').value=this.value;cfgFemcoUpd('logoOffsetY',this.value)">
        <input type="number" id="cfg-femco-logoOffsetYNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-logoOffsetY').value=this.value;cfgFemcoUpd('logoOffsetY',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학명 좌우 이동</div>
        <input type="range" id="cfg-femco-titleOffsetX" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-titleOffsetXNum').value=this.value;cfgFemcoUpd('titleOffsetX',this.value)">
        <input type="number" id="cfg-femco-titleOffsetXNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-titleOffsetX').value=this.value;cfgFemcoUpd('titleOffsetX',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학명 상하 이동</div>
        <input type="range" id="cfg-femco-titleOffsetY" min="-80" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-titleOffsetYNum').value=this.value;cfgFemcoUpd('titleOffsetY',this.value)">
        <input type="number" id="cfg-femco-titleOffsetYNum" min="-80" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-titleOffsetY').value=this.value;cfgFemcoUpd('titleOffsetY',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">로고-대학명 간격</div>
        <input type="range" id="cfg-femco-headGap" min="0" max="80" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-headGapNum').value=this.value;cfgFemcoUpd('headGap',this.value)">
        <input type="number" id="cfg-femco-headGapNum" min="0" max="80" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-headGap').value=this.value;cfgFemcoUpd('headGap',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학명 폰트 크기</div>
        <input type="range" id="cfg-femco-titleSize" min="16" max="44" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-titleSizeNum').value=this.value;cfgFemcoUpd('titleSize',this.value)">
        <input type="number" id="cfg-femco-titleSizeNum" min="16" max="44" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-titleSize').value=this.value;cfgFemcoUpd('titleSize',this.value)">
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학명 폰트</div>
        <select id="cfg-femco-titleFont" onchange="cfgFemcoUpd('titleFont',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="system">기본(시스템)</option>
          <option value="app">전역 폰트</option>
          <option value="noto">Noto Sans KR</option>
          <option value="pretendard">Pretendard</option>
          <option value="nanum">나눔고딕</option>
          <option value="gmarket">GmarketSans</option>
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">스트리머 이미지 크기</div>
        <input type="range" id="cfg-femco-playerImgSize" min="28" max="90" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-playerImgSizeNum').value=this.value;cfgFemcoUpd('playerImgSize',this.value)">
        <input type="number" id="cfg-femco-playerImgSizeNum" min="28" max="90" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-playerImgSize').value=this.value;cfgFemcoUpd('playerImgSize',this.value)">
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">이미지 모양</div>
        <select id="cfg-femco-playerImgShape" onchange="cfgFemcoUpd('playerImgShape',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="square">네모</option>
          <option value="circle">원</option>
        </select>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">이름 폰트 크기</div>
        <input type="range" id="cfg-femco-nameFontSize" min="10" max="20" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-nameFontSizeNum').value=this.value;cfgFemcoUpd('nameFontSize',this.value)">
        <input type="number" id="cfg-femco-nameFontSizeNum" min="10" max="20" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-nameFontSize').value=this.value;cfgFemcoUpd('nameFontSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">직급 폰트 크기</div>
        <input type="range" id="cfg-femco-roleFontSize" min="9" max="16" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-roleFontSizeNum').value=this.value;cfgFemcoUpd('roleFontSize',this.value)">
        <input type="number" id="cfg-femco-roleFontSizeNum" min="9" max="16" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-roleFontSize').value=this.value;cfgFemcoUpd('roleFontSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">티어 아이콘 크기</div>
        <input type="range" id="cfg-femco-tierBadgeSize" min="9" max="16" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-tierBadgeSizeNum').value=this.value;cfgFemcoUpd('tierBadgeSize',this.value)">
        <input type="number" id="cfg-femco-tierBadgeSizeNum" min="9" max="16" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-tierBadgeSize').value=this.value;cfgFemcoUpd('tierBadgeSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">⭐ 아이콘 크기</div>
        <input type="range" id="cfg-femco-starSize" min="10" max="28" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-starSizeNum').value=this.value;cfgFemcoUpd('starSize',this.value)">
        <input type="number" id="cfg-femco-starSizeNum" min="10" max="28" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-starSize').value=this.value;cfgFemcoUpd('starSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">상태 아이콘 크기</div>
        <input type="range" id="cfg-femco-statusIconSize" min="10" max="34" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-statusIconSizeNum').value=this.value;cfgFemcoUpd('statusIconSize',this.value)">
        <input type="number" id="cfg-femco-statusIconSizeNum" min="10" max="34" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-statusIconSize').value=this.value;cfgFemcoUpd('statusIconSize',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">세로 인원(줄)</div>
        <input type="range" id="cfg-femco-rowsPerCol" min="2" max="12" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-rowsPerColNum').value=this.value;cfgFemcoUpd('rowsPerCol',this.value)">
        <input type="number" id="cfg-femco-rowsPerColNum" min="2" max="12" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-rowsPerCol').value=this.value;cfgFemcoUpd('rowsPerCol',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">스트리머 폭</div>
        <input type="range" id="cfg-femco-colWidth" min="80" max="360" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-colWidthNum').value=this.value;cfgFemcoUpd('colWidth',this.value)">
        <input type="number" id="cfg-femco-colWidthNum" min="80" max="360" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-colWidth').value=this.value;cfgFemcoUpd('colWidth',this.value)">
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">내용 정렬</div>
        <select id="cfg-femco-contentAlign" onchange="cfgFemcoUpd('contentAlign', this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="left">왼쪽</option>
          <option value="center">가운데</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">※ ‘너무 좌측’ 느낌이면 가운데 + 좌우 여백을 키워보세요</span>
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">좌우 여백</div>
        <input type="range" id="cfg-femco-contentPadX" min="0" max="40" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-contentPadXNum').value=this.value;cfgFemcoUpd('contentPadX',this.value)">
        <input type="number" id="cfg-femco-contentPadXNum" min="0" max="40" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-contentPadX').value=this.value;cfgFemcoUpd('contentPadX',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">내용 좌우 이동</div>
        <input type="range" id="cfg-femco-contentOffsetX" min="-40" max="40" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-contentOffsetXNum').value=this.value;cfgFemcoUpd('contentOffsetX',this.value)">
        <input type="number" id="cfg-femco-contentOffsetXNum" min="-40" max="40" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-contentOffsetX').value=this.value;cfgFemcoUpd('contentOffsetX',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">상하(행) 간격</div>
        <input type="range" id="cfg-femco-colGap" min="0" max="28" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-colGapNum').value=this.value;cfgFemcoUpd('colGap',this.value)">
        <input type="number" id="cfg-femco-colGapNum" min="0" max="28" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-colGap').value=this.value;cfgFemcoUpd('colGap',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">대학 간 여백</div>
        <input type="range" id="cfg-femco-univGap" min="0" max="120" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-univGapNum').value=this.value;cfgFemcoUpd('univGap',this.value)">
        <input type="number" id="cfg-femco-univGapNum" min="0" max="120" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-univGap').value=this.value;cfgFemcoUpd('univGap',this.value)">
      </div>

      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">인원수 폰트 크기</div>
        <input type="range" id="cfg-femco-countFontSize" min="10" max="18" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-countFontSizeNum').value=this.value;cfgFemcoUpd('countFontSize',this.value)">
        <input type="number" id="cfg-femco-countFontSizeNum" min="10" max="18" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-countFontSize').value=this.value;cfgFemcoUpd('countFontSize',this.value)">
      </div>

      <hr style="border:none;border-top:1px solid var(--border);margin:8px 0">
      <div style="font-size:12px;font-weight:800;color:var(--text2)">대학별 설정</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학 선택</div>
        <select id="cfg-femco-univ" onchange="localStorage.setItem('cfg_femco_univ',this.value);cfgFemcoRefreshUnivFields()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;min-width:160px"></select>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학 색상</div>
        <input type="color" id="cfg-femco-univColor" onchange="cfgFemcoSetUnivColor(this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoClearUnivColor()">해제</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학명 아래 문구</div>
        <input type="text" id="cfg-femco-subtitle" placeholder="대학명 아래 문구" style="flex:1;min-width:240px" onchange="cfgFemcoSetSubtitle(this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoClearSubtitle()">삭제</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">대학 배경 미디어</div>
        <input type="text" id="cfg-femco-bgMediaUrl" placeholder="https://... (jpg/png/gif/webp/mp4/유튜브/트위치)" style="flex:1;min-width:260px" onchange="cfgFemcoSetBgMedia(this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoSetBgMedia('')">삭제</button>
        <span id="cfg-femco-bgMediaHint" style="font-size:11px;color:var(--gray-l)">미설정</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.45;margin-top:-6px">
        • 이미지/GIF: 대학 카드 배경으로 적용<br>
        • MP4/WEBM: 대학 카드에 “배경영상” 버튼 표시(클릭 재생)<br>
        • 유튜브/트위치: “배경링크” 버튼 표시(새창)
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center;margin-top:6px">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">배경 이미지 투명도</div>
        <input type="range" id="cfg-femco-bgAlpha" min="0" max="100" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-bgAlphaNum').value=this.value;cfgFemcoSetBgOpt('alpha',this.value)">
        <input type="number" id="cfg-femco-bgAlphaNum" min="0" max="100" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-bgAlpha').value=this.value;cfgFemcoSetBgOpt('alpha',this.value)">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">배경 위치/반복</div>
        <select id="cfg-femco-bgPos" onchange="cfgFemcoSetBgOpt('pos',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="center">중앙</option>
          <option value="top">상단</option>
          <option value="bottom">하단</option>
          <option value="left">좌측</option>
          <option value="right">우측</option>
          <option value="top left">좌상</option>
          <option value="top right">우상</option>
          <option value="bottom left">좌하</option>
          <option value="bottom right">우하</option>
        </select>
        <select id="cfg-femco-bgRepeat" onchange="cfgFemcoSetBgOpt('repeat',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="no-repeat">반복 없음</option>
          <option value="repeat">바둑판 반복(여러곳)</option>
          <option value="repeat-x">가로 반복</option>
          <option value="repeat-y">세로 반복</option>
        </select>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">배경 크기</div>
        <select id="cfg-femco-bgSizeMode" onchange="cfgFemcoSetBgOpt('sizeMode',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="cover">채우기(cover)</option>
          <option value="contain">맞춤(contain)</option>
          <option value="pct">퍼센트(여러개 추천)</option>
          <option value="px">픽셀(여러개 추천)</option>
        </select>
        <input type="number" id="cfg-femco-bgSizeVal" min="30" max="600" step="1" style="width:120px;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="cfgFemcoSetBgOpt('sizeVal',this.value)">
        <span style="font-size:11px;color:var(--gray-l)">pct: % / px: px</span>
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">배경 X 오프셋</div>
        <input type="range" id="cfg-femco-bgOffX" min="-260" max="260" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-bgOffXNum').value=this.value;cfgFemcoSetBgOpt('ox',this.value)">
        <input type="number" id="cfg-femco-bgOffXNum" min="-260" max="260" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-bgOffX').value=this.value;cfgFemcoSetBgOpt('ox',this.value)">
      </div>
      <div style="display:grid;grid-template-columns:140px 1fr 100px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2)">배경 Y 오프셋</div>
        <input type="range" id="cfg-femco-bgOffY" min="-260" max="260" step="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-bgOffYNum').value=this.value;cfgFemcoSetBgOpt('oy',this.value)">
        <input type="number" id="cfg-femco-bgOffYNum" min="-260" max="260" step="1" style="width:100%;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-bgOffY').value=this.value;cfgFemcoSetBgOpt('oy',this.value)">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:140px">문구 스타일</div>
        <span style="font-size:11px;color:var(--gray-l)">크기</span>
        <input type="range" id="cfg-femco-subtitleSize" min="10" max="24" step="1" style="width:180px;accent-color:var(--blue)" oninput="document.getElementById('cfg-femco-subtitleSizeNum').value=this.value;cfgFemcoUpd('subtitleSize',this.value)">
        <input type="number" id="cfg-femco-subtitleSizeNum" min="10" max="24" step="1" style="width:80px;padding:6px 8px;border:1px solid var(--border2);border-radius:6px;font-size:13px;font-weight:700" onchange="document.getElementById('cfg-femco-subtitleSize').value=this.value;cfgFemcoUpd('subtitleSize',this.value)">
        <span style="font-size:11px;color:var(--gray-l)">굵기</span>
        <select id="cfg-femco-subtitleWeight" onchange="cfgFemcoUpd('subtitleWeight',this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
          <option value="400">400</option><option value="500">500</option><option value="600">600</option><option value="700">700</option><option value="800">800</option><option value="900">900</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">색</span>
        <input type="color" id="cfg-femco-subtitleColor" onchange="cfgFemcoUpd('subtitleColor',this.value)">
        <button class="btn btn-xs" onclick="cfgFemcoUpd('subtitleColor','')">자동</button>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="btn btn-b" onclick="cfgFemcoReset()">초기화</button>
      </div>
    </div>
  </details>
  ${_scfgD('cfgmenu','🧭 설정 메뉴 정리')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">카테고리 이동 + 섹션 순서 변경을 직접 정리할 수 있습니다. 변경 즉시 저장되며 새로고침 없이 반영됩니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      ${(()=>{
        const cats = (window._cfgCatOrder && Array.isArray(window._cfgCatOrder)) ? window._cfgCatOrder : Object.keys(_catSecs||{});
        const secTitle = window._cfgSecTitle || {};
        return cats.map((cat, catIdx)=>{
          const secs = (_catSecs[cat]||[]);
          return `
            <div style="border:1px solid var(--border);border-radius:10px;background:var(--white);padding:12px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                <div style="font-weight:900">${cat}</div>
                <span style="font-size:11px;color:var(--gray-l)">${secs.length}개</span>
                <span style="flex:1"></span>
                <button class="btn btn-xs" onclick="cfgMenuMoveCat('${cat.replace(/'/g,"\\'")}','up')" ${catIdx===0?'disabled':''}>▲</button>
                <button class="btn btn-xs" onclick="cfgMenuMoveCat('${cat.replace(/'/g,"\\'")}','down')" ${catIdx===cats.length-1?'disabled':''}>▼</button>
              </div>
              <div style="display:flex;flex-direction:column;gap:6px">
                ${secs.map((secId, i)=>{
                  const title = secTitle[secId] || secId;
                  return `
                    <div style="display:flex;align-items:center;gap:8px;border:1px solid var(--border2);border-radius:10px;padding:8px 10px;background:var(--surface)">
                      <div style="font-size:12px;font-weight:800;min-width:160px">${title}</div>
                      <button class="btn btn-xs" onclick="cfgMenuRenameSec('${secId}')" title="이름 변경">✏️</button>
                      <select onchange="cfgMenuSetCat('${secId}', this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px">
                        ${cats.map(c=>`<option value="${c}"${c===cat?' selected':''}>${c}</option>`).join('')}
                      </select>
                      <span style="flex:1"></span>
                      <button class="btn btn-xs" onclick="cfgMenuMoveSec('${secId}','up')" ${i===0?'disabled':''}>▲</button>
                      <button class="btn btn-xs" onclick="cfgMenuMoveSec('${secId}','down')" ${i===secs.length-1?'disabled':''}>▼</button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('');
      })()}
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-b" onclick="cfgMenuReset()">기본 메뉴로 초기화</button>
        <button class="btn btn-p" onclick="cfgMenuReset();try{if(typeof showToast==='function')showToast('🤖 자동 정리 완료');}catch(e){}">🤖 자동 정리</button>
        <button class="btn btn-w" onclick="cfgMenuResetSecNames()">이름 변경 초기화</button>
      </div>
    </div>
  </details>
  ${_scfgD('imgsettings','🖼️ 이미지탭 이미지 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">이미지탭 ⚙️ 버튼과 동일한 설정입니다. 크기·밝기·배치·위치를 조절하면 즉시 반영됩니다.</div>
    <div id="cfg-b2-img-settings-wrap" style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;color:var(--gray-l)">로딩 중...</div>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px;padding:0 2px">※ 스트리머 상세 모달 이미지 설정은 아래 별도 항목에서 설정</div>
  </details>
  ${_scfgD('imgmodalsettings','🖼️ 스트리머 상세 이미지 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">스트리머 상세 모달의 이미지 크기·밝기를 설정합니다.</div>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">모바일/태블릿/PC 크기를 따로 저장합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:600">
        <input type="checkbox" id="cfg-img-fill" style="width:14px;height:14px"> 이미지 채우기 (cover) — 해제 시 맞춤 (contain)
      </label>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">기본 크기</label>
          <span id="cfg-img-scale-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>0.5x</span><span>2.0x</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">기본 밝기</label>
          <span id="cfg-img-brightness-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-brightness" min="0.3" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-brightness-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:2px"><span>0.3x</span><span>2.0x</span></div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">모바일 크기</label>
          <span id="cfg-img-scale-left-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-left" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-left-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">태블릿 크기</label>
          <span id="cfg-img-scale-tablet-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-tablet" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-tablet-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <label style="font-size:12px;font-weight:700;color:var(--text2)">PC 크기</label>
          <span id="cfg-img-scale-right-val" style="font-size:12px;font-weight:700;color:var(--blue)">1.0x</span>
        </div>
        <input type="range" id="cfg-img-scale-right" min="0.5" max="2" step="0.1" value="1" style="width:100%;accent-color:var(--blue)" oninput="document.getElementById('cfg-img-scale-right-val').textContent=parseFloat(this.value).toFixed(1)+'x'">
      </div>
      <button class="btn btn-b" onclick="saveImageSettings()" style="align-self:flex-start">💾 설정 저장</button>
    </div>
  </details>
  ${(typeof window.renderCfgProfileShapeCard==='function' ? window.renderCfgProfileShapeCard(_scfgD) : '')}
  ${_scfgD('matchdetail','🎮 경기 상세(팝업) 설정')}
    <div id="cfg-md-body"></div>
  </details>
  ${_scfgD('pdModeBadge','🎨 최근 경기 종목(종류) 배지 색상')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">스트리머 상세 → 최근 경기 기록의 “종목/종류” 배지 색상을 변경합니다.</div>
    <div id="cfg-pdmb-body"></div>
  </details>
  ${_scfgD('pd','🎨 스트리머 상세 스타일 설정')}
    <div id="cfg-pd-body"></div>
  </details>
  ${_scfgD('fab','🔘 플로팅(FAB) 버튼 탭 설정')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:14px">하단 FAB 버튼 클릭 시 이동할 탭을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">캘린더:</label>
        <select id="cfg-fab-cal" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="cal">📅 캘린더</option>
          <option value="stats">📊 통계</option>
          <option value="roulette">🎰 룰렛</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">대회:</label>
        <select id="cfg-fab-comp" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="comp">🏆 대회</option>
          <option value="pro">🏅 프로리그</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">대학대전:</label>
        <select id="cfg-fab-univm" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="univm">🏫 대학대전</option>
          <option value="ck">🏆 CK</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">개인전:</label>
        <select id="cfg-fab-ind" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="ind">👤 개인전</option>
          <option value="gj">⚔️ 끝장전</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">프로리그:</label>
        <select id="cfg-fab-pro" style="flex:1;max-width:200px;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
          <option value="pro">🏅 프로리그</option>
          <option value="comp">🏆 대회</option>
          <option value="stats">📊 통계</option>
        </select>
      </div>
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:10px">FAB 버튼 표시 설정</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <!-- 클릭/터치가 잘 안 잡히는 문제 방지: label 전체를 클릭 영역으로 사용 -->
        <label for="cfg-fab-hide-mobile" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--white);cursor:pointer;user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent">
          <input type="checkbox" id="cfg-fab-hide-mobile" onchange="saveFabVisibilitySettings()" style="width:22px;height:22px;accent-color:var(--blue);flex-shrink:0">
          <div style="font-size:13px;font-weight:800;color:var(--text2)">모바일에서 숨기기</div>
        </label>
        <label for="cfg-fab-hide-pc" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--white);cursor:pointer;user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent">
          <input type="checkbox" id="cfg-fab-hide-pc" onchange="saveFabVisibilitySettings()" style="width:22px;height:22px;accent-color:var(--blue);flex-shrink:0">
          <div style="font-size:13px;font-weight:800;color:var(--text2)">PC에서 숨기기</div>
        </label>
      </div>
    </div>
  </details>
  ${_scfgD('boardchip','🏷️ 현황판 칩/대학로고 크기')}
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">현황판 칩/대학 로고 관련 설정입니다. <b>스트리머 프로필 이미지 전역 배율</b>과는 별개로 동작합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📐 프로필 이미지 모양</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">프로필 이미지 모양(원형/네모)은 별도 메뉴에서 전역으로 설정합니다.</div>
        <button class="btn btn-w btn-xs" onclick="cfgGo('profileshape')">⚙️ 프로필 이미지 모양 설정 열기</button>
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📏 프로필 이미지 크기 <span id="cfg-bcp-size-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_bcp_size')||'26');}catch(e){return 26;}})()}px</span></div>
        <input type="range" min="16" max="56" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_bcp_size')||'26');}catch(e){return 26;}})()}" style="width:100%;accent-color:var(--blue)"
          oninput="boardChipPhotoSize=+this.value;saveBoardChipPhotoSettings();document.getElementById('cfg-bcp-size-val').textContent=this.value+'px';render()">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-l);margin-top:2px"><span>16px</span><span>56px</span></div>
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📦 레이아웃 크기 <span id="cfg-bcp-layout-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_bcp_layout')||'100');}catch(e){return 100;}})()}%</span></div>
        <input type="range" min="70" max="160" step="5" value="${(()=>{try{return parseInt(localStorage.getItem('su_bcp_layout')||'100');}catch(e){return 100;}})()}" style="width:100%;accent-color:var(--blue)"
          oninput="boardChipLayoutScale=+this.value;saveBoardChipPhotoSettings();document.getElementById('cfg-bcp-layout-val').textContent=this.value+'%';render()">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-l);margin-top:2px"><span>70%</span><span>160%</span></div>
      </div>
      <div style="border-top:1px dashed var(--border2);padding-top:12px">
        <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:10px">🏫 대학 로고 설정</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
          <div style="font-size:12px;font-weight:700;color:var(--text2);min-width:120px">프로필(로고) 모양</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn ${(()=>{try{return (localStorage.getItem('su_ul_shape')||'circle')==='circle'?'btn-b':'btn-w';}catch(e){return 'btn-b';}})()}"
              onclick="localStorage.setItem('su_ul_shape','circle');if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();render()">⭕ 원형</button>
            <button class="btn ${(()=>{try{return (localStorage.getItem('su_ul_shape')||'circle')==='square'?'btn-b':'btn-w';}catch(e){return 'btn-w';}})()}"
              onclick="localStorage.setItem('su_ul_shape','square');if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();render()">⬛ 네모</button>
          </div>
        </div>
        <div style="margin-bottom:10px">
          <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📏 대학 로고 이미지 크기 <span id="cfg-ul-size-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_ul_size')||'34');}catch(e){return 34;}})()}px</span></div>
          <input type="range" min="20" max="60" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_ul_size')||'34');}catch(e){return 34;}})()}" style="width:100%;accent-color:var(--blue)"
            oninput="localStorage.setItem('su_ul_size',String(this.value));if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();document.getElementById('cfg-ul-size-val').textContent=this.value+'px';render()">
        </div>
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📦 대학 로고 레이아웃 크기 <span id="cfg-ul-box-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_ul_box')||'46');}catch(e){return 46;}})()}px</span></div>
          <input type="range" min="34" max="72" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_ul_box')||'46');}catch(e){return 46;}})()}" style="width:100%;accent-color:var(--blue)"
            oninput="localStorage.setItem('su_ul_box',String(this.value));if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();document.getElementById('cfg-ul-box-val').textContent=this.value+'px';render()">
        </div>
        <div style="border-top:1px dashed var(--border2);padding-top:12px">
          <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:10px">🏛️ 대학 상세(모달) 로고 크기</div>
          <div style="margin-bottom:10px">
            <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📏 로고 이미지 크기 <span id="cfg-ul-size-d-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_ul_size_detail')||localStorage.getItem('su_ul_size')||'46');}catch(e){return 46;}})()}px</span></div>
            <input type="range" min="28" max="72" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_ul_size_detail')||localStorage.getItem('su_ul_size')||'46');}catch(e){return 46;}})()}" style="width:100%;accent-color:var(--blue)"
              oninput="localStorage.setItem('su_ul_size_detail',String(this.value));if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();document.getElementById('cfg-ul-size-d-val').textContent=this.value+'px';render()">
          </div>
          <div>
            <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📦 로고 박스 크기 <span id="cfg-ul-box-d-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_ul_box_detail')||localStorage.getItem('su_ul_box')||'72');}catch(e){return 72;}})()}px</span></div>
            <input type="range" min="48" max="110" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_ul_box_detail')||localStorage.getItem('su_ul_box')||'72');}catch(e){return 72;}})()}" style="width:100%;accent-color:var(--blue)"
              oninput="localStorage.setItem('su_ul_box_detail',String(this.value));if(typeof applyUnivLogoVars==='function')applyUnivLogoVars();document.getElementById('cfg-ul-box-d-val').textContent=this.value+'px';render()">
          </div>
        </div>
        <div style="border-top:1px dashed var(--border2);padding-top:12px">
          <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:10px">📊 현황판(대학별 신현황판) 대학 로고 크기</div>
          <div>
            <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📏 로고 크기 <span id="cfg-b2-ul-val" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_b2_univ_logo_size')||'42');}catch(e){return 42;}})()}px</span></div>
            <input type="range" min="28" max="72" step="2" value="${(()=>{try{return parseInt(localStorage.getItem('su_b2_univ_logo_size')||'42');}catch(e){return 42;}})()}" style="width:100%;accent-color:var(--blue)"
              oninput="localStorage.setItem('su_b2_univ_logo_size',String(this.value));if(typeof applyBoard2LogoVars==='function')applyBoard2LogoVars();document.getElementById('cfg-b2-ul-val').textContent=this.value+'px';render()">
          </div>
        </div>
      </div>
    </div>
  </details>
  ${_scfgD('oldbright','🎨 구현황판 카드 배경/라벨 밝기 조절')}
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">구현황판 카드의 배경과 라벨 밝기를 조절합니다. (구현황판 툴바에서도 조절 가능)</p>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">배경 밝기:</label>
        <input type="range" id="cfg-b2-bg-alpha" min="0" max="30" value="9" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('cfg-b2-bg-alpha-val').textContent=this.value+'%'">
        <span style="font-size:11px;color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="cfg-b2-bg-alpha-val">9%</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
        <label style="font-size:12px;font-weight:600;color:var(--text2);min-width:80px">라벨 밝기:</label>
        <input type="range" id="cfg-b2-label-alpha" min="0" max="40" value="16" style="flex:1;accent-color:var(--blue)" oninput="document.getElementById('cfg-b2-label-alpha-val').textContent=this.value+'%'">
        <span style="font-size:11px;color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="cfg-b2-label-alpha-val">16%</span>
      </div>
      <button class="btn btn-b" onclick="saveOldDashboardBrightness()">💾 저장</button>
    </div>
  </details>
  `;

  // 관리자 목록 + 맵 약자 목록 렌더링
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
      if(!accounts.length){listEl.innerHTML='<div style="font-size:12px;color:var(--gray-l)">등록된 계정 없음</div>';return;}
      listEl.innerHTML=accounts.map((a,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
          <span style="flex:1;font-size:13px;font-weight:600">${a.label||'(이름없음)'}</span>
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
          <span style="flex:1;font-weight:700;font-size:13px">${u.name}</span>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
          <button class="btn btn-xs btn-w" onclick="promptBoardBgImgUrl('${u.name.replace(/'/g,"\\'")}')">URL 설정</button>
          ${u.bgImg?`<button class="btn btn-xs btn-r" onclick="removeBoardBgImg('${u.name.replace(/'/g,"\\'")}')">삭제</button>`:''}
        </div>
        ${u.bgImg?`<div style="margin-top:8px">
          <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px">위치</div>
          <select onchange="setBoardBgImgPos('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
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
          <div style="font-size:11px;font-weight:600;color:var(--text2);margin-bottom:6px;margin-top:8px">크기</div>
          <select onchange="setBoardBgImgSize('${u.name.replace(/'/g,"\\'")}',this.value)" style="padding:4px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px">
            <option value="auto" ${(!u.bgImgSize||u.bgImgSize==='auto')?' selected':''}>자동 (브라우저/카드 맞춤)</option>
            <option value="cover" ${u.bgImgSize==='cover'?' selected':''}>채우기 (cover)</option>
            <option value="contain" ${u.bgImgSize==='contain'?' selected':''}>맞춤 (contain)</option>
            <option value="fill" ${u.bgImgSize==='fill'?' selected':''}>늘리기 (fill)</option>
          </select>
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
    try{ if(typeof window.cfgApplySimpleView==='function') window.cfgApplySimpleView(); }catch(e){}
    try{ if(typeof window.cfgApplyBottomSectionsVisibility==='function') window.cfgApplyBottomSectionsVisibility(); }catch(e){}
    // 펨코현황 설정 초기화
    try{ if(typeof cfgFemcoInit==='function') cfgFemcoInit(); }catch(e){}
    // 자동인식 출력 포맷 미리보기 초기화
    try{ if(typeof cfgAutoOutfmtRefreshPreview==='function') cfgAutoOutfmtRefreshPreview(); }catch(e){}
    // 경기 상세/스트리머 상세 스타일 섹션 내용 항상 렌더링 (펼침 여부 무관)
    try{ if(typeof _renderCfgMatchDetailSection==='function') _renderCfgMatchDetailSection(); }catch(e){}
    try{ if(typeof _renderCfgPdSection==='function') _renderCfgPdSection(); }catch(e){}
  },50);
  C.innerHTML=h;
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
