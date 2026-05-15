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
    { v:'circle',  label:'원형',      icon:'⭕', desc:'기본 원형',    radius:'50%',   clip:'none',                                                               preview:'border-radius:50%' },
    { v:'square',  label:'네모',      icon:'⬛', desc:'각진 사각형',  radius:'6px',   clip:'none',                                                               preview:'border-radius:6px' },
    { v:'rounded', label:'둥근 네모', icon:'🟦', desc:'부드러운 모서리', radius:'22%', clip:'none',                                                              preview:'border-radius:22%' },
    { v:'diamond', label:'다이아몬드',icon:'♦️', desc:'마름모형',     radius:'50%',   clip:'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',                        preview:'border-radius:50%;clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
    { v:'hexagon', label:'육각형',    icon:'⬡', desc:'벌집 모양',    radius:'50%',   clip:'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',preview:'border-radius:50%;clip-path:polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)' },
    { v:'shield',  label:'방패형',    icon:'🛡', desc:'방패 실루엣',  radius:'50%',   clip:'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)',                preview:'border-radius:8px 8px 0 0;clip-path:polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)' },
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
          <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:10px">📐 모양 (6가지)</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:8px">
            ${_SHAPE_OPTIONS.map(s=>{
              const sel = shape===s.v;
              const sampleBg = 'linear-gradient(135deg,#6366f1,#a855f7)';
              return `<button type="button" onclick="_setGlobalProfileShape('${s.v}');try{window._renderCfgProfileShapeSection&&window._renderCfgProfileShapeSection();}catch(e){}" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 8px;border-radius:12px;border:${sel?'2px solid var(--blue)':'1.5px solid var(--border)'};background:${sel?'linear-gradient(135deg,#eff6ff,#eef2ff)':'var(--white)'};cursor:pointer">
                <div style="width:34px;height:34px;background:${sampleBg};${s.preview};flex-shrink:0"></div>
                <span style="font-size:11px;font-weight:900;color:${sel?'var(--blue)':'var(--text2)'}">${s.label}</span>
                <span style="font-size:9px;color:var(--gray-l);font-weight:700">${s.desc}</span>
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
            ${[['none','없음'],['shadow','그림자'],['ring','링'],['both','링+그림자']].map(([k,l])=>`<button class="btn btn-xs ${(fx===k)?'btn-b':'btn-w'}" onclick="localStorage.setItem('su_profile_fx','${k}');try{applyProfileShapeVars();}catch(e){};try{render();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){};try{window._renderCfgProfileShapeSection&&window._renderCfgProfileShapeSection();}catch(e){}">${l}</button>`).join('')}
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
