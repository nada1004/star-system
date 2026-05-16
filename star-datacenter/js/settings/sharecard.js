(function(){
  window.SettingsModules = window.SettingsModules || {};

  function _cfgPickAnyPlayerName(){
    try{
      const arr = (typeof window.players!=='undefined' && Array.isArray(window.players)) ? window.players : [];
      for(const p of arr){
        const n = String(p?.name||'').trim();
        if(n) return n;
      }
    }catch(e){}
    return '';
  }

  function _cfgRerenderOpenShareCard(opts){
    opts = opts || {};
    const forceOpen = !!opts.forceOpen;
    const overlay = document.getElementById('sharecard-overlay');
    if(!overlay && !forceOpen) return;

    const run = ()=>{
      try{
        if(window._shareMode==='match' && window._shareMatchObj && typeof window.renderShareCardByMatchObj==='function'){
          window.renderShareCardByMatchObj(window._shareMatchObj);
          return;
        }
        if(window._shareMode==='univ' && window._shareUnivSearch && typeof window.renderShareCardByUniv==='function'){
          window.renderShareCardByUniv(window._shareUnivSearch);
          return;
        }
        if(window._shareMode==='player' && window._sharePlayerSearch && typeof window.renderShareCardByPlayer==='function'){
          window.renderShareCardByPlayer(window._sharePlayerSearch);
          return;
        }
        const any = _cfgPickAnyPlayerName();
        if(any && typeof window.renderShareCardByPlayer==='function'){
          window._shareMode='player';
          window._sharePlayerSearch=any;
          window.renderShareCardByPlayer(any);
          return;
        }
        const card=document.getElementById('share-card');
        if(card) card.innerHTML='<div style="padding:40px;text-align:center;color:var(--gray-l)">미리보기용 데이터가 없습니다</div>';
      }catch(e){}
    };

    Promise.resolve(typeof window._ensureShareCardRuntime==='function' ? window._ensureShareCardRuntime() : null)
      .then(()=>{
        if(!document.getElementById('sharecard-overlay') && forceOpen){
          try{
            const any = _cfgPickAnyPlayerName();
            if(any){
              window._shareMode='player';
              window._sharePlayerSearch=any;
            }
            if(typeof window.openShareCardModal==='function') window.openShareCardModal();
          }catch(e){}
        }
      })
      .then(()=>{
        try{
          if(typeof window._shareCardDeferRender==='function') window._shareCardDeferRender(run);
          else setTimeout(run,0);
        }catch(e){}
      });
  }

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
    try{ localStorage.setItem('su_sc_mode', ['campus','vivid','soft','dark','minimal','aurora','poster','mono'].includes(mode)?mode:'campus'); }catch(e){}
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
    try{ if(typeof render === 'function') render(); }catch(e){}
    _cfgRerenderOpenShareCard();
  };

  window.cfgPreviewShareCardMode = function(mode){
    const el=document.getElementById('cfg-sc-mode');
    if(el) el.value = ['campus','vivid','soft','dark','minimal','aurora','poster','mono'].includes(mode)?mode:'campus';
    window.cfgSetShareCardSettings && window.cfgSetShareCardSettings();
    _cfgRerenderOpenShareCard({ forceOpen:true });
  };

  window.buildShareCardSettingsSection = function(_scfgD){
    const _mode = (localStorage.getItem('su_sc_mode') ?? 'campus');
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
    const _ovCk = (localStorage.getItem('su_sc_mode_ck') ?? 'inherit');
    const _ovPro = (localStorage.getItem('su_sc_mode_pro') ?? 'inherit');
    const _ovTt = (localStorage.getItem('su_sc_mode_tt') ?? 'inherit');
    const _ovComp = (localStorage.getItem('su_sc_mode_comp') ?? 'inherit');
    const _grayCk = (localStorage.getItem('su_sc_losergray_ck') ?? 'inherit');
    const _grayPro = (localStorage.getItem('su_sc_losergray_pro') ?? 'inherit');
    const _grayTt = (localStorage.getItem('su_sc_losergray_tt') ?? 'inherit');
    const _grayComp = (localStorage.getItem('su_sc_losergray_comp') ?? 'inherit');
    const _profCk = (localStorage.getItem('su_sc_profile_pct_ck') ?? 'inherit');
    const _profPro = (localStorage.getItem('su_sc_profile_pct_pro') ?? 'inherit');
    const _profTt = (localStorage.getItem('su_sc_profile_pct_tt') ?? 'inherit');
    const _profComp = (localStorage.getItem('su_sc_profile_pct_comp') ?? 'inherit');
    const _fontCk = (localStorage.getItem('su_sc_font_pct_ck') ?? 'inherit');
    const _fontPro = (localStorage.getItem('su_sc_font_pct_pro') ?? 'inherit');
    const _fontTt = (localStorage.getItem('su_sc_font_pct_tt') ?? 'inherit');
    const _fontComp = (localStorage.getItem('su_sc_font_pct_comp') ?? 'inherit');
    return _scfgD('sharecard','🪪 공유카드 디자인') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">스트리머/대학/개인전/끝장전/대학대전/대회/티어대회 공유카드의 전역 톤과 색상 효과를 한 번에 조절합니다.</div>
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
        </select>
        <span style="font-size:11px;color:var(--gray-l)">대학색 중심 정도와 대비감을 바꿉니다.</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text3);font-weight:800">표면 스타일</div>
        <select id="cfg-sc-surface" onchange="cfgSetShareCardSettings()" style="padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="glass" ${_surface==='glass'?'selected':''}>글래스</option>
          <option value="clean" ${_surface==='clean'?'selected':''}>클린</option>
          <option value="solid" ${_surface==='solid'?'selected':''}>솔리드</option>
        </select>
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
        <div style="font-size:11px;color:var(--text3);font-weight:900">카드 타입별 개별 오버라이드</div>
        <div style="font-size:11px;color:var(--gray-l)">전역 모드와 다르게 CK / 프로리그 / 티어대회 / 대회 카드에 별도 모드와 패자 회색 강도를 적용할 수 있습니다.</div>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">대학 CK</div>
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
          </div>
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">프로리그</div>
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
          </div>
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">티어대회</div>
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
          </div>
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--text3);margin-bottom:4px">대회/토너먼트</div>
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
          </div>
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
