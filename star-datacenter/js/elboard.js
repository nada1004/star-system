/* ══════════════════════════════════════
   📡 elboard.js — 엘보드 (최근 전적 조회)
   로컬 서버 /api/recent 연동
══════════════════════════════════════ */

let _elbApiBase = localStorage.getItem('su_elb_api') || 'http://localhost:8765';
let _elbResults = null;  // { player, update_time, games:[] }
let _elbSelected = {};   // { index: true/false }
let _elbSaveTab  = localStorage.getItem('su_elb_tab') || 'ind';
let _elbLoading  = false;
let _elbError    = '';

function rElboard(C, T) {
  T.innerText = '📡 엘보드';
  const savedName  = localStorage.getItem('su_elb_name')  || '';
  const savedLimit = localStorage.getItem('su_elb_limit') || '20';
  const apiBase    = _elbApiBase;

  const tabOpts = [
    {v:'ind',  l:'⚔️ 개인전'},
    {v:'gj',   l:'🔥 끝장전'},
    {v:'mini', l:'⚡ 미니대전'},
    {v:'univm',l:'🏟️ 대학대전'},
    {v:'pro',  l:'🏅 프로리그'},
  ];

  let h = `
  <!-- 상단 검색 바 -->
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:12px">
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <div style="flex:1;min-width:160px;position:relative">
        <span style="font-size:11px;font-weight:700;color:var(--gray-l);display:block;margin-bottom:4px">🎮 스트리머</span>
        <input id="elb-name" type="text" value="${savedName.replace(/"/g,'&quot;')}" placeholder="스트리머 이름"
          style="width:100%;padding:8px 12px;border:1.5px solid var(--border2);border-radius:8px;font-size:14px;background:var(--white);color:var(--text);box-sizing:border-box"
          onkeydown="if(event.key==='Enter')elbSearch()">
      </div>
      <div style="min-width:80px">
        <span style="font-size:11px;font-weight:700;color:var(--gray-l);display:block;margin-bottom:4px">📊 개수</span>
        <input id="elb-limit" type="number" min="1" max="200" value="${savedLimit}"
          style="width:80px;padding:8px 10px;border:1.5px solid var(--border2);border-radius:8px;font-size:13px;background:var(--white);color:var(--text);box-sizing:border-box">
      </div>
      <div style="min-width:160px">
        <span style="font-size:11px;font-weight:700;color:var(--gray-l);display:block;margin-bottom:4px">🌐 API 주소</span>
        <input id="elb-api" type="text" value="${apiBase.replace(/"/g,'&quot;')}" placeholder="http://localhost:8765"
          style="width:100%;padding:8px 10px;border:1.5px solid var(--border2);border-radius:8px;font-size:12px;background:var(--white);color:var(--text);box-sizing:border-box"
          onchange="elbSaveApi(this.value)">
      </div>
      <div style="align-self:flex-end">
        <button class="btn btn-b" onclick="elbSearch()" style="padding:9px 20px;font-size:13px">🔍 조회</button>
      </div>
    </div>
  </div>`;

  // 로딩/에러 상태
  if (_elbLoading) {
    h += `<div class="empty-state"><div class="empty-state-icon" style="font-size:36px">⏳</div><div class="empty-state-title">조회 중...</div></div>`;
    C.innerHTML = h;
    return;
  }
  if (_elbError) {
    h += `<div style="padding:20px;background:#fff5f5;border:1.5px solid #fecaca;border-radius:10px;color:#dc2626;font-size:13px;line-height:1.6">
      ❌ <b>오류:</b> ${_elbError.replace(/</g,'&lt;')}<br>
      <span style="font-size:11px;color:var(--gray-l)">로컬 서버(${apiBase})가 실행 중인지 확인하세요.</span>
    </div>`;
    C.innerHTML = h;
    return;
  }

  if (!_elbResults) {
    h += `<div class="empty-state">
      <div class="empty-state-icon">📡</div>
      <div class="empty-state-title">엘보드 조회</div>
      <div class="empty-state-desc">스트리머 이름을 입력하고 조회 버튼을 누르세요.<br>로컬 서버(ssustar_preview_server.py)가 실행 중이어야 합니다.</div>
    </div>`;
    C.innerHTML = h;
    return;
  }

  const games = _elbResults.games || [];
  const playerName = _elbResults.player || savedName;
  const updateTime = _elbResults.update_time || '';

  // 결과 헤더
  h += `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
    <span style="font-weight:900;font-size:16px;color:var(--text)">${playerName}</span>
    ${updateTime?`<span style="font-size:11px;color:var(--gray-l)">갱신: ${updateTime}</span>`:''}
    <span style="font-size:12px;font-weight:700;color:var(--blue);background:var(--blue-l);padding:2px 10px;border-radius:12px">${games.length}건</span>
  </div>`;

  if (!games.length) {
    h += `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div></div>`;
    C.innerHTML = h;
    return;
  }

  // 저장 탭 선택 + 저장 버튼 (상단)
  h += `<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:8px;align-items:center">
    <span style="font-size:11px;font-weight:700;color:var(--gray-l);flex-shrink:0">저장 탭:</span>
    ${tabOpts.map(t=>`<button class="pill ${_elbSaveTab===t.v?'on':''}" style="flex-shrink:0;white-space:nowrap" onclick="elbSetTab('${t.v}')">${t.l}</button>`).join('')}
    <span style="flex:1"></span>
    <button class="pill" style="flex-shrink:0;white-space:nowrap;background:var(--surface)" onclick="elbSelectAll()">전체 선택</button>
    <button class="pill" style="flex-shrink:0;white-space:nowrap;background:var(--surface)" onclick="elbDeselectAll()">선택 해제</button>
    ${isLoggedIn?`<button class="btn btn-b btn-sm" style="flex-shrink:0" onclick="elbSaveSelected()">💾 선택 저장</button>`:''}
  </div>`;

  // 결과 테이블
  h += `<div style="overflow-x:auto">
  <table style="width:100%;min-width:520px">
    <thead>
      <tr>
        <th style="width:32px;text-align:center"><input type="checkbox" id="elb-all-cb" onchange="elbToggleAll(this.checked)" style="width:14px;height:14px;cursor:pointer"></th>
        <th>날짜</th>
        <th>상대</th>
        <th>맵</th>
        <th>결과</th>
        <th>종류</th>
        <th>비고</th>
      </tr>
    </thead>
    <tbody>`;

  games.forEach((g, i) => {
    const isWin  = (g['결과']||'').trim() === '승';
    const isLose = (g['결과']||'').trim() === '패';
    const isSelected = !!_elbSelected[i];
    const opp = g['상대'] || '';
    const oppPlayer = players.find(p => p.name === opp || opp.includes(p.name) || p.name.includes(opp));
    const oppColor = oppPlayer ? gc(oppPlayer.univ) : '#888';

    h += `<tr style="background:${isSelected?'var(--blue-l)':''}">
      <td style="text-align:center;padding:8px 6px">
        <input type="checkbox" data-elb-idx="${i}" ${isSelected?'checked':''} onchange="elbToggleOne(${i},this.checked)"
          style="width:14px;height:14px;cursor:pointer;accent-color:var(--blue)">
      </td>
      <td style="font-size:12px;white-space:nowrap;color:var(--text3)">${g['날짜']||''}</td>
      <td>
        <span style="font-weight:700;font-size:13px${oppPlayer?';cursor:pointer;color:var(--blue)':''}" ${oppPlayer?`onclick="openPlayerModal('${opp.replace(/'/g,"\\'")}')"`:''}>${opp}</span>
        ${oppPlayer?`<span class="ubadge" style="background:${oppColor};font-size:10px;padding:1px 5px;margin-left:4px">${oppPlayer.univ||''}</span>`:'<span style="font-size:10px;color:#f59e0b;margin-left:4px">미등록</span>'}
      </td>
      <td style="font-size:12px;color:var(--text3)">${g['맵']||''}</td>
      <td style="font-weight:800;font-size:13px;color:${isWin?'#16a34a':isLose?'#dc2626':'var(--gray-l)'}">${g['결과']||''}</td>
      <td style="font-size:11px;color:var(--gray-l)">${g['게임종류']||''}</td>
      <td style="font-size:11px;color:var(--gray-l)">${(g['비고']||'').replace(/</g,'&lt;')}</td>
    </tr>`;
  });

  h += `</tbody></table></div>`;

  if (!isLoggedIn) {
    h += `<div style="margin-top:10px;padding:10px 14px;background:var(--surface);border-radius:8px;font-size:12px;color:var(--gray-l)">💡 저장 기능은 관리자 로그인 후 이용 가능합니다.</div>`;
  }

  C.innerHTML = h;
}

function elbSaveApi(val) {
  _elbApiBase = val.trim() || 'http://localhost:8765';
  localStorage.setItem('su_elb_api', _elbApiBase);
}

function elbSetTab(tab) {
  _elbSaveTab = tab;
  localStorage.setItem('su_elb_tab', tab);
  render();
}

function elbSelectAll() {
  if (!_elbResults) return;
  (_elbResults.games||[]).forEach((_,i) => { _elbSelected[i] = true; });
  render();
}

function elbDeselectAll() {
  _elbSelected = {};
  render();
}

function elbToggleAll(checked) {
  if (!_elbResults) return;
  (_elbResults.games||[]).forEach((_,i) => { _elbSelected[i] = !!checked; });
  render();
}

function elbToggleOne(idx, checked) {
  _elbSelected[idx] = !!checked;
  // 체크박스만 업데이트 (render 없이)
  const row = document.querySelector(`tr:has([data-elb-idx="${idx}"])`);
  if (row) row.style.background = checked ? 'var(--blue-l)' : '';
}

async function elbSearch() {
  const nameEl  = document.getElementById('elb-name');
  const limitEl = document.getElementById('elb-limit');
  const apiEl   = document.getElementById('elb-api');
  const name  = (nameEl?.value||'').trim();
  const limit = (limitEl?.value||'20');
  if (apiEl) { _elbApiBase = apiEl.value.trim()||'http://localhost:8765'; localStorage.setItem('su_elb_api', _elbApiBase); }
  if (!name) return alert('스트리머 이름을 입력하세요.');
  localStorage.setItem('su_elb_name',  name);
  localStorage.setItem('su_elb_limit', limit);
  _elbLoading = true;
  _elbError   = '';
  _elbResults = null;
  _elbSelected = {};
  render();
  try {
    const res = await fetch(`${_elbApiBase}/api/recent?name=${encodeURIComponent(name)}&limit=${encodeURIComponent(limit)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    _elbResults = data;
    _elbError   = '';
  } catch(e) {
    _elbError = String(e);
    _elbResults = null;
  }
  _elbLoading = false;
  render();
}

function elbSaveSelected() {
  if (!isLoggedIn) return alert('로그인이 필요합니다.');
  if (!_elbResults) return;
  const games = _elbResults.games || [];
  const selected = games.filter((_,i) => _elbSelected[i]);
  if (!selected.length) return alert('저장할 경기를 선택하세요.');
  const playerName = localStorage.getItem('su_elb_name') || '';

  let saved = 0, skipped = 0;
  const defDate = new Date().toISOString().slice(0,10);

  selected.forEach(g => {
    const opp  = (g['상대']||'').trim();
    const res  = (g['결과']||'').trim();
    const map  = (g['맵']||'').trim();
    const date = (g['날짜']||'').trim() || defDate;
    if (!opp || !res) { skipped++; return; }

    // 현재 스트리머 플레이어 찾기
    const myP  = players.find(p => p.name === playerName || playerName.includes(p.name) || p.name.includes(playerName));
    const oppP = players.find(p => p.name === opp || opp.includes(p.name) || p.name.includes(opp));

    if (!myP || !oppP) { skipped++; return; }

    const isWin = res === '승';
    const wName = isWin ? myP.name : oppP.name;
    const lName = isWin ? oppP.name : myP.name;
    const mapNorm = map && map !== '-' ? map : '';
    const _id = genId();

    if (_elbSaveTab === 'ind') {
      applyGameResult(wName, lName, date, mapNorm || '-', _id, '', '', '개인전');
      indM.unshift({ _id, sid: _id, d: date, wName, lName, map: mapNorm });
      saved++;
    } else if (_elbSaveTab === 'gj') {
      applyGameResult(wName, lName, date, mapNorm || '-', _id, '', '', '끝장전');
      gjM.unshift({ _id, sid: _id, d: date, wName, lName, map: mapNorm });
      saved++;
    } else {
      // 미니/대학/프로 등 팀 경기 방식은 개인전으로 대체
      applyGameResult(wName, lName, date, mapNorm || '-', _id, '', '', '개인전');
      indM.unshift({ _id, sid: _id, d: date, wName, lName, map: mapNorm });
      saved++;
    }
  });

  if (saved > 0) save();
  render();
  const tabName = {ind:'개인전',gj:'끝장전',mini:'미니대전',univm:'대학대전',pro:'프로리그'}[_elbSaveTab]||_elbSaveTab;
  alert(`✅ ${saved}건 저장 완료 (${tabName})${skipped?`\n⚠️ 미등록 선수 ${skipped}건 건너뜀`:''}`);
}
