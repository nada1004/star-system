/* ══════════════════════════════════════════════════════════════
   일반 대회 브리핑 (조별리그 브리핑 / 토너먼트 브리핑 / 대회 브리핑)
   - 현황판(보드2) 주간 브리핑의 b2w2-* 디자인 시스템을 그대로 재사용
   ══════════════════════════════════════════════════════════════ */

/* ── 공통 유틸 ── */
function _cbUcol(n){ try{ const c=(typeof gc==='function'&&n)?gc(n):''; return c||'#64748b'; }catch(e){ return '#64748b'; } }

/* 다크 스코어보드 카드(프로리그/프로리그 대회 브리핑) 전용 — 대학별로 설정된
   색상은 밝기·채도가 제각각이라(짙은 네이비/회색 계열 등) 다크 배경 위에서
   특정 순위(예: 2등)만 유독 안 보이는 문제가 있었음. 모든 색상의 밝기·채도를
   동일한 하한선 이상으로 끌어올려, 어떤 대학 색이든 다크 배경 위에서
   일관되게 또렷이 보이도록 보정한다. */
function _cbHexToHsl(hex){
  hex=String(hex||'').replace('#','');
  if(hex.length===3) hex=hex.split('').map(c=>c+c).join('');
  if(hex.length!==6) return [210,15,45];
  const r=parseInt(hex.slice(0,2),16)/255, g=parseInt(hex.slice(2,4),16)/255, b=parseInt(hex.slice(4,6),16)/255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b);
  let h=0,s=0; const l=(max+min)/2;
  if(max!==min){
    const d=max-min;
    s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){
      case r: h=(g-b)/d+(g<b?6:0); break;
      case g: h=(b-r)/d+2; break;
      default: h=(r-g)/d+4;
    }
    h/=6;
  }
  return [h*360,s*100,l*100];
}
function _cbHslToHex(h,s,l){
  h=((h%360)+360)%360/360; s=Math.max(0,Math.min(100,s))/100; l=Math.max(0,Math.min(100,l))/100;
  let r,g,b;
  if(s===0){ r=g=b=l; } else {
    const hue2rgb=(p,q,t)=>{ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6) return p+(q-p)*6*t; if(t<1/2) return q; if(t<2/3) return p+(q-p)*(2/3-t)*6; return p; };
    const q=l<0.5?l*(1+s):l+s-l*s, p=2*l-q;
    r=hue2rgb(p,q,h+1/3); g=hue2rgb(p,q,h); b=hue2rgb(p,q,h-1/3);
  }
  const toHex=x=>{ const v=Math.round(x*255).toString(16); return v.length===1?'0'+v:v; };
  return '#'+toHex(r)+toHex(g)+toHex(b);
}
function _cbLegibleColor(hex){
  try{
    const [h,s,l]=_cbHexToHsl(hex);
    const s2=Math.max(s,42), l2=Math.min(Math.max(l,58),84);
    return _cbHslToHex(h,s2,l2);
  }catch(e){ return hex||'#7dd3fc'; }
}
/* 다크 카드 위에서 항상 또렷이 보이는 대학 색상 — 프로리그/프로리그 대회
   브리핑(plb-, pcb- 전용 렌더링)에서 텍스트/포인트 색으로 쓸 때는 _cbUcol
   대신 이 함수를 사용한다. */
function _cbUcolVivid(n){ return _cbLegibleColor(_cbUcol(n)); }

/* (개선, 2026-08-20) 라이트 종이톤 배경 위에서 팀 색이 너무 밝은 파스텔이거나
   채도가 낮으면 글자·배지가 크림색 배경에 묻혀 잘 안 보이는 문제가 있었다.
   명도 상한(과도하게 밝지 않게) + 채도 하한(너무 흐릿하지 않게)을 걸어 보정한다.
   _cbUcolVivid(다크 배경용, 최소 밝기 보장)의 라이트 배경 버전 — 일반 대회 브리핑
   (cbs-wrap, 라이트 종이톤)의 텍스트/배지 색으로 팀 색을 쓸 때는 이걸 사용한다. */
function _cbLegibleColorForLight(hex){
  try{
    const [h,s,l]=_cbHexToHsl(hex);
    const s2=Math.max(s,35), l2=Math.min(Math.max(l,24),56);
    return _cbHslToHex(h,s2,l2);
  }catch(e){ return hex||'#475569'; }
}
function _cbUcolLight(n){ return _cbLegibleColorForLight(_cbUcol(n)); }

function _cbFmtD(d){ return d?String(d).slice(2).replace(/-/g,'.'):''; }
function _cbPct(a,b){ return b?Math.round(a/b*100):0; }
function _cbEsc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* 완료된 경기의 실제 '판'(개별 게임) 총수 — 세트 안 games[] 중 승자가 정해진 것만 집계 */
function _cbTotalGames(matches){
  let n=0;
  (matches||[]).forEach(m=>{
    if(!m.done) return;
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{ if(g&&(g.winner==='A'||g.winner==='B')) n++; });
    });
  });
  return n;
}

/* 조별리그 전 경기 수집 */
function _cbLeagueMatches(tn){
  const out=[];
  (tn?.groups||[]).forEach((grp,gi)=>{
    const gl='ABCDEFGHIJ'[gi]||String(gi+1);
    (grp.matches||[]).forEach((m,mi)=>{
      out.push({...m,grpName:grp.name||`${gl}조`,grpLetter:gl,grpIdx:gi,matchNum:mi+1,
        done:(m.sa!=null&&m.sb!=null)});
    });
  });
  return out;
}

/* 대진표(토너먼트) 전 경기 수집 — 라운드 라벨 포함 */
function _cbBktMatches(tn){
  const out=[];
  if(!tn) return out;
  const br=(typeof getBracket==='function')?getBracket(tn):(tn.bracket||{});
  const firstSize=(typeof _bktComputeBracketSize==='function')?_bktComputeBracketSize(tn):8;
  let totalRounds=0,n=Math.max(2,firstSize);
  while(n>1){ n=Math.ceil(n/2); totalRounds++; }
  if(!totalRounds) totalRounds=1;
  const roundLabels={1:'결승',2:'4강',3:'8강',4:'16강',5:'32강',6:'64강',7:'128강',8:'256강'};
  Object.keys(br.matchDetails||{}).forEach(k=>{
    const m=br.matchDetails[k]; if(!m) return;
    const [rs,mis]=String(k).split('-');
    const r=parseInt(rs,10), mi=parseInt(mis,10);
    const rNum=totalRounds-r;
    const rLabel=roundLabels[rNum]||(Math.pow(2,Math.max(1,rNum))+'강');
    const done=m.sa!=null&&m.sb!=null;
    const winner=done?(m.sa>m.sb?m.a:m.sb>m.sa?m.b:''):'';
    out.push({...m,r,mi,rLabel,done,winner,isManual:false});
  });
  (br.manualMatches||[]).forEach((m,idx)=>{
    if(!m) return;
    const done=m.sa!=null&&m.sb!=null;
    const winner=done?(m.sa>m.sb?m.a:m.sb>m.sa?m.b:''):'';
    out.push({...m,r:-1,mi:idx,rLabel:m.rndLabel||'토너먼트 경기',done,winner,isManual:true});
  });
  out.sort((a,b)=>(a.r===-1?9999:a.r)-(b.r===-1?9999:b.r)||a.mi-b.mi);
  return out;
}

/* 팀(대학) 단위 집계 */
function _cbTeamStats(matches){
  const st={};
  const ens=(u)=>{ if(u&&!st[u]) st[u]={u,w:0,l:0,sw:0,sl:0,g:0,form:[]}; };
  matches.forEach(m=>{
    ens(m.a); ens(m.b);
    if(!m.done||!m.a||!m.b) return;
    st[m.a].g++; st[m.b].g++;
    st[m.a].sw+=m.sa; st[m.a].sl+=m.sb;
    st[m.b].sw+=m.sb; st[m.b].sl+=m.sa;
    if(m.sa>m.sb){ st[m.a].w++; st[m.b].l++; st[m.a].form.push(1); st[m.b].form.push(0); }
    else if(m.sb>m.sa){ st[m.b].w++; st[m.a].l++; st[m.b].form.push(1); st[m.a].form.push(0); }
  });
  return Object.values(st).map(s=>({...s,diff:s.sw-s.sl,rate:s.g?Math.round(s.w/s.g*100):0}))
    .sort((a,b)=>b.w-a.w||b.diff-a.diff||b.sw-a.sw);
}

/* 선수 단위 집계 (조별/대진표 phase 지정) */
function _cbPlayerStats(matches){
  const ps={};
  const ens=(n)=>{ if(!ps[n]) ps[n]={name:n,w:0,l:0,form:[]}; };
  matches.forEach(m=>{
    if(!m.done) return;
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner) return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        ens(wn); ens(ln);
        ps[wn].w++; ps[ln].l++;
        ps[wn].form.push({d:m.d||'',win:true});
        ps[ln].form.push({d:m.d||'',win:false});
      });
    });
  });
  return Object.values(ps).map(p=>{
    const total=p.w+p.l;
    const all=p.form.slice().sort((a,b)=>(a.d||'').localeCompare(b.d||''));
    let streak=0,sw=null;
    for(let i=all.length-1;i>=0;i--){ if(sw===null){sw=all[i].win;streak=1;} else if(all[i].win===sw){streak++;} else break; }
    const pObj=(typeof players!=='undefined'?players:[]).find(x=>x.name===p.name);
    return {...p,total,rate:total?Math.round(p.w/total*100):0,streak,streakWin:sw,univ:pObj?pObj.univ:''};
  }).filter(p=>p.total>0);
}

/* ── 공용 UI 조각 ── */

/* (재설계 v4, 2026-08-20) 프로리그(plb-*)와 명확히 구분되는 "토너먼트 프로그램 표지" 컨셉
   - 라이트 종이톤 베이스 + 큰 세리프 타이포 + 따뜻한 파스텔 액센트
   - 상단 TTS 듣기 버튼 (메타바 우측)
   - 일반 기록(reflect general record) 섹션 자동 주입
   - 좌측 세로 띠 / 우측 메달 / 점선 제거 — 깔끔한 매거진 톤
   - 2026-08-20 패치: 다크모드 지원 추가 (body.dark .cbs-wrap 변수 오버라이드)
     기존엔 "다크모드에서도 라이트 종이톤 유지" 주석이 있어 다크 모드에서 흰색
     배경이 그대로 남아 어색했는데, 대회 브리핑만 유독 다크 적용이 안 되는 문제
     를 해결하기 위해 다크 모드용 토큰/배경 오버라이드를 추가했다. */
function _cbInjectShellStyle(){
  if(typeof document==='undefined')return;
  if(document.getElementById('cbs-shell-style'))return;
  const s=document.createElement('style');
  s.id='cbs-shell-style';
  s.textContent=[
    /* === 액센트 토큰 (따뜻한 파스텔, 라이트) === */
    '.cbs-wrap.tone-mt{--cbs-accent:#0d9488;--cbs-accent-2:#14b8a6;--cbs-accent-soft:#99f6e4;--cbs-accent-bg:#ecfdf5;--cbs-glow:rgba(20,184,166,.28);--cbs-paper:#fdfcf8;--cbs-paper-2:#faf8f3;--cbs-paper-3:#f5f3ed;--cbs-ink:#0f172a;--cbs-ink-mid:#57534e;--cbs-ink-soft:#78716c;--cbs-ink-mute:#8a8074;--cbs-rule:#e7e2d4;--cbs-rule-2:#efe9da;--cbs-card:#fbf8f2}',
    '.cbs-wrap.tone-pc{--cbs-accent:#ea580c;--cbs-accent-2:#f97316;--cbs-accent-soft:#fed7aa;--cbs-accent-bg:#fff7ed;--cbs-glow:rgba(249,115,22,.28);--cbs-paper:#fdfcf8;--cbs-paper-2:#faf8f3;--cbs-paper-3:#f5f3ed;--cbs-ink:#0f172a;--cbs-ink-mid:#57534e;--cbs-ink-soft:#78716c;--cbs-ink-mute:#8a8074;--cbs-rule:#e7e2d4;--cbs-rule-2:#efe9da;--cbs-card:#fbf8f2}',
    '.cbs-wrap.tone-lv{--cbs-accent:#7c3aed;--cbs-accent-2:#a855f7;--cbs-accent-soft:#ddd6fe;--cbs-accent-bg:#faf5ff;--cbs-glow:rgba(168,85,247,.28);--cbs-paper:#fdfcf8;--cbs-paper-2:#faf8f3;--cbs-paper-3:#f5f3ed;--cbs-ink:#0f172a;--cbs-ink-mid:#57534e;--cbs-ink-soft:#78716c;--cbs-ink-mute:#8a8074;--cbs-rule:#e7e2d4;--cbs-rule-2:#efe9da;--cbs-card:#fbf8f2}',
    /* === 컨테이너 (종이톤 — 좌측 띠 제거) === */
    '.cbs-wrap{font-family:"Noto Sans KR",sans-serif;max-width:100%;border-radius:18px;overflow:hidden;box-shadow:0 12px 32px rgba(15,23,42,.10);background:var(--cbs-paper,#fdfcf8);color:var(--cbs-ink,#0f172a);position:relative}',
    /* === 상단 메타바 (얇은 회색 띠 + TTS 버튼) === */
    '.cbs-metabar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 22px;background:var(--cbs-paper-3,#f5f3ed);border-bottom:1px solid var(--cbs-rule,#e7e2d4);font-size:10.5px;font-weight:800;letter-spacing:.18em;color:var(--cbs-ink-soft,#78716c);text-transform:uppercase}',
    '.cbs-metabar-l{display:flex;align-items:center;gap:10px}',
    '.cbs-metabar-issue{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;background:var(--cbs-card,#fff);border:1px solid #d6cfbe;border-radius:4px;color:var(--cbs-ink-mid,#57534e)}',
    '.cbs-metabar-issue::before{content:"";width:6px;height:6px;background:var(--cbs-accent);border-radius:99px}',
    '.cbs-metabar-r{display:flex;align-items:center;gap:8px}',
    /* TTS 듣기 버튼 (메타바 우측) */
    '.cbs-speak-btn{font-family:inherit;font-size:10.5px;font-weight:800;letter-spacing:.04em;color:#fff;background:var(--cbs-accent);border:1px solid var(--cbs-accent-2);border-radius:4px;padding:5px 12px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;text-transform:none;transition:filter .12s,transform .12s}',
    '.cbs-speak-btn:hover{filter:brightness(1.06);transform:translateY(-1px)}',
    '.cbs-speak-btn:active{transform:translateY(0)}',
    '.cbs-speak-btn.is-speaking{background:#dc2626;border-color:#dc2626}',
    /* === 히어로 (메달 제거, 큰 타이포만) === */
    '.cbs-hero{position:relative;padding:30px 26px;overflow:hidden;background:linear-gradient(180deg,var(--cbs-card,#ffffff) 0%,var(--cbs-paper-2,#faf8f3) 100%)}',
    '.cbs-hero-main{position:relative;z-index:1;min-width:0}',
    '.cbs-hero-kicker{position:relative;display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:900;letter-spacing:.18em;color:var(--cbs-accent);text-transform:uppercase;margin-bottom:10px}',
    '.cbs-hero-kicker::before{content:"";width:24px;height:2px;background:var(--cbs-accent)}',
    '.cbs-hero-title{position:relative;font-family:"Noto Serif KR",Georgia,serif;font-size:clamp(26px,4.5vw,38px);font-weight:900;color:var(--cbs-ink,#0f172a);letter-spacing:-.02em;line-height:1.1}',
    '.cbs-hero-desc{position:relative;margin-top:10px;font-size:13px;font-weight:500;color:var(--cbs-ink-mid,#57534e);max-width:62ch;line-height:1.55}',
    '.cbs-hero-headline{position:relative;margin-top:14px;display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:800;color:var(--cbs-accent);padding:0}',
    /* === KPI 그리드 === */
    '.cbs-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:22px;padding:0 26px;background:var(--cbs-paper-2,#faf8f3);position:relative;z-index:1}',
    '.cbs-kpi-card{position:relative;padding:12px 14px;background:var(--cbs-card,#fff);border:1px solid var(--cbs-rule,#e7e2d4);border-radius:10px;box-shadow:0 2px 0 rgba(15,23,42,.04)}',
    '.cbs-kpi-card::before{content:"";position:absolute;left:0;top:14px;bottom:14px;width:3px;background:var(--kpi-accent,var(--cbs-accent));border-radius:0 2px 2px 0}',
    '.cbs-kpi-label{font-size:10px;font-weight:900;letter-spacing:.06em;color:var(--cbs-ink-soft,#78716c);text-transform:uppercase}',
    '.cbs-kpi-value{margin-top:4px;font-size:20px;font-weight:900;color:var(--cbs-ink,#0f172a);letter-spacing:-.02em;font-variant-numeric:tabular-nums}',
    '.cbs-kpi-sub{margin-top:2px;font-size:10.5px;font-weight:600;color:var(--cbs-ink-mute,#a8a29e)}',
    /* === 본문 (상단 점선 제거) === */
    '.cbs-body{background:var(--cbs-paper-2,#faf8f3);padding:24px 22px 32px}',
    /* === 일반 기록 (general record) 섹션 === */
    '.cbs-general{background:var(--cbs-card,#fff);border:1px solid var(--cbs-rule,#e7e2d4);border-radius:12px;padding:18px 20px;margin-bottom:18px;box-shadow:0 2px 0 rgba(15,23,42,.04)}',
    '.cbs-general-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:10px;margin-bottom:14px;border-bottom:1.5px solid var(--cbs-rule,#e7e2d4)}',
    '.cbs-general-title{font-size:14.5px;font-weight:900;color:var(--cbs-ink,#0f172a);display:flex;align-items:center;gap:8px}',
    '.cbs-general-title b{color:var(--cbs-accent)}',
    '.cbs-general-sub{font-size:11px;color:var(--cbs-ink-soft,#78716c);font-weight:700}',
    '.cbs-general-tag{font-size:10.5px;font-weight:800;padding:3px 9px;border-radius:6px;background:var(--cbs-accent-bg);color:var(--cbs-accent);border:1.5px solid var(--cbs-accent)}',
    '.cbs-general-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}',
    '.cbs-general-card{position:relative;padding:11px 13px;background:var(--cbs-paper-2,#faf8f3);border:1px solid var(--cbs-rule,#e7e2d4);border-radius:10px}',
    '.cbs-general-card::before{content:"";position:absolute;left:0;top:11px;bottom:11px;width:3px;background:var(--cbs-accent);border-radius:0 2px 2px 0}',
    '.cbs-general-lbl{font-size:10px;font-weight:900;letter-spacing:.06em;color:var(--cbs-ink-soft,#78716c);text-transform:uppercase}',
    '.cbs-general-val{margin-top:4px;font-size:18px;font-weight:900;color:var(--cbs-ink,#0f172a);letter-spacing:-.02em;font-variant-numeric:tabular-nums}',
    '.cbs-general-val b{color:var(--cbs-accent)}',
    '.cbs-general-meta{margin-top:2px;font-size:10.5px;font-weight:600;color:var(--cbs-ink-mute,#a8a29e)}',
    /* === 기존 b2w2-* 라이트 톤 오버라이드 (다크 토큰이 정의되지 않은 폴백 포함) === */
    /* cbs-wrap 안의 b2w2-wrap이 자체 --b2w-* 토큰을 새로 갖도록 강제.
       이렇게 두면 인라인에서 var(--b2w-paper-alt,...)로 색을 지정한 자식들(예: 라운드 카드,
       MVP 카드 등)도 다크모드에서 자동으로 cbs-* 토큰을 따라간다. */
    /* !important 필수: 주간 현황판(board2-briefing.css)에 정의된 "body.dark .b2w2-wrap"
       규칙이 (body 타입 셀렉터가 붙어) 이 규칙보다 CSS 명시도가 높아서, !important 없이는
       실제 다크모드에서 이 카드 안 색상 토큰이 cbs-* 값 대신 주간 현황판의 다크 토큰으로
       덮어써지는 문제가 있었다. 항상 cbs-wrap이 자신의 톤(라이트/다크)을 강제하도록 고정. */
    '.cbs-wrap .b2w2-wrap{background:transparent!important;box-shadow:none!important;border-radius:0!important;color:var(--cbs-ink,#0f172a)!important;--b2w-paper:var(--cbs-paper-2)!important;--b2w-paper-alt:var(--cbs-card)!important;--b2w-paper-warm:var(--cbs-paper-3)!important;--b2w-ink:var(--cbs-ink)!important;--b2w-ink-mid:var(--cbs-ink-mid)!important;--b2w-ink-soft:var(--cbs-ink-soft)!important;--b2w-rule:var(--cbs-rule)!important;--b2w-rule-soft:var(--cbs-rule-2)!important;--b2w-rule-hard:var(--cbs-rule)!important;--b2w-shadow:0 2px 0 rgba(15,23,42,.04)!important}',
    '.cbs-wrap .b2w2-masthead{display:none}',
    '.cbs-wrap .b2w2-hero{background:transparent!important;padding:0!important;border:0!important;display:none!important}',
    '.cbs-wrap .b2w2-hero-main,.cbs-wrap .b2w2-hero-meta{display:none}',
    '.cbs-wrap .b2w2-sec{background:var(--cbs-card,#fff)!important;border:1px solid var(--cbs-rule,#e7e2d4)!important;border-radius:12px!important;padding:18px 20px!important;margin-bottom:18px!important;color:var(--cbs-ink,#0f172a)!important;box-shadow:0 2px 0 rgba(15,23,42,.04)!important}',
    '.cbs-wrap .b2w2-sec-head{border-bottom:1.5px solid var(--cbs-rule,#e7e2d4)!important;color:var(--cbs-ink,#0f172a)!important;padding-bottom:10px!important}',
    '.cbs-wrap .b2w2-sec-title{color:var(--cbs-ink,#0f172a)!important;font-weight:900!important}',
    '.cbs-wrap .b2w2-sec-num{background:var(--cbs-accent)!important;color:#fff!important;font-family:"Noto Serif KR",Georgia,serif!important}',
    '.cbs-wrap .b2w2-sec-sub{color:var(--cbs-ink-soft,#78716c)!important}',
    '.cbs-wrap .b2w2-sec-tag{background:var(--cbs-accent-bg)!important;color:var(--cbs-accent)!important;border:1.5px solid var(--cbs-accent)!important;font-weight:800!important}',
    '.cbs-wrap .b2w2-table{background:transparent!important;color:var(--cbs-ink,#0f172a)!important}',
    '.cbs-wrap .b2w2-table th{background:var(--cbs-paper-3,#f5f3ed)!important;color:var(--cbs-ink-mid,#57534e)!important;border-color:var(--cbs-rule,#e7e2d4)!important;font-weight:900!important;letter-spacing:.04em;text-transform:uppercase;font-size:10.5px!important}',
    '.cbs-wrap .b2w2-table td{background:transparent!important;color:var(--cbs-ink,#0f172a)!important;border-color:var(--cbs-rule-2,#efe9da)!important}',
    '.cbs-wrap .b2w2-table tr:hover td{background:var(--cbs-accent-bg)!important}',
    '.cbs-wrap .b2w2-table tr:nth-child(even) td{background:var(--cbs-paper-2,#faf8f3)!important}',
    '.cbs-wrap .b2w2-table tr:nth-child(even):hover td{background:var(--cbs-accent-bg)!important}',
    '.cbs-wrap .b2w2-card{background:var(--cbs-card,#fff)!important;border:1px solid var(--cbs-rule,#e7e2d4)!important;border-top:1px solid var(--cbs-rule,#e7e2d4)!important;border-radius:12px!important;color:var(--cbs-ink,#0f172a)!important;box-shadow:0 2px 0 rgba(15,23,42,.04)!important}',
    '.cbs-wrap .b2w2-mini{background:var(--cbs-paper-2,#faf8f3)!important;border:1px solid var(--cbs-rule,#e7e2d4)!important;color:var(--cbs-ink,#0f172a)!important;border-radius:10px!important}',
    '.cbs-wrap .b2w2-mini-name{color:var(--cbs-ink,#0f172a)!important;font-weight:900!important}',
    '.cbs-wrap .b2w2-mini-meta{color:var(--cbs-ink-soft,#78716c)!important}',
    '.cbs-wrap .b2w2-list-item{background:var(--cbs-card,#fff)!important;border:1px solid var(--cbs-rule,#e7e2d4)!important;color:var(--cbs-ink,#0f172a)!important;border-radius:10px!important;box-shadow:0 1px 0 rgba(15,23,42,.04)!important}',
    '.cbs-wrap .b2w2-list-item.is-alt{background:var(--cbs-paper-2,#faf8f3)!important}',
    '.cbs-wrap .b2w2-list-item:hover{background:var(--cbs-accent-bg)!important;border-color:var(--cbs-accent)!important}',
    /* 순위 리스트 행 호버 — 클릭 요소는 아니지만, 마우스 올린 줄이 살짝 밀리면서
       그림자가 짙어져 "지금 어느 줄을 보는지" 스캔하기 쉬워지도록 한다. */
    '.cbs-wrap .b2w2-rank-row:hover{transform:translateX(3px);box-shadow:0 6px 16px rgba(15,23,42,.10)}',
    '.cbs-wrap .b2w2-stat-pill{background:var(--cbs-accent-bg)!important;color:var(--cbs-accent)!important;border:1.5px solid var(--cbs-accent)!important;font-weight:800!important}',
    '.cbs-wrap .b2w2-kpi-grid,.cbs-wrap .b2w2-kpi-card{display:none!important}',
    /* === 인라인 #fff 폴백이 들어간 자식 요소들도 토큰화 === */
    '.cbs-wrap [style*="background:#fff"],.cbs-wrap [style*="background: #fff"],.cbs-wrap [style*="background:#fffdf9"],.cbs-wrap [style*="background: #fffdf9"]{background:var(--cbs-card,#fff)!important;color:var(--cbs-ink,#0f172a)!important}',
    '.cbs-wrap [style*="background:#faf8f3"],.cbs-wrap [style*="background: #faf8f3"]{background:var(--cbs-paper-2,#faf8f3)!important;color:var(--cbs-ink,#0f172a)!important}',
    '.cbs-wrap [style*="color:#0f172a"],.cbs-wrap [style*="color: #0f172a"]{color:var(--cbs-ink,#0f172a)!important}',
    '.cbs-wrap [style*="color:#57534e"],.cbs-wrap [style*="color: #57534e"]{color:var(--cbs-ink-mid,#57534e)!important}',
    '.cbs-wrap [style*="color:#78716c"],.cbs-wrap [style*="color: #78716c"]{color:var(--cbs-ink-soft,#78716c)!important}',
    '.cbs-wrap [style*="color:#a8a29e"],.cbs-wrap [style*="color: #a8a29e"]{color:var(--cbs-ink-mute,#a8a29e)!important}',
    '.cbs-wrap [style*="border:1px solid #e7e2d4"],.cbs-wrap [style*="border: 1px solid #e7e2d4"]{border-color:var(--cbs-rule,#e7e2d4)!important}',
    /* === cbf-sec (섹션) 의 상단 1px 라인도 다크 토큰 사용 === */
    '.cbs-wrap .b2w2-wrap > .cbf-sec{border-top-color:var(--cbs-rule,#e7e2d4)!important}',
    /* === cbs-sec-num (섹션 번호 배지) 색 보정 === */
    '.cbs-wrap .b2w2-sec-num{background:var(--cbs-accent)!important;color:#fff!important}',
    /* === cbs-wrap 자체 그림자: 다크에서는 더 강하게 === */
    'body.dark .cbs-wrap{box-shadow:0 16px 40px rgba(0,0,0,.5)}',
    /* === 다크 모드 오버라이드 (토큰만 갈아끼움) === */
    'body.dark .cbs-wrap.tone-mt{--cbs-accent:#2dd4bf;--cbs-accent-2:#5eead4;--cbs-accent-soft:#134e4a;--cbs-accent-bg:rgba(45,212,191,.12);--cbs-paper:#0b1220;--cbs-paper-2:#0f172a;--cbs-paper-3:#1e293b;--cbs-ink:#e2e8f0;--cbs-ink-mid:#cbd5e1;--cbs-ink-soft:#94a3b8;--cbs-ink-mute:#64748b;--cbs-rule:rgba(148,163,184,.18);--cbs-rule-2:rgba(148,163,184,.10);--cbs-card:#1e293b}',
    'body.dark .cbs-wrap.tone-pc{--cbs-accent:#fb923c;--cbs-accent-2:#fdba74;--cbs-accent-soft:#7c2d12;--cbs-accent-bg:rgba(251,146,60,.14);--cbs-paper:#0b1220;--cbs-paper-2:#0f172a;--cbs-paper-3:#1e293b;--cbs-ink:#e2e8f0;--cbs-ink-mid:#cbd5e1;--cbs-ink-soft:#94a3b8;--cbs-ink-mute:#64748b;--cbs-rule:rgba(148,163,184,.18);--cbs-rule-2:rgba(148,163,184,.10);--cbs-card:#1e293b}',
    'body.dark .cbs-wrap.tone-lv{--cbs-accent:#a78bfa;--cbs-accent-2:#c4b5fd;--cbs-accent-soft:#4c1d95;--cbs-accent-bg:rgba(167,139,250,.14);--cbs-paper:#0b1220;--cbs-paper-2:#0f172a;--cbs-paper-3:#1e293b;--cbs-ink:#e2e8f0;--cbs-ink-mid:#cbd5e1;--cbs-ink-soft:#94a3b8;--cbs-ink-mute:#64748b;--cbs-rule:rgba(148,163,184,.18);--cbs-rule-2:rgba(148,163,184,.10);--cbs-card:#1e293b}',
    /* 다크에서만 보이는 미세한 박스 그림자 */
    'body.dark .cbs-wrap{box-shadow:0 16px 40px rgba(0,0,0,.55)}',
    'body.dark .cbs-wrap .b2w2-card,body.dark .cbs-wrap .b2w2-sec,body.dark .cbs-wrap .cbs-general,body.dark .cbs-wrap .cbs-kpi-card{box-shadow:0 2px 0 rgba(0,0,0,.4)!important}'
  ].join('');
  document.head.appendChild(s);
}

/* kicker 문자열로 토큰 결정 (따뜻한 파스텔 톤) */
function _cbToneOf(kicker){
  const k=String(kicker||'').toLowerCase();
  if(k.includes('league')||k.includes('조별')||k.includes('조편'))return 'tone-mt';
  if(k.includes('tournament')||k.includes('토너먼트')||k.includes('대진'))return 'tone-pc';
  return 'tone-lv';
}

/* 일반 기록(reflect general record) — 대회(tn) 단위의 "일반 탭 기록"만 반영
   - 사용자가 "현재 일반 기록에 전체 기록 반영 된거 같은데"라고 지적한 케이스:
     기존엔 (typeof players!=='undefined'?players:[])의 전역 history를 집계해
     모든 시즌 통산 전적이 섞여 들어가는 버그가 있었다.
     대회 브리핑에서는 그 대회의 tn.normalMatches(일반 탭에서 입력한 경기)만
     집계해서 보여주는 게 의도된 동작이므로, tn을 인자로 받아 그 대회 데이터만
     사용하도록 수정한다.
   - 데이터가 0건이면 섹션 자체를 숨긴다("기록 반영하기 없으면 표시 없고"). */
function _cbGeneralRecordHTML(tn){
  if(!tn) return '';
  const nmAll = Array.isArray(tn.normalMatches) ? tn.normalMatches : [];
  const nmDone = nmAll.filter(m=>m && m.sa!=null && m.sb!=null);
  if(!nmDone.length) return '';
  // 일반 탭의 모든 게임(세트 안의 개별 game)을 펼쳐서 선수 단위로 집계
  const ps = {}; // name -> {w,l,form:[]}
  const dates = [];
  // (버그픽스, 2026-08-20) 일반 탭은 매치마다 서로 다른 대학(a vs b) 조합이 섞여 있는데,
  // 기존엔 "이긴 쪽이면 무조건 teamW++"로 세서 서로 다른 대학들의 승수가 하나로
  // 뭉뚱그려져 "1승 2패"처럼 의미 없는 숫자가 나왔다. 대학별로 승패를 따로 집계해
  // "가장 많이 이긴 팀"을 보여주는 것으로 교체한다.
  const teamStats = {}; // u -> {u,w,l,history:[{d,win}]} — 팀별로 승패 이력을 따로 쌓아
                          // "최근 5경기"를 특정 팀(가장 많이 이긴 팀) 기준으로 보여줄 수 있게 한다
  nmDone.forEach(m=>{
    if(m.d) dates.push(m.d);
    if(m.a){ if(!teamStats[m.a]) teamStats[m.a]={u:m.a,w:0,l:0,history:[]}; }
    if(m.b){ if(!teamStats[m.b]) teamStats[m.b]={u:m.b,w:0,l:0,history:[]}; }
    if(m.sa>m.sb){
      if(m.a){ teamStats[m.a].w++; teamStats[m.a].history.push({d:m.d||'', win:true}); }
      if(m.b){ teamStats[m.b].l++; teamStats[m.b].history.push({d:m.d||'', win:false}); }
    } else if(m.sb>m.sa){
      if(m.b){ teamStats[m.b].w++; teamStats[m.b].history.push({d:m.d||'', win:true}); }
      if(m.a){ teamStats[m.a].l++; teamStats[m.a].history.push({d:m.d||'', win:false}); }
    }
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g || !g.playerA || !g.playerB || !g.winner) return;
        const wn = g.winner==='A' ? g.playerA : g.playerB;
        const ln = g.winner==='A' ? g.playerB : g.playerA;
        if(!ps[wn]) ps[wn] = {name:wn, w:0, l:0, form:[]};
        if(!ps[ln]) ps[ln] = {name:ln, w:0, l:0, form:[]};
        ps[wn].w++; ps[wn].form.push({d:m.d||'', win:true});
        ps[ln].l++; ps[ln].form.push({d:m.d||'', win:false});
      });
    });
  });
  const playerList = Object.values(ps);
  const topTeam = Object.values(teamStats).sort((a,b)=>b.w-a.w||a.l-b.l)[0]||null;
  // (버그픽스, 2026-08-20) "최근 5경기"도 서로 다른 대학 매치를 뒤섞어 세던 문제가
  // 있었다 — 누구 기준인지 알 수 없는 숫자였다. 이제 "가장 많이 이긴 팀"의 최근 5경기로
  // 기준을 명확히 하고, 카드에도 팀 이름을 표시해 혼동이 없게 한다.
  const recent = topTeam ? topTeam.history.slice().sort((a,b)=>(b.d||'').localeCompare(a.d||'')).slice(0,5) : [];
  const recent5W = recent.filter(r=>r.win).length;
  const recent5L = recent.length - recent5W;
  // 최장 연승 / 연패 (선수별)
  let topStreak=0, topStreakName='', topStreakWin=true;
  playerList.forEach(p=>{
    let s=0, sw=null, mx=0, mxWin=true;
    p.form.slice().sort((a,b)=>(a.d||'').localeCompare(b.d||'')).forEach(x=>{
      if(sw===null){ sw=x.win; s=1; mxWin=sw; }
      else if(x.win===sw){ s++; }
      else { sw=x.win; s=1; }
      if(s>mx){ mx=s; mxWin=sw; }
    });
    if(mx>topStreak || (mx===topStreak && mxWin)){ topStreak=mx; topStreakName=p.name; topStreakWin=mxWin; }
  });
  // 활동 스트리머 수
  const activeCount = playerList.filter(p=>p.w+p.l>0).length;
  // 날짜 범위
  dates.sort();
  const dateRange = dates.length
    ? `${dates[0].slice(2).replaceAll('-','.')} ~ ${dates[dates.length-1].slice(2).replaceAll('-','.')}`
    : '-';
  const winLabel = topStreakWin ? '연승' : '연패';
  return `<div class="cbs-general">
    <div class="cbs-general-head">
      <div class="cbs-general-title">📚 <b>일반 기록</b></div>
      <div class="cbs-general-sub">${dateRange}</div>
      <span class="cbs-general-tag">일반 탭</span>
    </div>
    <div class="cbs-general-grid">
      <div class="cbs-general-card"><div class="cbs-general-lbl">가장 많이 이긴 팀</div><div class="cbs-general-val">${topTeam?`<b>${_cbEsc(topTeam.u)}</b>`:'—'}</div><div class="cbs-general-meta">${topTeam?`${topTeam.w}승 ${topTeam.l}패`:'기록 없음'}</div></div>
      <div class="cbs-general-card"><div class="cbs-general-lbl">활동 스트리머</div><div class="cbs-general-val">${activeCount}명</div><div class="cbs-general-meta">이 대회의 일반 탭 기준</div></div>
      <div class="cbs-general-card"><div class="cbs-general-lbl">최근 5경기</div><div class="cbs-general-val">${recent.length?`<b>${recent5W}승</b> ${recent5L}패`:'-'}</div><div class="cbs-general-meta">${recent.length?`${_cbEsc(topTeam.u)} 기준 · 승률 ${Math.round(recent5W/recent.length*100)}%`:'기록 없음'}</div></div>
      <div class="cbs-general-card"><div class="cbs-general-lbl">최장 ${winLabel}</div><div class="cbs-general-val">${topStreak>0?`<b>${topStreak}${winLabel}</b>`:'—'}</div><div class="cbs-general-meta">${topStreakName||'-'}</div></div>
    </div>
  </div>`;
}

/* KPI 카드 색상 — 라벨 의미에 따라 다른 포인트 컬러를 부여해(진행률=골드,
   완료=그린, 팀=블루, 선수=바이올렛, 경기/세트=시안, 기간=로즈, 우승/MVP=골드)
   4개 카드가 전부 같은 톤 색이라 구분이 안 되던 문제를 해결한다. */
function _cbKpiColor(label){
  const l=String(label||'');
  if(l.includes('우승')||l.includes('1위')||l.includes('MVP')) return '#b8862c';
  if(l.includes('진행률')) return '#d97706';
  if(l.includes('완료')) return '#16a34a';
  if(l.includes('팀')) return '#2563eb';
  if(l.includes('선수')||l.includes('스트리머')) return '#7c3aed';
  if(l.includes('경기')||l.includes('세트')||l.includes('라운드')||l.includes('조 수')) return '#0891b2';
  if(l.includes('기간')||l.includes('일정')) return '#e11d48';
  return null;
}

function _cbShell(kicker,title,desc,metaKicker,headline,cells,body,tn){
  _cbInjectShellStyle();
  const tone=_cbToneOf(kicker);
  const issue=`VOL.${String(new Date().getMonth()+1).padStart(2,'0')}.${new Date().getFullYear()}`;
  return `<div class="cbs-wrap ${tone}">
    <div class="cbs-metabar">
      <div class="cbs-metabar-l">
        <span class="cbs-metabar-issue">${issue}</span>
        <span>${_cbEsc(kicker)}</span>
      </div>
      <div class="cbs-metabar-r">
        <button type="button" class="cbs-speak-btn no-export" onclick="_cbBriefingToggleSpeak(this)">🔊 음성듣기</button>
      </div>
    </div>
    <section class="cbs-hero">
      <div class="cbs-hero-main">
        <div class="cbs-hero-kicker">${_cbEsc(kicker)}</div>
        <div class="cbs-hero-title">${_cbEsc(title)}</div>
        <div class="cbs-hero-desc">${desc}</div>
        <div class="cbs-hero-headline">${headline}</div>
      </div>
    </section>
    <div class="cbs-kpi-grid">
      ${cells.map(c=>{
        const kc=c[3]||_cbKpiColor(c[0]);
        return `<div class="cbs-kpi-card"${kc?` style="--kpi-accent:${kc}"`:''}>
        <div class="cbs-kpi-label">${_cbEsc(c[0])}</div>
        <div class="cbs-kpi-value">${c[1]}</div>
        ${c[2]?`<div class="cbs-kpi-sub">${_cbEsc(c[2])}</div>`:''}
        </div>`;
      }).join('')}
    </div>
    <div class="cbs-body">
      ${_cbGeneralRecordHTML(tn)}
      <div class="b2w2-wrap">
        ${body}
      </div>
    </div>
  </div>`;
}

/* 음성듣기(TTS) — pro-league-briefing-tts.js 패턴 차용
   pro-league와 동일하게: 큐를 직접 만들고 window.SUTTS.speak(queue, ...)로 전달한다.
   - 일시정지/이어듣기/버튼 라벨 토글까지 SUTTS 단일 진입점으로 통일 */
function _cbBriefingSpeakBtnLabel(){
  const btn = document.querySelector('.cbs-speak-btn');
  if(!btn) return;
  const speaking = !!(window.SUTTS && window.SUTTS.isSpeaking());
  const paused = !speaking && !!(window.SUTTS && window.SUTTS.isPaused && window.SUTTS.isPaused());
  btn.innerHTML = speaking ? '⏸ 일시정지' : (paused ? '▶ 이어듣기' : '🔊 음성듣기');
  btn.classList.toggle('is-speaking', speaking);
  btn.classList.toggle('is-paused', paused);
}
function _cbBriefingBuildSpeakQueue(){
  const d = window._cbBriefingSpeakSnapshot;
  if(!d) return [];
  const q = [];
  q.push({text:`${d.title}, ${d.totalLabel}경기 중 ${d.doneLabel}경기가 진행되어 진행률은 ${d.pct}퍼센트입니다.`});
  if(d.headline) q.push({text:d.headline});
  if(d.mvp){
    q.push({text:`${d.kind==='overall'?'대회 MVP는':(d.kind==='tour'?'토너먼트 MVP는':'이번 조별리그의 핵심 선수는')} ${d.mvp.name}입니다. ${d.mvp.w}승 ${d.mvp.l}패, 승률 ${d.mvp.rate}퍼센트를 기록했습니다.`});
  }
  if(d.champ){
    q.push({text:`우승팀은 ${d.champ}입니다.`});
  }
  if(Array.isArray(d.winTop) && d.winTop.length){
    q.push({text:'개인 다승 순위입니다.'});
    d.winTop.forEach((p,i)=>{
      q.push({text:`${i+1}위 ${p.name}, ${p.w}승 ${p.l}패, 승률 ${p.rate}퍼센트입니다.`});
    });
  }
  q.push({text:'이상으로 브리핑을 마칩니다.'});
  return q;
}
function _cbBriefingToggleSpeak(btn){
  try{
    if(!window.SUTTS || !('speechSynthesis' in window)){ alert('이 브라우저는 음성 안내를 지원하지 않습니다.'); return; }
    if(window.SUTTS.isSpeaking()){ window.SUTTS.pause(); _cbBriefingSpeakBtnLabel(); return; }
    if(window.SUTTS.isPaused && window.SUTTS.isPaused()){ window.SUTTS.resume(); _cbBriefingSpeakBtnLabel(); return; }
    const queue = _cbBriefingBuildSpeakQueue();
    if(!queue.length){ alert('음성으로 읽어줄 브리핑 내용이 없습니다.'); return; }
    window.SUTTS.speak(queue, { onEnd: _cbBriefingSpeakBtnLabel });
    _cbBriefingSpeakBtnLabel();
  }catch(e){ console.warn(e); }
}

function _cbKpis(items){
  return `<div class="b2w2-kpi-grid">${items.map(k=>`<div class="b2w2-kpi-card">
    <div class="b2w2-kpi-label">${_cbEsc(k[0])}</div>
    <div class="b2w2-kpi-value">${k[1]}</div>
    <div class="b2w2-kpi-sub">${k[2]||''}</div>
  </div>`).join('')}</div>`;
}

function _cbSection(title,sub,inner,tag){
  return `<section class="cbf-sec">
    <div class="cbf-sec-head">
      <div>
        <div class="cbf-sec-heading">
          <span class="cbf-sec-num"></span>
          <span class="cbf-sec-title">${_cbEsc(title)}</span>
        </div>
        ${sub?`<div class="cbf-sec-sub">${_cbEsc(sub)}</div>`:''}
      </div>
      ${tag?`<span class="cbf-sec-tag">${_cbEsc(tag)}</span>`:''}
    </div>
    ${inner}
  </section>`;
}

function _cbEmpty(msg){
  return `<div class="b2w2-empty" style="padding:26px;text-align:center;color:var(--b2w-ink-soft,#6b7280)">${_cbEsc(msg)}</div>`;
}

function _cbBar(pct,col){
  return `<div style="height:8px;background:var(--b2w-rule-soft,#e5e7eb);border-radius:99px;overflow:hidden">
    <div style="height:100%;width:${pct}%;background:${col||'var(--b2w-accent,#2563eb)'};border-radius:99px;transition:.3s"></div>
  </div>`;
}

function _cbTeamChip(name,extra,colorOverride){
  const col=colorOverride||_cbUcolLight(name);
  return `<span style="display:inline-flex;align-items:center;gap:8px;font-weight:900;color:${col}">
    ${(typeof _univIconTag==='function')?_univIconTag(name,18):''}<span>${_cbEsc(name||'미정')}</span>${extra?`<span style="font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${extra}</span>`:''}
  </span>`;
}

/* 조 색상 (조별리그 일정/기록 탭과 동일 팔레트) */
function _cbGrpColor(i){ return ['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][(i||0)%6]; }

/* 조 배지 (조 색상 적용) */
function _cbGrpBadge(letter,idx,label){
  const col=_cbGrpColor(idx);
  return `<span style="font-size:11px;font-weight:900;color:#fff;background:linear-gradient(135deg,${col},${col}cc);padding:3px 10px;border-radius:99px;box-shadow:0 2px 6px ${col}44;flex-shrink:0">${_cbEsc(label||(letter+'조'))}</span>`;
}

/* 스트리머(선수) 프로필 이미지 — 설정탭의 프로필 모양(--su_profile_radius/clip) 적용 */
function _cbPlayerAvatar(name,size){
  const s=size||26;
  const shape=`border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none)`;
  let p=null;
  try{ p=(typeof players!=='undefined'?players:[]).find(x=>x.name===name)||null; }catch(e){}
  const col=(p&&p.univ)?_cbUcolLight(p.univ):'#94a3b8';
  const photo=p&&p.photo?p.photo:'';
  const second=(p&&typeof p.secondProfileFile==='string')?p.secondProfileFile.trim():'';
  const hasSwap=!!(photo&&second&&typeof _phSwap2ndHTML==='function');
  const wrapS=`position:relative;display:inline-flex;align-items:center;justify-content:center;width:${s}px;height:${s}px;${shape};overflow:hidden;flex-shrink:0;border:1.5px solid ${col}55;background:${photo?'#e2e8f0':col}`;
  const inner2=hasSwap?_phSwap2ndHTML(second,{px:Math.max(160,s*4),style:'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit'}):'';
  if(photo){
    const src=(typeof toThumbUrl==='function')?toThumbUrl(photo,s*2):((typeof toHttpsUrl==='function')?toHttpsUrl(photo):photo);
    const orig=(typeof toHttpsUrl==='function')?toHttpsUrl(photo):photo;
    return `<span class="${hasSwap?'ph-swap':''}" style="${wrapS}"><img src="${src}" data-orig="${orig}" loading="lazy" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit" onerror="if(this.dataset.orig&&this.src!==this.dataset.orig){this.src=this.dataset.orig;}else{this.style.display='none';}">${inner2}</span>`;
  }
  return `<span class="${hasSwap?'ph-swap':''}" style="${wrapS};font-weight:900;font-size:${Math.round(s*0.44)}px;color:#fff">${_cbEsc(String(name||'?').slice(0,1))}${inner2}</span>`;
}

function _cbRankList(rows){
  if(!rows.length) return _cbEmpty('표시할 기록이 없습니다.');
  return `<div class="b2w2-rank-list">${rows.map((r,i)=>{
    const col=r.color||_cbUcolLight(r.name);
    const top=i===0;
    const medal=top?'🥇':i===1?'🥈':i===2?'🥉':null;
    /* (개선, 2026-08-20) 예전엔 1등만 팀 색 배경 톤/그림자가 있고 2~5등은 밋밋한
       흰 배경이었다. 전체 순위에 같은 팀 색 효과를 주되, 1등만 살짝 더 진하게
       (배경 틴트·테두리 굵기·그림자) 강조해서 순위 서열감은 유지한다. */
    const border=top
      ? `border:1px solid ${col}45;border-left:5px solid ${col};box-shadow:0 4px 12px ${col}22`
      : `border:1px solid ${col}30;border-left:4px solid ${col};box-shadow:0 2px 8px ${col}14`;
    const bg=`linear-gradient(135deg,${col}${top?'16':'0c'},var(--b2w-paper-alt,#fff) 65%)`;
    /* 팀/선수 색 배지에 카드지(paper) 색 링 테두리를 둘러서, 사이트 톤 강조색(섹션
       번호 배지 등, 링 없는 사각/원형 칩)과 "이건 팀·선수 고유 색"이라는 걸 시각적으로
       구분해준다 — 톤 색과 팀 색이 우연히 겹쳐도 헷갈리지 않도록 하는 안전장치. */
    const badge=top?`background:linear-gradient(135deg,${col},${col}cc);color:#fff;width:27px;height:27px;font-size:13px;border:2px solid var(--cbs-card,#fff);box-shadow:0 0 0 1px ${col}55`:`background:${col}18;color:${col};border:1.5px solid var(--cbs-card,#fff)`;
    return `<div class="b2w2-rank-row" style="display:flex;align-items:center;gap:10px;padding:${top?'11px 13px':'9px 12px'};${border};border-radius:10px;background:${bg};margin-bottom:6px;transition:transform .12s ease,box-shadow .12s ease">
      <span class="b2w2-rank-badge" style="${badge}">${medal||i+1}</span>
      <span style="flex:1;min-width:0;display:flex;align-items:center;gap:8px;font-weight:900;color:${col};font-size:${top?'13.5px':'13px'}">${r.icon||''}<span style="min-width:0;white-space:normal;word-break:break-word;line-height:1.25">${_cbEsc(r.name)}</span></span>
      ${r.sub?`<span style="font-size:11px;font-weight:700;color:var(--b2w-ink-soft,#6b7280);white-space:nowrap">${r.sub}</span>`:''}
      <span style="font-weight:900;color:var(--b2w-ink,#111827);white-space:nowrap;font-size:${top?'13.5px':'13px'}">${r.value}</span>
    </div>`;
  }).join('')}</div>`;
}

/* 최근 경기 결과 행 — 좌측 팀은 [이름] [로고], 우측 팀은 [로고] [이름] 순서로
   대칭 배치해서 로고가 항상 스코어(중앙) 쪽으로 모이도록 한다("VS" 레이아웃 컨벤션). */
function _cbMatchRow(m,label){
  const ca=_cbUcolLight(m.a), cb=_cbUcolLight(m.b);
  const aWin=m.done&&m.sa>m.sb, bWin=m.done&&m.sb>m.sa;
  const aIcon=(typeof _univIconTag==='function')?_univIconTag(m.a,18):'';
  const bIcon=(typeof _univIconTag==='function')?_univIconTag(m.b,18):'';
  return `<div style="display:flex;align-items:center;gap:9px;padding:9px 12px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-radius:10px;background:var(--b2w-paper-alt,#fff);margin-bottom:6px">
    ${label?`<span style="flex-shrink:0;font-size:10px;font-weight:900;color:#fff;background:var(--b2w-accent,#2563eb);padding:2px 8px;border-radius:99px">${_cbEsc(label)}</span>`:''}
    ${m.d?`<span style="flex-shrink:0;font-size:10px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${_cbFmtD(m.d)}</span>`:''}
    <span style="flex:1;min-width:0;display:flex;align-items:center;justify-content:flex-end;gap:6px;font-weight:${aWin?'900':'700'};opacity:${bWin?'.6':'1'};color:${ca}"><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_cbEsc(m.a||'미정')}</span>${aIcon}</span>
    <span style="flex-shrink:0;font-weight:900;padding:2px 9px;border-radius:99px;background:var(--b2w-tag-bg,#f1f5f9);border:1px solid var(--b2w-tag-border,#e2e8f0)">${m.done?`${m.sa}:${m.sb}`:'예정'}</span>
    <span style="flex:1;min-width:0;display:flex;align-items:center;gap:6px;font-weight:${bWin?'900':'700'};opacity:${aWin?'.6':'1'};color:${cb}">${bIcon}<span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_cbEsc(m.b||'미정')}</span></span>
  </div>`;
}

function _cbFormDots(form){
  return (form||[]).slice(-5).map(v=>{
    const win=(typeof v==='object')?v.win:!!v;
    return `<span style="display:inline-block;width:8px;height:8px;border-radius:99px;margin-right:3px;background:${win?'#16a34a':'#dc2626'}"></span>`;
  }).join('');
}

/* ══════════ 1) 조별리그 브리핑 ══════════ */
function rCompLeagueBriefing(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const groups=tn.groups||[];
  const all=_cbLeagueMatches(tn);
  const done=all.filter(m=>m.done);
  const pct=_cbPct(done.length,all.length);
  const teams=_cbTeamStats(all);
  const univCount=new Set(groups.flatMap(g=>g.univs||[]).concat(all.flatMap(m=>[m.a,m.b]))).size;
  const dates=[...new Set(done.map(m=>m.d).filter(Boolean))].sort();
  const setTotal=done.reduce((s,m)=>s+(m.sa||0)+(m.sb||0),0);
  const players_=_cbPlayerStats(all);
  const topPlayers=players_.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate).slice(0,5);
  const undefeated=teams.filter(t=>t.g>=2&&t.l===0);
  const leaders=groups.map((grp,gi)=>{
    const rk=(typeof _calcGrpRank==='function')?_calcGrpRank(grp):[];
    const gm=(grp.matches||[]);
    const gd=gm.filter(m=>m.sa!=null&&m.sb!=null).length;
    return {gl:'ABCDEFGHIJ'[gi]||String(gi+1),gi,name:grp.name||'',rank:rk,done:gd,total:gm.length};
  });
  const closest=done.slice().sort((a,b)=>Math.abs(a.sa-a.sb)-Math.abs(b.sa-b.sb));
  const recent=done.slice().sort((a,b)=>String(b.d||'').localeCompare(String(a.d||''))).slice(0,5);

  if(!all.length){
    return _cbShell('League Briefing',`${tn.name} 조별리그 브리핑`,'아직 등록된 조별리그 경기가 없습니다.','핵심 지표','조편성 후 경기를 등록하면 브리핑이 생성됩니다.',
      [['조 수',groups.length+'개'],['경기','0'],['완료','0'],['진행률','0%']],
      _cbEmpty('조별리그 경기를 추가하면 브리핑이 채워집니다.'),tn);
  }

  const lead=teams[0];
  const headline=lead?`${_cbEsc(lead.u)} ${lead.w}승 ${lead.l}패 (세트 ${lead.sw}-${lead.sl})로 선두`:'집계 중';
  let body=_cbKpis([
    ['총 경기',`${all.length}경기`,`${groups.length}개 조 · ${univCount}팀`],
    ['완료',`${_cbTotalGames(all)}판`,`${done.length}경기 완료 · 남은 경기 ${all.length-done.length}경기`],
    ['진행률',`${pct}%`,dates.length?`${_cbFmtD(dates[0])} ~ ${_cbFmtD(dates[dates.length-1])}`:'일정 미정'],
    ['누적 세트',`${setTotal}세트`,`경기당 평균 ${done.length?(setTotal/done.length).toFixed(1):'0.0'}세트`]
  ]);
  body+=`<div style="margin-top:12px">${_cbBar(pct,pct===100?'var(--cbs-accent,#0d9488)':pct>=50?'var(--b2w-accent,#2563eb)':'#d97706')}</div>`;

  body+=_cbSection('조별 현황','각 조 선두와 진행 상황',
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
      ${leaders.map(L=>{
        const p=_cbPct(L.done,L.total);
        const col=_cbGrpColor(L.gi);
        return `<div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-top:4px solid ${col};border-radius:12px;background:var(--b2w-paper-alt,#fff)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            ${_cbGrpBadge(L.gl,L.gi,L.name||(L.gl+'조'))}
            <span style="margin-left:auto;font-size:11px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${L.done}/${L.total} · ${p}%</span>
          </div>
          ${_cbBar(p,col)}
          <div style="margin-top:9px;display:flex;flex-direction:column;gap:5px">
            ${L.rank.length?L.rank.slice(0,3).map((r,i)=>`<div style="display:flex;align-items:center;gap:7px;font-size:12px">
              <span style="font-weight:900;color:${i===0?col:'var(--b2w-ink-soft,#6b7280)'};min-width:14px">${i+1}</span>
              ${_cbTeamChip(r.u)}
              <span style="margin-left:auto;font-weight:800;color:var(--b2w-ink-mid,#374151)">${r.w}승 ${r.l}패</span>
              <span style="font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${r.sw-r.sl>0?'+':''}${r.sw-r.sl}</span>
            </div>`).join(''):_cbEmpty('기록 없음')}
          </div>
        </div>`;
      }).join('')}
    </div>`);

  body+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:28px;padding-top:22px;border-top:1px solid var(--b2w-rule-soft,#e5e7eb)">
    <div>${_cbSection('팀 성적 TOP 5','승수 · 세트 득실 기준',_cbRankList(teams.slice(0,5).map(t=>({
      name:t.u,icon:(typeof _univIconTag==='function')?_univIconTag(t.u,18):'',
      sub:`세트 ${t.sw}-${t.sl}`,value:`${t.w}승 ${t.l}패`
    }))))}</div>
    <div>${_cbSection('개인 다승 TOP 5','조별리그 세부 게임 기준',_cbRankList(topPlayers.map(p=>({
      name:p.name,color:_cbUcolLight(p.univ),
      sub:`${_cbFormDots(p.form)} ${p.rate}%`,value:`${p.w}승 ${p.l}패`
    }))))}</div>
  </div>`;

  body+=_cbSection('주목할 포인트','무패 팀 · 접전 경기',
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px">
      <div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-radius:12px;background:var(--b2w-paper-alt,#fff)">
        <div style="font-weight:900;margin-bottom:8px">🔥 무패 행진</div>
        ${undefeated.length?undefeated.slice(0,5).map(t=>`<div style="display:flex;align-items:center;gap:8px;padding:5px 0">${_cbTeamChip(t.u)}<span style="margin-left:auto;font-weight:800">${t.w}전 전승</span></div>`).join(''):_cbEmpty('아직 2경기 이상 무패 팀이 없습니다.')}
      </div>
      <div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-radius:12px;background:var(--b2w-paper-alt,#fff)">
        <div style="font-weight:900;margin-bottom:8px">⚡ 최고 접전</div>
        ${closest.length?closest.slice(0,3).map(m=>_cbMatchRow(m,`${m.grpLetter}조`)).join(''):_cbEmpty('완료된 경기가 없습니다.')}
      </div>
    </div>`);

  body+=_cbSection('최근 경기 결과','가장 최근에 기록된 5경기',
    recent.length?recent.map(m=>_cbMatchRow(m,`${m.grpLetter}조`)).join(''):_cbEmpty('완료된 경기가 없습니다.'));

  /* 음성듣기(TTS)용 스냅샷 */
  try{
    window._cbBriefingSpeakSnapshot={
      kind:'league',
      title:`${tn.name} 조별리그 브리핑`,
      totalLabel:String(all.length), doneLabel:String(done.length), pct,
      headline:headline,
      mvp:topPlayers[0]?{name:topPlayers[0].name,w:topPlayers[0].w,l:topPlayers[0].l,rate:topPlayers[0].rate}:null,
      champ:'',
      winTop:topPlayers.slice(0,5).map(p=>({name:p.name,w:p.w,l:p.l,rate:p.rate}))
    };
  }catch(e){}
  return _cbShell('League Briefing',`${tn.name} 조별리그 브리핑`,
    `조별리그 ${all.length}경기 중 ${done.length}경기가 완료됐습니다. 조별 판도와 팀·선수 흐름을 한 화면에서 정리했습니다.`,
    '핵심 지표',headline,
    [['진행률',`${pct}%`],['조 수',`${groups.length}개`],['참가 팀',`${univCount}팀`],['남은 경기',`${all.length-done.length}경기`]],
    body,tn);
}

/* ══════════ 2) 토너먼트 브리핑 ══════════ */
function rCompTourBriefing(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const all=_cbBktMatches(tn);
  const done=all.filter(m=>m.done);
  const pct=_cbPct(done.length,all.length);
  const teams=_cbTeamStats(all);
  const players_=_cbPlayerStats(all).sort((a,b)=>b.w-a.w||b.rate-a.rate);
  const rounds={};
  all.forEach(m=>{ if(!rounds[m.rLabel]) rounds[m.rLabel]={label:m.rLabel,r:m.r,list:[]}; rounds[m.rLabel].list.push(m); });
  const roundArr=Object.values(rounds).sort((a,b)=>(a.r===-1?9999:a.r)-(b.r===-1?9999:b.r));
  const finals=(rounds['결승']?.list||[]).filter(m=>m.done);
  const champ=finals.length?finals[finals.length-1].winner:'';
  const runnerUp=finals.length?(finals[finals.length-1].winner===finals[finals.length-1].a?finals[finals.length-1].b:finals[finals.length-1].a):'';
  const sweeps=done.filter(m=>Math.abs(m.sa-m.sb)>=2&&Math.min(m.sa,m.sb)===0);
  const closest=done.slice().sort((a,b)=>Math.abs(a.sa-a.sb)-Math.abs(b.sa-b.sb));
  const dates=[...new Set(done.map(m=>m.d).filter(Boolean))].sort();
  const roundTier={'결승':'#f59e0b','4강':'#a855f7','8강':'#2563eb','16강':'#14b8a6'};

  if(!all.length){
    return _cbShell('Tournament Briefing',`${tn.name} 토너먼트 브리핑`,'아직 등록된 대진표 경기 기록이 없습니다.','핵심 지표','대진표 기록을 입력하면 브리핑이 생성됩니다.',
      [['라운드','-'],['경기','0'],['완료','0'],['진행률','0%']],
      _cbEmpty('대진표 기록에서 결과를 입력하면 여기에 정리됩니다.'),tn);
  }

  let body='';
  if(champ){
    body+=`<div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:14px;background:linear-gradient(135deg,#d9a441,#b8862c);box-shadow:0 6px 18px rgba(184,134,44,.30);margin-bottom:14px">
      <span style="font-size:26px">🏆</span>
      <div>
        <div style="font-size:11px;font-weight:900;color:rgba(255,255,255,.85);letter-spacing:.08em">CHAMPION</div>
        <div style="font-size:19px;font-weight:900;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.25)">${_cbEsc(champ)}</div>
      </div>
      ${runnerUp?`<div style="margin-left:auto;text-align:right">
        <div style="font-size:10px;font-weight:900;color:rgba(255,255,255,.85)">준우승</div>
        <div style="font-size:14px;font-weight:900;color:#fff">${_cbEsc(runnerUp)}</div>
      </div>`:''}
    </div>`;
  }
  body+=_cbKpis([
    ['총 경기',`${all.length}경기`,`${roundArr.length}개 라운드`],
    ['완료',`${_cbTotalGames(all)}판`,`${done.length}경기 완료 · 남은 경기 ${all.length-done.length}경기`],
    ['진행률',`${pct}%`,dates.length?`${_cbFmtD(dates[0])} ~ ${_cbFmtD(dates[dates.length-1])}`:'일정 미정'],
    ['우승팀',champ?_cbEsc(champ):'미정',champ?`준우승 ${_cbEsc(runnerUp||'-')}`:'결승 결과 대기']
  ]);
  body+=`<div style="margin-top:12px">${_cbBar(pct,pct===100?'var(--cbs-accent,#0d9488)':'var(--b2w-accent,#2563eb)')}</div>`;

  body+=_cbSection('라운드별 진행','8강 → 4강 → 결승 흐름',
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px">
      ${roundArr.map(R=>{
        const dc=R.list.filter(m=>m.done).length;
        const p=_cbPct(dc,R.list.length);
        const col=roundTier[R.label]||'#64748b';
        return `<div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-top:4px solid ${col};border-radius:12px;background:var(--b2w-paper-alt,#fff)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:11px;font-weight:900;color:#fff;background:${col};padding:3px 10px;border-radius:99px">${_cbEsc(R.label)}</span>
            <span style="margin-left:auto;font-size:11px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${dc}/${R.list.length} · ${p}%</span>
          </div>
          ${_cbBar(p,col)}
          <div style="margin-top:9px">${R.list.map(m=>_cbMatchRow(m,'')).join('')}</div>
        </div>`;
      }).join('')}
    </div>`);

  body+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:28px;padding-top:22px;border-top:1px solid var(--b2w-rule-soft,#e5e7eb)">
    <div>${_cbSection('팀 성적 TOP 5','토너먼트 승수 기준',_cbRankList(teams.slice(0,5).map(t=>({
      name:t.u,icon:(typeof _univIconTag==='function')?_univIconTag(t.u,18):'',
      sub:`세트 ${t.sw}-${t.sl}`,value:`${t.w}승 ${t.l}패`
    }))))}</div>
    <div>${_cbSection('개인 다승 TOP 5','토너먼트 세부 게임 기준',_cbRankList(players_.slice(0,5).map(p=>({
      name:p.name,color:_cbUcolLight(p.univ),
      sub:`${_cbFormDots(p.form)} ${p.rate}%`,value:`${p.w}승 ${p.l}패`
    }))))}</div>
  </div>`;

  body+=_cbSection('주목할 경기','완승과 접전',
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px">
      <div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-radius:12px;background:var(--b2w-paper-alt,#fff)">
        <div style="font-weight:900;margin-bottom:8px">💥 완승 경기</div>
        ${sweeps.length?sweeps.slice(0,3).map(m=>_cbMatchRow(m,m.rLabel)).join(''):_cbEmpty('셧아웃 경기가 없습니다.')}
      </div>
      <div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-radius:12px;background:var(--b2w-paper-alt,#fff)">
        <div style="font-weight:900;margin-bottom:8px">⚡ 최고 접전</div>
        ${closest.length?closest.slice(0,3).map(m=>_cbMatchRow(m,m.rLabel)).join(''):_cbEmpty('완료된 경기가 없습니다.')}
      </div>
    </div>`);

  /* 음성듣기(TTS)용 스냅샷 */
  try{
    window._cbBriefingSpeakSnapshot={
      kind:'tour',
      title:`${tn.name} 토너먼트 브리핑`,
      totalLabel:String(all.length), doneLabel:String(done.length), pct,
      headline:champ?`${champ} 우승`:'',
      mvp:players_[0]?{name:players_[0].name,w:players_[0].w,l:players_[0].l,rate:players_[0].rate}:null,
      champ:champ||'',
      winTop:players_.slice(0,5).map(p=>({name:p.name,w:p.w,l:p.l,rate:p.rate}))
    };
  }catch(e){}
  return _cbShell('Tournament Briefing',`${tn.name} 토너먼트 브리핑`,
    `대진표 ${all.length}경기 중 ${done.length}경기가 기록됐습니다. 라운드별 진행과 결승 결과를 정리했습니다.`,
    '핵심 지표',champ?`🏆 ${_cbEsc(champ)} 우승`:'결승 결과 대기 중',
    [['진행률',`${pct}%`],['라운드',`${roundArr.length}개`],['참가 팀',`${teams.length}팀`],['남은 경기',`${all.length-done.length}경기`]],
    body,tn);
}

/* ══════════ 3) 대회 종합 브리핑 ══════════ */
/* (신규, 2026-08-20) 조별리그·대진표 기록이 전혀 없고 "일반 탭"으로만 경기를 저장한
   대회의 경우, 기존엔 "핵심 지표 · 일반 기록" 요약 박스만 나오고 대회 MVP·팀 순위
   TOP5·개인 다승/승률/최다출전 TOP5 같은 나머지 섹션은 전부 비어 있었다(대회를
   순수하게 일반 탭으로만 운영하는 경우 브리핑이 사실상 텅 빈 것처럼 보이는 문제).
   조별리그/대진표와 동일한 매치 셰이프(a/b/sa/sb/done/sets)를 쓰는 tn.normalMatches를
   그대로 _cbTeamStats/_cbPlayerStats에 넣어 같은 섹션들을 일반 탭 데이터 기준으로
   채워준다. */
function _cbOverallFromNormalOnly(tn,nm,nmDone){
  const pct=_cbPct(nmDone.length,nm.length);
  const teams=_cbTeamStats(nm);
  const allPs=_cbPlayerStats(nm);
  const mvp=allPs.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate)[0]||null;
  const bestRate=allPs.filter(p=>p.total>=3).sort((a,b)=>b.rate-a.rate||b.w-a.w).slice(0,5);
  const mostGames=allPs.slice().sort((a,b)=>b.total-a.total).slice(0,5);
  const dates=[...new Set(nmDone.map(m=>m.d).filter(Boolean))].sort();
  const setTotal=nmDone.reduce((s,m)=>s+(m.sa||0)+(m.sb||0),0);

  let body=_cbKpis([
    ['전체 경기',`${nm.length}경기`,'일반 탭 기준'],
    ['완료',`${_cbTotalGames(nm)}판`,`${nmDone.length}경기 완료`],
    ['진행률',`${pct}%`,dates.length?`${_cbFmtD(dates[0])} ~ ${_cbFmtD(dates[dates.length-1])}`:'일정 미정'],
    ['참가 선수',`${allPs.length}명`,`누적 ${setTotal}세트`]
  ]);
  body+=`<div style="margin-top:12px">${_cbBar(pct,pct===100?'var(--cbs-accent,#0d9488)':'var(--b2w-accent,#2563eb)')}</div>`;

  if(mvp){
    const mCol=_cbUcolLight(mvp.univ);
    body+=_cbSection('대회 MVP','일반 탭 다승 · 승률 종합',
      `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
        <div style="display:flex;align-items:center;gap:18px;padding:18px 20px;border-radius:14px;border:1px solid ${mCol}33;background:linear-gradient(135deg,${mCol}14,var(--b2w-paper-alt,#fff))">
          <span style="position:relative;display:inline-flex;flex-shrink:0">${_cbPlayerAvatar(mvp.name,92)}
            <span style="position:absolute;bottom:-4px;right:-4px;font-size:22px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.25))">🏅</span></span>
          <div style="min-width:0">
            <div style="font-size:10px;font-weight:900;letter-spacing:.1em;color:var(--b2w-gold,#b8862c)">MOST VALUABLE PLAYER</div>
            <div style="font-size:22px;font-weight:900;color:${mCol};line-height:1.25;word-break:break-word">${_cbEsc(mvp.name)}</div>
            <div style="margin-top:4px;font-size:12px;font-weight:800;color:var(--b2w-ink-soft,#6b7280);display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              ${mvp.univ?_cbTeamChip(mvp.univ):''}
              <span>${mvp.w}승 ${mvp.l}패 · 승률 ${mvp.rate}%</span>
            </div>
          </div>
        </div>
      </div>`);
  }

  body+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-top:28px;padding-top:22px;border-top:1px solid var(--b2w-rule-soft,#e5e7eb)">
    <div>${_cbSection('팀 순위 TOP 5','일반 탭 기준',teams.length?_cbRankList(teams.slice(0,5).map(t=>({
      name:t.u,icon:(typeof _univIconTag==='function')?_univIconTag(t.u,18):'',
      sub:`세트 ${t.sw}-${t.sl}`,value:`${t.w}승 ${t.l}패`
    }))):_cbEmpty('팀 기록이 없습니다.'))}</div>
    <div>${_cbSection('개인 다승 TOP 5','일반 탭 기준',_cbRankList(allPs.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate).slice(0,5).map(p=>({
      name:p.name,color:_cbUcolLight(p.univ),icon:_cbPlayerAvatar(p.name,28),
      sub:_cbFormDots(p.form),value:`${p.w}승 ${p.l}패`
    }))))}</div>
    <div>${_cbSection('승률 TOP 5','3경기 이상',_cbRankList(bestRate.map(p=>({
      name:p.name,color:_cbUcolLight(p.univ),icon:_cbPlayerAvatar(p.name,28),
      sub:`${p.w}승 ${p.l}패`,value:`${p.rate}%`
    }))))}</div>
    <div>${_cbSection('최다 출전 TOP 5','세부 게임 출전 수',_cbRankList(mostGames.map(p=>({
      name:p.name,color:_cbUcolLight(p.univ),icon:_cbPlayerAvatar(p.name,28),
      sub:`${p.w}승 ${p.l}패`,value:`${p.total}게임`
    }))))}</div>
  </div>`;

  try{
    window._cbBriefingSpeakSnapshot={
      kind:'overall',
      title:`${tn.name} 대회 브리핑`,
      totalLabel:String(nm.length), doneLabel:String(nmDone.length), pct,
      headline:mvp?`MVP ${mvp.name}`:'',
      mvp:mvp?{name:mvp.name,w:mvp.w,l:mvp.l,rate:mvp.rate}:null,
      champ:'',
      winTop:allPs.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate).slice(0,5).map(p=>({name:p.name,w:p.w,l:p.l,rate:p.rate}))
    };
  }catch(e){}

  return _cbShell('Competition Briefing',`${tn.name} 대회 브리핑`,
    `아직 조별리그·대진표 기록은 없지만, 일반 탭에 입력된 ${nm.length}경기 중 ${nmDone.length}경기를 기준으로 브리핑을 정리했습니다.`,
    '핵심 지표',mvp?`MVP 후보 ${_cbEsc(mvp.name)} (${mvp.w}승)`:'집계 중',
    [['진행률',`${pct}%`],['참가 팀',`${teams.length}팀`],['참가 선수',`${allPs.length}명`],['기준','일반 탭']],
    body,tn);
}

function rCompOverallBriefing(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const lg=_cbLeagueMatches(tn);
  const bk=_cbBktMatches(tn);
  const all=lg.concat(bk);
  const lgDone=lg.filter(m=>m.done), bkDone=bk.filter(m=>m.done);
  const done=lgDone.length+bkDone.length;
  const pct=_cbPct(done,all.length);
  const teams=_cbTeamStats(all);
  const lgPs=_cbPlayerStats(lg), bkPs=_cbPlayerStats(bk);
  const pmap={};
  [...lgPs,...bkPs].forEach(p=>{
    if(!pmap[p.name]) pmap[p.name]={name:p.name,univ:p.univ,w:0,l:0,form:[],lgW:0,bkW:0};
    pmap[p.name].w+=p.w; pmap[p.name].l+=p.l; pmap[p.name].form=pmap[p.name].form.concat(p.form);
  });
  lgPs.forEach(p=>{pmap[p.name].lgW=p.w;});
  bkPs.forEach(p=>{pmap[p.name].bkW=p.w;});
  const allPs=Object.values(pmap).map(p=>{
    const total=p.w+p.l;
    const form=p.form.slice().sort((a,b)=>(a.d||'').localeCompare(b.d||''));
    return {...p,total,rate:total?Math.round(p.w/total*100):0,form};
  }).filter(p=>p.total>0);
  const mvp=allPs.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate)[0]||null;
  const bestRate=allPs.filter(p=>p.total>=3).sort((a,b)=>b.rate-a.rate||b.w-a.w).slice(0,5);
  const mostGames=allPs.slice().sort((a,b)=>b.total-a.total).slice(0,5);
  const finals=bk.filter(m=>m.rLabel==='결승'&&m.done);
  const champ=finals.length?finals[finals.length-1].winner:'';
  const hasBracket=bk.length>0;
  const dates=[...new Set(all.filter(m=>m.done).map(m=>m.d).filter(Boolean))].sort();
  const setTotal=all.filter(m=>m.done).reduce((s,m)=>s+(m.sa||0)+(m.sb||0),0);

  if(!all.length){
    const nmPrepped=(Array.isArray(tn.normalMatches)?tn.normalMatches:[]).map(m=>({...m,done:(m.sa!=null&&m.sb!=null)}));
    const nmDone=nmPrepped.filter(m=>m.done);
    if(nmDone.length){
      return _cbOverallFromNormalOnly(tn,nmPrepped,nmDone);
    }
    return _cbShell('Competition Briefing',`${tn.name} 대회 브리핑`,'아직 등록된 경기가 없습니다.','핵심 지표','조별리그와 대진표 기록이 쌓이면 종합 브리핑이 생성됩니다.',
      [['경기','0'],['완료','0'],['진행률','0%'],['우승팀','미정']],
      _cbEmpty('경기 결과를 입력하면 종합 브리핑이 채워집니다.'),tn);
  }

  let body='';
  if(champ){
    body+=`<div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:14px;background:linear-gradient(135deg,#d9a441,#b8862c);box-shadow:0 6px 18px rgba(184,134,44,.30);margin-bottom:14px">
      <span style="font-size:26px">🏆</span>
      <div>
        <div style="font-size:11px;font-weight:900;color:rgba(255,255,255,.85);letter-spacing:.08em">CHAMPION</div>
        <div style="font-size:19px;font-weight:900;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.25)">${_cbEsc(champ)}</div>
      </div>
      ${mvp?`<div style="margin-left:auto;text-align:right">
        <div style="font-size:10px;font-weight:900;color:rgba(255,255,255,.85)">대회 MVP</div>
        <div style="font-size:14px;font-weight:900;color:#fff">${_cbEsc(mvp.name)} · ${mvp.w}승</div>
      </div>`:''}
    </div>`;
  }
  body+=_cbKpis([
    ['전체 경기',`${all.length}경기`,`조별 ${lg.length} · 대진표 ${bk.length}`],
    ['완료',`${_cbTotalGames(all)}판`,`${done}경기 완료 · 조별 ${lgDone.length} · 대진표 ${bkDone.length}`],
    ['진행률',`${pct}%`,dates.length?`${_cbFmtD(dates[0])} ~ ${_cbFmtD(dates[dates.length-1])}`:'일정 미정'],
    ['참가 선수',`${allPs.length}명`,`누적 ${setTotal}세트`]
  ]);
  body+=`<div style="margin-top:12px">${_cbBar(pct,pct===100?'var(--cbs-accent,#0d9488)':'var(--b2w-accent,#2563eb)')}</div>`;

  /* ── 대회 MVP (다승 + 대진표 가중 + 승률) ── */
  const mvpCands=allPs.slice().map(p=>({...p,score:p.w*10+p.bkW*6+p.rate*0.4+(champ&&p.univ===champ?12:0)}))
    .sort((a,b)=>b.score-a.score||b.w-a.w||b.rate-a.rate);
  const mvpTop=mvpCands[0]||null;
  if(mvpTop){
    const mCol=_cbUcolLight(mvpTop.univ);
    body+=_cbSection('대회 MVP','다승 · 대진표 기여 · 승률 종합',
      `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
        <div style="display:flex;align-items:center;gap:18px;padding:18px 20px;border-radius:14px;border:1px solid ${mCol}33;background:linear-gradient(135deg,${mCol}14,var(--b2w-paper-alt,#fff))">
          <span style="position:relative;display:inline-flex;flex-shrink:0">${_cbPlayerAvatar(mvpTop.name,92)}
            <span style="position:absolute;bottom:-4px;right:-4px;font-size:22px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.25))">🏅</span></span>
          <div style="min-width:0">
            <div style="font-size:10px;font-weight:900;letter-spacing:.1em;color:var(--b2w-gold,#b8862c)">MOST VALUABLE PLAYER</div>
            <div style="font-size:22px;font-weight:900;color:${mCol};line-height:1.25;word-break:break-word">${_cbEsc(mvpTop.name)}</div>
            <div style="margin-top:4px;font-size:12px;font-weight:800;color:var(--b2w-ink-soft,#6b7280);display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              ${mvpTop.univ?_cbTeamChip(mvpTop.univ):''}
              <span>${mvpTop.w}승 ${mvpTop.l}패 · 승률 ${mvpTop.rate}%</span>
            </div>
            <div style="margin-top:5px;font-size:11px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">조별리그 ${mvpTop.lgW}승 · 대진표 ${mvpTop.bkW}승</div>
          </div>
        </div>
        <div>${_cbRankList(mvpCands.slice(0,5).map(p=>({
          name:p.name,color:_cbUcolLight(p.univ),icon:_cbPlayerAvatar(p.name,28),
          sub:`${p.w}승 ${p.l}패 · ${p.rate}%`,value:`${Math.round(p.score)}pt`
        })))}</div>
      </div>`);
  }


  /* (개선, 2026-08-20) 대진표 계획이 아예 없는(bk.length===0) 순수 조별리그 대회에서는
     "🗂️ 대진표 0/0 · 0%"짜리 빈 카드를 보여줄 필요가 없어 조건부로 숨긴다. */
  const stageItems=[['📅 조별리그',lg.length,lgDone.length,'var(--b2w-accent,#2563eb)']];
  if(hasBracket) stageItems.push(['🗂️ 대진표',bk.length,bkDone.length,'#f59e0b']);
  body+=_cbSection('단계별 진행',hasBracket?'조별리그와 대진표 진행 현황':'조별리그 진행 현황',
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
      ${stageItems.map(([lbl,t,d,col])=>{
        const p=_cbPct(d,t);
        return `<div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-top:4px solid ${col};border-radius:12px;background:var(--b2w-paper-alt,#fff)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-weight:900">${lbl}</span>
            <span style="margin-left:auto;font-size:11px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${d}/${t} · ${p}%</span>
          </div>
          ${_cbBar(p,col)}
        </div>`;
      }).join('')}
    </div>`);

  body+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:28px;padding-top:22px;border-top:1px solid var(--b2w-rule-soft,#e5e7eb)">
    <div>${_cbSection('팀 종합 순위 TOP 5','조별리그 + 대진표 합산',_cbRankList(teams.slice(0,5).map(t=>({
      name:t.u,icon:(typeof _univIconTag==='function')?_univIconTag(t.u,18):'',
      sub:`세트 ${t.sw}-${t.sl}`,value:`${t.w}승 ${t.l}패`
    }))))}</div>
    <div>${_cbSection('개인 다승 TOP 5','대회 전체 세부 게임 기준',_cbRankList(allPs.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate).slice(0,5).map(p=>({
      name:p.name,color:_cbUcolLight(p.univ),icon:_cbPlayerAvatar(p.name,28),
      sub:`${_cbFormDots(p.form)} 조별 ${p.lgW}승 · 대진표 ${p.bkW}승`,value:`${p.w}승 ${p.l}패`
    }))))}</div>
    <div>${_cbSection('승률 TOP 5','3경기 이상',_cbRankList(bestRate.map(p=>({
      name:p.name,color:_cbUcolLight(p.univ),icon:_cbPlayerAvatar(p.name,28),
      sub:`${p.w}승 ${p.l}패`,value:`${p.rate}%`
    }))))}</div>
    <div>${_cbSection('최다 출전 TOP 5','세부 게임 출전 수',_cbRankList(mostGames.map(p=>({
      name:p.name,color:_cbUcolLight(p.univ),icon:_cbPlayerAvatar(p.name,28),
      sub:`${p.w}승 ${p.l}패`,value:`${p.total}게임`
    }))))}</div>
  </div>`;

  /* ── 조별리그 팀 승패 / 승률 TOP ── (개선, 2026-08-20) 대진표가 없으면 이 순위가
     위쪽 "팀 종합 순위 TOP 5"(조별+대진표 합산)와 완전히 같은 숫자가 되어 같은 표를
     또 보여주는 셈이 되므로, 대진표가 있는 대회에서만 표시한다. */
  if(hasBracket){
    const lgTeams=_cbTeamStats(lg).filter(t=>t.g>0);
    const lgWinTop=lgTeams.slice(0,5);
    const lgRateTop=lgTeams.filter(t=>t.g>=2).slice().sort((a,b)=>b.rate-a.rate||b.w-a.w||b.diff-a.diff).slice(0,5);
    body+=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-top:28px;padding-top:22px;border-top:1px solid var(--b2w-rule-soft,#e5e7eb)">
    <div>${_cbSection('조별리그 승패 TOP 5','승수 · 세트 득실 기준',_cbRankList(lgWinTop.map(t=>({
      name:t.u,icon:(typeof _univIconTag==='function')?_univIconTag(t.u,18):'',
      sub:`세트 ${t.sw}-${t.sl} (${t.diff>0?'+':''}${t.diff})`,value:`${t.w}승 ${t.l}패`
    }))))}</div>
    <div>${_cbSection('조별리그 승률 TOP 5','2경기 이상',_cbRankList(lgRateTop.map(t=>({
      name:t.u,icon:(typeof _univIconTag==='function')?_univIconTag(t.u,18):'',
      sub:`${t.w}승 ${t.l}패`,value:`${t.rate}%`
    }))))}</div>
  </div>`;
  }

  /* ── 조별 순위 (조 색상 배지) ── */
  const grpCards=(tn.groups||[]).map((grp,gi)=>{
    const gl='ABCDEFGHIJ'[gi]||String(gi+1);
    const col=_cbGrpColor(gi);
    const rk=(typeof _calcGrpRank==='function')?_calcGrpRank(grp):[];
    const gm=(grp.matches||[]);
    const gd=gm.filter(m=>m.sa!=null&&m.sb!=null).length;
    const pr=_cbPct(gd,gm.length);
    return `<div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-top:4px solid ${col};border-radius:12px;background:var(--b2w-paper-alt,#fff)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        ${_cbGrpBadge(gl,gi,grp.name||(gl+'조'))}
        <span style="margin-left:auto;font-size:11px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${gd}/${gm.length} · ${pr}%</span>
      </div>
      ${_cbBar(pr,col)}
      <div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">
        ${rk.length?rk.map((r,i)=>{
          const tot=r.w+r.l;
          return `<div style="display:flex;align-items:center;gap:8px;font-size:12px">
            <span style="font-weight:900;min-width:16px;color:${i===0?col:'var(--b2w-ink-soft,#6b7280)'}">${i+1}</span>
            ${_cbTeamChip(r.u)}
            <span style="margin-left:auto;font-weight:800;color:var(--b2w-ink-mid,#374151)">${r.w}승 ${r.l}패</span>
            <span style="font-weight:800;color:${col}">${tot?Math.round(r.w/tot*100):0}%</span>
            <span style="font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${r.sw-r.sl>0?'+':''}${r.sw-r.sl}</span>
          </div>`;
        }).join(''):_cbEmpty('기록 없음')}
      </div>
    </div>`;
  }).join('');
  body+=_cbSection('조별 순위','조별 승패 · 승률 · 세트 득실',
    grpCards?`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">${grpCards}</div>`:_cbEmpty('조편성이 없습니다.'));

  /* ── 대진표 기록 (라운드별) ── (개선, 2026-08-20) 대진표가 계획에 없는 대회에서
     "대진표 기록이 없습니다"라는 빈 섹션을 굳이 보여줄 필요가 없어, 대진표 매치가
     하나라도 있을 때만 이 섹션 자체를 렌더링한다. */
  if(hasBracket){
    const bkRounds={};
    bk.forEach(m=>{ if(!bkRounds[m.rLabel]) bkRounds[m.rLabel]={label:m.rLabel,r:m.r,list:[]}; bkRounds[m.rLabel].list.push(m); });
    const bkRoundArr=Object.values(bkRounds).sort((a,b)=>(a.r===-1?9999:a.r)-(b.r===-1?9999:b.r));
    const _cbRoundTier={'결승':'#f59e0b','4강':'#a855f7','8강':'#2563eb','16강':'#14b8a6'};
    body+=_cbSection('대진표 기록','라운드별 경기 결과',
      `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
      ${bkRoundArr.map(R=>{
        const dc=R.list.filter(m=>m.done).length;
        const pr=_cbPct(dc,R.list.length);
        const col=_cbRoundTier[R.label]||'#64748b';
        return `<div class="b2w2-card" style="padding:13px;border:1px solid var(--b2w-rule-soft,#e5e7eb);border-top:4px solid ${col};border-radius:12px;background:var(--b2w-paper-alt,#fff)">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:11px;font-weight:900;color:#fff;background:${col};padding:3px 10px;border-radius:99px">${_cbEsc(R.label)}</span>
            <span style="margin-left:auto;font-size:11px;font-weight:700;color:var(--b2w-ink-soft,#6b7280)">${dc}/${R.list.length} · ${pr}%</span>
          </div>
          ${_cbBar(pr,col)}
          <div style="margin-top:9px">${R.list.map(m=>_cbMatchRow(m,'')).join('')}</div>
        </div>`;
      }).join('')}
    </div>`);
  }

  /* 음성듣기(TTS)용 스냅샷 */
  try{
    const topWinAll = allPs.slice().sort((a,b)=>b.w-a.w||b.rate-a.rate).slice(0,5);
    window._cbBriefingSpeakSnapshot={
      kind:'overall',
      title:`${tn.name} 대회 브리핑`,
      totalLabel:String(all.length), doneLabel:String(done), pct,
      headline:champ?`${champ} 우승${mvp?`, MVP ${mvp.name}`:''}`:'',
      mvp:mvp?{name:mvp.name,w:mvp.w,l:mvp.l,rate:mvp.rate}:null,
      champ:champ||'',
      winTop:topWinAll.map(p=>({name:p.name,w:p.w,l:p.l,rate:p.rate}))
    };
  }catch(e){}
  return _cbShell('Competition Briefing',`${tn.name} 대회 브리핑`,
    `조별리그와 대진표를 합쳐 ${all.length}경기 중 ${done}경기가 기록됐습니다. 대회 전체 흐름을 종합해 정리했습니다.`,
    '핵심 지표',champ?`🏆 ${_cbEsc(champ)} 우승${mvp?` · MVP ${_cbEsc(mvp.name)}`:''}`:(mvp?`MVP 후보 ${_cbEsc(mvp.name)} (${mvp.w}승)`:'집계 중'),
    [['진행률',`${pct}%`],['참가 팀',`${teams.length}팀`],['참가 선수',`${allPs.length}명`],
      hasBracket?['우승팀',champ?_cbEsc(champ):'미정']:['조별리그 1위',teams[0]?_cbEsc(teams[0].u):'미정']],
    body,tn);
}

try{
  window.rCompLeagueBriefing = rCompLeagueBriefing;
  window.rCompTourBriefing = rCompTourBriefing;
  window.rCompOverallBriefing = rCompOverallBriefing;
}catch(e){}
