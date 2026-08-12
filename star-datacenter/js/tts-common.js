/* ══════════════════════════════════════════════════════════════
   🔊 공통 TTS 유틸 (Web Speech API)
   - 라인업 음성듣기 / 알등이봇 메시지 듣기 / 경기 상세 팝업 듣기에서 공용 사용
   - 호칭 규칙: "OO 선수" / "OO 스트리머" → 이름만 읽어준다.
══════════════════════════════════════════════════════════════ */
(function(){
  if (typeof window === 'undefined') return;

  var _speaking = false, _queue = [], _idx = 0, _opts = {};

  // ── 숫자 → 한글(한자어) 표기 (스코어 등 "N 대 M" 낭독용, 0~9999) ──
  var _KO_DIGIT = ['영','일','이','삼','사','오','육','칠','팔','구'];
  var _KO_UNIT4 = ['', '십', '백', '천'];
  function _koSino(n){
    n = Math.floor(Math.abs(Number(n) || 0));
    if (n === 0) return '영';
    if (n > 9999) return String(n); // 범위 밖은 안전하게 원문 유지
    var s = '';
    var str = String(n);
    var len = str.length;
    for (var i = 0; i < len; i++){
      var d = Number(str[i]);
      var place = len - i - 1; // 0=일, 1=십, 2=백, 3=천
      if (d === 0) continue;
      // "일십"이 아니라 "십"처럼, 앞자리가 1이고 십 단위 이상일 때는 숫자를 생략
      if (d === 1 && place > 0) s += _KO_UNIT4[place];
      else s += _KO_DIGIT[d] + _KO_UNIT4[place];
    }
    return s;
  }

  // ── 날짜 표기: 2026.08.06 / 2026-08-06 / 2026/08/06 → 2026년 8월 6일 ──
  function _convertDates(t){
    return t.replace(/\b(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})\b/g, function(_, y, mo, d){
      return y + '년 ' + parseInt(mo, 10) + '월 ' + parseInt(d, 10) + '일';
    });
  }

  // ── 스코어 표기: "5 대 3" / "5대3" → "오 대 삼" (한글 숫자로 명확히 낭독) ──
  function _convertScores(t){
    return t.replace(/(\d{1,4})\s*대\s*(\d{1,4})/g, function(_, a, b){
      return _koSino(a) + ' 대 ' + _koSino(b);
    });
  }

  // ── "%" 기호는 "퍼센트"로 풀어 읽어야 훨씬 자연스럽게 들린다 ──
  function _convertPercent(t){
    return t.replace(/(\d+(?:\.\d+)?)\s*%/g, '$1퍼센트');
  }

  function sanitize(t){
    var s = String(t == null ? '' : t)
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/선수단/g, '\u0001')     // 고유표현 보호
      .replace(/선수권/g, '\u0002')
      // 호칭(OO 선수 / OO 스트리머)은 읽지 않고 이름만 읽는다.
      .replace(/\s*(선수|스트리머)(?=$|[\s,.!?)\]]|[은는이가을를와과의도에])/g, '')
      .replace(/\u0001/g, '선수단')
      .replace(/\u0002/g, '선수권');
    s = _convertDates(s);
    s = _convertScores(s);
    s = _convertPercent(s);
    return s.replace(/\s+/g, ' ').trim();
  }

  function pickKoVoice(){
    try{
      var voices = (window.speechSynthesis && window.speechSynthesis.getVoices()) || [];
      return voices.find(function(v){ return /^ko[-_]KR$/i.test(v.lang); })
          || voices.find(function(v){ return /^ko/i.test(v.lang); }) || null;
    }catch(e){ return null; }
  }

  function finish(){
    _speaking = false; _queue = []; _idx = 0;
    try{ window.speechSynthesis && window.speechSynthesis.cancel(); }catch(e){}
    try{ if (typeof _opts.onEnd === 'function') _opts.onEnd(); }catch(e){}
    _opts = {};
  }

  function speakNext(){
    if (!_speaking || _idx >= _queue.length) { finish(); return; }
    var item = _queue[_idx++];
    var text = sanitize(item && typeof item === 'object' ? item.text : item);
    try{ if (typeof _opts.onItem === 'function') _opts.onItem(item, _idx - 1); }catch(e){}
    if (!text) { speakNext(); return; }
    try{
      var utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ko-KR';
      var v = pickKoVoice();
      if (v) utter.voice = v;
      // 조금 더 차분하고 부드러운 속도/톤 (기존보다 살짝 느리게)
      utter.rate = (_opts.rate || 0.96);
      utter.pitch = (_opts.pitch != null ? _opts.pitch : 1.0);
      var advanced = false, watchdog = null;
      var advanceOnce = function(){
        if (advanced) return;
        advanced = true;
        try{ clearTimeout(watchdog); }catch(e){}
        // 문장 사이에 짧은 숨 고르기 텀을 둬서 뚝뚝 끊기지 않고 자연스럽게 이어지도록 함
        var gap = (_opts.gapMs != null ? _opts.gapMs : 220);
        if (gap > 0) setTimeout(speakNext, gap); else speakNext();
      };
      utter.onend = advanceOnce;
      utter.onerror = function(ev){ try{ console.warn('[TTS] utterance 오류', ev && ev.error); }catch(e){} advanceOnce(); };
      // 일부 브라우저(Chrome)는 onend가 오지 않고 멈추는 버그가 있어 워치독으로 강제 진행
      watchdog = setTimeout(advanceOnce, Math.max(4000, text.length * 280));
      try{ window.speechSynthesis.resume(); }catch(e){}
      window.speechSynthesis.speak(utter);
    }catch(e){
      try{ console.warn('[TTS] speak 실패', e); }catch(e2){}
      speakNext();
    }
  }

  function start(items, opts){
    if (!('speechSynthesis' in window)) { try{ alert('이 브라우저는 음성 안내를 지원하지 않습니다.'); }catch(e){} return false; }
    stop();
    _queue = Array.isArray(items) ? items.slice() : [items];
    if (!_queue.length) return false;
    _opts = opts || {};
    _idx = 0;
    _speaking = true;

    var go = function(){ speakNext(); };
    try{
      var already = window.speechSynthesis.getVoices();
      if (already && already.length) { go(); }
      else {
        var started = false;
        var onVoices = function(){
          if (started) return;
          started = true;
          try{ window.speechSynthesis.removeEventListener('voiceschanged', onVoices); }catch(e){}
          go();
        };
        try{ window.speechSynthesis.addEventListener('voiceschanged', onVoices); }catch(e){}
        setTimeout(onVoices, 300);
        try{ window.speechSynthesis.getVoices(); }catch(e){}
      }
    }catch(e){ go(); }
    return true;
  }

  function stop(){
    if (!_speaking) {
      try{ window.speechSynthesis && window.speechSynthesis.cancel(); }catch(e){}
      _opts = {};
      return;
    }
    _speaking = false;
    var end = _opts && _opts.onEnd;
    _queue = []; _idx = 0; _opts = {};
    try{ window.speechSynthesis && window.speechSynthesis.cancel(); }catch(e){}
    try{ if (typeof end === 'function') end(); }catch(e){}
  }

  window.SUTTS = {
    speak: start,
    stop: stop,
    toggle: function(items, opts){ if (_speaking) { stop(); return false; } return start(items, opts); },
    isSpeaking: function(){ return _speaking; },
    sanitize: sanitize
  };
})();
