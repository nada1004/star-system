/* ══════════════════════════════════════
   설정 분리: 대학 상세(팝업) 디자인 설정
   (레이아웃 모드는 폐지 — 기본형 하나만 사용)
══════════════════════════════════════ */
function _renderCfgUdSection(){
  const body=document.getElementById('cfg-ud-body');
  if(!body) return;
  const _validUdModes=['classic','editorial','pastel','glass','dashboard','mono','sunset','botanical','neon','terminal','paper','holo','arcade','luxury','aurora','studio','blush','obsidian'];
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  const dm = _validUdModes.includes(s.design_mode) ? s.design_mode : 'classic';
  const udUnivBgEnabled=s.univ_bg_enabled!==undefined?!!s.univ_bg_enabled:false;
  const udUnivBgPastel=s.univ_bg_pastel!==undefined?!!s.univ_bg_pastel:true;
  const udUnivBgTint=(()=>{ const n=parseInt(s.univ_bg_tint??'18',10); return isNaN(n)?18:Math.max(0,Math.min(60,n)); })();
  const udUnivBgScope=['header','body','cards'].includes(s.univ_bg_scope)?s.univ_bg_scope:'cards';
  const udUnivBtnEnabled=s.univ_btn_enabled!==undefined?!!s.univ_btn_enabled:false;
  const dmCards = [
    ['classic','✨ 클래식','기존 화이트/글래스 디자인','linear-gradient(135deg,#eef2ff,#e0e7ff)','#6366f1'],
    ['editorial','📰 미니멀 매거진','화이트 · 세리프 · 여백 중심','linear-gradient(135deg,#fdfcf9,#f5f2ea)','#1a1a1a'],
    ['pastel','🌸 파스텔 큐트','라벤더/핑크 · 둥근 버블 카드','linear-gradient(135deg,#ffe4ef,#e8e4ff)','#f472b6'],
    ['glass','🧊 네오 글래스','블러 프로스티드 글래스 · 무지개 보더','linear-gradient(135deg,#c7d2fe,#a5f3fc)','#818cf8'],
    ['dashboard','📊 코퍼릿 대시보드','플랫 화이트 · SaaS 느낌 · 좌측 컬러바','linear-gradient(135deg,#f8fafc,#eef2f7)','#2563eb'],
    ['mono','◼ 모노크롬 브루탈','순수 흑백 · 두꺼운 테두리 · 하드섀도우','linear-gradient(135deg,#ffffff,#000000)','#000000'],
    ['sunset','🌇 선셋 코랄','코랄/피치 그라데이션 · 따뜻한 감성','linear-gradient(135deg,#ffd9c0,#ff8fab)','#fb7185'],
    ['botanical','🌿 보태니컬 그린','세이지 그린 · 내추럴 식물 감성','linear-gradient(135deg,#d9f2e6,#a7e3c5)','#059669'],
    ['neon','⚡ 사이버 네온','화이트 배경 · 시안/마젠타 글로우 · 라이트 사이버펑크','linear-gradient(135deg,#ecfeff,#fdf4ff)','#22d3ee'],
    ['terminal','🖥 라이트 터미널','민트 화이트 배경 · 그린 모노스페이스 · 해커 감성','linear-gradient(135deg,#f5faf6,#eaf7ee)','#16a34a'],
    ['paper','📜 빈티지 페이퍼','크래프트지 · 손글씨 스탬프 · 티켓 감성','linear-gradient(135deg,#f2e9d8,#e6d8bd)','#8a5a2b'],
    ['holo','💿 홀로그램','무지개 이리데센트 · 미래적 글로우','linear-gradient(135deg,#e0c3fc,#8ec5fc)','#a855f7'],
    ['arcade','🕹 레트로 아케이드','원색 · 두꺼운 픽셀 테두리 · Y2K 감성','linear-gradient(135deg,#fff066,#ff6b81)','#2563eb'],
    ['luxury','👑 럭셔리 골드','화이트/크림 배경 · 골드 라인 · 프리미엄 VIP 감성','linear-gradient(135deg,#fdfbf5,#f1e2b8)','#d4af37'],
    ['aurora','🌌 오로라','민트/라벤더/핑크 그라디언트 · 몽환적인 라이트 감성','linear-gradient(135deg,#99f6e4,#c4b5fd,#fbcfe8)','#818cf8'],
    ['studio','🎥 스튜디오','방송 그래픽 느낌의 라이트 블루/실버 UI','linear-gradient(135deg,#eff6ff,#dbeafe,#bae6fd)','#38bdf8'],
    ['blush','🩰 블러시 포토','핑크/크림 톤의 포토카드 감성 강화','linear-gradient(135deg,#fff1f2,#ffe4e6,#fef3c7)','#fb7185'],
    ['obsidian','🖤 옵시디언','라벤더/아이보리 계열의 프리미엄 라이트 톤','linear-gradient(135deg,#f5f3ff,#e9d5ff,#c4b5fd)','#8b5cf6']
  ].map(([key,label,desc,bg,accent])=>`
    <button class="btn btn-xs ${dm===key?'btn-b':'btn-w'}" onclick="_setUdDesignMode('${key}')"
      style="text-align:left;padding:0;overflow:hidden;border-radius:12px;display:flex;flex-direction:column;height:auto;border-width:${dm===key?'2px':'1px'}">
      <span style="display:block;height:40px;background:${bg};position:relative">
        <span style="position:absolute;bottom:4px;left:6px;width:8px;height:8px;border-radius:50%;background:${accent};box-shadow:0 0 6px ${accent}"></span>
      </span>
      <span style="padding:7px 9px;background:var(--white)">
        <span style="display:block;font-size:var(--fs-sm);font-weight:900;color:var(--text2)">${label}${dm===key?' ✓':''}</span>
        <span style="display:block;font-size:10px;color:var(--gray-l);margin-top:2px;font-weight:600">${desc}</span>
      </span>
    </button>`).join('');
  const _udPreviewSkinMap = {
    classic:{bg:'linear-gradient(135deg,#eef2ff,#dbeafe)',fg:'#312e81',chip:'rgba(255,255,255,.82)'},
    editorial:{bg:'linear-gradient(135deg,#fdfcf9,#f5f2ea)',fg:'#1a1a1a',chip:'rgba(255,255,255,.96)'},
    pastel:{bg:'linear-gradient(135deg,#ffe4ef,#e8e4ff)',fg:'#831843',chip:'rgba(255,255,255,.92)'},
    glass:{bg:'linear-gradient(135deg,#c7d2fe,#a5f3fc)',fg:'#1e1b4b',chip:'rgba(255,255,255,.55)'},
    dashboard:{bg:'linear-gradient(135deg,#f8fafc,#eef2f7)',fg:'#0f172a',chip:'rgba(255,255,255,.96)'},
    mono:{bg:'linear-gradient(135deg,#f8fafc,#e2e8f0)',fg:'#0f172a',chip:'rgba(255,255,255,.96)'},
    sunset:{bg:'linear-gradient(135deg,#ffd9c0,#ff8fab)',fg:'#7c2d12',chip:'rgba(255,255,255,.9)'},
    botanical:{bg:'linear-gradient(135deg,#d9f2e6,#a7e3c5)',fg:'#064e3b',chip:'rgba(255,255,255,.9)'},
    neon:{bg:'linear-gradient(135deg,#ecfeff,#fdf4ff)',fg:'#0e7490',chip:'rgba(255,255,255,.96)'},
    terminal:{bg:'linear-gradient(135deg,#f5faf6,#eaf7ee)',fg:'#15803d',chip:'rgba(255,255,255,.95)'},
    paper:{bg:'linear-gradient(135deg,#f2e9d8,#e6d8bd)',fg:'#4b3621',chip:'rgba(251,246,233,.96)'},
    holo:{bg:'linear-gradient(135deg,#e0c3fc,#8ec5fc,#fbc2eb)',fg:'#4c1d95',chip:'rgba(255,255,255,.7)'},
    arcade:{bg:'linear-gradient(135deg,#fff066,#ff6b81)',fg:'#111827',chip:'rgba(255,255,255,.95)'},
    luxury:{bg:'linear-gradient(135deg,#fdfbf5,#f1e2b8)',fg:'#7a5f17',chip:'rgba(255,255,255,.94)'},
    aurora:{bg:'linear-gradient(135deg,#99f6e4,#c4b5fd,#fbcfe8)',fg:'#312e81',chip:'rgba(255,255,255,.92)'},
    studio:{bg:'linear-gradient(135deg,#eff6ff,#dbeafe,#bae6fd)',fg:'#0f172a',chip:'rgba(255,255,255,.92)'},
    blush:{bg:'linear-gradient(135deg,#fff1f2,#ffe4e6,#fef3c7)',fg:'#9f1239',chip:'rgba(255,255,255,.9)'},
    obsidian:{bg:'linear-gradient(135deg,#f5f3ff,#e9d5ff,#c4b5fd)',fg:'#4c1d95',chip:'rgba(255,255,255,.92)'}
  };
  const _udPreviewSkin = _udPreviewSkinMap[dm] || _udPreviewSkinMap.classic;
  const _udPreviewCard = `
    <div style="padding:12px;border:1px solid var(--border);border-radius:14px;background:linear-gradient(180deg,var(--surface),var(--white));box-shadow:0 10px 28px rgba(15,23,42,.06);margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">👀 현재 디자인 미리보기</div>
        <div style="font-size:10px;color:var(--gray-l);font-weight:800">${dm}</div>
      </div>
      <div style="min-width:0;border-radius:20px;overflow:hidden;border:1px solid rgba(99,102,241,.14);box-shadow:0 14px 30px rgba(15,23,42,.10);background:#fff">
        <div style="background:${_udPreviewSkin.bg};padding:14px;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:98px;position:relative">
          <span style="position:absolute;top:10px;right:10px;width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.16)"></span>
          <span style="width:42px;height:42px;border-radius:14px;background:${_udPreviewSkin.chip};border:1px solid rgba(255,255,255,.7);box-shadow:0 8px 18px rgba(15,23,42,.12);display:block;z-index:1"></span>
          <span style="display:block;min-width:0;flex:1;text-align:left;z-index:1">
            <span style="display:block;font-size:14px;font-weight:1000;color:${_udPreviewSkin.fg};line-height:1.08">늪지대</span>
            <span style="display:flex;justify-content:flex-start;gap:4px;flex-wrap:wrap;margin-top:6px">
              <span style="padding:3px 7px;border-radius:999px;background:${_udPreviewSkin.chip};font-size:9px;font-weight:800;color:${_udPreviewSkin.fg}">승률 68%</span>
              <span style="padding:3px 7px;border-radius:999px;background:${_udPreviewSkin.chip};font-size:9px;font-weight:800;color:${_udPreviewSkin.fg}">4명</span>
            </span>
          </span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:7px;padding:10px;background:linear-gradient(180deg,#fff,rgba(99,102,241,.04))">
          ${Array.from({length:2}).map((_,idx)=>`<span style="display:block;padding:8px 6px;border-radius:12px;background:#fff;border:1px solid rgba(148,163,184,.16);text-align:center">
            <span style="display:block;font-size:8px;font-weight:900;color:#94a3b8;letter-spacing:.08em">${idx===0?'전적':'승률'}</span>
            <span style="display:block;font-size:11px;font-weight:1000;color:#0f172a;margin-top:3px">${idx===0?'24승 11패':'68%'}</span>
          </span>`).join('')}
        </div>
      </div>
    </div>`;
  body.innerHTML=`
    ${_udPreviewCard}
    <div style="margin-bottom:6px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">🎨 디자인 모드</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">${dmCards}</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">대학 상세 팝업의 전체적인 UI/디자인을 통째로 바꿉니다. 스트리머 상세 팝업과 같은 컨셉을 공유해 앱 전체의 통일감을 유지합니다.</div>
    </div>
    <div style="margin-bottom:12px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">🎓 대학 색상 팝업 배경</div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:10px">
        <input type="checkbox" ${udUnivBgEnabled?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setUdUnivBgEnabled(this.checked)">
        <span style="font-size:var(--fs-sm);color:var(--text)">대학 상세 팝업 배경에 대학 색상 적용</span>
      </label>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:10px;opacity:${udUnivBgEnabled?1:.55}">
        <input type="checkbox" ${udUnivBgPastel?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setUdUnivBgPastel(this.checked)">
        <span style="font-size:var(--fs-sm);color:var(--text)">파스텔톤으로 부드럽게 보정</span>
      </label>
      <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:6px">적용 범위</div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-bottom:10px;opacity:${udUnivBgEnabled?1:.55}">
        <button class="btn btn-xs ${udUnivBgScope==='header'?'btn-b':'btn-w'}" onclick="_setUdUnivBgScope('header')">헤더만</button>
        <button class="btn btn-xs ${udUnivBgScope==='body'?'btn-b':'btn-w'}" onclick="_setUdUnivBgScope('body')">본문까지</button>
        <button class="btn btn-xs ${udUnivBgScope==='cards'?'btn-b':'btn-w'}" onclick="_setUdUnivBgScope('cards')">카드 섹션까지</button>
      </div>
      <div style="display:flex;align-items:center;gap:10px;opacity:${udUnivBgEnabled?1:.55}">
        <input type="range" min="0" max="60" step="2" value="${udUnivBgTint}" style="flex:1;accent-color:var(--blue)" oninput="_setUdUnivBgTint(this.value);document.getElementById('ud-univbg-val').textContent=this.value+'%'">
        <span id="ud-univbg-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:35px;text-align:right;font-weight:700">${udUnivBgTint}%</span>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">헤더/본문 배경에 대학 색상이 은은하게 섞입니다. 파스텔톤을 끄면 원래 대학 색감에 더 가깝게 보입니다.</div>
      <div style="height:1px;background:var(--border2);margin:10px 0"></div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" ${udUnivBtnEnabled?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setUdUnivBtnEnabled(this.checked)">
        <span style="font-size:var(--fs-sm);color:var(--text)">팝업 안 버튼에도 대학 색상 적용</span>
      </label>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">켜면 팝업 안의 보조 버튼(흰 버튼)에도 대학 색상이 은은하게 섞입니다. 배경 적용을 켜야 함께 동작합니다.</div>
    </div>
    <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:10px;padding:0 2px">※ 대학 상세 헤더 배경 이미지는 스트리머 상세 설정 안내와 별개로, 각 대학 편집 화면에서 개별 설정할 수 있습니다.</div>
  `;
}
function _setUdDesignMode(mode){
  const valid=['classic','editorial','pastel','glass','dashboard','mono','sunset','botanical','neon','terminal','paper','holo','arcade','luxury','aurora','studio','blush','obsidian'];
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  s.design_mode=valid.includes(mode)?mode:'classic';
  localStorage.setItem('su_ud_style',JSON.stringify(s));
  _renderCfgUdSection();
  try{ _refreshOpenDetailModals(); }catch(e){}
  try{ _pdTouchPrefs(); }catch(e){}
}
function _applyUdUiPreset(preset){
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  if(preset==='photocard'){
    s.design_mode='blush';
  }else if(preset==='studio'){
    s.design_mode='studio';
  }else if(preset==='dark'){
    s.design_mode='obsidian';
  }
  localStorage.setItem('su_ud_style',JSON.stringify(s));
  _renderCfgUdSection();
  try{ _refreshOpenDetailModals(); }catch(e){}
  try{ _pdTouchPrefs(); }catch(e){}
}
function _setUdUnivBgEnabled(checked){
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  s.univ_bg_enabled=!!checked;
  localStorage.setItem('su_ud_style',JSON.stringify(s));
  _renderCfgUdSection();
  try{ _refreshOpenDetailModals(); }catch(e){}
  try{ _pdTouchPrefs(); }catch(e){}
}
function _setUdUnivBgPastel(checked){
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  s.univ_bg_pastel=!!checked;
  localStorage.setItem('su_ud_style',JSON.stringify(s));
  _renderCfgUdSection();
  try{ _refreshOpenDetailModals(); }catch(e){}
  try{ _pdTouchPrefs(); }catch(e){}
}
function _setUdUnivBgScope(scope){
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  s.univ_bg_scope=['header','body','cards'].includes(scope)?scope:'cards';
  localStorage.setItem('su_ud_style',JSON.stringify(s));
  _renderCfgUdSection();
  try{ _refreshOpenDetailModals(); }catch(e){}
  try{ _pdTouchPrefs(); }catch(e){}
}
function _setUdUnivBtnEnabled(checked){
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  s.univ_btn_enabled=!!checked;
  localStorage.setItem('su_ud_style',JSON.stringify(s));
  _renderCfgUdSection();
  try{ _refreshOpenDetailModals(); }catch(e){}
  try{ _pdTouchPrefs(); }catch(e){}
}
function _setUdUnivBgTint(val){
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  const n=parseInt(val,10);
  s.univ_bg_tint=isNaN(n)?18:Math.max(0,Math.min(60,n));
  localStorage.setItem('su_ud_style',JSON.stringify(s));
  try{ _refreshOpenDetailModals(); }catch(e){}
  try{ _pdTouchPrefs(); }catch(e){}
}
/* ══════════════════════════════════════
   대학 상세 팝업 안의 🎨 스타일 전환 버튼
   (레이아웃 모드는 폐지 — 디자인 모드만 전환)
   총관리자로 로그인했을 때만 버튼이 보이고 동작합니다.
══════════════════════════════════════ */
function _udStylePickerOutsideClick(e){
  const p=document.getElementById('udStylePicker');
  if(!p) return;
  if(e.target && e.target.closest && (e.target.closest('#udStylePicker') || e.target.closest('#univModalStyleBtn'))) return;
  _udCloseStylePicker();
}
function _udCloseStylePicker(){
  const p=document.getElementById('udStylePicker');
  if(p) p.remove();
  try{ document.removeEventListener('click', _udStylePickerOutsideClick, true); }catch(e){}
}
function _udToggleStylePicker(){
  const existing = document.getElementById('udStylePicker');
  if(existing){ _udCloseStylePicker(); return; }
  const canEdit = !!(typeof isLoggedIn!=='undefined' && isLoggedIn) && !(typeof isSubAdmin!=='undefined' && isSubAdmin);
  if(!canEdit) return;
  const _validUdModes=['classic','editorial','pastel','glass','dashboard','mono','sunset','botanical','neon','terminal','paper','holo','arcade','luxury','aurora','studio','blush','obsidian'];
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  const dm = _validUdModes.includes(s.design_mode) ? s.design_mode : 'classic';
  const designs = [
    ['classic','클래식'],['editorial','매거진'],['pastel','파스텔'],['glass','글래스'],['dashboard','대시보드'],['mono','모노'],
    ['sunset','선셋'],['botanical','보태니컬'],['neon','네온'],['terminal','터미널'],['paper','페이퍼'],['holo','홀로그램'],
    ['arcade','아케이드'],['luxury','럭셔리'],['aurora','오로라'],['studio','스튜디오'],['blush','블러시'],['obsidian','옵시디언']
  ];
  const _chip = (key,label,active,fn) => `<button type="button" onclick="${fn}('${key}');_udRefreshStylePicker()"
    style="font-size:11px;font-weight:800;padding:5px 9px;border-radius:8px;cursor:pointer;
    border:1.5px solid ${active?'#0f172a':'rgba(148,163,184,.32)'};
    background:${active?'#0f172a':'#fff'};color:${active?'#fff':'#334155'}">${label}</button>`;
  const panel=document.createElement('div');
  panel.id='udStylePicker';
  panel.style.cssText='position:absolute;top:100%;right:12px;margin-top:8px;z-index:100050;width:min(320px,90vw);max-height:min(60vh,480px);overflow:auto;background:var(--white,#fff);border:1px solid rgba(148,163,184,.28);border-radius:14px;box-shadow:0 18px 40px rgba(15,23,42,.18);padding:12px';
  panel.innerHTML = `
    <div style="font-size:11px;font-weight:900;color:#94a3b8;letter-spacing:.06em;margin-bottom:6px">디자인 모드</div>
    <div style="display:flex;flex-wrap:wrap;gap:5px">
      ${designs.map(([key,label])=>_chip(key,label,key===dm,'_setUdDesignMode')).join('')}
    </div>
  `;
  const head=document.getElementById('univModalHead');
  if(head){
    if(!head.style.position) head.style.position='relative';
    head.appendChild(panel);
  }else{
    document.body.appendChild(panel);
  }
  setTimeout(()=>{ document.addEventListener('click', _udStylePickerOutsideClick, true); }, 0);
}
function _udRefreshStylePicker(){
  if(!document.getElementById('udStylePicker')) return;
  _udCloseStylePicker();
  _udToggleStylePicker();
}

try{
  window._renderCfgUdSection = _renderCfgUdSection;
  window._setUdDesignMode = _setUdDesignMode;
  window._applyUdUiPreset = _applyUdUiPreset;
  window._setUdUnivBgEnabled = _setUdUnivBgEnabled;
  window._setUdUnivBgPastel = _setUdUnivBgPastel;
  window._setUdUnivBgScope = _setUdUnivBgScope;
  window._setUdUnivBgTint = _setUdUnivBgTint;
  window._setUdUnivBtnEnabled = _setUdUnivBtnEnabled;
  window._udToggleStylePicker = _udToggleStylePicker;
  window._udCloseStylePicker = _udCloseStylePicker;
  window._udRefreshStylePicker = _udRefreshStylePicker;
}catch(e){}
