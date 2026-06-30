(function(){
  window.SettingsModules = window.SettingsModules || {};

  function renderCfgProfileShapeCard(_scfgD){
    return _scfgD('profileshape','🖼️ 프로필 이미지 모양') + `
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">선수 프로필 이미지(스트리머 상세/통계/경기 상세/현황판 등)의 모양을 설정합니다.</div>
    <div id="cfg-profileshape-body" style="padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:12px;color:var(--gray-l)">로딩 중...</div>
    </div>
  </details>`;
  }

  const _SHAPE_OPTIONS = [
    { v:'circle',    label:'원형',      icon:'⭕', desc:'기본 원형',         radius:'50%',  clip:'none',                                                                                       preview:'border-radius:50%' },
    { v:'square',    label:'네모',      icon:'⬛', desc:'각진 사각형',        radius:'6px',  clip:'none',                                                                                       preview:'border-radius:6px' },
    { v:'rounded',   label:'둥근 네모', icon:'🟦', desc:'부드러운 모서리',    radius:'22%',  clip:'none',                                                                                       preview:'border-radius:22%' },
    { v:'squircle',  label:'스쿼클',    icon:'🔷', desc:'부드러운 사각원',    radius:'28%',  clip:'none',                                                                                       preview:'border-radius:28%' },
    { v:'diamond',   label:'다이아몬드',icon:'♦️', desc:'마름모형',           radius:'50%',  clip:'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',                                               preview:'border-radius:50%;clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' },
    { v:'hexagon',   label:'육각형',    icon:'⬡',  desc:'벌집 모양',          radius:'50%',  clip:'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)',                      preview:'border-radius:50%;clip-path:polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)' },
    { v:'shield',    label:'방패형',    icon:'🛡️', desc:'방패 실루엣',        radius:'50%',  clip:'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)',                                       preview:'border-radius:8px 8px 0 0;clip-path:polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)' },
    { v:'pentagon',  label:'오각형',    icon:'⭐', desc:'오각형',             radius:'50%',  clip:'polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)',                                         preview:'border-radius:50%;clip-path:polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)' },
    { v:'star',      label:'별모양',    icon:'🌟', desc:'5각 별',             radius:'50%',  clip:'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',  preview:'border-radius:50%;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)' },
    { v:'blob',      label:'블롭',      icon:'🫧', desc:'물방울 느낌',        radius:'40% 60% 55% 45% / 45% 55% 60% 40%', clip:'none',                                                         preview:'border-radius:40% 60% 55% 45% / 45% 55% 60% 40%' },
    { v:'leaf',      label:'리프',      icon:'🍃', desc:'나뭇잎 모양',        radius:'50%',  clip:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)',                                                  preview:'border-radius:50%;clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%)' },
    { v:'triangle',  label:'삼각형',    icon:'🔺', desc:'위로 뾰족',          radius:'0',    clip:'polygon(50% 0%, 0% 100%, 100% 100%)',                                                        preview:'clip-path:polygon(50% 0%, 0% 100%, 100% 100%)' },
    { v:'octagon',   label:'팔각형',    icon:'🔷', desc:'8각형',              radius:'50%',  clip:'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',                 preview:'border-radius:50%;clip-path:polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)' },
    { v:'cross',     label:'십자형',    icon:'✚',  desc:'십자 모양',          radius:'0',    clip:'polygon(33% 0%,67% 0%,67% 33%,100% 33%,100% 67%,67% 67%,67% 100%,33% 100%,33% 67%,0% 67%,0% 33%,33% 33%)', preview:'clip-path:polygon(33% 0%,67% 0%,67% 33%,100% 33%,100% 67%,67% 67%,67% 100%,33% 100%,33% 67%,0% 67%,0% 33%,33% 33%)' },
    { v:'heart',     label:'하트',      icon:'❤️', desc:'하트 모양',          radius:'50% 50% 50% 50%/60% 60% 40% 40%', clip:'none',                                                            preview:'border-radius:50% 50% 50% 50%/60% 60% 40% 40%;transform:rotate(-45deg)' },
    { v:'parallelogram', label:'평행사변형', icon:'▱', desc:'기울어진 사각형', radius:'0', clip:'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',                                                   preview:'clip-path:polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)' },
    { v:'arrow',     label:'화살표',    icon:'➤',  desc:'오른쪽 화살표',      radius:'0',    clip:'polygon(0% 0%,75% 0%,100% 50%,75% 100%,0% 100%,25% 50%)',                                   preview:'clip-path:polygon(0% 0%,75% 0%,100% 50%,75% 100%,0% 100%,25% 50%)' },
    { v:'rounded-top', label:'반원탑',  icon:'🔼', desc:'위만 둥근 반원형',   radius:'50% 50% 10% 10% / 70% 70% 10% 10%', clip:'none',                                                         preview:'border-radius:50% 50% 10% 10% / 70% 70% 10% 10%' },
    { v:'cloud',     label:'구름',      icon:'☁️', desc:'구름 실루엣',         radius:'50%',  clip:'polygon(8% 60%,5% 45%,12% 32%,22% 26%,30% 10%,45% 4%,60% 10%,72% 5%,85% 14%,92% 28%,96% 43%,90% 58%,78% 66%,62% 70%,40% 70%,22% 66%)',  preview:'border-radius:50%;clip-path:polygon(8% 60%,5% 45%,12% 32%,22% 26%,30% 10%,45% 4%,60% 10%,72% 5%,85% 14%,92% 28%,96% 43%,90% 58%,78% 66%,62% 70%,40% 70%,22% 66%)' },
    { v:'arch',      label:'아치',      icon:'🏛️', desc:'상단 아치형',         radius:'50% 50% 8px 8px / 60% 60% 8px 8px', clip:'none',                                                         preview:'border-radius:50% 50% 8px 8px / 60% 60% 8px 8px' },
    { v:'badge',     label:'뱃지',      icon:'🎖️', desc:'뱃지 오각형',         radius:'0',    clip:'polygon(50% 0%,95% 15%,100% 55%,75% 92%,25% 92%,0% 55%,5% 15%)',                            preview:'clip-path:polygon(50% 0%,95% 15%,100% 55%,75% 92%,25% 92%,0% 55%,5% 15%)' },
    { v:'chevron',   label:'쉐브론',    icon:'🔰', desc:'쉐브론 화살표형',     radius:'0',    clip:'polygon(0% 0%,85% 0%,100% 50%,85% 100%,0% 100%,15% 50%)',                                   preview:'clip-path:polygon(0% 0%,85% 0%,100% 50%,85% 100%,0% 100%,15% 50%)' },
    { v:'clover',    label:'클로버',    icon:'🍀', desc:'4잎 클로버형',        radius:'50%',  clip:'polygon(50% 20%,58% 35%,75% 25%,65% 42%,82% 48%,65% 55%,75% 72%,58% 62%,50% 80%,42% 62%,25% 72%,35% 55%,18% 48%,35% 42%,25% 25%,42% 35%)', preview:'border-radius:50%;clip-path:polygon(50% 20%,58% 35%,75% 25%,65% 42%,82% 48%,65% 55%,75% 72%,58% 62%,50% 80%,42% 62%,25% 72%,35% 55%,18% 48%,35% 42%,25% 25%,42% 35%)' },
    { v:'gem',       label:'젬스톤',    icon:'💎', desc:'보석 커팅',           radius:'0',    clip:'polygon(50% 0%,85% 20%,100% 55%,75% 100%,25% 100%,0% 55%,15% 20%)',                         preview:'clip-path:polygon(50% 0%,85% 20%,100% 55%,75% 100%,25% 100%,0% 55%,15% 20%)' },
    { v:'flag',      label:'깃발',      icon:'🚩', desc:'깃발 삼각형',         radius:'0',    clip:'polygon(0% 0%,100% 0%,75% 50%,100% 100%,0% 100%)',                                           preview:'clip-path:polygon(0% 0%,100% 0%,75% 50%,100% 100%,0% 100%)' },
    { v:'pill',      label:'알약형',    icon:'💊', desc:'좌우 완전 타원',       radius:'50%',  clip:'none',                                                                                       preview:'border-radius:50px' },
    { v:'stadium',   label:'스타디움',  icon:'🏟️', desc:'좌우 둥근 직사각형',  radius:'50%',  clip:'none',                                                                                       preview:'border-radius:40% 40% 40% 40% / 60% 60% 60% 60%' },
    { v:'teardrop',  label:'물방울',    icon:'💧', desc:'아래 뾰족 물방울',     radius:'50% 50% 50% 50% / 60% 60% 40% 40%', clip:'none',                                                         preview:'border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;transform:rotate(45deg)' },
    { v:'moon',      label:'초승달',    icon:'🌙', desc:'초승달 모양',          radius:'50%',  clip:'ellipse(50% 50% at 65% 50%)',                                                                preview:'border-radius:50%;clip-path:ellipse(50% 50% at 65% 50%)' },
    { v:'tv',        label:'TV 화면',   icon:'📺', desc:'모서리 곡선 직사각형', radius:'14%',  clip:'none',                                                                                       preview:'border-radius:14%' },
    { v:'flower',    label:'꽃잎',      icon:'🌸', desc:'6잎 꽃 모양',          radius:'50%',  clip:'polygon(50% 5%,61% 29%,84% 20%,74% 44%,98% 50%,74% 56%,84% 80%,61% 71%,50% 95%,39% 71%,16% 80%,26% 56%,2% 50%,26% 44%,16% 20%,39% 29%)', preview:'border-radius:50%;clip-path:polygon(50% 5%,61% 29%,84% 20%,74% 44%,98% 50%,74% 56%,84% 80%,61% 71%,50% 95%,39% 71%,16% 80%,26% 56%,2% 50%,26% 44%,16% 20%,39% 29%)' },
    { v:'pac',       label:'팩맨',      icon:'🟡', desc:'팩맨 모양',            radius:'50%',  clip:'polygon(100% 35%,55% 50%,100% 65%,100% 100%,0% 100%,0% 0%,100% 0%)',                        preview:'border-radius:50%;clip-path:polygon(100% 35%,55% 50%,100% 65%,100% 100%,0% 100%,0% 0%,100% 0%)' },
    { v:'ring-cut',  label:'도넛컷',    icon:'⭕', desc:'외곽 링 느낌',          radius:'50%',  clip:'none',                                                                                       preview:'border-radius:50%;outline:4px solid currentColor;outline-offset:-4px' },
    { v:'kite',      label:'연(연풍)',   icon:'🪁', desc:'마름모 세로',           radius:'0',    clip:'polygon(50% 0%,100% 40%,50% 100%,0% 40%)',                                                   preview:'clip-path:polygon(50% 0%,100% 40%,50% 100%,0% 40%)' },
    { v:'notch',     label:'노치',       icon:'📱', desc:'상단 노치 사각형',      radius:'8px',  clip:'polygon(25% 0%,75% 0%,75% 12%,100% 12%,100% 100%,0% 100%,0% 12%,25% 12%)',                  preview:'border-radius:8px;clip-path:polygon(25% 0%,75% 0%,75% 12%,100% 12%,100% 100%,0% 100%,0% 12%,25% 12%)' },
    // ── 스포츠 대결 전용 모양 ──
    { v:'thunder',   label:'번개',       icon:'⚡', desc:'번개/스포츠 대결',      radius:'0',    clip:'polygon(30% 0%,65% 0%,45% 42%,75% 42%,18% 100%,38% 55%,8% 55%)',                            preview:'clip-path:polygon(30% 0%,65% 0%,45% 42%,75% 42%,18% 100%,38% 55%,8% 55%)' },
    { v:'versus',    label:'VS 방패',    icon:'🥊', desc:'VS 대결 방패형',        radius:'0',    clip:'polygon(0% 0%,100% 0%,100% 72%,50% 100%,0% 72%)',                                            preview:'clip-path:polygon(0% 0%,100% 0%,100% 72%,50% 100%,0% 72%)' },
    { v:'esports',   label:'e스포츠',    icon:'🎮', desc:'e스포츠 헥사 크레스트', radius:'0',    clip:'polygon(50% 0%,96% 18%,100% 62%,75% 100%,25% 100%,0% 62%,4% 18%)',                           preview:'clip-path:polygon(50% 0%,96% 18%,100% 62%,75% 100%,25% 100%,0% 62%,4% 18%)' },
    { v:'trophy',    label:'트로피',     icon:'🏆', desc:'트로피 실루엣',         radius:'0',    clip:'polygon(20% 0%,80% 0%,85% 30%,100% 30%,100% 45%,85% 45%,75% 68%,80% 80%,90% 85%,90% 100%,10% 100%,10% 85%,20% 80%,25% 68%,15% 45%,0% 45%,0% 30%,15% 30%)', preview:'clip-path:polygon(20% 0%,80% 0%,85% 30%,100% 30%,100% 45%,85% 45%,75% 68%,80% 80%,90% 85%,90% 100%,10% 100%,10% 85%,20% 80%,25% 68%,15% 45%,0% 45%,0% 30%,15% 30%)' },
    { v:'crown',     label:'왕관',       icon:'👑', desc:'왕관 크라운형',         radius:'0',    clip:'polygon(0% 100%,0% 40%,25% 65%,50% 0%,75% 65%,100% 40%,100% 100%)',                          preview:'clip-path:polygon(0% 100%,0% 40%,25% 65%,50% 0%,75% 65%,100% 40%,100% 100%)' },
    { v:'target',    label:'타겟',       icon:'🎯', desc:'과녁 원형 타겟',        radius:'50%',  clip:'none',                                                                                       preview:'border-radius:50%;outline:5px solid rgba(0,0,0,.25);outline-offset:-10px;box-shadow:inset 0 0 0 5px rgba(255,255,255,.5)' },
    { v:'fist',      label:'주먹',       icon:'✊', desc:'주먹 대결형',           radius:'0',    clip:'polygon(15% 0%,85% 0%,100% 15%,100% 60%,85% 80%,70% 100%,30% 100%,15% 80%,0% 60%,0% 15%)',  preview:'clip-path:polygon(15% 0%,85% 0%,100% 15%,100% 60%,85% 80%,70% 100%,30% 100%,15% 80%,0% 60%,0% 15%)' },
    { v:'arena',     label:'아레나',     icon:'🏟️', desc:'경기장 원형 배지',      radius:'50%',  clip:'polygon(50% 0%,90% 10%,100% 50%,90% 90%,50% 100%,10% 90%,0% 50%,10% 10%)',                   preview:'border-radius:50%;clip-path:polygon(50% 0%,90% 10%,100% 50%,90% 90%,50% 100%,10% 90%,0% 50%,10% 10%)' },
    { v:'medal',     label:'메달',       icon:'🥇', desc:'리본 달린 메달형',      radius:'50%',  clip:'polygon(25% 0%,75% 0%,75% 10%,100% 32%,100% 68%,75% 90%,75% 100%,25% 100%,25% 90%,0% 68%,0% 32%,25% 10%)', preview:'border-radius:50%;clip-path:polygon(25% 0%,75% 0%,75% 10%,100% 32%,100% 68%,75% 90%,75% 100%,25% 100%,25% 90%,0% 68%,0% 32%,25% 10%)' },
    { v:'saber',     label:'세이버',     icon:'⚔️', desc:'교차 칼날 대각선',      radius:'0',    clip:'polygon(0% 15%,15% 0%,100% 85%,85% 100%)',                                                   preview:'clip-path:polygon(0% 15%,15% 0%,100% 85%,85% 100%)' },
    { v:'blast',     label:'블라스트',   icon:'💥', desc:'폭발 방사형',           radius:'0',    clip:'polygon(50% 0%,56% 36%,78% 10%,62% 43%,95% 34%,73% 52%,100% 65%,68% 65%,82% 95%,55% 72%,50% 100%,45% 72%,18% 95%,32% 65%,0% 65%,27% 52%,5% 34%,38% 43%,22% 10%,44% 36%)',  preview:'clip-path:polygon(50% 0%,56% 36%,78% 10%,62% 43%,95% 34%,73% 52%,100% 65%,68% 65%,82% 95%,55% 72%,50% 100%,45% 72%,18% 95%,32% 65%,0% 65%,27% 52%,5% 34%,38% 43%,22% 10%,44% 36%)' },
    // ── 추가 모양 ──
    { v:'puzzle',    label:'퍼즐',       icon:'🧩', desc:'퍼즐 조각형',           radius:'8px',  clip:'polygon(0% 0%,40% 0%,40% 10%,60% 10%,60% 0%,100% 0%,100% 40%,90% 40%,90% 60%,100% 60%,100% 100%,60% 100%,60% 90%,40% 90%,40% 100%,0% 100%,0% 60%,10% 60%,10% 40%,0% 40%)', preview:'border-radius:8px;clip-path:polygon(0% 0%,40% 0%,40% 10%,60% 10%,60% 0%,100% 0%,100% 40%,90% 40%,90% 60%,100% 60%,100% 100%,60% 100%,60% 90%,40% 90%,40% 100%,0% 100%,0% 60%,10% 60%,10% 40%,0% 40%)' },
    { v:'ribbon-banner', label:'리본배너', icon:'🎀', desc:'양쪽 리본 끝장식',     radius:'0',    clip:'polygon(0% 0%,100% 0%,100% 80%,75% 80%,75% 100%,50% 80%,25% 100%,25% 80%,0% 80%)', preview:'clip-path:polygon(0% 0%,100% 0%,100% 80%,75% 80%,75% 100%,50% 80%,25% 100%,25% 80%,0% 80%)' },
    { v:'envelope',  label:'봉투형',     icon:'✉️', desc:'편지 봉투 모양',        radius:'4px',  clip:'polygon(0% 15%,50% 0%,100% 15%,100% 100%,0% 100%)', preview:'border-radius:4px;clip-path:polygon(0% 15%,50% 0%,100% 15%,100% 100%,0% 100%)' },
    { v:'spark',     label:'스파클',     icon:'✨', desc:'4방향 반짝임',          radius:'0',    clip:'polygon(50% 0%,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0% 50%,40% 40%)', preview:'clip-path:polygon(50% 0%,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0% 50%,40% 40%)' },
    { v:'tag-corner', label:'컷코너',    icon:'🏷️', desc:'모서리 살짝 컷',        radius:'0',    clip:'polygon(8% 0%,92% 0%,100% 8%,100% 92%,92% 100%,8% 100%,0% 92%,0% 8%)', preview:'clip-path:polygon(8% 0%,92% 0%,100% 8%,100% 92%,92% 100%,8% 100%,0% 92%,0% 8%)' },
    { v:'wave-bottom', label:'바텀웨이브', icon:'🌊', desc:'하단만 둥근 직사각',   radius:'0 0 50% 50% / 0 0 30% 30%', clip:'none', preview:'border-radius:0 0 50% 50% / 0 0 30% 30%' },
  ];

  function renderProfileShapeSection(){
    const body = document.getElementById('cfg-profileshape-body');
    if(!body) return;
    const shape = (()=>{ try{ return (localStorage.getItem('su_profile_shape')||'circle'); }catch(e){ return 'circle'; } })();
    const fx = (()=>{ try{ return (localStorage.getItem('su_profile_fx')||'none'); }catch(e){ return 'none'; } })();
    const pc = (()=>{ try{ return parseInt(localStorage.getItem('su_profile_scale_pc')||'100',10)||100; }catch(e){ return 100; } })();
    const tb = (()=>{ try{ return parseInt(localStorage.getItem('su_profile_scale_tb')||'96',10)||96; }catch(e){ return 96; } })();
    const mb = (()=>{ try{ return parseInt(localStorage.getItem('su_profile_scale_mb')||'92',10)||92; }catch(e){ return 92; } })();

    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div>
          <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:10px">📐 모양 (52가지)</div>
          <div style="margin-bottom:8px;padding:4px 10px;background:linear-gradient(135deg,#1e1b4b,#312e81);border-radius:8px;display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-size:10px;font-weight:900;color:#a5b4fc">⚔️ 스포츠 대결 NEW</span>
            <span style="font-size:10px;color:#c7d2fe">번개·VS방패·e스포츠·트로피·왕관·타겟·주먹·아레나·메달·세이버·블라스트</span>
          </div>
          <div style="margin-bottom:8px;padding:4px 10px;background:linear-gradient(135deg,#0f766e,#155e75);border-radius:8px;display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-size:10px;font-weight:900;color:#a5f3fc">🎉 추가 모양 NEW</span>
            <span style="font-size:10px;color:#cffafe">퍼즐·리본배너·봉투형·스파클·컷코너·바텀웨이브</span>
          </div>
          <div style="margin-bottom:10px;font-size:10px;color:var(--gray-l);font-weight:700">💡 퍼즐·스파클·컷코너처럼 디테일이 많은 모양은 작은 칩/리스트(28~32px)에서는 단순화되어 보입니다. 상세 페이지처럼 큰 영역에서 가장 잘 보입니다.</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:10px">
            ${_SHAPE_OPTIONS.map(s=>{
              const sel = shape===s.v;
              const isSports = ['thunder','versus','esports','trophy','crown','target','fist','arena','medal','saber','blast'].includes(s.v);
              const sampleBg = 'linear-gradient(135deg,#6366f1,#a855f7)';
              return `<button type="button" onclick="_setGlobalProfileShape('${s.v}');try{applyProfileShapeVars();}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){};try{window.SettingsStore&&typeof window.SettingsStore.markPrefsChanged==='function'&&window.SettingsStore.markPrefsChanged();}catch(e){};try{window._renderCfgProfileShapeSection&&window._renderCfgProfileShapeSection();}catch(e){}" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 10px;border-radius:14px;border:${sel?'2.5px solid var(--blue)':isSports?'1.5px solid #7c3aed':'1.5px solid var(--border)'};background:${sel?'linear-gradient(135deg,#eff6ff,#eef2ff)':isSports?'linear-gradient(135deg,#fdf4ff,#f5f3ff)':'var(--white)'};cursor:pointer;box-shadow:${sel?'0 0 0 3px #2563eb22':'none'};transition:all .15s">
                <div style="width:52px;height:52px;background:${sampleBg};${s.preview};flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.12)"></div>
                <span style="font-size:12px;font-weight:900;color:${sel?'var(--blue)':'var(--text2)'}">${s.label}</span>
                <span style="font-size:9px;color:var(--gray-l);font-weight:700;text-align:center;line-height:1.3">${s.desc}</span>
              </button>`;
            }).join('')}
          </div>
          <div style="font-size:11px;color:var(--gray-l);margin-top:8px">현재: <b>${(_SHAPE_OPTIONS.find(s=>s.v===shape)||_SHAPE_OPTIONS[0]).label}</b></div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:8px">📏 크기 배율 (탭/팝업 공통)</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="min-width:74px;font-size:12px;font-weight:800;color:var(--text2)">PC</div>
              <input type="range" min="70" max="130" step="2" value="${pc}" style="flex:1;accent-color:var(--blue)"
                oninput="localStorage.setItem('su_profile_scale_pc',String(this.value));document.getElementById('cfg-ps-pc').textContent=this.value+'%';try{applyProfileShapeVars();}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){};try{window.SettingsStore&&typeof window.SettingsStore.markPrefsChanged==='function'&&window.SettingsStore.markPrefsChanged();}catch(e){}">
              <div id="cfg-ps-pc" style="min-width:42px;text-align:right;font-size:11px;color:var(--gray-l);font-weight:900">${pc}%</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="min-width:74px;font-size:12px;font-weight:800;color:var(--text2)">태블릿</div>
              <input type="range" min="70" max="130" step="2" value="${tb}" style="flex:1;accent-color:var(--blue)"
                oninput="localStorage.setItem('su_profile_scale_tb',String(this.value));document.getElementById('cfg-ps-tb').textContent=this.value+'%';try{applyProfileShapeVars();}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){};try{window.SettingsStore&&typeof window.SettingsStore.markPrefsChanged==='function'&&window.SettingsStore.markPrefsChanged();}catch(e){}">
              <div id="cfg-ps-tb" style="min-width:42px;text-align:right;font-size:11px;color:var(--gray-l);font-weight:900">${tb}%</div>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="min-width:74px;font-size:12px;font-weight:800;color:var(--text2)">모바일</div>
              <input type="range" min="70" max="130" step="2" value="${mb}" style="flex:1;accent-color:var(--blue)"
                oninput="localStorage.setItem('su_profile_scale_mb',String(this.value));document.getElementById('cfg-ps-mb').textContent=this.value+'%';try{applyProfileShapeVars();}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){};try{window.SettingsStore&&typeof window.SettingsStore.markPrefsChanged==='function'&&window.SettingsStore.markPrefsChanged();}catch(e){}">
              <div id="cfg-ps-mb" style="min-width:42px;text-align:right;font-size:11px;color:var(--gray-l);font-weight:900">${mb}%</div>
            </div>
            <div style="font-size:11px;color:var(--gray-l)">※ 브라우저 폭 기준: 모바일(≤768) / 태블릿(≤1024) / PC(그 외)</div>
          </div>
        </div>
        <div>
          <div style="font-size:12px;font-weight:900;color:var(--text2);margin-bottom:8px">✨ 효과</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${[['none','없음'],['shadow','그림자'],['ring','링'],['both','링+그림자'],['glow','글로우'],['glow-color','컬러 글로우'],['blur-edge','외곽 블러'],['vintage','빈티지'],['sepia','세피아'],['grayscale','흑백'],['invert','반전']].map(([k,l])=>`<button class="btn btn-xs ${(fx===k)?'btn-b':'btn-w'}" onclick="localStorage.setItem('su_profile_fx','${k}');try{applyProfileShapeVars();}catch(e){};try{window._cfgSoftRefreshLive&&window._cfgSoftRefreshLive();}catch(e){};try{window._scheduleCloudAppSettingsSave&&window._scheduleCloudAppSettingsSave();}catch(e){};try{window.SettingsStore&&typeof window.SettingsStore.markPrefsChanged==='function'&&window.SettingsStore.markPrefsChanged();}catch(e){};try{window._renderCfgProfileShapeSection&&window._renderCfgProfileShapeSection();}catch(e){}">${l}</button>`).join('')}
          </div>
          <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 효과는 프로필 이미지(사진/플레이스홀더)에 공통 적용됩니다</div>
        </div>
      </div>
    `;
  }

  window.renderCfgProfileShapeCard = renderCfgProfileShapeCard;
  window._renderCfgProfileShapeSection = renderProfileShapeSection;
  window.SettingsModules.profile = {
    renderCfgProfileShapeCard,
    renderProfileShapeSection
  };
})();
