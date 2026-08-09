/* ══════════════════════════════════════
   설정 분리: 스트리머 상세 배지/프로필/UI 크기
══════════════════════════════════════ */
function _cfgBuildPdModeBadgeColorRows(){
  const defaults = {
    '미니대전':'#7c3aed','대학대전':'#4338ca',
    '시빌워':'#db2777','프로리그':'#0891b2','티어대회':'#f59e0b','대학CK':'#dc2626',
    '대회':'#c026d3','프로리그대회':'#0f766e','끝장전':'#ea580c','개인전':'#be185d','테스트':'#6b7280'
  };
  const user = (()=>{ try{ return JSON.parse(localStorage.getItem('su_pd_mode_badge_colors')||'{}')||{}; }catch(e){ return {}; } })();
  const colors = {...defaults, ...user};
  const rows = Object.keys(defaults).map(k=>{
    const v = colors[k] || defaults[k];
    const kk = k.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return `<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)">
      <span style="min-width:84px;font-size:var(--fs-sm);font-weight:800;color:var(--text2)">${k}</span>
      <input type="color" value="${v}" style="width:42px;height:32px;padding:2px;border-radius:8px;border:1px solid var(--border2);background:var(--white);cursor:pointer"
        onchange="cfgPdSetModeBadgeColor('${kk}',this.value)">
      <input type="text" value="${v}" style="width:96px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:900;text-align:center"
        onblur="cfgPdSetModeBadgeColor('${kk}',this.value)" placeholder="#RRGGBB">
      <span style="margin-left:auto;background:${v};color:#fff;font-size:10px;font-weight:900;padding:2px 8px;border-radius:999px">예시</span>
    </div>`;
  }).join('');
  return {defaults, rows};
}

function _renderCfgPdModeBadgeSection(){
  const body = document.getElementById('cfg-pdmb-body');
  if(!body) return;
  const {rows} = _cfgBuildPdModeBadgeColorRows();
  body.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:10px 12px">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">🎨 종목(종류) 배지 색상</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:10px">변경 즉시 반영됩니다.</div>
      ${rows}
      <div style="display:flex;gap:8px;align-items:center;margin-top:10px">
        <button class="btn btn-w btn-xs" onclick="cfgPdResetModeBadgeColors()">🔄 기본값으로 초기화</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 바뀐 색상은 즉시 반영됩니다</span>
      </div>
    </div>
  `;
}

// [FIX-PROFILESHAPE-1] 실제 모양 데이터(적용 로직인 constants*.js의 applyProfileShapeVars와 동일한 값을 사용)
var _PROFILE_SHAPES = [
  {k:'circle',l:'원형'},{k:'square',l:'정사각'},{k:'rounded',l:'둥근사각'},{k:'squircle',l:'스퀴클'},
  {k:'diamond',l:'다이아'},{k:'hexagon',l:'육각'},{k:'pentagon',l:'오각'},{k:'octagon',l:'팔각'},
  {k:'shield',l:'방패'},{k:'star',l:'별'},{k:'heart',l:'하트'},{k:'blob',l:'블롭'},
  {k:'leaf',l:'나뭇잎'},{k:'triangle',l:'삼각'},{k:'pill',l:'알약'},{k:'stadium',l:'스타디움'},
  {k:'teardrop',l:'물방울'},{k:'moon',l:'초승달'},{k:'cloud',l:'구름'},{k:'flower',l:'꽃'},
  {k:'clover',l:'클로버'},{k:'trophy',l:'트로피'},{k:'crown',l:'왕관'},{k:'medal',l:'메달'},
  {k:'arena',l:'아레나'},{k:'target',l:'과녁'},{k:'thunder',l:'번개'},{k:'versus',l:'VS'}
];
var _PROFILE_SHAPE_RADIUS = {
  circle:'50%', square:'6px', rounded:'22%', squircle:'28%', diamond:'50%', hexagon:'50%',
  shield:'50% 50% 45% 45% / 60% 60% 40% 40%', pentagon:'50%', star:'50%',
  blob:'40% 60% 55% 45% / 45% 55% 60% 40%', leaf:'50%', triangle:'0', octagon:'50%',
  heart:'50% 50% 50% 50%/60% 60% 40% 40%', pill:'50px', stadium:'40% 40% 40% 40% / 60% 60% 60% 60%',
  teardrop:'50% 50% 50% 50% / 60% 60% 40% 40%', moon:'50%', cloud:'50%', flower:'50%',
  clover:'50%', trophy:'0', crown:'0', medal:'50%', arena:'50%', target:'50%', thunder:'0', versus:'0'
};
var _PROFILE_SHAPE_CLIP = {
  diamond:'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  hexagon:'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',
  shield:'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)',
  pentagon:'polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)',
  star:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
  leaf:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',
  triangle:'polygon(50% 0%, 0% 100%, 100% 100%)',
  octagon:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',
  cloud:'polygon(8% 60%,5% 45%,12% 32%,22% 26%,30% 10%,45% 4%,60% 10%,72% 5%,85% 14%,92% 28%,96% 43%,90% 58%,78% 66%,62% 70%,40% 70%,22% 66%)',
  flower:'polygon(50% 5%,61% 29%,84% 20%,74% 44%,98% 50%,74% 56%,84% 80%,61% 71%,50% 95%,39% 71%,16% 80%,26% 56%,2% 50%,26% 44%,16% 20%,39% 29%)',
  moon:'ellipse(50% 50% at 65% 50%)',
  trophy:'polygon(20% 0%,80% 0%,85% 30%,100% 30%,100% 45%,85% 45%,75% 68%,80% 80%,90% 85%,90% 100%,10% 100%,10% 85%,20% 80%,25% 68%,15% 45%,0% 45%,0% 30%,15% 30%)',
  crown:'polygon(0% 100%,0% 40%,25% 65%,50% 0%,75% 65%,100% 40%,100% 100%)',
  arena:'polygon(50% 0%,90% 10%,100% 50%,90% 90%,50% 100%,10% 90%,0% 50%,10% 10%)',
  medal:'polygon(25% 0%,75% 0%,75% 10%,100% 32%,100% 68%,75% 90%,75% 100%,25% 100%,25% 90%,0% 68%,0% 32%,25% 10%)',
  thunder:'polygon(30% 0%,65% 0%,45% 42%,75% 42%,18% 100%,38% 55%,8% 55%)',
  versus:'polygon(0% 0%,100% 0%,100% 72%,50% 100%,0% 72%)'
};
// [FIX-PROFILESHAPE-2] 설정탭 "프로필 이미지 모양" 섹션 스켈레톤을 만들어 줍니다.
// 예전엔 이 카드 자체가 아예 생성되지 않아서 버튼을 눌러도 아무 반응이 없었습니다.
window.renderCfgProfileShapeCard = function(_scfgD){
  try{
    const open = (typeof _scfgD==='function') ? _scfgD('profileshape','📐 프로필 이미지 모양') : '';
    if(!open) return '';
    return `${open}
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:10px">현황판·스트리머 상세 등 전체 화면에서 쓰이는 프로필·로고 이미지의 모양과 크기를 설정합니다.</div>
    <div id="cfg-profileshape-body"><div style="font-size:var(--fs-sm);color:var(--gray-l)">로딩 중...</div></div>
  </details>`;
  }catch(e){ return ''; }
};
function _setProfileScale(dev, val){
  const key = 'su_profile_scale_'+dev;
  const v = Math.max(70, Math.min(130, parseInt(val,10)||100));
  try{ localStorage.setItem(key, String(v)); }catch(e){}
  try{ if(typeof applyProfileShapeVars==='function') applyProfileShapeVars(); }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function' && window.SettingsStore.markPrefsChanged(); }catch(e){}
}
function _resetProfileShapeAll(){
  try{
    localStorage.removeItem('su_profile_shape');
    localStorage.removeItem('su_profile_scale_pc');
    localStorage.removeItem('su_profile_scale_tb');
    localStorage.removeItem('su_profile_scale_mb');
    if(typeof applyProfileShapeVars==='function') applyProfileShapeVars();
  }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
  try{ if(typeof _renderCfgProfileShapeSection==='function') _renderCfgProfileShapeSection(); }catch(e){}
}
function _renderCfgProfileShapeSection(){
  const body = document.getElementById('cfg-profileshape-body');
  if(!body) return;
  const cur = (()=>{ try{ return localStorage.getItem('su_profile_shape') || localStorage.getItem('su_bcp_shape') || 'circle'; }catch(e){ return 'circle'; } })();
  const getInt=(k,def)=>{ try{ const v=parseInt(localStorage.getItem(k),10); return isNaN(v)?def:Math.max(70,Math.min(130,v)); }catch(e){ return def; } };
  const pc = getInt('su_profile_scale_pc',100);
  const tb = getInt('su_profile_scale_tb',96);
  const mb = getInt('su_profile_scale_mb',92);

  const swatchCss=(key)=>{
    const radius = _PROFILE_SHAPE_RADIUS[key] || '50%';
    const clip = _PROFILE_SHAPE_CLIP[key];
    return `border-radius:${radius};${clip?`clip-path:${clip};`:''}`;
  };
  const grid = _PROFILE_SHAPES.map(({k,l})=>{
    const sel = k===cur;
    return `<button class="btn btn-xs" onclick="_setGlobalProfileShape('${k}')" title="${l}"
      style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;min-width:56px;border:2px solid ${sel?'var(--blue)':'var(--border2)'};background:${sel?'#eff6ff':'var(--white)'}">
      <span style="width:28px;height:28px;display:block;background:linear-gradient(135deg,#93c5fd,#6366f1);${swatchCss(k)}"></span>
      <span style="font-size:10px;font-weight:${sel?900:600};color:${sel?'var(--blue)':'var(--text2)'}">${l}</span>
    </button>`;
  }).join('');

  const scaleRow=(label,dev,val)=>{
    const id = 'cfg-pshape-'+dev;
    return `
    <div style="display:flex;align-items:center;gap:10px">
      <div style="min-width:52px;font-size:var(--fs-sm);font-weight:800;color:var(--text2)">${label}</div>
      <input type="range" id="${id}" min="70" max="130" step="2" value="${val}" style="flex:1;accent-color:var(--blue)"
        oninput="document.getElementById('${id}-v').textContent=this.value+'%';clearTimeout(window._pshapeScaleT);window._pshapeScaleT=setTimeout(()=>{_setProfileScale('${dev}',document.getElementById('${id}').value);},120)">
      <div id="${id}-v" style="width:44px;text-align:right;font-size:var(--fs-caption);color:var(--gray-l);font-weight:900">${val}%</div>
    </div>`;
  };

  body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">📐 모양 선택</div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:10px">클릭하면 바로 적용됩니다.</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;max-height:280px;overflow-y:auto;padding:2px">${grid}</div>
      </div>
      <div>
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">📏 크기(기기별)</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${scaleRow('PC','pc',pc)}
          ${scaleRow('태블릿','tb',tb)}
          ${scaleRow('모바일','mb',mb)}
        </div>
      </div>
      <button class="btn btn-w btn-xs" style="align-self:flex-start" onclick="_resetProfileShapeAll()">↩️ 모양·크기 기본값으로</button>
    </div>
  `;
}

function _renderCfgUiSizeSection(){
  const body = document.getElementById('cfg-uisize-body');
  if(!body) return;
  const getF=(k,def)=>{ try{ const v=parseFloat(localStorage.getItem(k)); return isNaN(v)?def:v; }catch(e){ return def; } };
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mb = clamp(getF('su_mb_scale', 0.88), 0.65, 1.10);
  const tb = clamp(getF('su_tb_scale', 0.92), 0.65, 1.10);
  const mmb = clamp(getF('su_modal_mb_scale', 0.70), 0.55, 1.10);
  const mtb = clamp(getF('su_modal_tb_scale', 0.78), 0.55, 1.10);
  const mbTab = clamp(getF('su_tab_mb_scale', 0.90), 0.65, 1.10);
  const tbTab = clamp(getF('su_tab_tb_scale', 0.94), 0.65, 1.10);
  const mdMb = clamp(getF('su_md_mb_btn_scale', 1.00), 0.70, 1.30);
  const mdTb = clamp(getF('su_md_tb_btn_scale', 1.00), 0.70, 1.30);
  const badgeMb = clamp(getF('su_pd_badge_scale_mb', getF('su_pd_badge_scale', 1.00)), 0.55, 1.20);
  const badgeTb = clamp(getF('su_pd_badge_scale_tb', getF('su_pd_badge_scale', 1.00)), 0.60, 1.25);
  const univMb = clamp(getF('su_univ_recent_chip_scale_mb', 1.00), 0.60, 1.20);
  const univTb = clamp(getF('su_univ_recent_chip_scale_tb', 1.00), 0.65, 1.25);
  const selMb = clamp(getF('su_select_mb_scale', 0.92), 0.70, 1.15);
  const selTb = clamp(getF('su_select_tb_scale', 0.96), 0.70, 1.15);
  const chip = clamp(getF('su_pd_chip_scale', 1.00), 0.70, 1.30);
  const topTabPcFont = clamp(getF('su_top_tab_font_pc_px', 12), 9, 20);
  const topTabTbFont = clamp(getF('su_top_tab_font_tb_px', 11), 9, 18);
  const topTabMbFont = clamp(getF('su_top_tab_font_mb_px', 10), 8, 16);
  const subTabFont = clamp(getF('su_subtab_font_px', 12), 9, 18);

  const row=(label, id, val, min, max, step, hint)=>{
    const pct=Math.round(val*100);
    return `
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <div style="min-width:170px;font-size:var(--fs-sm);font-weight:900;color:var(--text2)">${label}</div>
        <input type="range" min="${min}" max="${max}" step="${step}" value="${val}"
          oninput="(function(el){ localStorage.setItem('${id}', String(el.value)); try{ window.applyResponsiveUiVars && window.applyResponsiveUiVars(); }catch(e){}; try{ render(); }catch(e){}; try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}; try{ if(typeof window.cfgTouchPrefsSync==="function") window.cfgTouchPrefsSync(); }catch(e){}; const v=document.getElementById('${id}-v'); if(v) v.textContent=Math.round(parseFloat(el.value)*100)+'%'; })(this)"
          style="flex:1;min-width:220px;accent-color:var(--blue)">
        <div id="${id}-v" style="width:52px;text-align:right;font-size:var(--fs-caption);color:var(--gray-l);font-weight:900">${pct}%</div>
        ${hint?`<div style="font-size:var(--fs-caption);color:var(--gray-l)">${hint}</div>`:''}
      </div>
    `;
  };

  body.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px">
      ${row('모바일 버튼/메뉴 전체', 'su_mb_scale', mb, 0.65, 1.10, 0.02, '기본 88%')}
      ${row('태블릿 버튼/메뉴 전체', 'su_tb_scale', tb, 0.65, 1.10, 0.02, '기본 92%')}
      ${row('모바일 팝업(스트리머/대학) 버튼', 'su_modal_mb_scale', mmb, 0.55, 1.10, 0.02, '기본 70%')}
      ${row('태블릿 팝업(스트리머/대학) 버튼', 'su_modal_tb_scale', mtb, 0.55, 1.10, 0.02, '기본 78%')}
      ${row('모바일 탭 버튼(.tab)', 'su_tab_mb_scale', mbTab, 0.65, 1.10, 0.02, '기본 90%')}
      ${row('태블릿 탭 버튼(.tab)', 'su_tab_tb_scale', tbTab, 0.65, 1.10, 0.02, '기본 94%')}
      ${row('상단 메인 탭 글자(PC)', 'su_top_tab_font_pc_px', topTabPcFont, 9, 20, 1, '기본 12px')}
      ${row('상단 메인 탭 글자(태블릿)', 'su_top_tab_font_tb_px', topTabTbFont, 9, 18, 1, '기본 11px')}
      ${row('상단 메인 탭 글자(모바일)', 'su_top_tab_font_mb_px', topTabMbFont, 8, 16, 1, '기본 10px')}
      ${row('하위 메뉴/하위탭 글자', 'su_subtab_font_px', subTabFont, 9, 18, 1, '기본 12px')}
      ${row('모바일 드롭메뉴(select)', 'su_select_mb_scale', selMb, 0.70, 1.15, 0.02, '폰트/화살표/패딩 같이 조절')}
      ${row('태블릿 드롭메뉴(select)', 'su_select_tb_scale', selTb, 0.70, 1.15, 0.02, '폰트/화살표/패딩 같이 조절')}
      ${row('경기 상세 상단 버튼(모바일)', 'su_md_mb_btn_scale', mdMb, 0.70, 1.30, 0.05, '')}
      ${row('경기 상세 상단 버튼(태블릿)', 'su_md_tb_btn_scale', mdTb, 0.70, 1.30, 0.05, '')}
      ${row('스트리머 상세 최근경기 배지(모바일)', 'su_pd_badge_scale_mb', badgeMb, 0.55, 1.20, 0.05, '종류/결과 배지 함께 조절')}
      ${row('스트리머 상세 최근경기 배지(태블릿)', 'su_pd_badge_scale_tb', badgeTb, 0.60, 1.25, 0.05, '종류/결과 배지 함께 조절')}
      ${row('대학상세 최근대전 칩(모바일)', 'su_univ_recent_chip_scale_mb', univMb, 0.60, 1.20, 0.05, '종류/상대 버튼 함께 조절')}
      ${row('대학상세 최근대전 칩(태블릿)', 'su_univ_recent_chip_scale_tb', univTb, 0.65, 1.25, 0.05, '종류/상대 버튼 함께 조절')}
      ${row('종목/연도 필터 칩', 'su_pd_chip_scale', chip, 0.70, 1.30, 0.05, '')}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
        <button class="btn btn-w btn-sm" onclick="['su_mb_scale','su_tb_scale','su_modal_mb_scale','su_modal_tb_scale','su_tab_mb_scale','su_tab_tb_scale','su_top_tab_font_pc_px','su_top_tab_font_tb_px','su_top_tab_font_mb_px','su_subtab_font_px','su_select_mb_scale','su_select_tb_scale','su_md_mb_btn_scale','su_md_tb_btn_scale','su_pd_badge_scale','su_pd_badge_scale_mb','su_pd_badge_scale_tb','su_univ_recent_chip_scale_mb','su_univ_recent_chip_scale_tb','su_pd_chip_scale'].forEach(k=>localStorage.removeItem(k)); try{ window.applyResponsiveUiVars && window.applyResponsiveUiVars(); }catch(e){}; try{ render(); }catch(e){}; try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}; try{ window._renderCfgUiSizeSection && window._renderCfgUiSizeSection(); }catch(e){}; try{ if(typeof window.cfgTouchPrefsSync==="function") window.cfgTouchPrefsSync(); }catch(e){}">↩️ 기본값으로</button>
        <div style="font-size:var(--fs-caption);color:var(--gray-l);align-self:center">※ PC에는 영향 거의 없고, 모바일/태블릿만 주로 변화합니다</div>
      </div>
    </div>
  `;
}

try{
  window.SettingsModules = window.SettingsModules || {};
  window.SettingsModules.profileUi = {
    buildPdModeBadgeColorRows: _cfgBuildPdModeBadgeColorRows,
    renderPdModeBadgeSection: _renderCfgPdModeBadgeSection,
    renderProfileShapeSection: _renderCfgProfileShapeSection,
    renderUiSizeSection: _renderCfgUiSizeSection
  };
  window._cfgBuildPdModeBadgeColorRows = _cfgBuildPdModeBadgeColorRows;
  window._renderCfgPdModeBadgeSection = _renderCfgPdModeBadgeSection;
  window._renderCfgProfileShapeSection = _renderCfgProfileShapeSection;
  window._renderCfgUiSizeSection = _renderCfgUiSizeSection;
  window._setProfileScale = _setProfileScale;
  window._resetProfileShapeAll = _resetProfileShapeAll;
}catch(e){}
