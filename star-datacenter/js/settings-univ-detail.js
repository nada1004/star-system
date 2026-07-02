/* ══════════════════════════════════════
   설정 분리: 대학 상세(팝업) 디자인 설정
══════════════════════════════════════ */
function _renderCfgUdSection(){
  const body=document.getElementById('cfg-ud-body');
  if(!body) return;
  const _validUdModes=['classic','editorial','pastel','glass','dashboard','mono','sunset','botanical','neon','terminal','paper','holo','arcade','luxury','aurora'];
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  const dm = _validUdModes.includes(s.design_mode) ? s.design_mode : 'classic';
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
    ['aurora','🌌 오로라','민트/라벤더/핑크 그라디언트 · 몽환적인 라이트 감성','linear-gradient(135deg,#99f6e4,#c4b5fd,#fbcfe8)','#818cf8']
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
  body.innerHTML=`
    <div style="margin-bottom:6px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🎨 디자인 모드</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">${dmCards}</div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px">대학 상세 팝업의 전체적인 UI/디자인을 통째로 바꿉니다. 스트리머 상세 팝업과 같은 컨셉을 공유해 앱 전체의 통일감을 유지합니다.</div>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:10px;padding:0 2px">※ 대학 상세 헤더 배경 이미지는 스트리머 상세 설정 안내와 별개로, 각 대학 편집 화면에서 개별 설정할 수 있습니다.</div>
  `;
}
function _setUdDesignMode(mode){
  const valid=['classic','editorial','pastel','glass','dashboard','mono','sunset','botanical','neon','terminal','paper','holo','arcade','luxury','aurora'];
  const s=(()=>{ try{ return JSON.parse(localStorage.getItem('su_ud_style')||'{}')||{}; }catch(e){ return {}; } })();
  s.design_mode=valid.includes(mode)?mode:'classic';
  localStorage.setItem('su_ud_style',JSON.stringify(s));
  _renderCfgUdSection();
  try{ _refreshOpenDetailModals(); }catch(e){}
  try{ _pdTouchPrefs(); }catch(e){}
}
try{
  window._renderCfgUdSection = _renderCfgUdSection;
  window._setUdDesignMode = _setUdDesignMode;
}catch(e){}
