/* ══════════════════════════════════════
   설정 분리: 대학 상세(팝업) 디자인 설정
══════════════════════════════════════ */
function _renderCfgUdSection(){
  const body=document.getElementById('cfg-ud-body');
  if(!body) return;
  const _validUdModes=['classic','editorial','pastel','glass','dashboard','mono','sunset','botanical','neon','terminal','paper','holo','arcade','luxury','aurora','studio','blush','obsidian'];
  const _validUdLayouts=['default','photocard','showcase','stats','split','banner','poster','timeline','board'];
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  const dm = _validUdModes.includes(s.design_mode) ? s.design_mode : 'classic';
  const lm = _validUdLayouts.includes(s.layout_mode) ? s.layout_mode : 'default';
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
        <span style="display:block;font-size:12px;font-weight:900;color:var(--text2)">${label}${dm===key?' ✓':''}</span>
        <span style="display:block;font-size:10px;color:var(--gray-l);margin-top:2px;font-weight:600">${desc}</span>
      </span>
    </button>`).join('');
  const lmCards = [
    ['default','기본형','지금 구조 그대로 안정적인 기본 배치','linear-gradient(180deg,#ffffff 0 38%,#eef2ff 38% 100%)','grid-template-columns:32px 1fr;'],
    ['photocard','포토카드형','로고/헤더 비주얼 비중을 키우는 타입','linear-gradient(180deg,#fdf2f8 0 55%,#ffffff 55% 100%)','grid-template-columns:1fr;'],
    ['showcase','쇼케이스형','대학명과 상위 멤버를 크게 보여주는 타입','linear-gradient(180deg,#eff6ff 0 48%,#ffffff 48% 100%)','grid-template-columns:32px 1fr 18px;'],
    ['stats','통계강조형','승률과 핵심 지표를 상단에서 먼저 노출','linear-gradient(180deg,#ecfeff 0 40%,#ffffff 40% 100%)','grid-template-columns:repeat(2,1fr);'],
    ['split','스플릿형','로고/대학명과 요약 영역을 좌우 분할','linear-gradient(180deg,#eef2ff 0 46%,#ffffff 46% 100%)','grid-template-columns:24px 1fr;'],
    ['banner','배너형','상단을 슬림하게 다듬은 방송 배너 타입','linear-gradient(180deg,#f8fafc 0 36%,#ffffff 36% 100%)','grid-template-columns:20px 1fr 26px;'],
    ['poster','포스터형','큰 배너/포스터 느낌으로 완전 다른 상단','linear-gradient(180deg,#fff7ed 0 48%,#ffffff 48% 100%)','grid-template-columns:1fr;'],
    ['timeline','타임라인형','최근 경기/이벤트를 메인 스트림으로 배치','linear-gradient(180deg,#ecfeff 0 44%,#ffffff 44% 100%)','grid-template-columns:26px 1fr 18px;'],
    ['board','보드형','상단 KPI 보드 + 카드 그리드 중심','linear-gradient(180deg,#eef2ff 0 42%,#ffffff 42% 100%)','grid-template-columns:repeat(2,1fr);']
  ].map(([key,label,desc,bg,grid])=>`
    <button class="btn btn-xs ${lm===key?'btn-b':'btn-w'}" onclick="_setUdLayoutMode('${key}')"
      style="text-align:left;padding:0;overflow:hidden;border-radius:12px;display:flex;flex-direction:column;height:auto;border-width:${lm===key?'2px':'1px'}">
      <span style="display:block;height:56px;background:${bg};padding:8px">
        <span style="display:grid;gap:5px;height:100%">
          <span style="display:grid;${grid}gap:4px;align-items:center">
            <span style="height:${key==='photocard'?'24px':'20px'};border-radius:${key==='stats'?'8px':'12px'};background:rgba(79,70,229,.24);display:block"></span>
            <span style="height:8px;border-radius:999px;background:rgba(15,23,42,.15);display:block"></span>
            ${key==='showcase'?'<span style="width:18px;height:18px;border-radius:999px;background:rgba(236,72,153,.18);display:block"></span>':''}
          </span>
          <span style="display:grid;grid-template-columns:${key==='stats'||key==='banner'?'repeat(4,1fr)':'repeat(3,1fr)'};gap:4px">
            ${Array.from({length:key==='stats'||key==='banner'?4:3}).map(()=>'<span style="height:12px;border-radius:7px;background:rgba(255,255,255,.92);border:1px solid rgba(99,102,241,.12)"></span>').join('')}
          </span>
        </span>
      </span>
      <span style="padding:7px 9px;background:var(--white)">
        <span style="display:block;font-size:12px;font-weight:900;color:var(--text2)">${label}${lm===key?' ✓':''}</span>
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
  const _udPreviewLayout = (lm==='photocard' || lm==='poster')
    ? 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center'
    : (lm==='split'
      ? 'display:grid;grid-template-columns:36px 1fr;align-items:center;gap:10px'
      : 'display:flex;align-items:center;justify-content:space-between;gap:10px');
  const _udPreviewStatsCols = (lm==='stats' || lm==='board' || lm==='banner') ? 'repeat(4,1fr)' : (lm==='split' ? 'repeat(3,1fr)' : 'repeat(2,1fr)');
  const _udUiPreset = `
    <div style="padding:12px;border:1px solid var(--border);border-radius:14px;background:linear-gradient(180deg,var(--surface),var(--white));box-shadow:0 10px 28px rgba(15,23,42,.05);margin-bottom:12px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">🪄 추천 UI 프리셋</div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">
        <button class="btn btn-xs btn-w" onclick="_applyUdUiPreset('photocard')">포토카드형</button>
        <button class="btn btn-xs btn-w" onclick="_applyUdUiPreset('studio')">방송형</button>
        <button class="btn btn-xs btn-w" onclick="_applyUdUiPreset('dark')">라이트 프리미엄</button>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">디자인 + 레이아웃 조합을 한 번에 적용합니다.</div>
    </div>`;
  const _udPreviewCard = `
    <div style="padding:12px;border:1px solid var(--border);border-radius:14px;background:linear-gradient(180deg,var(--surface),var(--white));box-shadow:0 10px 28px rgba(15,23,42,.06);margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
        <div style="font-size:12px;font-weight:800;color:var(--text2)">👀 현재 조합 미리보기</div>
        <div style="font-size:10px;color:var(--gray-l);font-weight:800">${dm} × ${lm}</div>
      </div>
      <div style="display:grid;grid-template-columns:minmax(0,1fr) 118px;gap:12px;align-items:stretch">
        <div style="min-width:0;border-radius:20px;overflow:hidden;border:1px solid rgba(99,102,241,.14);box-shadow:0 14px 30px rgba(15,23,42,.10);background:#fff">
          <div style="background:${_udPreviewSkin.bg};padding:14px;${_udPreviewLayout};min-height:98px;position:relative">
            <span style="position:absolute;top:10px;right:10px;width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.16)"></span>
            <span style="width:${lm==='photocard'?'58px':'42px'};height:${lm==='photocard'?'58px':'42px'};border-radius:${lm==='photocard'?'18px':'14px'};background:${_udPreviewSkin.chip};border:1px solid rgba(255,255,255,.7);box-shadow:0 8px 18px rgba(15,23,42,.12);display:block;z-index:1"></span>
            <span style="display:block;min-width:0;flex:1;text-align:${lm==='photocard'?'center':'left'};z-index:1">
              <span style="display:block;font-size:${lm==='showcase'?'16px':'14px'};font-weight:1000;color:${_udPreviewSkin.fg};line-height:1.08">늪지대</span>
              <span style="display:flex;justify-content:${lm==='photocard'?'center':'flex-start'};gap:4px;flex-wrap:wrap;margin-top:6px">
                <span style="padding:3px 7px;border-radius:999px;background:${_udPreviewSkin.chip};font-size:9px;font-weight:800;color:${_udPreviewSkin.fg}">승률 68%</span>
                <span style="padding:3px 7px;border-radius:999px;background:${_udPreviewSkin.chip};font-size:9px;font-weight:800;color:${_udPreviewSkin.fg}">4명</span>
              </span>
            </span>
            ${lm==='showcase'?'<span style="display:flex;gap:4px;z-index:1"><span style="width:14px;height:14px;border-radius:999px;background:rgba(255,255,255,.88);display:block"></span><span style="width:14px;height:14px;border-radius:999px;background:rgba(255,255,255,.7);display:block"></span><span style="width:14px;height:14px;border-radius:999px;background:rgba(255,255,255,.5);display:block"></span></span>':''}
          </div>
          <div style="display:grid;grid-template-columns:${_udPreviewStatsCols};gap:7px;padding:10px;background:linear-gradient(180deg,#fff,rgba(99,102,241,.04))">
            ${Array.from({length: (lm==='stats' || lm==='board')?4:2}).map((_,idx)=>`<span style="display:block;padding:8px 6px;border-radius:12px;background:#fff;border:1px solid rgba(148,163,184,.16);text-align:center">
              <span style="display:block;font-size:8px;font-weight:900;color:#94a3b8;letter-spacing:.08em">${idx===0?'전적':idx===1?'승률':idx===2?'포인트':'멤버'}</span>
              <span style="display:block;font-size:${(lm==='stats' || lm==='board')?'12px':'11px'};font-weight:1000;color:#0f172a;margin-top:3px">${idx===0?'24승 11패':idx===1?'68%':idx===2?'+41':'4명'}</span>
            </span>`).join('')}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;justify-content:center">
          <div style="padding:9px 10px;border-radius:12px;background:var(--white);border:1px solid var(--border)">
            <div style="font-size:10px;color:var(--gray-l);font-weight:800;margin-bottom:3px">추천 포인트</div>
            <div style="font-size:11px;color:var(--text2);font-weight:800">${lm==='photocard'?'로고와 컬러 헤더를 감성적으로 강조':lm==='showcase'?'대학명과 상위 멤버 존재감이 큼':lm==='stats'?'승률/전적 중심으로 빠르게 읽힘':lm==='poster'?'대학을 ‘포스터’처럼 크게 보여주는 비주얼형':lm==='timeline'?'최근 흐름(경기 스트림)을 메인으로 보는 구조':lm==='board'?'KPI/카드 보드 중심으로 빠르게 스캔':'가장 범용적이고 안정적인 균형형'}</div>
          </div>
          <div style="padding:9px 10px;border-radius:12px;background:var(--white);border:1px solid var(--border)">
            <div style="font-size:10px;color:var(--gray-l);font-weight:800;margin-bottom:3px">추천 조합</div>
            <div style="font-size:11px;color:var(--text2);font-weight:800">${lm==='photocard'?'aurora / pastel / glass':lm==='showcase'?'luxury / editorial / classic':lm==='stats'?'dashboard / mono / terminal':lm==='poster'?'sunset / blush / aurora':lm==='timeline'?'studio / glass / aurora':lm==='board'?'dashboard / mono / classic':'classic / botanical / sunset'}</div>
          </div>
        </div>
      </div>
    </div>`;
  body.innerHTML=`
    ${_udPreviewCard}
    ${_udUiPreset}
    <div style="margin-bottom:6px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🎨 디자인 모드</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">${dmCards}</div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">대학 상세 팝업의 전체적인 UI/디자인을 통째로 바꿉니다. 스트리머 상세 팝업과 같은 컨셉을 공유해 앱 전체의 통일감을 유지합니다.</div>
    </div>
    <div style="margin-bottom:10px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🧩 레이아웃 모드</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">${lmCards}</div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">썸네일은 미리보기이고, 선택하면 현재 열려 있는 대학 상세 팝업 레이아웃이 바로 바뀝니다.</div>
    </div>
    <div style="margin-bottom:12px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;font-weight:800;color:var(--text2);margin-bottom:8px">🎓 대학 색상 팝업 배경</div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:10px">
        <input type="checkbox" ${udUnivBgEnabled?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setUdUnivBgEnabled(this.checked)">
        <span style="font-size:12px;color:var(--text)">대학 상세 팝업 배경에 대학 색상 적용</span>
      </label>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:10px;opacity:${udUnivBgEnabled?1:.55}">
        <input type="checkbox" ${udUnivBgPastel?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setUdUnivBgPastel(this.checked)">
        <span style="font-size:12px;color:var(--text)">파스텔톤으로 부드럽게 보정</span>
      </label>
      <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">적용 범위</div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-bottom:10px;opacity:${udUnivBgEnabled?1:.55}">
        <button class="btn btn-xs ${udUnivBgScope==='header'?'btn-b':'btn-w'}" onclick="_setUdUnivBgScope('header')">헤더만</button>
        <button class="btn btn-xs ${udUnivBgScope==='body'?'btn-b':'btn-w'}" onclick="_setUdUnivBgScope('body')">본문까지</button>
        <button class="btn btn-xs ${udUnivBgScope==='cards'?'btn-b':'btn-w'}" onclick="_setUdUnivBgScope('cards')">카드 섹션까지</button>
      </div>
      <div style="display:flex;align-items:center;gap:10px;opacity:${udUnivBgEnabled?1:.55}">
        <input type="range" min="0" max="60" step="2" value="${udUnivBgTint}" style="flex:1;accent-color:var(--blue)" oninput="_setUdUnivBgTint(this.value);document.getElementById('ud-univbg-val').textContent=this.value+'%'">
        <span id="ud-univbg-val" style="font-size:11px;color:var(--gray-l);min-width:35px;text-align:right;font-weight:700">${udUnivBgTint}%</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">헤더/본문 배경에 대학 색상이 은은하게 섞입니다. 파스텔톤을 끄면 원래 대학 색감에 더 가깝게 보입니다.</div>
      <div style="height:1px;background:var(--border2);margin:10px 0"></div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" ${udUnivBtnEnabled?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setUdUnivBtnEnabled(this.checked)">
        <span style="font-size:12px;color:var(--text)">팝업 안 버튼에도 대학 색상 적용</span>
      </label>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">켜면 팝업 안의 보조 버튼(흰 버튼)에도 대학 색상이 은은하게 섞입니다. 배경 적용을 켜야 함께 동작합니다.</div>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:10px;padding:0 2px">※ 대학 상세 헤더 배경 이미지는 스트리머 상세 설정 안내와 별개로, 각 대학 편집 화면에서 개별 설정할 수 있습니다.</div>
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
function _setUdLayoutMode(mode){
  const valid=['default','photocard','showcase','stats','split','banner','poster','timeline','board'];
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  s.layout_mode=valid.includes(mode)?mode:'default';
  localStorage.setItem('su_ud_style',JSON.stringify(s));
  _renderCfgUdSection();
  try{ _refreshOpenDetailModals(); }catch(e){}
  try{ _pdTouchPrefs(); }catch(e){}
}
function _applyUdUiPreset(preset){
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  if(preset==='photocard'){
    s.design_mode='blush';
    s.layout_mode='photocard';
  }else if(preset==='studio'){
    s.design_mode='studio';
    s.layout_mode='banner';
  }else if(preset==='dark'){
    s.design_mode='obsidian';
    s.layout_mode='split';
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
try{
  window._renderCfgUdSection = _renderCfgUdSection;
  window._setUdDesignMode = _setUdDesignMode;
  window._setUdLayoutMode = _setUdLayoutMode;
  window._applyUdUiPreset = _applyUdUiPreset;
  window._setUdUnivBgEnabled = _setUdUnivBgEnabled;
  window._setUdUnivBgPastel = _setUdUnivBgPastel;
  window._setUdUnivBgScope = _setUdUnivBgScope;
  window._setUdUnivBgTint = _setUdUnivBgTint;
  window._setUdUnivBtnEnabled = _setUdUnivBtnEnabled;
}catch(e){}
