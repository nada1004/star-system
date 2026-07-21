function onPasteModeChange(val) {
  const compWrap = document.getElementById('paste-comp-wrap');
  const hint     = document.getElementById('paste-mode-hint');
  if (compWrap) compWrap.style.display = val === 'comp' ? 'flex' : 'none';
  const hints = {
    individual: '개인 전적 히스토리에만 기록됩니다.',
    mini:       '미니대전 기록으로 저장됩니다. 팀은 승자/패자 소속 대학으로 자동 결정됩니다.',
    univm:      '대학대전 기록으로 저장됩니다. 팀은 승자/패자 소속 대학으로 자동 결정됩니다.',
    pro:        '프로리그 기록으로 저장됩니다. 승자는 A팀, 패자는 B팀으로 분류됩니다.',
    comp:       '대회 기록으로 저장됩니다. 아래 대회명을 입력하세요.',
  };
  if (hint) hint.textContent = hints[val] || '';
  // 기준 선수 입력란: 개인전 모드일 때만 표시
  const refWrap = document.getElementById('paste-ref-player-wrap');
  if (refWrap) refWrap.style.display = (val === 'ind') ? 'flex' : 'none';
  if (val === 'ind') {
    const dl = document.getElementById('paste-ref-player-list');
    if (dl && typeof players !== 'undefined') {
      dl.innerHTML = players.flatMap(p => {
        const opts = [`<option value="${(p.name||'').replace(/"/g,'&quot;')}">`];
        if (p.memo) {
          p.memo.split(/[\s,，\n]+/).map(m=>m.trim()).filter(m=>m&&m!==p.name&&m.length>=2)
            .forEach(alias => opts.push(`<option value="${alias.replace(/"/g,'&quot;')}">`));
        }
        return opts;
      }).join('');
    }
  }
  _updatePasteTeamNameFields(val);
}

/* ── 팀명 직접 입력(자동인식 팝업) ── */
function _updatePasteTeamNameFields(val){
  const wrap = document.getElementById('paste-team-name-wrap');
  if (!wrap) return;
  const fm = window._forcedPasteMode;
  const show = (val === 'ck' || val === 'comp' || fm === 'tt' || fm === 'pro' || fm === 'ck');
  wrap.style.display = show ? 'flex' : 'none';
  const aInp = document.getElementById('paste-team-a-name');
  const bInp = document.getElementById('paste-team-b-name');
  if (aInp) aInp.placeholder = (val === 'ck') ? 'A조명 (선택)' : 'A팀명 (선택)';
  if (bInp) bInp.placeholder = (val === 'ck') ? 'B조명 (선택)' : 'B팀명 (선택)';
}

function onPasteTeamNameInput(){
  const a = (document.getElementById('paste-team-a-name')?.value || '').trim();
  const b = (document.getElementById('paste-team-b-name')?.value || '').trim();
  window._pasteForceTeamA = a || null;
  window._pasteForceTeamB = b || null;
  if ((document.getElementById('paste-input')?.value || '').trim()) {
    pastePreview();
  } else if (window._pasteResults) {
    renderPastePreview(window._pasteResults, window._pasteErrors || []);
  }
}

function setPasteMatchMode(mode){
  window._pasteMatchMode = mode;
  const lblGame = document.getElementById('match-mode-label-game');
  const lblSet  = document.getElementById('match-mode-label-set');
  const hint    = document.getElementById('paste-match-mode-hint');
  if(lblGame){
    if(mode==='game'){
      lblGame.style.cssText='display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1;transition:.15s';
      lblSet.style.cssText='display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid var(--border2);background:var(--white);color:var(--text3);transition:.15s';
      if(hint) hint.textContent='경기 방식: 1경기·2경기·3경기 → 이긴 경기 수 많은 팀 우승';
    } else {
      lblSet.style.cssText='display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1;transition:.15s';
      lblGame.style.cssText='display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid var(--border2);background:var(--white);color:var(--text3);transition:.15s';
      if(hint) hint.textContent='세트제: 세트별로 경기를 묶어 세트를 많이 이긴 팀 우승';
    }
  }
  renderPastePreview(window._pasteResults, window._pasteErrors || []);
}

function swapPasteTeams(){
  // A↔B 팀 교체: 모든 경기의 wPlayer(A칸)↔lPlayer(B칸) 스왑
  if (!window._pasteResults) return;
  // 팀 전체 교체: A↔B (leftName/rightName + win/lose 모두 반전)
  window._pasteForceTeamA = window._previewTeamB || null;
  window._pasteForceTeamB = window._previewTeamA || null;
  window._pasteResults = window._pasteResults.map(r => ({
    ...r,
    winName:     r.loseName,
    loseName:    r.winName,
    leftName:    r.rightName || r.loseName,
    rightName:   r.leftName  || r.winName,
    wPlayer:     r.lPlayer,
    lPlayer:     r.wPlayer,
    wCandidates: r.lCandidates || [],
    lCandidates: r.wCandidates || [],
    wSimilar:    r.lSimilar || [],
    lSimilar:    r.wSimilar || [],
  }));
  renderPastePreview(window._pasteResults, window._pasteErrors || []);
}

function closePasteModal() {
  window._gjProPaste = false;
  // 강제 모드(미니/대학대전)였다면 모드 선택기 원복
  if (window._forcedPasteMode) {
    window._forcedPasteMode = null;
    const modeSel = document.getElementById('paste-mode');
    const modeLbl = document.getElementById('paste-mode-label');
    if (modeSel) modeSel.style.display = '';
    if (modeLbl) modeLbl.style.display = '';
    const hintEl = document.getElementById('paste-mode-hint');
    if (hintEl) hintEl.textContent = '';
  }
  // 대회 세트 모드였다면 UI 원복
  if (window._grpPasteMode) {
    window._grpPasteMode = false;
    const _pd=document.querySelector('#pasteModal details');if(_pd)_pd.style.display='';
    const _md=document.getElementById('paste-match-mode-game')?.closest('div[style]');if(_md)_md.style.display='';
    const _pt=document.querySelector('#pasteModal .mtitle');if(_pt)_pt.textContent='📋 경기 결과 붙여넣기 입력';
    const compWrap = document.getElementById('paste-comp-wrap');
    if(compWrap) {
      compWrap.style.display='none';
      compWrap.innerHTML='<input type="text" id="paste-comp-name" placeholder="대회명 입력" style="border:1px solid var(--border2);border-radius:7px;padding:5px 10px;font-size:var(--fs-base);width:180px">';
    }
    const hintEl = document.getElementById('paste-mode-hint');
    if(hintEl) hintEl.textContent='';
    const modeSel = document.getElementById('paste-mode');
    if(modeSel) { modeSel.style.display=''; }
    const modeLabel = document.getElementById('paste-mode-label');
    if(modeLabel) { modeLabel.style.display=''; }
    const applyBtn = document.getElementById('paste-apply-btn');
    if(applyBtn) applyBtn.textContent='✅ 저장하기';
  }
  window._pasteForceTeamA = null;
  window._pasteForceTeamB = null;
  window._pasteMatchMode = 'game';
  const swapRow = document.getElementById('paste-team-swap-row');
  if(swapRow) swapRow.style.display='none';
  // Reset match mode UI
  const lblGame = document.getElementById('match-mode-label-game');
  const lblSet  = document.getElementById('match-mode-label-set');
  if(lblGame) lblGame.style.cssText='display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid #0284c7;background:#e0f2fe;color:#0369a1;transition:.15s';
  if(lblSet)  lblSet.style.cssText='display:inline-flex;align-items:center;gap:5px;cursor:pointer;font-size:var(--fs-sm);font-weight:600;padding:4px 12px;border-radius:20px;border:1.5px solid var(--border2);background:var(--white);color:var(--text3);transition:.15s';
  cm('pasteModal');
}

function openPasteModal() {
  if (!isLoggedIn) return alert('로그인이 필요합니다.');
  window._grpPasteMode = false; // 일반 모드로 초기화
  window._forcedPasteMode = null; // 강제 모드 초기화
  // 매번 열 때 초기화
  const textarea  = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn  = document.getElementById('paste-apply-btn');
  const badge     = document.getElementById('paste-summary-badge');
  const pendWarn  = document.getElementById('paste-pending-warn');
  if (textarea)  {
    textarea.value = '';
    // 사용자가 이전에 textarea 높이를 늘려둔 경우(리사이즈) 다음번에 공백이 크게 남는 문제 방지
    textarea.style.height = '140px';
  }
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn)  applyBtn.style.display = 'none';
  if (badge)     badge.style.display = 'none';
  if (pendWarn)  pendWarn.style.display = 'none';
  window._pasteResults = null;
  window._pasteErrors  = null;
  window._pasteRosterA = null;
  window._pasteRosterB = null;
  window._pasteForceTeamA = null;
  window._pasteForceTeamB = null;
  const refWrap = document.getElementById('paste-ref-player-wrap');
  if (refWrap) refWrap.style.display = 'none';
  const refInput = document.getElementById('paste-ref-player');
  if (refInput) refInput.value = '';
  const teamAInp = document.getElementById('paste-team-a-name');
  const teamBInp = document.getElementById('paste-team-b-name');
  if (teamAInp) teamAInp.value = '';
  if (teamBInp) teamBInp.value = '';

  const dateInput = document.getElementById('paste-date');
  if (dateInput) {
    // Don't load from localStorage, but keep existing value if set
    if (!dateInput.value) {
      dateInput.value = new Date().toISOString().slice(0, 10);
    }
  }

  // 모드 선택기 원상 복구
  const modeSel = document.getElementById('paste-mode');
  const modeLbl = document.getElementById('paste-mode-label');
  if (modeSel) modeSel.style.display = '';
  if (modeLbl) modeLbl.style.display = '';

  // 모드 힌트 초기화
  const modeEl = document.getElementById('paste-mode');
  if (modeEl) onPasteModeChange(modeEl.value);

  // 티어대회 구분 선택 UI는 기본 숨김
  try{
    const stWrap = document.getElementById('paste-tt-stage-wrap');
    if(stWrap) stWrap.style.display='none';
  }catch(e){}

  om('pasteModal');
}

/* ── 미니대전 전용 붙여넣기 ── */
function openMiniPasteModal() {
  window._miniPasteType = (typeof miniType !== 'undefined' ? miniType : 'mini');
  openPasteModal();
  window._forcedPasteMode = 'mini';
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'mini'; sel.style.display = 'none'; onPasteModeChange('mini'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  const isCivil = window._miniPasteType === 'civil';
  if (hint) hint.innerHTML = `<span style="color:#7c3aed;font-weight:700">${isCivil?'⚔️ 시빌워':'⚡ 미니대전'} 경기 결과 입력 모드</span>`;
}

/* ── 대학CK 전용 붙여넣기 ── */
function openCKPasteModal() {
  openPasteModal();
  window._forcedPasteMode = 'ck';
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'ck'; sel.style.display = 'none'; onPasteModeChange('ck'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = '<span style="color:#7c3aed;font-weight:700">🤝 대학CK 경기 결과 입력 모드</span>';
}

/* ── 개인전 전용 붙여넣기 ── */
function openIndPasteModal() {
  openPasteModal();
  window._forcedPasteMode = 'ind';
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'ind'; sel.style.display = 'none'; onPasteModeChange('ind'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = '<span style="color:#7c3aed;font-weight:700">🎮 개인전 경기 결과 입력 모드</span>';
  // 기준 선수 입력란 표시 + 자동완성 채우기
  const refWrap = document.getElementById('paste-ref-player-wrap');
  if (refWrap) refWrap.style.display = 'flex';
  const dl = document.getElementById('paste-ref-player-list');
  if (dl && typeof players !== 'undefined') {
    dl.innerHTML = players.flatMap(p => {
      const opts = [`<option value="${(p.name||'').replace(/"/g,'&quot;')}">`];
      if (p.memo) {
        p.memo.split(/[\s,，\n]+/).map(m=>m.trim()).filter(m=>m&&m!==p.name&&m.length>=2)
          .forEach(alias => opts.push(`<option value="${alias.replace(/"/g,'&quot;')}">`));
      }
      return opts;
    }).join('');
  }
}

/* ── 끝장전 전용 붙여넣기 ── */
function openGJPasteModal() {
  openPasteModal();
  window._forcedPasteMode = 'gj';
  window._gjProPaste = false; // ✅ 끝장전 탭에서 호출 시 프로리그 끝장전 플래그 초기화
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'ind'; sel.style.display = 'none'; onPasteModeChange('ind'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = '<span style="color:#7c3aed;font-weight:700">⚔️ 끝장전 경기 결과 입력 모드</span>';
}

/* ── 티어대회 전용 붙여넣기 ── */
function openTTPasteModal() {
  openPasteModal();
  window._forcedPasteMode = 'tt';
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'mini'; sel.style.display = 'none'; }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  // (요청사항) "구분(일반/조별/토너)" 선택은 대전기록-외부 자동인식에서만 노출
  // - 티어대회 탭 내부 자동인식에서는 불필요한 선택 UI가 떠서 혼란을 유발
  const _fromHistExt = !!window._pasteFromHistExt;
  if (hint) hint.innerHTML = _fromHistExt
    ? '<span style="color:#7c3aed;font-weight:700">🎯 티어대회 경기 결과 입력 모드</span> <span style="color:var(--gray-l);font-weight:600">(외부 자동인식: 일반/조별/토너 선택)</span>'
    : '<span style="color:#7c3aed;font-weight:700">🎯 티어대회 경기 결과 입력 모드</span>';
  const compWrap = document.getElementById('paste-comp-wrap');
  if (compWrap) {
    const inp = compWrap.querySelector('#paste-comp-name');
    if (inp) { inp.placeholder = '티어대회명 입력 (선택)'; inp.value = _ttCurComp||''; }
    compWrap.style.display = 'flex';
  }
  _updatePasteTeamNameFields('mini');
  // (요청사항) 티어대회 구분(일반/조별리그/토너먼트)
  try{
    const stWrap = document.getElementById('paste-tt-stage-wrap');
    const stSel = document.getElementById('paste-tt-stage');
    if(stWrap) stWrap.style.display = _fromHistExt ? 'flex' : 'none';
    // 외부 자동인식일 때만 기억값을 사용
    const saved = _fromHistExt ? (localStorage.getItem('su_tt_paste_stage') || 'general') : 'general';
    if(stSel){
      stSel.value = saved;
      stSel.onchange = function(){
        if(!_fromHistExt) return;
        try{ localStorage.setItem('su_tt_paste_stage', this.value); }catch(e){}
      };
    }
  }catch(e){}
}

/* ── 대회 전용 붙여넣기 ── */
function openCompPasteModal() {
  openPasteModal();
  window._forcedPasteMode = 'comp';
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'comp'; sel.style.display = 'none'; onPasteModeChange('comp'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = '<span style="color:#7c3aed;font-weight:700">🎖️ 대회 경기 결과 입력 모드</span>';
  // 대회 모드에서는 티어대회 구분 숨김
  try{
    const stWrap = document.getElementById('paste-tt-stage-wrap');
    if(stWrap) stWrap.style.display='none';
  }catch(e){}
}

/* ── 대학대전 전용 붙여넣기 ── */
function openUnivmPasteModal() {
  openPasteModal();
  window._forcedPasteMode = 'univm';
  const sel = document.getElementById('paste-mode');
  const lbl = document.getElementById('paste-mode-label');
  if (sel) { sel.value = 'univm'; sel.style.display = 'none'; onPasteModeChange('univm'); }
  if (lbl) lbl.style.display = 'none';
  const hint = document.getElementById('paste-mode-hint');
  if (hint) hint.innerHTML = '<span style="color:#7c3aed;font-weight:700">🏟️ 대학대전 경기 결과 입력 모드</span>';
}
