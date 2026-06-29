// ══════════════════════════════════════════════════════════
// settings-render-tourneycard.js — 대회카드/H2H/프로리그 설정 섹션
// settings-render.js 에서 분리됨
// ══════════════════════════════════════════════════════════

window.renderCfgTourneyCardSection = function(_scfgD) {
  const localStorage = (function(){try{const ls=window.localStorage;const k='__su_ls_test__';ls.setItem(k,'1');ls.removeItem(k);return ls;}catch(e){return{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};} })();
  const _tcOn = (localStorage.getItem('su_tc_theme_on') ?? '0') === '1';
  const _tcAccent = (localStorage.getItem('su_tc_accent_mode') ?? 'none');
  const _tcHd = parseInt(localStorage.getItem('su_tc_hd_alpha') ?? '12',10) || 12;
  const _tcBw = parseInt(localStorage.getItem('su_tc_border_w') ?? '4',10) || 4;
  const _tcIc = parseInt(localStorage.getItem('su_tc_uicon') ?? '34',10) || 34;
  const _tcLw = parseInt(localStorage.getItem('su_tc_line_w') ?? '2',10) || 2;
  const _tcLa = parseInt(localStorage.getItem('su_tc_line_a') ?? '70',10) || 70;
  const _tcPreset = (localStorage.getItem('su_tc_preset') ?? '기본');
  const _dateMenuStyle = (localStorage.getItem('su_date_menu_style') ?? 'pill');
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
        <select id="cfg-tc-preset" onchange="localStorage.setItem('su_tc_preset',this.value);cfgApplyBracketPreset(this.value);try{if(typeof window.cfgTouchPrefsSync==="function")window.cfgTouchPrefsSync();}catch(e){}" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
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
        <div style="font-size:11px;color:var(--text3);font-weight:800">스코어 크기(대회탭 조별/토너)</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">PC</span>
          <input type="range" id="cfg-tc-score-pc" min="50" max="150" step="5"
            value="${(()=>{try{return Math.max(50,Math.min(150,parseInt(localStorage.getItem('su_tc_score_scale_pc')||'82',10)||82));}catch(e){return 82;}})(  )}"
            oninput="document.getElementById('cfg-tc-score-pc-v').textContent=this.value+'%'" onchange="cfgSetTcScoreScale()" style="width:140px">
          <span id="cfg-tc-score-pc-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${(()=>{try{return Math.max(50,Math.min(150,parseInt(localStorage.getItem('su_tc_score_scale_pc')||'82',10)||82));}catch(e){return 82;}})(  )}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-tc-score-mb" min="50" max="150" step="5"
            value="${(()=>{try{return Math.max(50,Math.min(150,parseInt(localStorage.getItem('su_tc_score_scale_mb')||'75',10)||75));}catch(e){return 75;}})(  )}"
            oninput="document.getElementById('cfg-tc-score-mb-v').textContent=this.value+'%'" onchange="cfgSetTcScoreScale()" style="width:140px">
          <span id="cfg-tc-score-mb-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${(()=>{try{return Math.max(50,Math.min(150,parseInt(localStorage.getItem('su_tc_score_scale_mb')||'75',10)||75));}catch(e){return 75;}})(  )}%</span>
        </div>
        <span style="font-size:11px;color:var(--gray-l)">※ 대회탭 조별리그/토너 기록카드 스코어 크기</span>
      </div>

            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">대학 ↔ 스코어 간격(대회탭)</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">PC</span>
        <input type="range" id="cfg-tc-gap-pc" min="0" max="120" step="1"
            value="${Math.max(0,Math.min(120,parseInt(localStorage.getItem('su_tc_vs_gap_pc')||'12',10)||12))}"
            oninput="document.getElementById('cfg-tc-gap-pc-v').textContent=this.value+'px'" onchange="cfgSetTourneyVsGapSettings()" style="width:140px">
          <span id="cfg-tc-gap-pc-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(0,Math.min(120,parseInt(localStorage.getItem('su_tc_vs_gap_pc')||'12',10)||12))}px</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-tc-gap-mb" min="0" max="120" step="1"
            value="${Math.max(0,Math.min(120,parseInt(localStorage.getItem('su_tc_vs_gap_mb')||'8',10)||8))}"
            oninput="document.getElementById('cfg-tc-gap-mb-v').textContent=this.value+'px'" onchange="cfgSetTourneyVsGapSettings()" style="width:140px">
          <span id="cfg-tc-gap-mb-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(0,Math.min(120,parseInt(localStorage.getItem('su_tc_vs_gap_mb')||'8',10)||8))}px</span>
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
  </details>` +
  (()=>{ 
    const pc = parseInt(localStorage.getItem('su_h2h_panel_pc')||'150',10)||150;
    const mb = parseInt(localStorage.getItem('su_h2h_panel_mb')||'126',10)||126;
    const fit = (localStorage.getItem('su_h2h_panel_fit')||'cover');
    const gpc = parseInt(localStorage.getItem('su_h2h_score_gap_pc')||'10',10)||10;
    const gmb = parseInt(localStorage.getItem('su_h2h_score_gap_mb')||'8',10)||8;
    const spc = parseInt(localStorage.getItem('su_h2h_score_pad_pc')||'10',10)||10;
    const smb = parseInt(localStorage.getItem('su_h2h_score_pad_mb')||'6',10)||6;
    return _scfgD('h2hpanel','🎮 개인전/끝장전(프로리그 끝장전) 카드') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">대전기록 탭의 개인전/끝장전/프로리그 끝장전 카드에서 선수 패널(프로필 배경 카드) 크기와 이미지 맞춤을 설정합니다.</div>

    <div style="padding:14px;background:var(--surface);border:1px solid var(--blue);border-radius:12px;margin-bottom:10px">
      <div style="font-size:12px;font-weight:900;color:var(--blue);margin-bottom:10px">🃏 카드 디자인 모드</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">개인전/끝장전/프로리그 끝장전 기록카드의 전체 레이아웃 스타일을 선택합니다.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${(()=>{
          const _cur = localStorage.getItem('su_h2h_card_mode')||'panel';
          const _modes = [
            {v:'panel',   icon:'🎴', l:'패널형',   desc:'프로필 배경사진 패널'},
            {v:'banner',  icon:'🖼️', l:'배너형',   desc:'좌우 배경 분할 배너'},
            {v:'minimal', icon:'➖', l:'미니멀',   desc:'아바타+텍스트, 깔끔'},
            {v:'photo',   icon:'📸', l:'사진전체', desc:'전면 배경사진 오버레이'},
            {v:'classic', icon:'📋', l:'클래식',   desc:'텍스트 위주 심플'},
            {v:'stack',   icon:'🧱', l:'스택',     desc:'상단 라인+중앙 스코어'},
            {v:'duotone', icon:'🎨', l:'듀오톤',   desc:'양쪽 컬러 패널'},
            {v:'split',   icon:'🌓', l:'스플릿',   desc:'연한 컬러 분할'},
            {v:'glass',   icon:'🫧', l:'글래스',   desc:'유리 패널(블러)'},
            {v:'pill',    icon:'💊', l:'필',       desc:'캡슐형 배너'},
            {v:'bar',     icon:'📊', l:'바',       desc:'승률 바 표시'},
            {v:'outline', icon:'🧩', l:'아웃라인', desc:'테두리 카드'},
            {v:'ribbon',  icon:'🎀', l:'리본',     desc:'승리 리본 강조'},
            {v:'grid',    icon:'🔲', l:'그리드',   desc:'아바타 그리드'},
            {v:'poster',  icon:'🎬', l:'포스터',   desc:'시네마틱 오버레이'},
            {v:'battle',  icon:'⚔️', l:'배틀',     desc:'사선분할 대결모드'},
            {v:'neon',    icon:'🌟', l:'네온',     desc:'다크+형광 대결모드'},
          ];
          // SVG 미니 미리보기 생성
          const _cardSvgPreview = (v)=>{
            const c1='#3b82f6', c2='#ef4444', w=80, h=44;
            const sb = `viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="display:block;width:${w}px;height:${h}px;border-radius:6px;overflow:hidden"`;
            if(v==='battle') return `<svg ${sb}><rect x="0" y="0" width="${w/2}" height="${h}" fill="${c1}cc"/><rect x="${w/2}" y="0" width="${w/2}" height="${h}" fill="${c2}cc"/><polygon points="${w/2-10},0 ${w/2+10},0 ${w/2+10},${h} ${w/2-10},${h}" fill="rgba(0,0,0,.3)"/><rect x="0" y="0" width="${Math.round(w*0.6)}" height="4" fill="${c1}"/><rect x="${Math.round(w*0.6)}" y="0" width="${Math.round(w*0.4)}" height="4" fill="${c2}"/><text x="40" y="${h/2+5}" text-anchor="middle" font-size="13" font-weight="900" fill="white">3:2</text></svg>`;
            if(v==='neon') return `<svg ${sb}><rect width="${w}" height="${h}" fill="#0a0f1e"/><circle cx="20" cy="${h/2}" r="18" fill="${c1}18"/><circle cx="60" cy="${h/2}" r="18" fill="${c2}18"/><circle cx="18" cy="${h/2}" r="9" fill="none" stroke="${c1}" stroke-width="1.5"/><circle cx="62" cy="${h/2}" r="9" fill="none" stroke="${c2}" stroke-width="1.5"/><text x="40" y="${h/2+5}" text-anchor="middle" font-size="11" font-weight="900" fill="white">3:2</text><rect x="0" y="${h-3}" width="${Math.round(w*0.6)}" height="3" fill="${c1}" opacity=".8"/><rect x="${Math.round(w*0.6)}" y="${h-3}" width="${Math.round(w*0.4)}" height="3" fill="${c2}" opacity=".8"/></svg>`;
            if(v==='duotone') return `<svg ${sb}><rect x="0" y="0" width="33" height="${h}" fill="${c1}dd"/><rect x="47" y="0" width="33" height="${h}" fill="${c2}dd"/><rect x="33" y="0" width="14" height="${h}" fill="white"/><text x="40" y="${h/2+4}" text-anchor="middle" font-size="9" font-weight="900" fill="#475569">3:2</text></svg>`;
            if(v==='banner') return `<svg ${sb}><rect x="0" y="0" width="36" height="${h}" fill="${c1}bb"/><rect x="44" y="0" width="36" height="${h}" fill="${c2}bb"/><rect x="33" y="0" width="14" height="${h}" fill="white"/><text x="40" y="${h/2+4}" text-anchor="middle" font-size="9" font-weight="900" fill="#475569">3:2</text></svg>`;
            if(v==='poster') return `<svg ${sb}><rect width="${w}" height="${h}" fill="#1e293b"/><rect x="4" y="6" width="30" height="${h-12}" rx="8" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.2)" stroke-width="1"/><rect x="46" y="6" width="30" height="${h-12}" rx="8" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.2)" stroke-width="1"/><text x="40" y="${h/2+5}" text-anchor="middle" font-size="11" font-weight="900" fill="white">3:2</text></svg>`;
            const _mm = _modes.find(x=>x && x.v===v) || {icon:'🎴', l:String(v||'')};
            return `<svg ${sb}><rect width="${w}" height="${h}" fill="#f1f5f9"/><text x="40" y="${h/2+4}" text-anchor="middle" font-size="9" fill="#64748b">${_mm.icon}</text><text x="40" y="${h/2+16}" text-anchor="middle" font-size="8" fill="#94a3b8">${_mm.l}</text></svg>`;
          };
          const _newModes = ['battle','neon'];
          return _modes.map(m=>`<button type="button"
            onclick="localStorage.setItem('su_h2h_card_mode','${m.v}');try{render();}catch(e){};" 
            title="${m.desc}"
            style="display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 8px 6px;border-radius:10px;font-size:10px;font-weight:900;cursor:pointer;border:2px solid ${_cur===m.v?'var(--blue)':'var(--border2)'};background:${_cur===m.v?'#eff6ff':'var(--white)'};color:${_cur===m.v?'var(--blue)':'var(--text2)'};min-width:80px;transition:all .15s;position:relative">
            ${_newModes.includes(m.v)?`<span style="position:absolute;top:-7px;right:-5px;font-size:7px;font-weight:900;padding:1px 4px;border-radius:99px;background:#ef4444;color:white">NEW</span>`:''}
            ${_cardSvgPreview(m.v)}
            <span style="font-weight:900;font-size:11px">${m.icon} ${m.l}</span>
            <span style="font-size:8px;font-weight:700;color:${_cur===m.v?'var(--blue)':'var(--gray-l)'}">${m.desc}</span>
          </button>`).join('');
        })()}
      </div>
      <div style="margin-top:10px;font-size:11px;color:var(--gray-l)">※ 패널형·배너형·사진전체 모드는 아래 이미지 설정이 함께 적용됩니다.</div>
    </div>

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
        <input type="range" id="cfg-h2h-gap-pc" min="0" max="120" step="1" value="${Math.max(0,Math.min(120,gpc))}"
          oninput="document.getElementById('cfg-h2h-gap-pc-v').textContent=this.value+'px'" onchange="cfgSetH2HPanelSettings()" style="width:100%">
        <div id="cfg-h2h-gap-pc-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(0,Math.min(120,gpc))}px</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">모바일 간격</div>
        <input type="range" id="cfg-h2h-gap-mb" min="0" max="120" step="1" value="${Math.max(0,Math.min(120,gmb))}"
          oninput="document.getElementById('cfg-h2h-gap-mb-v').textContent=this.value+'px'" onchange="cfgSetH2HPanelSettings()" style="width:100%">
        <div id="cfg-h2h-gap-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(0,Math.min(120,gmb))}px</div>
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
  </details>`
  })() +
  (()=>{ 
    const pc = parseInt(localStorage.getItem('su_procomp_avatar_pc')||'52',10)||52;
    const mb = parseInt(localStorage.getItem('su_procomp_avatar_mb')||'40',10)||40;
    const fit = (localStorage.getItem('su_procomp_avatar_fit')||'cover');
    const spc = parseInt(localStorage.getItem('su_procomp_score_scale_pc')||'100',10)||100;
    const smb = parseInt(localStorage.getItem('su_procomp_score_scale_mb')||'100',10)||100;
    const lpc = parseInt(localStorage.getItem('su_procomp_layout_scale_pc')||'100',10)||100;
    const lmb = parseInt(localStorage.getItem('su_procomp_layout_scale_mb')||'100',10)||100;
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
        <input type="range" id="cfg-procomp-ava-pc" min="28" max="200" step="2" value="${Math.max(28,Math.min(200,pc))}"
          oninput="document.getElementById('cfg-procomp-ava-pc-v').textContent=this.value+'px'"
          onchange="cfgSetProCompAvatarSettings()" style="width:100%">
        <div id="cfg-procomp-ava-pc-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(28,Math.min(200,pc))}px</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">모바일</div>
        <input type="range" id="cfg-procomp-ava-mb" min="24" max="160" step="2" value="${Math.max(24,Math.min(160,mb))}"
          oninput="document.getElementById('cfg-procomp-ava-mb-v').textContent=this.value+'px'"
          onchange="cfgSetProCompAvatarSettings()" style="width:100%">
        <div id="cfg-procomp-ava-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(24,Math.min(160,mb))}px</div>
      </div>
      <div style="height:1px;background:var(--border);margin:2px 0"></div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">스코어(PC)</div>
        <input type="range" id="cfg-procomp-score-pc" min="60" max="160" step="5" value="${Math.max(60,Math.min(160,spc))}"
          oninput="document.getElementById('cfg-procomp-score-pc-v').textContent=this.value+'%'" onchange="cfgSetProCompScoreSettings()" style="width:100%">
        <div id="cfg-procomp-score-pc-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(60,Math.min(160,spc))}%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">스코어(모바일)</div>
        <input type="range" id="cfg-procomp-score-mb" min="60" max="160" step="5" value="${Math.max(60,Math.min(160,smb))}"
          oninput="document.getElementById('cfg-procomp-score-mb-v').textContent=this.value+'%'" onchange="cfgSetProCompScoreSettings()" style="width:100%">
        <div id="cfg-procomp-score-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(60,Math.min(160,smb))}%</div>
      </div>
      <div style="height:1px;background:var(--border);margin:2px 0"></div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">레이아웃(PC)</div>
        <input type="range" id="cfg-procomp-layout-pc" min="60" max="120" step="5" value="${Math.max(60,Math.min(120,lpc))}"
          oninput="document.getElementById('cfg-procomp-layout-pc-v').textContent=this.value+'%'" onchange="cfgSetProCompLayoutSettings()" style="width:100%">
        <div id="cfg-procomp-layout-pc-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(60,Math.min(120,lpc))}%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">레이아웃(모바일)</div>
        <input type="range" id="cfg-procomp-layout-mb" min="60" max="120" step="5" value="${Math.max(60,Math.min(120,lmb))}"
          oninput="document.getElementById('cfg-procomp-layout-mb-v').textContent=this.value+'%'" onchange="cfgSetProCompLayoutSettings()" style="width:100%">
        <div id="cfg-procomp-layout-mb-v" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${Math.max(60,Math.min(120,lmb))}%</div>
      </div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6">
        ※ 값 변경 후 자동으로 재렌더링됩니다. 레이아웃은 카드 전체 여백/크기(프로필 카드 포함)를 함께 줄입니다.
      </div>
    </div>
  </details>`
  })() +
  (typeof window.renderCfgMiniCardSection==='function' ? window.renderCfgMiniCardSection(_scfgD) : '') +
  (typeof window.renderCfgUnivCKCardSection==='function' ? window.renderCfgUnivCKCardSection(_scfgD) : '') +
  (typeof window.renderCfgUnivMCardSection==='function' ? window.renderCfgUnivMCardSection(_scfgD) : '') +
  (typeof window.renderCfgTierTourCardSection==='function' ? window.renderCfgTierTourCardSection(_scfgD) : '') +
  (typeof window.renderCfgTierTourLeagueCardSection==='function' ? window.renderCfgTierTourLeagueCardSection(_scfgD) : '') +
  (typeof window.renderCfgTierTourBrackCardSection==='function' ? window.renderCfgTierTourBrackCardSection(_scfgD) : '') +
  (typeof window.renderCfgProCompLeagueCardSection==='function' ? window.renderCfgProCompLeagueCardSection(_scfgD) : '') +
  (typeof window.renderCfgProCompTourCardSection==='function' ? window.renderCfgProCompTourCardSection(_scfgD) : '') +
  (typeof window.renderCfgProCompTeamCardSection==='function' ? window.renderCfgProCompTeamCardSection(_scfgD) : '') +
  (typeof window.buildShareCardSettingsSection==='function' ? window.buildShareCardSettingsSection(_scfgD) : '');
};
