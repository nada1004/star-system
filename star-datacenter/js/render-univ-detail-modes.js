/* ══════════════════════════════════════
   대학 상세 팝업 — 디자인 모드 장식 요소
   (스트리머 상세 팝업과 동일한 컨셉을 재사용해 통일감 유지)
══════════════════════════════════════ */
function buildUnivDetailModeDecorHTML(mode){
  if(mode==='editorial'){
    return `<div class="ud-decor ud-decor-editorial" aria-hidden="true">
      <span class="ud-decor-kicker">UNIVERSITY PROFILE</span>
    </div>`;
  }
  if(mode==='pastel'){
    return `<div class="ud-decor ud-decor-pastel" aria-hidden="true">
      <span class="ud-decor-pastel-emoji" style="top:8px;right:14px">✨</span>
      <span class="ud-decor-pastel-emoji" style="top:22px;right:38px;font-size:var(--fs-caption)">🎓</span>
    </div>`;
  }
  if(mode==='glass'){
    return `<div class="ud-decor ud-decor-glass" aria-hidden="true"></div>`;
  }
  if(mode==='dashboard'){
    return `<div class="ud-decor ud-decor-dashboard" aria-hidden="true">
      <span class="ud-decor-dash-tag">UNIV-ID</span>
    </div>`;
  }
  if(mode==='mono'){
    return `<div class="ud-decor ud-decor-mono" aria-hidden="true">
      <span class="ud-decor-mono-stamp">OFFICIAL</span>
    </div>`;
  }
  if(mode==='sunset'){
    return `<div class="ud-decor ud-decor-sunset" aria-hidden="true">
      <span class="ud-decor-pastel-emoji" style="top:8px;right:14px">🌇</span>
    </div>`;
  }
  if(mode==='botanical'){
    return `<div class="ud-decor ud-decor-botanical" aria-hidden="true">
      <span class="ud-decor-pastel-emoji" style="top:8px;right:14px">🌿</span>
    </div>`;
  }
  if(mode==='neon'){
    return `<div class="ud-decor ud-decor-neon" aria-hidden="true">
      <span class="ud-decor-neon-tag">⚡ ONLINE</span>
    </div>`;
  }
  if(mode==='terminal'){
    return `<div class="ud-decor ud-decor-terminal" aria-hidden="true">
      <span class="ud-decor-prompt">root@star-dc:~$ whoami</span>
      <span class="ud-decor-cursor">▊</span>
    </div>`;
  }
  if(mode==='paper'){
    return `<div class="ud-decor ud-decor-paper" aria-hidden="true">
      <span class="ud-decor-paper-stamp">VERIFIED</span>
    </div>`;
  }
  if(mode==='holo'){
    return `<div class="ud-decor ud-decor-holo" aria-hidden="true">
      <span class="ud-decor-holo-tag">◈ HOLO-ID</span>
    </div>`;
  }
  if(mode==='arcade'){
    return `<div class="ud-decor ud-decor-arcade" aria-hidden="true">
      <span class="ud-decor-arcade-tag">P1 READY</span>
    </div>`;
  }
  if(mode==='luxury'){
    return `<div class="ud-decor ud-decor-luxury" aria-hidden="true">
      <span class="ud-decor-luxury-tag">MEMBER</span>
    </div>`;
  }
  if(mode==='aurora'){
    return `<div class="ud-decor ud-decor-aurora" aria-hidden="true">
      <span class="ud-decor-aurora-tag">✨ AURORA</span>
    </div>`;
  }
  return '';
}

try{
  window.buildUnivDetailModeDecorHTML = buildUnivDetailModeDecorHTML;
}catch(e){}
