/* ══════════════════════════════════════
   설정 분리: 스트리머 상세 설정
══════════════════════════════════════ */
function _renderCfgPdSection(){
  const body=document.getElementById('cfg-pd-body');
  if(!body) return;
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  const fs=s.font_size||'normal';
  const cp=s.color_preset||'normal';
  const st=s.stats_tint!==undefined?s.stats_tint:8;
  const mt=s.mode_tint!==undefined?s.mode_tint:10;
  const ps=s.profile_size!==undefined?s.profile_size:100;
  const closeOnBadge=s.close_on_badge!==undefined?s.close_on_badge:true;
  const closeOnMatchPlayer=s.close_on_match_player!==undefined?s.close_on_match_player:true;
  const headerClickClose=s.header_click_close!==undefined?s.header_click_close:true;
  const mdWinTint = (()=>{ try{ return parseInt(localStorage.getItem('su_md_win_tint')||'13',10);}catch(e){return 13;} })();
  const mdLoseGray = (()=>{ try{ return parseInt(localStorage.getItem('su_md_lose_gray')||'12',10);}catch(e){return 12;} })();
  const mdLogoSize = (()=>{ try{ return parseInt(localStorage.getItem('su_md_logo_size')||'42',10);}catch(e){return 42;} })();
  const _mdDevKey = (()=>{ const w=Math.max(320, Math.min(1920, window.innerWidth||1024)); return w<=768?'mb':(w<=1024?'tb':'pc'); })();
  const _mdDevLabel = _mdDevKey==='mb'?'모바일':(_mdDevKey==='tb'?'태블릿':'PC');
  const mdAvatarFit = (()=>{ try{ return (localStorage.getItem(`su_md_avatar_fit_${_mdDevKey}`)||localStorage.getItem('su_md_avatar_fit')||'contain').trim(); }catch(e){ return 'contain'; } })();
  const mdAvatarScale = (()=>{ try{ return parseInt(localStorage.getItem(`su_md_avatar_scale_${_mdDevKey}`)||localStorage.getItem('su_md_avatar_scale')||'100',10); }catch(e){ return 100; } })();
  const _pdModeColorRows = _cfgBuildPdModeBadgeColorRows().rows;
  try{ if(typeof applyMatchDetailVars==='function') applyMatchDetailVars(); }catch(e){}
  const _shape = (()=>{ try{ return (localStorage.getItem('su_profile_shape')||localStorage.getItem('su_bcp_shape')||'circle'); }catch(e){ return 'circle'; } })();
  const _shapeLbl = _shape==='square' ? '⬛ 네모' : '⭕ 원형';
  const darken=s.univ_darken||{};
  const univs=(typeof getAllUnivs==='function'?getAllUnivs():univCfg).filter(u=>u.name!=='무소속');
  const fsBtns=['normal','large','xlarge'].map(f=>`<button class="btn btn-xs ${f===fs?'btn-b':'btn-w'}" onclick="_setPdFontSize('${f}')">${f==='normal'?'기본':f==='large'?'크게 (×1.12)':'더 크게 (×1.2)'}</button>`).join('');
  const cpBtns=[['light','연하게'],['normal','기본'],['dark','진하게']].map(([k,l])=>`<button class="btn btn-xs ${cp===k?'btn-b':'btn-w'}" onclick="_setPdColorPreset('${k}')">${l}</button>`).join('');
  const univRows=univs.map((u,i)=>{
    const val=Math.round((darken[u.name]||0)*100);
    const safe=u.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">
      <span style="width:14px;height:14px;border-radius:50%;background:${u.color};flex-shrink:0;border:1px solid rgba(0,0,0,.12)"></span>
      <span style="font-size:12px;font-weight:600;color:var(--text2);min-width:72px;flex-shrink:0">${u.name}</span>
      <input type="range" min="0" max="50" step="5" value="${val}" style="flex:1;accent-color:var(--blue)" oninput="_setPdUnivDarken('${safe}',this.value/100,${i})">
      <span style="font-size:11px;color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="pd-dv-${i}">${val}%</span>
    </div>`;
  }).join('');
  body.innerHTML=`
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📏 폰트 크기</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${fsBtns}</div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">스트리머 상세 모달 전체 크기에 적용됩니다</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🖼️ 프로필 이미지 크기</div>
      <div style="display:flex;align-items:center;gap:10px">
        <input type="range" min="60" max="140" step="5" value="${ps}" style="flex:1;accent-color:var(--blue)" oninput="_setPdProfileSize(this.value);document.getElementById('pd-ps-val').textContent=this.value+'%'">
        <span id="pd-ps-val" style="font-size:11px;color:var(--gray-l);min-width:35px;text-align:right;font-weight:700">${ps}%</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">프로필 이미지 크기 (기본 100%)</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📐 프로필 이미지 모양 (전역)</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-xs btn-w" onclick="cfgGo('profileshape')">⚙️ 설정 열기</button>
        <span style="font-size:11px;color:var(--gray-l);font-weight:800">현재: ${_shapeLbl}</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">프로필 이미지 모양 설정은 ‘🖼️ 프로필 이미지 모양’ 메뉴로 분리되었습니다.</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🎨 승패 색상 농도</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">${cpBtns}</div>
      <div style="font-size:11px;color:var(--gray-l)">전적·승률·포인트·모드별 전적의 승/패/승률 색상 전체에 적용</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">🎨 경기 상세(팝업) 승/패 배경 강도</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
        <label style="font-size:12px;font-weight:700;color:var(--text2);min-width:128px">승자 배경 강도</label>
        <input type="range" min="0" max="30" step="1" value="${mdWinTint}" style="flex:1;accent-color:var(--blue)"
          oninput="localStorage.setItem('su_md_win_tint',String(this.value));document.getElementById('cfg-md-win-val').textContent=this.value+'%';try{if(typeof render==='function')render();}catch(e){}">
        <span id="cfg-md-win-val" style="font-size:11px;color:var(--gray-l);min-width:34px;text-align:right;font-weight:800">${mdWinTint}%</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:700;color:var(--text2);min-width:128px">패자 회색 강도</label>
        <input type="range" min="0" max="30" step="1" value="${mdLoseGray}" style="flex:1;accent-color:var(--blue)"
          oninput="localStorage.setItem('su_md_lose_gray',String(this.value));document.getElementById('cfg-md-lose-val').textContent=this.value+'%';try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){};try{if(typeof render==='function')render();}catch(e){}">
        <span id="cfg-md-lose-val" style="font-size:11px;color:var(--gray-l);min-width:34px;text-align:right;font-weight:800">${mdLoseGray}%</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">승자는 대학색 배경의 농도, 패자는 회색 배경의 농도를 조절합니다</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">🏫 경기 상세 상단 대학 로고 크기</div>
      <div style="display:flex;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:700;color:var(--text2);min-width:128px">로고 크기</label>
        <input type="range" min="28" max="64" step="2" value="${mdLogoSize}" style="flex:1;accent-color:var(--blue)"
          oninput="localStorage.setItem('su_md_logo_size',String(this.value));document.getElementById('cfg-md-logo-val').textContent=this.value+'px';try{document.documentElement.style.setProperty('--su_md_logo_size',this.value+'px');}catch(e){};try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){};try{if(typeof render==='function')render();}catch(e){}">
        <span id="cfg-md-logo-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:800">${mdLogoSize}px</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">경기 상세 팝업 상단(대학 카드) 로고 크기를 조절합니다</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">🖼️ 경기 상세 프로필 이미지</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">현재 기기: <b>${_mdDevLabel}</b></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <button class="btn btn-xs ${mdAvatarFit==='cover'?'btn-b':'btn-w'}"
          onclick="localStorage.setItem('su_md_avatar_fit_${_mdDevKey}','cover');try{if(typeof render==='function')render();}catch(e){};_renderCfgPdSection()">가득 채우기</button>
        <button class="btn btn-xs ${mdAvatarFit!=='cover'?'btn-b':'btn-w'}"
          onclick="localStorage.setItem('su_md_avatar_fit_${_mdDevKey}','contain');try{if(typeof render==='function')render();}catch(e){};_renderCfgPdSection()">원본 비율</button>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:700;color:var(--text2);min-width:128px">크기 배율</label>
        <input type="range" min="80" max="200" step="10" value="${mdAvatarScale}" style="flex:1;accent-color:var(--blue)"
          oninput="localStorage.setItem('su_md_avatar_scale_${_mdDevKey}',String(this.value));document.getElementById('cfg-md-avscale-val').textContent=this.value+'%';try{if(typeof render==='function')render();}catch(e){}">
        <span id="cfg-md-avscale-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:800">${mdAvatarScale}%</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">경기 상세(대회탭 포함) 프로필 이미지의 채우기/크기 배율을 조절합니다</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📊 전적·승률 배경 색상 강도</div>
      <div style="display:flex;align-items:center;gap:10px">
        <input type="range" min="0" max="30" step="2" value="${st}" style="flex:1;accent-color:var(--blue)" oninput="_setPdTint('stats',this.value);document.getElementById('pd-st-val').textContent=this.value+'%'">
        <span id="pd-st-val" style="font-size:11px;color:var(--gray-l);min-width:28px;font-weight:700">${st}%</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:4px">전적/승률/포인트/ELO 영역 배경 대학색 강도 (현재 ${st}%)</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🃏 모드별 전적 배경 색상 강도</div>
      <div style="display:flex;align-items:center;gap:10px">
        <input type="range" min="0" max="30" step="2" value="${mt}" style="flex:1;accent-color:var(--blue)" oninput="_setPdTint('mode',this.value);document.getElementById('pd-mt-val').textContent=this.value+'%'">
        <span id="pd-mt-val" style="font-size:11px;color:var(--gray-l);min-width:28px;font-weight:700">${mt}%</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:4px">모드별 전적 카드 배경 모드색 강도 (현재 ${mt}%)</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">🎨 최근 경기 기록 ‘종목(종류) 배지’ 색상</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">스트리머 상세 → 최근 경기 기록의 “종류” 배지 색상을 변경합니다.</div>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:10px 12px">
        ${_pdModeColorRows}
        <div style="display:flex;gap:8px;align-items:center;margin-top:10px">
          <button class="btn btn-w btn-xs" onclick="cfgPdResetModeBadgeColors()">🔄 기본값으로 초기화</button>
          <span style="font-size:11px;color:var(--gray-l)">※ 바뀐 색상은 즉시 반영됩니다</span>
        </div>
      </div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">⚙️ 팝업 동작 설정</div>
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" ${closeOnBadge?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setPdCloseOnBadge(this.checked)">
          <span style="font-size:12px;color:var(--text)">종목 클릭 시 팝업 닫기</span>
        </label>
      </div>
      <div style="font-size:11px;color:var(--gray-l)">활성화 시: 종목 아이콘/배지 클릭 시 스트리머 상세 팝업이 닫힙니다</div>
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" ${closeOnMatchPlayer?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setPdCloseOnMatchPlayer(this.checked)">
          <span style="font-size:12px;color:var(--text)">경기 상세에서 선수 클릭 시 팝업 닫기</span>
        </label>
      </div>
      <div style="font-size:11px;color:var(--gray-l)">활성화 시: 경기 상세 팝업에서 선수 이름을 누르면 경기 상세 팝업이 닫힙니다</div>
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" ${headerClickClose?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setPdHeaderClickClose(this.checked)">
          <span style="font-size:12px;color:var(--text)">팝업 헤더 클릭 시 닫기</span>
        </label>
      </div>
      <div style="font-size:11px;color:var(--gray-l)">활성화 시: 각 팝업 상단 헤더(제목)를 클릭하면 팝업이 닫힙니다 (드래그 이동은 유지)</div>
    </div>
    <div>
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:4px">🌗 대학별 헤더 어둡기</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">밝은 색상 대학은 어둡게 조정하면 이름이 더 잘 보입니다</div>
      ${univRows}
    </div>`;
}

function _setPdFontSize(size){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.font_size=size;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  _renderCfgPdSection();
}
function _setPdProfileSize(val){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.profile_size=parseInt(val)||100;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
}
function _setPdColorPreset(cp){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.color_preset=cp;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  _renderCfgPdSection();
}
function _setPdTint(type,val){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s[type+'_tint']=parseInt(val)||0;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
}
function _setPdUnivDarken(univ,val,idx){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  if(!s.univ_darken) s.univ_darken={};
  s.univ_darken[univ]=parseFloat(val)||0;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  const el=document.getElementById('pd-dv-'+idx);
  if(el) el.textContent=Math.round(val*100)+'%';
}
function _setPdCloseOnBadge(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.close_on_badge=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
}
function _setPdCloseOnMatchPlayer(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.close_on_match_player=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
}
function _setPdHeaderClickClose(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.header_click_close=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
}
function cfgPdSetModeBadgeColor(mode, color){
  try{
    const m = String(mode||'').trim();
    let c = String(color||'').trim();
    if(!m) return;
    if(c && c[0] !== '#') c = '#'+c;
    if(!/^#[0-9a-fA-F]{6}$/.test(c)){
      try{ alert('색상 코드는 #RRGGBB 형식으로 입력하세요.'); }catch(e){}
      return;
    }
    const obj = (()=>{ try{ return JSON.parse(localStorage.getItem('su_pd_mode_badge_colors')||'{}')||{}; }catch(e){ return {}; } })();
    obj[m] = c;
    localStorage.setItem('su_pd_mode_badge_colors', JSON.stringify(obj));
    try{ if(typeof render==='function') render(); }catch(e){}
    _renderCfgPdSection();
    try{ if(typeof _renderCfgPdModeBadgeSection==='function') _renderCfgPdModeBadgeSection(); }catch(e){}
  }catch(e){}
}
function cfgPdResetModeBadgeColors(){
  try{ if(!confirm('종목(종류) 배지 색상을 기본값으로 초기화할까요?')) return; }catch(e){}
  try{ localStorage.removeItem('su_pd_mode_badge_colors'); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
  _renderCfgPdSection();
  try{ if(typeof _renderCfgPdModeBadgeSection==='function') _renderCfgPdModeBadgeSection(); }catch(e){}
}
function _setGlobalProfileShape(shape){
  const _prevCfgSec = window._cfgModalSecId || '';
  try{
    const v = (shape==='square') ? 'square' : 'circle';
    localStorage.setItem('su_profile_shape', v);
    try{ if(typeof applyProfileShapeVars==='function') applyProfileShapeVars(); }catch(e){}
  }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ if(_prevCfgSec==='profileshape' && typeof window._renderCfgProfileShapeSection==='function') window._renderCfgProfileShapeSection(); }catch(e){}
  try{ if(typeof _renderCfgPdSection==='function') _renderCfgPdSection(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
}

try{
  window.SettingsModules = window.SettingsModules || {};
  window.SettingsModules.playerDetail = {
    renderPlayerDetailSection: _renderCfgPdSection
  };
  window._renderCfgPdSection = _renderCfgPdSection;
  window._setGlobalProfileShape = _setGlobalProfileShape;
}catch(e){}
