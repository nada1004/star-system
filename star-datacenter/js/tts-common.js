/* ══════════════════════════════════════════════════════════════
   🔊 공통 TTS 유틸 (Web Speech API)
   - 라인업 음성듣기 / 알등이봇 메시지 듣기 / 경기 상세 팝업 듣기에서 공용 사용
   - 호칭 규칙: "OO 선수" / "OO 스트리머" → 이름만 읽어준다.
══════════════════════════════════════════════════════════════ */
(function(){
  if (typeof window === 'undefined') return;

  var _speaking = false, _queue = [], _idx = 0, _opts = {};

  function sanitize(t){
    return String(t == null ? '' : t)
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
      .replace(/\u0002/g, '선수권')
      .replace(/\s+/g, ' ')
      .trim();
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
      utter.rate = (_opts.rate || 1.02);
      var advanced = false, watchdog = null;
      var advanceOnce = function(){
        if (advanced) return;
        advanced = true;
        try{ clearTimeout(watchdog); }catch(e){}
        speakNext();
      };
      utter.onend = advanceOnce;
      utter.onerror = function(ev){ try{ console.warn('[TTS] utterance 오류', ev && ev.error); }catch(e){} advanceOnce(); };
      // 일부 브라우저(Chrome)는 onend가 오지 않고 멈추는 버그가 있어 워치독으로 강제 진행
      watchdog = setTimeout(advanceOnce, Math.max(4000, text.length * 260));
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
