/* ══════════════════════════════════════════════════════════════
   🔊 공통 TTS 유틸 (Web Speech API)
   - 라인업 음성듣기 / 알등이봇 메시지 듣기 / 경기 상세 팝업 듣기에서 공용 사용
   - 호칭 규칙: "OO 선수" / "OO 스트리머" → 이름만 읽어준다.
══════════════════════════════════════════════════════════════ */
(function(){
  if (typeof window === 'undefined') return;

  var _speaking = false, _paused = false, _queue = [], _idx = 0, _opts = {}, _watchdog = null;

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

  // ── 날짜 표기: 2026.08.06 / 2026-08-06 / 2026/08/06 → "이천이십육년 팔월 육일" ──
  // (숫자를 그대로 두면 브라우저 TTS가 "공육일"처럼 자릿수 그대로 읽는 경우가 많아,
  //  년/월/일 각각을 한글 한자어 숫자로 직접 변환해서 넘긴다)
  function _convertDates(t){
    return t.replace(/\b(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})\b/g, function(_, y, mo, d){
      return _koSino(y) + '년 ' + _koSino(mo) + '월 ' + _koSino(d) + '일';
    });
  }

  // ── 스코어 표기: "5 대 3" / "5대3" → "오 대 삼" (한글 숫자로 명확히 낭독) ──
  function _convertScores(t){
    return t.replace(/(\d{1,4})\s*대\s*(\d{1,4})/g, function(_, a, b){
      return _koSino(a) + ' 대 ' + _koSino(b);
    });
  }

  // ── "%" 기호는 "퍼센트"로 풀어 읽어야 훨씬 자연스럽게 들린다 (먼저 "%p"부터 처리) ──
  function _convertPercent(t){
    return t
      .replace(/(\d+(?:\.\d+)?)\s*%p\b/gi, '$1퍼센트포인트')
      .replace(/(\d+(?:\.\d+)?)\s*%/g, '$1퍼센트');
  }

  // ── "vs" / "VS" → "대" (영문 그대로 두면 "브이에스"처럼 어색하게 읽힘) ──
  function _convertVs(t){
    return t.replace(/\s*\bvs\.?\b\s*/gi, ' 대 ');
  }

  // ── "N연승"/"N연패" → 한자어 숫자로 명확히 낭독 (예: "7연승" → "칠연승") ──
  // 브라우저 TTS가 숫자만 보고 순우리말/한자어 중 하나를 임의로 골라 읽다 보니
  // "칠연승"이라고 읽어야 할 걸 "일곱연승"처럼 어색하게 읽는 경우가 있어, 숫자를
  // 한자어 표기로 직접 바꿔서 넘긴다.
  function _convertStreaks(t){
    return t.replace(/(\d{1,3})\s*(연승|연패)/g, function(_, n, w){
      return _koSino(n) + w;
    });
  }

  // ── 티어 코드(G/K/JA/J/S) → 낭독용 한글 표기 ──
  // 화면에는 'G'/'K'/'JA'/'J'/'S' 알파벳 그대로 표시하지만, 음성으로는 알파벳을
  // 그대로 읽으면 어색하므로("지", "케이" 등) 실제 티어 명칭으로 바꿔 읽어준다.
  // 이 매핑에 없는 값('0티어'처럼 이미 "티어"가 붙어있거나, '유스'/'미정' 등)은 그대로 둔다.
  var _TIER_SPEAK_KO = { G:'갓티어', K:'킹티어', JA:'잭티어', J:'조커티어', S:'스페이드티어' };
  function tierSpeakLabel(tier){
    var t = String(tier == null ? '' : tier).trim();
    return _TIER_SPEAK_KO.hasOwnProperty(t) ? _TIER_SPEAK_KO[t] : t;
  }

  // ── 발음 교정 사전 ──────────────────────────────────────────
  // 브라우저 TTS(Web Speech API)가 특정 닉네임/단어를 실제와 다르게 읽는 경우가 있어,
  // 실제로 읽어줄 문자열 자체를 "정확히 들리는" 표기로 바꿔치기 해서 우회한다.
  // (SSML 발음 태그를 못 쓰는 Web Speech API의 한계 때문에 쓰는 일반적인 방식)
  //  - "파찌" → 그냥 읽으면 된소리(ㅉ)가 예사소리(ㅈ)로 풀려 "파지"로 들림.
  //    앞 음절에 받침 ㅅ을 붙이면(사이시옷과 같은 원리, 예: 냇가[내까]) 뒷 음절이
  //    저절로 된소리로 발음되므로 "팟지"로 표기해 실제로는 "파찌"에 가깝게 읽힌다.
  //  - "봄덕이" → 받침 뒤 "이"가 이어지며 자연스럽게 연음되어야("봄더기") 하는데
  //    TTS가 이를 못 살리고 전혀 다르게("보띠") 읽는 경우가 있어, 연음된 표기를
  //    직접 넘겨 정확한 발음을 유도한다.
  // 여기 없는 다른 닉네임은 라인업 소개 화면에서 선수별 "발음 표기(pronounceAs)"를
  // 등록해 개별로 교정할 수 있고, 그 값이 우선 적용된다. 이 사전은 그와 별개로
  // 앱 전체(챗봇/브리핑/경기 상세 등)에서 공통으로 쓰이는 최후 안전망이다.
  var _PRONOUNCE_FIX = {
    '파찌': '팟지',
    '봄덕이': '봄더기'
  };
  // 필요하면 런타임에 교정 항목을 더 등록할 수 있게 열어둔다.
  function addPronunciationFix(map){
    try{
      Object.keys(map || {}).forEach(function(k){ if (k) _PRONOUNCE_FIX[k] = map[k]; });
    }catch(e){}
  }
  function applyPronunciationFix(t){
    var s = String(t == null ? '' : t);
    Object.keys(_PRONOUNCE_FIX).forEach(function(key){
      if (!key) return;
      // 뒤에 다른 한글 음절이 곧바로 이어지지 않을 때만 치환한다(다른 단어 안에 우연히
      // 포함된 경우까지 잘못 건드리지 않도록, 조사/구두점/공백/문자열 끝 앞에서만 매칭).
      var re = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '(?![가-힣])', 'g');
      s = s.replace(re, _PRONOUNCE_FIX[key]);
    });
    return s;
  }

  // ── 스트리머/선수 이름 낭독 정리 ──
  // 화면 표시(name)는 그대로 두고 "음성으로 읽을 때"만 정리한다. 영문/숫자 조합
  // 닉네임이나 특이한 표기가 TTS로 이상하게 읽히는 문제(첫 글자가 씹히거나 이름
  // 전체를 엉뚱하게 읽는 등)를 완화하기 위한 공용 유틸.
  // 1) 선수 정보에 pronounceAs(발음 표기)가 등록돼 있으면 최우선 사용
  // 2) 없으면 언더바/대시("_","-")를 공백으로 바꾸고 이모지를 제거해서 최대한
  //    자연스럽게 읽히도록 정리한다.
  // 문자열(상대 선수 이름 등)만 넘어오면 window.players에서 같은 이름을 찾아
  // pronounceAs를 적용한다 — 본인뿐 아니라 "핵심 분석"의 상대 전적 등에서도 쓰기 위함.
  function speakName(nameOrPlayer){
    try{
      var p = null;
      if (nameOrPlayer && typeof nameOrPlayer === 'object') {
        p = nameOrPlayer;
      } else {
        var nm = String(nameOrPlayer == null ? '' : nameOrPlayer).trim();
        if (!nm) return '이름 미상';
        try{
          var list = (typeof players !== 'undefined' ? players : (window.players || []));
          p = (list || []).find(function(x){ return x && x.name === nm; }) || null;
        }catch(e){ p = null; }
        if (!p) p = { name: nm };
      }
      var custom = String((p && p.pronounceAs) || '').trim();
      if (custom) return custom;
      var n = String((p && p.name) || '').trim();
      if (!n) return '이름 미상';
      n = n
        .replace(/[_\-]+/g, ' ')
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
      return n || (p && p.name) || '이름 미상';
    }catch(e){ return (nameOrPlayer && nameOrPlayer.name) || String(nameOrPlayer || '이름 미상'); }
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
    s = _convertVs(s);
    s = _convertScores(s);
    s = _convertStreaks(s);
    s = _convertPercent(s);
    s = applyPronunciationFix(s);
    // 날짜/점수/퍼센트 변환이 다 끝난 뒤에도 남아있는 "."과 ","은 실제 숫자 표기(날짜,
    // 소수점 등)가 아니라 그냥 문장부호다. 항목 하나하나가 이미 별도 발화(큐 아이템)로
    // 나뉘어 있어 문장 끝에 마침표가 없어도 자연스럽게 끊기고, 문장 중간의 쉼표도 단어
    // 사이 공백만으로 충분히 끊겨 들린다. 일부 음성엔진이 마침표/쉼표를 "쩜"/"점"이라고
    // 그대로 읽어버리는 문제를 막기 위해 여기서 제거한다(숫자 사이의 소수점은 보존).
    s = s.replace(/[.,](?!\d)/g, ' ');
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
    _speaking = false; _paused = false; _queue = []; _idx = 0;
    try{ clearTimeout(_watchdog); }catch(e){}
    try{ window.speechSynthesis && window.speechSynthesis.cancel(); }catch(e){}
    try{ if (typeof _opts.onEnd === 'function') _opts.onEnd(); }catch(e){}
    _opts = {};
  }

  function speakNext(){
    if (!_speaking || _idx >= _queue.length) { if (_speaking) finish(); return; }
    var item = _queue[_idx++];
    var text = sanitize(item && typeof item === 'object' ? item.text : item);
    try{ if (typeof _opts.onItem === 'function') _opts.onItem(item, _idx - 1); }catch(e){}
    if (!text) { speakNext(); return; }
    try{
      // 일부 브라우저(특히 Chrome)는 speak() 직후 엔진이 아직 준비되지 않은 상태에서
      // 바로 발화를 시작해, 단어의 첫 글자(가끔 첫 음절)가 통째로 씹혀서 안 들리는
      // 버그가 있다. 실제로 읽을 텍스트 앞에 사람 귀에 들리지 않는 짧은 무음 구간
      // (좁은 공백)을 붙여서, 엔진이 "씹어먹는" 부분이 실제 내용이 아니라 이 무음
      // 구간이 되도록 완충한다.
      var utter = new SpeechSynthesisUtterance('\u200B ' + text);
      utter.lang = 'ko-KR';
      var v = pickKoVoice();
      if (v) utter.voice = v;
      // 조금 더 차분하고 부드러운 속도/톤 (기존보다 살짝 느리게)
      utter.rate = (_opts.rate || 0.96);
      utter.pitch = (_opts.pitch != null ? _opts.pitch : 1.0);
      // 브라우저 TTS 볼륨은 기본값이 이미 최대(1.0)라 코드로 더 키울 순 없다.
      // (라인업 소개연출에서 목소리가 묻히는 문제는 배경음악 쪽을 줄이는 방식으로 해결함 — board2-univ-views-lineup.js의 BGM 더킹 참고)
      utter.volume = (_opts.volume != null ? Math.max(0, Math.min(1, _opts.volume)) : 1);
      var advanced = false;
      var advanceOnce = function(){
        if (advanced) return;
        // 일시정지 상태에서는 워치독이 오작동으로 다음 문장으로 넘어가면 안 됨
        if (_paused) return;
        advanced = true;
        try{ clearTimeout(_watchdog); }catch(e){}
        // 문장 사이에 짧은 숨 고르기 텀을 둬서 뚝뚝 끊기지 않고 자연스럽게 이어지도록 함
        // 큐 아이템 자체에 gapMs가 지정돼 있으면 그걸 우선한다(예: 한 문장 안에서 쉼표로
        // 끊어 읽는 절 사이는 짧게, 문장이 완전히 끝난 뒤는 길게 — 억양/호흡이 더 자연스러워짐)
        var itemGap = (item && typeof item === 'object' && item.gapMs != null) ? item.gapMs : null;
        var gap = (itemGap != null ? itemGap : (_opts.gapMs != null ? _opts.gapMs : 220));
        if (gap > 0) setTimeout(speakNext, gap); else speakNext();
      };
      utter.onend = advanceOnce;
      utter.onerror = function(ev){ try{ console.warn('[TTS] utterance 오류', ev && ev.error); }catch(e){} advanceOnce(); };
      // 일부 브라우저(Chrome)는 onend가 오지 않고 멈추는 버그가 있어 워치독으로 강제 진행
      _watchdog = setTimeout(advanceOnce, Math.max(4000, text.length * 280));
      try{ window.speechSynthesis.resume(); }catch(e){}
      window.speechSynthesis.speak(utter);
      // Chrome계 브라우저의 "첫 글자 씹힘" 버그에 대한 추가 완충: speak() 직후
      // pause()→resume()을 곧바로 걸어주면 엔진이 실제로 오디오를 내보내기 시작하기
      // 전에 한 번 깨어나면서 초반 클리핑이 줄어드는 경우가 많다(널리 알려진 우회법).
      try{
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }catch(e){}
    }catch(e){
      try{ console.warn('[TTS] speak 실패', e); }catch(e2){}
      speakNext();
    }
  }

  // ── 일시정지: 현재 읽던 문장의 위치를 유지한 채 멈춘다 (큐/인덱스는 보존) ──
  function pause(){
    if (!_speaking) return false;
    _speaking = false;
    _paused = true;
    try{ clearTimeout(_watchdog); }catch(e){}
    try{ window.speechSynthesis && window.speechSynthesis.pause(); }catch(e){}
    return true;
  }

  // ── 이어듣기: 멈췄던 지점부터 다시 재생 ──
  function resume(){
    if (!_paused) return false;
    _paused = false;
    _speaking = true;
    try{
      window.speechSynthesis.resume();
      // 일부 브라우저(특히 모바일 Chrome/삼성인터넷)는 resume()이 씹히는 버그가 있어
      // 짧게 확인해보고 실제로 재생이 안 붙었으면 현재 문장부터 다시 읽어 복구한다.
      setTimeout(function(){
        if (_speaking && window.speechSynthesis &&
            !window.speechSynthesis.speaking && !window.speechSynthesis.pending){
          _idx = Math.max(0, _idx - 1);
          speakNext();
        }
      }, 350);
    }catch(e){
      _idx = Math.max(0, _idx - 1);
      speakNext();
    }
    return true;
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

  // 완전 정지(하드 리셋): 일시정지 상태였더라도 큐를 모두 비운다.
  // (다른 콘텐츠로 전환/모달 닫기 등에 사용 — 이 경우엔 이어듣기가 의미 없으므로 초기화한다)
  function stop(){
    var wasActive = _speaking || _paused;
    _speaking = false; _paused = false;
    try{ clearTimeout(_watchdog); }catch(e){}
    var end = _opts && _opts.onEnd;
    _queue = []; _idx = 0; _opts = {};
    try{ window.speechSynthesis && window.speechSynthesis.cancel(); }catch(e){}
    if (wasActive) { try{ if (typeof end === 'function') end(); }catch(e){} }
  }

  window.SUTTS = {
    speak: start,
    stop: stop,
    pause: pause,
    resume: resume,
    // 재생 중이면 일시정지, 일시정지 중이면 이어듣기, 그 외엔 새로 시작
    toggle: function(items, opts){
      if (_speaking) { pause(); return 'paused'; }
      if (_paused) { resume(); return 'resumed'; }
      return start(items, opts) ? 'started' : false;
    },
    isSpeaking: function(){ return _speaking; },
    isPaused: function(){ return _paused; },
    sanitize: sanitize,
    tierLabel: tierSpeakLabel,
    speakName: speakName,
    // 발음 교정 사전에 항목 추가/덮어쓰기 (예: window.SUTTS.addPronunciationFix({'닉네임':'교정표기'}))
    addPronunciationFix: addPronunciationFix
  };
})();
