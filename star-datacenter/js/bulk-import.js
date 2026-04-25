/* ══════════════════════════════════════
   📋 경기 대량 입력 (설정탭)
   bulk-import.js
   - biPreview(): 입력 텍스트 실시간 파싱 → 미리보기
   - biModeChange(): 저장 대상 변경 시 UI 업데이트
   - biApply(): 미리보기 확인 후 저장
══════════════════════════════════════ */

// 저장 대상 변경 시 경기명 입력란 표시 여부 조정
function biModeChange() {
  const mode = document.getElementById('bi-mode')?.value || '';
  const wrap = document.getElementById('bi-compname-wrap');
  if (wrap) {
    // 경기명이 의미있는 모드만 표시
    wrap.style.display = ['mini','univ','ck','gj','pro','individual'].includes(mode) ? '' : 'none';
  }
}

/* ── 한 줄 파싱 ──
 * 우선순위 1: parsePasteLine (search.js) — 이모지/vs/🆚 등 포괄 형식
 * 우선순위 2: 탭 구분 5열 형식 (날짜 선수A 선수B 맵 결과) — 스프레드시트 붙여넣기
 * 우선순위 3: 탭 구분 4열 형식 (선수A 선수B 맵 결과)
 */
function _biParseLine(line, defaultDate) {
  line = line.replace(/[\u3164\u00A0\u200B\u202F\u205F\u3000\uFEFF]/g, ' ').trim();
  if (!line) return null;

  // 우선순위 1: parsePasteLine — 이모지/vs/화살표 등 기존 붙여넣기 시스템과 동일
  if (typeof parsePasteLine === 'function') {
    const p = parsePasteLine(line);
    if (p && p.winName && p.loseName) {
      return { winName: p.winName, loseName: p.loseName, map: p.map || '-', date: defaultDate };
    }
  }

  // 우선순위 2/3: 탭 구분 형식 (스프레드시트 복사 등)
  if (line.includes('\t')) {
    const cols = line.split('\t').map(c => c.trim());
    // 5열: 날짜 선수A 선수B 맵 결과
    if (cols.length >= 5 && /^\d{4}-\d{2}-\d{2}$/.test(cols[0])) {
      const date = cols[0];
      const nameA = cols[1].replace(/\s*\([TZPtzpNn]\)\s*$/, '').trim();
      const nameB = cols[2].replace(/\s*\([TZPtzpNn]\)\s*$/, '').trim();
      const map   = cols[3] || '-';
      const res   = cols[4];
      if (nameA && nameB) {
        const isAWin = res === '승' || res.toLowerCase() === 'win' || res === 'W' || res === 'w';
        const isALose = res === '패' || res.toLowerCase() === 'loss' || res === 'L' || res === 'l';
        if (isAWin)  return { winName: nameA, loseName: nameB, map, date };
        if (isALose) return { winName: nameB, loseName: nameA, map, date };
        return { winName: nameA, loseName: nameB, map, date, _ambiguous: true };
      }
    }
    // 4열: 선수A 선수B 맵 결과
    if (cols.length >= 4 && !/^\d{4}-\d{2}-\d{2}$/.test(cols[0])) {
      const nameA = cols[0].replace(/\s*\([TZPtzpNn]\)\s*$/, '').trim();
      const nameB = cols[1].replace(/\s*\([TZPtzpNn]\)\s*$/, '').trim();
      const map   = cols[2] || '-';
      const res   = cols[3];
      if (nameA && nameB) {
        const isAWin  = res === '승' || res.toLowerCase() === 'win';
        const isALose = res === '패' || res.toLowerCase() === 'loss';
        if (isAWin)  return { winName: nameA, loseName: nameB, map, date: defaultDate };
        if (isALose) return { winName: nameB, loseName: nameA, map, date: defaultDate };
        return { winName: nameA, loseName: nameB, map, date: defaultDate, _ambiguous: true };
      }
    }
  }

  return null;
}

// 선수 찾기 — findPlayerByPartialName 위임
function _biFind(name) {
  if (!name) return null;
  if (typeof findPlayerByPartialName === 'function') {
    const r = findPlayerByPartialName(name);
    return r.player || null;
  }
  return players.find(p => p.name === name) || null;
}

// 전역 파싱 결과 캐시
window._biRows = [];

/* ── 미리보기 렌더 ── */
function biPreview() {
  const raw = document.getElementById('bi-input')?.value || '';
  const defaultDate = document.getElementById('bi-date')?.value || new Date().toISOString().slice(0, 10);
  const previewEl = document.getElementById('bi-preview');
  if (!previewEl) return;

  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) { previewEl.innerHTML = ''; window._biRows = []; return; }

  const rows = [];
  lines.forEach((line, idx) => {
    const parsed = _biParseLine(line, defaultDate);
    if (!parsed) {
      rows.push({ _raw: line, _err: '인식 불가' });
      return;
    }
    const wPlayer = _biFind(parsed.winName);
    const lPlayer = _biFind(parsed.loseName);
    rows.push({
      _raw: line,
      date: parsed.date || defaultDate,
      winName: parsed.winName,
      loseName: parsed.loseName,
      map: parsed.map || '-',
      wPlayer,
      lPlayer,
      _ambiguous: parsed._ambiguous || false,
    });
  });
  window._biRows = rows;

  // 통계
  const ok    = rows.filter(r => r.wPlayer && r.lPlayer && !r._err).length;
  const warn  = rows.filter(r => !r._err && (!r.wPlayer || !r.lPlayer)).length;
  const err   = rows.filter(r => r._err).length;

  let h = `<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap">
    <span style="font-size:12px;font-weight:700">파싱 결과: 총 ${rows.length}줄</span>
    <span style="background:#dcfce7;color:#15803d;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700">✅ 저장 가능 ${ok}건</span>
    ${warn ? `<span style="background:#fef3c7;color:#b45309;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700">⚠️ 선수 미인식 ${warn}건</span>` : ''}
    ${err  ? `<span style="background:#fee2e2;color:#dc2626;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700">❌ 파싱 오류 ${err}건</span>` : ''}
  </div>`;

  h += `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead><tr style="background:var(--surface)">
      <th style="padding:6px 8px;text-align:left;border-bottom:2px solid var(--border);white-space:nowrap">#</th>
      <th style="padding:6px 8px;text-align:left;border-bottom:2px solid var(--border);white-space:nowrap">날짜</th>
      <th style="padding:6px 8px;text-align:left;border-bottom:2px solid var(--border)">승자</th>
      <th style="padding:6px 8px;text-align:left;border-bottom:2px solid var(--border)">패자</th>
      <th style="padding:6px 8px;text-align:left;border-bottom:2px solid var(--border)">맵</th>
      <th style="padding:6px 8px;text-align:left;border-bottom:2px solid var(--border)">상태</th>
    </tr></thead><tbody>`;

  rows.forEach((r, i) => {
    if (r._err) {
      h += `<tr style="background:#fff5f5">
        <td style="padding:5px 8px;color:var(--gray-l)">${i+1}</td>
        <td colspan="5" style="padding:5px 8px;color:#dc2626;font-family:monospace;font-size:11px">❌ ${r._err}: ${r._raw.slice(0, 60)}</td>
      </tr>`;
      return;
    }
    const rowBg = r.wPlayer && r.lPlayer ? '' : 'background:#fffbeb';
    const wCell = r.wPlayer
      ? `<span style="font-weight:700;color:#15803d">${r.wPlayer.name}</span>${r.wPlayer.name!==r.winName?` <span style="font-size:10px;color:var(--gray-l)">(입력: ${r.winName})</span>`:''}`
      : `<span style="font-weight:700;color:#dc2626">❓ ${r.winName}</span>`;
    const lCell = r.lPlayer
      ? `<span style="font-weight:700;color:#b91c1c">${r.lPlayer.name}</span>${r.lPlayer.name!==r.loseName?` <span style="font-size:10px;color:var(--gray-l)">(입력: ${r.loseName})</span>`:''}`
      : `<span style="font-weight:700;color:#dc2626">❓ ${r.loseName}</span>`;
    const status = r.wPlayer && r.lPlayer
      ? (r._ambiguous ? '⚠️ 결과 불명' : '✅ 저장 가능')
      : '⚠️ 선수 미인식';
    h += `<tr style="${rowBg}">
      <td style="padding:5px 8px;color:var(--gray-l)">${i+1}</td>
      <td style="padding:5px 8px;color:var(--text3);white-space:nowrap">${r.date}</td>
      <td style="padding:5px 8px">${wCell}</td>
      <td style="padding:5px 8px">${lCell}</td>
      <td style="padding:5px 8px;color:var(--text3)">${r.map}</td>
      <td style="padding:5px 8px;font-size:11px;white-space:nowrap">${status}</td>
    </tr>`;
  });

  h += '</tbody></table></div>';
  previewEl.innerHTML = h;
}

/* ── 저장 ── */
function biApply() {
  if (!isLoggedIn) { alert('로그인이 필요합니다.'); return; }
  const rows = window._biRows || [];
  const savable = rows.filter(r => r.wPlayer && r.lPlayer && !r._err && !r._ambiguous);
  if (!savable.length) {
    alert('저장 가능한 경기가 없습니다.\n선수명이 인식되지 않은 경기가 있으면 수정 후 다시 시도하세요.');
    return;
  }

  const mode = document.getElementById('bi-mode')?.value || 'individual';
  const compName = document.getElementById('bi-compname')?.value?.trim() || '';
  const msgEl = document.getElementById('bi-result-msg');

  if (!confirm(`${savable.length}건을 저장하시겠습니까?\n저장 대상: ${document.getElementById('bi-mode').options[document.getElementById('bi-mode').selectedIndex].text}`)) return;

  let savedCount = 0;
  const matchId = typeof genId === 'function' ? genId() : ('bi_' + Date.now());

  savable.forEach((r, idx) => {
    const w = r.wPlayer, l = r.lPlayer;
    const date = r.date;
    const map  = r.map;
    const mid  = matchId + '_' + idx;

    if (mode === 'history_only') {
      // history에만 추가, 승패/ELO 업데이트 포함
      if (typeof applyGameResult === 'function') {
        applyGameResult(w.name, l.name, date, map, mid, w.univ, l.univ, 'bulk');
        savedCount++;
      }
      return;
    }

    // applyGameResult로 history + 승패 + ELO 처리
    if (typeof applyGameResult === 'function') {
      applyGameResult(w.name, l.name, date, map, mid, w.univ, l.univ, mode);
    }

    // 대전 기록 배열에도 추가
    const entry = {
      wName: w.name, lName: l.name,
      map, d: date, _id: mid,
      ...(compName ? { _label: compName } : {}),
    };

    if (mode === 'mini' && typeof miniM !== 'undefined') {
      miniM.unshift(entry);
    } else if (mode === 'univ' && typeof univM !== 'undefined') {
      univM.unshift({ ...entry, wUniv: w.univ || '', lUniv: l.univ || '' });
    } else if (mode === 'ck' && typeof ckM !== 'undefined') {
      ckM.unshift(entry);
    } else if (mode === 'individual' && typeof indM !== 'undefined') {
      indM.unshift(entry);
    } else if (mode === 'gj' && typeof gjM !== 'undefined') {
      gjM.unshift(entry);
    } else if (mode === 'pro' && typeof proM !== 'undefined') {
      proM.unshift(entry);
    }
    savedCount++;
  });

  if (typeof save === 'function') save();
  if (typeof render === 'function') render();

  if (msgEl) {
    msgEl.textContent = `✅ ${savedCount}건 저장 완료!`;
    setTimeout(() => { if (msgEl) msgEl.textContent = ''; }, 4000);
  }

  // 입력창/미리보기 초기화
  const inp = document.getElementById('bi-input');
  const prev = document.getElementById('bi-preview');
  if (inp) inp.value = '';
  if (prev) prev.innerHTML = '';
  window._biRows = [];
}
