// ─────────────────────────────────────────────────────────────
// 설정 탭: 전역 폰트/전역 폰트 크기 관련 로직
// - settings.js에서 분리
// ─────────────────────────────────────────────────────────────

// cfgSetAppFontSettings 정의는 js/init-theme-apply.js로 이전됨
// (index.html 로드 순서상 이 파일보다 나중에 로드되어 실제로는 그쪽 정의가 항상 적용되므로,
//  두 곳에 중복 정의해 혼동을 만들지 않도록 여기서는 제거함. _applyAppFont와 함께 관리)

// ─────────────────────────────────────────────────────────────
// (요청사항) 전역 폰트 크기 — 기기별 분리
// - localStorage:
//   su_app_font_scale_pc_pct / su_app_font_scale_tb_pct / su_app_font_scale_mb_pct
//   (구버전 호환: su_app_font_scale_pct)
// ─────────────────────────────────────────────────────────────
// cfgSetAppFontScalePct / cfgResetAppFontScalePct 정의는 js/settings-data-uiprefs.js로 이전됨
// (index.html 로드 순서상 이 파일보다 나중에 로드되어 실제로는 그쪽 정의가 항상 적용되므로,
//  두 곳에 중복 정의해 혼동을 만들지 않도록 여기서는 제거함)

// 설정 화면 렌더 후 자동으로 커스텀 폰트 프리셋 목록/별칭 편집기 갱신
// [FIX] 이 스크립트는 render-core.js보다 먼저 로드되기 때문에, 로드 시점에
// window.render (혹은 window.renderNow)를 바로 감싸려고 하면 아직 함수가 존재하지
// 않아 patch가 조용히 무시되고("커스텀 폰트 별칭" UI가 영영 채워지지 않는 버그의 원인).
// → DOMContentLoaded(모든 defer 스크립트 로드 완료 후) 시점까지 기다렸다가 patch한다.
// → 또한 window.render()는 requestAnimationFrame으로 배치되는 비동기 스케줄러라
//   patch 직후 DOM이 아직 갱신되지 않은 상태일 수 있다. 실제 DOM을 동기적으로
//   그리는 window.renderNow(render-core.js의 _renderImpl)를 감싸야 타이밍이 맞다.
(function(){
  function _installFontPanelAutoRefresh(){
    try{
      if(window.__patchedRenderForFontPreset) return;
      const _prevRenderNow = window.renderNow;
      if(typeof _prevRenderNow !== 'function') return; // 아직 준비 안 됐으면 다음 시도에서
      window.__patchedRenderForFontPreset = true;
      window.renderNow = function(){
        const r = _prevRenderNow.apply(this, arguments);
        try{ if(typeof window.cfgRenderCustomFontPresetOptions==='function') window.cfgRenderCustomFontPresetOptions(); }catch(e){}
        try{ if(typeof window.cfgRenderAppFontAliasEditor==='function') window.cfgRenderAppFontAliasEditor(); }catch(e){}
      };
    }catch(e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', _installFontPanelAutoRefresh);
  }else{
    _installFontPanelAutoRefresh();
  }
  // 안전망: 혹시라도 renderNow가 DOMContentLoaded 시점에도 아직 없다면(스크립트 로딩 지연 등)
  // 짧게 재시도한다.
  let _tries = 0;
  const _retry = setInterval(()=>{
    _tries++;
    if(window.__patchedRenderForFontPreset || _tries>50){ clearInterval(_retry); return; }
    _installFontPanelAutoRefresh();
  }, 100);
})();

// ─────────────────────────────────────────────────────────────
// (요청사항) CSS 직접입력(@font-face)에서 font-family 자동 추출 → 프리셋 드롭다운
// ─────────────────────────────────────────────────────────────
window.cfgGetCustomFontFamilies = function(){
  let cssTxt = '';
  try{ cssTxt = (document.getElementById('cfg-appfont-csstext')?.value || localStorage.getItem('su_app_font_css_text') || ''); }catch(e){}
  cssTxt = String(cssTxt||'');
  const out = [];
  const seen = new Set();
  const re = /font-family\s*:\s*['"]?([^;'"\n\r]+)['"]?\s*;/gi;
  let m;
  while((m = re.exec(cssTxt))){
    const name = String(m[1]||'').trim();
    if(!name) continue;
    const key = name.toLowerCase();
    if(seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
};

// ─────────────────────────────────────────────────────────────
// (요청사항) 커스텀 폰트 "별칭(표시 이름)" 저장/편집
// - localStorage: su_app_font_alias_map  (JSON: { "FontFamily": "표시이름" })
// ─────────────────────────────────────────────────────────────
window.cfgGetAppFontAliasMap = function(){
  try{ return JSON.parse(localStorage.getItem('su_app_font_alias_map')||'{}')||{}; }catch(e){ return {}; }
};
window.cfgSetAppFontAlias = function(fontFamily, alias){
  const k = String(fontFamily||'').trim();
  if(!k) return;
  const v = String(alias||'').trim();
  const map = window.cfgGetAppFontAliasMap ? window.cfgGetAppFontAliasMap() : {};
  if(v) map[k] = v;
  else delete map[k];
  try{ localStorage.setItem('su_app_font_alias_map', JSON.stringify(map)); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
};
window.cfgRenderAppFontAliasEditor = function(){
  const wrap = document.getElementById('cfg-appfont-alias-wrap');
  if(!wrap) return;
  const fams = window.cfgGetCustomFontFamilies ? window.cfgGetCustomFontFamilies() : [];
  const map = window.cfgGetAppFontAliasMap ? window.cfgGetAppFontAliasMap() : {};
  if(!fams.length){
    wrap.innerHTML = `<div style="font-size:11px;color:var(--gray-l)">커스텀 폰트가 없습니다. (CSS 직접 입력에 @font-face를 추가하면 여기에 표시됩니다)</div>`;
    return;
  }
  wrap.innerHTML = fams.map(f=>{
    const a = map[f] || '';
    const fjs = JSON.stringify(String(f||''));
    return `
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
        <div style="font-size:12px;font-weight:900;color:var(--text2);min-width:140px">${esc(f)}</div>
        <input type="text" value="${esc(a)}" placeholder="예) 본문용 / 타이틀용" style="flex:1;min-width:180px"
          oninput="cfgSetAppFontAlias(${fjs}, this.value)">
      </div>
    `;
  }).join('');
};
// cfgRenderCustomFontPresetOptions / cfgApplyCustomFontPreset / cfgApplyFontFamilyChoice 정의는
// js/settings-data-uiprefs.js로 이전됨 (index.html 로드 순서상 이 파일보다 나중에 로드되어
// 실제로는 그쪽 정의가 항상 적용되므로, 두 곳에 중복 정의해 혼동을 만들지 않도록 여기서는 제거함)
