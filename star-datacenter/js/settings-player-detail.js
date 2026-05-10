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
  const phbg=s.header_bg_img||'';
  const phbgFit=s.header_bg_fit||'contain';
  const phbgScale=s.header_bg_scale!==undefined?s.header_bg_scale:100;
  const phbgPos=s.header_bg_pos||'center center';
  const _phbgPosX = (()=>{ const n=parseInt(s.header_bg_pos_x??'50',10); return isNaN(n)?50:Math.max(0,Math.min(100,n)); })();
  const _phbgPosY = (()=>{ const n=parseInt(s.header_bg_pos_y??'50',10); return isNaN(n)?50:Math.max(0,Math.min(100,n)); })();
  const uds=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  const uhbg=uds.header_bg_img||'';
  const uhbgFit=uds.header_bg_fit||'contain';
  const uhbgScale=uds.header_bg_scale!==undefined?uds.header_bg_scale:100;
  const closeOnBadge=s.close_on_badge!==undefined?s.close_on_badge:true;
  const closeOnMatchPlayer=s.close_on_match_player!==undefined?s.close_on_match_player:true;
  const headerClickClose=s.header_click_close!==undefined?s.header_click_close:true;
  const mdWinTint = (()=>{ try{ return parseInt(localStorage.getItem('su_md_win_tint')||'13',10);}catch(e){return 13;} })();
  const mdLoseGray = (()=>{ try{ return parseInt(localStorage.getItem('su_md_lose_gray')||'12',10);}catch(e){return 12;} })();
  const mdLogoSize = (()=>{ try{ return parseInt(localStorage.getItem('su_md_logo_size')||'42',10);}catch(e){return 42;} })();
  const mdCkA = (()=>{ try{ return (localStorage.getItem('su_md_team_hdr_ck_a')||'#2563eb').trim(); }catch(e){ return '#2563eb'; } })();
  const mdCkB = (()=>{ try{ return (localStorage.getItem('su_md_team_hdr_ck_b')||'#dc2626').trim(); }catch(e){ return '#dc2626'; } })();
  const mdTtA = (()=>{ try{ return (localStorage.getItem('su_md_team_hdr_tt_a')||'#7c3aed').trim(); }catch(e){ return '#7c3aed'; } })();
  const mdTtB = (()=>{ try{ return (localStorage.getItem('su_md_team_hdr_tt_b')||'#0ea5e9').trim(); }catch(e){ return '#0ea5e9'; } })();
  const mdProA = (()=>{ try{ return (localStorage.getItem('su_md_team_hdr_pro_a')||'#2563eb').trim(); }catch(e){ return '#2563eb'; } })();
  const mdProB = (()=>{ try{ return (localStorage.getItem('su_md_team_hdr_pro_b')||'#dc2626').trim(); }catch(e){ return '#dc2626'; } })();
  const _mdDevKey = (()=>{ const w=Math.max(320, Math.min(1920, window.innerWidth||1024)); return w<=768?'mb':(w<=1024?'tb':'pc'); })();
  const _mdDevLabel = _mdDevKey==='mb'?'모바일':(_mdDevKey==='tb'?'태블릿':'PC');
  const mdAvatarFit = (()=>{ try{ return (localStorage.getItem(`su_md_avatar_fit_${_mdDevKey}`)||localStorage.getItem('su_md_avatar_fit')||'contain').trim(); }catch(e){ return 'contain'; } })();
  const mdAvatarScale = (()=>{ try{ return parseInt(localStorage.getItem(`su_md_avatar_scale_${_mdDevKey}`)||localStorage.getItem('su_md_avatar_scale')||'100',10); }catch(e){ return 100; } })();
  const mdAvatarPos = (()=>{ try{ return (localStorage.getItem(`su_md_avatar_pos_${_mdDevKey}`)||localStorage.getItem('su_md_avatar_pos')||'center center').trim(); }catch(e){ return 'center center'; } })();
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
    <div style="margin-bottom:16px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">🖼 스트리머 상세 헤더 기본 배경</div>
      <input type="text" value="${phbg}" placeholder="https://... 이미지 URL" style="width:100%;margin-bottom:10px" oninput="_setPdHeaderBg('header_bg_img',this.value)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px">표시 방식</div>
          <select style="width:100%" onchange="_setPdHeaderBg('header_bg_fit',this.value)">
            <option value="contain"${phbgFit==='contain'?' selected':''}>맞춤</option>
            <option value="cover"${phbgFit==='cover'?' selected':''}>채우기</option>
            <option value="fill"${phbgFit==='fill'?' selected':''}>늘리기</option>
          </select>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px">크기 조절</div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="range" min="40" max="220" step="5" value="${phbgScale}" style="flex:1;accent-color:var(--blue)" oninput="_setPdHeaderBg('header_bg_scale',this.value);document.getElementById('cfg-pdh-scale').textContent=this.value+'%'">
            <span id="cfg-pdh-scale" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:800">${phbgScale}%</span>
          </div>
        </div>
      </div>
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin:10px 0 6px">이미지 위치</div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">
        ${[
          ['left top','↖ 좌상'],['center top','↑ 상단'],['right top','↗ 우상'],
          ['left center','← 좌중'],['center center','• 중앙'],['right center','→ 우중'],
          ['left bottom','↙ 좌하'],['center bottom','↓ 하단'],['right bottom','↘ 우하']
        ].map(([pos,label])=>`<button class="btn btn-xs ${phbgPos===pos?'btn-b':'btn-w'}"
          onclick="_setPdHeaderBg('header_bg_pos','${pos}')">${label}</button>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px">가로 미세 위치</div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="range" min="0" max="100" step="1" value="${_phbgPosX}" style="flex:1;accent-color:var(--blue)" oninput="_setPdHeaderBg('header_bg_pos_x',this.value);document.getElementById('cfg-pdh-posx').textContent=this.value+'%'">
            <span id="cfg-pdh-posx" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:800">${_phbgPosX}%</span>
          </div>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px">세로 미세 위치</div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="range" min="0" max="100" step="1" value="${_phbgPosY}" style="flex:1;accent-color:var(--blue)" oninput="_setPdHeaderBg('header_bg_pos_y',this.value);document.getElementById('cfg-pdh-posy').textContent=this.value+'%'">
            <span id="cfg-pdh-posy" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:800">${_phbgPosY}%</span>
          </div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">개별 스트리머에 별도 배경을 넣지 않은 경우 기본값으로 사용됩니다.</div>
    </div>
    <div style="margin-bottom:16px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">🏫 대학 상세 헤더 기본 배경</div>
      <input type="text" value="${uhbg}" placeholder="https://... 이미지 URL" style="width:100%;margin-bottom:10px" oninput="_setUdHeaderBg('header_bg_img',this.value)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px">표시 방식</div>
          <select style="width:100%" onchange="_setUdHeaderBg('header_bg_fit',this.value)">
            <option value="contain"${uhbgFit==='contain'?' selected':''}>맞춤</option>
            <option value="cover"${uhbgFit==='cover'?' selected':''}>채우기</option>
            <option value="fill"${uhbgFit==='fill'?' selected':''}>늘리기</option>
          </select>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:4px">크기 조절</div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="range" min="40" max="220" step="5" value="${uhbgScale}" style="flex:1;accent-color:var(--blue)" oninput="_setUdHeaderBg('header_bg_scale',this.value);document.getElementById('cfg-udh-scale').textContent=this.value+'%'">
            <span id="cfg-udh-scale" style="font-size:11px;color:var(--gray-l);min-width:40px;text-align:right;font-weight:800">${uhbgScale}%</span>
          </div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">개별 대학에 별도 배경을 넣지 않은 경우 기본값으로 사용됩니다.</div>
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
    <div style="margin-bottom:16px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">🎨 경기 상세 팀 헤더 색상</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">대학CK / 티어대회 / 프로리그 경기 상세 상단의 A팀·B팀 색상을 기본 대학색 대신 고정 색으로 덮어쓸 수 있습니다.</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px">
        <div style="padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--white)">
          <div style="font-size:11px;font-weight:900;color:var(--text2);margin-bottom:8px">🤝 대학CK</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <label style="min-width:48px;font-size:11px;font-weight:700;color:var(--text3)">A팀</label>
            <input type="color" value="${mdCkA}" style="width:42px;height:32px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer" onchange="_setMdTeamHeaderColor('ck','a',this.value)">
            <input type="text" value="${mdCkA}" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800" onblur="_setMdTeamHeaderColor('ck','a',this.value)">
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <label style="min-width:48px;font-size:11px;font-weight:700;color:var(--text3)">B팀</label>
            <input type="color" value="${mdCkB}" style="width:42px;height:32px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer" onchange="_setMdTeamHeaderColor('ck','b',this.value)">
            <input type="text" value="${mdCkB}" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800" onblur="_setMdTeamHeaderColor('ck','b',this.value)">
          </div>
        </div>
        <div style="padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--white)">
          <div style="font-size:11px;font-weight:900;color:var(--text2);margin-bottom:8px">🎯 티어대회</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <label style="min-width:48px;font-size:11px;font-weight:700;color:var(--text3)">A팀</label>
            <input type="color" value="${mdTtA}" style="width:42px;height:32px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer" onchange="_setMdTeamHeaderColor('tt','a',this.value)">
            <input type="text" value="${mdTtA}" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800" onblur="_setMdTeamHeaderColor('tt','a',this.value)">
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <label style="min-width:48px;font-size:11px;font-weight:700;color:var(--text3)">B팀</label>
            <input type="color" value="${mdTtB}" style="width:42px;height:32px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer" onchange="_setMdTeamHeaderColor('tt','b',this.value)">
            <input type="text" value="${mdTtB}" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800" onblur="_setMdTeamHeaderColor('tt','b',this.value)">
          </div>
        </div>
        <div style="padding:10px;border:1px solid var(--border);border-radius:10px;background:var(--white)">
          <div style="font-size:11px;font-weight:900;color:var(--text2);margin-bottom:8px">🏅 프로리그</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <label style="min-width:48px;font-size:11px;font-weight:700;color:var(--text3)">A팀</label>
            <input type="color" value="${mdProA}" style="width:42px;height:32px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer" onchange="_setMdTeamHeaderColor('pro','a',this.value)">
            <input type="text" value="${mdProA}" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800" onblur="_setMdTeamHeaderColor('pro','a',this.value)">
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <label style="min-width:48px;font-size:11px;font-weight:700;color:var(--text3)">B팀</label>
            <input type="color" value="${mdProB}" style="width:42px;height:32px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer" onchange="_setMdTeamHeaderColor('pro','b',this.value)">
            <input type="text" value="${mdProB}" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800" onblur="_setMdTeamHeaderColor('pro','b',this.value)">
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-w btn-xs" onclick="['su_md_team_hdr_ck_a','su_md_team_hdr_ck_b','su_md_team_hdr_tt_a','su_md_team_hdr_tt_b','su_md_team_hdr_pro_a','su_md_team_hdr_pro_b'].forEach(k=>localStorage.removeItem(k));try{ if(typeof _applyOpenHistDetailTeamHeaderColors==='function') _applyOpenHistDetailTeamHeaderColors(); }catch(e){}; _renderCfgPdSection(); try{ if(typeof render==='function') render(); }catch(e){}">🔄 기본값으로 초기화</button>
      </div>
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
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin:10px 0 6px">이미지 위치</div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">
        ${[
          ['left top','↖ 좌상'],['center top','↑ 상단'],['right top','↗ 우상'],
          ['left center','← 좌중'],['center center','• 중앙'],['right center','→ 우중'],
          ['left bottom','↙ 좌하'],['center bottom','↓ 하단'],['right bottom','↘ 우하']
        ].map(([pos,label])=>`<button class="btn btn-xs ${mdAvatarPos===pos?'btn-b':'btn-w'}"
          onclick="localStorage.setItem('su_md_avatar_pos_${_mdDevKey}','${pos}');try{if(typeof render==='function')render();}catch(e){};_renderCfgPdSection()">${label}</button>`).join('')}
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

function _pdTouchPrefs(){
  try{ if(typeof window.cfgTouchPrefsSync==='function') window.cfgTouchPrefsSync(); }catch(e){}
}
function _setPdFontSize(size){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.font_size=size;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  _renderCfgPdSection();
  try{_refreshOpenDetailModals();}catch(e){}
  _pdTouchPrefs();
}
function _setPdProfileSize(val){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.profile_size=parseInt(val)||100;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  try{_refreshOpenDetailModals();}catch(e){}
  _pdTouchPrefs();
}
function _setPdColorPreset(cp){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.color_preset=cp;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  _renderCfgPdSection();
  try{_refreshOpenDetailModals();}catch(e){}
  _pdTouchPrefs();
}
function _refreshOpenDetailModals(){
  try{
    const pst = (typeof getPlayerDetailState==='function') ? getPlayerDetailState() : null;
    if(pst?.currentName && document.getElementById('playerModal') && getComputedStyle(document.getElementById('playerModal')).display !== 'none'){
      if(typeof openPlayerModal==='function') openPlayerModal(pst.currentName);
    }
  }catch(e){}
  try{
    const ust = (typeof getUnivDetailState==='function') ? getUnivDetailState() : null;
    if(ust?.currentName && document.getElementById('univModal') && getComputedStyle(document.getElementById('univModal')).display !== 'none'){
      if(typeof openUnivModal==='function') openUnivModal(ust.currentName);
    }
  }catch(e){}
}
function _setPdHeaderBg(key,val){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  if(key==='header_bg_scale') s[key]=parseInt(val,10)||100;
  else s[key]=String(val||'').trim();
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  try{ _refreshOpenDetailModals(); }catch(e){}
  _pdTouchPrefs();
}
function _setUdHeaderBg(key,val){
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  if(key==='header_bg_scale') s[key]=parseInt(val,10)||100;
  else s[key]=String(val||'').trim();
  localStorage.setItem('su_ud_style',JSON.stringify(s));
  try{ _refreshOpenDetailModals(); }catch(e){}
  _pdTouchPrefs();
}
function _setMdTeamHeaderColor(mode, side, val){
  const modeKey = String(mode||'').trim();
  const sideKey = (String(side||'a').toLowerCase()==='b') ? 'b' : 'a';
  const raw = String(val||'').trim();
  const key = `su_md_team_hdr_${modeKey}_${sideKey}`;
  if(/^#[0-9a-fA-F]{6}$/.test(raw)) localStorage.setItem(key, raw);
  else localStorage.removeItem(key);
  try{ if(typeof _applyOpenHistDetailTeamHeaderColors==='function') _applyOpenHistDetailTeamHeaderColors(); }catch(e){}
  try{ if(typeof render==='function') render(); }catch(e){}
  try{ _renderCfgPdSection(); }catch(e){}
  _pdTouchPrefs();
}
function _setPdTint(type,val){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s[type+'_tint']=parseInt(val)||0;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  try{_refreshOpenDetailModals();}catch(e){}
  _pdTouchPrefs();
}
function _setPdUnivDarken(univ,val,idx){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  if(!s.univ_darken) s.univ_darken={};
  s.univ_darken[univ]=parseFloat(val)||0;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  const el=document.getElementById('pd-dv-'+idx);
  if(el) el.textContent=Math.round(val*100)+'%';
  try{_refreshOpenDetailModals();}catch(e){}
  _pdTouchPrefs();
}
function _setPdCloseOnBadge(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.close_on_badge=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  try{_refreshOpenDetailModals();}catch(e){}
  _pdTouchPrefs();
}
function _setPdCloseOnMatchPlayer(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.close_on_match_player=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  try{_refreshOpenDetailModals();}catch(e){}
  _pdTouchPrefs();
}
function _setPdHeaderClickClose(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.header_click_close=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  try{_refreshOpenDetailModals();}catch(e){}
  _pdTouchPrefs();
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
  window._setPdHeaderBg = _setPdHeaderBg;
  window._setUdHeaderBg = _setUdHeaderBg;
  window._setMdTeamHeaderColor = _setMdTeamHeaderColor;
}catch(e){}
