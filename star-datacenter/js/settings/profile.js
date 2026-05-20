(function(){
  window.SettingsModules = window.SettingsModules || {};

  function renderCfgProfileShapeCard(_scfgD){
    return _scfgD('profileshape','🖼️ 프로필 이미지 모양') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">선수 프로필 이미지(스트리머 상세/통계/경기 상세/현황판 등)의 모양을 설정합니다.</div>
    <div id="cfg-profileshape-body" style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;color:var(--gray-l)">로딩 중...</div>
    </div>
  </details>`;
  }

  const _SHAPE_OPTIONS = [
    { v:'circle',    label:'원형',      icon:'⭕', desc:'기본 원형',         radius:'50%',  clip:'none',                                                                                       preview:'border-radius:50%' },
    { v:'square',    label:'네모',      icon:'⬛', desc:'각진 사각형',        radius:'6px',  clip:'none',                                                                                       preview:'border-radius:6px' },
    { v:'rounded',   label:'둥근 네모', icon:'🟦', desc:'부드러운 모서리',    radius:'22%',  clip:'none',                                                                                       preview:'border-radius:22%' },
    { v:'squircle',  label:'스쿼클',    icon:'🔷', desc:'부드러운 사각원',    radius:'28%',  clip:'none',                                                                                       preview:'border-radius:28%' },
    { v:'diamond',   label:'다이아몬드',icon:'♦️', desc:'마름모형',           radius:'50%',  clip:'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',                                               preview:'border-radius:50%;clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
    { v:'hexagon',   label:'육각형',    icon:'⬡',  desc:'벌집 모양',          radius:'50%',  clip:'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',                      preview:'border-radius:50%;clip-path:polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)' },
    { v:'shield',    label:'방패형',    icon:'🛡️', desc:'방패 실루엣',        radius:'50%',  clip:'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)',                                       preview:'border-radius:8px 8px 0 0;clip-path:polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)' },
    { v:'pentagon',  label:'오각형',    icon:'⭐', desc:'오각형',             radius:'50%',  clip:'polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)',                                         preview:'border-radius:50%;clip-path:polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)' },
    { v:'star',      label:'별모양',    icon:'🌟', desc:'5각 별',             radius:'50%',  clip:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',  preview:'border-radius:50%;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' },
    { v:'blob',      label:'블롭',      icon:'🫧', desc:'물방울 느낌',        radius:'40% 60% 55% 45% / 45% 55% 60% 40%', clip:'none',                                                         preview:'border-radius:40% 60% 55% 45% / 45% 55% 60% 40%' },
    { v:'leaf',      label:'리프',      icon:'🍃', desc:'나뭇잎 모양',        radius:'50%',  clip:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',                                                  preview:'border-radius:50%;clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%)' },
    { v:'triangle',  label:'삼각형',    icon:'🔺', desc:'위로 뾰족',          radius:'0',    clip:'polygon(50% 0%, 0% 100%, 100% 100%)',                                                        preview:'clip-path:polygon(50% 0%, 0% 100%, 100% 100%)' },
    { v:'octagon',   label:'팔각형',    icon:'🔷', desc:'8각형',              radius:'50%',  clip:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',                 preview:'border-radius:50%;clip-path:polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)' },
    { v:'cross',     label:'십자형',    icon:'✚',  desc:'십자 모양',          radius:'0',    clip:'polygon(33% 0%,67% 0%,67% 33%,100% 33%,100% 67%,67% 67%,67% 100%,33% 100%,33% 67%,0% 67%,0% 33%,33% 33%)', preview:'clip-path:polygon(33% 0%,67% 0%,67% 33%,100% 33%,100% 67%,67% 67%,67% 100%,33% 100%,33% 67%,0% 67%,0% 33%,33% 33%)' },
    { v:'heart',     label:'하트',      icon:'❤️', desc:'하트 모양',          radius:'50% 50% 50% 50%/60% 60% 40% 40%', clip:'none',                                                            preview:'border-radius:50% 50% 50% 50%/60% 60% 40% 40%;transform:rotate(-45deg)' },
    { v:'parallelogram', label:'평행사변형', icon:'▱', desc:'기울어진 사각형', radius:'0', clip:'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',                                                   preview:'clip-path:polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)' },
    { v:'arrow',     label:'화살표',    icon:'➤',  desc:'오른쪽 화살표',      radius:'0',    clip:'polygon(0% 0%,75% 0%,100% 50%,75% 100%,0% 100%,25% 50%)',                                   preview:'clip-path:polygon(0% 0%,75% 0%,100% 50%,75% 100%,0% 100%,25% 50%)' },
  ];

  function renderProfileShapeSection(){
    const body = document.getElementById('cfg-profileshape-body');
    if(!body) return;
    const shape = (()=>{ try{ return (localStorage.getItem('su_profile_shape')||'circle'); }catch(e){ return 'circle'; } })();
    const fx = (()=>{ try{ return (localStorage.getItem('su_profile_fx')||'none'); }catch(e){ return 'none'; } })();
    const pc = (()=>{ try{ return parseInt(localStorage.getItem('su_profile_scale_pc')||'100',10)||100; }catch(e){ return 100; } })();
    const tb = (()=>{ try{ return parseInt(localStorage.getItem('su_profile_scale_tb')||'96',10)||96; }catch(e){ return 96; } })();
    const mb = (()=>{ try{ return parseInt(localStorage.getItem('su_profile_scale_mb')||'92',10)||92; }catch(e){ return 92; } })();

    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div>
          <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:10px">📐 모양 (17가지)</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:10px">
            ${_SHAPE_OPTIONS.map(s=>{
              const sel = shape===s.v;
              const sampleBg = 'linear-gradient(135deg,#6366f1,#a855f7)';
              return `<button type="button" onclick="_setGlobalProfileShape('${s.v}');try{applyProfileShapeVars();}catch(e){};try{render();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){};try{window._renderCfgProfileShapeSection&&window._renderCfgProfileShapeSection();}catch(e){}" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 10px;border-radius:14px;border:${sel?'2.5px solid var(--blue)':'1.5px solid var(--border)'};background:${sel?'linear-gradient(135deg,#eff6ff,#eef2ff)':'var(--white)'};cursor:pointer;box-shadow:${sel?'0 0 0 3px #2563eb22':'none'};transition:all .15s">
                <div style="width:52px;height:52px;background:${sampleBg};${s.preview};flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.12)"></div>
                <span style="font-size:12px;font-weight:900;color:${sel?'var(--blue)':'var(--text2)'}">${s.label}</span>
                <span style="font-size:9px;color:var(--gray-l);font-weight:700;text-align:center;line-height:1.3">${s.desc}</span>
              </button>`;
            }).join('')}
          </div>
          <div style="font-size:11px;color:var(--gray-l);margin-top:8px">현재: <b>${(_SHAPE_OPTIONS.find(s=>s.v===shape)||_SHAPE_OPTIONS[0]).label}</b></div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:8px">📏 크기 배율 (탭/팝업 공통)</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="min-width:74px;font-size:12px;font-weight:800;color:var(--text2)">PC</div>
              <input type="range" min="70" max="130" step="2" value="${pc}" style="flex:1;accent-color:var(--blue)"
                oninput="localStorage.setItem('su_profile_scale_pc',String(this.value));document.getElementById('cfg-ps-pc').textContent=this.value+'%';try{applyProfileShapeVars();}catch(e){};try{render();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){}">
              <div id="cfg-ps-pc" style="min-width:42px;text-align:right;font-size:11px;color:var(--gray-l);font-weight:900">${pc}%</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="min-width:74px;font-size:12px;font-weight:800;color:var(--text2)">태블릿</div>
              <input type="range" min="70" max="130" step="2" value="${tb}" style="flex:1;accent-color:var(--blue)"
                oninput="localStorage.setItem('su_profile_scale_tb',String(this.value));document.getElementById('cfg-ps-tb').textContent=this.value+'%';try{applyProfileShapeVars();}catch(e){};try{render();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){}">
              <div id="cfg-ps-tb" style="min-width:42px;text-align:right;font-size:11px;color:var(--gray-l);font-weight:900">${tb}%</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="min-width:74px;font-size:12px;font-weight:800;color:var(--text2)">모바일</div>
              <input type="range" min="70" max="130" step="2" value="${mb}" style="flex:1;accent-color:var(--blue)"
                oninput="localStorage.setItem('su_profile_scale_mb',String(this.value));document.getElementById('cfg-ps-mb').textContent=this.value+'%';try{applyProfileShapeVars();}catch(e){};try{render();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){}">
              <div id="cfg-ps-mb" style="min-width:42px;text-align:right;font-size:11px;color:var(--gray-l);font-weight:900">${mb}%</div>
            </div>
            <div style="font-size:11px;color:var(--gray-l)">※ 브라우저 폭 기준: 모바일(≤768) / 태블릿(≤1024) / PC(그 외)</div>
          </div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:8px">✨ 효과</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${[['none','없음'],['shadow','그림자'],['ring','링'],['both','링+그림자'],['glow','글로우'],['glow-color','컬러 글로우'],['blur-edge','외곽 블러'],['vintage','빈티지'],['sepia','세피아'],['grayscale','흑백'],['invert','반전']].map(([k,l])=>`<button class="btn btn-xs ${(fx===k)?'btn-b':'btn-w'}" onclick="localStorage.setItem('su_profile_fx','${k}');try{applyProfileShapeVars();}catch(e){};try{render();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){};try{window._renderCfgProfileShapeSection&&window._renderCfgProfileShapeSection();}catch(e){}">${l}</button>`).join('')}
          </div>
          <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 효과는 프로필 이미지(사진/플레이스홀더)에 공통 적용됩니다</div>
        </div>
      </div>
    `;
  }

  window.renderCfgProfileShapeCard = renderCfgProfileShapeCard;
  window._renderCfgProfileShapeSection = renderProfileShapeSection;
  window.SettingsModules.profile = {
    renderCfgProfileShapeCard,
    renderProfileShapeSection
  };
})();
