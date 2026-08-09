async function _generateAiBotResponse(msg){
  try{
    let proxyUrl = '';
    let apiKey = '';
    const _isAdmin = (typeof isLoggedIn!=='undefined' && !!isLoggedIn) && !(typeof isSubAdmin!=='undefined' && !!isSubAdmin);
    try{
      if(window.SettingsStore && typeof window.SettingsStore.getAiCfg==='function'){
        const cfg = window.SettingsStore.getAiCfg() || {};
        proxyUrl = String(cfg.proxyUrl || '').trim();
        apiKey = String(cfg.apiKey || '').trim();
      }else{
        const a = JSON.parse(localStorage.getItem('su_ai_cfg')||'{}');
        proxyUrl = String(a.proxyUrl||'').trim();
        apiKey = String(a.apiKey||'').trim();
      }
    }catch(e){}
    proxyUrl = proxyUrl.replace(/\/+$/,'');

    const recent = (chatHistory||[]).slice(-14).map(m=>({
      role: m.role === 'bot' ? 'assistant' : 'user',
      content: String(m.content || '').replace(/<[^>]*>/g,'').slice(0, 4000)
    }));
    if (!recent.length || recent[recent.length-1].role !== 'user') {
      recent.push({ role:'user', content:String(msg||'') });
    }

    if(proxyUrl){
      try{
        const url = proxyUrl + '/api/aibot';
        const r = await fetch(url, {
          method:'POST',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify({ messages: recent })
        });
        const j = await r.json().catch(()=>null);
        if(!r.ok) throw new Error((j && j.error) ? j.error : ('HTTP '+r.status));
        return { format:'text', content: (j && j.text) ? String(j.text) : '응답이 비어있어.' };
      }catch(proxyErr){
        if(!(apiKey && _isAdmin)) throw proxyErr;
      }
    }

    if(apiKey && _isAdmin){
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: recent,
          temperature: 0.2,
          max_tokens: 700
        })
      });
      const j = await r.json().catch(()=>null);
      if(!r.ok){
        const msg = (j && (j.error?.message || j.error || j.message)) ? (j.error?.message || j.error || j.message) : ('HTTP '+r.status);
        throw new Error(msg);
      }
      const text = j?.choices?.[0]?.message?.content || '';
      return { format:'text', content: text ? String(text) : '응답이 비어있어.' };
    }

    if(apiKey && !_isAdmin){
      throw new Error('AI봇은 관리자만 사용할 수 있습니다. (관리자 로그인 필요)');
    }
    throw new Error('AI봇 서버 주소/키가 설정되지 않았습니다.');
  }catch(e){
    return { format:'text', content:
      `❌ AI봇 호출 실패: ${e.message}\n\n`+
        `설정탭 → 'AI봇(Groq) 서버 설정'에서\n`+
        `- (추천) 서버 주소 저장 또는\n`+
        `- (관리자) Groq API Key 저장\n`+
        `을 해주세요.`
    };
  }
}

try{
  window._generateAiBotResponse = window._generateAiBotResponse || _generateAiBotResponse;
}catch(e){}
