// competition-normal-matches.js에서 분리됨 (대회 일반경기 - 상세팝업/삭제/붙여넣기)
/* ── 일반 경기 상세 팝업 ── */
function nmOpenDetailModal(tnId, idx) {
  const _mdDesignMode = (()=>{ try{ const v=(localStorage.getItem('su_md_design_mode')||'classic').trim(); return ['classic','glass','editorial','sunset','aurora','mono','retro','paper','holo','league','noir','blueprint'].includes(v)?v:'classic'; }catch(e){ return 'classic'; } })();
  const _mdLayoutMode = (()=>{ try{ const v=(localStorage.getItem('su_md_layout_mode')||'default').trim(); return ['default','compact','focus','broadcast','split','poster','arena','scoreboard','cute','magazine','nintendo'].includes(v)?v:'default'; }catch(e){ return 'default'; } })();
  const tn = (typeof tourneys !== 'undefined' ? tourneys : []).find(t => t.id === tnId); if (!tn) return;
  const m = (tn.normalMatches || [])[idx]; if (!m) return;
  const caBase = gc(m.a || ''), cbBase = gc(m.b || '');
  const ca = (typeof _getMatchDetailTeamHeaderColor === 'function') ? _getMatchDetailTeamHeaderColor('', 'A', caBase) : caBase;
  const cb = (typeof _getMatchDetailTeamHeaderColor === 'function') ? _getMatchDetailTeamHeaderColor('', 'B', cbBase) : cbBase;
  const isDone = m.sa != null && m.sb != null;
  const aWin = isDone && m.sa > m.sb, bWin = isDone && m.sb > m.sa;

  try {
    const titleEl = document.getElementById('cmdTitle');
    const subEl = document.getElementById('cmdSub');
    const bar = document.getElementById('cmdScoreBar');
    const headActions = document.getElementById('cmdHeadActions');
    const safe = (s) => String(s || '').replace(/[<>]/g, '');
    const _nmScore = isDone ? `${m.sa}:${m.sb}` : '';
    if (titleEl) titleEl.textContent = `📅 ${safe(m.a || 'A팀')}${_nmScore ? ` ${_nmScore}` : ''} VS ${safe(m.b || 'B팀')}`;
    const dStr = m.d ? String(m.d).slice(0, 10) : '';
    if (subEl) subEl.textContent = [tn.name ? `📊 ${tn.name}` : '', dStr ? `📅 ${dStr}` : ''].filter(Boolean).join(' · ');
    if (bar) {
      if (isDone) {
        const loseA = bWin, loseB = aWin;
        const aBg = loseA ? 'linear-gradient(180deg,rgba(248,250,252,.98),rgba(241,245,249,.96))' : (ca || '#6366f1');
        const bBg = loseB ? 'linear-gradient(180deg,rgba(248,250,252,.98),rgba(241,245,249,.96))' : (cb || '#8b5cf6');
        const aBd = loseA ? 'rgba(203,213,225,.88)' : _compMenuTint(ca || '#6366f1', .46);
        const bBd = loseB ? 'rgba(203,213,225,.88)' : _compMenuTint(cb || '#8b5cf6', .46);
        const aFg = loseA ? '#1f2937' : '#ffffff';
        const bFg = loseB ? '#1f2937' : '#ffffff';
        const uicon = (team) => {
          try {
            const url = (window.UNIV_ICONS && window.UNIV_ICONS[team]) || ((univCfg.find(x => x && x.name === team) || {}).icon) || '';
            return url ? `<span style="display:inline-flex;align-items:center;justify-content:center"><img class="cmd-uicon" src="${toHttpsUrl(url)}" style="object-fit:contain;background:transparent;border:none;border-radius:0;padding:0" onerror="this.parentNode.style.display='none'"></span>` : '';
          } catch (e) { return ''; }
        };
        bar.innerHTML = `<div class="cmd-score">
          <div class="cmd-team" style="background:${aBg};border:1px solid ${aBd};justify-content:center;text-align:center;position:relative;color:${aFg};padding:0 18px"><span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-weight:1000;font-size:22px;text-align:center;display:inline-flex;align-items:center;justify-content:center;gap:8px;max-width:calc(100% - 78px);white-space:nowrap">${uicon(m.a || '')}<span>${safe(m.a || 'A팀')}</span></span></div>
          <div class="cmd-mid"><span style="color:${aWin ? 'var(--win-col)' : bWin ? 'var(--lose-col)' : '#111827'}">${m.sa}</span><span class="cmd-colon">:</span><span style="color:${bWin ? 'var(--win-col)' : aWin ? 'var(--lose-col)' : '#111827'}">${m.sb}</span></div>
          <div class="cmd-team" style="background:${bBg};border:1px solid ${bBd};justify-content:center;text-align:center;position:relative;color:${bFg};padding:0 18px"><span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-weight:1000;font-size:22px;text-align:center;display:inline-flex;align-items:center;justify-content:center;gap:8px;max-width:calc(100% - 78px);white-space:nowrap">${uicon(m.b || '')}<span>${safe(m.b || 'B팀')}</span></span></div>
        </div>`;
        bar.style.display = 'block';
      } else { bar.innerHTML = ''; bar.style.display = 'none'; }
    }
    if (headActions) {
      const _adm = (localStorage.getItem('su_share_admin_only') || '0') === '1';
      const okShare = (!_adm || isLoggedIn) && isDone;
      let btnHtml = '';
      const canStyle = !!isLoggedIn && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
      if (isLoggedIn) {
        btnHtml += `<button class="btn btn-w btn-xs" style="display:inline-flex;align-items:center;gap:5px;padding:7px 12px;border-radius:999px;font-weight:700" onclick="cm('compMatchDetailModal');nmStartEdit('${tnId}',${idx})">✏️ 수정</button>`;
      }
      if (canStyle) {
        btnHtml += `<button class="btn btn-w btn-xs detail-act-md-style" style="display:inline-flex;align-items:center;gap:5px;padding:7px 12px;border-radius:999px;font-weight:700" title="스타일 전환" onclick="event.stopPropagation();try{_mdToggleStylePicker(event);}catch(e){console.error('[mdStyleBtn]',e);}">🎨</button>`;
      }
      if (okShare) {
        btnHtml += `<button class="btn btn-p btn-xs" style="display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:104px;padding:7px 12px;border-radius:999px;background:linear-gradient(135deg,#7c3aed,#2563eb);border:1px solid rgba(255,255,255,.24);box-shadow:0 8px 20px rgba(37,99,235,.22);color:#fff;font-weight:900" onclick="nmOpenShareCard('${tnId}',${idx})">🎴 공유 카드</button>`;
      }
      headActions.innerHTML = btnHtml;
    }
    window._cmdDetailState = { tnId, gi: null, mi: null, rnd: null, isManual: false, isNm: true, nmIdx: idx };
  } catch (e) { }

  const content = document.getElementById('compMatchDetailContent');
  if (content) {
    const _editRefNm = isLoggedIn ? `nm:${tnId}:${idx}` : null;
    const _mForDetail = _editRefNm ? { ...m, _editRef: _editRefNm } : m;
    window.__detailCtx = 'compModal';
    content.innerHTML = `<div class="cmd-detail">${(typeof buildDetailHTML === 'function') ? buildDetailHTML(_mForDetail, 'mini', m.a || 'A팀', m.b || 'B팀', ca, cb, aWin, bWin) : '<div style="color:var(--gray-l);padding:20px;text-align:center">상세 기록이 없습니다</div>'}</div>`;
  }
  try{
    const modal=document.getElementById('compMatchDetailModal');
    if(modal){
      modal.setAttribute('data-md-mode', _mdDesignMode);
      modal.setAttribute('data-md-layout', _mdLayoutMode);
    }
  }catch(e){}
  try { if (typeof om === 'function') om('compMatchDetailModal'); } catch (e) { }
}

/* ── 일반 경기 공유카드 ── */
async function nmOpenShareCard(tnId, idx) {
  try {
    if (typeof window._ensureStatsLoaded === 'function') await window._ensureStatsLoaded();
    const tn = (typeof tourneys !== 'undefined' ? tourneys : []).find(t => t.id === tnId); if (!tn) return;
    const m = (tn.normalMatches || [])[idx]; if (!m || m.sa == null) return;
    const payload = {
      ...m, a: m.a || '', b: m.b || '', sa: m.sa, sb: m.sb, d: m.d || '',
      n: tn.name, compName: tn.name, teamALabel: m.a || '', teamBLabel: m.b || '',
      sets: m.sets || [], stage: 'league', _matchType: 'comp', grpName: '일반 경기', grpLetter: 'N'
    };
    if (typeof window._openShareMatchObjCard === 'function') window._openShareMatchObjCard(payload);
    else if (typeof openShareCardModal === 'function') {
      window._shareMatchObj = payload; window._shareMode = 'match'; openShareCardModal();
      const _run = () => { try { if (window._shareMatchObj && typeof renderShareCardByMatchObj === 'function') renderShareCardByMatchObj(window._shareMatchObj); } catch (e) { } };
      if (typeof window._shareCardDeferRender === 'function') window._shareCardDeferRender(_run);
      else setTimeout(_run, 0);
    }
  } catch (e) { console.error('[nmOpenShareCard]', e); }
}

/* ── 삭제 ── */
function nmDelMatch(tnId, idx) {
  // 브라우저 기본 confirm 대신 역산 불가 경고를 포함한 커스텀 모달 사용
  _nmConfirmDel(function() {
    const tn = (typeof tourneys !== 'undefined' ? tourneys : []).find(t => t.id === tnId); if (!tn) return;
    tn.normalMatches = tn.normalMatches || [];
    const m = tn.normalMatches[idx];
    if (m && m._id) {
      const matchId = m._id;
      const gameIds = new Set();
      (m.sets || []).forEach((s, si) => (s.games || []).forEach((_, gi) => {
        gameIds.add(`${matchId}_s${si}_g${gi}`);
        gameIds.add(`${matchId}_g${gi}`); // 구버전 ID 호환
      }));
      if (Array.isArray(typeof players !== 'undefined' ? players : [])) {
        players.forEach(p => {
          if (!Array.isArray(p.history)) return;
          p.history = p.history.filter(h => h.matchId !== matchId && !gameIds.has(h.matchId));
        });
      }
    }
    tn.normalMatches.splice(idx, 1);
    if (_nmBLD && _nmBLD.tnId === tnId && _nmBLD.editIdx === idx) _nmBLD = null;
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
    try { if (typeof window.refreshPlayerModalIfOpen === 'function') window.refreshPlayerModalIfOpen(); } catch (e) { }

    // 삭제 완료 토스트
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:10px 20px;border-radius:20px;font-size:var(--fs-base);font-weight:700;z-index:var(--z-top);pointer-events:none;box-shadow:0 4px 20px rgba(0,0,0,.3)';
    toast.innerHTML = '🗑️ 삭제 완료 · 승패/ELO는 <b>설정 › 전체 재계산</b>에서 갱신해 주세요';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  });
}

/* ── 삭제 확인 모달 (역산 불가 사전 안내 포함) ── */
function _nmConfirmDel(onConfirm) {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:var(--z-modal-5);display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML = `
    <div style="background:var(--white);border-radius:14px;padding:24px 22px 18px;max-width:340px;width:100%;box-shadow:0 10px 40px rgba(0,0,0,.3)">
      <div style="font-size:var(--fs-md);font-weight:800;color:var(--text);margin-bottom:10px">🗑️ 일반 경기 삭제</div>
      <div style="font-size:var(--fs-base);color:var(--text2);line-height:1.6;margin-bottom:6px">이 경기를 삭제하시겠습니까?</div>
      <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:8px;padding:10px 12px;font-size:var(--fs-sm);color:#92400E;line-height:1.6;margin-bottom:18px">
        ⚠️ <b>삭제 후 승패·ELO는 자동으로 역산되지 않습니다.</b><br>
        삭제 완료 후 <b>설정 › 전체 재계산</b>을 실행해야 수치가 반영됩니다.
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="_nmDelCancel" style="padding:7px 16px;border-radius:8px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-base);font-weight:700;cursor:pointer;color:var(--text2)">취소</button>
        <button id="_nmDelOk" style="padding:7px 16px;border-radius:8px;border:none;background:#EF4444;color:#fff;font-size:var(--fs-base);font-weight:700;cursor:pointer">삭제</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  const close = () => { try { ov.remove(); } catch(e) {} };
  ov.querySelector('#_nmDelCancel').addEventListener('click', close);
  ov.querySelector('#_nmDelOk').addEventListener('click', function() { close(); onConfirm(); });
  ov.addEventListener('click', function(e) { if (e.target === ov) close(); });
}

/* ── 자동인식 (pasteModal 재활용) ── */
function nmOpenPasteModal(tnId) {
  _nmPasteApply_tnId = tnId;
  _nmSetupPasteModal(tnId);
}

var _nmPasteApply_tnId = null;

function _nmSetupPasteModal(tnId) {
  const tn = (typeof tourneys !== 'undefined' ? tourneys : []).find(t => t.id === tnId); if (!tn) return;
  const bld = (_nmBLD && _nmBLD.tnId === tnId) ? _nmBLD : null;
  const teamA = bld ? bld.teamA : null;
  const teamB = bld ? bld.teamB : null;

  const textarea = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn = document.getElementById('paste-apply-btn');
  const badge = document.getElementById('paste-summary-badge');
  const pendWarn = document.getElementById('paste-pending-warn');
  if (textarea) textarea.value = '';
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn) { applyBtn.style.display = 'none'; applyBtn.textContent = '✅ 일반 경기에 적용'; }
  if (badge) badge.style.display = 'none';
  if (pendWarn) pendWarn.style.display = 'none';
  window._pasteResults = null; window._pasteErrors = null;

  const dateInput = document.getElementById('paste-date');
  if (dateInput) dateInput.value = (bld && bld.date) || '';

  const modeSel = document.getElementById('paste-mode');
  const modeLabel = document.getElementById('paste-mode-label');
  if (modeSel) { modeSel.value = 'comp'; modeSel.style.display = 'none'; }
  if (modeLabel) modeLabel.style.display = 'none';

  const hintEl = document.getElementById('paste-mode-hint');
  if (hintEl) {
    if (teamA && teamB) {
      hintEl.innerHTML = `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#16a34a;font-weight:700">🎮 일반 경기 자동인식</span> — <b>${teamA}</b> vs <b>${teamB}</b><br><span style="font-size:var(--fs-caption);color:#6b7280">경기 결과를 자동 인식해 빌더에 불러옵니다.</span></div>`;
    } else {
      hintEl.innerHTML = `<div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px 12px;margin-bottom:4px"><span style="color:#16a34a;font-weight:700">🎮 일반 경기 자동인식</span> — 선수 소속 대학을 자동 인식합니다.<br><span style="font-size:var(--fs-caption);color:#6b7280">팀 정보가 없으면 소속 대학 기준으로 자동 구분합니다.</span></div>`;
    }
  }

  const setSelWrap = document.getElementById('grp-paste-set-wrap');
  if (setSelWrap) setSelWrap.style.display = 'none';

  window._grpPasteMode = true;
  window._grpPasteState = { mode: 'normal_match', tnId, idx: -1, teamA, teamB };
  _grpPasteState = { mode: 'normal_match', tnId, idx: -1, teamA, teamB };

  if (typeof om === 'function') om('pasteModal');
}

/* ── 자동인식 적용 — 빌더에 games 불러오기 [개선: 저장이 아닌 빌더 채우기] ── */
function _nmPasteApplyLogic(savable) {
  const state = window._grpPasteState || _grpPasteState;
  if (!state) return false;
  const { tnId } = state;
  let { teamA, teamB } = state;
  const tn = (typeof tourneys !== 'undefined' ? tourneys : []).find(t => t.id === tnId); if (!tn) return false;

  // 팀 자동 추출 (미지정인 경우)
  if (!teamA || !teamB) {
    const univCount = {};
    savable.forEach(r => {
      [r.wPlayer?.univ, r.lPlayer?.univ].forEach(u => { if (u && u !== '무소속') univCount[u] = (univCount[u] || 0) + 1; });
    });
    // [개선] 동수 시 가나다 정렬 타이브레이커
    const univRanked = Object.entries(univCount).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'));
    if (univRanked.length < 2) { alert('선수 소속 대학을 인식할 수 없습니다.\n팀을 먼저 선택해주세요.'); return false; }
    teamA = univRanked[0][0]; teamB = univRanked[1][0];
  }

  // savable → freeGames 변환
  const teamANamesSet = new Set(); const teamBNamesSet = new Set();
  savable.forEach(r => {
    const wn = r.wPlayer?.name, wu = r.wPlayer?.univ;
    const ln = r.lPlayer?.name, lu = r.lPlayer?.univ;
    if (wn) { if (wu === teamA) teamANamesSet.add(wn); else if (wu === teamB) teamBNamesSet.add(wn); }
    if (ln) { if (lu === teamA) teamANamesSet.add(ln); else if (lu === teamB) teamBNamesSet.add(ln); }
  });

  const _isWinnerInA = (r) => {
    const wn = r.wPlayer.name;
    if (teamANamesSet.has(wn)) return true;
    if (teamBNamesSet.has(wn)) return false;
    return (r.leftName || r.winName) === wn;
  };

  const freeGames = [];
  savable.forEach(r => {
    if (r._scoreOnly) {
      for (let i = 0; i < (r._scoreA || 0); i++) freeGames.push({ playerA: '', playerB: '', winner: 'A', map: '' });
      for (let i = 0; i < (r._scoreB || 0); i++) freeGames.push({ playerA: '', playerB: '', winner: 'B', map: '' });
      return;
    }
    const wn = r.wPlayer.name, ln = r.lPlayer.name;
    const wInA = _isWinnerInA(r);
    freeGames.push({ playerA: wInA ? wn : ln, playerB: wInA ? ln : wn, winner: wInA ? 'A' : 'B', map: r.map || '' });
  });

  const dateEl = document.getElementById('paste-date');
  const dateStr = dateEl?.value || new Date().toISOString().slice(0, 10);

  // [개선] 저장하지 않고 빌더에 채운 후 사용자가 확인 후 저장
  if (!_nmBLD || _nmBLD.tnId !== tnId) {
    _nmBLDInit(tnId, -1);
  }
  _nmBLD.teamA = teamA;
  _nmBLD.teamB = teamB;
  _nmBLD.date = dateStr;
  _nmBLD.freeGames = freeGames;
  _nmBLD.directSA = null;
  _nmBLD.directSB = null;

  window._grpPasteMode = false;
  if (typeof cm === 'function') cm('pasteModal');
  window._pasteResults = null;
  compSub = 'normal';
  if (typeof render === 'function') render();

  // 빌더로 스크롤
  setTimeout(() => {
    const el = document.querySelector('.match-builder--refined');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);

  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:10px 20px;border-radius:20px;font-size:var(--fs-base);font-weight:700;z-index:var(--z-top);pointer-events:none;box-shadow:0 4px 20px rgba(0,0,0,.3)';
  toast.textContent = `📋 ${freeGames.length}경기 자동인식 완료 — 확인 후 저장하세요`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
  return true;
}

