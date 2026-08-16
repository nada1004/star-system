/* ══════════════════════════════════════════════════════════════
   대전기록 - 대학별 통계 탭 (history-render-tabs.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function rHistUnivStat(){
  const _mini = (typeof miniM!=='undefined' && Array.isArray(miniM)) ? miniM : [];
  const _univm = (typeof univM!=='undefined' && Array.isArray(univM)) ? univM : [];
  const _ck = (typeof ckM!=='undefined' && Array.isArray(ckM)) ? ckM : [];
  const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
  const allU=getAllUnivs();
  if(!histUniv&&allU.length) histUniv=allU[0].name;
  let h='';
  if(typeof buildYearMonthFilter==='function'){
    h+=buildYearMonthFilter('hist-univ');
  }
  h+=`<div style="margin-bottom:16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;" class="no-export">
    <span style="font-size:var(--fs-base);font-weight:900;color:var(--text2);white-space:nowrap">🏛️ 대학 선택</span>
    <select onchange="histUniv=this.value;openDetails={};render()" style="flex:1;min-width:140px;max-width:260px;padding:8px 32px 8px 12px;border-radius:12px;border:1.5px solid var(--border2);background:var(--card);color:var(--text);font-size:14px;font-weight:700;cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\");background-repeat:no-repeat;background-position:right 10px center;transition:border-color .15s,box-shadow .15s;" onfocus="this.style.borderColor='var(--blue)';this.style.boxShadow='0 0 0 3px rgba(37,99,235,0.12)'" onblur="this.style.borderColor='';this.style.boxShadow=''">`;
  allU.forEach(u=>{
    h+=`<option value="${u.name}"${histUniv===u.name?' selected':''}>${u.name}</option>`;
  });
  h+=`</select></div>`;
  if(!histUniv) return h+`<div style="padding:60px 20px;text-align:center;"><div style="font-size:40px;margin-bottom:12px">🏛️</div><div style="font-size:var(--fs-md);font-weight:800;color:var(--text2);margin-bottom:6px">대학을 선택하세요</div><div style="font-size:var(--fs-base);color:var(--gray-l)">위 드롭다운에서 조회할 대학을 골라주세요.</div></div>`;
  const col=gc(histUniv);
  const myMini=_mini.filter(m=>(m.a===histUniv||m.b===histUniv) && (typeof passDateFilter!=='function'||passDateFilter(m.d||'')));
  const myUnivM=_univm.filter(m=>(m.a===histUniv||m.b===histUniv) && (typeof passDateFilter!=='function'||passDateFilter(m.d||'')));
  const myCK=_ck.filter(m=>((m.teamAMembers||[]).some(x=>x.univ===histUniv)||(m.teamBMembers||[]).some(x=>x.univ===histUniv)) && (typeof passDateFilter!=='function'||passDateFilter(m.d||'')));
  const myComp=_comps.filter(m=>(((m.a||m.u)===histUniv)||m.b===histUniv) && (typeof passDateFilter!=='function'||passDateFilter(m.d||'')));
  // 조별대회(tourneys) 경기 추가
  const myTourney=[
    ...(typeof getTourneyMatches==='function'?getTourneyMatches():[]),
    ...(typeof getNormalMatchesForHistory==='function'?getNormalMatchesForHistory():[])
  ].filter(m=>(m.a===histUniv||m.b===histUniv) && (typeof passDateFilter!=='function'||passDateFilter(m.d||'')));
  function calcStats(arr,getA,getB){let w=0,l=0,d=0;arr.forEach(m=>{const a=getA(m),b=getB(m);const iA=(a===histUniv),iB=(b===histUniv);if(iA){if(m.sa>m.sb)w++;else if(m.sb>m.sa)l++;else d++;}else if(iB){if(m.sb>m.sa)w++;else if(m.sa>m.sb)l++;else d++;}});return{w,l,d,total:w+l+d};}
  const sm=calcStats(myMini,m=>m.a,m=>m.b);
  const su=calcStats(myUnivM,m=>m.a,m=>m.b);
  const sc=calcStats(myComp,m=>m.a||m.u,m=>m.b);
  const st=calcStats(myTourney,m=>m.a,m=>m.b);
  let ckW=0,ckL=0;
  myCK.forEach(m=>{
    // univWins가 채워진 경우 (match builder 저장)
    if(m.univWins&&Object.keys(m.univWins).length){
      ckW+=(m.univWins[histUniv]||0);
      ckL+=(m.univLosses&&m.univLosses[histUniv]||0);
    } else {
      // 미채워진 경우: sets 내 게임별 승패 집계
      let hasSets=false;
      (m.sets||[]).forEach(set=>{
        (set.games||[]).forEach(g=>{
          hasSets=true;
          const wp=players.find(p=>p.name===(g.wName||''));
          const lp=players.find(p=>p.name===(g.lName||''));
          if(wp&&wp.univ===histUniv) ckW++;
          if(lp&&lp.univ===histUniv) ckL++;
        });
      });
      // sets도 없으면 팀 스코어로 대체
      if(!hasSets){
        const inA=(m.teamAMembers||[]).some(x=>x.univ===histUniv);
        const inB=(m.teamBMembers||[]).some(x=>x.univ===histUniv);
        if(inA&&m.sa!=null&&m.sb!=null){if(m.sa>m.sb)ckW++;else if(m.sb>m.sa)ckL++;}
        else if(inB&&m.sa!=null&&m.sb!=null){if(m.sb>m.sa)ckW++;else if(m.sa>m.sb)ckL++;}
      }
    }
  });

  // 상대 대학 승/패 집계
  const oppStats={};
  function addOpp(myU,oppU,myWin){
    if(myU!==histUniv||oppU===histUniv)return;
    if(!oppStats[oppU])oppStats[oppU]={w:0,l:0};
    if(myWin)oppStats[oppU].w++;else oppStats[oppU].l++;
  }
  myMini.forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  myUnivM.forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  myComp.forEach(m=>{const a=m.a||m.u||'';addOpp(a,m.b,m.sa>m.sb);addOpp(m.b,a,m.sb>m.sa);});
  myTourney.forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});

  // 총합 계산
  const totalW=sm.w+su.w+sc.w+st.w+ckW;
  const totalL=sm.l+su.l+sc.l+st.l+ckL;
  const totalD=sm.d+su.d+sc.d+st.d;
  const totalAll=totalW+totalL+totalD;
  const totalWR=totalAll?Math.round(totalW/totalAll*100):0;

  h+=`<div style="background:linear-gradient(135deg,${col}18 0%,${col}08 100%);border:2px solid ${col}55;border-radius:var(--r2);padding:20px 22px;margin-bottom:22px;position:relative;overflow:hidden;">
    <div style="position:absolute;right:-18px;top:-18px;width:90px;height:90px;border-radius:50%;background:${col}12;pointer-events:none"></div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap;">
      <span class="ubadge clickable-univ" style="background:${col};font-size:var(--fs-md);padding:6px 18px;border-radius:999px;box-shadow:0 2px 8px ${col}55;font-weight:900;letter-spacing:.3px" onclick="openUnivModal('${escJS(histUniv)}')">${histUniv}</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:17px;color:${col};letter-spacing:-.3px">대전 통합 성적</span>
      <span style="margin-left:auto;background:${col};color:#fff;border-radius:999px;padding:4px 14px;font-size:var(--fs-base);font-weight:800;box-shadow:0 1px 6px ${col}55">${totalAll}경기 · ${totalWR}%</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;">
      ${statCard('⚡ 미니대전',sm.w,sm.l,sm.d,col)}
      ${statCard('🏟️ 대학대전',su.w,su.l,su.d,col)}
      ${statCard('🎖️ 대회',sc.w,sc.l,sc.d,col)}
      ${st.total>0?statCard('🏆 조별대회',st.w,st.l,st.d,col):''}
      ${statCard('🤝 대학CK',ckW,ckL,0,col)}
    </div>
  </div>`;

  // 상대 대학별 전적표
  const oppList=Object.entries(oppStats).filter(([,s])=>s.w+s.l>0).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l));
  if(oppList.length){
    h+=`<div class="hist-univ-opp-header" style="display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:10px 14px;background:linear-gradient(135deg,${col}10,${col}05);border-radius:14px;border:1.5px solid ${col}22;">
      <span style="font-size:20px;line-height:1">🆚</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:${col};letter-spacing:-.2px">상대 대학 대전 전적</span>
      <span style="margin-left:auto;background:${col}22;color:${col};border-radius:999px;padding:3px 10px;font-size:var(--fs-sm);font-weight:800">${oppList.length}개 대학</span>
    </div>`;
    h+=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px;margin-bottom:20px;">`;
    oppList.forEach(([opp,s])=>{
      const ot=s.w+s.l;const ow=ot?Math.round(s.w/ot*100):0;const oc=gc(opp);
      const barW=Math.round(s.w/ot*100);
      h+=`<div style="background:var(--card);border:1.5px solid var(--border);border-radius:12px;padding:10px 14px;display:flex;align-items:center;gap:10px;cursor:pointer;transition:box-shadow .15s" onclick="openUnivModal('${escJS(opp)}')">
        <span class="ubadge" style="background:${oc};font-size:var(--fs-sm);padding:3px 10px;border-radius:999px;flex-shrink:0;min-width:60px;text-align:center">${opp}</span>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:var(--fs-sm);font-weight:800"><span style="color:var(--green)">${s.w}승</span> <span style="color:var(--red)">${s.l}패</span></span>
            <span style="font-size:var(--fs-sm);font-weight:800;color:${ow>=50?'var(--green)':'var(--red)'}">${ow}%</span>
          </div>
          <div style="height:5px;background:var(--border);border-radius:99px;overflow:hidden">
            <div style="height:100%;width:${barW}%;background:${ow>=50?'var(--green)':'var(--red)'};border-radius:99px;transition:width .3s"></div>
          </div>
        </div>
      </div>`;
    });
    h+=`</div>`;
  }

  const totalMatches=myMini.length+myUnivM.length+myCK.length+myComp.length+myTourney.length;
  if(!totalMatches) h+=`<div style="padding:40px;text-align:center;color:var(--gray-l)">이 대학의 대전 기록이 없습니다.</div>`;
  return h;
}

