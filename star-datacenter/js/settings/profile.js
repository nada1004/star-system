(function(){
  window.SettingsModules = window.SettingsModules || {};

  function renderCfgProfileShapeCard(_scfgD){
    return _scfgD('profileshape','🖼️ 프로필 이미지 모양') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">선수 프로필 이미지(스트리머 상세/통계/경기 상세/현황판 등)의 모양을 원형/네모로 통일합니다.</div>
    <div id="cfg-profileshape-body" style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;color:var(--gray-l)">로딩 중...</div>
    </div>
  </details>`;
  }

  function renderProfileShapeSection(){
    const body = document.getElementById('cfg-profileshape-body');
    if(!body) return;
    const shape = (()=>{ try{ return (localStorage.getItem('su_profile_shape')||'circle'); }catch(e){ return 'circle'; } })();
    const fx = (()=>{ try{ return (localStorage.getItem('su_profile_fx')||'none'); }catch(e){ return 'none'; } })();
    const pc = (()=>{ try{ return parseInt(localStorage.getItem('su_profile_scale_pc')||'100',10)||100; }catch(e){ return 100; } })();
    const tb = (()=>{ try{ return parseInt(localStorage.getItem('su_profile_scale_tb')||'96',10)||96; }catch(e){ return 96; } })();
    const mb = (()=>{ try{ return parseInt(localStorage.getItem('su_profile_scale_mb')||'92',10)||92; }catch(e){ return 92; } })();
    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div>
          <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:8px">📐 모양</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <button class="btn ${shape==='circle'?'btn-b':'btn-w'}" onclick="_setGlobalProfileShape('circle');try{window._renderCfgProfileShapeSection&&window._renderCfgProfileShapeSection();}catch(e){}">⭕ 원형</button>
            <button class="btn ${shape==='square'?'btn-b':'btn-w'}" onclick="_setGlobalProfileShape('square');try{window._renderCfgProfileShapeSection&&window._renderCfgProfileShapeSection();}catch(e){}">⬛ 네모</button>
            <span style="font-size:11px;color:var(--gray-l);font-weight:900">현재: ${shape==='square'?'⬛ 네모':'⭕ 원형'}</span>
          </div>
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
