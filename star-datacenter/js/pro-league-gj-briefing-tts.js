/* ══════════════════════════════════════
   pro-league-gj-briefing-tts.js — 프로리그 끝장전 브리핑탭 음성듣기(TTS) 큐 생성/재생 제어
   pro-league-briefing-tts.js와 동일 패턴(window.SUTTS 공용 엔진 사용), pro-league-gj-briefing.js가
   렌더링 시 window._plgbBriefingSpeakSnapshot에 채워둔 값을 읽어 낭독 큐를 만든다.
══════════════════════════════════════ */

function _plgbBriefingBuildSpeakQueue(){
  const d = window._plgbBriefingSpeakSnapshot;
  if (!d) return [];
  const q = [];

  q.push({text:`${d.title}를 읽어드리겠습니다.`});
  q.push({text:`전체 ${d.totalN}세션 중 ${d.doneN}세션이 진행되어 진행률은 ${d.pct}퍼센트입니다.`});

  if (d.headline) q.push({text:d.headline});

  if (Array.isArray(d.winTop) && d.winTop.length) {
    q.push({text:`개인 다승 순위입니다.`});
    d.winTop.forEach((p,i) => {
      q.push({text:`${i+1}위 ${p.name}, ${p.w}승 ${p.l}패, 승률 ${p.rate}%입니다.`});
    });
  }

  if (Array.isArray(d.rateTop) && d.rateTop.length) {
    q.push({text:`개인 승률 순위입니다.`});
    d.rateTop.forEach((p,i) => {
      q.push({text:`${i+1}위 ${p.name}, ${p.w}승 ${p.l}패, 승률 ${p.rate}%입니다.`});
    });
  }

  if (d.mvp) {
    q.push({text:`끝장전 MVP는 ${d.mvp.name}입니다. ${d.mvp.w}승 ${d.mvp.l}패, 승률 ${d.mvp.rate}%를 기록했습니다.`});
  }

  if (d.topMap) {
    q.push({text:`가장 많이 사용된 맵은 ${d.topMap.map}로, ${d.topMap.total}회 사용됐습니다.`});
  }

  q.push({text:`이상으로 프로리그 끝장전 브리핑을 마칩니다.`});
  return q;
}
function _plgbBriefingSpeakBtnLabel(){
  const btn = document.getElementById('plgb-speak-btn');
  if (!btn) return;
  const speaking = !!(window.SUTTS && window.SUTTS.isSpeaking());
  const paused = !speaking && !!(window.SUTTS && window.SUTTS.isPaused && window.SUTTS.isPaused());
  btn.innerHTML = speaking ? '⏸ 일시정지' : (paused ? '▶ 이어듣기' : '🔊 음성듣기');
}
function _plgbBriefingToggleSpeak(){
  if (!window.SUTTS || !('speechSynthesis' in window)) { alert('이 브라우저는 음성 안내를 지원하지 않습니다.'); return; }
  if (window.SUTTS.isSpeaking()) { window.SUTTS.pause(); _plgbBriefingSpeakBtnLabel(); return; }
  if (window.SUTTS.isPaused && window.SUTTS.isPaused()) { window.SUTTS.resume(); _plgbBriefingSpeakBtnLabel(); return; }
  const queue = _plgbBriefingBuildSpeakQueue();
  if (!queue.length) { alert('음성으로 읽어줄 브리핑 내용이 없습니다.'); return; }
  window.SUTTS.speak(queue, { onEnd: _plgbBriefingSpeakBtnLabel });
  _plgbBriefingSpeakBtnLabel();
}
try {
  window._plgbBriefingBuildSpeakQueue = _plgbBriefingBuildSpeakQueue;
  window._plgbBriefingToggleSpeak = _plgbBriefingToggleSpeak;
} catch(e){}
