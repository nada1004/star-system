/* ══════════════════════════════════════
   board2-briefing-tts.js — 브리핑 탭 음성듣기(TTS) 큐 생성/재생 제어
   board2-briefing-view.js에서 분리됨
══════════════════════════════════════ */

function _b2BriefingBuildSpeakQueue(){
  const d = window._b2BriefingSpeakSnapshot;
  if (!d) return [];
  const fmtDate = s => String(s||'').slice(0,10).replace(/-/g,'.');
  const q = [];

  q.push({text:`${d.title}, ${fmtDate(d.dateFrom)}부터 ${fmtDate(d.dateTo)}까지의 브리핑을 읽어드리겠습니다.`});
  q.push({text:`이 기간 총 경기 수는 ${d.totalGames}경기이고, 활동한 스트리머는 ${d.activePlayerCount}명, 활동한 대학은 ${d.activeUnivCount}곳입니다.`});

  if (d.mvp && d.mvp.p) {
    q.push({text:`${d.isMonthly ? '이달' : '이번 주'} MVP는 ${d.mvp.p.name}입니다. ${d.mvp.wins}승 ${d.mvp.losses}패, 승률 ${d.mvp.winRate}%를 기록했습니다.`});
  }
  if (d.mvp2 && d.mvp2.p) {
    q.push({text:`MVP 2위는 ${d.mvp2.p.name}입니다. ${d.mvp2.wins}승 ${d.mvp2.losses}패, 승률 ${d.mvp2.winRate}%를 기록했습니다.`});
  }
  if (d.worstPlayer && d.worstPlayer.p) {
    q.push({text:`이번 기간 최다 패배는 ${d.worstPlayer.p.name}로, ${d.worstPlayer.wins}승 ${d.worstPlayer.losses}패를 기록했습니다.`});
  }

  if (d.isMonthly && Array.isArray(d.rankedUnivs) && d.rankedUnivs.length) {
    q.push({text:`대학 순위입니다.`});
    d.rankedUnivs.slice(0, 5).forEach((u, i) => {
      q.push({text:`${i+1}위 ${u.u.name}, ${u.tw}승 ${u.tl}패, 승률 ${u.wr ?? 0}%입니다.`});
    });
  } else if (Array.isArray(d.topUnivs) && d.topUnivs.length) {
    q.push({text:`활동량이 많은 대학입니다.`});
    d.topUnivs.forEach((u, i) => {
      q.push({text:`${i+1}위 ${u.u.name}, ${u.tg}경기, 활동 인원 ${u.active.length}명입니다.`});
    });
  }

  if (Array.isArray(d.silentUnivs) && d.silentUnivs.length) {
    q.push({text:`이번 기간 활동이 없었던 대학은 ${d.silentUnivs.join(', ')}입니다.`});
  }

  if (d.hotPlayer && d.hotPlayer.p && d.hotPlayer.wrDelta > 0) {
    q.push({text:`상승세를 보인 스트리머는 ${d.hotPlayer.p.name}로, 승률이 지난 기간보다 ${Math.abs(d.hotPlayer.wrDelta)}퍼센트 포인트 올랐습니다.`});
  }
  if (d.coldPlayer && d.coldPlayer.p && d.coldPlayer.wrDelta < 0) {
    q.push({text:`하락세를 보인 스트리머는 ${d.coldPlayer.p.name}로, 승률이 지난 기간보다 ${Math.abs(d.coldPlayer.wrDelta)}퍼센트 포인트 떨어졌습니다.`});
  }
  if (d.streakPlayer && d.streakPlayer.p && d.streakPlayer.streak >= 2) {
    q.push({text:`${d.streakPlayer.p.name}가 ${d.streakPlayer.streak}연승을 달리고 있습니다.`});
  }
  if (d.loseStreakPlayer && d.loseStreakPlayer.p && d.loseStreakPlayer.streak >= 2) {
    q.push({text:`${d.loseStreakPlayer.p.name}가 ${d.loseStreakPlayer.streak}연패에 빠져 있습니다.`});
  }
  if (d.bestWrPlayer && d.bestWrPlayer.p) {
    q.push({text:`최고 승률은 ${d.bestWrPlayer.p.name}로, 승률 ${d.bestWrPlayer.winRate}%입니다.`});
  }
  if (d.mostWinsPlayer && d.mostWinsPlayer.p) {
    q.push({text:`최다승은 ${d.mostWinsPlayer.p.name}로, ${d.mostWinsPlayer.wins}승을 기록했습니다.`});
  }
  if (d.mostActivePlayer && d.mostActivePlayer.p) {
    q.push({text:`가장 활발히 활동한 스트리머는 ${d.mostActivePlayer.p.name}로, ${d.mostActivePlayer.total}경기를 치렀습니다.`});
  }

  q.push({text:`이상으로 브리핑을 마칩니다.`});
  return q;
}
function _b2BriefingSpeakBtnLabel(){
  const btn = document.getElementById('b2w2-speak-btn');
  if (!btn) return;
  const speaking = !!(window.SUTTS && window.SUTTS.isSpeaking());
  const paused = !speaking && !!(window.SUTTS && window.SUTTS.isPaused && window.SUTTS.isPaused());
  btn.innerHTML = speaking ? '⏸ 일시정지' : (paused ? '▶ 이어듣기' : '🔊 음성듣기');
}
function _b2BriefingToggleSpeak(){
  if (!window.SUTTS || !('speechSynthesis' in window)) { alert('이 브라우저는 음성 안내를 지원하지 않습니다.'); return; }
  if (window.SUTTS.isSpeaking()) { window.SUTTS.pause(); _b2BriefingSpeakBtnLabel(); return; }
  if (window.SUTTS.isPaused && window.SUTTS.isPaused()) { window.SUTTS.resume(); _b2BriefingSpeakBtnLabel(); return; }
  const queue = _b2BriefingBuildSpeakQueue();
  if (!queue.length) { alert('음성으로 읽어줄 브리핑 내용이 없습니다.'); return; }
  window.SUTTS.speak(queue, { onEnd: _b2BriefingSpeakBtnLabel });
  _b2BriefingSpeakBtnLabel();
}
try {
  window._b2BriefingBuildSpeakQueue = _b2BriefingBuildSpeakQueue;
  window._b2BriefingToggleSpeak = _b2BriefingToggleSpeak;
} catch(e){}
