// ══════════════════════════════════════════════════════════
// settings-render-reccard.js — 기록카드/대회카드/H2H/프로리그카드 설정 섹션
// settings-render.js 에서 분리됨
// 의존: settings-render.js (_scfgD 인자로 전달)
// ══════════════════════════════════════════════════════════

window.renderCfgRecCardSection = function(_scfgD) {
  const localStorage = (function(){try{const ls=window.localStorage;const k='__su_ls_test__';ls.setItem(k,'1');ls.removeItem(k);return ls;}catch(e){return{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};} })();
  const _rcOn = (localStorage.getItem('su_rc_theme_on') ?? '1') === '1';
  const _rcAccent = (localStorage.getItem('su_rc_accent_mode') ?? 'none');
  const _rcBg = parseInt(localStorage.getItem('su_rc_bg_alpha') ?? '12',10) || 12;
  const _rcHd = parseInt(localStorage.getItem('su_rc_hd_alpha') ?? '14',10) || 14;
  const _rcIc = parseInt(localStorage.getItem('su_rc_uicon') ?? '24',10) || 24;
  const _rcUnivFont = parseInt(localStorage.getItem('su_rc_univ_font_pct') ?? '110',10) || 110;
  const _ymScale = parseInt(localStorage.getItem('su_ym_scale_pct') ?? '100',10) || 100;
  const _rcMemoOn = (localStorage.getItem('su_rc_memo_on') ?? '0') === '1';
  const _avaScale = Math.round((parseFloat(localStorage.getItem('su_avatar_scale') ?? '1') || 1) * 100);
  const _sfxOn = (localStorage.getItem('su_rec_side_fx_on') || '1') !== '0';
  const _sfxMode = localStorage.getItem('su_rec_side_fx_mode') || 'soft';
  const _sfxInt = Math.max(20,Math.min(100,parseInt(localStorage.getItem('su_rec_side_fx_intensity')||'68',10)||68));
  const _sfxLen = Math.max(4,Math.min(80,parseInt(localStorage.getItem('su_rec_side_fx_length')||'25',10)||25));
  const _sfxTail = Math.max(0,Math.min(140,parseInt(localStorage.getItem('su_rec_side_fx_tail')||'28',10)||28));
  const _sfxSoft = Math.max(0,Math.min(100,parseInt(localStorage.getItem('su_rec_side_fx_softness')||'52',10)||52));
  const _sfxEdge = Math.max(2,Math.min(24,parseInt(localStorage.getItem('su_rec_side_fx_edge')||'8',10)||8));
  return _scfgD('reccard','🧾 기록 카드(기록탭) 스타일') + `
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
        <div style="font-size:11px;color:var(--text3);font-weight:800">카드 모양</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
          ${(function(){
            const _curShape = localStorage.getItem('su_rc_card_shape') || 'default';
            const _all = [
              {v:'default',       l:'기본',      icon:'🃏', desc:'기본 둥근 카드'},
              {v:'compact',       l:'컴팩트',    icon:'📋', desc:'패딩 축소, 밀도 높게'},
              {v:'wide',          l:'와이드',    icon:'🖼️', desc:'넓고 여유로운 카드'},
              {v:'minimal',       l:'미니멀',    icon:'➖', desc:'테두리 없음, 구분선만'},
              {v:'timeline',      l:'타임라인',  icon:'📅', desc:'왼쪽 색선 강조'},

              {v:'glass',         l:'유리',      icon:'🔮', desc:'반투명 유리 효과'},
              {v:'frosted',       l:'프로스트',  icon:'❄️', desc:'세련된 frosted glass'},
              {v:'floating',      l:'플로팅',    icon:'🎈', desc:'둥실 떠오르는 그림자'},
              {v:'soft-round',    l:'소프트',    icon:'🫧', desc:'더 둥글고 부드러운 카드'},
              {v:'deep',          l:'딥쉐도우',  icon:'🕳️', desc:'깊은 그림자 강조'},

              {v:'card3d',        l:'3D 카드',   icon:'🎴', desc:'입체 그림자 효과'},
              {v:'neon',          l:'네온',      icon:'⚡', desc:'네온 발광 테두리'},
              {v:'stripe',        l:'스트라이프', icon:'🟦', desc:'왼쪽 컬러 스트라이프'},
              {v:'gradient-bg',   l:'그라데이션', icon:'🌈', desc:'모드 컬러 그라데이션 배경'},
              {v:'shadow-left',   l:'사이드 쉐도우', icon:'🌗', desc:'측면 강조 그림자'},
              {v:'inset',         l:'인셋',      icon:'🧊', desc:'안쪽 테두리(inset)'},
              {v:'topline',       l:'탑라인',    icon:'⬆️', desc:'상단 컬러 바'},
              {v:'split-bg',      l:'스플릿BG',  icon:'🌓', desc:'좌측 컬러 틴트 분할'},
              {v:'underline',     l:'언더라인',  icon:'📏', desc:'하단 컬러 라인'},

              {v:'retro',         l:'레트로',    icon:'🕹️', desc:'복고풍 진한 테두리'},
              {v:'paper',         l:'페이퍼',    icon:'📄', desc:'종이 텍스처 느낌'},
              {v:'terminal',      l:'터미널',    icon:'⌨️', desc:'모노톤 콘솔 스타일'},
              {v:'double',        l:'이중선',    icon:'🧷', desc:'테두리 이중 라인'},
              {v:'bold-border',   l:'굵은선',    icon:'🖊️', desc:'컬러 두꺼운 테두리'},
              {v:'comic',         l:'코믹',      icon:'💥', desc:'굵은 테두리+툰 느낌'},
              {v:'bubble',        l:'버블',      icon:'💬', desc:'크고 둥근 버블형'},
              {v:'pill',          l:'알약형',    icon:'💊', desc:'완전 둥근 알약 카드'},

              {v:'sharp',         l:'각진',      icon:'▬',  desc:'직각 카드'},
              {v:'bevel',         l:'베벨',      icon:'🔻', desc:'대각 모서리 베벨 느낌'},
              {v:'cut-corner',    l:'컷코너',    icon:'✂️', desc:'모서리 컷(clip-path)'},
              {v:'notch',         l:'노치',      icon:'🧩', desc:'노치 코너 카드'},
              {v:'ticket',        l:'티켓',      icon:'🎟️', desc:'점선 티켓 스타일'},
              {v:'stamp',         l:'스탬프',    icon:'📮', desc:'점선+스탬프 느낌'},
              {v:'scallop',       l:'스캘럽',    icon:'🪡', desc:'톱니/스캘럽 가장자리'},
              {v:'tab',           l:'탭',        icon:'🔖', desc:'상단 탭이 있는 카드'},
              {v:'tag',           l:'태그',      icon:'🏷️', desc:'꼬리표(tag) 모양'},
              {v:'ribbon',        l:'리본',      icon:'🎗️', desc:'양쪽 리본 컷'},
              {v:'badge',         l:'배지',      icon:'🏅', desc:'옥타곤 배지형'},
              {v:'hex',           l:'육각',      icon:'⬢',  desc:'육각형 클립'},
              {v:'slant',         l:'사선',      icon:'⟋',  desc:'사선(평행사변형)'},
              {v:'wave',          l:'웨이브',    icon:'🌊', desc:'물결형 실루엣'},
              {v:'bracket',       l:'브라켓',    icon:'⟦⟧', desc:'중앙 홈(브라켓) 형태'},
              {v:'shield',        l:'실드',      icon:'🛡️', desc:'하단 뾰족(방패)'},
              {v:'bookmark',      l:'북마크',    icon:'🔻', desc:'하단 접힌 북마크'},
              {v:'hourglass',     l:'모래시계',  icon:'⌛', desc:'양옆 중앙이 들어간 형태'},
              {v:'zigzag',        l:'지그재그',  icon:'〰️', desc:'상/하단 지그재그'},
              {v:'burst',         l:'버스트',    icon:'💢', desc:'가시/스파이크 형태'},
              {v:'cloud',         l:'클라우드',  icon:'☁️', desc:'둥근 물결(구름)'},
              // ── 스포츠 대결 전용 카드 모양 ──
              {v:'versus-card',    l:'VS 대결',    icon:'⚔️', desc:'양측 사선 대결 컷'},
              {v:'thunder-card',   l:'번개 카드',  icon:'⚡', desc:'번개 사선 분리형'},
              {v:'esports-card',   l:'e스포츠',    icon:'🎮', desc:'e스포츠 경기 카드'},
              {v:'arena-card',     l:'아레나',     icon:'🏟️', desc:'경기장 테두리 강조'},
              {v:'crown-card',     l:'왕관 카드',  icon:'👑', desc:'상단 왕관 포인트'},
              {v:'championship',   l:'챔피언십',   icon:'🏆', desc:'금장 챔피언십 카드'},
              {v:'knockout',       l:'녹아웃',     icon:'🥊', desc:'격투 대결 스타일'},
              {v:'blitz',          l:'블리츠',     icon:'⚡', desc:'스피드 블리츠 카드'},
              {v:'rivalry',        l:'라이벌',     icon:'🔥', desc:'불꽃 라이벌 대결'},
              {v:'champion-frame', l:'챔프 프레임',icon:'🥇', desc:'금색 챔피언 액자'},
              {v:'playoff',        l:'플레이오프',  icon:'🎯', desc:'플레이오프 토너먼트'},
              {v:'matchup',        l:'매치업',     icon:'🏅', desc:'정면 대결 매치업'},
            ];
            const byV = Object.create(null);
            _all.forEach(s=>{ byV[s.v]=s; });

            const groups = [
              {t:'기본/레이아웃', keys:['default','compact','wide','minimal','timeline']},
              {t:'세련/모던', keys:['glass','frosted','floating','soft-round','deep']},
              {t:'포인트/효과', keys:['card3d','neon','stripe','gradient-bg','shadow-left','inset','topline','split-bg','underline']},
              {t:'귀엽/레트로', keys:['bubble','comic','retro','paper','terminal','double','bold-border','pill']},
              {t:'⚔️ 스포츠 대결', keys:['versus-card','thunder-card','esports-card','arena-card','crown-card','championship','knockout','blitz','rivalry','champion-frame','playoff','matchup']},
              {t:'특수 실루엣', keys:['sharp','bevel','cut-corner','notch','ticket','stamp','scallop','tab','tag','ribbon','badge','hex','slant','wave','bracket','shield','bookmark','hourglass','zigzag','burst','cloud']},
            ];

            const btn = (s)=>`<button type="button"
              onclick="if(typeof cfgSetRecCardShape==='function')cfgSetRecCardShape('${s.v}');try{render();}catch(e){}"
              title="${s.desc}"
              style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:900;cursor:pointer;border:1.5px solid ${_curShape===s.v?'var(--blue)':'var(--border2)'};background:${_curShape===s.v?'#eff6ff':'var(--white)'};color:${_curShape===s.v?'var(--blue)':'var(--text2)'}"
            >${s.icon} ${s.l}</button>`;

            return groups.map(g=>{
              const items = g.keys.map(k=>byV[k]).filter(Boolean);
              if(!items.length) return '';
              return `<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:2px 0">
                <span style="padding:3px 8px;border-radius:999px;background:var(--surface);border:1px solid var(--border);font-size:10px;font-weight:900;color:var(--text3)">${g.t}</span>
                ${items.map(btn).join('')}
              </div>`;
            }).join('');
          })()}
        </div>
        <span style="font-size:11px;color:var(--gray-l)">카드 레이아웃/모양을 변경합니다</span>
      </div>

      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">스코어/좌우 배치(PC)</div>
        <select id="cfg-rc-vs-align" onchange="cfgSetRecCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="left" ${(localStorage.getItem('su_rc_vs_align')||'center')==='left'?'selected':''}>좌측</option>
          <option value="center" ${(localStorage.getItem('su_rc_vs_align')||'center')==='center'?'selected':''}>가운데</option>
          <option value="right" ${(localStorage.getItem('su_rc_vs_align')||'center')==='right'?'selected':''}>우측</option>
        </select>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-size:11px;color:var(--text3);font-weight:800">스코어 크기(기록탭·대학전·프로리그·티어)</span>
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">공통(PC/모바일)</span>
          <input type="range" id="cfg-rc-score-scale" min="50" max="130" step="5" value="${(()=>{try{return Math.max(50,Math.min(130,parseInt(localStorage.getItem('su_rc_score_scale')||'88',10)||88));}catch(e){return 88;}})(  )}" oninput="document.getElementById('cfg-rc-score-scale-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:140px">
          <span id="cfg-rc-score-scale-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${(()=>{try{return Math.max(50,Math.min(130,parseInt(localStorage.getItem('su_rc_score_scale')||'88',10)||88));}catch(e){return 88;}})(  )}%</span>
        </div>
      </div>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">레이아웃 크기(기록 카드)</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">PC</span>
          <input type="range" id="cfg-rc-layout-pc" min="60" max="120" step="5"
            value="${Math.max(60,Math.min(120,parseInt(localStorage.getItem('su_rc_layout_scale_pc')||'100',10)||100))}"
            oninput="document.getElementById('cfg-rc-layout-pc-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:140px">
          <span id="cfg-rc-layout-pc-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(60,Math.min(120,parseInt(localStorage.getItem('su_rc_layout_scale_pc')||'100',10)||100))}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-rc-layout-mb" min="60" max="120" step="5"
            value="${Math.max(60,Math.min(120,parseInt(localStorage.getItem('su_rc_layout_scale_mb')||'100',10)||100))}"
            oninput="document.getElementById('cfg-rc-layout-mb-v').textContent=this.value+'%'" onchange="cfgSetRecCardSettings()" style="width:140px">
          <span id="cfg-rc-layout-mb-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(60,Math.min(120,parseInt(localStorage.getItem('su_rc_layout_scale_mb')||'100',10)||100))}%</span>
        </div>
        <span style="font-size:11px;color:var(--gray-l)">※ 카드 여백/칩/스코어 박스 등 전반을 함께 줄입니다</span>
      </div>

      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">스코어 숫자 색상(공통)</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">승</span>
          <input type="color" id="cfg-score-win" value="${(()=>{try{return (localStorage.getItem('su_score_win')||'#dc2626');}catch(e){return '#dc2626';}})()}" onchange="cfgSetScoreColors()" style="width:36px;height:28px;border:1px solid var(--border2);border-radius:8px;cursor:pointer;padding:2px;background:none">
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">패</span>
          <input type="color" id="cfg-score-lose" value="${(()=>{try{return (localStorage.getItem('su_score_lose')||'#2563eb');}catch(e){return '#2563eb';}})()}" onchange="cfgSetScoreColors()" style="width:36px;height:28px;border:1px solid var(--border2);border-radius:8px;cursor:pointer;padding:2px;background:none">
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
          <input type="range" id="cfg-mbtn-pc" min="40" max="220" step="5"
            value="${Math.max(40,Math.min(220,parseInt(localStorage.getItem('su_match_btn_scale_pc')||'100',10)||100))}"
            oninput="document.getElementById('cfg-mbtn-pc-v').textContent=this.value+'%'" onchange="cfgSetMatchBtnScaleSettings()" style="width:140px">
          <span id="cfg-mbtn-pc-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(40,Math.min(220,parseInt(localStorage.getItem('su_match_btn_scale_pc')||'100',10)||100))}%</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-mbtn-mb" min="40" max="220" step="5"
            value="${Math.max(40,Math.min(220,parseInt(localStorage.getItem('su_match_btn_scale_mb')||'100',10)||100))}"
            oninput="document.getElementById('cfg-mbtn-mb-v').textContent=this.value+'%'" onchange="cfgSetMatchBtnScaleSettings()" style="width:140px">
          <span id="cfg-mbtn-mb-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(40,Math.min(220,parseInt(localStorage.getItem('su_match_btn_scale_mb')||'100',10)||100))}%</span>
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
          <input type="range" id="cfg-rc-gap-pc" min="0" max="120" step="1"
            value="${Math.max(0,Math.min(120,parseInt(localStorage.getItem('su_rc_vs_gap_pc')||'12',10)||12))}"
            oninput="document.getElementById('cfg-rc-gap-pc-v').textContent=this.value+'px'" onchange="cfgSetRecVsGapSettings()" style="width:140px">
          <span id="cfg-rc-gap-pc-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(0,Math.min(120,parseInt(localStorage.getItem('su_rc_vs_gap_pc')||'12',10)||12))}px</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gray-l);font-weight:900">모바일</span>
          <input type="range" id="cfg-rc-gap-mb" min="0" max="120" step="1"
            value="${Math.max(0,Math.min(120,parseInt(localStorage.getItem('su_rc_vs_gap_mb')||'8',10)||8))}"
            oninput="document.getElementById('cfg-rc-gap-mb-v').textContent=this.value+'px'" onchange="cfgSetRecVsGapSettings()" style="width:140px">
          <span id="cfg-rc-gap-mb-v" style="font-size:11px;color:var(--gray-l);min-width:44px;font-weight:900">${Math.max(0,Math.min(120,parseInt(localStorage.getItem('su_rc_vs_gap_mb')||'8',10)||8))}px</span>
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
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="font-size:12px;font-weight:900;color:var(--text2)">👤 기록 카드 양쪽 끝 참여자 프로필</span>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2);margin-left:auto">
            <input type="checkbox" id="cfg-rec-side-panel-on" style="width:15px;height:15px"
              ${(()=>{ try{ return (localStorage.getItem('su_rec_side_panel_on')??'1') !== '0' ? 'checked' : ''; }catch(e){ return 'checked'; } })()}
              onchange="(window.cfgSetRecSidePanelSettings||function(){})()">
            표시 사용
          </label>
        </div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">기록 카드(미니대전·대학대전·대학CK·티어대회·프로리그 일반·일반 등) 및 대회탭(조별리그·토너먼트) 좌우에 각 팀 참여자 이미지를 표시합니다. 승리팀은 이긴 선수, 패배팀은 진 선수를 랜덤 표시합니다. 이미지가 없으면 패널을 표시하지 않습니다.</div>

        <!-- 표시 타입: 프로필 이미지 / 대학 로고 -->
        <div style="margin-bottom:12px;padding:10px 12px;background:var(--surface);border-radius:8px;border:1px solid var(--border)">
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:8px">🖼️ 표시 타입</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${(()=>{const cur=(()=>{try{return localStorage.getItem('su_rsp_image_type')||'profile';}catch(e){return 'profile';}})();return[['profile','👤 선수 프로필 이미지'],['logo','🏫 대학 로고']].map(([v,l])=>`<button class="btn btn-sm ${cur===v?'btn-b':'btn-w'}" onclick="(window.cfgSetRspImageType||function(){})(this.dataset.v);document.querySelectorAll('[data-rsptype]').forEach(b=>{b.classList.remove('btn-b');b.classList.add('btn-w')});this.classList.remove('btn-w');this.classList.add('btn-b')" data-rsptype="${v}" data-v="${v}">${l}</button>`).join('');})()}
          </div>
          <div style="font-size:10px;color:var(--gray-l);margin-top:6px">대학 로고 선택 시: 대학 아이콘 설정에 등록된 로고를 표시합니다.</div>
        </div>

        <!-- 대회탭 포함 여부 -->
        <div style="margin-bottom:12px">
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:700;color:var(--text2)">
            <input type="checkbox" id="cfg-rsp-comp-on" style="width:14px;height:14px"
              ${(()=>{ try{ return (localStorage.getItem('su_rsp_comp_on')??'1') !== '0' ? 'checked' : ''; }catch(e){ return 'checked'; } })()}
              onchange="(window.cfgSetRspCompOn||function(){})()">
            🏆 대회탭 조별리그·토너먼트에도 표시
          </label>
        </div>

        <!-- 이미지 크기 -->
        <div style="margin-bottom:10px">
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">📐 이미지 크기 <span id="cfg-rsp-size-v" style="font-weight:400;color:var(--gray-l)">${(()=>{ try{ return parseInt(localStorage.getItem('su_rsp_size')||'72',10); }catch(e){ return 72; } })()}px</span></div>
          <input type="range" min="40" max="160" step="4" value="${(()=>{ try{ return parseInt(localStorage.getItem('su_rsp_size')||'72',10); }catch(e){ return 72; } })()}" style="width:100%;max-width:260px;accent-color:var(--blue)" oninput="document.getElementById('cfg-rsp-size-v').textContent=this.value+'px'" onchange="(window.cfgSetRspSize||function(){})(this.value)">
        </div>

        <!-- 패널 너비 -->
        <div style="margin-bottom:10px">
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">↔️ 패널 너비 <span id="cfg-rsp-width-v" style="font-weight:400;color:var(--gray-l)">${(()=>{ try{ return parseInt(localStorage.getItem('su_rsp_width')||'90',10); }catch(e){ return 90; } })()}px</span></div>
          <input type="range" min="60" max="180" step="4" value="${(()=>{ try{ return parseInt(localStorage.getItem('su_rsp_width')||'90',10); }catch(e){ return 90; } })()}" style="width:100%;max-width:260px;accent-color:var(--blue)" oninput="document.getElementById('cfg-rsp-width-v').textContent=this.value+'px'" onchange="(window.cfgSetRspWidth||function(){})(this.value)">
        </div>

        <!-- 이미지 세로 위치 -->
        <div style="margin-bottom:10px">
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:6px">📍 이미지 세로 위치</div>
          <div style="display:flex;gap:6px" id="cfg-rsp-valign-row">
            ${['top','center','bottom'].map(v=>{const cur=(()=>{try{return localStorage.getItem('su_rsp_valign')||'center';}catch(e){return 'center';}})();const labelMap={top:'⬆ 위',center:'가운데',bottom:'⬇ 아래'};return `<button class="btn btn-xs ${cur===v?'btn-b':'btn-w'}" onclick="(window.cfgSetRspValign||function(){})(this.dataset.v);document.getElementById('cfg-rsp-valign-row').querySelectorAll('button').forEach(b=>{b.classList.remove('btn-b');b.classList.add('btn-w')});this.classList.remove('btn-w');this.classList.add('btn-b')" data-v="${v}">${labelMap[v]}</button>`;}).join('')}
          </div>
        </div>

        <!-- 이미지 수평/수직 이동 -->
        <div style="margin-bottom:10px">
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">↔️ 이미지 수평 이동 <span id="cfg-rsp-hoffset-v" style="font-weight:400;color:var(--gray-l)">${(()=>{try{const v=parseInt(localStorage.getItem('su_rsp_hoffset')||'0',10);return(v>0?'+':'')+v+'px';}catch(e){return '0px';}})()}</span></div>
          <input type="range" min="-200" max="200" step="4"
            value="${(()=>{try{return parseInt(localStorage.getItem('su_rsp_hoffset')||'0',10);}catch(e){return 0;}})()}"
            style="width:100%;max-width:260px;accent-color:var(--blue)"
            oninput="document.getElementById('cfg-rsp-hoffset-v').textContent=(parseFloat(this.value)>0?'+':'')+parseInt(this.value)+'px'"
            onchange="(window.cfgSetRspHoffset||function(){})(this.value)">
          <div style="font-size:10px;color:var(--gray-l);margin-top:3px">양수(+): 좌우 이미지가 스코어 방향(안쪽)으로 이동 &nbsp;|&nbsp; 음수(-): 카드 바깥쪽으로 이동</div>
        </div>
        <div style="margin-bottom:10px">
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">↕️ 이미지 수직 이동 <span id="cfg-rsp-voffset-v" style="font-weight:400;color:var(--gray-l)">${(()=>{try{const v=parseInt(localStorage.getItem('su_rsp_voffset')||'0',10);return(v>0?'+':'')+v+'px';}catch(e){return '0px';}})()}</span></div>
          <input type="range" min="-200" max="200" step="4"
            value="${(()=>{try{return parseInt(localStorage.getItem('su_rsp_voffset')||'0',10);}catch(e){return 0;}})()}"
            style="width:100%;max-width:260px;accent-color:var(--blue)"
            oninput="document.getElementById('cfg-rsp-voffset-v').textContent=(parseFloat(this.value)>0?'+':'')+parseInt(this.value)+'px'"
            onchange="(window.cfgSetRspVoffset||function(){})(this.value)">
          <div style="font-size:10px;color:var(--gray-l);margin-top:3px">양수(+): 이미지가 아래로 이동 &nbsp;|&nbsp; 음수(-): 위로 이동</div>
        </div>

        <!-- 슬라이드쇼 -->
        <div style="margin-bottom:10px;padding:8px 10px;background:var(--bg2,rgba(0,0,0,0.03));border-radius:8px;border:1px solid var(--border2)">
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:800;color:var(--text2);margin-bottom:8px">
            <input type="checkbox" id="cfg-rsp-rotate-on" style="width:14px;height:14px"
              ${(()=>{try{return (localStorage.getItem('su_rsp_rotate_on')??'1')!=='0'?'checked':'';}catch(e){return 'checked';}})()}
              onchange="(window.cfgSetRspRotateOn||function(){})()">
            🔄 참여자 슬라이드쇼 (자동 전환)
          </label>
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">⏱ 전환 주기 <span id="cfg-rsp-rotate-sec-v" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseInt(localStorage.getItem('su_rsp_rotate_sec')||'5',10);}catch(e){return 5;}})()}초</span></div>
          <input type="range" min="1" max="60" step="1"
            value="${(()=>{try{return parseInt(localStorage.getItem('su_rsp_rotate_sec')||'5',10);}catch(e){return 5;}})()}"
            style="width:100%;max-width:260px;accent-color:var(--blue)"
            oninput="document.getElementById('cfg-rsp-rotate-sec-v').textContent=this.value+'초'"
            onchange="(window.cfgSetRspRotateSec||function(){})(this.value)">
        </div>

        <!-- 연한색(Opacity) 조절: 승리팀의 진 선수 -->
        <div style="margin-bottom:10px;padding:8px 10px;background:var(--bg2,rgba(0,0,0,0.03));border-radius:8px;border:1px solid var(--border2)">
          <div style="font-size:11px;font-weight:900;color:var(--text2);margin-bottom:6px">🏆 승리팀 패널 – 진 선수 연한 회색 조절</div>
          <div style="font-size:10px;color:var(--gray-l);margin-bottom:6px">승리팀에서 개인전을 진 선수의 투명도·흑백을 조절합니다.</div>
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">투명도(Opacity) <span id="cfg-rsp-wtlo-v" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseFloat(localStorage.getItem('su_rsp_winteam_lose_opacity')||'0.65').toFixed(2);}catch(e){return '0.65';}})()}</span></div>
          <input type="range" min="0.1" max="1.0" step="0.05"
            value="${(()=>{try{return parseFloat(localStorage.getItem('su_rsp_winteam_lose_opacity')||'0.50');}catch(e){return 0.50;}})()}"
            style="width:100%;max-width:260px;accent-color:var(--blue)"
            oninput="document.getElementById('cfg-rsp-wtlo-v').textContent=parseFloat(this.value).toFixed(2)"
            onchange="(window.cfgSetRspWinTeamLoseOpacity||function(){})(this.value)">
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px;margin-top:6px">흑백(Grayscale) <span id="cfg-rsp-wtlg-v" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseFloat(localStorage.getItem('su_rsp_winteam_lose_gray')||'0.35').toFixed(2);}catch(e){return '0.35';}})()}</span></div>
          <input type="range" min="0" max="1.0" step="0.05"
            value="${(()=>{try{return parseFloat(localStorage.getItem('su_rsp_winteam_lose_gray')||'0.70');}catch(e){return 0.70;}})()}"
            style="width:100%;max-width:260px;accent-color:var(--blue)"
            oninput="document.getElementById('cfg-rsp-wtlg-v').textContent=parseFloat(this.value).toFixed(2)"
            onchange="(window.cfgSetRspWinTeamLoseGray||function(){})(this.value)">
        </div>

        <!-- 밝기 조절: 패배팀의 이긴 선수 -->
        <div style="margin-bottom:10px;padding:8px 10px;background:var(--bg2,rgba(0,0,0,0.03));border-radius:8px;border:1px solid var(--border2)">
          <div style="font-size:11px;font-weight:900;color:var(--text2);margin-bottom:6px">💪 패배팀 패널 – 이긴 선수 원색/밝기 조절</div>
          <div style="font-size:10px;color:var(--gray-l);margin-bottom:6px">패배팀이지만 개인전은 이긴 선수입니다. 밝기를 올리면 더 밝고 원색이 살아나고, 흑백을 낮추면 회색감이 줄어듭니다.</div>
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">원색/밝기(Brightness) <span id="cfg-rsp-ltwb-v" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseFloat(localStorage.getItem('su_rsp_loseteam_win_brightness')||'1.0').toFixed(2);}catch(e){return '1.00';}})()}x</span></div>
          <input type="range" min="0.5" max="1.8" step="0.05"
            value="${(()=>{try{return parseFloat(localStorage.getItem('su_rsp_loseteam_win_brightness')||'1.0');}catch(e){return 1.0;}})()}"
            style="width:100%;max-width:260px;accent-color:var(--blue)"
            oninput="document.getElementById('cfg-rsp-ltwb-v').textContent=parseFloat(this.value).toFixed(2)+'x'"
            onchange="(window.cfgSetRspLoseTeamWinBrightness||function(){})(this.value)">
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">투명도(Opacity) <span id="cfg-rsp-ltwo-v" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseFloat(localStorage.getItem('su_rsp_loseteam_win_opacity')||'0.80').toFixed(2);}catch(e){return '0.80';}})()}</span></div>
          <input type="range" min="0.1" max="1.0" step="0.05"
            value="${(()=>{try{return parseFloat(localStorage.getItem('su_rsp_loseteam_win_opacity')||'0.80');}catch(e){return 0.80;}})()}"
            style="width:100%;max-width:260px;accent-color:var(--blue)"
            oninput="document.getElementById('cfg-rsp-ltwo-v').textContent=parseFloat(this.value).toFixed(2)"
            onchange="(window.cfgSetRspLoseTeamWinOpacity||function(){})(this.value)">
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px;margin-top:6px">흑백(Grayscale) <span id="cfg-rsp-ltwg-v" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseFloat(localStorage.getItem('su_rsp_loseteam_win_gray')||'0.15').toFixed(2);}catch(e){return '0.15';}})()}</span></div>
          <input type="range" min="0" max="1.0" step="0.05"
            value="${(()=>{try{return parseFloat(localStorage.getItem('su_rsp_loseteam_win_gray')||'0.15');}catch(e){return 0.15;}})()}"
            style="width:100%;max-width:260px;accent-color:var(--blue)"
            oninput="document.getElementById('cfg-rsp-ltwg-v').textContent=parseFloat(this.value).toFixed(2)"
            onchange="(window.cfgSetRspLoseTeamWinGray||function(){})(this.value)">
        </div>

        <!-- 연한색(Opacity) 조절: 패배팀의 진 선수 -->
        <div style="margin-bottom:10px;padding:8px 10px;background:var(--bg2,rgba(0,0,0,0.03));border-radius:8px;border:1px solid var(--border2)">
          <div style="font-size:11px;font-weight:900;color:var(--text2);margin-bottom:6px">💔 패배팀 패널 – 진 선수 연한색 조절</div>
          <div style="font-size:10px;color:var(--gray-l);margin-bottom:6px">패배팀에서 개인전까지 진 선수(전패)의 투명도·흑백을 조절합니다.</div>
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">투명도(Opacity) <span id="cfg-rsp-ltlo-v" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseFloat(localStorage.getItem('su_rsp_loseteam_lose_opacity')||'0.45').toFixed(2);}catch(e){return '0.45';}})()}</span></div>
          <input type="range" min="0.1" max="1.0" step="0.05"
            value="${(()=>{try{return parseFloat(localStorage.getItem('su_rsp_loseteam_lose_opacity')||'0.45');}catch(e){return 0.45;}})()}"
            style="width:100%;max-width:260px;accent-color:var(--blue)"
            oninput="document.getElementById('cfg-rsp-ltlo-v').textContent=parseFloat(this.value).toFixed(2)"
            onchange="(window.cfgSetRspLoseTeamLoseOpacity||function(){})(this.value)">
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px;margin-top:6px">흑백(Grayscale) <span id="cfg-rsp-ltlg-v" style="font-weight:400;color:var(--gray-l)">${(()=>{try{return parseFloat(localStorage.getItem('su_rsp_loseteam_lose_gray')||'0.75').toFixed(2);}catch(e){return '0.75';}})()}</span></div>
          <input type="range" min="0" max="1.0" step="0.05"
            value="${(()=>{try{return parseFloat(localStorage.getItem('su_rsp_loseteam_lose_gray')||'0.75');}catch(e){return 0.75;}})()}"
            style="width:100%;max-width:260px;accent-color:var(--blue)"
            oninput="document.getElementById('cfg-rsp-ltlg-v').textContent=parseFloat(this.value).toFixed(2)"
            onchange="(window.cfgSetRspLoseTeamLoseGray||function(){})(this.value)">
        </div>

        <!-- 네모 박스(배경/테두리) 표시 -->
        <div style="margin-bottom:10px">
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:700;color:var(--text2)">
            <input type="checkbox" id="cfg-rsp-show-box" style="width:14px;height:14px"
              ${(()=>{try{return (localStorage.getItem('su_rsp_show_box')||'0')!=='0'?'checked':'';}catch(e){return '';}})()}
              onchange="(window.cfgSetRspShowBox||function(){})(this.checked)">
            🔲 패널 배경·테두리 표시 (기본 OFF = 이미지만 표시)
          </label>
        </div>

        <!-- 밝기 -->
        <div style="margin-bottom:10px">
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">☀️ 밝기 <span id="cfg-rsp-br-v" style="font-weight:400;color:var(--gray-l)">${(()=>{ try{ return parseFloat(localStorage.getItem('su_rsp_brightness')||'1.0').toFixed(1); }catch(e){ return '1.0'; } })()}x</span></div>
          <input type="range" min="0.3" max="2.0" step="0.1" value="${(()=>{ try{ return parseFloat(localStorage.getItem('su_rsp_brightness')||'1.0'); }catch(e){ return 1.0; } })()}" style="width:100%;max-width:260px;accent-color:var(--blue)" oninput="document.getElementById('cfg-rsp-br-v').textContent=parseFloat(this.value).toFixed(1)+'x'" onchange="(window.cfgSetRspBrightness||function(){})(this.value)">
        </div>

        <!-- 이미지 효과 -->
        <div style="margin-bottom:4px">
          <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:6px">✨ 이미지 효과(필터)</div>
          <select onchange="(window.cfgSetRspEffect||function(){})(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:700;width:100%;max-width:200px">
            ${[['none','없음(기본)'],['sepia','세피아'],['warm','따뜻한 톤'],['cool','차가운 톤'],['vivid','선명하게'],['dark','어둡게'],['mono','흑백']].map(([v,l])=>{const cur=(()=>{try{return localStorage.getItem('su_rsp_effect')||'none';}catch(e){return 'none';}})();return `<option value="${v}" ${cur===v?'selected':''}>${l}</option>`;}).join('')}
          </select>
        </div>
      </div>

      <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:4px">
        <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:10px">🎨 기록 카드 양쪽 끝 색상 효과</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">기록 카드 좌우 끝에 A·B팀 대학 색상 그라디언트를 표시합니다. 대전기록탭·대회탭(조별리그 일정·대진표 기록·프로리그 조별리그·대진표) 기록 카드 전체에 적용됩니다.</div>
        <div style="font-size:11px;color:#475569;margin-bottom:8px"><b>대학CK</b> / <b>프로리그 일반</b>의 양쪽 끝 색상은 바로 아래 나오는 <b>팀 버튼 색상</b> 블록에서 바꿉니다.</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
            <input type="checkbox" id="cfg-sidefx-on" style="width:15px;height:15px" ${_sfxOn?'checked':''} onchange="(window.cfgSetRecSideFxEnabled||function(){})(this.checked)">
            색상 효과 사용
          </label>
          ${_sfxOn ? `<div id="cfg-sidefx-preview" class="grp-match-card grp-sidefx grp-sidefx--${_sfxMode}" style="${(()=>{try{if(typeof _recSideFxVarStyle==='function')return _recSideFxVarStyle('#2563eb','#a855f7',{mode:_sfxMode,intensity:_sfxInt,length:_sfxLen,tail:_sfxTail,softness:_sfxSoft,edge:_sfxEdge});}catch(e){}return '';})()}--rec-side-left-rgb:37,99,235;--rec-side-right-rgb:168,85,247;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px;border-radius:10px;background:var(--white);margin:0;">
            <span style="position:relative;z-index:1;font-size:11px;font-weight:900;color:#2563eb">🔵 A팀</span>
            <span style="position:relative;z-index:1;font-size:11px;color:var(--gray-l);font-weight:700">미리보기</span>
            <span style="position:relative;z-index:1;font-size:11px;font-weight:900;color:#a855f7">B팀 🟣</span>
          </div>` : ''}
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800">효과 종류</div>
            <select id="cfg-sidefx-mode" onchange="(window.cfgSetRecSideFxMode||function(){})(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
              <optgroup label="── 기본 ──">
              <option value="soft" ${_sfxMode==='soft'?'selected':''}>소프트 (기본)</option>
              <option value="glow" ${_sfxMode==='glow'?'selected':''}>글로우 (발광)</option>
              <option value="panel" ${_sfxMode==='panel'?'selected':''}>패널 (선명)</option>
              <option value="line" ${_sfxMode==='line'?'selected':''}>라인 (세로 바)</option>
              <option value="ribbon" ${_sfxMode==='ribbon'?'selected':''}>리본</option>
              <option value="frame" ${_sfxMode==='frame'?'selected':''}>프레임</option>
              <option value="spotlight" ${_sfxMode==='spotlight'?'selected':''}>스포트라이트</option>
              <option value="fade" ${_sfxMode==='fade'?'selected':''}>페이드 (은은)</option>
              <option value="double" ${_sfxMode==='double'?'selected':''}>더블라인</option>
              <option value="neon" ${_sfxMode==='neon'?'selected':''}>네온</option>
              <option value="wave" ${_sfxMode==='wave'?'selected':''}>웨이브</option>
              <option value="prism" ${_sfxMode==='prism'?'selected':''}>프리즘</option>
              <option value="vignette" ${_sfxMode==='vignette'?'selected':''}>비네트</option>
              <option value="pulse" ${_sfxMode==='pulse'?'selected':''}>펄스</option>
              <option value="sheen" ${_sfxMode==='sheen'?'selected':''}>실크 (사선)</option>
              <option value="aurora" ${_sfxMode==='aurora'?'selected':''}>오로라</option>
              <option value="slant" ${_sfxMode==='slant'?'selected':''}>슬랜트</option>
              <option value="steps" ${_sfxMode==='steps'?'selected':''}>스텝</option>
              </optgroup>
              <optgroup label="── 발광/빔 ──">
              <option value="laser" ${_sfxMode==='laser'?'selected':''}>레이저</option>
              <option value="halo" ${_sfxMode==='halo'?'selected':''}>헤일로 (고리 발광)</option>
              <option value="ember" ${_sfxMode==='ember'?'selected':''}>엠버 (잔불)</option>
              <option value="shimmer" ${_sfxMode==='shimmer'?'selected':''}>시머 (반짝 광택)</option>
              <option value="sweep" ${_sfxMode==='sweep'?'selected':''}>스윕 (방사 호)</option>
              </optgroup>
              <optgroup label="── 자연/온도 ──">
              <option value="fire" ${_sfxMode==='fire'?'selected':''}>파이어 (불꽃)</option>
              <option value="ice" ${_sfxMode==='ice'?'selected':''}>아이스 (냉기)</option>
              <option value="ink" ${_sfxMode==='ink'?'selected':''}>잉크 (먹물 번짐)</option>
              <option value="dust" ${_sfxMode==='dust'?'selected':''}>더스트 (먼지 입자)</option>
              </optgroup>
              <optgroup label="── 선/패턴 ──">
              <option value="bars" ${_sfxMode==='bars'?'selected':''}>바 (복수 세로 바)</option>
              <option value="bracket" ${_sfxMode==='bracket'?'selected':''}>브라켓 [ ]</option>
              <option value="corner" ${_sfxMode==='corner'?'selected':''}>코너 (L자 모서리)</option>
              <option value="diagonal" ${_sfxMode==='diagonal'?'selected':''}>다이아고날 (사선)</option>
              <option value="scanline" ${_sfxMode==='scanline'?'selected':''}>스캔라인 (CRT)</option>
              <option value="circuit" ${_sfxMode==='circuit'?'selected':''}>서킷 (회로 패턴)</option>
              <option value="confetti" ${_sfxMode==='confetti'?'selected':''}>컨페티 (점 패턴)</option>
              </optgroup>
              <optgroup label="── 구조/반사 ──">
              <option value="diamond" ${_sfxMode==='diamond'?'selected':''}>다이아몬드 커트</option>
              <option value="mirror" ${_sfxMode==='mirror'?'selected':''}>미러 (좌우 반사)</option>
              </optgroup>
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
          <div>
            <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">연해지는 정도(부드러움) <span id="cfg-sidefx-soft-v" style="font-weight:400;color:var(--gray-l)">${_sfxSoft}%</span></div>
            <input type="range" id="cfg-sidefx-soft" min="0" max="100" step="4" value="${_sfxSoft}" oninput="document.getElementById('cfg-sidefx-soft-v').textContent=this.value+'%'" onchange="(window.cfgSetRecSideFxSoftness||function(){})(this.value)" style="width:100%;max-width:260px">
          </div>
        </div>
      </div>
      ${(typeof window.buildSettingsTeamColorBlock==='function' ? window.buildSettingsTeamColorBlock() : '')}

      <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:4px">
        <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:6px">📄 경기 기록 페이지 크기 (한 페이지에 표시할 기록 수)</div>
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">
          대전기록 탭·티어대회·프로리그 등 모든 기록 목록에 적용됩니다.<br>
          기본값: PC 20개 / 모바일 10개 (설정 시 PC·모바일 구분 없이 고정 적용)
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div style="font-size:11px;color:var(--text3);font-weight:800;min-width:80px">한 페이지 수</div>
            <select id="cfg-hist-page-size" onchange="(function(v){try{if(v==='auto'){localStorage.removeItem('su_hist_page_size');}else{localStorage.setItem('su_hist_page_size',v);}try{render();}catch(e){}try{if(typeof showToast==='function')showToast('✅ 페이지 크기 변경: '+(v==='auto'?'기본(자동)':v+'개'));}catch(e){}}catch(e){}})(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
              <option value="auto" ${!(()=>{try{return localStorage.getItem('su_hist_page_size');}catch(e){return '';}})()? 'selected':''}>기본 (PC 20개 / 모바일 10개)</option>
              <option value="10" ${(()=>{try{return localStorage.getItem('su_hist_page_size')==='10';}catch(e){return false;}})()? 'selected':''}>10개씩</option>
              <option value="15" ${(()=>{try{return localStorage.getItem('su_hist_page_size')==='15';}catch(e){return false;}})()? 'selected':''}>15개씩</option>
              <option value="20" ${(()=>{try{return localStorage.getItem('su_hist_page_size')==='20';}catch(e){return false;}})()? 'selected':''}>20개씩</option>
              <option value="25" ${(()=>{try{return localStorage.getItem('su_hist_page_size')==='25';}catch(e){return false;}})()? 'selected':''}>25개씩</option>
              <option value="30" ${(()=>{try{return localStorage.getItem('su_hist_page_size')==='30';}catch(e){return false;}})()? 'selected':''}>30개씩</option>
              <option value="40" ${(()=>{try{return localStorage.getItem('su_hist_page_size')==='40';}catch(e){return false;}})()? 'selected':''}>40개씩</option>
              <option value="50" ${(()=>{try{return localStorage.getItem('su_hist_page_size')==='50';}catch(e){return false;}})()? 'selected':''}>50개씩</option>
              <option value="100" ${(()=>{try{return localStorage.getItem('su_hist_page_size')==='100';}catch(e){return false;}})()? 'selected':''}>100개씩</option>
            </select>
            <button class="btn btn-w btn-xs" onclick="localStorage.removeItem('su_hist_page_size');document.getElementById('cfg-hist-page-size').value='auto';try{render();}catch(e){}">초기화</button>
          </div>
          <div style="font-size:11px;color:var(--gray-l);line-height:1.6">
            ※ 기록 수가 많으면 30~50개, 빠른 스크롤을 원하면 20개를 권장합니다.<br>
            ※ 적용 범위: 대전기록(전체·개인전·끝장전·미니대전·시빌워·CK·대학대전·프로·티어대회·대회 등)
          </div>
        </div>
      </div>
    </div>
  </details>`;
};
