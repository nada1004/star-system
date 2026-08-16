/* ══════════════════════════════════════════════════════════════
   검색 - 붙여넣기 미리보기 유틸(대학 편향/선수해석) (search-preview.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

// [신규] 팀(대학) 컨텍스트 기반 우선 인식
// - 미니대전/대학대전 등에서 팀A/팀B의 소속 대학명이 확정되어 있으면(_pasteForceTeamA/B),
//   입력한 이름과 부분일치(포함관계) 하면서 해당 대학 소속인 후보가 "유일하게" 있을 때
//   기존 매칭 결과(동명이인/다른 소속)보다 그 팀 소속 멤버를 우선 인식한다.
//   예) "송이"로 입력해도 다른 대학 소속 "송이"보다, 현재 대진의 대학 소속인 "아리송이"를 우선 인식.
// - 팀 컨텍스트가 없을 때(개인전/티어대회 등)는 전혀 개입하지 않는다.
function _pasteUnivBiasCandidate(raw, baseInfo) {
  try {
    const teamNames = [window._pasteForceTeamA, window._pasteForceTeamB].filter(Boolean);
    if (!teamNames.length) return null;
    const cleaned = String(raw || '').trim().replace(/\s*[TZPNtzpn]$/i, '').trim();
    if (!cleaned || cleaned.length < 2) return null;
    const univCandidates = (players || []).filter(p => {
      if (!p || !p.name || !p.univ) return false;
      if (!teamNames.includes(p.univ)) return false;
      return p.name.includes(cleaned) || cleaned.includes(p.name);
    });
    if (univCandidates.length !== 1) return null; // 애매하면 손대지 않음(안전 우선)
    const cand = univCandidates[0];
    // 이미 그 팀 소속으로 정확히 인식된 경우면 바꿀 필요 없음
    if (baseInfo && baseInfo.player && baseInfo.player.name === cand.name) return null;
    if (baseInfo && baseInfo.player && baseInfo.player.univ && teamNames.includes(baseInfo.player.univ)) return null;
    return cand;
  } catch (e) { return null; }
}

function _pasteResolvePlayer(name) {
  const raw = String(name || '').trim();
  if (!raw) return { name: '', player: null, candidates: [], similar: [] };
  let baseInfo = null;
  try {
    if (typeof window.resolvePlayerName === 'function') {
      const info = window.resolvePlayerName(raw);
      if (info && info.player) {
        baseInfo = {
          name: info.player.name,
          player: info.player,
          candidates: Array.isArray(info.candidates) && info.candidates.length ? info.candidates : [info.player],
          similar: []
        };
      } else if (info && Array.isArray(info.candidates) && info.candidates.length) {
        baseInfo = { name: raw, player: null, candidates: info.candidates, similar: [] };
      }
    }
  } catch (e) {}
  if (!baseInfo) {
    const match = (typeof findPlayerByPartialName === 'function')
      ? findPlayerByPartialName(raw)
      : { player: null, candidates: [], similar: [] };
    baseInfo = {
      name: match && match.player ? match.player.name : raw,
      player: match ? match.player : null,
      candidates: match && Array.isArray(match.candidates) ? match.candidates : [],
      similar: match && Array.isArray(match.similar) ? match.similar : []
    };
  }
  const univBiasPlayer = _pasteUnivBiasCandidate(raw, baseInfo);
  if (univBiasPlayer) {
    return { name: univBiasPlayer.name, player: univBiasPlayer, candidates: [univBiasPlayer], similar: [] };
  }
  return baseInfo;
}

