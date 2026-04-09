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
  
  // 로그인 상태에 따라 설정 옵션 표시/숨김
  const settingsItem=document.querySelector('.fab-sub-item[onclick*="_fabGo(\'cfg\')"]');
  if(settingsItem){
    settingsItem.style.display=typeof isLoggedIn!=='undefined'&&isLoggedIn?'flex':'none';
  }
}

// 창 크기 변경 시 FAB 표시 여부 재계산
window.addEventListener('resize',updateFabVisibility);

// 페이지 로드 시 FAB 설정 옵션 표시 상태 초기화
window.addEventListener('DOMContentLoaded',updateFabVisibility);

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

// 페이지네이션 상태 관리
var _paginationState={
  currentQuery: null,
  currentPage: 1,
  pageSize: 10,
  totalMatches: 0,
  matches: [],
  formatFunction: null,
  formatParams: []
};

function setPaginationState(query, matches, formatFunction, formatParams){
  _paginationState.currentQuery=query;
  _paginationState.currentPage=1;
  _paginationState.totalMatches=matches.length;
  _paginationState.matches=matches;
  _paginationState.formatFunction=formatFunction;
  _paginationState.formatParams=formatParams;
}

function clearPaginationState(){
  _paginationState={
    currentQuery: null,
    currentPage: 1,
    pageSize: 10,
    totalMatches: 0,
    matches: [],
    formatFunction: null,
    formatParams: []
  };
}

function getPaginatedMatches(matches, page, pageSize){
  const startIndex=(page-1)*pageSize;
  const endIndex=startIndex+pageSize;
  // 이미 정렬된 데이터 사용 (최신순)
  return matches.slice(startIndex, endIndex);
}

function formatPaginationControls(totalMatches, currentPage, pageSize){
  const totalPages=Math.ceil(totalMatches/pageSize);
  if(totalPages<=1) return '';
  
  let controls='\n\n━━━━━━━━━━━━━━━━━━\n';
  controls+='<div style="display:flex;gap:8px;align-items:center;justify-content:center;padding:8px 0">\n';
  controls+='<button style="padding:6px 12px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;font-weight:500;color:#1e293b;cursor:pointer" onclick="window.sendChatbotMessage(\'이전 페이지\')">◀ 이전</button>\n';
  controls+='<span style="font-size:13px;font-weight:600;color:#64748b">'+currentPage+' / '+totalPages+'</span>\n';
  controls+='<button style="padding:6px 12px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;font-size:13px;font-weight:500;color:#1e293b;cursor:pointer" onclick="window.sendChatbotMessage(\'다음 페이지\')">다음 ▶</button>\n';
  controls+='</div>\n';
  return controls;
}

function handlePaginationCommand(command){
  if(!_paginationState.currentQuery||!_paginationState.formatFunction) return null;
  
  const totalPages=Math.ceil(_paginationState.totalMatches/_paginationState.pageSize);
  
  if(command==='이전 페이지'){
    if(_paginationState.currentPage>1){
      _paginationState.currentPage--;
    }else{
      return '⚠️ 첫 페이지입니다.';
    }
  }else if(command==='다음 페이지'){
    if(_paginationState.currentPage<totalPages){
      _paginationState.currentPage++;
    }else{
      return '⚠️ 마지막 페이지입니다.';
    }
  }
  
  // 저장된 format 함수로 재실행
  return _paginationState.formatFunction(..._paginationState.formatParams);
}

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
  console.log('Chatbot Debug - sendChatbotMessage called with:', query);
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
  
  // 페이지네이션 명령 처리
  if(q==='이전 페이지'||q==='다음 페이지'){
    const result=handlePaginationCommand(q);
    if(result) return result;
    return null;
  }
  
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
  
  // 선수 이름만 입력된 경우 - 메뉴만 표시
  const playerOnlyMatch=query.match(/^([^\s]+)$/);
  if(playerOnlyMatch){
    const playerName=playerOnlyMatch[1];
    const player=typeof players!=='undefined'?players.find(p=>p.name===playerName):null;
    if(!player)return '❌ "'+playerName+'" 선수를 찾을 수 없습니다.';
    
    // 메뉴만 표시
    return formatRecordMenu(playerName);
  }
  
  // 선수 이름 + 기록 유형 입력된 경우
  const playerMatch=query.match(/([^\s]+)\s+(대학\s+)?(기록|정보|미니대전|대학대전|개인전|전적|성적|대회|티어대회|프로리그|끝장전|시빌워|시빌원|ck|토너먼트|조별리그|팀전|일반|조별|총|토탈|통계|10)/);
  console.log('Chatbot Debug - Pattern match result:', !!playerMatch, 'query:', query);
  if(playerMatch){
    // 새 쿼리 시 페이지네이션 상태 초기화
    clearPaginationState();
    
    const playerName=playerMatch[1];
    const mode=playerMatch[playerMatch.length-1];
    
    console.log('Chatbot Debug - Query:', { playerName, mode, query, fullMatch: playerMatch });
    
    // 전역 players 변수 사용
    const player=typeof players!=='undefined'?players.find(p=>p.name===playerName):null;
    if(!player)return '❌ "'+playerName+'" 선수를 찾을 수 없습니다.';
    
    if(mode==='통계'||mode==='10'){
      return formatPlayerStats(player);
    }else if(mode==='기록'){
      return formatRecordMenu(playerName);
    }else if(mode==='정보'||mode==='전적'){
      return formatPlayerInfo(player);
    }else if(mode==='미니대전'||mode==='성적'){
      return formatPlayerMiniRecord(player, miniM);
    }else if(mode==='대학대전'||q.includes('대학대전')){
      return formatPlayerUnivMatchRecord(player, univM);
    }else if(mode==='개인전'){
      return formatPlayerIndRecord(player);
    }else if(mode==='끝장전'||q.includes('끝장전')&&!q.includes('프로리그')&&!q.includes('대회')){
      return formatPlayerGJRecord(player, gjM);
    }else if(mode==='ck'||q.includes('ck')){
      return formatPlayerCKRecord(player, ckM);
    }else if(mode==='시빌워'||mode==='시빌원'||q.includes('시빌')){
      return formatPlayerSevilRecord(player, univM);
    }else if(q.includes('대회 조별리그')||q.includes('프로리그 대회 조별리그')){
      return formatPlayerGroupRecord(player, compM, ttM, proM);
    }else if(mode==='토너먼트'||q.includes('토너먼트')){
      return formatPlayerTournamentRecord(player, compM, ttM, proM);
    }else if(mode==='조별리그'||mode==='조별'){
      return formatPlayerGroupRecord(player, compM, ttM, proM);
    }else if(mode==='대회'||q.includes('대회')&&!q.includes('티어대회')&&!q.includes('프로리그')&&!q.includes('조별리그')&&!q.includes('토너먼트')&&!q.includes('끝장전')){
      return formatPlayerCompRecord(player, compM, ttM, proM);
    }else if(mode==='티어대회'||q.includes('티어대회')&&!q.includes('조별리그')){
      return formatPlayerTTRecord(player, ttM);
    }else if(q.includes('프로리그 일반')||q.includes('프로리그')&&q.includes('일반')){
      return formatPlayerNormalRecord(player, proM);
    }else if(q.includes('프로리그 끝장전')||q.includes('프로리그')&&q.includes('끝장전')&&!q.includes('대회')){
      return formatPlayerProRecord(player, proM);
    }else if(q.includes('프로리그 대회 조별리그')){
      return formatPlayerGroupRecord(player, [], [], proM);
    }else if(mode==='일반'||q.includes('일반')&&!q.includes('프로리그')){
      return formatPlayerNormalRecord(player, proM);
    }else if(mode==='프로리'||q.includes('프로리그')&&!q.includes('일반')&&!q.includes('끝장전')&&!q.includes('대회')&&!q.includes('조별리그')){
      return formatPlayerProRecord(player, proM);
    }else{
      return '❌ 지원하지 않는 기록 유형입니다.';
    }
  }if(q.includes('미니대전')||q.includes('미니')){
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
  console.log('Chatbot Debug - formatPlayerMiniRecord:', { playerName: player.name, history: player.history ? player.history.length : 0 });
  
  // player.history의 실제 모드 라벨 디버깅
  if(player.history && player.history.length > 0){
    const modes=[...new Set(player.history.map(h=>h.mode).filter(Boolean))];
    console.log('Chatbot Debug - Available modes in history:', modes);
    const allDates=player.history.map(h=>h.date).filter(Boolean).sort((a,b)=>b.localeCompare(a));
    console.log('Chatbot Debug - All dates in history (sorted):', allDates.slice(0, 5), '...', allDates.slice(-5));
    console.log('Chatbot Debug - Sample history entries:', player.history.slice(0, 3).map(h=>({mode:h.mode,date:h.date,result:h.result})));
  }
  
  // player.history에서 미니대전 기록 추출 (스트리머 상세와 동일한 데이터 소스)
  let historyMatches=(player.history||[]).filter(h=>h.mode==='미니대전'||h.mode==='미니'||h.matchId&&h.matchId.startsWith('mm'));
  console.log('Chatbot Debug - history mini matches:', historyMatches.length);
  
  if(historyMatches.length===0){
    return '📭 '+player.name+'의 미니대전 기록이 없습니다.';
  }
  
  // 날짜순 정렬 (최신순)
  try{
    historyMatches=historyMatches.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
    console.log('Chatbot Debug - After sorting, first 3 matches:', historyMatches.slice(0, 3).map(h=>({date:h.date,map:h.map,result:h.result,opp:h.opp})));
    console.log('Chatbot Debug - After sorting, last 3 matches:', historyMatches.slice(-3).map(h=>({date:h.date,map:h.map,result:h.result,opp:h.opp})));
  }catch(e){
    console.error('Chatbot Debug - Sorting error:', e);
  }
  
  const wins=historyMatches.filter(h=>h.result==='승').length;
  const losses=historyMatches.filter(h=>h.result==='패').length;
  const rate=historyMatches.length>0?((wins/historyMatches.length)*100).toFixed(1):0;
  
  // 페이지네이션 상태 설정
  setPaginationState(player.name+' 미니대전 기록', historyMatches, formatPlayerMiniRecord, [player, miniM]);
  
  let info='⚡ '+player.name+' 미니대전 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  const paginatedMatches=getPaginatedMatches(historyMatches, _paginationState.currentPage, _paginationState.pageSize);
  console.log('Chatbot Debug - Paginated matches to display:', paginatedMatches.slice(0, 3).map(h=>({date:h.date,map:h.map,result:h.result,opp:h.opp})));
  paginatedMatches.forEach(h=>{
    info+='📅 '+h.date+' | '+h.map+' | '+h.result+' vs '+h.opp+'\n';
  });
  
  info+=formatPaginationControls(historyMatches.length, _paginationState.currentPage, _paginationState.pageSize);
  
  return info;
}
function formatPlayerUnivMatchRecord(player, univM){
  // player.history에서 대학대전 기록 추출 (스트리머 상세와 동일한 데이터 소스)
  let historyMatches=(player.history||[]).filter(h=>h.mode==='대학대전'||h.mode==='대학전'||h.mode==='univ');
  console.log('Chatbot Debug - history univ matches:', historyMatches.length);
  
  if(historyMatches.length===0){
    return '📭 '+player.name+'의 대학대전 기록이 없습니다.';
  }
  
  // 날짜순 정렬 (최신순)
  historyMatches=historyMatches.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
  
  const wins=historyMatches.filter(h=>h.result==='승').length;
  const losses=historyMatches.filter(h=>h.result==='패').length;
  const rate=historyMatches.length>0?((wins/historyMatches.length)*100).toFixed(1):0;
  
  // 페이지네이션 상태 설정
  setPaginationState(player.name+' 대학대전 기록', historyMatches, formatPlayerUnivMatchRecord, [player, univM]);
  
  let info='🏟️ '+player.name+' 대학대전 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  const paginatedMatches=getPaginatedMatches(historyMatches, _paginationState.currentPage, _paginationState.pageSize);
  paginatedMatches.forEach(h=>{
    info+='📅 '+h.date+' | '+h.map+' | '+h.result+' vs '+h.opp+'\n';
  });
  
  info+=formatPaginationControls(historyMatches.length, _paginationState.currentPage, _paginationState.pageSize);
  
  return info;
}
function formatPlayerIndRecord(player){
  console.log('Chatbot Debug - formatPlayerIndRecord:', { playerName: player.name, history: player.history ? player.history.length : 0, win: player.win, loss: player.loss });
  if(!player.history||player.history.length===0){
    return '📭 '+player.name+'의 개인전 기록이 없습니다.';
  }
  
  const total=player.win+player.loss;
  if(total===0){
    return '📭 '+player.name+'의 개인전 기록이 없습니다.';
  }
  
  // 페이지네이션 상태 설정
  setPaginationState(player.name+' 개인전 기록', player.history, formatPlayerIndRecord, [player]);
  
  let info='⚔️ '+player.name+' 개인전 기록\n';
  info+='📊 '+player.win+'승 '+player.loss+'패\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  const paginatedMatches=getPaginatedMatches(player.history, _paginationState.currentPage, _paginationState.pageSize);
  paginatedMatches.forEach(h=>{
    info+='📅 '+h.date+' | '+h.map+' | '+h.result+' vs '+h.opp+'\n';
  });
  
  info+=formatPaginationControls(player.history.length, _paginationState.currentPage, _paginationState.pageSize);
  
  return info;
}
function formatPlayerCompRecord(player, compM, ttM, proM){
  console.log('Chatbot Debug - formatPlayerCompRecord:', { playerName: player.name, compM: compM.length, ttM: ttM.length, proM: proM.length });
  
  const allMatches=[];
  
  // compM (개인전 구조일 수 있음)
  const compMatches=compM.filter(m=>m.p1===player.name||m.p2===player.name);
  console.log('Chatbot Debug - compMatches:', compMatches.length);
  
  // ttM (팀전 구조 - teamAMembers/teamBMembers는 객체 배열)
  let ttMatchCount=0;
  const ttMatches=ttM.filter(m=>{
    const teamA=m.teamAMembers||[];
    const teamB=m.teamBMembers||[];
    const found=teamA.some(mem=>mem.name===player.name)||teamB.some(mem=>mem.name===player.name);
    if(found && ttMatchCount < 3){
      console.log('Chatbot Debug - ttM match found:', { teamA: teamA.map(m=>m.name), teamB: teamB.map(m=>m.name), playerName: player.name });
      ttMatchCount++;
    }
    return found;
  });
  console.log('Chatbot Debug - ttMatches:', ttMatches.length);
  
  // proM (팀전 구조 - teamAMembers/teamBMembers는 객체 배열)
  let proMatchCount=0;
  const proMatches=proM.filter(m=>{
    const teamA=m.teamAMembers||[];
    const teamB=m.teamBMembers||[];
    const found=teamA.some(mem=>mem.name===player.name)||teamB.some(mem=>mem.name===player.name);
    if(found && proMatchCount < 3){
      console.log('Chatbot Debug - proM match found:', { teamA: teamA.map(m=>m.name), teamB: teamB.map(m=>m.name), playerName: player.name });
      proMatchCount++;
    }
    return found;
  });
  console.log('Chatbot Debug - proMatches:', proMatches.length);
  
  allMatches.push(...compMatches);
  allMatches.push(...ttMatches);
  allMatches.push(...proMatches);
  
  const playerMatches=allMatches;
  console.log('Chatbot Debug - total playerMatches:', playerMatches.length);
  
  if(playerMatches.length===0){
    return '📭 '+player.name+'의 대회 기록이 없습니다.';
  }
  
  const wins=playerMatches.filter(m=>{
    if(m.p1){
      return (m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa);
    }else{
      const teamA=m.teamAMembers||[];
      const teamB=m.teamBMembers||[];
      const inTeamA=teamA.some(mem=>mem.name===player.name);
      return (inTeamA&&m.sa>m.sb)||(!inTeamA&&m.sb>m.sa);
    }
  }).length;
  const losses=playerMatches.length-wins;
  const rate=playerMatches.length>0?((wins/playerMatches.length)*100).toFixed(1):0;
  
  // 페이지네이션 상태 설정
  setPaginationState(player.name+' 대회 기록', playerMatches, formatPlayerCompRecord, [player, compM, ttM, proM]);
  
  let info='🏆 '+player.name+' 대회 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  const paginatedMatches=getPaginatedMatches(playerMatches, _paginationState.currentPage, _paginationState.pageSize);
  paginatedMatches.forEach(m=>{
    if(m.p1){
      const opp=m.p1===player.name?m.p2:m.p1;
      const result=(m.p1===player.name&&m.sa>m.sb)||(m.p2===player.name&&m.sb>m.sa)?'승':'패';
      info+='📅 '+m.date+' | '+m.map+' | '+result+' vs '+opp+' ('+m.sa+':'+m.sb+')\n';
    }else{
      const teamA=m.teamAMembers||[];
      const teamB=m.teamBMembers||[];
      const inTeamA=teamA.some(mem=>mem.name===player.name);
      const oppTeam=inTeamA?m.teamBLabel:m.teamALabel;
      const result=(inTeamA&&m.sa>m.sb)||(!inTeamA&&m.sb>m.sa)?'승':'패';
      
      // sets/games에서 개별 상대방 이름 추출 시도
      let oppName=oppTeam;
      const sets=m.sets||[];
      for(const s of sets){
        const games=s.games||[];
        for(const g of games){
          if(g.playerA===player.name&&g.playerB){
            oppName=g.playerB;
            break;
          }else if(g.playerB===player.name&&g.playerA){
            oppName=g.playerA;
            break;
          }
        }
        if(oppName!==oppTeam) break;
      }
      
      info+='📅 '+m.d+' | '+(m.n||'대회')+' | '+result+' vs '+oppName+' ('+m.sa+':'+m.sb+')\n';
    }
  });
  
  info+=formatPaginationControls(playerMatches.length, _paginationState.currentPage, _paginationState.pageSize);
  
  return info;
}
function formatPlayerTTRecord(player, ttM){
  // player.history에서 티어대회 기록 추출 (스트리머 상세와 동일한 데이터 소스)
  let historyMatches=(player.history||[]).filter(h=>h.mode==='티어대회'||h.mode==='tier'||h.mode==='tt');
  console.log('Chatbot Debug - history tt matches:', historyMatches.length);
  
  if(historyMatches.length===0){
    return '📭 '+player.name+'의 티어대회 기록이 없습니다.';
  }
  
  // 날짜순 정렬 (최신순)
  historyMatches=historyMatches.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
  
  const wins=historyMatches.filter(h=>h.result==='승').length;
  const losses=historyMatches.filter(h=>h.result==='패').length;
  const rate=historyMatches.length>0?((wins/historyMatches.length)*100).toFixed(1):0;
  
  // 페이지네이션 상태 설정
  setPaginationState(player.name+' 티어대회 기록', historyMatches, formatPlayerTTRecord, [player, ttM]);
  
  let info='🎖️ '+player.name+' 티어대회 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  const paginatedMatches=getPaginatedMatches(historyMatches, _paginationState.currentPage, _paginationState.pageSize);
  paginatedMatches.forEach(h=>{
    info+='📅 '+h.date+' | '+h.map+' | '+h.result+' vs '+h.opp+'\n';
  });
  
  info+=formatPaginationControls(historyMatches.length, _paginationState.currentPage, _paginationState.pageSize);
  
  return info;
}
function formatPlayerProRecord(player, proM){
  // player.history에서 프로리그 기록 추출 (스트리머 상세와 동일한 데이터 소스)
  let historyMatches=(player.history||[]).filter(h=>h.mode==='프로리그'||h.mode==='pro'||h.mode==='프로');
  console.log('Chatbot Debug - history pro matches:', historyMatches.length);
  
  if(historyMatches.length===0){
    return '📭 '+player.name+'의 프로리그 기록이 없습니다.';
  }
  
  // 날짜순 정렬 (최신순)
  historyMatches=historyMatches.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
  
  const wins=historyMatches.filter(h=>h.result==='승').length;
  const losses=historyMatches.filter(h=>h.result==='패').length;
  const rate=historyMatches.length>0?((wins/historyMatches.length)*100).toFixed(1):0;
  
  // 페이지네이션 상태 설정
  setPaginationState(player.name+' 프로리그 기록', historyMatches, formatPlayerProRecord, [player, proM]);
  
  let info='🏅 '+player.name+' 프로리그 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  const paginatedMatches=getPaginatedMatches(historyMatches, _paginationState.currentPage, _paginationState.pageSize);
  paginatedMatches.forEach(h=>{
    info+='📅 '+h.date+' | '+h.map+' | '+h.result+' vs '+h.opp+'\n';
  });
  
  info+=formatPaginationControls(historyMatches.length, _paginationState.currentPage, _paginationState.pageSize);
  
  return info;
}
function formatPlayerGJRecord(player, gjM){
  // player.history에서 끝장전 기록 추출 (스트리머 상세와 동일한 데이터 소스)
  let historyMatches=(player.history||[]).filter(h=>h.mode==='끝장전'||h.mode==='gj'||h.mode==='결승');
  console.log('Chatbot Debug - history gj matches:', historyMatches.length);
  
  if(historyMatches.length===0){
    return '📭 '+player.name+'의 끝장전 기록이 없습니다.';
  }
  
  // 날짜순 정렬 (최신순)
  historyMatches=historyMatches.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
  
  const wins=historyMatches.filter(h=>h.result==='승').length;
  const losses=historyMatches.filter(h=>h.result==='패').length;
  const rate=historyMatches.length>0?((wins/historyMatches.length)*100).toFixed(1):0;
  
  // 페이지네이션 상태 설정
  setPaginationState(player.name+' 끝장전 기록', historyMatches, formatPlayerGJRecord, [player, gjM]);
  
  let info='🔥 '+player.name+' 끝장전 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  const paginatedMatches=getPaginatedMatches(historyMatches, _paginationState.currentPage, _paginationState.pageSize);
  paginatedMatches.forEach(h=>{
    info+='📅 '+h.date+' | '+h.map+' | '+h.result+' vs '+h.opp+'\n';
  });
  
  info+=formatPaginationControls(historyMatches.length, _paginationState.currentPage, _paginationState.pageSize);
  
  return info;
}
function formatPlayerCKRecord(player, ckM){
  // player.history에서 대학CK 기록 추출 (스트리머 상세와 동일한 데이터 소스)
  let historyMatches=(player.history||[]).filter(h=>h.mode==='대학CK'||h.mode==='ck'||h.mode==='CK');
  console.log('Chatbot Debug - history ck matches:', historyMatches.length);
  
  if(historyMatches.length===0){
    return '📭 '+player.name+'의 대학CK 기록이 없습니다.';
  }
  
  // 날짜순 정렬 (최신순)
  historyMatches=historyMatches.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
  
  const wins=historyMatches.filter(h=>h.result==='승').length;
  const losses=historyMatches.filter(h=>h.result==='패').length;
  const rate=historyMatches.length>0?((wins/historyMatches.length)*100).toFixed(1):0;
  
  // 페이지네이션 상태 설정
  setPaginationState(player.name+' 대학CK 기록', historyMatches, formatPlayerCKRecord, [player, ckM]);
  
  let info='🤝 '+player.name+' 대학CK 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  const paginatedMatches=getPaginatedMatches(historyMatches, _paginationState.currentPage, _paginationState.pageSize);
  paginatedMatches.forEach(h=>{
    info+='📅 '+h.date+' | '+h.map+' | '+h.result+' vs '+h.opp+'\n';
  });
  
  info+=formatPaginationControls(historyMatches.length, _paginationState.currentPage, _paginationState.pageSize);
  
  return info;
}
function formatPlayerSevilRecord(player, univM){
  // player.history에서 시빌워 기록 추출 (스트리머 상세와 동일한 데이터 소스)
  let historyMatches=(player.history||[]).filter(h=>h.mode==='시빌워'||h.mode==='시빌원'||h.mode==='civil');
  console.log('Chatbot Debug - history civil matches:', historyMatches.length);
  
  if(historyMatches.length===0){
    return '📭 '+player.name+'의 시빌원 기록이 없습니다.';
  }
  
  // 날짜순 정렬 (최신순)
  historyMatches=historyMatches.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
  
  const wins=historyMatches.filter(h=>h.result==='승').length;
  const losses=historyMatches.filter(h=>h.result==='패').length;
  const rate=historyMatches.length>0?((wins/historyMatches.length)*100).toFixed(1):0;
  
  // 페이지네이션 상태 설정
  setPaginationState(player.name+' 시빌원 기록', historyMatches, formatPlayerSevilRecord, [player, univM]);
  
  let info='🏛️ '+player.name+' 시빌원 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  const paginatedMatches=getPaginatedMatches(historyMatches, _paginationState.currentPage, _paginationState.pageSize);
  paginatedMatches.forEach(h=>{
    info+='📅 '+h.date+' | '+h.map+' | '+h.result+' vs '+h.opp+'\n';
  });
  
  info+=formatPaginationControls(historyMatches.length, _paginationState.currentPage, _paginationState.pageSize);
  
  return info;
}
function formatPlayerTournamentRecord(player, compM, ttM, proM){
  // player.history에서 토너먼트 기록 추출 (스트리머 상세와 동일한 데이터 소스)
  let historyMatches=(player.history||[]).filter(h=>h.mode==='토너먼트'||h.mode==='tournament'||h.mode==='토너');
  console.log('Chatbot Debug - history tournament matches:', historyMatches.length);
  
  if(historyMatches.length===0){
    return '📭 '+player.name+'의 토너먼트 기록이 없습니다.';
  }
  
  // 날짜순 정렬 (최신순)
  historyMatches=historyMatches.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
  
  const wins=historyMatches.filter(h=>h.result==='승').length;
  const losses=historyMatches.filter(h=>h.result==='패').length;
  const rate=historyMatches.length>0?((wins/historyMatches.length)*100).toFixed(1):0;
  
  // 페이지네이션 상태 설정
  setPaginationState(player.name+' 토너먼트 기록', historyMatches, formatPlayerTournamentRecord, [player, compM, ttM, proM]);
  
  let info='🏆 '+player.name+' 토너먼트 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  const paginatedMatches=getPaginatedMatches(historyMatches, _paginationState.currentPage, _paginationState.pageSize);
  paginatedMatches.forEach(h=>{
    info+='📅 '+h.date+' | '+h.map+' | '+h.result+' vs '+h.opp+'\n';
  });
  
  info+=formatPaginationControls(historyMatches.length, _paginationState.currentPage, _paginationState.pageSize);
  
  return info;
}
function formatPlayerCompRecord(player, compM, ttM, proM){
  // player.history에서 대회 기록 추출 (스트리머 상세와 동일한 데이터 소스)
  let historyMatches=(player.history||[]).filter(h=>h.mode==='대회'||h.mode==='대회전'||h.mode==='comp');
  console.log('Chatbot Debug - history comp matches:', historyMatches.length);
  
  if(historyMatches.length===0){
    return '📭 '+player.name+'의 대회 기록이 없습니다.';
  }
  
  // 날짜순 정렬 (최신순)
  historyMatches=historyMatches.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
  
  const wins=historyMatches.filter(h=>h.result==='승').length;
  const losses=historyMatches.filter(h=>h.result==='패').length;
  const rate=historyMatches.length>0?((wins/historyMatches.length)*100).toFixed(1):0;
  
  // 페이지네이션 상태 설정
  setPaginationState(player.name+' 대회 기록', historyMatches, formatPlayerCompRecord, [player, compM, ttM, proM]);
  
  let info='🏆 '+player.name+' 대회 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  const paginatedMatches=getPaginatedMatches(historyMatches, _paginationState.currentPage, _paginationState.pageSize);
  paginatedMatches.forEach(h=>{
    info+='📅 '+h.date+' | '+h.map+' | '+h.result+' vs '+h.opp+'\n';
  });
  
  info+=formatPaginationControls(historyMatches.length, _paginationState.currentPage, _paginationState.pageSize);
  
  return info;
}
function formatPlayerGroupRecord(player, compM, ttM, proM){
  // player.history에서 조별리그 기록 추출 (스트리머 상세와 동일한 데이터 소스)
  let historyMatches=(player.history||[]).filter(h=>h.mode==='조별리그'||h.mode==='group'||h.mode==='조별');
  console.log('Chatbot Debug - history group matches:', historyMatches.length);
  
  if(historyMatches.length===0){
    return '📭 '+player.name+'의 조별리그 기록이 없습니다.';
  }
  
  // 날짜순 정렬 (최신순)
  historyMatches=historyMatches.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
  
  const wins=historyMatches.filter(h=>h.result==='승').length;
  const losses=historyMatches.filter(h=>h.result==='패').length;
  const rate=historyMatches.length>0?((wins/historyMatches.length)*100).toFixed(1):0;
  
  // 페이지네이션 상태 설정
  setPaginationState(player.name+' 조별리그 기록', historyMatches, formatPlayerGroupRecord, [player, compM, ttM, proM]);
  
  let info='🏆 '+player.name+' 조별리그 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  const paginatedMatches=getPaginatedMatches(historyMatches, _paginationState.currentPage, _paginationState.pageSize);
  paginatedMatches.forEach(h=>{
    info+='📅 '+h.date+' | '+h.map+' | '+h.result+' vs '+h.opp+'\n';
  });
  
  info+=formatPaginationControls(historyMatches.length, _paginationState.currentPage, _paginationState.pageSize);
  
  return info;
}
function formatPlayerTeamRecord(player, proM){
  // player.history에서 팀전 기록 추출 (스트리머 상세와 동일한 데이터 소스)
  let historyMatches=(player.history||[]).filter(h=>h.mode==='팀전'||h.mode==='team'||h.mode==='팀');
  console.log('Chatbot Debug - history team matches:', historyMatches.length);
  
  if(historyMatches.length===0){
    return '📭 '+player.name+'의 팀전 기록이 없습니다.';
  }
  
  // 날짜순 정렬 (최신순)
  historyMatches=historyMatches.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
  
  const wins=historyMatches.filter(h=>h.result==='승').length;
  const losses=historyMatches.filter(h=>h.result==='패').length;
  const rate=historyMatches.length>0?((wins/historyMatches.length)*100).toFixed(1):0;
  
  // 페이지네이션 상태 설정
  setPaginationState(player.name+' 팀전 기록', historyMatches, formatPlayerTeamRecord, [player, proM]);
  
  let info='👥 '+player.name+' 팀전 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  const paginatedMatches=getPaginatedMatches(historyMatches, _paginationState.currentPage, _paginationState.pageSize);
  paginatedMatches.forEach(h=>{
    info+='📅 '+h.date+' | '+h.map+' | '+h.result+' vs '+h.opp+'\n';
  });
  
  info+=formatPaginationControls(historyMatches.length, _paginationState.currentPage, _paginationState.pageSize);
  
  return info;
}
function formatPlayerNormalRecord(player, proM){
  // player.history에서 일반 기록 추출 (스트리머 상세와 동일한 데이터 소스)
  let historyMatches=(player.history||[]).filter(h=>h.mode==='일반'||h.mode==='normal'||h.mode==='일반전');
  console.log('Chatbot Debug - history normal matches:', historyMatches.length);
  
  if(historyMatches.length===0){
    return '📭 '+player.name+'의 일반 기록이 없습니다.';
  }
  
  // 날짜순 정렬 (최신순)
  historyMatches=historyMatches.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
  
  const wins=historyMatches.filter(h=>h.result==='승').length;
  const losses=historyMatches.filter(h=>h.result==='패').length;
  const rate=historyMatches.length>0?((wins/historyMatches.length)*100).toFixed(1):0;
  
  // 페이지네이션 상태 설정
  setPaginationState(player.name+' 일반 기록', historyMatches, formatPlayerNormalRecord, [player, proM]);
  
  let info='📝 '+player.name+' 일반 기록\n';
  info+='📊 '+wins+'승 '+losses+'패 ('+rate+'%)\n';
  info+='━━━━━━━━━━━━━━━━━━\n';
  
  const paginatedMatches=getPaginatedMatches(historyMatches, _paginationState.currentPage, _paginationState.pageSize);
  paginatedMatches.forEach(h=>{
    info+='📅 '+h.date+' | '+h.map+' | '+h.result+' vs '+h.opp+'\n';
  });
  
  info+=formatPaginationControls(historyMatches.length, _paginationState.currentPage, _paginationState.pageSize);
  
  return info;
}
function formatPlayerStats(player){
  const total=player.win+player.loss;
  const rate=total>0?((player.win/total)*100).toFixed(1):0;
  
  let stats='📊 '+player.name+' 통계\n\n';
  
  // 기본 정보
  stats+='━━━━━━━━━━━━━━━━━━\n';
  stats+='👤 기본 정보\n';
  stats+='🏫 '+player.univ+' | '+player.tier+' | '+player.race+'종족\n';
  stats+='📊 전적: '+player.win+'승 '+player.loss+'패 ('+rate+'%)\n';
  stats+='⭐ ELO: '+player.elo+'\n';
  stats+='📝 총 전적 수: '+total+'경기\n\n';
  
  // 종족별 승률 (player.history에서 계산)
  if(player.history&&player.history.length>0){
    const raceStats={};
    player.history.forEach(h=>{
      if(h.oppRace){
        if(!raceStats[h.oppRace]) raceStats[h.oppRace]={win:0,loss:0,total:0};
        if(h.result==='승') raceStats[h.oppRace].win++;
        else raceStats[h.oppRace].loss++;
        raceStats[h.oppRace].total++;
      }
    });
    
    stats+='━━━━━━━━━━━━━━━━━━\n';
    stats+='🎯 종족별 승률\n';
    Object.keys(raceStats).forEach(race=>{
      const r=raceStats[race];
      const rRate=r.total>0?((r.win/r.total)*100).toFixed(1):0;
      stats+=race+'종족: '+r.win+'승 '+r.loss+'패 ('+rRate+'%)\n';
    });
    stats+='\n';
  }
  
  // 맵별 승률 (최근 20경기)
  if(player.history&&player.history.length>0){
    const mapStats={};
    player.history.slice(-20).forEach(h=>{
      if(h.map){
        if(!mapStats[h.map]) mapStats[h.map]={win:0,loss:0,total:0};
        if(h.result==='승') mapStats[h.map].win++;
        else mapStats[h.map].loss++;
        mapStats[h.map].total++;
      }
    });
    
    stats+='━━━━━━━━━━━━━━━━━━\n';
    stats+='🗺️ 맵별 승률 (최근 20경기)\n';
    const sortedMaps=Object.keys(mapStats).sort((a,b)=>mapStats[b].total-mapStats[a].total);
    sortedMaps.slice(0,5).forEach(map=>{
      const m=mapStats[map];
      const mRate=m.total>0?((m.win/m.total)*100).toFixed(1):0;
      stats+=map+': '+m.win+'승 '+m.loss+'패 ('+mRate+'%)\n';
    });
    stats+='\n';
  }
  
  // 선호 맵 TOP 5
  if(player.history&&player.history.length>0){
    const mapCounts={};
    player.history.forEach(h=>{
      if(h.map){
        mapCounts[h.map]=(mapCounts[h.map]||0)+1;
      }
    });
    
    const topMaps=Object.keys(mapCounts).sort((a,b)=>mapCounts[b]-mapCounts[a]).slice(0,5);
    stats+='━━━━━━━━━━━━━━━━━━\n';
    stats+='🏆 선호 맵 TOP 5\n';
    topMaps.forEach((map,i)=>{
      stats+=(i+1)+'. '+map+' ('+mapCounts[map]+'경기)\n';
    });
    stats+='\n';
  }
  
  // 약점 맵 TOP 3 (승률이 낮은 맵)
  if(player.history&&player.history.length>0){
    const mapWinRates={};
    player.history.forEach(h=>{
      if(h.map){
        if(!mapWinRates[h.map]) mapWinRates[h.map]={win:0,total:0};
        if(h.result==='승') mapWinRates[h.map].win++;
        mapWinRates[h.map].total++;
      }
    });
    
    const weakMaps=Object.keys(mapWinRates)
      .filter(map=>mapWinRates[map].total>=3)
      .sort((a,b)=>(mapWinRates[a].win/mapWinRates[a].total)-(mapWinRates[b].win/mapWinRates[b].total))
      .slice(0,3);
    
    if(weakMaps.length>0){
      stats+='━━━━━━━━━━━━━━━━━━\n';
      stats+='⚠️ 약점 맵 TOP 3\n';
      weakMaps.forEach((map,i)=>{
        const m=mapWinRates[map];
        const mRate=m.total>0?((m.win/m.total)*100).toFixed(1):0;
        stats+=(i+1)+'. '+map+' ('+mRate+'%)\n';
      });
      stats+='\n';
    }
  }
  
  stats+='<div class="chatbot-menu">\n';
  stats+='<button class="chatbot-menu-btn" onclick="window.sendChatbotMessage(\''+player.name+' 기록\')">상세 기록 보기</button>\n';
  stats+='</div>';
  
  return stats;
}

function formatRecordMenu(playerName){
  let menu='👤 '+playerName+' - 어떤 기록을 보시겠습니까?\n\n';
  menu+='<div class="chatbot-menu" style="display:flex;flex-direction:column;gap:8px;margin-top:8px">\n';
  
  menu+='<div style="font-size:13px;font-weight:600;color:#64748b;margin-bottom:4px">개인전탭</div>\n';
  menu+='<button class="chatbot-menu-btn" style="display:block;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:500;color:#1e293b;cursor:pointer;text-align:left;transition:all 0.2s" onclick="window.sendChatbotMessage(\''+playerName+' 개인전 기록\')">개인전 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" style="display:block;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:500;color:#1e293b;cursor:pointer;text-align:left;transition:all 0.2s" onclick="window.sendChatbotMessage(\''+playerName+' 끝장전 기록\')">끝장전 기록</button>\n';
  
  menu+='<div style="font-size:13px;font-weight:600;color:#64748b;margin:12px 0 4px 0">대학대전탭</div>\n';
  menu+='<button class="chatbot-menu-btn" style="display:block;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:500;color:#1e293b;cursor:pointer;text-align:left;transition:all 0.2s" onclick="window.sendChatbotMessage(\''+playerName+' 시빌워 기록\')">시빌워 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" style="display:block;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:500;color:#1e293b;cursor:pointer;text-align:left;transition:all 0.2s" onclick="window.sendChatbotMessage(\''+playerName+' 미니대전 성적\')">미니대전 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" style="display:block;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:500;color:#1e293b;cursor:pointer;text-align:left;transition:all 0.2s" onclick="window.sendChatbotMessage(\''+playerName+' 대학대전 기록\')">대학대전 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" style="display:block;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:500;color:#1e293b;cursor:pointer;text-align:left;transition:all 0.2s" onclick="window.sendChatbotMessage(\''+playerName+' ck 기록\')">대학CK 기록</button>\n';
  
  menu+='<div style="font-size:13px;font-weight:600;color:#64748b;margin:12px 0 4px 0">대회탭</div>\n';
  menu+='<button class="chatbot-menu-btn" style="display:block;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:500;color:#1e293b;cursor:pointer;text-align:left;transition:all 0.2s" onclick="window.sendChatbotMessage(\''+playerName+' 대회 조별리그 기록\')">대회 조별리그 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" style="display:block;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:500;color:#1e293b;cursor:pointer;text-align:left;transition:all 0.2s" onclick="window.sendChatbotMessage(\''+playerName+' 토너먼트 기록\')">토너먼트 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" style="display:block;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:500;color:#1e293b;cursor:pointer;text-align:left;transition:all 0.2s" onclick="window.sendChatbotMessage(\''+playerName+' 티어대회 기록\')">티어대회 기록</button>\n';
  
  menu+='<div style="font-size:13px;font-weight:600;color:#64748b;margin:12px 0 4px 0">프로리그</div>\n';
  menu+='<button class="chatbot-menu-btn" style="display:block;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:500;color:#1e293b;cursor:pointer;text-align:left;transition:all 0.2s" onclick="window.sendChatbotMessage(\''+playerName+' 프로리그 일반 기록\')">프로리그 일반 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" style="display:block;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:500;color:#1e293b;cursor:pointer;text-align:left;transition:all 0.2s" onclick="window.sendChatbotMessage(\''+playerName+' 프로리그 끝장전 기록\')">프로리그 끝장전 기록</button>\n';
  menu+='<button class="chatbot-menu-btn" style="display:block;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:500;color:#1e293b;cursor:pointer;text-align:left;transition:all 0.2s" onclick="window.sendChatbotMessage(\''+playerName+' 프로리그 대회 조별리그 기록\')">프로리그 대회 조별리그 기록</button>\n';
  
  menu+='<div style="font-size:13px;font-weight:600;color:#64748b;margin:12px 0 4px 0">통계</div>\n';
  menu+='<button class="chatbot-menu-btn" style="display:block;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;font-weight:500;color:#1e293b;cursor:pointer;text-align:left;transition:all 0.2s" onclick="window.sendChatbotMessage(\''+playerName+' 통계\')">통계</button>\n';
  
  menu+='</div>';
  menu+='<div style="font-size:12px;color:#94a3b8;margin-top:8px">버튼을 클릭하세요</div>';
  return menu;
}
