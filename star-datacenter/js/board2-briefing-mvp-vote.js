/* ══════════════════════════════════════════════════════════════
   브리핑탭 - 이달의 인기 MVP 투표 (신규, 2026-08-17)
   각 대학의 "이번달 에이스(MVP)" 후보 중에서 이용자가 직접 투표해서
   "이달의 인기 MVP"를 뽑는 기능. 기존 승부예측(vote.js)의 voteData
   저장소를 그대로 재사용한다 — 집계(카운트)는 클라우드로 동기화되고,
   내가 누구를 찍었는지(_my)는 이 기기에만 남아 다른 사람 투표에는
   영향을 주지 않는다.

   [투표 규칙]
   - 투표 기간: 그 달 1일 ~ 말일 (달이 바뀌면 voteData 키 자체가
     'mvp_YYYY-MM'으로 바뀌므로 자연스럽게 새 투표로 초기화된다)
   - 여러 명 동시 선택 가능 — 후보를 누르면 그 후보에게 투표, 이미 찍은
     후보를 다시 누르면 그 후보만 취소(다른 선택은 그대로 유지).
   - 같은 후보를 여러 번 눌러도 표가 중복으로 쌓이지 않음(그 후보에
     대한 내 표는 항상 0표 또는 1표).
   ══════════════════════════════════════════════════════════════ */

// dateFrom(YYYY-MM-DD) → 'YYYY-MM' 투표 키 조각
function _b2MvpVoteMonthKey(dateFromStr) {
  return String(dateFromStr || '').slice(0, 7);
}

// 투표 등록/취소 (여러 후보 동시 선택 가능 — 토글 방식)
function _b2CastMvpVote(monthKey, name) {
  try {
    if (!monthKey || !name) return;
    if (typeof voteData === 'undefined') return;
    const key = 'mvp_' + monthKey;
    const myKey = key + '_my';
    if (!voteData[key] || typeof voteData[key] !== 'object') voteData[key] = {};
    const myPicks = Array.isArray(voteData[myKey]) ? voteData[myKey].slice() : [];
    const idx = myPicks.indexOf(name);

    if (idx >= 0) {
      // 이미 찍은 후보를 다시 클릭 → 그 후보만 취소(다른 선택은 유지)
      myPicks.splice(idx, 1);
      if (voteData[key][name]) {
        voteData[key][name] = Math.max(0, voteData[key][name] - 1);
        if (voteData[key][name] === 0) delete voteData[key][name];
      }
    } else {
      // 새 후보 추가 투표 — 기존 선택들은 그대로 두고 이 후보만 추가
      myPicks.push(name);
      voteData[key][name] = (voteData[key][name] || 0) + 1;
    }
    if (myPicks.length) voteData[myKey] = myPicks; else delete voteData[myKey];

    if (typeof saveVotes === 'function') {
      saveVotes();
    } else {
      try { localStorage.setItem('su_votes', JSON.stringify(voteData)); } catch (e) {}
      try { if (typeof save === 'function') save(); } catch (e) {}
    }
    if (typeof render === 'function') render();
  } catch (e) {}
}

// 대학별 에이스(monthlyUnivAces) 중 유효 후보만 뽑아 투표 카드 HTML을 만든다.
function _b2RenderMvpVoteSection(monthKey, monthlyUnivAces) {
  try {
    const candidates = (Array.isArray(monthlyUnivAces) ? monthlyUnivAces : [])
      .filter(item => item && item.ace && item.ace.p && item.ace.p.name)
      .map(item => ({
        name: item.ace.p.name,
        univ: (item.u && item.u.name) || item.ace.p.univ || '',
        col: (typeof gc === 'function') ? gc((item.u && item.u.name) || item.ace.p.univ || '') : '#64748b'
      }));
    if (!candidates.length) {
      return '<div class="b2w2-empty" style="padding:20px 12px;text-align:center;color:var(--gray-l);font-size:var(--fs-sm)">이번 달 대학별 에이스가 아직 없어 투표를 진행할 수 없습니다.</div>';
    }
    const key = 'mvp_' + monthKey;
    const counts = (typeof voteData !== 'undefined' && voteData[key] && typeof voteData[key] === 'object') ? voteData[key] : {};
    const myPicks = (typeof voteData !== 'undefined' && Array.isArray(voteData[key + '_my'])) ? voteData[key + '_my'] : [];
    const total = Object.values(counts).reduce((s, n) => s + (Number(n) || 0), 0);
    const ranked = [...candidates].sort((a, b) => (counts[b.name] || 0) - (counts[a.name] || 0));
    const _esc = (typeof escJS === 'function') ? escJS : (s) => String(s || '').replace(/'/g, "\\'");
    const _escH = (typeof window.escHTML === 'function') ? window.escHTML : (s) => String(s ?? '');

    const rows = ranked.map((c, idx) => {
      const cnt = counts[c.name] || 0;
      const pct = total ? Math.round(cnt / total * 100) : 0;
      const isMine = myPicks.includes(c.name);
      const rankIcon = (cnt > 0 && idx === 0) ? '👑' : (cnt > 0 && idx === 1) ? '🥈' : (cnt > 0 && idx === 2) ? '🥉' : String(idx + 1);
      const photoHtml = (typeof getPlayerPhotoHTML === 'function') ? getPlayerPhotoHTML(c.name, '34px', 'flex-shrink:0') : '';
      return `<div class="b2w2-mvpvote-row" onclick="_b2CastMvpVote('${monthKey}','${_esc(c.name)}')" style="cursor:pointer;display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;border:1.5px solid ${isMine ? c.col : 'var(--border)'};background:${isMine ? c.col + '14' : 'var(--white)'};margin-bottom:6px;transition:border-color .15s,background .15s">
        <span style="width:20px;text-align:center;font-size:13px;flex-shrink:0;color:var(--gray-l);font-weight:800">${rankIcon}</span>
        ${photoHtml}
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
            <span style="font-weight:800;font-size:var(--fs-sm);color:var(--text1);cursor:pointer" onclick="event.stopPropagation();if(typeof openPlayerModal==='function')openPlayerModal('${_esc(c.name)}')">${_escH(c.name)}</span>
            <span style="font-size:10px;font-weight:700;color:${c.col};background:${c.col}1a;padding:1px 6px;border-radius:999px">${_escH(c.univ)}</span>
            ${isMine ? `<span style="font-size:10px;color:${c.col};font-weight:900">✅ 내 투표</span>` : ''}
          </div>
          <div style="height:6px;border-radius:99px;background:rgba(148,163,184,.18);overflow:hidden;margin-top:5px">
            <div style="height:100%;width:${pct}%;background:${c.col};border-radius:99px;transition:width .4s ease"></div>
          </div>
        </div>
        <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text2);flex-shrink:0;min-width:36px;text-align:right">${cnt}표</div>
      </div>`;
    }).join('');

    return `<div class="b2w2-mvpvote-list">${rows}</div>
      <div style="margin-top:6px;font-size:10px;color:var(--gray-l);text-align:center">🗳️ 총 ${total}표 · 여러 명 동시 투표 가능 · 후보를 눌러 투표/취소 · 이번 달 말일까지 진행</div>`;
  } catch (e) { return ''; }
}

try {
  window._b2MvpVoteMonthKey = _b2MvpVoteMonthKey;
  window._b2CastMvpVote = _b2CastMvpVote;
  window._b2RenderMvpVoteSection = _b2RenderMvpVoteSection;
} catch (e) {}
