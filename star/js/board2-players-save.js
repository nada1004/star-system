/* ══════════════════════════════════════════════════════════════
   보드2 - 프로필 저장 (board2-players.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function saveB2Profile(playerName) {
  const player = players.find(p => p.name === playerName);
  if (!player) return;
  
  const photoUrl = (document.getElementById('b2-ed-photo')?.value || '').trim();
  const secondProfileUrl = (document.getElementById('b2-ed-second-profile')?.value || '').trim();
  const thirdProfileUrl = (document.getElementById('b2-ed-photo3')?.value || '').trim();
  const fourthProfileUrl = (document.getElementById('b2-ed-photo4')?.value || '').trim();
  const fifthProfileUrl = (document.getElementById('b2-ed-photo5')?.value || '').trim();
  const sixthProfileUrl = (document.getElementById('b2-ed-photo6')?.value || '').trim();
  const seventhProfileUrl = (document.getElementById('b2-ed-photo7')?.value || '').trim();
  const eighthProfileUrl = (document.getElementById('b2-ed-photo8')?.value || '').trim();
  const ninthProfileUrl = (document.getElementById('b2-ed-photo9')?.value || '').trim();
  const tenthProfileUrl = (document.getElementById('b2-ed-photo10')?.value || '').trim();
  const clampDelay = (v)=>{
    const n = parseFloat(v);
    if(isNaN(n)) return 1;
    return Math.max(0.2, Math.min(60, n));
  };
  
  const anyBase64 = [photoUrl, secondProfileUrl, thirdProfileUrl, fourthProfileUrl, fifthProfileUrl, sixthProfileUrl, seventhProfileUrl, eighthProfileUrl, ninthProfileUrl, tenthProfileUrl].some(u=>u && u.startsWith('data:'));
  if (anyBase64) {
    alert('❌ 프로필 사진에 base64 이미지(data:...)를 직접 붙여넣으면 동기화 저장이 실패할 수 있습니다.\n\n이미지를 imgur.com, Discord 등에 업로드한 후 URL을 사용하세요.');
    return;
  }
  
  player.photo = photoUrl || undefined;
  player.secondProfileFile = secondProfileUrl || undefined;
  player.profileFile3 = thirdProfileUrl || undefined;
  player.profileFile4 = fourthProfileUrl || undefined;
  player.profileFile5 = fifthProfileUrl || undefined;
  player.profileFile6 = sixthProfileUrl || undefined;
  player.profileFile7 = seventhProfileUrl || undefined;
  player.profileFile8 = eighthProfileUrl || undefined;
  player.profileFile9 = ninthProfileUrl || undefined;
  player.profileFile10 = tenthProfileUrl || undefined;
  try{
    document.querySelectorAll('#b2-profile-edit-modal [data-b2-delay-key]').forEach(inp=>{
      const key = String(inp?.getAttribute('data-b2-delay-key') || '').trim();
      if(!key) return;
      // [FIX] 예전에는 값이 1(구 기본값 표기)이면 무조건 삭제해서, 사용자가 실제로 원하는
      // 전환 시간을 입력해도 저장 시 사라지고 런타임 기본값(4초)으로 되돌아가는 문제가 있었음.
      // 이제는 입력된 값을 항상 그대로 저장한다.
      player[key] = clampDelay(inp?.value ?? player[key] ?? 4);
    });
  }catch(e){}
  
  save();

  document.getElementById('b2-profile-edit-modal').remove();

  // [FIX-NO-GRID-REFRESH] 예전에는 저장할 때마다 #b2-content 전체를 innerHTML로
  // 다시 그려서(=_b2PlayersView() 재호출), 이미 캐시된 다른 선수들의 카드 이미지까지
  // DOM에서 새로 생성되며 "스트리머탭 전체가 새로고침되는" 것처럼 보이는 문제가 있었음.
  // 이제는 수정한 선수의 카드 1장만 교체하고, 좌측 메인(히어로)도 그 선수가 현재
  // 선택돼 있을 때만 갱신해서 나머지 카드/이미지는 전혀 건드리지 않는다.
  const _b2ContentEl = document.getElementById('b2-content');
  if (_b2ContentEl && typeof _b2PlayersView === 'function') {
    const _cardUpdated = (typeof _b2UpdatePlayerCard === 'function') ? _b2UpdatePlayerCard(playerName) : false;
    if (!_cardUpdated) {
      // 카드가 화면에 없거나(필터에 의해 숨겨짐 등) 갱신에 실패한 경우에만
      // 안전하게 그리드 전체를 다시 그린다.
      _b2ContentEl.innerHTML = _b2PlayersView();
      try{ if(typeof injectUnivIcons === 'function') injectUnivIcons(_b2ContentEl); }catch(e){}
    }
    if (_b2SelectedPlayer && _b2SelectedPlayer.name === playerName) {
      _b2UpdateMainDisplay(playerName);
    }
  } else {
    // board2 화면이 아니면(다른 탭에서 저장된 경우 등) 안전하게 전체 렌더
    render();
    if (_b2SelectedPlayer && _b2SelectedPlayer.name === playerName) {
      _b2UpdateMainDisplay(playerName);
    }
  }
}

/* ══════════════════════════════════════
   🏆 티어별 뷰
══════════════════════════════════════ */
/* ══════════════════════════════════════
   🏆 티어별 뷰 v2 — 기본접힘 + 승률 + 이번주활동 + 대학분포바
══════════════════════════════════════ */
/* ══════════════════════════════════════
   🥇 랭킹 뷰 — 대학별 종합 랭킹 리더보드
══════════════════════════════════════ */
/* ══════════════════════════════════════
   🏆 랭킹 뷰 v2 — 정렬기준 전환 + 실전승률 + 순위변동
══════════════════════════════════════ */
window._b2RankingSort = window._b2RankingSort || 'tier';
