// ══════════════════════════════════════════════════════════
// settings-render-cards.js — 기록 카드 디자인 설정 섹션 렌더러
// settings-render.js 에서 분리됨
// 의존: settings-render.js (_scfgD 헬퍼를 인자로 받음)
// ══════════════════════════════════════════════════════════

// 미니대전/시빌워 기록 카드 디자인 섹션
window.renderCfgMiniCardSection = function(_scfgD) {
  const localStorage = (function(){try{const ls=window.localStorage;const k='__su_ls_test__';ls.setItem(k,'1');ls.removeItem(k);return ls;}catch(e){return{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};} })();
    // ── 미니대전 기록 카드 디자인 ──
    const shape = localStorage.getItem('su_mini_card_shape')||'default';
    const accent = localStorage.getItem('su_mini_card_accent')||'none';
    const layoutPc = parseInt(localStorage.getItem('su_mini_card_layout_pc')||'100',10)||100;
    const layoutMb = parseInt(localStorage.getItem('su_mini_card_layout_mb')||'100',10)||100;
    const shapes = [
      {v:'default',l:'기본',icon:'🃏'},{v:'compact',l:'컴팩트',icon:'📋'},{v:'wide',l:'와이드',icon:'🖼️'},
      {v:'minimal',l:'미니멀',icon:'➖'},{v:'timeline',l:'타임라인',icon:'📅'},{v:'card3d',l:'3D',icon:'🎴'},
      {v:'glass',l:'유리',icon:'🔮'},{v:'sharp',l:'각진',icon:'▬'},{v:'bubble',l:'버블',icon:'💬'},
      {v:'neon',l:'네온',icon:'⚡'},{v:'floating',l:'플로팅',icon:'🎈'},{v:'retro',l:'레트로',icon:'🕹️'},
    ];
    return _scfgD('minicard','⚡ 미니대전/시빌워 기록 카드') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">대전기록 탭 → 미니대전/시빌워 기록 카드의 디자인과 레이아웃을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">카드 모양</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${shapes.map(s=>`<button type="button"
            onclick="localStorage.setItem('su_mini_card_shape','${s.v}');document.body.classList.remove(${shapes.map(x=>`'mini-card--${x.v}'`).join(',')});if('${s.v}'!=='default')document.body.classList.add('mini-card--${s.v}');try{render();}catch(e){}"
            style="padding:4px 10px;border-radius:8px;font-size:var(--fs-caption);font-weight:900;cursor:pointer;border:1.5px solid ${shape===s.v?'var(--blue)':'var(--border2)'};background:${shape===s.v?'#eff6ff':'var(--white)'};color:${shape===s.v?'var(--blue)':'var(--text2)'}">
            ${s.icon} ${s.l}</button>`).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">색상 강조</div>
        <select onchange="localStorage.setItem('su_mini_card_accent',this.value);try{render();}catch(e){}" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:900">
          <option value="none" ${accent==='none'?'selected':''}>무색</option>
          <option value="header" ${accent==='header'?'selected':''}>헤더만</option>
          <option value="border" ${accent==='border'?'selected':''}>테두리만</option>
          <option value="full" ${accent==='full'?'selected':''}>전체 배경</option>
          <option value="gradient" ${accent==='gradient'?'selected':''}>그라디언트</option>
        </select>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">레이아웃(PC)</div>
        <input type="range" id="cfg-mini-layout-pc" min="60" max="130" step="5" value="${layoutPc}"
          oninput="document.getElementById('cfg-mini-layout-pc-v').textContent=this.value+'%'"
          onchange="localStorage.setItem('su_mini_card_layout_pc',this.value);try{render();}catch(e){}" style="width:100%">
        <div id="cfg-mini-layout-pc-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${layoutPc}%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">레이아웃(모바일)</div>
        <input type="range" id="cfg-mini-layout-mb" min="60" max="130" step="5" value="${layoutMb}"
          oninput="document.getElementById('cfg-mini-layout-mb-v').textContent=this.value+'%'"
          onchange="localStorage.setItem('su_mini_card_layout_mb',this.value);try{render();}catch(e){}" style="width:100%">
        <div id="cfg-mini-layout-mb-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${layoutMb}%</div>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l)">※ 미니대전·시빌워 카드 공통 설정입니다.</div>
    </div>
  </details>`;
};

// 대학CK 기록 카드 디자인 섹션
window.renderCfgUnivCKCardSection = function(_scfgD) {
  const localStorage = (function(){try{const ls=window.localStorage;const k='__su_ls_test__';ls.setItem(k,'1');ls.removeItem(k);return ls;}catch(e){return{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};} })();
    // ── 대학CK 기록 카드 디자인 ──
    const shape = localStorage.getItem('su_ck_card_shape')||'default';
    const showTeams = (localStorage.getItem('su_ck_card_show_teams')||'1')==='1';
    const avatarPc = parseInt(localStorage.getItem('su_ck_card_avatar_pc')||'44',10)||44;
    const avatarMb = parseInt(localStorage.getItem('su_ck_card_avatar_mb')||'36',10)||36;
    const shapes = [
      {v:'default',l:'기본',icon:'🃏'},{v:'compact',l:'컴팩트',icon:'📋'},{v:'wide',l:'와이드',icon:'🖼️'},
      {v:'minimal',l:'미니멀',icon:'➖'},{v:'timeline',l:'타임라인',icon:'📅'},{v:'glass',l:'유리',icon:'🔮'},
      {v:'sharp',l:'각진',icon:'▬'},{v:'bubble',l:'버블',icon:'💬'},{v:'neon',l:'네온',icon:'⚡'},
      {v:'retro',l:'레트로',icon:'🕹️'},{v:'ticket',l:'티켓',icon:'🎟️'},{v:'frosted',l:'프로스트',icon:'❄️'},
    ];
    return _scfgD('univckcard','🤝 대학CK 기록 카드') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">대전기록 탭 → 대학CK 기록 카드의 디자인을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">카드 모양</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${shapes.map(s=>`<button type="button"
            onclick="localStorage.setItem('su_ck_card_shape','${s.v}');try{render();}catch(e){}"
            style="padding:4px 10px;border-radius:8px;font-size:var(--fs-caption);font-weight:900;cursor:pointer;border:1.5px solid ${shape===s.v?'var(--blue)':'var(--border2)'};background:${shape===s.v?'#eff6ff':'var(--white)'};color:${shape===s.v?'var(--blue)':'var(--text2)'}">
            ${s.icon} ${s.l}</button>`).join('')}
        </div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" style="width:15px;height:15px" ${showTeams?'checked':''}
          onchange="localStorage.setItem('su_ck_card_show_teams',this.checked?'1':'0');try{render();}catch(e){}">
        팀(대학) 버튼 표시
      </label>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">아바타(PC)</div>
        <input type="range" id="cfg-ck-ava-pc" min="24" max="80" step="2" value="${avatarPc}"
          oninput="document.getElementById('cfg-ck-ava-pc-v').textContent=this.value+'px'"
          onchange="localStorage.setItem('su_ck_card_avatar_pc',this.value);try{render();}catch(e){}" style="width:100%">
        <div id="cfg-ck-ava-pc-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${avatarPc}px</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">아바타(모바일)</div>
        <input type="range" id="cfg-ck-ava-mb" min="20" max="64" step="2" value="${avatarMb}"
          oninput="document.getElementById('cfg-ck-ava-mb-v').textContent=this.value+'px'"
          onchange="localStorage.setItem('su_ck_card_avatar_mb',this.value);try{render();}catch(e){}" style="width:100%">
        <div id="cfg-ck-ava-mb-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${avatarMb}px</div>
      </div>
    </div>
  </details>`;
};

// 대학대전 기록 카드 디자인 섹션
window.renderCfgUnivMCardSection = function(_scfgD) {
  const localStorage = (function(){try{const ls=window.localStorage;const k='__su_ls_test__';ls.setItem(k,'1');ls.removeItem(k);return ls;}catch(e){return{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};} })();
    // ── 대학대전 기록 카드 디자인 ──
    const shape = localStorage.getItem('su_univm_card_shape')||'default';
    const accent = localStorage.getItem('su_univm_card_accent')||'none';
    const scorePc = parseInt(localStorage.getItem('su_univm_score_scale_pc')||'100',10)||100;
    const scoreMb = parseInt(localStorage.getItem('su_univm_score_scale_mb')||'100',10)||100;
    const showRace = (localStorage.getItem('su_univm_show_race')||'1')==='1';
    const shapes = [
      {v:'default',l:'기본',icon:'🃏'},{v:'compact',l:'컴팩트',icon:'📋'},{v:'wide',l:'와이드',icon:'🖼️'},
      {v:'minimal',l:'미니멀',icon:'➖'},{v:'timeline',l:'타임라인',icon:'📅'},{v:'glass',l:'유리',icon:'🔮'},
      {v:'sharp',l:'각진',icon:'▬'},{v:'neon',l:'네온',icon:'⚡'},{v:'retro',l:'레트로',icon:'🕹️'},
      {v:'ticket',l:'티켓',icon:'🎟️'},{v:'stripe',l:'스트라이프',icon:'🟦'},{v:'gradient-bg',l:'그라데이션',icon:'🌈'},
    ];
    return _scfgD('univmcard','🏟️ 대학대전 기록 카드') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">대전기록 탭 → 대학대전 기록 카드의 디자인을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">카드 모양</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${shapes.map(s=>`<button type="button"
            onclick="localStorage.setItem('su_univm_card_shape','${s.v}');try{render();}catch(e){}"
            style="padding:4px 10px;border-radius:8px;font-size:var(--fs-caption);font-weight:900;cursor:pointer;border:1.5px solid ${shape===s.v?'var(--blue)':'var(--border2)'};background:${shape===s.v?'#eff6ff':'var(--white)'};color:${shape===s.v?'var(--blue)':'var(--text2)'}">
            ${s.icon} ${s.l}</button>`).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">색상 강조</div>
        <select onchange="localStorage.setItem('su_univm_card_accent',this.value);try{render();}catch(e){}" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:900">
          <option value="none" ${accent==='none'?'selected':''}>무색</option>
          <option value="header" ${accent==='header'?'selected':''}>헤더만</option>
          <option value="border" ${accent==='border'?'selected':''}>테두리만</option>
          <option value="full" ${accent==='full'?'selected':''}>전체 배경</option>
          <option value="gradient" ${accent==='gradient'?'selected':''}>그라디언트</option>
        </select>
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" style="width:15px;height:15px" ${showRace?'checked':''}
          onchange="localStorage.setItem('su_univm_show_race',this.checked?'1':'0');try{render();}catch(e){}">
        종족 아이콘 표시
      </label>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">스코어(PC)</div>
        <input type="range" id="cfg-univm-score-pc" min="60" max="160" step="5" value="${scorePc}"
          oninput="document.getElementById('cfg-univm-score-pc-v').textContent=this.value+'%'"
          onchange="localStorage.setItem('su_univm_score_scale_pc',this.value);try{render();}catch(e){}" style="width:100%">
        <div id="cfg-univm-score-pc-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${scorePc}%</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">스코어(모바일)</div>
        <input type="range" id="cfg-univm-score-mb" min="60" max="160" step="5" value="${scoreMb}"
          oninput="document.getElementById('cfg-univm-score-mb-v').textContent=this.value+'%'"
          onchange="localStorage.setItem('su_univm_score_scale_mb',this.value);try{render();}catch(e){}" style="width:100%">
        <div id="cfg-univm-score-mb-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${scoreMb}%</div>
      </div>
    </div>
  </details>`;
};

// 티어대회 일반 기록 카드 섹션
window.renderCfgTierTourCardSection = function(_scfgD) {
  const localStorage = (function(){try{const ls=window.localStorage;const k='__su_ls_test__';ls.setItem(k,'1');ls.removeItem(k);return ls;}catch(e){return{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};} })();
    // ── 티어대회 일반 기록 카드 ──
    const shape = localStorage.getItem('su_tt_card_shape')||'default';
    const mode = localStorage.getItem('su_tt_card_mode')||'panel';
    const layoutPc = parseInt(localStorage.getItem('su_tt_card_layout_pc')||'100',10)||100;
    const shapes = [
      {v:'default',l:'기본',icon:'🃏'},{v:'compact',l:'컴팩트',icon:'📋'},{v:'wide',l:'와이드',icon:'🖼️'},
      {v:'minimal',l:'미니멀',icon:'➖'},{v:'card3d',l:'3D',icon:'🎴'},{v:'glass',l:'유리',icon:'🔮'},
      {v:'neon',l:'네온',icon:'⚡'},{v:'ticket',l:'티켓',icon:'🎟️'},{v:'frosted',l:'프로스트',icon:'❄️'},
      {v:'stripe',l:'스트라이프',icon:'🟦'},{v:'bold-border',l:'굵은선',icon:'🖊️'},{v:'gradient-bg',l:'그라데이션',icon:'🌈'},
    ];
    const modes = [
      {v:'panel',icon:'🎴',l:'패널형'},{v:'banner',icon:'🖼️',l:'배너형'},
      {v:'minimal',icon:'➖',l:'미니멀'},{v:'classic',icon:'📋',l:'클래식'},
    ];
    return _scfgD('tiertourcard','🎯 티어대회 일반 기록 카드') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">티어대회 탭 → 일반 경기 기록 카드의 디자인을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--blue);border-radius:12px;margin-bottom:10px">
      <div style="font-size:var(--fs-sm);font-weight:900;color:var(--blue);margin-bottom:8px">🃏 카드 디자인 모드</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${modes.map(m=>`<button type="button"
          onclick="localStorage.setItem('su_tt_card_mode','${m.v}');try{render();}catch(e){}"
          style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 12px;border-radius:var(--r);font-size:var(--fs-caption);font-weight:900;cursor:pointer;border:2px solid ${mode===m.v?'var(--blue)':'var(--border2)'};background:${mode===m.v?'#eff6ff':'var(--white)'};color:${mode===m.v?'var(--blue)':'var(--text2)'};min-width:72px">
          <span style="font-size:var(--fs-lg)">${m.icon}</span><span>${m.l}</span>
        </button>`).join('')}
      </div>
    </div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">카드 모양</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${shapes.map(s=>`<button type="button"
            onclick="localStorage.setItem('su_tt_card_shape','${s.v}');try{render();}catch(e){}"
            style="padding:4px 10px;border-radius:8px;font-size:var(--fs-caption);font-weight:900;cursor:pointer;border:1.5px solid ${shape===s.v?'var(--blue)':'var(--border2)'};background:${shape===s.v?'#eff6ff':'var(--white)'};color:${shape===s.v?'var(--blue)':'var(--text2)'}">
            ${s.icon} ${s.l}</button>`).join('')}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">레이아웃(PC)</div>
        <input type="range" id="cfg-tt-layout-pc" min="60" max="130" step="5" value="${layoutPc}"
          oninput="document.getElementById('cfg-tt-layout-pc-v').textContent=this.value+'%'"
          onchange="localStorage.setItem('su_tt_card_layout_pc',this.value);try{render();}catch(e){}" style="width:100%">
        <div id="cfg-tt-layout-pc-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${layoutPc}%</div>
      </div>
    </div>
  </details>`;
};

// 티어대회 조별리그 기록 섹션
window.renderCfgTierTourLeagueCardSection = function(_scfgD) {
  const localStorage = (function(){try{const ls=window.localStorage;const k='__su_ls_test__';ls.setItem(k,'1');ls.removeItem(k);return ls;}catch(e){return{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};} })();
    // ── 티어대회 조별리그 기록 ──
    const shape = localStorage.getItem('su_tt_league_card_shape')||'default';
    const showScore = (localStorage.getItem('su_tt_league_show_score')||'1')==='1';
    const showDate = (localStorage.getItem('su_tt_league_show_date')||'1')==='1';
    const avatarPc = parseInt(localStorage.getItem('su_tt_league_avatar_pc')||'44',10)||44;
    const shapes = [
      {v:'default',l:'기본',icon:'🃏'},{v:'compact',l:'컴팩트',icon:'📋'},{v:'wide',l:'와이드',icon:'🖼️'},
      {v:'minimal',l:'미니멀',icon:'➖'},{v:'timeline',l:'타임라인',icon:'📅'},{v:'glass',l:'유리',icon:'🔮'},
      {v:'sharp',l:'각진',icon:'▬'},{v:'neon',l:'네온',icon:'⚡'},{v:'stripe',l:'스트라이프',icon:'🟦'},
      {v:'ticket',l:'티켓',icon:'🎟️'},{v:'retro',l:'레트로',icon:'🕹️'},{v:'frosted',l:'프로스트',icon:'❄️'},
    ];
    return _scfgD('tiertourleaguecard','🎯 티어대회 조별리그 기록') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">티어대회 탭 → 조별리그 일정/기록 카드의 디자인을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">카드 모양</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${shapes.map(s=>`<button type="button"
            onclick="localStorage.setItem('su_tt_league_card_shape','${s.v}');try{render();}catch(e){}"
            style="padding:4px 10px;border-radius:8px;font-size:var(--fs-caption);font-weight:900;cursor:pointer;border:1.5px solid ${shape===s.v?'var(--blue)':'var(--border2)'};background:${shape===s.v?'#eff6ff':'var(--white)'};color:${shape===s.v?'var(--blue)':'var(--text2)'}">
            ${s.icon} ${s.l}</button>`).join('')}
        </div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" style="width:15px;height:15px" ${showScore?'checked':''}
          onchange="localStorage.setItem('su_tt_league_show_score',this.checked?'1':'0');try{render();}catch(e){}">
        스코어 표시
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" style="width:15px;height:15px" ${showDate?'checked':''}
          onchange="localStorage.setItem('su_tt_league_show_date',this.checked?'1':'0');try{render();}catch(e){}">
        날짜 표시
      </label>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">아바타 크기</div>
        <input type="range" id="cfg-ttl-ava" min="24" max="80" step="2" value="${avatarPc}"
          oninput="document.getElementById('cfg-ttl-ava-v').textContent=this.value+'px'"
          onchange="localStorage.setItem('su_tt_league_avatar_pc',this.value);try{render();}catch(e){}" style="width:100%">
        <div id="cfg-ttl-ava-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${avatarPc}px</div>
      </div>
    </div>
  </details>`;
};

// 티어대회 대진표 기록 섹션
window.renderCfgTierTourBrackCardSection = function(_scfgD) {
  const localStorage = (function(){try{const ls=window.localStorage;const k='__su_ls_test__';ls.setItem(k,'1');ls.removeItem(k);return ls;}catch(e){return{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};} })();
    // ── 티어대회 대진표 기록 ──
    const shape = localStorage.getItem('su_tt_brack_card_shape')||'default';
    const showRound = (localStorage.getItem('su_tt_brack_show_round')||'1')==='1';
    const panelPc = parseInt(localStorage.getItem('su_tt_brack_panel_pc')||'160',10)||160;
    const shapes = [
      {v:'default',l:'기본',icon:'🃏'},{v:'compact',l:'컴팩트',icon:'📋'},{v:'wide',l:'와이드',icon:'🖼️'},
      {v:'minimal',l:'미니멀',icon:'➖'},{v:'card3d',l:'3D',icon:'🎴'},{v:'glass',l:'유리',icon:'🔮'},
      {v:'sharp',l:'각진',icon:'▬'},{v:'neon',l:'네온',icon:'⚡'},{v:'retro',l:'레트로',icon:'🕹️'},
      {v:'frosted',l:'프로스트',icon:'❄️'},{v:'bold-border',l:'굵은선',icon:'🖊️'},{v:'gradient-bg',l:'그라데이션',icon:'🌈'},
    ];
    return _scfgD('tiertourbrackcard','🎯 티어대회 대진표 기록') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">티어대회 탭 → 토너먼트/대진표 기록 카드의 디자인을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">카드 모양</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${shapes.map(s=>`<button type="button"
            onclick="localStorage.setItem('su_tt_brack_card_shape','${s.v}');try{render();}catch(e){}"
            style="padding:4px 10px;border-radius:8px;font-size:var(--fs-caption);font-weight:900;cursor:pointer;border:1.5px solid ${shape===s.v?'var(--blue)':'var(--border2)'};background:${shape===s.v?'#eff6ff':'var(--white)'};color:${shape===s.v?'var(--blue)':'var(--text2)'}">
            ${s.icon} ${s.l}</button>`).join('')}
        </div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" style="width:15px;height:15px" ${showRound?'checked':''}
          onchange="localStorage.setItem('su_tt_brack_show_round',this.checked?'1':'0');try{render();}catch(e){}">
        라운드명 표시 (16강/8강/4강 등)
      </label>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">패널 너비</div>
        <input type="range" id="cfg-ttb-panel" min="100" max="240" step="4" value="${panelPc}"
          oninput="document.getElementById('cfg-ttb-panel-v').textContent=this.value+'px'"
          onchange="localStorage.setItem('su_tt_brack_panel_pc',this.value);try{render();}catch(e){}" style="width:100%">
        <div id="cfg-ttb-panel-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${panelPc}px</div>
      </div>
    </div>
  </details>`;
};

// 프로리그 대회 조별리그 기록 섹션
window.renderCfgProCompLeagueCardSection = function(_scfgD) {
  const localStorage = (function(){try{const ls=window.localStorage;const k='__su_ls_test__';ls.setItem(k,'1');ls.removeItem(k);return ls;}catch(e){return{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};} })();
    // ── 프로리그 대회 조별리그 기록 ──
    const shape = localStorage.getItem('su_pcomp_league_shape')||'default';
    const accent = localStorage.getItem('su_pcomp_league_accent')||'none';
    const avatarPc = parseInt(localStorage.getItem('su_pcomp_league_avatar_pc')||'52',10)||52;
    const avatarMb = parseInt(localStorage.getItem('su_pcomp_league_avatar_mb')||'40',10)||40;
    const shapes = [
      {v:'default',l:'기본',icon:'🃏'},{v:'compact',l:'컴팩트',icon:'📋'},{v:'wide',l:'와이드',icon:'🖼️'},
      {v:'minimal',l:'미니멀',icon:'➖'},{v:'timeline',l:'타임라인',icon:'📅'},{v:'glass',l:'유리',icon:'🔮'},
      {v:'sharp',l:'각진',icon:'▬'},{v:'neon',l:'네온',icon:'⚡'},{v:'ticket',l:'티켓',icon:'🎟️'},
      {v:'frosted',l:'프로스트',icon:'❄️'},{v:'stripe',l:'스트라이프',icon:'🟦'},{v:'gradient-bg',l:'그라데이션',icon:'🌈'},
    ];
    return _scfgD('procompleaguecard','🏆 프로리그 대회 조별리그 기록') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">프로리그탭 → 프로리그 대회 → 조별리그 일정/기록 카드의 디자인을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">카드 모양</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${shapes.map(s=>`<button type="button"
            onclick="localStorage.setItem('su_pcomp_league_shape','${s.v}');try{render();}catch(e){}"
            style="padding:4px 10px;border-radius:8px;font-size:var(--fs-caption);font-weight:900;cursor:pointer;border:1.5px solid ${shape===s.v?'var(--blue)':'var(--border2)'};background:${shape===s.v?'#eff6ff':'var(--white)'};color:${shape===s.v?'var(--blue)':'var(--text2)'}">
            ${s.icon} ${s.l}</button>`).join('')}
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">색상 강조</div>
        <select onchange="localStorage.setItem('su_pcomp_league_accent',this.value);try{render();}catch(e){}" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:900">
          <option value="none" ${accent==='none'?'selected':''}>무색</option>
          <option value="header" ${accent==='header'?'selected':''}>헤더만</option>
          <option value="border" ${accent==='border'?'selected':''}>테두리만</option>
          <option value="full" ${accent==='full'?'selected':''}>전체 배경</option>
          <option value="gradient" ${accent==='gradient'?'selected':''}>그라디언트</option>
        </select>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">아바타(PC)</div>
        <input type="range" id="cfg-pclg-ava-pc" min="24" max="120" step="2" value="${avatarPc}"
          oninput="document.getElementById('cfg-pclg-ava-pc-v').textContent=this.value+'px'"
          onchange="localStorage.setItem('su_pcomp_league_avatar_pc',this.value);try{render();}catch(e){}" style="width:100%">
        <div id="cfg-pclg-ava-pc-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${avatarPc}px</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">아바타(모바일)</div>
        <input type="range" id="cfg-pclg-ava-mb" min="20" max="80" step="2" value="${avatarMb}"
          oninput="document.getElementById('cfg-pclg-ava-mb-v').textContent=this.value+'px'"
          onchange="localStorage.setItem('su_pcomp_league_avatar_mb',this.value);try{render();}catch(e){}" style="width:100%">
        <div id="cfg-pclg-ava-mb-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${avatarMb}px</div>
      </div>
    </div>
  </details>`;
};

// 프로리그 대회 대진표 기록 섹션
window.renderCfgProCompTourCardSection = function(_scfgD) {
  const localStorage = (function(){try{const ls=window.localStorage;const k='__su_ls_test__';ls.setItem(k,'1');ls.removeItem(k);return ls;}catch(e){return{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};} })();
    // ── 프로리그 대회 대진표 기록 ──
    const shape = localStorage.getItem('su_pcomp_tour_shape')||'default';
    const panelPc = parseInt(localStorage.getItem('su_pcomp_tour_panel_pc')||'160',10)||160;
    const panelMb = parseInt(localStorage.getItem('su_pcomp_tour_panel_mb')||'130',10)||130;
    const showRound = (localStorage.getItem('su_pcomp_tour_show_round')||'1')==='1';
    const shapes = [
      {v:'default',l:'기본',icon:'🃏'},{v:'compact',l:'컴팩트',icon:'📋'},{v:'wide',l:'와이드',icon:'🖼️'},
      {v:'minimal',l:'미니멀',icon:'➖'},{v:'card3d',l:'3D',icon:'🎴'},{v:'glass',l:'유리',icon:'🔮'},
      {v:'sharp',l:'각진',icon:'▬'},{v:'neon',l:'네온',icon:'⚡'},{v:'frosted',l:'프로스트',icon:'❄️'},
      {v:'retro',l:'레트로',icon:'🕹️'},{v:'bold-border',l:'굵은선',icon:'🖊️'},{v:'gradient-bg',l:'그라데이션',icon:'🌈'},
    ];
    return _scfgD('procompteamcard','🏆 프로리그 대회 대진표 기록') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">프로리그탭 → 프로리그 대회 → 대진표(토너먼트) 기록 카드의 디자인을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">카드 모양</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${shapes.map(s=>`<button type="button"
            onclick="localStorage.setItem('su_pcomp_tour_shape','${s.v}');try{render();}catch(e){}"
            style="padding:4px 10px;border-radius:8px;font-size:var(--fs-caption);font-weight:900;cursor:pointer;border:1.5px solid ${shape===s.v?'var(--blue)':'var(--border2)'};background:${shape===s.v?'#eff6ff':'var(--white)'};color:${shape===s.v?'var(--blue)':'var(--text2)'}">
            ${s.icon} ${s.l}</button>`).join('')}
        </div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" style="width:15px;height:15px" ${showRound?'checked':''}
          onchange="localStorage.setItem('su_pcomp_tour_show_round',this.checked?'1':'0');try{render();}catch(e){}">
        라운드명 표시
      </label>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">패널(PC)</div>
        <input type="range" id="cfg-pctour-pc" min="100" max="260" step="4" value="${panelPc}"
          oninput="document.getElementById('cfg-pctour-pc-v').textContent=this.value+'px'"
          onchange="localStorage.setItem('su_pcomp_tour_panel_pc',this.value);try{render();}catch(e){}" style="width:100%">
        <div id="cfg-pctour-pc-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${panelPc}px</div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">패널(모바일)</div>
        <input type="range" id="cfg-pctour-mb" min="80" max="200" step="4" value="${panelMb}"
          oninput="document.getElementById('cfg-pctour-mb-v').textContent=this.value+'px'"
          onchange="localStorage.setItem('su_pcomp_tour_panel_mb',this.value);try{render();}catch(e){}" style="width:100%">
        <div id="cfg-pctour-mb-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${panelMb}px</div>
      </div>
    </div>
  </details>`;
};

// 프로리그 대회 팀전 카드 섹션
window.renderCfgProCompTeamCardSection = function(_scfgD) {
  const localStorage = (function(){try{const ls=window.localStorage;const k='__su_ls_test__';ls.setItem(k,'1');ls.removeItem(k);return ls;}catch(e){return{getItem:()=>null,setItem:()=>{},removeItem:()=>{}};} })();
    // ── 프로리그 대회 팀전 카드 ──
    const shape = localStorage.getItem('su_pcomp_team_shape')||'default';
    const showMembers = (localStorage.getItem('su_pcomp_team_show_members')||'1')==='1';
    const scorePc = parseInt(localStorage.getItem('su_pcomp_team_score_pc')||'100',10)||100;
    const shapes = [
      {v:'default',l:'기본',icon:'🃏'},{v:'compact',l:'컴팩트',icon:'📋'},{v:'wide',l:'와이드',icon:'🖼️'},
      {v:'minimal',l:'미니멀',icon:'➖'},{v:'card3d',l:'3D',icon:'🎴'},{v:'glass',l:'유리',icon:'🔮'},
      {v:'sharp',l:'각진',icon:'▬'},{v:'bubble',l:'버블',icon:'💬'},{v:'neon',l:'네온',icon:'⚡'},
      {v:'stripe',l:'스트라이프',icon:'🟦'},{v:'frosted',l:'프로스트',icon:'❄️'},{v:'gradient-bg',l:'그라데이션',icon:'🌈'},
    ];
    return _scfgD('procompgjcard','🏆 프로리그 대회 팀전/중장전 카드') + `
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">프로리그탭 → 프로리그 대회 → 팀전/중장전 기록 카드의 디자인을 설정합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">카드 모양</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${shapes.map(s=>`<button type="button"
            onclick="localStorage.setItem('su_pcomp_team_shape','${s.v}');try{render();}catch(e){}"
            style="padding:4px 10px;border-radius:8px;font-size:var(--fs-caption);font-weight:900;cursor:pointer;border:1.5px solid ${shape===s.v?'var(--blue)':'var(--border2)'};background:${shape===s.v?'#eff6ff':'var(--white)'};color:${shape===s.v?'var(--blue)':'var(--text2)'}">
            ${s.icon} ${s.l}</button>`).join('')}
        </div>
      </div>
      <label style="display:flex;align-items:center;gap:8px;font-size:var(--fs-sm);cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" style="width:15px;height:15px" ${showMembers?'checked':''}
          onchange="localStorage.setItem('su_pcomp_team_show_members',this.checked?'1':'0');try{render();}catch(e){}">
        팀원 목록 표시
      </label>
      <div style="display:grid;grid-template-columns:90px 1fr 52px;gap:10px;align-items:center">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">스코어 크기</div>
        <input type="range" id="cfg-pcteam-score" min="60" max="160" step="5" value="${scorePc}"
          oninput="document.getElementById('cfg-pcteam-score-v').textContent=this.value+'%'"
          onchange="localStorage.setItem('su_pcomp_team_score_pc',this.value);try{render();}catch(e){}" style="width:100%">
        <div id="cfg-pcteam-score-v" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;text-align:right">${scorePc}%</div>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l)">※ 팀전(🤝 팀전 탭)과 중장전(🔥 중장전 탭) 카드에 공통 적용됩니다.</div>
    </div>
  </details>`;
};
