(function(){
  window.SettingsModules = window.SettingsModules || {};

  window._renderCardShapePicker = function(opts){
    const { idPrefix, current, onChangeFn, compact, allowInherit } = opts || {};
    const list = (typeof window._shareCardShapeOptions !== 'undefined') ? window._shareCardShapeOptions : [
      { v:'rounded', label:'기본 라운드', desc:'표준 둥근 모서리' },
      { v:'sharp',   label:'샤프 엣지',   desc:'각진 모서리' },
      { v:'soft',    label:'더 둥글게',   desc:'더 부드러운 모서리' },
      { v:'ribbon',  label:'리본컷',      desc:'우측 상단 비스듬히 컷' },
      { v:'tag',     label:'태그컷',      desc:'좌측 상단 비스듬히 컷' },
      { v:'ticket',  label:'티켓 노치',   desc:'좌우 중앙 둥근 홈' }
    ];
    const fullList = allowInherit ? [{ v:'inherit', label:'전역 따름', desc:'전역 카드 모양 설정을 그대로 사용' }, ...list] : list;
    const cur = current || (allowInherit?'inherit':'rounded');
    const previewMap = {
      inherit:'border-radius:24%;opacity:.35',
      rounded:'border-radius:24%',
      sharp:'border-radius:4%',
      soft:'border-radius:42%',
      ribbon:'border-radius:24%;clip-path:polygon(0% 0%,80% 0%,100% 18%,100% 100%,0% 100%)',
      tag:'border-radius:18%;clip-path:polygon(0% 28%,28% 0%,100% 0%,100% 100%,0% 100%)',
      ticket:'border-radius:24%;clip-path:polygon(0% 0%,100% 0%,100% 42%,88% 50%,100% 58%,100% 100%,0% 100%,0% 58%,12% 50%,0% 42%)'
    };
    const sz = compact ? 30 : 44;
    const pad = compact ? '8px 6px' : '10px 8px';
    const fsLabel = compact ? '10px' : '11px';
    const cols = allowInherit ? (compact?7:4) : (compact?6:3);
    return `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${compact?'4px':'8px'}">
      ${fullList.map(s=>{
        const sel = cur===s.v;
        return `<button type="button" title="${s.desc||''}" onclick="document.getElementById('${idPrefix}').value='${s.v}';${onChangeFn}()" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:${pad};border-radius:10px;border:${sel?'2px solid var(--blue)':'1px solid var(--border2)'};background:${sel?'linear-gradient(135deg,#eff6ff,#eef2ff)':'var(--white)'};cursor:pointer">
          <div style="width:${sz}px;height:${sz}px;background:linear-gradient(135deg,#6366f1,#a855f7);${previewMap[s.v]||previewMap.rounded};flex-shrink:0;box-shadow:0 2px 6px rgba(0,0,0,.12)"></div>
          ${compact?'':`<span style="font-size:${fsLabel};font-weight:900;color:${sel?'var(--blue)':'var(--text2)'}">${s.label}</span>`}
        </button>`;
      }).join('')}
    </div>
    <select id="${idPrefix}" style="display:none">${fullList.map(s=>`<option value="${s.v}" ${cur===s.v?'selected':''}>${s.label}</option>`).join('')}</select>`;
  };

  window.cfgSetShareCardSettings = function(){
    const mode = (document.getElementById('cfg-sc-mode')?.value || 'campus').trim();
    const color = parseInt(document.getElementById('cfg-sc-color')?.value||'72',10);
    const fx = parseInt(document.getElementById('cfg-sc-fx')?.value||'55',10);
    const winbg = parseInt(document.getElementById('cfg-sc-winbg')?.value||'55',10);
    const losergray = parseInt(document.getElementById('cfg-sc-losergray')?.value||'55',10);
    const profile = parseInt(document.getElementById('cfg-sc-profile')?.value||'100',10);
    const font = parseInt(document.getElementById('cfg-sc-font')?.value||'100',10);
    const heroBright = parseInt(document.getElementById('cfg-sc-hero-bright')?.value||'100',10);
    const loserPhotoBright = parseInt(document.getElementById('cfg-sc-loser-photo-bright')?.value||'88',10);
    const titleFont = parseInt(document.getElementById('cfg-sc-title-font')?.value||'100',10);
    const univFont = parseInt(document.getElementById('cfg-sc-univ-font')?.value||'100',10);
    const surface = (document.getElementById('cfg-sc-surface')?.value || 'glass').trim();
    const logoLayout = (document.getElementById('cfg-sc-logo-layout')?.value || 'stack').trim();
    const logoSize = parseInt(document.getElementById('cfg-sc-logo-size')?.value||'100',10);
    const logoFit = (document.getElementById('cfg-sc-logo-fit')?.value || 'contain').trim();
    const cardShape = (document.getElementById('cfg-sc-cardshape')?.value || 'rounded').trim();
    const entityLayout = (document.getElementById('cfg-sc-entity-layout')?.value || 'default').trim();
    const matchLayout = (document.getElementById('cfg-sc-match-layout')?.value || 'default').trim();
    try{ localStorage.setItem('su_sc_mode', ['campus','vivid','soft','dark','minimal','aurora','poster','mono','glacier','rose','midnight'].includes(mode)?mode:'campus'); }catch(e){}
    try{ localStorage.setItem('su_sc_color', String(Math.max(20,Math.min(100,color)))); }catch(e){}
    try{ localStorage.setItem('su_sc_fx', String(Math.max(0,Math.min(100,fx)))); }catch(e){}
    try{ localStorage.setItem('su_sc_winbg', String(Math.max(0,Math.min(100,winbg)))); }catch(e){}
    try{ localStorage.setItem('su_sc_losergray', String(Math.max(10,Math.min(90,losergray)))); }catch(e){}
    try{ localStorage.setItem('su_sc_profile_pct', String(Math.max(70,Math.min(145,profile)))); }catch(e){}
    try{ localStorage.setItem('su_sc_font_pct', String(Math.max(85,Math.min(135,font)))); }catch(e){}
    try{ localStorage.setItem('su_sc_hero_bright', String(Math.max(70,Math.min(135,heroBright)))); }catch(e){}
    try{ localStorage.setItem('su_sc_loser_photo_bright', String(Math.max(55,Math.min(120,loserPhotoBright)))); }catch(e){}
    try{ localStorage.setItem('su_sc_title_pct', String(Math.max(80,Math.min(150,titleFont)))); }catch(e){}
    try{ localStorage.setItem('su_sc_univ_pct', String(Math.max(80,Math.min(160,univFont)))); }catch(e){}
    try{ localStorage.setItem('su_sc_surface', ['glass','clean','solid'].includes(surface)?surface:'glass'); }catch(e){}
    try{ localStorage.setItem('su_sc_logo_layout', ['stack','inline','badge','cover'].includes(logoLayout)?logoLayout:'stack'); }catch(e){}
    try{ localStorage.setItem('su_sc_logo_size', String(Math.max(70,Math.min(150,logoSize)))); }catch(e){}
    try{ localStorage.setItem('su_sc_logo_fit', ['contain','cover','fill','zoom'].includes(logoFit)?logoFit:'contain'); }catch(e){}
    try{ localStorage.setItem('su_sc_cardshape', ['rounded','sharp','soft','ribbon','tag','ticket'].includes(cardShape)?cardShape:'rounded'); }catch(e){}
    try{ localStorage.setItem('su_sc_entity_layout', ['default','photocard','showcase','compact'].includes(entityLayout)?entityLayout:'default'); }catch(e){}
    try{ localStorage.setItem('su_sc_match_layout', ['default','spotlight','broadcast','compact'].includes(matchLayout)?matchLayout:'default'); }catch(e){}
    try{ if(typeof render === 'function') render(); }catch(e){}
    try{ if(typeof window.cfgTouchPrefsSync==='function') window.cfgTouchPrefsSync(); }catch(e){}
  };

  window.cfgPreviewShareCardMode = function(mode){
    const el=document.getElementById('cfg-sc-mode');
    if(el) el.value = ['campus','vivid','soft','dark','minimal','aurora','poster','mono','glacier','rose','midnight'].includes(mode)?mode:'campus';
    window.cfgSetShareCardSettings && window.cfgSetShareCardSettings();
  };

  window.cfgSetShareCardCategorySettings = function(kind){
    const t = String(kind||'').trim();
    if(!['player','univ','match'].includes(t)) return;
    const modeEl = document.getElementById(`cfg-sc-cat-mode-${t}`);
    const layoutEl = document.getElementById(`cfg-sc-cat-layout-${t}`);
    const mode = (modeEl?.value || 'inherit').trim();
    const layout = (layoutEl?.value || 'inherit').trim();
    const validModes = ['inherit','campus','vivid','soft','dark','minimal','aurora','poster','mono','glacier','rose','midnight'];
    try{
      if(mode==='inherit') localStorage.removeItem(`su_sc_mode_${t}`);
      else localStorage.setItem(`su_sc_mode_${t}`, validModes.includes(mode)?mode:'campus');
    }catch(e){}
    try{
      if(t==='match'){
        const validLayouts = ['inherit','default','spotlight','broadcast','compact'];
        if(layout==='inherit') localStorage.removeItem('su_sc_match_layout_match');
        else localStorage.setItem('su_sc_match_layout_match', validLayouts.includes(layout)?layout:'default');
      }else{
        const validLayouts = ['inherit','default','photocard','showcase','compact'];
        if(layout==='inherit') localStorage.removeItem(`su_sc_entity_layout_${t}`);
        else localStorage.setItem(`su_sc_entity_layout_${t}`, validLayouts.includes(layout)?layout:'default');
      }
    }catch(e){}
    try{ if(typeof render === 'function') render(); }catch(e){}
    try{ if(typeof window.cfgTouchPrefsSync==='function') window.cfgTouchPrefsSync(); }catch(e){}
  };

  window.buildShareCardSettingsSection = function(_scfgD){
    const _mode = (localStorage.getItem('su_sc_mode') ?? 'campus');
    const _modePlayer = (localStorage.getItem('su_sc_mode_player') ?? 'inherit');
    const _modeUniv = (localStorage.getItem('su_sc_mode_univ') ?? 'inherit');
    const _modeMatch = (localStorage.getItem('su_sc_mode_match') ?? 'inherit');
    const _color = parseInt(localStorage.getItem('su_sc_color') ?? '72',10) || 72;
    const _fx = parseInt(localStorage.getItem('su_sc_fx') ?? '55',10) || 55;
    const _winbg = parseInt(localStorage.getItem('su_sc_winbg') ?? '55',10) || 55;
    const _losergray = parseInt(localStorage.getItem('su_sc_losergray') ?? '55',10) || 55;
    const _profile = parseInt(localStorage.getItem('su_sc_profile_pct') ?? '100',10) || 100;
    const _font = parseInt(localStorage.getItem('su_sc_font_pct') ?? '100',10) || 100;
    const _heroBright = parseInt(localStorage.getItem('su_sc_hero_bright') ?? '100',10) || 100;
    const _loserPhotoBright = parseInt(localStorage.getItem('su_sc_loser_photo_bright') ?? '88',10) || 88;
    const _titleFont = parseInt(localStorage.getItem('su_sc_title_pct') ?? '100',10) || 100;
    const _univFont = parseInt(localStorage.getItem('su_sc_univ_pct') ?? '100',10) || 100;
    const _surface = (localStorage.getItem('su_sc_surface') ?? 'glass');
    const _entityLayout = (localStorage.getItem('su_sc_entity_layout') ?? 'default');
    const _matchLayout = (localStorage.getItem('su_sc_match_layout') ?? 'default');
    const _entityLayoutPlayer = (localStorage.getItem('su_sc_entity_layout_player') ?? 'inherit');
    const _entityLayoutUniv = (localStorage.getItem('su_sc_entity_layout_univ') ?? 'inherit');
    const _matchLayoutMatch = (localStorage.getItem('su_sc_match_layout_match') ?? 'inherit');
    const _cardShape = (localStorage.getItem('su_sc_cardshape') ?? 'rounded');
    const _shapeDef = (localStorage.getItem('su_sc_cardshape_default') ?? 'inherit');
    const _shapeCk = (localStorage.getItem('su_sc_cardshape_ck') ?? 'inherit');
    const _shapePro = (localStorage.getItem('su_sc_cardshape_pro') ?? 'inherit');
    const _shapeTt = (localStorage.getItem('su_sc_cardshape_tt') ?? 'inherit');
    const _shapeComp = (localStorage.getItem('su_sc_cardshape_comp') ?? 'inherit');
    const _shapeBkt = (localStorage.getItem('su_sc_cardshape_procomp-bkt') ?? 'inherit');
    const _ovDef = (localStorage.getItem('su_sc_mode_default') ?? 'inherit');
    const _ovCk = (localStorage.getItem('su_sc_mode_ck') ?? 'inherit');
    const _ovPro = (localStorage.getItem('su_sc_mode_pro') ?? 'inherit');
    const _ovTt = (localStorage.getItem('su_sc_mode_tt') ?? 'inherit');
    const _ovComp = (localStorage.getItem('su_sc_mode_comp') ?? 'inherit');
    const _ovBkt = (localStorage.getItem('su_sc_mode_procomp-bkt') ?? 'inherit');
    const _grayDef = (localStorage.getItem('su_sc_losergray_default') ?? 'inherit');
    const _grayCk = (localStorage.getItem('su_sc_losergray_ck') ?? 'inherit');
    const _grayPro = (localStorage.getItem('su_sc_losergray_pro') ?? 'inherit');
    const _grayTt = (localStorage.getItem('su_sc_losergray_tt') ?? 'inherit');
    const _grayComp = (localStorage.getItem('su_sc_losergray_comp') ?? 'inherit');
    const _grayBkt = (localStorage.getItem('su_sc_losergray_procomp-bkt') ?? 'inherit');
    const _profDef = (localStorage.getItem('su_sc_profile_pct_default') ?? 'inherit');
    const _profCk = (localStorage.getItem('su_sc_profile_pct_ck') ?? 'inherit');
    const _profPro = (localStorage.getItem('su_sc_profile_pct_pro') ?? 'inherit');
    const _profTt = (localStorage.getItem('su_sc_profile_pct_tt') ?? 'inherit');
    const _profComp = (localStorage.getItem('su_sc_profile_pct_comp') ?? 'inherit');
    const _profBkt = (localStorage.getItem('su_sc_profile_pct_procomp-bkt') ?? 'inherit');
    const _fontDef = (localStorage.getItem('su_sc_font_pct_default') ?? 'inherit');
    const _fontCk = (localStorage.getItem('su_sc_font_pct_ck') ?? 'inherit');
    const _fontPro = (localStorage.getItem('su_sc_font_pct_pro') ?? 'inherit');
    const _fontTt = (localStorage.getItem('su_sc_font_pct_tt') ?? 'inherit');
    const _fontComp = (localStorage.getItem('su_sc_font_pct_comp') ?? 'inherit');
    const _fontBkt = (localStorage.getItem('su_sc_font_pct_procomp-bkt') ?? 'inherit');
    return _scfgD('sharecard','🪪 공유카드 디자인') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">스트리머/대학/개인전/끝장전/대학대전/대회/티어대회 공유카드의 전역 톤과 색상 효과를 한 번에 조절합니다.</div>
    <div style="padding:12px;background:linear-gradient(180deg,var(--surface),var(--white));border:1px solid var(--border);border-radius:12px;display:flex;flex-direction:column;gap:10px;margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
        <div style="font-size:12px;font-weight:900;color:var(--text2)">🗂️ 카테고리별 공유카드 설정</div>
        <div style="font-size:10px;color:var(--gray-l);font-weight:800">전역 설정과 별도로 카드 종류별 디자인/레이아웃을 따로 저장</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
        ${[
          ['player','🎬 스트리머 공유카드',_modePlayer,_entityLayoutPlayer,'player'],
          ['univ','🏫 대학 공유카드',_modeUniv,_entityLayoutUniv,'univ'],
          ['match','🎮 경기 공유카드',_modeMatch,_matchLayoutMatch,'match']
        ].map(([key,title,modeVal,layoutVal,kind])=>`
          <div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white);display:flex;flex-direction:column;gap:8px">
            <div style="font-size:12px;font-weight:900;color:var(--text2)">${title}</div>
            <div style="font-size:10px;color:var(--gray-l);font-weight:700">${key==='match'?'경기 결과 공유카드 전용 디자인/배치':'전역 공유카드와 별도로 이 카드 타입만 따로 적용'}</div>
            <div>
              <div style="font-size:10px;color:var(--text3);font-weight:800;margin-bottom:4px">디자인 모드</div>
              <select id="cfg-sc-cat-mode-${kind}" onchange="cfgSetShareCardCategorySettings('${kind}')" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
                <option value="inherit" ${modeVal==='inherit'?'selected':''}>전역 따름</option>
                <option value="campus" ${modeVal==='campus'?'selected':''}>캠퍼스</option>
                <option value="vivid" ${modeVal==='vivid'?'selected':''}>비비드</option>
                <option value="soft" ${modeVal==='soft'?'selected':''}>소프트</option>
                <option value="dark" ${modeVal==='dark'?'selected':''}>다크</option>
                <option value="minimal" ${modeVal==='minimal'?'selected':''}>미니멀</option>
                <option value="aurora" ${modeVal==='aurora'?'selected':''}>오로라</option>
                <option value="poster" ${modeVal==='poster'?'selected':''}>포스터</option>
                <option value="mono" ${modeVal==='mono'?'selected':''}>모노</option>
                <option value="glacier" ${modeVal==='glacier'?'selected':''}>글레이셔</option>
                <option value="rose" ${modeVal==='rose'?'selected':''}>로즈</option>
                <option value="midnight" ${modeVal==='midnight'?'selected':''}>미드나잇</option>
              </select>
            </div>
            <div>
              <div style="font-size:10px;color:var(--text3);font-weight:800;margin-bottom:4px">레이아웃 모드</div>
              ${key==='match'
                ? `<select id="cfg-sc-cat-layout-${kind}" onchange="cfgSetShareCardCategorySettings('${kind}')" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
                    <option value="inherit" ${layoutVal==='inherit'?'selected':''}>전역 따름</option>
                    <option value="default" ${layoutVal==='default'?'selected':''}>기본형</option>
                    <option value="spotlight" ${layoutVal==='spotlight'?'selected':''}>스포트라이트형</option>
                    <option value="broadcast" ${layoutVal==='broadcast'?'selected':''}>브로드캐스트형</option>
                    <option value="compact" ${layoutVal==='compact'?'selected':''}>컴팩트형</option>
                  </select>`
                : `<select id="cfg-sc-cat-layout-${kind}" onchange="cfgSetShareCardCategorySettings('${kind}')" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
                    <option value="inherit" ${layoutVal==='inherit'?'selected':''}>전역 따름</option>
                    <option value="default" ${layoutVal==='default'?'selected':''}>기본형</option>
                    <option value="photocard" ${layoutVal==='photocard'?'selected':''}>포토카드형</option>
                    <option value="showcase" ${layoutVal==='showcase'?'selected':''}>쇼케이스형</option>
                    <option value="compact" ${layoutVal==='compact'?'selected':''}>컴팩트형</option>
                  </select>`
              }
            </div>
          </div>`).join('')}
      </div>
    </div>
    <div style="padding:12px;background:linear-gradient(135deg,var(--surface),rgba(255,255,255,.92));border:1px solid var(--border);border-radius:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px;margin-bottom:12px">
      <button type="button" class="btn btn-w no-export" onclick="cfgGo('boardchip')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white)">
        <span style="font-size:16px;line-height:1">🏷️</span>
        <span style="font-size:12px;font-weight:900;color:var(--text2)">현황판 프로필/칩</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">프로필 크기, 대학 로고, 칩 크기</span>
      </button>
      <button type="button" class="btn btn-w no-export" onclick="cfgGo('boardbg')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white)">
        <span style="font-size:16px;line-height:1">🖼️</span>
        <span style="font-size:12px;font-weight:900;color:var(--text2)">현황판 배경</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">배경 이미지, 라벨 배경, 표시 방식</span>
      </button>
      <button type="button" class="btn btn-w no-export" onclick="cfgGo('oldbright')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white)">
        <span style="font-size:16px;line-height:1">✨</span>
        <span style="font-size:12px;font-weight:900;color:var(--text2)">현황판 밝기</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">카드 배경/라벨 밝기 세부 조절</span>
      </button>
      <button type="button" class="btn btn-w no-export" onclick="cfgGo('profileshape')" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:12px;border-radius:14px;text-align:left;background:var(--white)">
        <span style="font-size:16px;line-height:1">🖼️</span>
        <span style="font-size:12px;font-weight:900;color:var(--text2)">프로필 공통 모양</span>
        <span style="font-size:10px;color:var(--gray-l);font-weight:700">원형/라운드/공통 모양 설정</span>
      </button>
    </div>
    <div style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">모드 미리보기</div>
        <button class="btn btn-sm btn-w" onclick="cfgPreviewShareCardMode('campus')">캠퍼스</button>
        <button class="btn btn-sm btn-w" onclick="cfgPreviewShareCardMode('vivid')">비비드</button>
        <button class="btn btn-sm btn-w" onclick="cfgPreviewShareCardMode('soft')">소프트</button>
        <button class="btn btn-sm btn-w" onclick="cfgPreviewShareCardMode('dark')">다크</button>
        <button class="btn btn-sm btn-w" onclick="cfgPreviewShareCardMode('minimal')">미니멀</button>
        <button class="btn btn-sm btn-w" onclick="cfgPreviewShareCardMode('aurora')">오로라</button>
        <button class="btn btn-sm btn-w" onclick="cfgPreviewShareCardMode('poster')">포스터</button>
        <button class="btn btn-sm btn-w" onclick="cfgPreviewShareCardMode('mono')">모노</button>
        <button class="btn btn-sm btn-w" onclick="cfgPreviewShareCardMode('glacier')">글레이셔</button>
        <button class="btn btn-sm btn-w" onclick="cfgPreviewShareCardMode('rose')">로즈</button>
        <button class="btn btn-sm btn-w" onclick="cfgPreviewShareCardMode('midnight')">미드나잇</button>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">디자인 모드</div>
        <select id="cfg-sc-mode" onchange="cfgSetShareCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="campus" ${_mode==='campus'?'selected':''}>캠퍼스 컬러</option>
          <option value="vivid" ${_mode==='vivid'?'selected':''}>비비드</option>
          <option value="soft" ${_mode==='soft'?'selected':''}>소프트</option>
          <option value="dark" ${_mode==='dark'?'selected':''}>다크</option>
          <option value="minimal" ${_mode==='minimal'?'selected':''}>미니멀</option>
          <option value="aurora" ${_mode==='aurora'?'selected':''}>오로라</option>
          <option value="poster" ${_mode==='poster'?'selected':''}>포스터</option>
          <option value="mono" ${_mode==='mono'?'selected':''}>모노</option>
          <option value="glacier" ${_mode==='glacier'?'selected':''}>글레이셔</option>
          <option value="rose" ${_mode==='rose'?'selected':''}>로즈</option>
          <option value="midnight" ${_mode==='midnight'?'selected':''}>미드나잇</option>
        </select>
        <span style="font-size:11px;color:var(--gray-l)">대학색 중심 정도와 대비감을 바꿉니다.</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:end">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">스트리머/대학 공유카드 레이아웃</div>
          <select id="cfg-sc-entity-layout" onchange="cfgSetShareCardSettings()" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
            <option value="default" ${_entityLayout==='default'?'selected':''}>기본형</option>
            <option value="photocard" ${_entityLayout==='photocard'?'selected':''}>포토카드형</option>
            <option value="showcase" ${_entityLayout==='showcase'?'selected':''}>쇼케이스형</option>
            <option value="compact" ${_entityLayout==='compact'?'selected':''}>컴팩트형</option>
          </select>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">경기 공유카드 레이아웃</div>
          <select id="cfg-sc-match-layout" onchange="cfgSetShareCardSettings()" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
            <option value="default" ${_matchLayout==='default'?'selected':''}>기본형</option>
            <option value="spotlight" ${_matchLayout==='spotlight'?'selected':''}>스포트라이트형</option>
            <option value="broadcast" ${_matchLayout==='broadcast'?'selected':''}>브로드캐스트형</option>
            <option value="compact" ${_matchLayout==='compact'?'selected':''}>컴팩트형</option>
          </select>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">표면 스타일</div>
        <select id="cfg-sc-surface" onchange="cfgSetShareCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="glass" ${_surface==='glass'?'selected':''}>글래스</option>
          <option value="clean" ${_surface==='clean'?'selected':''}>클린</option>
          <option value="solid" ${_surface==='solid'?'selected':''}>솔리드</option>
        </select>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="font-size:11px;color:var(--text3);font-weight:800">카드 모양 <span style="color:var(--gray-l);font-weight:600">— 공유카드 바깥 테두리 형태</span></div>
        ${window._renderCardShapePicker({idPrefix:'cfg-sc-cardshape', current:_cardShape, onChangeFn:'cfgSetShareCardSettings', compact:false, allowInherit:false})}
        <div style="display:flex;align-items:center;gap:10px;margin-top:4px">
          <div id="cfg-sc-cardshape-preview" style="width:120px;height:72px;flex-shrink:0;${(()=>{const sh=(typeof window._shareCardShapeStyle==='function')?window._shareCardShapeStyle(_cardShape):{radius:'24px',clip:'none'};return `border-radius:${sh.radius};${sh.clip!=='none'?`clip-path:${sh.clip};`:''}`;})()}background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 52%,#7c3aed 100%);box-shadow:0 8px 18px rgba(15,23,42,.22)"></div>
          <div style="font-size:10px;color:var(--gray-l)">실제 공유카드 헤더 모서리가 이렇게 깎입니다. (장식·라벨 위치는 자동으로 안쪽으로 보정됩니다)</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">대학색 강조 강도</div>
          <input type="range" id="cfg-sc-color" min="20" max="100" step="5" value="${Math.max(20,Math.min(100,_color))}" oninput="document.getElementById('cfg-sc-color-v').textContent=this.value+'%'" onchange="cfgSetShareCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-sc-color-v">${Math.max(20,Math.min(100,_color))}%</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">빛/그라디언트 효과</div>
          <input type="range" id="cfg-sc-fx" min="0" max="100" step="5" value="${Math.max(0,Math.min(100,_fx))}" oninput="document.getElementById('cfg-sc-fx-v').textContent=this.value+'%'" onchange="cfgSetShareCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-sc-fx-v">${Math.max(0,Math.min(100,_fx))}%</span></div>
        </div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">승자팀 배경색 강도</div>
        <input type="range" id="cfg-sc-winbg" min="0" max="100" step="5" value="${Math.max(0,Math.min(100,_winbg))}" oninput="document.getElementById('cfg-sc-winbg-v').textContent=this.value+'%'" onchange="cfgSetShareCardSettings()" style="width:100%">
        <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-sc-winbg-v">${Math.max(0,Math.min(100,_winbg))}%</span></div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">패자 회색 강도</div>
        <input type="range" id="cfg-sc-losergray" min="10" max="90" step="5" value="${Math.max(10,Math.min(90,_losergray))}" oninput="document.getElementById('cfg-sc-losergray-v').textContent=this.value+'%'" onchange="cfgSetShareCardSettings()" style="width:100%">
        <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-sc-losergray-v">${Math.max(10,Math.min(90,_losergray))}%</span></div>
      </div>
      <div style="padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:800;color:var(--text2);font-size:11px">
          <input type="checkbox" id="cfg-sc-show-tally" ${((localStorage.getItem('su_sc_show_tally') ?? '0')==='1')?'checked':''} style="width:16px;height:16px;cursor:pointer"
            onchange="localStorage.setItem('su_sc_show_tally', this.checked?'1':'0'); try{if(typeof render==='function')render();}catch(e){}; try{if(typeof window.cfgTouchPrefsSync==='function')window.cfgTouchPrefsSync();}catch(e){}">
          이번 경기 개인 기록(몇승 몇패) 표시
          <span style="font-size:10px;color:var(--gray-l);font-weight:600">— 대학대전/대회/티어대회/프로리그/미니대전 공유카드에 참가자별 승패 칩 추가</span>
        </label>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">공유카드 전용 프로필 이미지 크기</div>
        <input type="range" id="cfg-sc-profile" min="70" max="145" step="5" value="${Math.max(70,Math.min(145,_profile))}" oninput="document.getElementById('cfg-sc-profile-v').textContent=this.value+'%'" onchange="cfgSetShareCardSettings()" style="width:100%">
        <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-sc-profile-v">${Math.max(70,Math.min(145,_profile))}%</span></div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">공유카드 전용 폰트 크기</div>
        <input type="range" id="cfg-sc-font" min="85" max="135" step="5" value="${Math.max(85,Math.min(135,_font))}" oninput="document.getElementById('cfg-sc-font-v').textContent=this.value+'%'" onchange="cfgSetShareCardSettings()" style="width:100%">
        <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-sc-font-v">${Math.max(85,Math.min(135,_font))}%</span></div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">상단 프로필 이미지 밝기</div>
        <input type="range" id="cfg-sc-hero-bright" min="70" max="135" step="5" value="${Math.max(70,Math.min(135,_heroBright))}" oninput="document.getElementById('cfg-sc-hero-bright-v').textContent=this.value+'%'" onchange="cfgSetShareCardSettings()" style="width:100%">
        <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-sc-hero-bright-v">${Math.max(70,Math.min(135,_heroBright))}%</span></div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">패자 프로필 밝기</div>
        <input type="range" id="cfg-sc-loser-photo-bright" min="55" max="120" step="5" value="${Math.max(55,Math.min(120,_loserPhotoBright))}" oninput="document.getElementById('cfg-sc-loser-photo-bright-v').textContent=this.value+'%'" onchange="cfgSetShareCardSettings()" style="width:100%">
        <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-sc-loser-photo-bright-v">${Math.max(55,Math.min(120,_loserPhotoBright))}%</span></div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">상단 스트리머 이름 크기</div>
        <input type="range" id="cfg-sc-title-font" min="80" max="150" step="5" value="${Math.max(80,Math.min(150,_titleFont))}" oninput="document.getElementById('cfg-sc-title-font-v').textContent=this.value+'%'" onchange="cfgSetShareCardSettings()" style="width:100%">
        <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-sc-title-font-v">${Math.max(80,Math.min(150,_titleFont))}%</span></div>
      </div>
      <div>
        <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">상단 대학명 크기</div>
        <input type="range" id="cfg-sc-univ-font" min="80" max="160" step="5" value="${Math.max(80,Math.min(160,_univFont))}" oninput="document.getElementById('cfg-sc-univ-font-v').textContent=this.value+'%'" onchange="cfgSetShareCardSettings()" style="width:100%">
        <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-sc-univ-font-v">${Math.max(80,Math.min(160,_univFont))}%</span></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;align-items:end">
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">미니대전/대학대전 로고 배치</div>
          <select id="cfg-sc-logo-layout" onchange="cfgSetShareCardSettings()" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
            <option value="stack" ${(localStorage.getItem('su_sc_logo_layout')||'stack')==='stack'?'selected':''}>세로형</option>
            <option value="inline" ${(localStorage.getItem('su_sc_logo_layout')||'stack')==='inline'?'selected':''}>가로형</option>
            <option value="badge" ${(localStorage.getItem('su_sc_logo_layout')||'stack')==='badge'?'selected':''}>배지형</option>
            <option value="cover" ${(localStorage.getItem('su_sc_logo_layout')||'stack')==='cover'?'selected':''}>카드 채움형</option>
          </select>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">미니대전/대학대전 로고 크기</div>
          <input type="range" id="cfg-sc-logo-size" min="70" max="150" step="5" value="${Math.max(70,Math.min(150,parseInt(localStorage.getItem('su_sc_logo_size')||'100',10)||100))}" oninput="document.getElementById('cfg-sc-logo-size-v').textContent=this.value+'%'" onchange="cfgSetShareCardSettings()" style="width:100%">
          <div style="font-size:11px;color:var(--gray-l)"><span id="cfg-sc-logo-size-v">${Math.max(70,Math.min(150,parseInt(localStorage.getItem('su_sc_logo_size')||'100',10)||100))}%</span></div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);font-weight:800;margin-bottom:4px">미니대전/대학대전 로고 맞춤</div>
          <select id="cfg-sc-logo-fit" onchange="cfgSetShareCardSettings()" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
            <option value="contain" ${(localStorage.getItem('su_sc_logo_fit')||'contain')==='contain'?'selected':''}>맞춤</option>
            <option value="cover" ${(localStorage.getItem('su_sc_logo_fit')||'contain')==='cover'?'selected':''}>채우기</option>
            <option value="fill" ${(localStorage.getItem('su_sc_logo_fit')||'contain')==='fill'?'selected':''}>늘리기</option>
            <option value="zoom" ${(localStorage.getItem('su_sc_logo_fit')||'contain')==='zoom'?'selected':''}>확대</option>
          </select>
        </div>
      </div>
      <div style="padding:12px;background:var(--white);border:1px solid var(--border);border-radius:10px;display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <div style="font-size:11px;color:var(--text3);font-weight:900">카드 타입별 개별 오버라이드</div>
          <button type="button" class="btn btn-xs btn-w" onclick="document.querySelectorAll('.sc-ov-type').forEach(d=>d.open=!d.open)">전체 펼치기/접기</button>
        </div>
        <div style="font-size:11px;color:var(--gray-l)">전역 설정과 다르게 개인전/끝장전 · CK · 프로리그 · 티어대회 · 대회 · 프로리그 대회 카드에 별도 모드, 패자 회색 강도, 프로필/폰트 크기, 카드 모양(라운드/샤프/리본컷/태그컷/티켓노치)을 적용할 수 있습니다.</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
          <details class="sc-ov-type" style="border:1px solid var(--border2);border-radius:10px;background:var(--white)">
            <summary style="cursor:pointer;padding:8px 10px;font-size:11px;font-weight:800;color:var(--text3);list-style:none">개인전 / 끝장전</summary>
            <div style="padding:0 10px 10px">
            <select id="cfg-sc-ov-def" onchange="cfgSetShareCardOverrides()" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
              <option value="inherit" ${_ovDef==='inherit'?'selected':''}>전역 따름</option><option value="campus" ${_ovDef==='campus'?'selected':''}>캠퍼스</option><option value="vivid" ${_ovDef==='vivid'?'selected':''}>비비드</option><option value="soft" ${_ovDef==='soft'?'selected':''}>소프트</option><option value="dark" ${_ovDef==='dark'?'selected':''}>다크</option><option value="minimal" ${_ovDef==='minimal'?'selected':''}>미니멀</option><option value="aurora" ${_ovDef==='aurora'?'selected':''}>오로라</option><option value="poster" ${_ovDef==='poster'?'selected':''}>포스터</option><option value="mono" ${_ovDef==='mono'?'selected':''}>모노</option>
            </select>
            <select id="cfg-sc-gray-def" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_grayDef==='inherit'?'selected':''}>패자 회색: 전역 따름</option><option value="30" ${_grayDef==='30'?'selected':''}>패자 회색 약함</option><option value="55" ${_grayDef==='55'?'selected':''}>패자 회색 보통</option><option value="75" ${_grayDef==='75'?'selected':''}>패자 회색 강함</option>
            </select>
            <select id="cfg-sc-prof-def" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_profDef==='inherit'?'selected':''}>프로필 크기: 전역 따름</option><option value="90" ${_profDef==='90'?'selected':''}>프로필 작게</option><option value="100" ${_profDef==='100'?'selected':''}>프로필 보통</option><option value="120" ${_profDef==='120'?'selected':''}>프로필 크게</option>
            </select>
            <select id="cfg-sc-font-def" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_fontDef==='inherit'?'selected':''}>폰트 크기: 전역 따름</option><option value="90" ${_fontDef==='90'?'selected':''}>폰트 작게</option><option value="100" ${_fontDef==='100'?'selected':''}>폰트 보통</option><option value="115" ${_fontDef==='115'?'selected':''}>폰트 크게</option>
            </select>
            <div style="margin-top:6px">${window._renderCardShapePicker({idPrefix:'cfg-sc-shape-def', current:_shapeDef, onChangeFn:'cfgSetShareCardOverrides', compact:true, allowInherit:true})}</div>
            </div>
          </details>
          <details class="sc-ov-type" style="border:1px solid var(--border2);border-radius:10px;background:var(--white)">
            <summary style="cursor:pointer;padding:8px 10px;font-size:11px;font-weight:800;color:var(--text3);list-style:none">대학 CK</summary>
            <div style="padding:0 10px 10px">
            <select id="cfg-sc-ov-ck" onchange="cfgSetShareCardOverrides()" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
              <option value="inherit" ${_ovCk==='inherit'?'selected':''}>전역 따름</option><option value="campus" ${_ovCk==='campus'?'selected':''}>캠퍼스</option><option value="vivid" ${_ovCk==='vivid'?'selected':''}>비비드</option><option value="soft" ${_ovCk==='soft'?'selected':''}>소프트</option><option value="dark" ${_ovCk==='dark'?'selected':''}>다크</option><option value="minimal" ${_ovCk==='minimal'?'selected':''}>미니멀</option><option value="aurora" ${_ovCk==='aurora'?'selected':''}>오로라</option><option value="poster" ${_ovCk==='poster'?'selected':''}>포스터</option><option value="mono" ${_ovCk==='mono'?'selected':''}>모노</option>
            </select>
            <select id="cfg-sc-gray-ck" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_grayCk==='inherit'?'selected':''}>패자 회색: 전역 따름</option><option value="30" ${_grayCk==='30'?'selected':''}>패자 회색 약함</option><option value="55" ${_grayCk==='55'?'selected':''}>패자 회색 보통</option><option value="75" ${_grayCk==='75'?'selected':''}>패자 회색 강함</option>
            </select>
            <select id="cfg-sc-prof-ck" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_profCk==='inherit'?'selected':''}>프로필 크기: 전역 따름</option><option value="90" ${_profCk==='90'?'selected':''}>프로필 작게</option><option value="100" ${_profCk==='100'?'selected':''}>프로필 보통</option><option value="120" ${_profCk==='120'?'selected':''}>프로필 크게</option>
            </select>
            <select id="cfg-sc-font-ck" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_fontCk==='inherit'?'selected':''}>폰트 크기: 전역 따름</option><option value="90" ${_fontCk==='90'?'selected':''}>폰트 작게</option><option value="100" ${_fontCk==='100'?'selected':''}>폰트 보통</option><option value="115" ${_fontCk==='115'?'selected':''}>폰트 크게</option>
            </select>
            <div style="margin-top:6px">${window._renderCardShapePicker({idPrefix:'cfg-sc-shape-ck', current:_shapeCk, onChangeFn:'cfgSetShareCardOverrides', compact:true, allowInherit:true})}</div>
            </div>
          </details>
          <details class="sc-ov-type" style="border:1px solid var(--border2);border-radius:10px;background:var(--white)">
            <summary style="cursor:pointer;padding:8px 10px;font-size:11px;font-weight:800;color:var(--text3);list-style:none">프로리그</summary>
            <div style="padding:0 10px 10px">
            <select id="cfg-sc-ov-pro" onchange="cfgSetShareCardOverrides()" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
              <option value="inherit" ${_ovPro==='inherit'?'selected':''}>전역 따름</option><option value="campus" ${_ovPro==='campus'?'selected':''}>캠퍼스</option><option value="vivid" ${_ovPro==='vivid'?'selected':''}>비비드</option><option value="soft" ${_ovPro==='soft'?'selected':''}>소프트</option><option value="dark" ${_ovPro==='dark'?'selected':''}>다크</option><option value="minimal" ${_ovPro==='minimal'?'selected':''}>미니멀</option><option value="aurora" ${_ovPro==='aurora'?'selected':''}>오로라</option><option value="poster" ${_ovPro==='poster'?'selected':''}>포스터</option><option value="mono" ${_ovPro==='mono'?'selected':''}>모노</option>
            </select>
            <select id="cfg-sc-gray-pro" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_grayPro==='inherit'?'selected':''}>패자 회색: 전역 따름</option><option value="30" ${_grayPro==='30'?'selected':''}>패자 회색 약함</option><option value="55" ${_grayPro==='55'?'selected':''}>패자 회색 보통</option><option value="75" ${_grayPro==='75'?'selected':''}>패자 회색 강함</option>
            </select>
            <select id="cfg-sc-prof-pro" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_profPro==='inherit'?'selected':''}>프로필 크기: 전역 따름</option><option value="90" ${_profPro==='90'?'selected':''}>프로필 작게</option><option value="100" ${_profPro==='100'?'selected':''}>프로필 보통</option><option value="120" ${_profPro==='120'?'selected':''}>프로필 크게</option>
            </select>
            <select id="cfg-sc-font-pro" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_fontPro==='inherit'?'selected':''}>폰트 크기: 전역 따름</option><option value="90" ${_fontPro==='90'?'selected':''}>폰트 작게</option><option value="100" ${_fontPro==='100'?'selected':''}>폰트 보통</option><option value="115" ${_fontPro==='115'?'selected':''}>폰트 크게</option>
            </select>
            <div style="margin-top:6px">${window._renderCardShapePicker({idPrefix:'cfg-sc-shape-pro', current:_shapePro, onChangeFn:'cfgSetShareCardOverrides', compact:true, allowInherit:true})}</div>
            </div>
          </details>
          <details class="sc-ov-type" style="border:1px solid var(--border2);border-radius:10px;background:var(--white)">
            <summary style="cursor:pointer;padding:8px 10px;font-size:11px;font-weight:800;color:var(--text3);list-style:none">티어대회</summary>
            <div style="padding:0 10px 10px">
            <select id="cfg-sc-ov-tt" onchange="cfgSetShareCardOverrides()" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
              <option value="inherit" ${_ovTt==='inherit'?'selected':''}>전역 따름</option><option value="campus" ${_ovTt==='campus'?'selected':''}>캠퍼스</option><option value="vivid" ${_ovTt==='vivid'?'selected':''}>비비드</option><option value="soft" ${_ovTt==='soft'?'selected':''}>소프트</option><option value="dark" ${_ovTt==='dark'?'selected':''}>다크</option><option value="minimal" ${_ovTt==='minimal'?'selected':''}>미니멀</option><option value="aurora" ${_ovTt==='aurora'?'selected':''}>오로라</option><option value="poster" ${_ovTt==='poster'?'selected':''}>포스터</option><option value="mono" ${_ovTt==='mono'?'selected':''}>모노</option>
            </select>
            <select id="cfg-sc-gray-tt" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_grayTt==='inherit'?'selected':''}>패자 회색: 전역 따름</option><option value="30" ${_grayTt==='30'?'selected':''}>패자 회색 약함</option><option value="55" ${_grayTt==='55'?'selected':''}>패자 회색 보통</option><option value="75" ${_grayTt==='75'?'selected':''}>패자 회색 강함</option>
            </select>
            <select id="cfg-sc-prof-tt" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_profTt==='inherit'?'selected':''}>프로필 크기: 전역 따름</option><option value="90" ${_profTt==='90'?'selected':''}>프로필 작게</option><option value="100" ${_profTt==='100'?'selected':''}>프로필 보통</option><option value="120" ${_profTt==='120'?'selected':''}>프로필 크게</option>
            </select>
            <select id="cfg-sc-font-tt" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_fontTt==='inherit'?'selected':''}>폰트 크기: 전역 따름</option><option value="90" ${_fontTt==='90'?'selected':''}>폰트 작게</option><option value="100" ${_fontTt==='100'?'selected':''}>폰트 보통</option><option value="115" ${_fontTt==='115'?'selected':''}>폰트 크게</option>
            </select>
            <div style="margin-top:6px">${window._renderCardShapePicker({idPrefix:'cfg-sc-shape-tt', current:_shapeTt, onChangeFn:'cfgSetShareCardOverrides', compact:true, allowInherit:true})}</div>
            </div>
          </details>
          <details class="sc-ov-type" style="border:1px solid var(--border2);border-radius:10px;background:var(--white)">
            <summary style="cursor:pointer;padding:8px 10px;font-size:11px;font-weight:800;color:var(--text3);list-style:none">대회/토너먼트</summary>
            <div style="padding:0 10px 10px">
            <select id="cfg-sc-ov-comp" onchange="cfgSetShareCardOverrides()" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
              <option value="inherit" ${_ovComp==='inherit'?'selected':''}>전역 따름</option><option value="campus" ${_ovComp==='campus'?'selected':''}>캠퍼스</option><option value="vivid" ${_ovComp==='vivid'?'selected':''}>비비드</option><option value="soft" ${_ovComp==='soft'?'selected':''}>소프트</option><option value="dark" ${_ovComp==='dark'?'selected':''}>다크</option><option value="minimal" ${_ovComp==='minimal'?'selected':''}>미니멀</option><option value="aurora" ${_ovComp==='aurora'?'selected':''}>오로라</option><option value="poster" ${_ovComp==='poster'?'selected':''}>포스터</option><option value="mono" ${_ovComp==='mono'?'selected':''}>모노</option>
            </select>
            <select id="cfg-sc-gray-comp" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_grayComp==='inherit'?'selected':''}>패자 회색: 전역 따름</option><option value="30" ${_grayComp==='30'?'selected':''}>패자 회색 약함</option><option value="55" ${_grayComp==='55'?'selected':''}>패자 회색 보통</option><option value="75" ${_grayComp==='75'?'selected':''}>패자 회색 강함</option>
            </select>
            <select id="cfg-sc-prof-comp" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_profComp==='inherit'?'selected':''}>프로필 크기: 전역 따름</option><option value="90" ${_profComp==='90'?'selected':''}>프로필 작게</option><option value="100" ${_profComp==='100'?'selected':''}>프로필 보통</option><option value="120" ${_profComp==='120'?'selected':''}>프로필 크게</option>
            </select>
            <select id="cfg-sc-font-comp" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_fontComp==='inherit'?'selected':''}>폰트 크기: 전역 따름</option><option value="90" ${_fontComp==='90'?'selected':''}>폰트 작게</option><option value="100" ${_fontComp==='100'?'selected':''}>폰트 보통</option><option value="115" ${_fontComp==='115'?'selected':''}>폰트 크게</option>
            </select>
            <div style="margin-top:6px">${window._renderCardShapePicker({idPrefix:'cfg-sc-shape-comp', current:_shapeComp, onChangeFn:'cfgSetShareCardOverrides', compact:true, allowInherit:true})}</div>
            </div>
          </details>
          <details class="sc-ov-type" style="border:1px solid var(--border2);border-radius:10px;background:var(--white)">
            <summary style="cursor:pointer;padding:8px 10px;font-size:11px;font-weight:800;color:var(--text3);list-style:none">프로리그 대회</summary>
            <div style="padding:0 10px 10px">
            <select id="cfg-sc-ov-bkt" onchange="cfgSetShareCardOverrides()" style="width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
              <option value="inherit" ${_ovBkt==='inherit'?'selected':''}>전역 따름</option><option value="campus" ${_ovBkt==='campus'?'selected':''}>캠퍼스</option><option value="vivid" ${_ovBkt==='vivid'?'selected':''}>비비드</option><option value="soft" ${_ovBkt==='soft'?'selected':''}>소프트</option><option value="dark" ${_ovBkt==='dark'?'selected':''}>다크</option><option value="minimal" ${_ovBkt==='minimal'?'selected':''}>미니멀</option><option value="aurora" ${_ovBkt==='aurora'?'selected':''}>오로라</option><option value="poster" ${_ovBkt==='poster'?'selected':''}>포스터</option><option value="mono" ${_ovBkt==='mono'?'selected':''}>모노</option>
            </select>
            <select id="cfg-sc-gray-bkt" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_grayBkt==='inherit'?'selected':''}>패자 회색: 전역 따름</option><option value="30" ${_grayBkt==='30'?'selected':''}>패자 회색 약함</option><option value="55" ${_grayBkt==='55'?'selected':''}>패자 회색 보통</option><option value="75" ${_grayBkt==='75'?'selected':''}>패자 회색 강함</option>
            </select>
            <select id="cfg-sc-prof-bkt" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_profBkt==='inherit'?'selected':''}>프로필 크기: 전역 따름</option><option value="90" ${_profBkt==='90'?'selected':''}>프로필 작게</option><option value="100" ${_profBkt==='100'?'selected':''}>프로필 보통</option><option value="120" ${_profBkt==='120'?'selected':''}>프로필 크게</option>
            </select>
            <select id="cfg-sc-font-bkt" onchange="cfgSetShareCardOverrides()" style="margin-top:6px;width:100%;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:800">
              <option value="inherit" ${_fontBkt==='inherit'?'selected':''}>폰트 크기: 전역 따름</option><option value="90" ${_fontBkt==='90'?'selected':''}>폰트 작게</option><option value="100" ${_fontBkt==='100'?'selected':''}>폰트 보통</option><option value="115" ${_fontBkt==='115'?'selected':''}>폰트 크게</option>
            </select>
            <div style="margin-top:6px">${window._renderCardShapePicker({idPrefix:'cfg-sc-shape-bkt', current:_shapeBkt, onChangeFn:'cfgSetShareCardOverrides', compact:true, allowInherit:true})}</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  </details>`;
  };

  window.SettingsModules.sharecard = {
    setSettings: window.cfgSetShareCardSettings,
    previewMode: window.cfgPreviewShareCardMode,
    buildSection: window.buildShareCardSettingsSection
  };
})();
