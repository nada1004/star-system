// 모바일에서 mobileActionBar 표시 + FAB 설정 반영
(function(){
  function checkMobile(){
    const bar=document.getElementById('mobileActionBar');
    if(bar) bar.style.display=window.innerWidth<=768?'flex':'none';
  }
  checkMobile();
  window.addEventListener('resize',checkMobile);
  // FAB 표시 여부 설정 반영 (PC/모바일 분리)
  updateFabVisibility();
})();

// FAB 표시 여부 업데이트 함수 (PC/모바일 분리)
function updateFabVisibility(){
  const fab=document.getElementById('mobileFab');
  if(!fab)return;
  
  const isMobile=window.innerWidth<=768;
  const hideMobile=localStorage.getItem('su_fabHideMobile')==='1';
  const hidePC=localStorage.getItem('su_fabHidePC')==='1';
  
  if(isMobile){
    fab.style.display=hideMobile?'none':'flex';
  }else{
    fab.style.display=hidePC?'none':'flex';
  }
  
  // FAB가 꺼지면 채팅봇 팝업도 닫기
  if(hideMobile||hidePC){
    closeChatbot();
  }
}

// 창 크기 변경 시 FAB 표시 여부 재계산
window.addEventListener('resize',updateFabVisibility);

/* ══════════════════════════════════════
   💻 PC 탭 스크롤 화살표
══════════════════════════════════════ */
(function(){
  var tabs=document.querySelector('.tabs');
  if(!tabs)return;
  // 래퍼로 감싸기
  var wrap=document.createElement('div');
  wrap.className='tabs-scroll-wrap no-export';
  tabs.parentNode.insertBefore(wrap,tabs);
  wrap.appendChild(tabs);
  // 화살표 버튼
  var btnL=document.createElement('button');
  btnL.className='tabs-arrow';btnL.innerHTML='&#9664;';btnL.title='이전 탭';
  btnL.addEventListener('click',function(){tabs.scrollBy({left:-200,behavior:'smooth'});});
  var btnR=document.createElement('button');
  btnR.className='tabs-arrow';btnR.innerHTML='&#9654;';btnR.title='다음 탭';
  btnR.addEventListener('click',function(){tabs.scrollBy({left:200,behavior:'smooth'});});
  wrap.insertBefore(btnL,tabs);
  wrap.appendChild(btnR);
  function update(){
    var canL=tabs.scrollLeft>4;
    var canR=tabs.scrollLeft<tabs.scrollWidth-tabs.clientWidth-4;
    btnL.classList.toggle('visible',canL);
    btnR.classList.toggle('visible',canR);
  }
  tabs.addEventListener('scroll',update,{passive:true});
  window.addEventListener('resize',update);
  setTimeout(update,200);
})();

/* ══════════════════════════════════════
   📱 FAB (플로팅 액션 버튼)
══════════════════════════════════════ */
var _fabOpen=false;
function toggleFab(){
  _fabOpen=!_fabOpen;
  const btn=document.getElementById('fabMain');
  const list=document.getElementById('fabSubList');
  if(!btn||!list)return;
  btn.classList.toggle('open',_fabOpen);
  list.classList.toggle('open',_fabOpen);
}
function closeFab(){
  _fabOpen=false;
  const btn=document.getElementById('fabMain');
  const list=document.getElementById('fabSubList');
  if(btn) btn.classList.remove('open');
  if(list) list.classList.remove('open');
}
function _fabGo(tabId){
  const el=document.querySelector('.tab[onclick*="\''+tabId+'\'"]')
         ||document.querySelector('.tab[onclick*=\'"'+tabId+'"\']');
  if(el&&typeof sw==='function') sw(tabId,el);
}
// FAB 외부 클릭 시 닫기
document.addEventListener('click',function(e){
  if(_fabOpen&&!e.target.closest('#mobileFab')) closeFab();
});


/* ══════════════════════════════════════
   📱 대진표 핀치줌
══════════════════════════════════════ */
(function(){
  var _pinchScale=1,_pinchStartDist=0,_pinchEl=null;

  function dist(t){
    var dx=t[0].clientX-t[1].clientX, dy=t[0].clientY-t[1].clientY;
    return Math.sqrt(dx*dx+dy*dy);
  }

  document.addEventListener('touchstart',function(e){
    if(e.touches.length!==2){return;}
    var wrap=e.target.closest('.tour-wrap');
    if(!wrap)return;
    e.preventDefault();
    _pinchEl=wrap.querySelector('.tour-inner')||wrap;
    _pinchStartDist=dist(e.touches);
    var cur=parseFloat(_pinchEl.style.transform&&_pinchEl.style.transform.match(/scale\(([^)]+)\)/)?_pinchEl.style.transform.match(/scale\(([^)]+)\)/)[1]:1)||1;
    _pinchScale=cur;
  },{passive:false});

  document.addEventListener('touchmove',function(e){
    if(e.touches.length!==2||!_pinchEl)return;
    e.preventDefault();
    var ratio=dist(e.touches)/_pinchStartDist;
    var ns=Math.min(Math.max(_pinchScale*ratio,0.4),3);
    _pinchEl.style.transformOrigin='top left';
    _pinchEl.style.transform='scale('+ns+')';
  },{passive:false});

  document.addEventListener('touchend',function(e){
    if(e.touches.length<2&&_pinchEl){
      var cur=parseFloat(_pinchEl.style.transform&&_pinchEl.style.transform.match(/scale\(([^)]+)\)/)?_pinchEl.style.transform.match(/scale\(([^)]+)\)/)[1]:1)||1;
      _pinchScale=cur;
      _pinchEl=null;
    }
  },{passive:true});
})();

/* ══════════════════════════════════════
   📱 현황판 칩 길게 누르기 (longpress → 선수 상세)
══════════════════════════════════════ */
(function(){
  var _lpTimer=null,_lpEl=null;
  var LONG_MS=500;

  document.addEventListener('touchstart',function(e){
    var chip=e.target.closest('.brd-chip');
    if(!chip)return;
    _lpEl=chip;
    _lpTimer=setTimeout(function(){
      if(!_lpEl)return;
      var name=_lpEl.dataset.player;
      if(!name)return;
      // 진동 피드백 (지원 기기)
      if(navigator.vibrate) navigator.vibrate(40);
      // 항상 선수 상세 (관리자도 롱프레스 = 선수보기)
      if(typeof openPlayerModal==='function') openPlayerModal(name);
      _lpEl=null;
    },LONG_MS);
  },{passive:true});

  document.addEventListener('touchmove',function(){
    if(_lpTimer){clearTimeout(_lpTimer);_lpTimer=null;_lpEl=null;}
  },{passive:true});

  document.addEventListener('touchend',function(){
    if(_lpTimer){clearTimeout(_lpTimer);_lpTimer=null;_lpEl=null;}
  },{passive:true});
})();

/* ══════════════════════════════════════
   🤖 챗봇 기능
══════════════════════════════════════ */
// 채팅봇 활성화 상태 (기본값: true)
var _chatbotEnabled=localStorage.getItem('su_chatbotEnabled')!=='0';

function openChatbot(){
  if(!_chatbotEnabled){
    alert('채팅봇이 비활성화되어 있습니다. FAB 메뉴에서 활성화해주세요.');
    return;
  }
  const overlay=document.getElementById('chatbotOverlay');
  if(overlay){
    overlay.classList.add('open');
    overlay.style.display='flex';
    setTimeout(()=>{document.getElementById('chatbotInput')?.focus();},100);
  }
}
function closeChatbot(e){
  if(e&&e.target!==document.getElementById('chatbotOverlay'))return;
  const overlay=document.getElementById('chatbotOverlay');
  if(overlay){
    overlay.classList.remove('open');
    setTimeout(()=>{overlay.style.display='none';},300);
  }
}
function toggleChatbot(){
  // 비활성화 상태면 활성화 후 채팅창 열기
  if(!_chatbotEnabled){
    _chatbotEnabled=true;
    localStorage.setItem('su_chatbotEnabled','1');
    
    // UI 업데이트
    const icon=document.getElementById('chatbotToggleIcon');
    const status=document.getElementById('chatbotToggleStatus');
    if(icon) icon.textContent='🤖';
    if(status) status.textContent='(ON)';
    if(status) status.style.color='#94a3b8';
    
    // 채팅창 열기
    openChatbot();
  }else{
    // 활성화 상태면 채팅창 열기/닫기 토글
    const overlay=document.getElementById('chatbotOverlay');
    if(overlay && overlay.classList.contains('open')){
      closeChatbot();
    }else{
      openChatbot();
    }
  }
}
// 초기화 시 채팅봇 상태 UI 업데이트
(function(){
  const icon=document.getElementById('chatbotToggleIcon');
  const status=document.getElementById('chatbotToggleStatus');
  if(icon) icon.textContent=_chatbotEnabled?'🤖':'🤖';
  if(status) status.textContent=_chatbotEnabled?'(ON)':'(OFF)';
  if(status) status.style.color=_chatbotEnabled?'#94a3b8':'#ef4444';
})();
function sendChatbotMessage(query){
  if(!query){
    const input=document.getElementById('chatbotInput');
    query=input.value.trim();
    if(!query)return;
    input.value='';
  }
  
  addChatbotMessage(query,'user');
  
  setTimeout(()=>processChatbotQuery(query),100);
}
window.sendChatbotMessage=sendChatbotMessage;
function addChatbotMessage(text,sender){
  const container=document.getElementById('chatbotMessages');
  if(!container)return;
  
  const msgDiv=document.createElement('div');
  msgDiv.className='chatbot-message '+sender;
  msgDiv.innerHTML='<div class="chatbot-bubble">'+text+'</div>';
  container.appendChild(msgDiv);
  container.scrollTop=container.scrollHeight;
}
function processChatbotQuery(query){
  const response=generateChatbotResponse(query);
  addChatbotMessage(response,'bot');
}
function generateChatbotResponse(query){
  const q=query.toLowerCase();
  
  // J 함수 사용하여 데이터 로드 (LZ-String 압축 처리 포함)
  const loadData = (key) => {
    try {
      if(typeof J!=='undefined'){
        const data = J(key);
        console.log('Chatbot Debug - Loading key:', key, 'result:', data ? data.length : 0);
        return data || [];
      } else {
        // J 함수가 없으면 localStorage 직접 시도
        const data = localStorage.getItem(key);
        console.log('Chatbot Debug - Loading key:', key, 'exists:', !!data, 'J function unavailable');
        return data ? JSON.parse(data) : [];
      }
    } catch(e) {
      console.error('Chatbot Debug - Error loading key:', key, e);
      return [];
    }
  };
  
  const compM = loadData('su_cm');
  const ttM = loadData('su_ttm');
  const proM = loadData('su_pro');
  const ckM = loadData('su_ck');
  const gjM = loadData('su_gj');
  const univM = loadData('su_um');
  const miniM = loadData('su_mm');
  
  // 디버깅: 데이터 변수 확인
  console.log('Chatbot Debug - Data availability:', {
    players: typeof players!=='undefined',
    compM: compM.length,
    ttM: ttM.length,
    proM: proM.length,
    ckM: ckM.length,
    gjM: gjM.length,
    univM: univM.length,
    miniM: miniM.length
  });
  
  // 선수 이름만 입력된 경우 - 기록 유형 선택 메뉴 표시
  const playerOnlyMatch=query.match(/^([^\s]+)$/);
  if(playerOnlyMatch){
    const playerName=playerOnlyMatch[1];
    const player=typeof players!=='undefined'?players.find(p=>p.name===playerName):null;
    if(!player)return '❌ "'+playerName+'" 선수를 찾을 수 없습니다.';
    
    // 기록 유형 선택 메뉴 반환
    return formatRecordMenu(playerName);
  }
  
  // 선수 이름 + 기록 유형 입력된 경우
  const playerMatch=query.match(/([^\s]+)\s+(대학\s+)?(기록|정보|미니대전|대학대전|개인전|전적|성적|대회|티어대회|프로리그|끝장전|시빌원|ck|토너먼트|조별리그|팀전|일반)/);
  console.log('Chatbot Debug - Pattern match result:', !!playerMatch, 'query:', query);
  if(playerMatch){
    const playerName=playerMatch[1];
    const mode=playerMatch[playerMatch.length-1];
    
    console.log('Chatbot Debug - Query:', { playerName, mode, query, fullMatch: playerMatch });
    
    // 전역 players 변수 사용
    const player=typeof players!=='undefined'?players.find(p=>p.name===playerName):null;
    if(!player)return '❌ "'+playerName+'" 선수를 찾을 수 없습니다.';
    
    if(mode==='기록'||mode==='정보'||mode==='전적'){
      return formatPlayerInfo(player);
    }else if(mode==='미니대전'||mode==='성적'){
      return formatPlayerMiniRecord(player, miniM);
    }else if(mode==='대학대전'||q.includes('대학대전')){
      return formatPlayerUnivMatchRecord(player, univM);
    }else if(mode==='개인전'){
      return formatPlayerIndRecord(player);
    }else if(mode==='끝장전'||q.includes('끝장전')){
      return formatPlayerGJRecord(player, gjM);
    }else if(mode==='ck'||q.includes('ck')){
      return formatPlayerCKRecord(player, ckM);
    }else if(mode==='대회'||q.includes('대회')&&!q.includes('티어대회')&&!q.includes('프로리그')){
      // 대회 기록 검색 시 compM, ttM, proM 모두 포함
      return formatPlayerCompRecord(player, compM, ttM, proM);
    }else if(mode==='티어대회'||q.includes('티어대회')){
      return formatPlayerTTRecord(player, ttM);
    }else if(mode==='프로리'||q.includes('프로리그')){
      return formatPlayerProRecord(player, proM);
    }else if(mode==='시빌원'||q.includes('시빌원')){
      return formatPlayerSevilRecord(player, univM);
    }else if(mode==='토너먼트'||q.includes('토너먼트')){
      return formatPlayerTournamentRecord(player, compM, ttM, proM);
    }else if(mode==='조별리그'||q.includes('조별리그')){
      return formatPlayerGroupRecord(player, compM, ttM, proM);
    }else if(mode==='팀전'||q.includes('팀전')){
      return formatPlayerTeamRecord(player, proM);
    }else if(mode==='일반'||q.includes('일반')){
      return formatPlayerNormalRecord(player, proM);
    }
  }
  
  // 간단한 명령어
  if(q.includes('미니대전')||q.includes('미니')){
    return '⚡ 미니대전 기록을 보려면 "선수명 미니대전 성적"이라고 입력하세요.\n예: <스트리머 이름> 미니대전 성적';
  }
  if(q.includes('대학대전')){
    return '🏟️ 대학대전 기록을 보려면 "선수명 대학대전 기록"이라고 입력하세요.\n예: <스트리머 이름> 대학대전 기록';
  }
  if(q.includes('개인전')){
    return '⚔️ 개인전 기록을 보려면 "선수명 개인전 기록"이라고 입력하세요.\n예: <스트리머 이름> 개인전 기록';
  }
  if(q.includes('끝장전')){
    return '🔥 끝장전 기록을 보려면 "선수명 끝장전 기록"이라고 입력하세요.\n예: <스트리머 이름> 끝장전 기록';
  }
  if(q.includes('ck')||q.includes('대학ck')){
    return '🤝 대학CK 기록을 보려면 "선수명 ck 기록"이라고 입력하세요.\n예: <스트리머 이름> ck 기록';
  }
  if(q.includes('시빌원')){
    return '🏛️ 시빌원 기록을 보려면 "선수명 시빌원 기록"이라고 입력하세요.\n예: <스트리머 이름> 시빌원 기록';
  }
  if(q.includes('대회')&&!q.includes('티어대회')&&!q.includes('프로리그')){
    return '🏆 대회 기록을 보려면 "선수명 대회 기록"이라고 입력하세요.\n예: <스트리머 이름> 대회 기록';
  }
  if(q.includes('티어대회')){
    return '🎖️ 티어대회 기록을 보려면 "선수명 티어대회 기록"이라고 입력하세요.\n예: <스트리머 이름> 티어대회 기록';
  }
  if(q.includes('프로리그')){
    return '🏅 프로리그 기록을 보려면 "선수명 프로리그 기록"이라고 입력하세요.\n예: <스트리머 이름> 프로리그 기록';
  }
  if(q.includes('토너먼트')){
    return '🏆 토너먼트 기록을 보려면 "선수명 토너먼트 기록"이라고 입력하세요.\n예: <스트리머 이름> 토너먼트 기록';
  }
  if(q.includes('조별리그')){
    return '📋 조별리그 기록을 보려면 "선수명 조별리그 기록"이라고 입력하세요.\n예: <스트리머 이름> 조별리그 기록';
  }
  if(q.includes('팀전')){
    return '👥 팀전 기록을 보려면 "선수명 팀전 기록"이라고 입력하세요.\n예: <스트리머 이름> 팀전 기록';
  }
  if(q.includes('일반')){
    return '📝 일반 기록을 보려면 "선수명 일반 기록"이라고 입력하세요.\n예: <스트리머 이름> 일반 기록';
  }
  if(q.includes('랭킹')||q.includes('순위')){
    return '📊 랭킹은 상단 탭의 "티어 순위표"에서 확인할 수 있습니다.';
  }
  if(q.includes('도움')||q.includes('help')||q.includes('?')){
    return '📖 사용법:\n• "<스트리머 이름> 기록" - 선수 전체 기록\n• "<스트리머 이름> 미니대전 성적" - 미니대전 기록\n• "<스트리머 이름> 대학대전 기록" - 대학대전 기록\n• "<스트리머 이름> 개인전 기록" - 개인전 기록\n• "<스트리머 이름> 끝장전 기록" - 끝장전 기록\n• "<스트리머 이름> ck 기록" - 대학CK 기록\n• "<스트리머 이름> 시빌원 기록" - 시빌원 기록\n• "<스트리머 이름> 대회 기록" - 대회 기록\n• "<스트리머 이름> 티어대회 기록" - 티어대회 기록\n• "<스트리머 이름> 프로리그 기록" - 프로리그 기록\n• "<스트리머 이름> 토너먼트 기록" - 토너먼트 기록\n• "<스트리머 이름> 조별리그 기록" - 조별리그 기록\n• "<스트리머 이름> 팀전 기록" - 팀전 기록\n• "<스트리머 이름> 일반 기록" - 일반 기록';
  }
  
  return '🤔 질문을 이해하지 못했습니다.\n• "<스트리머 이름> 기록"\n• "<스트리머 이름> 미니대전 성적"\n• "도움" - 사용법 보기';
}
function formatPlayerInfo(player){
  const total=player.win+player.loss;
  const rate=total>0?((player.win/total)*100).toFixed(1):0;
  
  let info='';
  
  // 프로필 이미지가 있으면 추가
  if(player.photo){
    info+='<img src="'+player.photo+'" style="width:60px;height:60px;border-radius:50%;object-fit:cover;margin-bottom:8px;border:2px solid #e2e8f0;">\n';
  }
  
  info+='<strong>👤 '+player.name+'</strong>\n';
  info+='🏫 '+player.univ+' | '+player.tier+' | '+player.race+'종족\n';
  info+='📊 전적: '+player.win+'승 '+player.loss+'패 ('+rate+'%)\n';
  info+='⭐ ELO: '+player.elo+'\n';
  info+='📝 총 전적 수: '+total+'경기';
  
  return info;
}
function formatPlayerMiniRecord(player, miniM){
  const playerMatches=miniM.filter(m=>m.p1===player.name||m.p2===player.name);
  
  if(playerMatches.length===0){
    return '📭 '+player.name+'의 미니대전 기록이 없습니다.';
  }
  
  const wins=playerMatches.filter(m=>(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)).length;
  const losses=playerMatches.length-wins;
  const rate=playerMatches.length>0?((wins/playerMatches.length)*100).toFixed(1):0;
  
  let info='⚡ '+player.name+' 미니대전 성적\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  playerMatches.slice(-5).reverse().forEach(m=>{
    const opp=m.p1===player.name?m.p2:m.p1;
    const result=(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)?'승':'패';
    info+='📅 '+m.date+' | '+m.map+' | '+result+' vs '+opp+' ('+m.sa+':'+m.sb+')\n';
  });
  
  if(playerMatches.length>5){
    info+='... (최근 5경기만 표시)';
  }
  
  return info;
}
function formatPlayerUnivMatchRecord(player, univM){
  const playerMatches=univM.filter(m=>m.p1===player.name||m.p2===player.name);
  
  if(playerMatches.length===0){
    return '📭 '+player.name+'의 대학대전 기록이 없습니다.';
  }
  
  const wins=playerMatches.filter(m=>(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)).length;
  const losses=playerMatches.length-wins;
  const rate=playerMatches.length>0?((wins/playerMatches.length)*100).toFixed(1):0;
  
  let info='🏟️ '+player.name+' 대학대전 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  playerMatches.slice(-5).reverse().forEach(m=>{
    const opp=m.p1===player.name?m.p2:m.p1;
    const result=(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)?'승':'패';
    info+='📅 '+m.date+' | '+m.map+' | '+result+' vs '+opp+' ('+m.sa+':'+m.sb+')\n';
  });
  
  if(playerMatches.length>5){
    info+='... (최근 5경기만 표시)';
  }
  
  return info;
}
function formatPlayerIndRecord(player){
  if(!player.history||player.history.length===0){
    return '📭 '+player.name+'의 개인전 기록이 없습니다.';
  }
  
  const total=player.win+player.loss;
  if(total===0){
    return '📭 '+player.name+'의 개인전 기록이 없습니다.';
  }
  
  let info='⚔️ '+player.name+' 개인전 기록\n';
  info+='📊 '+player.win+'승 '+player.loss+'패\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  player.history.slice(-5).reverse().forEach(h=>{
    info+='📅 '+h.date+' | '+h.map+' | '+h.result+' vs '+h.opp+'\n';
  });
  
  if(player.history.length>5){
    info+='... (최근 5경기만 표시)';
  }
  
  return info;
}
function formatPlayerCompRecord(player, compM, ttM, proM){
  console.log('Chatbot Debug - compM sample:', compM.length > 0 ? compM[0] : 'empty');
  console.log('Chatbot Debug - ttM sample:', ttM.length > 0 ? ttM[0] : 'empty');
  console.log('Chatbot Debug - proM sample:', proM.length > 0 ? proM[0] : 'empty');
  
  const allMatches=[];
  allMatches.push(...compM.filter(m=>m.p1===player.name||m.p2===player.name));
  allMatches.push(...ttM.filter(m=>m.p1===player.name||m.p2===player.name));
  allMatches.push(...proM.filter(m=>m.p1===player.name||m.p2===player.name));
  const playerMatches=allMatches;
  
  if(playerMatches.length===0){
    return '📭 '+player.name+'의 대회 기록이 없습니다.';
  }
  
  const wins=playerMatches.filter(m=>(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)).length;
  const losses=playerMatches.length-wins;
  const rate=playerMatches.length>0?((wins/playerMatches.length)*100).toFixed(1):0;
  
  let info='🏆 '+player.name+' 대회 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  playerMatches.slice(-5).reverse().forEach(m=>{
    const opp=m.p1===player.name?m.p2:m.p1;
    const result=(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)?'승':'패';
    info+='📅 '+m.date+' | '+m.map+' | '+result+' vs '+opp+' ('+m.sa+':'+m.sb+')\n';
  });
  
  if(playerMatches.length>5){
    info+='... (최근 5경기만 표시)';
  }
  
  return info;
}
function formatPlayerTTRecord(player, ttM){
  const playerMatches=ttM.filter(m=>m.p1===player.name||m.p2===player.name);
  
  if(playerMatches.length===0){
    return '📭 '+player.name+'의 티어대회 기록이 없습니다.';
  }
  
  const wins=playerMatches.filter(m=>(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)).length;
  const losses=playerMatches.length-wins;
  const rate=playerMatches.length>0?((wins/playerMatches.length)*100).toFixed(1):0;
  
  let info='🎖️ '+player.name+' 티어대회 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  playerMatches.slice(-5).reverse().forEach(m=>{
    const opp=m.p1===player.name?m.p2:m.p1;
    const result=(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)?'승':'패';
    info+='📅 '+m.date+' | '+m.map+' | '+result+' vs '+opp+' ('+m.sa+':'+m.sb+')\n';
  });
  
  if(playerMatches.length>5){
    info+='... (최근 5경기만 표시)';
  }
  
  return info;
}
function formatPlayerProRecord(player, proM){
  const playerMatches=proM.filter(m=>m.p1===player.name||m.p2===player.name);
  
  if(playerMatches.length===0){
    return '📭 '+player.name+'의 프로리그 기록이 없습니다.';
  }
  
  const wins=playerMatches.filter(m=>(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)).length;
  const losses=playerMatches.length-wins;
  const rate=playerMatches.length>0?((wins/playerMatches.length)*100).toFixed(1):0;
  
  let info='🏅 '+player.name+' 프로리그 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  playerMatches.slice(-5).reverse().forEach(m=>{
    const opp=m.p1===player.name?m.p2:m.p1;
    const result=(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)?'승':'패';
    info+='📅 '+m.date+' | '+m.map+' | '+result+' vs '+opp+' ('+m.sa+':'+m.sb+')\n';
  });
  
  if(playerMatches.length>5){
    info+='... (최근 5경기만 표시)';
  }
  
  return info;
}
function formatPlayerGJRecord(player, gjM){
  const playerMatches=gjM.filter(m=>m.wName===player.name||m.lName===player.name);
  
  if(playerMatches.length===0){
    return '📭 '+player.name+'의 끝장전 기록이 없습니다.';
  }
  
  const wins=playerMatches.filter(m=>m.wName===player.name).length;
  const losses=playerMatches.length-wins;
  const rate=playerMatches.length>0?((wins/playerMatches.length)*100).toFixed(1):0;
  
  let info='🔥 '+player.name+' 끝장전 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  playerMatches.slice(-5).reverse().forEach(m=>{
    const opp=m.wName===player.name?m.lName:m.wName;
    const result=m.wName===player.name?'승':'패';
    info+='📅 '+m.date+' | '+m.map+' | '+result+' vs '+opp+'\n';
  });
  
  if(playerMatches.length>5){
    info+='... (최근 5경기만 표시)';
  }
  
  return info;
}
function formatPlayerCKRecord(player, ckM){
  const playerMatches=ckM.filter(m=>m.p1===player.name||m.p2===player.name);
  
  if(playerMatches.length===0){
    return '📭 '+player.name+'의 대학CK 기록이 없습니다.';
  }
  
  const wins=playerMatches.filter(m=>(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)).length;
  const losses=playerMatches.length-wins;
  const rate=playerMatches.length>0?((wins/playerMatches.length)*100).toFixed(1):0;
  
  let info='🤝 '+player.name+' 대학CK 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  playerMatches.slice(-5).reverse().forEach(m=>{
    const opp=m.p1===player.name?m.p2:m.p1;
    const result=(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)?'승':'패';
    info+='📅 '+m.date+' | '+m.map+' | '+result+' vs '+opp+' ('+m.sa+':'+m.sb+')\n';
  });
  
  if(playerMatches.length>5){
    info+='... (최근 5경기만 표시)';
  }
  
  return info;
}
function formatPlayerSevilRecord(player, univM){
  const playerMatches=univM.filter(m=>(m.p1===player.name||m.p2===player.name)&&(m.type==='시빌원'||m.stage==='시빌원'));
  
  if(playerMatches.length===0){
    return '📭 '+player.name+'의 시빌원 기록이 없습니다.';
  }
  
  const wins=playerMatches.filter(m=>(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)).length;
  const losses=playerMatches.length-wins;
  const rate=playerMatches.length>0?((wins/playerMatches.length)*100).toFixed(1):0;
  
  let info='🏛️ '+player.name+' 시빌원 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  playerMatches.slice(-5).reverse().forEach(m=>{
    const opp=m.p1===player.name?m.p2:m.p1;
    const result=(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)?'승':'패';
    info+='📅 '+m.date+' | '+m.map+' | '+result+' vs '+opp+' ('+m.sa+':'+m.sb+')\n';
  });
  
  if(playerMatches.length>5){
    info+='... (최근 5경기만 표시)';
  }
  
  return info;
}
function formatPlayerTournamentRecord(player, compM, ttM, proM){
  const allMatches=[];
  allMatches.push(...compM.filter(m=>m.p1===player.name||m.p2===player.name));
  allMatches.push(...ttM.filter(m=>m.p1===player.name||m.p2===player.name));
  allMatches.push(...proM.filter(m=>m.p1===player.name||m.p2===player.name));
  const playerMatches=allMatches.filter(m=>m.type==='토너먼트'||m.stage==='토너먼트'||m.format==='토너먼트');
  
  if(playerMatches.length===0){
    return '📭 '+player.name+'의 토너먼트 기록이 없습니다.';
  }
  
  const wins=playerMatches.filter(m=>(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)).length;
  const losses=playerMatches.length-wins;
  const rate=playerMatches.length>0?((wins/playerMatches.length)*100).toFixed(1):0;
  
  let info='🏆 '+player.name+' 토너먼트 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  playerMatches.slice(-5).reverse().forEach(m=>{
    const opp=m.p1===player.name?m.p2:m.p1;
    const result=(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)?'승':'패';
    info+='📅 '+m.date+' | '+m.map+' | '+result+' vs '+opp+' ('+m.sa+':'+m.sb+')\n';
  });
  
  if(playerMatches.length>5){
    info+='... (최근 5경기만 표시)';
  }
  
  return info;
}
function formatPlayerGroupRecord(player, compM, ttM, proM){
  const allMatches=[];
  allMatches.push(...compM.filter(m=>m.p1===player.name||m.p2===player.name));
  allMatches.push(...ttM.filter(m=>m.p1===player.name||m.p2===player.name));
  allMatches.push(...proM.filter(m=>m.p1===player.name||m.p2===player.name));
  const playerMatches=allMatches.filter(m=>m.type==='조별리그'||m.stage==='조별리그'||m.format==='조별리그');
  
  if(playerMatches.length===0){
    return '📭 '+player.name+'의 조별리그 기록이 없습니다.';
  }
  
  const wins=playerMatches.filter(m=>(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)).length;
  const losses=playerMatches.length-wins;
  const rate=playerMatches.length>0?((wins/playerMatches.length)*100).toFixed(1):0;
  
  let info='📋 '+player.name+' 조별리그 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  playerMatches.slice(-5).reverse().forEach(m=>{
    const opp=m.p1===player.name?m.p2:m.p1;
    const result=(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)?'승':'패';
    info+='📅 '+m.date+' | '+m.map+' | '+result+' vs '+opp+' ('+m.sa+':'+m.sb+')\n';
  });
  
  if(playerMatches.length>5){
    info+='... (최근 5경기만 표시)';
  }
  
  return info;
}
function formatPlayerTeamRecord(player, proM){
  const playerMatches=proM.filter(m=>m.p1===player.name||m.p2===player.name).filter(m=>m.type==='팀전'||m.format==='팀전');
  
  if(playerMatches.length===0){
    return '📭 '+player.name+'의 팀전 기록이 없습니다.';
  }
  
  const wins=playerMatches.filter(m=>(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)).length;
  const losses=playerMatches.length-wins;
  const rate=playerMatches.length>0?((wins/playerMatches.length)*100).toFixed(1):0;
  
  let info='👥 '+player.name+' 팀전 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  playerMatches.slice(-5).reverse().forEach(m=>{
    const opp=m.p1===player.name?m.p2:m.p1;
    const result=(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)?'승':'패';
    info+='📅 '+m.date+' | '+m.map+' | '+result+' vs '+opp+' ('+m.sa+':'+m.sb+')\n';
  });
  
  if(playerMatches.length>5){
    info+='... (최근 5경기만 표시)';
  }
  
  return info;
}
function formatPlayerNormalRecord(player, proM){
  const playerMatches=proM.filter(m=>m.p1===player.name||m.p2===player.name).filter(m=>m.type==='일반'||m.format==='일반'||!m.type&&!m.format);
  
  if(playerMatches.length===0){
    return '📭 '+player.name+'의 일반 기록이 없습니다.';
  }
  
  const wins=playerMatches.filter(m=>(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)).length;
  const losses=playerMatches.length-wins;
  const rate=playerMatches.length>0?((wins/playerMatches.length)*100).toFixed(1):0;
  
  let info='📝 '+player.name+' 일반 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  playerMatches.slice(-5).reverse().forEach(m=>{
    const opp=m.p1===player.name?m.p2:m.p1;
    const result=(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)?'승':'패';
    info+='📅 '+m.date+' | '+m.map+' | '+result+' vs '+opp+' ('+m.sa+':'+m.sb+')\n';
  });
  
  if(playerMatches.length>5){
    info+='... (최근 5경기만 표시)';
  }
  
  return info;
}
function formatRecordMenu(playerName){
  let menu='👤 '+playerName+' - 어떤 기록을 보시겠습니까?\n\n';
  menu+='<div class="chatbot-menu">\n';
  menu+='<button class="chatbot-menu-btn" onclick="window.sendChatbotMessage(\''+playerName+' 기록\')">1. 전체 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" onclick="window.sendChatbotMessage(\''+playerName+' 미니대전 성적\')">2. 미니대전 성적</button>\n';
  menu+='<button class="chatbot-menu-btn" onclick="window.sendChatbotMessage(\''+playerName+' 대학대전 기록\')">3. 대학대전 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" onclick="window.sendChatbotMessage(\''+playerName+' 개인전 기록\')">4. 개인전 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" onclick="window.sendChatbotMessage(\''+playerName+' 끝장전 기록\')">5. 끝장전 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" onclick="window.sendChatbotMessage(\''+playerName+' ck 기록\')">6. 대학CK 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" onclick="window.sendChatbotMessage(\''+playerName+' 대회 기록\')">7. 대회 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" onclick="window.sendChatbotMessage(\''+playerName+' 티어대회 기록\')">8. 티어대회 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" onclick="window.sendChatbotMessage(\''+playerName+' 프로리그 기록\')">9. 프로리그 기록</button>\n';
  menu+='</div>\n';
  menu+='<div style="font-size:12px;color:#94a3b8;margin-top:8px">번호나 버튼을 클릭하세요</div>';
  return menu;
}
