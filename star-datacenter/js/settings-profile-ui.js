/* ══════════════════════════════════════
   설정 분리: 스트리머 상세 배지/프로필/UI 크기
══════════════════════════════════════ */
function _cfgBuildPdModeBadgeColorRows(){
  const defaults = {
    '조별리그':'#2563eb','토너먼트':'#16a34a','미니대전':'#7c3aed','시빌워':'#db2777',
    '대학대전':'#7c3aed','대학CK':'#dc2626','프로리그':'#0891b2','티어대회':'#f59e0b',
    '대회':'#d97706','프로리그대회':'#7c3aed','끝장전':'#8b5cf6','개인전':'#8b5cf6','테스트':'#6b7280'
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

function _renderCfgProfileShapeSection(){
  if(typeof window.SettingsModules!=='undefined' && window.SettingsModules.profile && typeof window.SettingsModules.profile.renderProfileShapeSection==='function'){
    return window.SettingsModules.profile.renderProfileShapeSection();
  }
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
}catch(e){}
