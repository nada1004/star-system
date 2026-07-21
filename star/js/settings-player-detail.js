/* ══════════════════════════════════════
   설정 분리: 스트리머 상세 설정
══════════════════════════════════════ */
function _renderCfgPdSection(){
  const body=document.getElementById('cfg-pd-body');
  if(!body) return;
  const _validPdDesignModes=['classic','editorial','pastel','glass','dashboard','mono','sunset','botanical','neon','terminal','paper','holo','arcade','luxury','aurora','studio','blush','obsidian'];
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
  const pdUnivBgEnabled=s.univ_bg_enabled!==undefined?!!s.univ_bg_enabled:false;
  const pdUnivBgPastel=s.univ_bg_pastel!==undefined?!!s.univ_bg_pastel:true;
  const pdUnivBgTint=(()=>{ const n=parseInt(s.univ_bg_tint??'18',10); return isNaN(n)?18:Math.max(0,Math.min(60,n)); })();
  const pdUnivBgScope=['header','body','cards'].includes(s.univ_bg_scope)?s.univ_bg_scope:'cards';
  const pdUnivBtnEnabled=s.univ_btn_enabled!==undefined?!!s.univ_btn_enabled:false;
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
      <span style="font-size:var(--fs-sm);font-weight:600;color:var(--text2);min-width:72px;flex-shrink:0">${u.name}</span>
      <input type="range" min="0" max="50" step="5" value="${val}" style="flex:1;accent-color:var(--blue)" oninput="_setPdUnivDarken('${safe}',this.value/100,${i})">
      <span style="font-size:var(--fs-caption);color:var(--gray-l);min-width:30px;text-align:right;font-weight:700" id="pd-dv-${i}">${val}%</span>
    </div>`;
  }).join('');
  const _validPdLayoutModes=['default','photocard','showcase','stats','split','banner','poster','timeline','board'];
  const dm = _validPdDesignModes.includes(s.design_mode) ? s.design_mode : 'classic';
  const lm = _validPdLayoutModes.includes(s.layout_mode) ? s.layout_mode : 'default';
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
    <button class="btn btn-xs ${dm===key?'btn-b':'btn-w'}" onclick="_setPdDesignMode('${key}')"
      style="text-align:left;padding:0;overflow:hidden;border-radius:12px;display:flex;flex-direction:column;height:auto;border-width:${dm===key?'2px':'1px'}">
      <span style="display:block;height:40px;background:${bg};position:relative">
        <span style="position:absolute;bottom:4px;left:6px;width:8px;height:8px;border-radius:50%;background:${accent};box-shadow:0 0 6px ${accent}"></span>
      </span>
      <span style="padding:7px 9px;background:var(--white)">
        <span style="display:block;font-size:var(--fs-sm);font-weight:900;color:var(--text2)">${label}${dm===key?' ✓':''}</span>
        <span style="display:block;font-size:10px;color:var(--gray-l);margin-top:2px;font-weight:600">${desc}</span>
      </span>
    </button>`).join('');
  const lmCards = [
    ['default','기본형','지금 구조 그대로 안정적인 기본 배치','linear-gradient(180deg,#ffffff 0 38%,#eef2ff 38% 100%)','grid-template-columns:36px 1fr 42px;'],
    ['photocard','포토카드형','프로필/비주얼 강조, 카드 감성 강화','linear-gradient(180deg,#fdf2f8 0 55%,#ffffff 55% 100%)','grid-template-columns:1fr;'],
    ['showcase','쇼케이스형','이름과 핵심 정보 중심의 넓은 전개형','linear-gradient(180deg,#eff6ff 0 48%,#ffffff 48% 100%)','grid-template-columns:52px 1fr;'],
    ['stats','통계강조형','상단에서 기록과 지표를 먼저 보여주는 타입','linear-gradient(180deg,#ecfeff 0 40%,#ffffff 40% 100%)','grid-template-columns:1fr 1fr;'],
    ['split','스플릿형','프로필과 요약 정보를 좌우 분할해서 강조','linear-gradient(180deg,#eef2ff 0 46%,#ffffff 46% 100%)','grid-template-columns:22px 1fr;'],
    ['banner','배너형','상단을 슬림하게 정리한 방송 배너 타입','linear-gradient(180deg,#f8fafc 0 36%,#ffffff 36% 100%)','grid-template-columns:20px 1fr 30px;'],
    ['poster','포스터형','큰 배너+포스터 느낌으로 완전 다른 상단','linear-gradient(180deg,#fff7ed 0 48%,#ffffff 48% 100%)','grid-template-columns:1fr 34px 1fr;'],
    ['timeline','타임라인형','최근 경기 기록을 메인 스트림으로 배치','linear-gradient(180deg,#ecfeff 0 44%,#ffffff 44% 100%)','grid-template-columns:26px 1fr 18px;'],
    ['board','보드형','상단 KPI 보드 + 카드 그리드 중심','linear-gradient(180deg,#eef2ff 0 42%,#ffffff 42% 100%)','grid-template-columns:1fr 1fr;']
  ].map(([key,label,desc,bg,grid])=>`
    <button class="btn btn-xs ${lm===key?'btn-b':'btn-w'}" onclick="_setPdLayoutMode('${key}')"
      style="text-align:left;padding:0;overflow:hidden;border-radius:12px;display:flex;flex-direction:column;height:auto;border-width:${lm===key?'2px':'1px'}">
      <span style="display:block;height:56px;background:${bg};padding:8px">
        <span style="display:grid;${key==='showcase'?'grid-template-columns:24px 1fr;grid-template-rows:auto auto;':'grid-template-columns:auto;'}gap:5px;height:100%">
          <span style="display:grid;${grid}gap:4px;align-items:center">
            <span style="width:${key==='photocard'?'100%':'24px'};height:${key==='photocard'?'24px':'24px'};border-radius:${key==='stats'?'8px':'999px'};background:rgba(79,70,229,.26);display:block"></span>
            <span style="height:8px;border-radius:999px;background:rgba(15,23,42,.16);display:block"></span>
            ${key==='default'?'<span style="height:18px;border-radius:var(--r);background:rgba(148,163,184,.26);display:block"></span>':(key==='photocard'?'':(key==='showcase'?'':(key==='split'?'':'<span style="height:18px;border-radius:var(--r);background:rgba(148,163,184,.22);display:block"></span>')))}
          </span>
          <span style="display:grid;grid-template-columns:${key==='stats'||key==='banner'?'repeat(4,1fr)':(key==='split'?'repeat(3,1fr)':'repeat(3,1fr)')};gap:4px">
            ${Array.from({length:key==='stats'||key==='banner'?4:3}).map(()=>'<span style="height:12px;border-radius:7px;background:rgba(255,255,255,.92);border:1px solid rgba(99,102,241,.12)"></span>').join('')}
          </span>
        </span>
      </span>
      <span style="padding:7px 9px;background:var(--white)">
        <span style="display:block;font-size:var(--fs-sm);font-weight:900;color:var(--text2)">${label}${lm===key?' ✓':''}</span>
        <span style="display:block;font-size:10px;color:var(--gray-l);margin-top:2px;font-weight:600">${desc}</span>
      </span>
    </button>`).join('');
  const _pdPreviewSkinMap = {
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
    aurora:{bg:'linear-gradient(135deg,#99f6e4,#c4b5fd,#fbcfe8)',fg:'#312e81',chip:'rgba(255,255,255,.92)'}
    ,studio:{bg:'linear-gradient(135deg,#eff6ff,#dbeafe,#bae6fd)',fg:'#0f172a',chip:'rgba(255,255,255,.92)'}
    ,blush:{bg:'linear-gradient(135deg,#fff1f2,#ffe4e6,#fef3c7)',fg:'#9f1239',chip:'rgba(255,255,255,.9)'}
    ,obsidian:{bg:'linear-gradient(135deg,#f5f3ff,#e9d5ff,#c4b5fd)',fg:'#4c1d95',chip:'rgba(255,255,255,.92)'}
  };
  const _pdPreviewSkin = _pdPreviewSkinMap[dm] || _pdPreviewSkinMap.classic;
  const _pdPreviewHeroLayout = (lm==='photocard' || lm==='poster')
    ? 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center'
    : (lm==='showcase' || lm==='split'
      ? 'display:grid;grid-template-columns:28px 1fr;align-items:center;gap:8px'
      : 'display:grid;grid-template-columns:28px 1fr 38px;align-items:center;gap:8px');
  const _pdPreviewStatsCols = (lm==='stats' || lm==='board' || lm==='banner') ? 'repeat(4,1fr)' : ((lm==='split' || lm==='poster') ? 'repeat(3,1fr)' : 'repeat(2,1fr)');
  const _pdPreviewPhoto = (lm==='photocard' || lm==='poster')
    ? 'width:54px;height:54px;border-radius:18px'
    : (lm==='split' ? 'width:34px;height:40px;border-radius:12px' : 'width:28px;height:28px;border-radius:999px');
  const _pdPreviewMetaAlign = (lm==='photocard' || lm==='poster') ? 'center' : 'left';
  const _pdUiPreset = `
    <div style="padding:12px;border:1px solid var(--border);border-radius:14px;background:linear-gradient(180deg,var(--surface),var(--white));box-shadow:0 10px 28px rgba(15,23,42,.05);margin-bottom:16px">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">🪄 추천 UI 프리셋</div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">
        <button class="btn btn-xs btn-w" onclick="_applyPdUiPreset('photocard')">포토카드형</button>
        <button class="btn btn-xs btn-w" onclick="_applyPdUiPreset('studio')">방송형</button>
        <button class="btn btn-xs btn-w" onclick="_applyPdUiPreset('dark')">라이트 프리미엄</button>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">디자인 + 레이아웃 조합을 한 번에 적용합니다.</div>
    </div>`;
  const _pdPreviewCard = `
    <div style="padding:12px;border:1px solid var(--border);border-radius:14px;background:linear-gradient(180deg,var(--surface),var(--white));box-shadow:0 10px 28px rgba(15,23,42,.06);margin-bottom:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px">
        <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2)">👀 현재 조합 미리보기</div>
        <div style="font-size:10px;color:var(--gray-l);font-weight:800">${dm} × ${lm}</div>
      </div>
      <div style="display:grid;grid-template-columns:minmax(0,1fr) 118px;gap:12px;align-items:stretch">
        <div style="min-width:0;border-radius:20px;overflow:hidden;border:1px solid rgba(99,102,241,.14);box-shadow:0 14px 30px rgba(15,23,42,.10);background:#fff">
          <div style="background:${_pdPreviewSkin.bg};padding:14px;${_pdPreviewHeroLayout};min-height:102px;position:relative">
            <span style="position:absolute;inset:auto auto 10px 10px;width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.14);filter:blur(2px)"></span>
            <span style="${_pdPreviewPhoto};background:${_pdPreviewSkin.chip};border:1px solid rgba(255,255,255,.7);box-shadow:0 8px 18px rgba(15,23,42,.12);display:block;z-index:1"></span>
            <span style="display:block;min-width:0;text-align:${_pdPreviewMetaAlign};z-index:1">
              <span style="display:block;font-size:${lm==='photocard'?'15px':'13px'};font-weight:1000;color:${_pdPreviewSkin.fg};line-height:1.1">이경민</span>
              <span style="display:flex;justify-content:${lm==='photocard'?'center':'flex-start'};gap:4px;flex-wrap:wrap;margin-top:6px">
                <span style="padding:3px 7px;border-radius:999px;background:${_pdPreviewSkin.chip};font-size:9px;font-weight:800;color:${_pdPreviewSkin.fg}">늪지대</span>
                <span style="padding:3px 7px;border-radius:999px;background:${_pdPreviewSkin.chip};font-size:9px;font-weight:800;color:${_pdPreviewSkin.fg}">T 테란</span>
              </span>
            </span>
            ${lm==='photocard'?'':`<span style="padding:7px 8px;border-radius:12px;background:${_pdPreviewSkin.chip};font-size:10px;font-weight:900;color:${_pdPreviewSkin.fg};text-align:center;line-height:1.1;z-index:1">ELO<br>1320</span>`}
          </div>
          <div style="display:grid;grid-template-columns:${_pdPreviewStatsCols};gap:7px;padding:10px;background:linear-gradient(180deg,#fff,rgba(99,102,241,.04))">
            ${Array.from({length: (lm==='stats' || lm==='board')?4:2}).map((_,idx)=>`<span style="display:block;padding:8px 6px;border-radius:12px;background:#fff;border:1px solid rgba(148,163,184,.16);text-align:center">
              <span style="display:block;font-size:8px;font-weight:900;color:#94a3b8;letter-spacing:.08em">${idx===0?'전적':idx===1?'승률':idx===2?'포인트':'상태'}</span>
              <span style="display:block;font-size:${(lm==='stats' || lm==='board')?'12px':'11px'};font-weight:1000;color:#0f172a;margin-top:3px">${idx===0?'12승 4패':idx===1?'75%':idx===2?'+18':'활동중'}</span>
            </span>`).join('')}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;justify-content:center">
          <div style="padding:9px 10px;border-radius:12px;background:var(--white);border:1px solid var(--border)">
            <div style="font-size:10px;color:var(--gray-l);font-weight:800;margin-bottom:3px">추천 포인트</div>
            <div style="font-size:var(--fs-caption);color:var(--text2);font-weight:800">${lm==='photocard'?'프로필 이미지와 감성 분위기 강조':lm==='showcase'?'이름과 핵심 정보가 넓게 펼쳐짐':lm==='stats'?'상단에서 지표를 먼저 읽기 쉬움':lm==='poster'?'포스터/배너 느낌으로 ‘완전 다른 화면’ 체감':lm==='timeline'?'최근 경기 스트림을 메인으로 바로 보는 구조':lm==='board'?'KPI/카드 보드 중심으로 빠르게 스캔':'균형형 구조로 가장 안정적'}</div>
          </div>
          <div style="padding:9px 10px;border-radius:12px;background:var(--white);border:1px solid var(--border)">
            <div style="font-size:10px;color:var(--gray-l);font-weight:800;margin-bottom:3px">추천 조합</div>
            <div style="font-size:var(--fs-caption);color:var(--text2);font-weight:800">${lm==='photocard'?'glass / aurora / pastel':lm==='showcase'?'luxury / editorial / sunset':lm==='stats'?'dashboard / classic / mono':lm==='poster'?'sunset / blush / aurora':lm==='timeline'?'studio / glass / aurora':lm==='board'?'dashboard / mono / classic':'classic / botanical / holo'}</div>
          </div>
        </div>
      </div>
    </div>`;
  body.innerHTML=`
    ${_pdPreviewCard}
    ${_pdUiPreset}
    <div style="padding:0;display:flex;flex-direction:column;gap:8px">
    <details class="cfg-grp" open style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">🎨 디자인 · 레이아웃</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:12px">
    <div style="margin-bottom:16px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">🎨 디자인 모드</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">${dmCards}</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">스트리머 상세 팝업의 전체적인 UI/디자인을 통째로 바꿉니다. 색상뿐 아니라 카드 모양·글꼴·레이아웃 느낌이 모드마다 다릅니다.</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">🧩 레이아웃 모드</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">${lmCards}</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">썸네일은 미리보기이고, 선택하면 현재 열려 있는 스트리머 상세 팝업에 바로 반영됩니다.</div>
    </div>
      </div>
    </details>
    <details class="cfg-grp" style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">📏 크기</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:12px">
    <div style="margin-bottom:16px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">📏 폰트 크기</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${fsBtns}</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">스트리머 상세 모달 전체 크기에 적용됩니다</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">🖼️ 프로필 이미지 크기</div>
      <div style="display:flex;align-items:center;gap:10px">
        <input type="range" min="60" max="140" step="5" value="${ps}" style="flex:1;accent-color:var(--blue)" oninput="_setPdProfileSize(this.value);document.getElementById('pd-ps-val').textContent=this.value+'%'">
        <span id="pd-ps-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:35px;text-align:right;font-weight:700">${ps}%</span>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">프로필 이미지 크기 (기본 100%)</div>
    </div>
      </div>
    </details>
    <details class="cfg-grp" style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">🌈 배경 · 색상</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:12px">
    <div style="margin-bottom:16px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">🎓 대학 색상 팝업 배경</div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:10px">
        <input type="checkbox" ${pdUnivBgEnabled?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setPdUnivBgEnabled(this.checked)">
        <span style="font-size:var(--fs-sm);color:var(--text)">스트리머 상세 팝업 배경에 소속 대학 색상 적용</span>
      </label>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:10px;opacity:${pdUnivBgEnabled?1:.55}">
        <input type="checkbox" ${pdUnivBgPastel?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setPdUnivBgPastel(this.checked)">
        <span style="font-size:var(--fs-sm);color:var(--text)">파스텔톤으로 부드럽게 보정</span>
      </label>
      <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:6px">적용 범위</div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-bottom:10px;opacity:${pdUnivBgEnabled?1:.55}">
        <button class="btn btn-xs ${pdUnivBgScope==='header'?'btn-b':'btn-w'}" onclick="_setPdUnivBgScope('header')">헤더만</button>
        <button class="btn btn-xs ${pdUnivBgScope==='body'?'btn-b':'btn-w'}" onclick="_setPdUnivBgScope('body')">본문까지</button>
        <button class="btn btn-xs ${pdUnivBgScope==='cards'?'btn-b':'btn-w'}" onclick="_setPdUnivBgScope('cards')">카드 섹션까지</button>
      </div>
      <div style="display:flex;align-items:center;gap:10px;opacity:${pdUnivBgEnabled?1:.55}">
        <input type="range" min="0" max="60" step="2" value="${pdUnivBgTint}" style="flex:1;accent-color:var(--blue)" oninput="_setPdUnivBgTint(this.value);document.getElementById('pd-univbg-val').textContent=this.value+'%'">
        <span id="pd-univbg-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:35px;text-align:right;font-weight:700">${pdUnivBgTint}%</span>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">켜면 헤더/본문 배경에 대학 색상이 은은하게 섞입니다. 농도는 0~60% 범위에서 조절됩니다.</div>
      <div style="height:1px;background:var(--border2);margin:10px 0"></div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" ${pdUnivBtnEnabled?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setPdUnivBtnEnabled(this.checked)">
        <span style="font-size:var(--fs-sm);color:var(--text)">팝업 안 버튼에도 소속 대학 색상 적용</span>
      </label>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">켜면 팝업 안의 보조 버튼(흰 버튼)에도 대학 색상이 은은하게 섞입니다. 배경 적용을 켜야 함께 동작합니다.</div>
    </div>
    <div style="margin-bottom:16px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">🖼 스트리머 상세 헤더 기본 배경</div>
      <input type="text" value="${phbg}" placeholder="https://... 이미지 URL" style="width:100%;margin-bottom:10px" oninput="_setPdHeaderBg('header_bg_img',this.value)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:4px">표시 방식</div>
          <select style="width:100%" onchange="_setPdHeaderBg('header_bg_fit',this.value)">
            <option value="contain"${phbgFit==='contain'?' selected':''}>맞춤</option>
            <option value="cover"${phbgFit==='cover'?' selected':''}>채우기</option>
            <option value="fill"${phbgFit==='fill'?' selected':''}>늘리기</option>
          </select>
        </div>
        <div>
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:4px">크기 조절</div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="range" min="40" max="220" step="5" value="${phbgScale}" style="flex:1;accent-color:var(--blue)" oninput="_setPdHeaderBg('header_bg_scale',this.value);document.getElementById('cfg-pdh-scale').textContent=this.value+'%'">
            <span id="cfg-pdh-scale" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:800">${phbgScale}%</span>
          </div>
        </div>
      </div>
      <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin:10px 0 6px">이미지 위치</div>
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
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:4px">가로 미세 위치</div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="range" min="0" max="100" step="1" value="${_phbgPosX}" style="flex:1;accent-color:var(--blue)" oninput="_setPdHeaderBg('header_bg_pos_x',this.value);document.getElementById('cfg-pdh-posx').textContent=this.value+'%'">
            <span id="cfg-pdh-posx" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:800">${_phbgPosX}%</span>
          </div>
        </div>
        <div>
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:4px">세로 미세 위치</div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="range" min="0" max="100" step="1" value="${_phbgPosY}" style="flex:1;accent-color:var(--blue)" oninput="_setPdHeaderBg('header_bg_pos_y',this.value);document.getElementById('cfg-pdh-posy').textContent=this.value+'%'">
            <span id="cfg-pdh-posy" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:800">${_phbgPosY}%</span>
          </div>
        </div>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">개별 스트리머에 별도 배경을 넣지 않은 경우 기본값으로 사용됩니다.</div>
    </div>
    <div style="margin-bottom:16px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">🏫 대학 상세 헤더 기본 배경</div>
      <input type="text" value="${uhbg}" placeholder="https://... 이미지 URL" style="width:100%;margin-bottom:10px" oninput="_setUdHeaderBg('header_bg_img',this.value)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:4px">표시 방식</div>
          <select style="width:100%" onchange="_setUdHeaderBg('header_bg_fit',this.value)">
            <option value="contain"${uhbgFit==='contain'?' selected':''}>맞춤</option>
            <option value="cover"${uhbgFit==='cover'?' selected':''}>채우기</option>
            <option value="fill"${uhbgFit==='fill'?' selected':''}>늘리기</option>
          </select>
        </div>
        <div>
          <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin-bottom:4px">크기 조절</div>
          <div style="display:flex;gap:8px;align-items:center">
            <input type="range" min="40" max="220" step="5" value="${uhbgScale}" style="flex:1;accent-color:var(--blue)" oninput="_setUdHeaderBg('header_bg_scale',this.value);document.getElementById('cfg-udh-scale').textContent=this.value+'%'">
            <span id="cfg-udh-scale" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:800">${uhbgScale}%</span>
          </div>
        </div>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">개별 대학에 별도 배경을 넣지 않은 경우 기본값으로 사용됩니다.</div>
    </div>
      </div>
    </details>
    <details class="cfg-grp" style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">🎨 표시 · 강도</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:12px">
    <div style="margin-bottom:16px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">📐 프로필 이미지 모양 (전역)</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-xs btn-w" onclick="cfgGo('profileshape')">⚙️ 설정 열기</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:800">현재: ${_shapeLbl}</span>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">프로필 이미지 모양 설정은 ‘🖼️ 프로필 이미지 모양’ 메뉴로 분리되었습니다.</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">🎨 승패 색상 농도</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px">${cpBtns}</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l)">전적·승률·포인트·모드별 전적의 승/패/승률 색상 전체에 적용</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">🎨 경기 상세(팝업) 승/패 배경 강도</div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:128px">승자 배경 강도</label>
        <input type="range" min="0" max="30" step="1" value="${mdWinTint}" style="flex:1;accent-color:var(--blue)"
          oninput="localStorage.setItem('su_md_win_tint',String(this.value));document.getElementById('cfg-md-win-val').textContent=this.value+'%';try{if(typeof render==='function')render();}catch(e){}">
        <span id="cfg-md-win-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:34px;text-align:right;font-weight:800">${mdWinTint}%</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:128px">패자 회색 강도</label>
        <input type="range" min="0" max="30" step="1" value="${mdLoseGray}" style="flex:1;accent-color:var(--blue)"
          oninput="localStorage.setItem('su_md_lose_gray',String(this.value));document.getElementById('cfg-md-lose-val').textContent=this.value+'%';try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){};try{if(typeof render==='function')render();}catch(e){}">
        <span id="cfg-md-lose-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:34px;text-align:right;font-weight:800">${mdLoseGray}%</span>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">승자는 대학색 배경의 농도, 패자는 회색 배경의 농도를 조절합니다</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">🏫 경기 상세 상단 대학 로고 크기</div>
      <div style="display:flex;gap:8px;align-items:center">
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:128px">로고 크기</label>
        <input type="range" min="28" max="64" step="2" value="${mdLogoSize}" style="flex:1;accent-color:var(--blue)"
          oninput="localStorage.setItem('su_md_logo_size',String(this.value));document.getElementById('cfg-md-logo-val').textContent=this.value+'px';try{document.documentElement.style.setProperty('--su_md_logo_size',this.value+'px');}catch(e){};try{if(typeof applyMatchDetailVars==='function')applyMatchDetailVars();}catch(e){};try{if(typeof render==='function')render();}catch(e){}">
        <span id="cfg-md-logo-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:800">${mdLogoSize}px</span>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">경기 상세 팝업 상단(대학 카드) 로고 크기를 조절합니다</div>
    </div>
    <div style="margin-bottom:16px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">🎨 경기 상세 팀 헤더 색상</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:10px">대학CK / 티어대회 / 프로리그 경기 상세 상단의 A팀·B팀 색상을 기본 대학색 대신 고정 색으로 덮어쓸 수 있습니다.</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px">
        <div style="padding:10px;border:1px solid var(--border);border-radius:var(--r);background:var(--white)">
          <div style="font-size:var(--fs-caption);font-weight:900;color:var(--text2);margin-bottom:8px">🤝 대학CK</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <label style="min-width:48px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)">A팀</label>
            <input type="color" value="${mdCkA}" style="width:42px;height:32px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer" onchange="_setMdTeamHeaderColor('ck','a',this.value)">
            <input type="text" value="${mdCkA}" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:800" onblur="_setMdTeamHeaderColor('ck','a',this.value)">
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <label style="min-width:48px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)">B팀</label>
            <input type="color" value="${mdCkB}" style="width:42px;height:32px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer" onchange="_setMdTeamHeaderColor('ck','b',this.value)">
            <input type="text" value="${mdCkB}" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:800" onblur="_setMdTeamHeaderColor('ck','b',this.value)">
          </div>
        </div>
        <div style="padding:10px;border:1px solid var(--border);border-radius:var(--r);background:var(--white)">
          <div style="font-size:var(--fs-caption);font-weight:900;color:var(--text2);margin-bottom:8px">🎯 티어대회</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <label style="min-width:48px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)">A팀</label>
            <input type="color" value="${mdTtA}" style="width:42px;height:32px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer" onchange="_setMdTeamHeaderColor('tt','a',this.value)">
            <input type="text" value="${mdTtA}" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:800" onblur="_setMdTeamHeaderColor('tt','a',this.value)">
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <label style="min-width:48px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)">B팀</label>
            <input type="color" value="${mdTtB}" style="width:42px;height:32px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer" onchange="_setMdTeamHeaderColor('tt','b',this.value)">
            <input type="text" value="${mdTtB}" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:800" onblur="_setMdTeamHeaderColor('tt','b',this.value)">
          </div>
        </div>
        <div style="padding:10px;border:1px solid var(--border);border-radius:var(--r);background:var(--white)">
          <div style="font-size:var(--fs-caption);font-weight:900;color:var(--text2);margin-bottom:8px">🏅 프로리그</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <label style="min-width:48px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)">A팀</label>
            <input type="color" value="${mdProA}" style="width:42px;height:32px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer" onchange="_setMdTeamHeaderColor('pro','a',this.value)">
            <input type="text" value="${mdProA}" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:800" onblur="_setMdTeamHeaderColor('pro','a',this.value)">
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <label style="min-width:48px;font-size:var(--fs-caption);font-weight:700;color:var(--text3)">B팀</label>
            <input type="color" value="${mdProB}" style="width:42px;height:32px;padding:2px;border-radius:8px;border:1px solid var(--border2);cursor:pointer" onchange="_setMdTeamHeaderColor('pro','b',this.value)">
            <input type="text" value="${mdProB}" style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm);font-weight:800" onblur="_setMdTeamHeaderColor('pro','b',this.value)">
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-w btn-xs" onclick="['su_md_team_hdr_ck_a','su_md_team_hdr_ck_b','su_md_team_hdr_tt_a','su_md_team_hdr_tt_b','su_md_team_hdr_pro_a','su_md_team_hdr_pro_b'].forEach(k=>localStorage.removeItem(k));try{ if(typeof _applyOpenHistDetailTeamHeaderColors==='function') _applyOpenHistDetailTeamHeaderColors(); }catch(e){}; _renderCfgPdSection(); try{ if(typeof render==='function') render(); }catch(e){}">🔄 기본값으로 초기화</button>
      </div>
    </div>
      </div>
    </details>
    <details class="cfg-grp" style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">🖼️ 경기 상세 프로필 · 전적 표시</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:12px">
    <div style="margin-bottom:16px">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">🖼️ 경기 상세 프로필 이미지</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:8px">현재 기기: <b>${_mdDevLabel}</b></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
        <button class="btn btn-xs ${mdAvatarFit==='cover'?'btn-b':'btn-w'}"
          onclick="localStorage.setItem('su_md_avatar_fit_${_mdDevKey}','cover');try{if(typeof render==='function')render();}catch(e){};_renderCfgPdSection()">가득 채우기</button>
        <button class="btn btn-xs ${mdAvatarFit==='fill'?'btn-b':'btn-w'}"
          onclick="localStorage.setItem('su_md_avatar_fit_${_mdDevKey}','fill');try{if(typeof render==='function')render();}catch(e){};_renderCfgPdSection()">늘리기</button>
        <button class="btn btn-xs ${mdAvatarFit==='contain'?'btn-b':'btn-w'}"
          onclick="localStorage.setItem('su_md_avatar_fit_${_mdDevKey}','contain');try{if(typeof render==='function')render();}catch(e){};_renderCfgPdSection()">원본 비율</button>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <label style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);min-width:128px">크기 배율</label>
        <input type="range" min="80" max="200" step="10" value="${mdAvatarScale}" style="flex:1;accent-color:var(--blue)"
          oninput="localStorage.setItem('su_md_avatar_scale_${_mdDevKey}',String(this.value));document.getElementById('cfg-md-avscale-val').textContent=this.value+'%';try{if(typeof render==='function')render();}catch(e){}">
        <span id="cfg-md-avscale-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:40px;text-align:right;font-weight:800">${mdAvatarScale}%</span>
      </div>
      <div style="font-size:var(--fs-caption);font-weight:700;color:var(--text3);margin:10px 0 6px">이미지 위치</div>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">
        ${[
          ['left top','↖ 좌상'],['center top','↑ 상단'],['right top','↗ 우상'],
          ['left center','← 좌중'],['center center','• 중앙'],['right center','→ 우중'],
          ['left bottom','↙ 좌하'],['center bottom','↓ 하단'],['right bottom','↘ 우하']
        ].map(([pos,label])=>`<button class="btn btn-xs ${mdAvatarPos===pos?'btn-b':'btn-w'}"
          onclick="localStorage.setItem('su_md_avatar_pos_${_mdDevKey}','${pos}');try{if(typeof render==='function')render();}catch(e){};_renderCfgPdSection()">${label}</button>`).join('')}
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">경기 상세(대회탭 포함) 프로필 이미지의 채우기/크기 배율을 조절합니다</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">📊 전적·승률 배경 색상 강도</div>
      <div style="display:flex;align-items:center;gap:10px">
        <input type="range" min="0" max="30" step="2" value="${st}" style="flex:1;accent-color:var(--blue)" oninput="_setPdTint('stats',this.value);document.getElementById('pd-st-val').textContent=this.value+'%'">
        <span id="pd-st-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:28px;font-weight:700">${st}%</span>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:4px">전적/승률/포인트/ELO 영역 배경 대학색 강도 (현재 ${st}%)</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">🃏 모드별 전적 배경 색상 강도</div>
      <div style="display:flex;align-items:center;gap:10px">
        <input type="range" min="0" max="30" step="2" value="${mt}" style="flex:1;accent-color:var(--blue)" oninput="_setPdTint('mode',this.value);document.getElementById('pd-mt-val').textContent=this.value+'%'">
        <span id="pd-mt-val" style="font-size:var(--fs-caption);color:var(--gray-l);min-width:28px;font-weight:700">${mt}%</span>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:4px">모드별 전적 카드 배경 모드색 강도 (현재 ${mt}%)</div>
    </div>
    <div style="margin-bottom:16px">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);margin-bottom:8px">🎨 최근 경기 기록 ‘종목(종류) 배지’ 색상</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:10px">스트리머 상세 → 최근 경기 기록의 “종류” 배지 색상을 변경합니다.</div>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:10px 12px">
        ${_pdModeColorRows}
        <div style="display:flex;gap:8px;align-items:center;margin-top:10px">
          <button class="btn btn-w btn-xs" onclick="cfgPdResetModeBadgeColors()">🔄 기본값으로 초기화</button>
          <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 바뀐 색상은 즉시 반영됩니다</span>
        </div>
      </div>
    </div>
      </div>
    </details>
    <details class="cfg-grp" style="border:1px solid var(--border);border-radius:10px;overflow:hidden">
      <summary style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--surface);font-weight:900;font-size:var(--fs-sm);color:var(--text2)">⚙️ 팝업 동작 · 기타</summary>
      <div style="padding:12px;display:flex;flex-direction:column;gap:12px">
    <div style="margin-bottom:16px">
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:8px">⚙️ 팝업 동작 설정</div>
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" ${closeOnBadge?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setPdCloseOnBadge(this.checked)">
          <span style="font-size:var(--fs-sm);color:var(--text)">종목 클릭 시 팝업 닫기</span>
        </label>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l)">활성화 시: 종목 아이콘/배지 클릭 시 스트리머 상세 팝업이 닫힙니다</div>
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" ${closeOnMatchPlayer?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setPdCloseOnMatchPlayer(this.checked)">
          <span style="font-size:var(--fs-sm);color:var(--text)">경기 상세에서 선수 클릭 시 팝업 닫기</span>
        </label>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l)">활성화 시: 경기 상세 팝업에서 선수 이름을 누르면 경기 상세 팝업이 닫힙니다</div>
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" ${headerClickClose?'checked':''} style="width:16px;height:16px;cursor:pointer" onchange="_setPdHeaderClickClose(this.checked)">
          <span style="font-size:var(--fs-sm);color:var(--text)">팝업 헤더 클릭 시 닫기</span>
        </label>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l)">활성화 시: 각 팝업 상단 헤더(제목)를 클릭하면 팝업이 닫힙니다 (드래그 이동은 유지)</div>
    </div>
    <div>
      <div style="font-size:var(--fs-sm);font-weight:700;color:var(--text2);margin-bottom:4px">🌗 대학별 헤더 어둡기</div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:10px">밝은 색상 대학은 어둡게 조정하면 이름이 더 잘 보입니다</div>
      ${univRows}
    </div>
      </div>
    </details>
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
  _pdTouchPrefs();
}
function _setPdProfileSize(val){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.profile_size=parseInt(val)||100;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  try{ _refreshOpenDetailModals(); }catch(e){}
  _pdTouchPrefs();
}
function _setPdUnivBgEnabled(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.univ_bg_enabled=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  try{ _renderCfgPdSection(); }catch(e){}
  try{ _refreshOpenDetailModals(); }catch(e){}
  _pdTouchPrefs();
}
function _setPdUnivBgPastel(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.univ_bg_pastel=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  try{ _renderCfgPdSection(); }catch(e){}
  try{ _refreshOpenDetailModals(); }catch(e){}
  _pdTouchPrefs();
}
function _setPdUnivBgScope(scope){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.univ_bg_scope=['header','body','cards'].includes(scope)?scope:'cards';
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  try{ _renderCfgPdSection(); }catch(e){}
  try{ _refreshOpenDetailModals(); }catch(e){}
  _pdTouchPrefs();
}
function _setPdUnivBtnEnabled(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.univ_btn_enabled=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  try{ _renderCfgPdSection(); }catch(e){}
  try{ _refreshOpenDetailModals(); }catch(e){}
  _pdTouchPrefs();
}
function _setPdUnivBgTint(val){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  const n=parseInt(val,10);
  s.univ_bg_tint=isNaN(n)?18:Math.max(0,Math.min(60,n));
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  try{ _refreshOpenDetailModals(); }catch(e){}
  _pdTouchPrefs();
}
function _applyPdUiPreset(preset){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
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
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  _renderCfgPdSection();
  try{ _refreshOpenDetailModals(); }catch(e){}
  _pdTouchPrefs();
}
function _setPdDesignMode(mode){
  const valid=['classic','editorial','pastel','glass','dashboard','mono','sunset','botanical','neon','terminal','paper','holo','arcade','luxury','aurora','studio','blush','obsidian'];
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.design_mode=valid.includes(mode)?mode:'classic';
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  _renderCfgPdSection();
  try{ _refreshOpenDetailModals(); }catch(e){}
  _pdTouchPrefs();
}
function _setPdLayoutMode(mode){
  const valid=['default','photocard','showcase','stats','split','banner','poster','timeline','board'];
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.layout_mode=valid.includes(mode)?mode:'default';
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  _renderCfgPdSection();
  try{ _refreshOpenDetailModals(); }catch(e){}
  _pdTouchPrefs();
}
function _setPdColorPreset(cp){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.color_preset=cp;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  _renderCfgPdSection();
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
  _pdTouchPrefs();
}
function _setPdUnivDarken(univ,val,idx){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  if(!s.univ_darken) s.univ_darken={};
  s.univ_darken[univ]=parseFloat(val)||0;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  const el=document.getElementById('pd-dv-'+idx);
  if(el) el.textContent=Math.round(val*100)+'%';
  _pdTouchPrefs();
}
function _setPdCloseOnBadge(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.close_on_badge=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  _pdTouchPrefs();
}
function _setPdCloseOnMatchPlayer(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.close_on_match_player=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
  _pdTouchPrefs();
}
function _setPdHeaderClickClose(checked){
  const s=JSON.parse(localStorage.getItem('su_pd_style')||'{}');
  s.header_click_close=!!checked;
  localStorage.setItem('su_pd_style',JSON.stringify(s));
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
    // 모든 지원 모양 (유효성 검사용 — 알 수 없는 값도 그대로 저장)
    const v = shape || 'circle';
    localStorage.setItem('su_profile_shape', v);
    try{ if(typeof applyProfileShapeVars==='function') applyProfileShapeVars(); }catch(e){}
  }catch(e){}
  try{ window._scheduleCloudAppSettingsSave && window._scheduleCloudAppSettingsSave(); }catch(e){}
  try{ window.SettingsStore && typeof window.SettingsStore.markPrefsChanged==='function' && window.SettingsStore.markPrefsChanged(); }catch(e){}
  try{ if(typeof window._renderCfgProfileShapeSection==='function') window._renderCfgProfileShapeSection(); }catch(e){}
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
  window._setPdUnivBgEnabled = _setPdUnivBgEnabled;
  window._setPdUnivBgPastel = _setPdUnivBgPastel;
  window._setPdUnivBgScope = _setPdUnivBgScope;
  window._setPdUnivBgTint = _setPdUnivBgTint;
  window._setPdUnivBtnEnabled = _setPdUnivBtnEnabled;
  window._applyPdUiPreset = _applyPdUiPreset;
  window._setPdDesignMode = _setPdDesignMode;
  window._setPdLayoutMode = _setPdLayoutMode;
  window._setUdHeaderBg = _setUdHeaderBg;
  window._setMdTeamHeaderColor = _setMdTeamHeaderColor;
}catch(e){}
