/* ══════════════════════════════════════
   pro-comp-briefing-tts.js — 프로리그 대회 브리핑탭 음성듣기(TTS) 큐 생성/재생 제어
   board2-briefing-tts.js와 동일 패턴(window.SUTTS 공용 엔진 사용), pro-comp-briefing.js가
   렌더링 시 window._pcbBriefingSpeakSnapshot에 채워둔 값을 읽어 낭독 큐를 만든다.
══════════════════════════════════════ */

function _pcbBriefingBuildSpeakQueue(){
  const d = window._pcbBriefingSpeakSnapshot;
  if (!d) return [];
  const q = [];

  q.push({text:`${d.title}를 읽어드리겠습니다.`});
  q.push({text:`전체 ${d.totalM}경기 중 ${d.doneM}경기가 진행되어 진행률은 ${d.pct}퍼센트입니다. 조별리그·대진표 ${d.indivN}경기, 팀전 ${d.teamN}경기, 중장전 ${d.gjN}경기로 구성되어 있습니다.`});

  if (d.headline) q.push({text:d.headline});

  if (d.champion) q.push({text:`이번 대회 우승자는 ${d.champion.name}입니다.`});

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
    q.push({text:`대회 MVP는 ${d.mvp.name}입니다. ${d.mvp.w}승 ${d.mvp.l}패, 승률 ${d.mvp.rate}%${d.mvp.gjW ? `, 중장전 ${d.mvp.gjW}승` : ''}을 기록했습니다.`});
  }

  if (Array.isArray(d.upcoming) && d.upcoming.length) {
    q.push({text:`다음 라운드 예고입니다.`});
    d.upcoming.forEach(m => {
      q.push({text:`${m.rLabel || ''} ${m.a} 대 ${m.b}입니다.`});
    });
  }

  q.push({text:`이상으로 프로리그 브리핑을 마칩니다.`});
  return q;
}
function _pcbBriefingSpeakBtnLabel(){
  const btn = document.getElementById('pcb-speak-btn');
  if (!btn) return;
  const speaking = !!(window.SUTTS && window.SUTTS.isSpeaking());
  const paused = !speaking && !!(window.SUTTS && window.SUTTS.isPaused && window.SUTTS.isPaused());
  btn.innerHTML = speaking ? '⏸ 일시정지' : (paused ? '▶ 이어듣기' : '🔊 음성듣기');
}
function _pcbBriefingToggleSpeak(){
  if (!window.SUTTS || !('speechSynthesis' in window)) { alert('이 브라우저는 음성 안내를 지원하지 않습니다.'); return; }
  if (window.SUTTS.isSpeaking()) { window.SUTTS.pause(); _pcbBriefingSpeakBtnLabel(); return; }
  if (window.SUTTS.isPaused && window.SUTTS.isPaused()) { window.SUTTS.resume(); _pcbBriefingSpeakBtnLabel(); return; }
  const queue = _pcbBriefingBuildSpeakQueue();
  if (!queue.length) { alert('음성으로 읽어줄 브리핑 내용이 없습니다.'); return; }
  window.SUTTS.speak(queue, { onEnd: _pcbBriefingSpeakBtnLabel });
  _pcbBriefingSpeakBtnLabel();
}
try {
  window._pcbBriefingBuildSpeakQueue = _pcbBriefingBuildSpeakQueue;
  window._pcbBriefingToggleSpeak = _pcbBriefingToggleSpeak;
} catch(e){}
