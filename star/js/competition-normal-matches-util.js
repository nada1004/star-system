// competition-normal-matches.js에서 분리됨 (대회 일반경기 - 히스토리연동/유틸)
/* ── getTourneyMatches에 normalMatches 포함 ── */
function getNormalMatchesForHistory() {
  const result = [];
  if (!Array.isArray(typeof tourneys !== 'undefined' ? tourneys : null)) return result;
  tourneys.forEach((tn, ti) => {
    if (tn.type === 'tier') return;
    (tn.normalMatches || []).forEach((m, mi) => {
      if (!m.a || !m.b) return;
      if (m.sa == null || m.sb == null) return;
      result.push({
        _src: 'tour_normal', _tnId: tn.id, _nmi: mi,
        d: m.d || '', n: tn.name, a: m.a, b: m.b,
        sa: m.sa, sb: m.sb, sets: m.sets || [],
        grpName: '일반경기', grpLetter: 'N', grpColor: '#6366f1',
        compName: tn.name
      });
    });
  });
  return result;
}

/* ── 스트리머 상세 — 대회 일반경기 전적 스캔 ── [BUGFIX: inA 미사용 수정] ── */
function scanNormalMatchesForPlayer(playerName, onMatch) {
  if (!Array.isArray(typeof tourneys !== 'undefined' ? tourneys : null)) return;
  tourneys.forEach(tn => {
    if (tn.type === 'tier') return;
    (tn.normalMatches || []).forEach(m => {
      if (!m.a || !m.b || m.sa == null || m.sb == null) return;
      // [BUGFIX] 실제로 해당 선수가 참여한 경기만 콜백
      const participated = (m.sets || []).some(s =>
        (s.games || []).some(g => g.playerA === playerName || g.playerB === playerName)
      );
      if (participated && onMatch) onMatch(m, tn);
    });
  });
}

/* ── 하위 호환: 구버전 팝업 함수 alias ── */
function nmAddMatch(tnId) { if (!_nmBLD || _nmBLD.tnId !== tnId) _nmBLDInit(tnId, -1); render(); }
function nmAddMatchByDate(tnId, dateStr) {
  _nmBLDInit(tnId, -1);
  if (_nmBLD) _nmBLD.date = dateStr === '날짜 미정' ? '' : dateStr;
  render();
}
function nmEditMatch(tnId, idx) { nmStartEdit(tnId, idx); }

try {
  window.rCompNormalMatches = rCompNormalMatches;
  window.nmAddMatch = nmAddMatch;
  window.nmAddMatchByDate = nmAddMatchByDate;
  window.nmEditMatch = nmEditMatch;
  window.nmDelMatch = nmDelMatch;
  window.nmSaveFromBuilder = nmSaveFromBuilder;
  window.nmStartEdit = nmStartEdit;
  window._nmOpenEditModal = _nmOpenEditModal;
  window._nmRenderEditModal = _nmRenderEditModal;
  window.nmCloseEditModal = nmCloseEditModal;
  window.nmSaveFromBuilderModal = nmSaveFromBuilderModal;
  window.nmOpenPasteModal = nmOpenPasteModal;
  window._nmPasteApplyLogic = _nmPasteApplyLogic;
  window._nmBLDInit = _nmBLDInit;
  window.nmOpenDetailModal = nmOpenDetailModal;
  window.nmOpenShareCard = nmOpenShareCard;
  window.getNormalMatchesForHistory = getNormalMatchesForHistory;
  window.scanNormalMatchesForPlayer = scanNormalMatchesForPlayer;
  window._nmToggleDateCollapse = _nmToggleDateCollapse;
  window._nmExportCsv = _nmExportCsv;
} catch (e) { }
