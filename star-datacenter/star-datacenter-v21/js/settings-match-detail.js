/* ══════════════════════════════════════
   설정 분리: 경기 상세 팝업
══════════════════════════════════════ */
function cfgMdFxApplyPreset(preset){
  try{
    const p = String(preset||'').trim();
    if(p==='minimal'){
      localStorage.setItem('su_md_fx_on','1');
      localStorage.setItem('su_md_fx_preset','minimal');
      localStorage.setItem('su_md_fx_anim','shimmer');
      localStorage.setItem('su_md_fx_speed_mul','1.6');
      localStorage.setItem('su_md_fx_int','60');
    }else if(p==='strong'){
      localStorage.setItem('su_md_fx_on','1');
      localStorage.setItem('su_md_fx_preset','classic');
      localStorage.setItem('su_md_fx_anim','glint');
      localStorage.setItem('su_md_fx_speed_mul','0.8');
      localStorage.setItem('su_md_fx_int','140');
    }else{
      localStorage.setItem('su_md_fx_on','1');
      localStorage.setItem('su_md_fx_preset','classic');
      localStorage.setItem('su_md_fx_anim','both');
      localStorage.setItem('su_md_fx_speed_mul','1');
      localStorage.setItem('su_md_fx_int','100');
    }
    try{ if(typeof applyMatchDetailVars==='function') applyMatchDetailVars(); }catch(e){}
    try{ if(typeof render==='function') render(); }catch(e){}
    try{ if(typeof _renderCfgMatchDetailSection==='function') _renderCfgMatchDetailSection(); }catch(e){}
  }catch(e){}
}

function _renderCfgMatchDetailSection(){
  const body=document.getElementById('cfg-md-body');
  if(!body) return;
  const pd=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  const closeOnMatchPlayer = pd.close_on_match_player!==undefined ? pd.close_on_match_player : true;
  const mdWinTint = (()=>{ try{ return parseInt(localStorage.getItem('su_md_win_tint')||'13',10);}catch(e){return 13;} })();
  const mdLoseGray = (()=>{ try{ return parseInt(localStorage.getItem('su_md_lose_gray')||'12',10);}catch(e){return 12;} })();
  const mdLogoSize = (()=>{ try{ return parseInt(localStorage.getItem('su_md_logo_size')||'42',10);}catch(e){return 42;} })();
  const mdHeadAlign = (()=>{ try{ return (localStorage.getItem('su_md_head_align')||'center').trim(); }catch(e){ return 'center'; } })();
  const mdTeamFont = (()=>{ try{ return parseInt(localStorage.getItem('su_md_team_font')||'16',10);}catch(e){return 16;} })();
  const mdTitleFont = (()=>{ try{ return parseInt(localStorage.getItem('su_md_title_font')||'15',10);}catch(e){return 15;} })();
  const mdSubFont = (()=>{ try{ return parseInt(localStorage.getItem('su_md_sub_font')||'11',10);}catch(e){return 11;} })();
  const mdTeamFontPc = (()=>{ try{ return parseInt(localStorage.getItem('su_md_team_font_pc')||String(mdTeamFont),10);}catch(e){return mdTeamFont;} })();
  const mdTeamFontTb = (()=>{ try{ return parseInt(localStorage.getItem('su_md_team_font_tb')||String(mdTeamFont),10);}catch(e){return mdTeamFont;} })();
  const mdTeamFontMb = (()=>{ try{ return parseInt(localStorage.getItem('su_md_team_font_mb')||String(mdTeamFont),10);}catch(e){return mdTeamFont;} })();
  const mdTitleFontPc = (()=>{ try{ return parseInt(localStorage.getItem('su_md_title_font_pc')||String(mdTitleFont),10);}catch(e){return mdTitleFont;} })();
  const mdTitleFontTb = (()=>{ try{ return parseInt(localStorage.getItem('su_md_title_font_tb')||String(mdTitleFont),10);}catch(e){return mdTitleFont;} })();
  const mdTitleFontMb = (()=>{ try{ return parseInt(localStorage.getItem('su_md_title_font_mb')||String(mdTitleFont),10);}catch(e){return mdTitleFont;} })();
  const mdSubFontPc = (()=>{ try{ return parseInt(localStorage.getItem('su_md_sub_font_pc')||String(mdSubFont),10);}catch(e){return mdSubFont;} })();
  const mdSubFontTb = (()=>{ try{ return parseInt(localStorage.getItem('su_md_sub_font_tb')||String(mdSubFont),10);}catch(e){return mdSubFont;} })();
  const mdSubFontMb = (()=>{ try{ return parseInt(localStorage.getItem('su_md_sub_font_mb')||String(mdSubFont),10);}catch(e){return mdSubFont;} })();
  const mdLogoSizePc = (()=>{ try{ return parseInt(localStorage.getItem('su_md_logo_size_pc')||String(mdLogoSize),10);}catch(e){return mdLogoSize;} })();
  const mdLogoSizeTb = (()=>{ try{ return parseInt(localStorage.getItem('su_md_logo_size_tb')||String(mdLogoSize),10);}catch(e){return mdLogoSize;} })();
  const mdLogoSizeMb = (()=>{ try{ return parseInt(localStorage.getItem('su_md_logo_size_mb')||String(mdLogoSize),10);}catch(e){return mdLogoSize;} })();
  const _mdDevKey = (()=>{ const w=Math.max(320, Math.min(1920, window.innerWidth||1024)); return w<=768?'mb':(w<=1024?'tb':'pc'); })();
  const _mdDevLabel = _mdDevKey==='mb'?'모바일':(_mdDevKey==='tb'?'태블릿':'PC');
  const mdAvatarFit = (()=>{ try{ return (localStorage.getItem(`su_md_avatar_fit_${_mdDevKey}`)||localStorage.getItem('su_md_avatar_fit')||'cover').trim(); }catch(e){ return 'cover'; } })();
  const mdAvatarScale = (()=>{ try{ return parseInt(localStorage.getItem(`su_md_avatar_scale_${_mdDevKey}`)||localStorage.getItem('su_md_avatar_scale')||'100',10); }catch(e){ return 100; } })();
  const mdFxOn = (localStorage.getItem('su_md_fx_on') ?? '1') !== '0';
  const mdFxPreset = (localStorage.getItem('su_md_fx_preset') || 'classic').trim();
  const mdFxAnim = (localStorage.getItem('su_md_fx_anim') || 'both').trim();
  const mdFxSpeedMul = (()=>{ try{ return parseFloat(localStorage.getItem('su_md_fx_speed_mul')||'1'); }catch(e){ return 1; } })();
  const mdFxInt = (()=>{ try{ return parseInt(localStorage.getItem('su_md_fx_int')||'100',10); }catch(e){ return 100; } })();
  try{ if(typeof applyMatchDetailVars==='function') applyMatchDetailVars(); }catch(e){}

  body.innerHTML=`
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">
      대전기록/대회/프로리그 등에서 열리는 <b>경기 상세 팝업</b>의 상단(대학 카드)과 프로필 표시를 조절합니다.
    </div>

    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:8px">✨ 헤더 애니메이션/효과</div>
      <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:12px;display:flex;flex-direction:column;gap:10px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:800;color:var(--text2);font-size:12px">
          <input type="checkbox" ${mdFxOn?'checked':''} style="width:16px;height:16px;cursor:pointer"
            onchange="localStorage.setItem('su_md_fx_on', this.checked?'1':'0'); try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){}; try{if(typeof render==='function')render();}catch(e){}; _renderCfgMatchDetailSection()">
          헤더 애니메이션 사용
          <span style="font-size:11px;color:var(--gray-l);font-weight:700">(ON/OFF)</span>
        </label>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-w btn-xs" onclick="cfgMdFxApplyPreset('basic')">기본</button>
          <button class="btn btn-w btn-xs" onclick="cfgMdFxApplyPreset('strong')">강하게</button>
          <button class="btn btn-w btn-xs" onclick="cfgMdFxApplyPreset('minimal')">미니멀</button>
          <span style="font-size:11px;color:var(--gray-l);align-self:center">프리셋을 누르면 ON/색감/효과/속도/강도가 한번에 적용됩니다</span>
        </div>
        <div style="display:grid;grid-template-columns:120px 1fr;gap:10px;align-items:center">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">색감 프리셋</div>
          <select style="padding:8px 10px;border:1px solid var(--border2);border-radius:10px;font-size:12px"
            onchange="localStorage.setItem('su_md_fx_preset',this.value); try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){}; try{if(typeof render==='function')render();}catch(e){}; _renderCfgMatchDetailSection()">
            <option value="classic" ${mdFxPreset==='classic'?'selected':''}>기본(파랑)</option>
            <option value="aurora" ${mdFxPreset==='aurora'?'selected':''}>오로라(보라/청록)</option>
            <option value="sunset" ${mdFxPreset==='sunset'?'selected':''}>선셋(핑크/오렌지)</option>
            <option value="minimal" ${mdFxPreset==='minimal'?'selected':''}>미니멀(무채색)</option>
          </select>
        </div>
        <div style="display:grid;grid-template-columns:120px 1fr;gap:10px;align-items:center">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">효과 종류</div>
          <select style="padding:8px 10px;border:1px solid var(--border2);border-radius:10px;font-size:12px"
            onchange="localStorage.setItem('su_md_fx_anim',this.value); try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){}; try{if(typeof render==='function')render();}catch(e){}; _renderCfgMatchDetailSection()">
            <option value="both" ${mdFxAnim==='both'?'selected':''}>기본(물결+반짝)</option>
            <option value="wave" ${mdFxAnim==='wave'?'selected':''}>물결만</option>
            <option value="shimmer" ${mdFxAnim==='shimmer'?'selected':''}>반짝만</option>
            <option value="pulse" ${mdFxAnim==='pulse'?'selected':''}>펄스(부드럽게)</option>
            <option value="glint" ${mdFxAnim==='glint'?'selected':''}>글린트(강하게)</option>
          </select>
        </div>
        <div style="display:grid;grid-template-columns:120px 1fr 90px;gap:10px;align-items:center">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">속도</div>
          <input type="range" min="0.6" max="1.8" step="0.1" value="${isNaN(mdFxSpeedMul)?1:mdFxSpeedMul}" style="width:100%;accent-color:var(--blue)"
            oninput="localStorage.setItem('su_md_fx_speed_mul',String(this.value));document.getElementById('cfg-md-fx-speed-val').textContent=this.value+'x'; try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){}; try{if(typeof render==='function')render();}catch(e){}">
          <div id="cfg-md-fx-speed-val" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${(isNaN(mdFxSpeedMul)?1:mdFxSpeedMul).toFixed(1)}x</div>
        </div>
        <div style="display:grid;grid-template-columns:120px 1fr 90px;gap:10px;align-items:center">
          <div style="font-size:12px;font-weight:800;color:var(--text2)">강도</div>
          <input type="range" min="0" max="150" step="5" value="${isNaN(mdFxInt)?100:mdFxInt}" style="width:100%;accent-color:var(--blue)"
            oninput="localStorage.setItem('su_md_fx_int',String(this.value));document.getElementById('cfg-md-fx-int-val').textContent=this.value+'%'; try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){}; try{if(typeof render==='function')render();}catch(e){}">
          <div id="cfg-md-fx-int-val" style="font-size:11px;color:var(--gray-l);font-weight:900;text-align:right">${isNaN(mdFxInt)?100:mdFxInt}%</div>
        </div>
        <div style="font-size:11px;color:var(--gray-l);line-height:1.6">
          ※ “속도”는 <b>값이 작을수록 더 빠르게</b> 움직입니다. (0.6x 빠름 · 1.0x 기본 · 1.8x 느림)
        </div>
      </div>
    </div>

    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">↔️ 상단 대학 카드 정렬</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
        <button class="btn btn-xs ${mdHeadAlign==='left'?'btn-b':'btn-w'}"
          onclick="localStorage.setItem('su_md_head_align','left');try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){};try{if(typeof render==='function')render();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){};_renderCfgMatchDetailSection()">좌측</button>
        <button class="btn btn-xs ${mdHeadAlign==='center'?'btn-b':'btn-w'}"
          onclick="localStorage.setItem('su_md_head_align','center');try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){};try{if(typeof render==='function')render();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){};_renderCfgMatchDetailSection()">가운데</button>
        <button class="btn btn-xs ${mdHeadAlign==='right'?'btn-b':'btn-w'}"
          onclick="localStorage.setItem('su_md_head_align','right');try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){};try{if(typeof render==='function')render();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){};_renderCfgMatchDetailSection()">우측</button>
      </div>
      <div style="font-size:11px;color:var(--gray-l)">모바일/태블릿 포함 상단 대학 카드 텍스트 정렬</div>
    </div>

    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">🔠 상단 폰트/로고 크기 (기기별)</div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${[
          ['pc','PC', mdTeamFontPc, mdTitleFontPc, mdSubFontPc, mdLogoSizePc],
          ['tb','태블릿', mdTeamFontTb, mdTitleFontTb, mdSubFontTb, mdLogoSizeTb],
          ['mb','모바일', mdTeamFontMb, mdTitleFontMb, mdSubFontMb, mdLogoSizeMb]
        ].map(([dv, lbl, teamV, titleV, subV, logoV])=>`
          <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:12px">
            <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:10px">${lbl}</div>
            <div style="display:grid;grid-template-columns:minmax(118px,128px) 1fr 48px;gap:8px;align-items:center;margin-bottom:8px">
              <label style="font-size:12px;font-weight:700;color:var(--text2)">대학 카드</label>
              <input type="range" min="11" max="26" step="1" value="${teamV}" style="width:100%;accent-color:var(--blue)"
                oninput="localStorage.setItem('su_md_team_font_${dv}',String(this.value));document.getElementById('cfg-md-teamfont-${dv}-val').textContent=this.value+'px';try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){};try{if(typeof render==='function')render();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){}">
              <span id="cfg-md-teamfont-${dv}-val" style="font-size:11px;color:var(--gray-l);text-align:right;font-weight:800">${teamV}px</span>
            </div>
            <div style="display:grid;grid-template-columns:minmax(118px,128px) 1fr 48px;gap:8px;align-items:center;margin-bottom:8px">
              <label style="font-size:12px;font-weight:700;color:var(--text2)">제목</label>
              <input type="range" min="12" max="24" step="1" value="${titleV}" style="width:100%;accent-color:var(--blue)"
                oninput="localStorage.setItem('su_md_title_font_${dv}',String(this.value));document.getElementById('cfg-md-titlefont-${dv}-val').textContent=this.value+'px';try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){};try{if(typeof render==='function')render();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){}">
              <span id="cfg-md-titlefont-${dv}-val" style="font-size:11px;color:var(--gray-l);text-align:right;font-weight:800">${titleV}px</span>
            </div>
            <div style="display:grid;grid-template-columns:minmax(118px,128px) 1fr 48px;gap:8px;align-items:center;margin-bottom:8px">
              <label style="font-size:12px;font-weight:700;color:var(--text2)">부제</label>
              <input type="range" min="10" max="18" step="1" value="${subV}" style="width:100%;accent-color:var(--blue)"
                oninput="localStorage.setItem('su_md_sub_font_${dv}',String(this.value));document.getElementById('cfg-md-subfont-${dv}-val').textContent=this.value+'px';try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){};try{if(typeof render==='function')render();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){}">
              <span id="cfg-md-subfont-${dv}-val" style="font-size:11px;color:var(--gray-l);text-align:right;font-weight:800">${subV}px</span>
            </div>
            <div style="display:grid;grid-template-columns:minmax(118px,128px) 1fr 48px;gap:8px;align-items:center">
              <label style="font-size:12px;font-weight:700;color:var(--text2)">대학 로고</label>
              <input type="range" min="28" max="64" step="2" value="${logoV}" style="width:100%;accent-color:var(--blue)"
                oninput="localStorage.setItem('su_md_logo_size_${dv}',String(this.value));document.getElementById('cfg-md-logo-${dv}-val').textContent=this.value+'px';try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){};try{if(typeof render==='function')render();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){}">
              <span id="cfg-md-logo-${dv}-val" style="font-size:11px;color:var(--gray-l);text-align:right;font-weight:800">${logoV}px</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:8px">PC/태블릿/모바일에서 각각 다른 상단 대학 카드 폰트와 로고 크기를 사용할 수 있습니다.</div>
    </div>

    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">🖼️ 프로필 이미지(선수)</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">현재 기기: <b>${_mdDevLabel}</b></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <button class="btn btn-xs ${mdAvatarFit==='cover'?'btn-b':'btn-w'}"
          onclick="localStorage.setItem('su_md_avatar_fit_${_mdDevKey}','cover');try{if(typeof render==='function')render();}catch(e){};_renderCfgMatchDetailSection()">가득 채우기</button>
        <button class="btn btn-xs ${mdAvatarFit!=='cover'?'btn-b':'btn-w'}"
          onclick="localStorage.setItem('su_md_avatar_fit_${_mdDevKey}','contain');try{if(typeof render==='function')render();}catch(e){};_renderCfgMatchDetailSection()">원본 비율</button>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:700;color:var(--text2);min-width:128px">크기 배율</label>
        <input type="range" min="80" max="200" step="10" value="${mdAvatarScale}" style="flex:1;accent-color:var(--blue)"
          oninput="localStorage.setItem('su_md_avatar_scale_${_mdDevKey}',String(this.value));document.getElementById('cfg-md2-avscale-val').textContent=this.value+'%';try{if(typeof render==='function')render();}catch(e){}">
        <span id="cfg-md2-avscale-val" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:800">${mdAvatarScale}%</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">팝업 상단의 프로필 표시 크기/채우기 방식입니다</div>
    </div>

    <div style="margin-bottom:16px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">🎨 승/패 배경 강도</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
        <label style="font-size:12px;font-weight:700;color:var(--text2);min-width:128px">승자 배경 강도</label>
        <input type="range" min="0" max="30" step="1" value="${mdWinTint}" style="flex:1;accent-color:var(--blue)"
          oninput="localStorage.setItem('su_md_win_tint',String(this.value));document.getElementById('cfg-md2-win-val').textContent=this.value+'%';try{if(typeof render==='function')render();}catch(e){}">
        <span id="cfg-md2-win-val" style="font-size:11px;color:var(--gray-l);min-width:34px;text-align:right;font-weight:800">${mdWinTint}%</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:700;color:var(--text2);min-width:128px">패자 회색 강도</label>
        <input type="range" min="0" max="30" step="1" value="${mdLoseGray}" style="flex:1;accent-color:var(--blue)"
          oninput="localStorage.setItem('su_md_lose_gray',String(this.value));document.getElementById('cfg-md2-lose-val').textContent=this.value+'%';try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){};try{if(typeof render==='function')render();}catch(e){}">
        <span id="cfg-md2-lose-val" style="font-size:11px;color:var(--gray-l);min-width:34px;text-align:right;font-weight:800">${mdLoseGray}%</span>
      </div>
    </div>

    <div style="margin-bottom:4px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">⚙️ 팝업 동작</div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" ${closeOnMatchPlayer?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setPdCloseOnMatchPlayer(this.checked)">
        <span style="font-size:12px;color:var(--text)">경기 상세에서 선수 클릭 시 팝업 닫기</span>
      </label>
    </div>
  `;
}

try{
  window.SettingsModules = window.SettingsModules || {};
  window.SettingsModules.matchDetail = {
    applyFxPreset: cfgMdFxApplyPreset,
    renderMatchDetailSection: _renderCfgMatchDetailSection
  };
  window.cfgMdFxApplyPreset = cfgMdFxApplyPreset;
  window._renderCfgMatchDetailSection = _renderCfgMatchDetailSection;
}catch(e){}
