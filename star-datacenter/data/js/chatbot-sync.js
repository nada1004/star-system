async function _chatbotHandleMetaCommands(msg, userMessage){
  if (userMessage.includes('동기화') || userMessage.includes('토큰') || userMessage.includes('gist')) {
    const tok = msg.match(/토큰\s*[:\-]\s*([A-Za-z0-9_]+)\s*$/i);
    if (tok && tok[1]) {
      if(!_alIsAdmin()) return '❌ 관리자만 동기화 토큰을 저장할 수 있어.';
      try{ if(window.SettingsStore) window.SettingsStore.setCfg({ token: tok[1].trim() }); else localStorage.setItem('al_github_token', tok[1].trim()); }catch(e){}
      return '✅ (관리자) 토큰을 저장했어. 이제 "알등이 동기화 켜" 라고 하면 다른 기기와 메모가 공유돼.';
    }
    const gid = msg.match(/gist\s*[:\-]\s*([a-f0-9]+)\s*$/i);
    if (gid && gid[1]) {
      try{ if(window.SettingsStore) window.SettingsStore.setCfg({ gistId: gid[1].trim() }); else localStorage.setItem('al_gist_id', gid[1].trim()); }catch(e){}
      return '✅ Gist ID를 저장했어. (다른 기기에서도 이 ID를 넣으면 메모를 불러올 수 있어)';
    }
    if (userMessage.includes('동기화 켜')) {
      if(!_alIsAdmin()) return '❌ 동기화(저장 기능)는 관리자만 켤 수 있어. (시청자는 Gist ID만 입력하고 불러오기만 가능)';
      try{ if(window.SettingsStore) window.SettingsStore.setCfg({ enabled: true }); else localStorage.setItem('al_sync_enabled','1'); }catch(e){}
      try{
        let id='';
        if(window.SettingsStore){ id = await window.SettingsStore.ensureGist(); await window.SettingsStore.push(); }
        else { id = localStorage.getItem('al_gist_id')||''; }
        return `✅ (관리자) 동기화를 켰어.\nGist ID: ${id}\n\n다른 기기에서는 "알등이 gist: ${id}" 입력 후 "내가 적은것"으로 조회할 수 있어.`;
      }catch(e){
        return `❌ 동기화 켜기 실패: ${e.message}\n\n먼저 "알등이 동기화 토큰: (gist 권한 토큰)" 을 입력해줘.`;
      }
    }
    if (userMessage.includes('동기화 끄기')) {
      if(!_alIsAdmin()) return '❌ 동기화 설정 변경은 관리자만 가능해.';
      try{ if(window.SettingsStore) window.SettingsStore.setCfg({ enabled: false }); else localStorage.setItem('al_sync_enabled','0'); }catch(e){}
      return '✅ 동기화를 껐어. (이 기기 local 메모는 유지돼)';
    }
    if (userMessage.includes('동기화 상태')) {
      const cfg=(window.SettingsStore?window.SettingsStore.cfg():{enabled:localStorage.getItem('al_sync_enabled')==='1',token:(localStorage.getItem('al_github_token')||''),gistId:(localStorage.getItem('al_gist_id')||'')});
      return `동기화: ${cfg.enabled?'ON':'OFF'}\n토큰: ${cfg.token? '설정됨':'없음'}\nGist ID: ${cfg.gistId||'(없음)'}`;
    }
    if (userMessage.includes('메모 불러') || userMessage.includes('동기화 불러')) {
      try{
        const ok = window.SettingsStore ? await window.SettingsStore.pull({silent:true}) : false;
        try{
          if(window.SettingsStore){
            const m=window.SettingsStore.getMemo();
            if(m){ alMemo.last=m.last||''; alMemo.updatedAt=m.updatedAt||null; saveAlMemo(); }
          }
        }catch(e){}
        return ok ? `✅ 원격 메모를 불러왔어.\n\n${alMemo.last||''}` : '불러올 원격 메모가 없거나 Gist ID가 설정되지 않았어.';
      }catch(e){
        return `❌ 불러오기 실패: ${e.message}`;
      }
    }
  }

  if (userMessage.includes('알등이') && (userMessage.includes('저장') || userMessage.includes('저장해줘'))) {
    if(!_alIsAdmin()) return '❌ 관리자만 메모를 저장할 수 있어.';
    let memoText = '';
    const m1 = msg.match(/메모\s*[:\-]\s*([\s\S]+)/i);
    const m2 = msg.match(/내용\s*[:\-]\s*([\s\S]+)/i);
    if (m1 && m1[1]) memoText = m1[1].trim();
    else if (m2 && m2[1]) memoText = m2[1].trim();
    else {
      memoText = msg
        .replace(/알등이/gi,'')
        .replace(/(이거\s*)?저장해줘/gi,'')
        .replace(/저장/gi,'')
        .trim();
    }
    if (!memoText) return '저장할 내용을 같이 적어줘. 예) "알등이 메모: 내일 8시 회의 저장"';
    alMemo.last = memoText;
    alMemo.updatedAt = new Date().toISOString();
    saveAlMemo();
    let syncedMsg = '';
    try{
      if(window.SettingsStore){
        window.SettingsStore.setMemo(memoText);
        const ok = window.SettingsStore.cfg().enabled ? await window.SettingsStore.push('memo') : false;
        if(ok) syncedMsg = '\n\n(동기화: 완료)';
      }
    }catch(e){
      const en = window.SettingsStore ? window.SettingsStore.cfg().enabled : (localStorage.getItem('al_sync_enabled')==='1');
      if(en) syncedMsg = `\n\n(동기화 실패: ${e.message})`;
    }
    return `✅ 저장했어.\n\n저장한 내용:\n${memoText}\n\n"내가 적은것"이라고 물어보면 다시 알려줄게.${syncedMsg}`;
  }
  if (userMessage.includes('내가 적은') || userMessage.includes('내 메모') || userMessage.includes('저장한 내용')) {
    try{
      if(window.SettingsStore) await window.SettingsStore.pull({silent:true});
      if(window.SettingsStore){
        const m=window.SettingsStore.getMemo();
        if(m){ alMemo.last=m.last||''; alMemo.updatedAt=m.updatedAt||null; saveAlMemo(); }
      }
    }catch(e){}
    if (!alMemo.last) return '아직 저장된 메모가 없어. "알등이 메모: ... 저장" 이렇게 말해줘.';
    return `📌 저장된 메모:\n${alMemo.last}`;
  }

  if (/업데이트|개선사항|패치노트|변경사항|새기능|새로운\s*기능|뭐가\s*(달라졌|바뀌었|좋아졌)/.test(msg) && typeof formatChangelog === 'function') {
    return formatChangelog();
  }

  if (msg.includes('도움') || msg.includes('help') || msg.includes('?') || msg.includes('명령')) {
    return `🤖 알등이 명령어 모음\n\n` +
           `1️⃣ 스트리머 조회\n` +
           `• 스트리머명 → 프로필 카드\n` +
           `• 스트리머명 최근전적 → 최근 30경기\n` +
           `• 스트리머명 통계 → 종족별·맵별 통계\n` +
           `• 스트리머명 전체기록 → 모든 대전 요약\n\n` +
           `2️⃣ 대전 기록 조회\n` +
           `• 스트리머명 미니대전 → 미니대전 기록\n` +
           `• 스트리머명 대학대전 → 대학대전 기록\n` +
           `• 스트리머명 프로리그 → 프로리그 기록\n` +
           `• 스트리머명 CK → CK리그 기록\n` +
           `• 스트리머명 개인전 → 개인전 기록\n` +
           `• 스트리머명 끝장전 → 끝장전 기록\n` +
           `• 스트리머명 대회기록 → 대회·조별리그·토너먼트 기록\n` +
           `• 스트리머명 티어대회 → 티어대회 기록\n\n` +
           `• 스트리머명 vs 스트리머명 → 두 스트리머 상대전적\n` +
           `• 스트리머명 상대전적 → 상대별 승패 전체 요약\n` +
           `• 스트리머명 저그전 / 테란전 / 프로토스전 → 상대종족별 전적\n` +
           `• 스트리머명 종족별전적 → 상대종족별 전적 한번에 요약\n` +
           `• 스트리머명 맵이름 → 특정 맵 전적\n` +
           `• 스트리머명 맵별승률 → 전체 맵 승률 요약\n` +
           `• 스트리머명 elo → ELO 카드\n\n` +
           `3️⃣ 대학·랭킹\n` +
           `• 대학명 → 소속 선수 목록 (직책순·티어순)\n` +
           `• 대학명 승패기록 → 해당 대학 전체 승패 기록\n` +
           `• 대학순위 / 이번주 대학순위 / 이번달 대학순위 → 대학 순위\n` +
           `• 대학명 vs 대학명 → 대학 대항전 기록\n` +
           `• 랭킹 → ELO 전체 랭킹\n` +
           `• 이번주 mvp / 이번달 mvp → 주간·월간 MVP\n\n` +
           `4️⃣ 날짜별 경기결과\n` +
           `• 어제 경기 / 오늘 경기 → 그날의 전체 대전 결과\n` +
           `• 미니대전 결과 / 어제 미니대전 결과 / 7월 18일 미니대전 결과 → 해당 날짜의 미니대전 결과 (대학대전·프로리그·CK리그도 동일)\n\n` +
           `5️⃣ 기타\n` +
           `• 업데이트 / 개선사항 → 알등이 최신 변경 내역`;
  }

  return null;
}

try{
  window._chatbotHandleMetaCommands = window._chatbotHandleMetaCommands || _chatbotHandleMetaCommands;
}catch(e){}
