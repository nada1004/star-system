/* ══════════════════════════════════════
   스트리머 상세 팝업 — 디자인 모드 장식 요소
   (색상만 다른 게 아니라 모드별로 완전히 다른 분위기를
    내기 위한 소량의 장식용 HTML. 실제 배색/모양 변경은
    css/player-detail-design-modes.css 에서 처리한다.)
══════════════════════════════════════ */
function buildPlayerDetailModeDecorHTML(mode){
  if(mode==='editorial'){
    return `<div class="pd-decor pd-decor-editorial" aria-hidden="true">
      <span class="pd-decor-kicker">STREAMER PROFILE</span>
    </div>`;
  }
  if(mode==='pastel'){
    return `<div class="pd-decor pd-decor-pastel" aria-hidden="true"></div>`;
  }
  if(mode==='glass'){
    return `<div class="pd-decor pd-decor-glass" aria-hidden="true"></div>`;
  }
  if(mode==='dashboard'){
    return `<div class="pd-decor pd-decor-dashboard" aria-hidden="true">
      <span class="pd-decor-dash-tag">PLAYER-ID</span>
    </div>`;
  }
  if(mode==='mono'){
    return `<div class="pd-decor pd-decor-mono" aria-hidden="true">
      <span class="pd-decor-mono-stamp">OFFICIAL</span>
    </div>`;
  }
  if(mode==='sunset'){
    return `<div class="pd-decor pd-decor-sunset" aria-hidden="true"></div>`;
  }
  if(mode==='botanical'){
    return `<div class="pd-decor pd-decor-botanical" aria-hidden="true"></div>`;
  }
  if(mode==='neon'){
    return `<div class="pd-decor pd-decor-neon" aria-hidden="true">
      <span class="pd-decor-neon-tag">ONLINE</span>
    </div>`;
  }
  if(mode==='terminal'){
    return `<div class="pd-decor pd-decor-terminal" aria-hidden="true">
      <span class="pd-decor-prompt">root@star-dc:~$ whoami</span>
      <span class="pd-decor-cursor">▊</span>
    </div>`;
  }
  if(mode==='paper'){
    return `<div class="pd-decor pd-decor-paper" aria-hidden="true">
      <span class="pd-decor-paper-stamp">VERIFIED</span>
    </div>`;
  }
  if(mode==='holo'){
    return `<div class="pd-decor pd-decor-holo" aria-hidden="true">
      <span class="pd-decor-holo-tag">◈ HOLO-ID</span>
    </div>`;
  }
  if(mode==='arcade'){
    return `<div class="pd-decor pd-decor-arcade" aria-hidden="true">
      <span class="pd-decor-arcade-tag">P1 READY</span>
    </div>`;
  }
  if(mode==='luxury'){
    return `<div class="pd-decor pd-decor-luxury" aria-hidden="true">
      <span class="pd-decor-luxury-tag">MEMBER</span>
    </div>`;
  }
  if(mode==='aurora'){
    return `<div class="pd-decor pd-decor-aurora" aria-hidden="true">
      <span class="pd-decor-aurora-tag">AURORA</span>
    </div>`;
  }
  return '';
}

try{
  window.buildPlayerDetailModeDecorHTML = buildPlayerDetailModeDecorHTML;
}catch(e){}
