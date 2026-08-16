/* ══════════════════════════════════════
   🎵 YouTube BGM (오디오 전용)
   - 상단 검색바 좌측 재생/일시정지 버튼
   - 설정탭에서 URL 목록 등록
   - 곡 종료 시 다음곡 자동 재생
══════════════════════════════════════ */

(function(){
  const LS_ENABLED = 'su_bgm_enabled';   // '1' | '0'
  const LS_LIST    = 'su_bgm_list';      // newline separated URLs/IDs
  const LS_VOL     = 'su_bgm_volume';    // 0~100
  const LS_SHUFFLE = 'su_bgm_shuffle';   // '1' | '0'
  const LS_IDX     = 'su_bgm_idx';       // number

  const $ = (id)=>document.getElementById(id);

  function toast(msg, ms){
    try{ if(typeof showToast==='function') return showToast(msg, ms||2200); }catch(e){}
    try{ alert(msg); }catch(e){}
  }

  function isEnabled(){
    return (localStorage.getItem(LS_ENABLED) ?? '1') === '1';
  }
  function getVol(){
    const v = parseInt(localStorage.getItem(LS_VOL)||'50',10);
    return Math.max(0, Math.min(100, isNaN(v)?50:v));
  }
  function applyVolNow(){
    if(!player) return;
    const v = getVol();
    try{
      if(v<=0){ player.mute && player.mute(); }
      else { player.unMute && player.unMute(); }
      player.setVolume(v);
    }catch(e){}
    // 일부 환경에서 즉시 반영이 안 되는 경우 1회 재시도
    setTimeout(()=>{ try{ player.setVolume(getVol()); }catch(e){} }, 200);
  }
  function isShuffle(){
    return (localStorage.getItem(LS_SHUFFLE) ?? '0') === '1';
  }
  function getList(){
    const raw = String(localStorage.getItem(LS_LIST)||'').trim();
    if(!raw) return [];
    return raw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  }
  function setIdx(i){
    try{ localStorage.setItem(LS_IDX, String(i)); }catch(e){}
  }
  function getIdx(){
    const n = parseInt(localStorage.getItem(LS_IDX)||'0',10);
    return isNaN(n)?0:n;
  }

  function extractVideoId(urlOrId){
    const s = String(urlOrId||'').trim();
    if(!s) return '';
    // 이미 ID처럼 보이면 그대로
    if(/^[a-zA-Z0-9_-]{8,15}$/.test(s) && !s.includes('/')) return s;
    const m1 = s.match(/[?&]v=([a-zA-Z0-9_-]{8,15})/);
    if(m1) return m1[1];
    const m2 = s.match(/youtu\.be\/([a-zA-Z0-9_-]{8,15})/);
    if(m2) return m2[1];
    const m3 = s.match(/\/shorts\/([a-zA-Z0-9_-]{8,15})/);
    if(m3) return m3[1];
    const m4 = s.match(/\/embed\/([a-zA-Z0-9_-]{8,15})/);
    if(m4) return m4[1];
    return '';
  }

  // ── YouTube API loader ──
  let apiLoading = false;
  let apiReady = false;
  const apiWaiters = [];

  function loadApi(){
    if(apiReady) return Promise.resolve(true);
    return new Promise((resolve)=>{
      apiWaiters.push(resolve);
      if(apiLoading) return;
      apiLoading = true;
      if(window.YT && window.YT.Player){
        apiReady = true;
        apiWaiters.splice(0).forEach(r=>r(true));
        return;
      }
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function(){
        try{ prev && prev(); }catch(e){}
        apiReady = true;
        apiWaiters.splice(0).forEach(r=>r(true));
      };
    });
  }

  // ── Player state ──
  let player = null;
  let playerReady = false;
  let pendingPlay = null; // {vid,index,userInitiated}
  let state = 'stopped'; // playing|paused|stopped|loading
  let playToken = 0;
  const PLAY_START_TIMEOUT_MS = 5000; // 재생 시작 타임아웃(요청사항)

  function btnEl(){ return $('hdrBgmBtn'); }
  function updateBtn(){
    const b = btnEl();
    if(!b) return;
    const enabled = isEnabled();
    const list = getList();
    // (요청사항) 설정에 유튜브 주소가 있을 때만 버튼 표시
    const visible = enabled && list.length > 0;
    b.style.display = visible ? '' : 'none';
    if(!visible) return;
    b.disabled = false;
    b.style.opacity = '1';
    const icon = state === 'playing' ? '⏸' : state === 'loading' ? '⏳' : '▶';
    b.textContent = icon;
    b.title = '🎵 BGM 재생/일시정지';
  }

  function ensurePlayer(){
    return loadApi().then(()=>{
      if(player) return player;
      const host = $('ytBgmHost');
      if(!host){
        const div = document.createElement('div');
        div.id = 'ytBgmHost';
        div.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1';
        document.body.appendChild(div);
      }
      player = new YT.Player('ytBgmHost', {
        width: '1',
        height: '1',
        videoId: '',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            playerReady = true;
            applyVolNow();
            // 첫 클릭 시 API/플레이어 준비가 늦으면 여기서 재생을 이어서 수행
            if(pendingPlay && pendingPlay.vid){
              const p = pendingPlay;
              pendingPlay = null;
              try{
                state = 'loading'; updateBtn();
                player.loadVideoById(p.vid);
                setIdx(p.index);
                // 일부 모바일에서 load만 하고 재생이 안 붙는 경우가 있어 playVideo 한번 더 시도
                setTimeout(()=>{ try{ player.playVideo(); }catch(e){} }, 120);
              }catch(e){
                state='paused'; updateBtn();
              }
            }
          },
          onStateChange: (e) => {
            // 0 ended, 1 playing, 2 paused, 3 buffering
            if(e.data === 1) state = 'playing';
            else if(e.data === 2) state = 'paused';
            else if(e.data === 3) state = 'loading';
            else if(e.data === 0){
              state = 'paused';
              updateBtn();
              // 다음곡 자동
              setTimeout(()=>{ next(true); }, 200);
              return;
            } else state = 'stopped';
            // 재생 시작 시 볼륨 재적용 (PC/모바일 일부 환경 보강)
            if(e.data === 1) applyVolNow();
            updateBtn();
          }
        }
      });
      return player;
    });
  }

  function getNextIndex(list, cur){
    if(!list.length) return 0;
    if(isShuffle()){
      if(list.length === 1) return 0;
      let n = cur;
      for(let i=0;i<8;i++){
        n = Math.floor(Math.random()*list.length);
        if(n !== cur) break;
      }
      return n;
    }
    return (cur + 1) % list.length;
  }

  function playAt(index, userInitiated){
    const list = getList();
    if(!list.length){ toast('설정에서 유튜브 링크를 추가하세요.'); return; }
    const vid = extractVideoId(list[index]);
    if(!vid){ toast('유튜브 링크/ID 형식이 올바르지 않습니다.'); return; }
    state = 'loading'; updateBtn();
    const myToken = ++playToken;
    ensurePlayer().then(()=>{
      if(!playerReady){
        pendingPlay = { vid, index, userInitiated };
        return;
      }
      try{ player.setVolume(getVol()); }catch(e){}
      try{
        // loadVideoById는 즉시 전환. 모바일에서 막히면 재생이 안 될 수 있어 userInitiated 여부를 안내에 활용.
        player.loadVideoById(vid);
        setIdx(index);
        // 일부 환경에서 load만 되고 재생이 안 되는 경우 보강
        setTimeout(()=>{ try{ player.playVideo(); }catch(e){} }, 120);
      }catch(e){
        state='paused'; updateBtn();
        toast('재생 실패 — 다시 눌러주세요.');
      }
      // (요청사항) 일정 시간 내 재생 시작(PLAY)이 안 되면 다음곡으로 넘어감
      setTimeout(()=>{
        if(myToken !== playToken) return; // 다른 재생이 시작됨
        try{
          const st = player.getPlayerState();
          if(st !== 1){
            try{ player.stopVideo(); }catch(e){}
            state = 'paused'; updateBtn();
            toast('재생 지연 → 다음 곡으로 넘깁니다');
            next(true);
          }
        }catch(e){}
      }, PLAY_START_TIMEOUT_MS);
      // 모바일 자동재생 제한 대응: 일정 시간 후에도 playing이 아니면 안내
      setTimeout(()=>{
        try{
          const st = player.getPlayerState();
          if(st !== 1 && userInitiated){
            toast('모바일에서는 첫 재생이 한 번 더 눌러야 할 수 있어요.');
          }
        }catch(e){}
      }, 1200);
    });
  }

  function toggle(){
    if(!isEnabled()) return;
    const list = getList();
    if(!list.length){ toast('설정탭에서 유튜브 링크를 추가하세요.'); return; }
    ensurePlayer().then(()=>{
      try{
        const st = player.getPlayerState();
        // (요청사항) 광고가 재생중일 때 pauseVideo가 먹지 않는 경우가 있어
        // 멈춤은 stopVideo로 강제 중지(오디오 포함) 처리
        if(st === 1 || st === 3){
          try{ player.stopVideo(); }catch(e){}
          try{ player.mute && player.mute(); }catch(e){}
          state = 'paused';
          updateBtn();
          return;
        }
        if(st === 2){
          // stopVideo를 사용하므로 재개는 현재 인덱스 다시 로드
          const idx = Math.max(0, Math.min(list.length-1, getIdx()));
          playAt(idx, true);
          return;
        }
      }catch(e){}
      // 처음이거나 상태 확인 실패 → 현재 인덱스 재생
      const idx = Math.max(0, Math.min(list.length-1, getIdx()));
      playAt(idx, true);
    });
  }

  function next(auto){
    const list = getList();
    if(!list.length) return;
    const cur = Math.max(0, Math.min(list.length-1, getIdx()));
    const nx = getNextIndex(list, cur);
    playAt(nx, !auto);
  }

  // 외부에서 설정 변경 시 호출
  window.bgmApplySettings = function(){
    applyVolNow();
    updateBtn();
  };
  window.bgmToggle = toggle;
  window.bgmNext = next;

  // 초기 버튼 바인딩
  window.initBgm = function(){
    const b = btnEl();
    if(b && !b.dataset.bound){
      b.dataset.bound='1';
      b.addEventListener('click', (e)=>{ e.preventDefault(); toggle(); });
    }
    updateBtn();
  };

  // DOM이 이미 준비된 상태(스크립트가 body 하단에 로드)라서 즉시 실행
  try{ window.initBgm(); }catch(e){}
})();
