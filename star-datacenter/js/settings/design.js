(function(){
  window.SettingsModules = window.SettingsModules || {};

  function escMaybe(v){
    if(typeof window.esc === 'function') return window.esc(v);
    return String(v ?? '').replace(/[&<>"']/g, m => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[m]));
  }

  function init(){
    window.applyDesignV2 = function(forceOn){
      try{
        const on = (typeof forceOn==='boolean') ? forceOn : (localStorage.getItem('su_design_v2')==='1');
        document.body.classList.toggle('design-v2', !!on);
        try{
          const pct = parseInt(localStorage.getItem('su_design_v2_bright')||'0',10) || 0;
          const v = Math.max(0, Math.min(100, pct)) + '%';
          if(on) document.body.style.setProperty('--dm-bright', v);
          else document.body.style.setProperty('--dm-bright', '0%');
        }catch(e){}
        try{
          const pct = parseInt(localStorage.getItem('su_design_v2_dark')||'0',10) || 0;
          const v = Math.max(0, Math.min(40, pct)) + '%';
          if(on) document.body.style.setProperty('--dm-dark', v);
          else document.body.style.setProperty('--dm-dark', '0%');
        }catch(e){}
        const preset = String(localStorage.getItem('su_design_v2_preset')||'base');
        const allow = new Set(['base','nada','nadalight','spring','summer','autumn','winter','xmas','summerbreak','winterbreak','valentine','whiteday','buddha','liberation','hangul','samil']);
        const p = allow.has(preset) ? preset : 'base';
        try{
          if(preset !== p) localStorage.setItem('su_design_v2_preset', p);
        }catch(e){}
        document.body.classList.remove(
          'designv2-base','designv2-nada','designv2-nadalight','designv2-spring','designv2-summer','designv2-autumn','designv2-winter',
          'designv2-xmas','designv2-summerbreak','designv2-winterbreak','designv2-valentine','designv2-whiteday',
          'designv2-buddha','designv2-liberation','designv2-hangul','designv2-samil'
        );
        if(!!on) document.body.classList.add('designv2-'+p);

        try{
          const colors = JSON.parse(localStorage.getItem('su_design_v2_colors') || '{}');
          const presetColors = colors[p] || {};
          Object.keys(presetColors).forEach(varName => {
            document.body.style.setProperty('--' + varName, presetColors[varName]);
          });
        }catch(e){}

        try{
          const effects = JSON.parse(localStorage.getItem('su_design_v2_effects') || '{}');
          const presetEffects = effects[p] || {};
          if(presetEffects.shadowIntensity !== undefined){
            document.body.style.setProperty('--custom-shadow-intensity', presetEffects.shadowIntensity);
          }
          if(presetEffects.cardOpacity !== undefined){
            document.body.style.setProperty('--custom-card-opacity', presetEffects.cardOpacity);
          }
          if(presetEffects.gradientAngle !== undefined){
            document.body.style.setProperty('--custom-gradient-angle', presetEffects.gradientAngle);
          }
        }catch(e){}

        try{
          const forced = document.body.dataset.designForceDark === '1';
          if(on && p === 'nada'){
            if(!forced){
              document.body.dataset.designPrevDark = document.body.classList.contains('dark') ? '1' : '0';
              document.body.dataset.designForceDark = '1';
            }
            document.body.classList.add('dark');
          }else{
            if(forced){
              const keep = (localStorage.getItem('su_dark')==='1') || (document.body.dataset.designPrevDark==='1');
              delete document.body.dataset.designForceDark;
              delete document.body.dataset.designPrevDark;
              if(!keep) document.body.classList.remove('dark');
            }
          }
        }catch(e){}

        try{
          const _supportsMix = (window.CSS && typeof CSS.supports==='function')
            ? CSS.supports('color', 'color-mix(in srgb, #000, #fff)')
            : false;
          const brightPct = Math.max(0, Math.min(100, parseInt(localStorage.getItem('su_design_v2_bright')||'0',10)||0));
          const darkPct   = Math.max(0, Math.min(40,  parseInt(localStorage.getItem('su_design_v2_dark')||'0',10)||0));
          const parseRGB = (c)=>{
            c = String(c||'').trim();
            if(!c) return null;
            const hex = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
            if(hex){
              let h = hex[1];
              if(h.length===3) h = h.split('').map(x=>x+x).join('');
              const n = parseInt(h,16);
              return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
            }
            const rgb = c.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i);
            if(rgb) return { r:Math.round(+rgb[1]), g:Math.round(+rgb[2]), b:Math.round(+rgb[3]) };
            return null;
          };
          const mixTo = (base, to, t)=>{
            t = Math.max(0, Math.min(1, t));
            return {
              r: Math.round(base.r + (to.r - base.r)*t),
              g: Math.round(base.g + (to.g - base.g)*t),
              b: Math.round(base.b + (to.b - base.b)*t),
            };
          };
          const rgbToCss = (v)=>`rgb(${v.r} ${v.g} ${v.b})`;
          const cs = getComputedStyle(document.body);
          const bg0 = parseRGB(cs.getPropertyValue('--bg0'));
          const w0  = parseRGB(cs.getPropertyValue('--white0'));
          const s0  = parseRGB(cs.getPropertyValue('--surface0'));
          if(on && bg0 && w0 && s0){
            const darkT = darkPct/100;
            const lightT = brightPct/100;
            const black = {r:0,g:0,b:0};
            const white = {r:255,g:255,b:255};
            const bg1 = mixTo(bg0, black, darkT);
            const w1  = mixTo(w0,  black, darkT);
            const s1  = mixTo(s0,  black, darkT);
            const bg2 = mixTo(bg1, white, lightT);
            const w2  = mixTo(w1,  white, lightT);
            const s2  = mixTo(s1,  white, lightT);
            document.body.style.setProperty('--bg', rgbToCss(bg2));
            document.body.style.setProperty('--white', rgbToCss(w2));
            document.body.style.setProperty('--surface', rgbToCss(s2));
            const pStart = parseRGB(cs.getPropertyValue('--primary-start')) || parseRGB(cs.getPropertyValue('--primary-mid'));
            if(pStart){
              const k2 = Math.max(0, 1 - (brightPct/100));
              const rcCard = mixTo(s2, pStart, 0.12 * k2);
              const rcHd   = mixTo(w2, pStart, 0.10 * k2);
              [document.body, document.documentElement].forEach(t=>{
                if(!t) return;
                t.style.setProperty('--rc-card-bg', rgbToCss(rcCard));
                t.style.setProperty('--rc-card-hd-bg', rgbToCss(rcHd));
                t.style.setProperty('--rc-detail-bg', rgbToCss(w2));
              });
            }else{
              [document.body, document.documentElement].forEach(t=>{
                if(!t) return;
                t.style.setProperty('--rc-card-bg', rgbToCss(s2));
                t.style.setProperty('--rc-card-hd-bg', rgbToCss(w2));
                t.style.setProperty('--rc-detail-bg', rgbToCss(w2));
              });
            }
            [document.body, document.documentElement].forEach(t=>{
              if(!t) return;
              t.style.setProperty('--glass-bg', rgbToCss(w2));
            });
            try{
              const rs = getComputedStyle(document.documentElement);
              const baseBgA = parseFloat(rs.getPropertyValue('--rc-bg-a')||'0.12') || 0.12;
              const baseHdA = parseFloat(rs.getPropertyValue('--rc-hd-a')||'0.14') || 0.14;
              const k = Math.max(0, 1 - (brightPct/100));
              const effBgA = Math.max(0.02, baseBgA * k);
              const effHdA = Math.max(0.03, baseHdA * k);
              [document.body, document.documentElement].forEach(t=>{
                if(!t) return;
                t.style.setProperty('--rc-bg-a', String(effBgA));
                t.style.setProperty('--rc-hd-a', String(effHdA));
              });
            }catch(e){}
          }else{
            document.body.style.removeProperty('--bg');
            document.body.style.removeProperty('--white');
            document.body.style.removeProperty('--surface');
            [document.body, document.documentElement].forEach(t=>{
              if(!t) return;
              t.style.removeProperty('--rc-card-bg');
              t.style.removeProperty('--rc-card-hd-bg');
              t.style.removeProperty('--rc-detail-bg');
              t.style.removeProperty('--glass-bg');
              t.style.removeProperty('--rc-bg-a');
              t.style.removeProperty('--rc-hd-a');
            });
          }
          void _supportsMix;
        }catch(e){}
      }catch(e){}
    };

    // 디자인/탭/효과 설정 변경 후 원격 동기화 트리거 헬퍼
    function _touchPrefs(){
      try{ if(typeof window.cfgTouchPrefsSync==='function') window.cfgTouchPrefsSync(); }catch(e){}
    }

    window.cfgSetDesignV2 = function(on){
      try{ localStorage.setItem('su_design_v2', on?'1':'0'); }catch(e){}
      try{ window.applyDesignV2 && window.applyDesignV2(!!on); }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetDesignV2Preset = function(v){
      try{ localStorage.setItem('su_design_v2_preset', String(v||'base')); }catch(e){}
      try{
        const pv = String(v||'base');
        if(pv && pv !== 'base' && localStorage.getItem('su_design_v2')!=='1'){
          localStorage.setItem('su_design_v2','1');
          const cb=document.getElementById('cfg-designv2-on');
          if(cb) cb.checked = true;
        }
      }catch(e){}
      try{ window.applyDesignV2 && window.applyDesignV2(); }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetDesignV2Bright = function(v){
      try{
        const n = Math.max(0, Math.min(100, parseInt(v||'0',10)||0));
        localStorage.setItem('su_design_v2_bright', String(n));
      }catch(e){}
      try{ window.applyDesignV2 && window.applyDesignV2(); }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetDesignV2Dark = function(v){
      try{
        const n = Math.max(0, Math.min(40, parseInt(v||'0',10)||0));
        localStorage.setItem('su_design_v2_dark', String(n));
      }catch(e){}
      try{ window.applyDesignV2 && window.applyDesignV2(); }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgApplyDesignV2TonePreset = function(key){
      const k = String(key||'base');
      const map = { base:{b:0,d:0}, light:{b:40,d:0}, verylight:{b:80,d:0}, maxlight:{b:100,d:0}, dark:{b:0,d:20} };
      const v = map[k] || map.base;
      try{ localStorage.setItem('su_design_v2_bright', String(v.b)); }catch(e){}
      try{ localStorage.setItem('su_design_v2_dark', String(v.d)); }catch(e){}
      try{
        const r1=document.querySelector('#cfg-designv2-bright'); if(r1) r1.value=String(v.b);
        const r2=document.querySelector('#cfg-designv2-dark'); if(r2) r2.value=String(v.d);
        const s1=document.getElementById('cfg-designv2-bright-v'); if(s1) s1.textContent=v.b+'%';
        const s2=document.getElementById('cfg-designv2-dark-v'); if(s2) s2.textContent=v.d+'%';
      }catch(e){}
      try{ window.applyDesignV2 && window.applyDesignV2(); }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetDesignV2Color = function(varName, value){
      try{
        const preset = localStorage.getItem('su_design_v2_preset') || 'base';
        const colors = JSON.parse(localStorage.getItem('su_design_v2_colors') || '{}');
        if(!colors[preset]) colors[preset] = {};
        colors[preset][varName] = value;
        localStorage.setItem('su_design_v2_colors', JSON.stringify(colors));
      }catch(e){}
      try{ window.applyDesignV2 && window.applyDesignV2(); }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgResetDesignV2Colors = function(){
      try{
        const preset = localStorage.getItem('su_design_v2_preset') || 'base';
        const colors = JSON.parse(localStorage.getItem('su_design_v2_colors') || '{}');
        delete colors[preset];
        localStorage.setItem('su_design_v2_colors', JSON.stringify(colors));
      }catch(e){}
      try{ window.applyDesignV2 && window.applyDesignV2(); }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetDesignV2Effect = function(effectName, value){
      try{
        const preset = localStorage.getItem('su_design_v2_preset') || 'base';
        const effects = JSON.parse(localStorage.getItem('su_design_v2_effects') || '{}');
        if(!effects[preset]) effects[preset] = {};
        effects[preset][effectName] = value;
        localStorage.setItem('su_design_v2_effects', JSON.stringify(effects));
      }catch(e){}
      try{ window.applyDesignV2 && window.applyDesignV2(); }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };

    window.cfgSetTabColorEnabled = function(on){
      try{ localStorage.setItem('su_tab_color_enabled', on ? '1' : '0'); }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetTabColorMode = function(mode){
      var v = String(mode||'fill');
      if(['fill','soft','outline','solid'].indexOf(v) === -1) v = 'fill';
      try{ localStorage.setItem('su_tab_color_mode', v); }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetTabColorLength = function(v){
      try{
        var n = Math.max(20, Math.min(90, parseInt(v||'48', 10) || 48));
        localStorage.setItem('su_tab_color_length', String(n));
      }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetTabColorTail = function(v){
      try{
        var n = Math.max(0, Math.min(60, parseInt(v||'22', 10) || 22));
        localStorage.setItem('su_tab_color_tail', String(n));
      }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetRecSideFxEnabled = function(on){
      try{ localStorage.setItem('su_rec_side_fx_on', on ? '1' : '0'); }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetRecSideFxMode = function(mode){
      var v = String(mode||'soft');
      if(['soft','glow','panel','line','ribbon','frame','spotlight'].indexOf(v) === -1) v = 'soft';
      try{ localStorage.setItem('su_rec_side_fx_mode', v); }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetRecSideFxIntensity = function(v){
      try{
        var n = Math.max(0, Math.min(140, parseInt(v||'68', 10) || 68));
        localStorage.setItem('su_rec_side_fx_intensity', String(n));
      }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetRecSideFxLength = function(v){
      try{
        var n = Math.max(4, Math.min(80, parseInt(v||'25', 10) || 25));
        localStorage.setItem('su_rec_side_fx_length', String(n));
        window.applyRecSideFxLengthVar && window.applyRecSideFxLengthVar(n);
      }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetRecSideFxTail = function(v){
      try{
        var n = Math.max(0, Math.min(140, parseInt(v||'28', 10) || 28));
        localStorage.setItem('su_rec_side_fx_tail', String(n));
      }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetRecSideFxSoftness = function(v){
      try{
        var n = Math.max(0, Math.min(100, parseInt(v||'52', 10) || 52));
        localStorage.setItem('su_rec_side_fx_softness', String(n));
      }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.cfgSetRecSideFxEdge = function(v){
      try{
        var n = Math.max(2, Math.min(24, parseInt(v||'8', 10) || 8));
        localStorage.setItem('su_rec_side_fx_edge', String(n));
      }catch(e){}
      try{ render(); }catch(e){}
      _touchPrefs();
    };
    window.applyRecSideFxLengthVar = function(n){
      try{
        var len = Math.max(4, Math.min(80, parseInt(n||'25',10)||25));
        var softness = Math.max(0, Math.min(100, parseInt(localStorage.getItem('su_rec_side_fx_softness')||'52',10)||52));
        var len2 = Math.max(2, Math.min(96, Math.round(len * (0.24 + (softness/100) * 0.42))));
        var len3 = Math.max(len2 + 1, Math.min(98, Math.round(len * (0.55 + (softness/100) * 0.25))));
        var lenR = 100 - len;
        var len2R = 100 - len2;
        var len3R = 100 - len3;
        document.documentElement.style.setProperty('--rec-fx-len', len + '%');
        document.documentElement.style.setProperty('--rec-fx-len2', len2 + '%');
        document.documentElement.style.setProperty('--rec-fx-len3', len3 + '%');
        document.documentElement.style.setProperty('--rec-fx-len-r', lenR + '%');
        document.documentElement.style.setProperty('--rec-fx-len2-r', len2R + '%');
        document.documentElement.style.setProperty('--rec-fx-len3-r', len3R + '%');
      }catch(e){}
    };
  }

  function renderDesignV2Section(_scfgD){
    const on = (localStorage.getItem('su_design_v2') ?? '0') === '1';
    const preset = (localStorage.getItem('su_design_v2_preset') ?? 'base');
    const bright = parseInt(localStorage.getItem('su_design_v2_bright') ?? '0',10) || 0;
    const dark = parseInt(localStorage.getItem('su_design_v2_dark') ?? '0',10) || 0;
    return _scfgD('designv2','🎨 디자인 모드 (리뉴얼)') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">기존 디자인은 유지하고, 켜면 새로운 디자인(탭/카드/모달/현황판 등)을 적용합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;font-weight:900;color:var(--text2)">
        <input type="checkbox" id="cfg-designv2-on" style="width:15px;height:15px" ${on?'checked':''}
          onchange="cfgSetDesignV2(this.checked)">
        디자인 모드 사용
      </label>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:90px">테마 프리셋</div>
        <select id="cfg-designv2-preset" onchange="cfgSetDesignV2Preset(this.value)" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="base" ${preset==='base'?'selected':''}>기본</option>
          <option value="nada" ${preset==='nada'?'selected':''}>🌑 나다 다크</option>
          <option value="nadalight" ${preset==='nadalight'?'selected':''}>🌤️ 나다 라이트</option>
          <option value="spring" ${preset==='spring'?'selected':''}>🌸 봄</option>
          <option value="summer" ${preset==='summer'?'selected':''}>🏖️ 여름</option>
          <option value="autumn" ${preset==='autumn'?'selected':''}>🍁 가을</option>
          <option value="winter" ${preset==='winter'?'selected':''}>❄️ 겨울</option>
          <option value="xmas" ${preset==='xmas'?'selected':''}>🎄 크리스마스</option>
          <option value="summerbreak" ${preset==='summerbreak'?'selected':''}>🏝️ 여름방학</option>
          <option value="winterbreak" ${preset==='winterbreak'?'selected':''}>⛄ 겨울방학</option>
          <option value="valentine" ${preset==='valentine'?'selected':''}>💘 발렌타인데이</option>
          <option value="whiteday" ${preset==='whiteday'?'selected':''}>🤍 화이트데이</option>
          <option value="buddha" ${preset==='buddha'?'selected':''}>🪷 석가탄신일</option>
          <option value="liberation" ${preset==='liberation'?'selected':''}>🇰🇷 광복절</option>
          <option value="hangul" ${preset==='hangul'?'selected':''}>🔤 한글날</option>
          <option value="samil" ${preset==='samil'?'selected':''}>✊ 3.1절</option>
        </select>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:90px">밝기(연하게)</div>
        <input type="range" id="cfg-designv2-bright" min="0" max="100" step="1" value="${Math.max(0,Math.min(100,bright))}"
          oninput="document.getElementById('cfg-designv2-bright-v').textContent=this.value+'%'; cfgSetDesignV2Bright(this.value)"
          style="flex:1;min-width:180px">
        <div style="font-size:11px;color:var(--gray-l);font-weight:900;width:48px;text-align:right"><span id="cfg-designv2-bright-v">${Math.max(0,Math.min(100,bright))}%</span></div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:90px">명암(진하게)</div>
        <input type="range" id="cfg-designv2-dark" min="0" max="40" step="1" value="${Math.max(0,Math.min(40,dark))}"
          oninput="document.getElementById('cfg-designv2-dark-v').textContent=this.value+'%'; cfgSetDesignV2Dark(this.value)"
          style="flex:1;min-width:180px">
        <div style="font-size:11px;color:var(--gray-l);font-weight:900;width:48px;text-align:right"><span id="cfg-designv2-dark-v">${Math.max(0,Math.min(40,dark))}%</span></div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:90px">프리셋</div>
        <button class="btn btn-w btn-xs" onclick="cfgApplyDesignV2TonePreset('base')">기본</button>
        <button class="btn btn-w btn-xs" onclick="cfgApplyDesignV2TonePreset('light')">연하게</button>
        <button class="btn btn-w btn-xs" onclick="cfgApplyDesignV2TonePreset('verylight')">매우 연하게</button>
        <button class="btn btn-w btn-xs" onclick="cfgApplyDesignV2TonePreset('maxlight')">최대(100%)</button>
        <button class="btn btn-w btn-xs" onclick="cfgApplyDesignV2TonePreset('dark')">진하게</button>
      </div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6">
        • 적용 범위: 헤더/탭/기록카드/모달/하단내비/현황판 등<br>
        • 관리자 저장(GitHub 동기화 + 보조 신호) 시 다른 기기에도 동일하게 적용됩니다.
      </div>
    </div>
  </details>`;
  }

  function renderDesignV2ColorsSection(_scfgD){
    const preset = (localStorage.getItem('su_design_v2_preset') ?? 'base');
    const colors = JSON.parse(localStorage.getItem('su_design_v2_colors') || '{}');
    const presetColors = colors[preset] || {};
    const effects = JSON.parse(localStorage.getItem('su_design_v2_effects') || '{}');
    const presetEffects = effects[preset] || {};
    const colorVars = [
      {key: 'primary-start', label: '메인 색상 (시작)', default: '#4F46E5'},
      {key: 'primary-mid', label: '메인 색상 (중간)', default: '#7C3AED'},
      {key: 'primary-end', label: '메인 색상 (끝)', default: '#2563EB'},
      {key: 'accent-warm', label: '강조 색상 (따뜻함)', default: '#F59E0B'},
      {key: 'accent-cool', label: '강조 색상 (차가움)', default: '#06B6D4'},
      {key: 'accent-success', label: '성공 색상', default: '#10B981'},
      {key: 'accent-danger', label: '위험 색상', default: '#EF4444'},
    ];
    return _scfgD('designv2-colors','🎨 디자인 모드 색상 커스터마이징') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">현재 프리셋: <strong>${escMaybe(preset)}</strong> - 프리셋별로 색상을 개별 저장합니다.</div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
        ${colorVars.map(v => `
          <div style="display:flex;flex-direction:column;gap:4px">
            <label style="font-size:11px;font-weight:900;color:var(--text3)">${escMaybe(v.label)}</label>
            <div style="display:flex;gap:6px;align-items:center">
              <input type="color" 
                value="${presetColors[v.key] || v.default}"
                onchange="cfgSetDesignV2Color('${v.key}', this.value)"
                style="width:40px;height:32px;border:1px solid var(--border2);border-radius:6px;cursor:pointer;padding:0;background:none">
              <input type="text" 
                value="${presetColors[v.key] || v.default}"
                onchange="cfgSetDesignV2Color('${v.key}', this.value)"
                placeholder="${v.default}"
                style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:11px;font-family:monospace;text-transform:uppercase">
            </div>
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-w btn-xs" onclick="cfgResetDesignV2Colors()">🔄 기본 색상으로 초기화</button>
        <span style="font-size:11px;color:var(--gray-l)">현재 프리셋의 색상만 초기화됩니다.</span>
      </div>
    </div>
    
    <div style="margin-top:12px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
      <div style="font-size:12px;font-weight:900;color:var(--text2)">✨ 다양한 효과</div>
      
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:100px">그림자 강도</div>
        <input type="range" min="0" max="100" step="5" value="${presetEffects.shadowIntensity || 50}"
          oninput="document.getElementById('cfg-shadow-v').textContent=this.value+'%'; cfgSetDesignV2Effect('shadowIntensity', this.value)"
          style="flex:1;min-width:150px">
        <div style="font-size:11px;color:var(--gray-l);font-weight:900;width:48px;text-align:right"><span id="cfg-shadow-v">${presetEffects.shadowIntensity || 50}%</span></div>
      </div>
      
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:100px">카드 투명도</div>
        <input type="range" min="70" max="100" step="1" value="${presetEffects.cardOpacity || 100}"
          oninput="document.getElementById('cfg-opacity-v').textContent=this.value+'%'; cfgSetDesignV2Effect('cardOpacity', this.value)"
          style="flex:1;min-width:150px">
        <div style="font-size:11px;color:var(--gray-l);font-weight:900;width:48px;text-align:right"><span id="cfg-opacity-v">${presetEffects.cardOpacity || 100}%</span></div>
      </div>
      
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:100px">그라데이션 각도</div>
        <input type="range" min="0" max="360" step="5" value="${presetEffects.gradientAngle || 135}"
          oninput="document.getElementById('cfg-gradient-v').textContent=this.value+'°'; cfgSetDesignV2Effect('gradientAngle', this.value)"
          style="flex:1;min-width:150px">
        <div style="font-size:11px;color:var(--gray-l);font-weight:900;width:48px;text-align:right"><span id="cfg-gradient-v">${presetEffects.gradientAngle || 135}°</span></div>
      </div>
      
      <div style="font-size:11px;color:var(--gray-l);line-height:1.6">
        • 그림자 강도: 카드/버튼의 그림자 진하기 조절<br>
        • 카드 투명도: 기록카드 등의 배경 투명도 조절<br>
        • 그라데이션 각도: 헤더/버튼의 그라데이션 방향 조절
      </div>
    </div>
  </details>`;
  }

  window.renderCfgDesignV2Section = renderDesignV2Section;
  window.renderCfgDesignV2ColorsSection = renderDesignV2ColorsSection;
  window.SettingsModules.design = { init, renderDesignV2Section, renderDesignV2ColorsSection };

  /* ── 탭 버튼 색상 커스텀 섹션 ── */
  function renderTabColorSection(_scfgD){
    var defs = (typeof window._TAB_COLOR_DEFAULTS==='object') ? window._TAB_COLOR_DEFAULTS : {};
    var colorKey = (typeof window._TAB_COLOR_KEY==='string') ? window._TAB_COLOR_KEY : 'su_tab_colors_v1';
    var saved = {};
    try{ saved = JSON.parse(localStorage.getItem(colorKey)||'{}'); }catch(e){}
    var tabColorOn = (localStorage.getItem('su_tab_color_enabled') || '1') !== '0';
    var tabColorMode = String(localStorage.getItem('su_tab_color_mode') || 'fill');
    if(['fill','soft','outline','solid'].indexOf(tabColorMode) === -1) tabColorMode = 'fill';
    var tabColorLength = Math.max(20, Math.min(90, parseInt(localStorage.getItem('su_tab_color_length') || '48', 10) || 48));
    var tabColorTail = Math.max(0, Math.min(60, parseInt(localStorage.getItem('su_tab_color_tail') || '22', 10) || 22));
    var recSideFxOn = (localStorage.getItem('su_rec_side_fx_on') || '1') !== '0';
    var recSideFxMode = String(localStorage.getItem('su_rec_side_fx_mode') || 'soft');
    if(['soft','glow','panel','line','ribbon','frame','spotlight','fade','double'].indexOf(recSideFxMode) === -1) recSideFxMode = 'soft';
    var recSideFxIntensity = Math.max(0, Math.min(140, parseInt(localStorage.getItem('su_rec_side_fx_intensity') || '68', 10) || 68));
    var recSideFxLength = Math.max(4, Math.min(80, parseInt(localStorage.getItem('su_rec_side_fx_length') || '25', 10) || 25));
    var recSideFxTail = Math.max(0, Math.min(140, parseInt(localStorage.getItem('su_rec_side_fx_tail') || '28', 10) || 28));
    var recSideFxSoftness = Math.max(0, Math.min(100, parseInt(localStorage.getItem('su_rec_side_fx_softness') || '52', 10) || 52));
    var recSideFxEdge = Math.max(2, Math.min(24, parseInt(localStorage.getItem('su_rec_side_fx_edge') || '8', 10) || 8));
    var _previewCfg = { mode:recSideFxMode, intensity:recSideFxIntensity, length:recSideFxLength, tail:recSideFxTail, softness:recSideFxSoftness, edge:recSideFxEdge };
    var _previewVars = (typeof _recSideFxVarStyle==='function')
      ? _recSideFxVarStyle('#2563eb', '#7c3aed', _previewCfg)
      : '';

    var groups = [
      { ctx:'mergedUniv', title:'🏟️ 대학대전 탭' },
      { ctx:'mergedInd',  title:'🎮 개인전/끝장전 탭' },
      { ctx:'mergedComp', title:'🏆 대회 탭' },
      { ctx:'mergedPro',  title:'🏅 프로리그 탭' }
    ];

    function makeRow(ctx, id, defEntry) {
      var cur = (saved[ctx]||{})[id] || {};
      var fromVal = cur.from || defEntry.from || '#0f172a';
      var toVal   = cur.to   || defEntry.to   || '#1d4ed8';
      var label   = defEntry.label || id;
      var fromId  = 'tc-from-' + ctx + '-' + id;
      var toId    = 'tc-to-'   + ctx + '-' + id;
      // onchange: 직접 JS 코드 — esc 없이 작성, 따옴표만 주의
      var onchg = "var f=document.getElementById('" + fromId + "'),t=document.getElementById('" + toId + "');if(f&&t&&typeof setTabColor=='function'){setTabColor('" + ctx + "','" + id + "',f.value,t.value);}try{if(typeof render=='function')render();}catch(ex){}";
      var resetFn = "if(typeof resetTabColor=='function'){resetTabColor('" + ctx + "','" + id + "');}try{if(typeof render=='function')render();}catch(ex){}";
      return '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 0;border-bottom:1px solid var(--border)">'
        + '<div style="min-width:110px;font-size:12px;font-weight:900;color:var(--text2)">' + label + '</div>'
        + '<div style="display:flex;align-items:center;gap:6px">'
        + '<span style="font-size:10px;color:var(--gray-l)">시작</span>'
        + '<input type="color" id="' + fromId + '" value="' + fromVal + '" onchange="' + onchg + '" style="width:36px;height:28px;border:1px solid var(--border2);border-radius:6px;cursor:pointer;padding:2px;background:none">'
        + '<span style="font-size:10px;color:var(--gray-l)">끝</span>'
        + '<input type="color" id="' + toId + '" value="' + toVal + '" onchange="' + onchg + '" style="width:36px;height:28px;border:1px solid var(--border2);border-radius:6px;cursor:pointer;padding:2px;background:none">'
        + '</div>'
        + '<div style="width:64px;height:24px;border-radius:8px;background:linear-gradient(135deg,' + fromVal + ',' + toVal + ');flex-shrink:0;border:1px solid rgba(0,0,0,.08)"></div>'
        + '<button class="btn btn-w btn-xs" onclick="' + resetFn + '">초기화</button>'
        + '</div>';
    }

    var groupsHTML = '';
    for(var gi=0; gi<groups.length; gi++){
      var g = groups[gi];
      var ctxDefs = defs[g.ctx] || {};
      var ids = Object.keys(ctxDefs);
      if(!ids.length) continue;
      var rowsHTML = '';
      for(var ri=0; ri<ids.length; ri++){
        rowsHTML += makeRow(g.ctx, ids[ri], ctxDefs[ids[ri]]);
      }
      groupsHTML += '<div style="padding:10px 14px;border:1px solid var(--border);border-radius:10px;background:var(--surface);margin-bottom:10px">'
        + '<div style="font-weight:900;color:var(--text2);font-size:13px;margin-bottom:8px">' + g.title + '</div>'
        + rowsHTML
        + '</div>';
    }

    return _scfgD('tabcolors','🎨 탭 버튼 색상 커스텀')
      + '<div style="font-size:12px;color:var(--gray-l);margin-bottom:10px;line-height:1.6">'
      + '미니대전/시빌워/대학대전/대회탭/프로리그 등 탭 버튼의 활성(선택) 색상을 개별 지정합니다.<br>'
      + '<b>시작색</b>과 <b>끝색</b>으로 그라데이션을 만들며, 같은 색을 지정하면 단색이 됩니다.'
      + '</div>'
      + '<div style="padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--surface);margin-bottom:12px;display:flex;flex-direction:column;gap:10px">'
      + '  <label style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:900;color:var(--text2);cursor:pointer">'
      + '    <input type="checkbox" style="width:15px;height:15px" ' + (tabColorOn?'checked':'') + ' onchange="cfgSetTabColorEnabled(this.checked)">'
      + '    탭 컬러 사용'
      + '  </label>'
      + '  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
      + '    <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:84px">적용 모드</div>'
      + '    <select onchange="cfgSetTabColorMode(this.value)" style="padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">'
      + '      <option value="fill"' + (tabColorMode==='fill'?' selected':'') + '>풀 컬러</option>'
      + '      <option value="soft"' + (tabColorMode==='soft'?' selected':'') + '>소프트</option>'
      + '      <option value="outline"' + (tabColorMode==='outline'?' selected':'') + '>아웃라인</option>'
      + '      <option value="solid"' + (tabColorMode==='solid'?' selected':'') + '>단색</option>'
      + '    </select>'
      + '  </div>'
      + '  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
      + '    <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:84px">효과 길이</div>'
      + '    <input type="range" min="20" max="90" step="5" value="' + tabColorLength + '" oninput="document.getElementById(\'cfg-tabcolor-len-v\').textContent=this.value+\'%\'; cfgSetTabColorLength(this.value)" style="flex:1;min-width:160px">'
      + '    <div style="font-size:11px;color:var(--gray-l);font-weight:900;width:46px;text-align:right"><span id="cfg-tabcolor-len-v">' + tabColorLength + '%</span></div>'
      + '  </div>'
      + '  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
      + '    <div style="font-size:11px;color:var(--text3);font-weight:900;min-width:84px">하단 끝 진해짐</div>'
      + '    <input type="range" min="0" max="60" step="5" value="' + tabColorTail + '" oninput="document.getElementById(\'cfg-tabcolor-tail-v\').textContent=this.value+\'%\'; cfgSetTabColorTail(this.value)" style="flex:1;min-width:160px">'
      + '    <div style="font-size:11px;color:var(--gray-l);font-weight:900;width:46px;text-align:right"><span id="cfg-tabcolor-tail-v">' + tabColorTail + '%</span></div>'
      + '  </div>'
      + '  <div style="border-radius:10px;border:1px solid var(--border2);padding:10px 12px;background:linear-gradient(180deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,0) 42%, rgba(15,23,42,' + Math.max(0, Math.min(0.18, tabColorTail/100*0.18)).toFixed(3) + ') 84%, rgba(15,23,42,' + Math.max(0, Math.min(0.28, tabColorTail/100*0.32)).toFixed(3) + ') 100%), linear-gradient(135deg, #0f172a 0%, #2563eb ' + tabColorLength + '%, #2563eb ' + Math.min(96, tabColorLength+18) + '%, #1d4ed8 100%);color:#fff;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center">'
      + '    탭 컬러 미리보기'
      + '  </div>'
      + '  <div style="font-size:11px;color:var(--gray-l);line-height:1.6">탭 컬러를 완전히 끄거나, 진한 스타일 / 연한 스타일 / 테두리 중심 스타일로 바꿀 수 있습니다.</div>'
      + '</div>'
      + '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">'
      + '<button class="btn btn-w btn-sm" onclick="if(confirm(\'탭 버튼 색상을 모두 초기화할까요?\')){if(typeof resetAllTabColors==\'function\')resetAllTabColors();try{if(typeof render==\'function\')render();}catch(e){}}">🔄 전체 초기화</button>'
      + '</div>'
      + groupsHTML
      + '<div style="margin-top:14px;padding:14px;border:1px solid var(--border);border-radius:12px;background:var(--surface);display:flex;flex-direction:column;gap:10px">'
      + '  <div style="font-size:13px;font-weight:900;color:var(--text2)">🪄 기록 카드 양끝 대학 색상 효과</div>'
      + '  <div style="font-size:12px;color:var(--gray-l);line-height:1.6">이 설정은 <b>기록 카드(기록탭) 스타일</b>로 이동/통합되었습니다.</div>'
      + '  <div style="display:flex;gap:8px;flex-wrap:wrap">'
      + '    <button class="btn btn-w btn-sm" onclick="try{cfgGo(\'reccard\');}catch(e){}">🧾 기록 카드 설정 열기</button>'
      + '  </div>'
      + '</div>'
      + '</details>';
  }
  window.renderCfgTabColorSection = renderTabColorSection;

  // 페이지 로드 시 기록 카드 양끝 효과 길이 CSS variable 초기 적용
  try{
    var _initLen = Math.max(4, Math.min(80, parseInt(localStorage.getItem('su_rec_side_fx_length')||'25',10)||25));
    if(window.applyRecSideFxLengthVar) window.applyRecSideFxLengthVar(_initLen);
    else {
      // 함수가 아직 안 정의된 경우 DOMContentLoaded 후 적용
      document.addEventListener('DOMContentLoaded', function(){
        try{
          var n = Math.max(4, Math.min(80, parseInt(localStorage.getItem('su_rec_side_fx_length')||'25',10)||25));
          if(window.applyRecSideFxLengthVar) window.applyRecSideFxLengthVar(n);
        }catch(e){}
      });
    }
  }catch(e){}
})();
