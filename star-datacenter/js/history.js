function rHist(C,T){
  T.innerText='📅 대전 기록';

  const tabs=[
    {id:'race',lbl:'🧬 종족승률'},
    {id:'ind',lbl:'🎮 개인전'},
    {id:'mini',lbl:'⚡ 미니대전'},
    {id:'ck',lbl:'🤝 대학CK'},
    {id:'univm',lbl:'🏟️ 대학대전'},
    {id:'tourney',lbl:'🎖️ 대회'},
    {id:'tiertour',lbl:'🎯 티어대회'},
    {id:'univstat',lbl:'🏛️ 대학별'},
    {id:'univrank',lbl:'🏛️ 대학별 포인트 순위'},
    {id:'pro',lbl:'🏅 프로리그'},
    {id:'player',lbl:'👤 선수별'},
    {id:'vs',lbl:'⚔️ 1:1 상대전적'}
  ];
  let h=`<div class="stabs no-export">`;
  tabs.forEach(t=>{h+=`<button class="stab ${histSub===t.id?'on':''}" onclick="histSub='${t.id}';openDetails={};if(histPage['${t.id}']!==undefined)histPage['${t.id}']=0;render()">${t.lbl}</button>`;});
  h+=`</div>`;
  const needDateFilter=['mini','ck','univm','comp','tourney','pro','player'].includes(histSub);
  if(needDateFilter && typeof buildYearMonthFilter==='function'){
    h+=buildYearMonthFilter('hist');
  }
  if(histSub==='vs'){
    h+=vsSearchHTML();
    C.innerHTML=h;
    // 두 선수 이미 선택된 경우 결과 즉시 렌더
    if(vsNameA&&vsNameB&&vsNameA!==vsNameB) _vsRenderResult();
    return;
  }
  if(histSub==='player'){
    h+=`<input type="text" id="hs" placeholder="🔍 스트리머 검색..." onkeyup="doSearch(this.value)"
      style="width:100%;max-width:320px;padding:10px 16px;border:2px solid var(--blue);border-radius:8px;font-size:13px;margin-bottom:16px;">
      <div id="hres"></div>`;
    C.innerHTML=h;
    if(searchTarget){
      document.getElementById('hs').value=searchTarget;
      doSearch(searchTarget);
    }
    return;
  }
  if(histSub==='race'){
    if(typeof raceSummaryHTML==='function'){
      h+=raceSummaryHTML();
      C.innerHTML=h;
      return;
    }
    rRace(C,T);
    return;
  }
  if(histSub==='univstat'){h+=rHistUnivStat();C.innerHTML=h;return;}
  if(histSub==='univrank'){
    if(typeof rUnivBodyHTML==='function'){
      h+=rUnivBodyHTML();
      C.innerHTML=h;
      return;
    }
    rUniv(C,T);
    return;
  }
  if(histSub==='mini') h+=recSummaryListHTML(miniM,'mini','hist');
  else if(histSub==='ind') h+=typeof indRecordsHTML==='function'?indRecordsHTML():'<div style="padding:30px;text-align:center;color:var(--gray-l)">기록 없음</div>';
  else if(histSub==='ck') h+=recSummaryListHTML(ckM,'ck','hist');
  else if(histSub==='univm') h+=recSummaryListHTML(univM,'univm','hist');
  else if(histSub==='comp') h+=compSummaryListHTML('hist');
  else if(histSub==='tourney') h+=histTourneyHTML('hist');
  else if(histSub==='tiertour') h+=ttM&&ttM.length?recSummaryListHTMLFiltered(ttM,'tt','hist'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">티어대회 기록이 없습니다.</div>';
  else if(histSub==='pro') h+=recSummaryListHTML(proM,'pro','hist');
  C.innerHTML=h;
}


/* ══════════════════════════════════════
   대전 기록 > 대회 탭: 미니대전처럼 보이는 대회 경기 기록
══════════════════════════════════════ */
function histTourneyHTML(context){
  // tourneys(조편성 대회) + comps(기존 대회) 합산
  const tourItems=getTourneyMatches();
  const compItems=[...comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
  const allItems=[...tourItems,...compItems].filter(m=>{
    if(!m.a||!m.b) return false;
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return false;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return false;
    return typeof passDateFilter!=='function'||passDateFilter(m.d||'');
  });
  allItems.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar=`<div class="sort-bar no-export">
    <span style="font-size:11px;color:var(--text3)">날짜 정렬</span>
    <button class="sort-btn ${recSortDir==='desc'?'on':''}" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="sort-btn ${recSortDir==='asc'?'on':''}" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    <span style="font-size:11px;color:var(--gray-l);margin-left:4px">${allItems.length}건</span>
  </div>`;
  if(!allItems.length) return sortBar+`<div style="padding:40px;text-align:center;color:var(--gray-l);">대회 경기 기록이 없습니다.</div>`;

  // 대회명별로 그룹화
  const groups={};
  allItems.forEach((m,idx)=>{
    const compName=m.n||m.compName||'기타 대회';
    if(!groups[compName]) groups[compName]=[];
    groups[compName].push({m,idx});
  });

  let h=sortBar;
  Object.entries(groups).forEach(([compName,items])=>{
    const firstDate=items[items.length-1]?.m?.d||'';
    const lastDate=items[0]?.m?.d||'';
    const dateRange=firstDate===lastDate?firstDate:(firstDate&&lastDate?`${lastDate} ~ ${firstDate}`:'');
    h+=`<div style="background:linear-gradient(90deg,var(--blue-l),var(--white));border:1.5px solid var(--blue-ll);border-radius:12px;padding:10px 16px;margin-bottom:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:var(--blue)">🎖️ ${compName}</span>
      ${dateRange?`<span style="font-size:11px;color:var(--gray-l)">${dateRange}</span>`:''}
      <span style="font-size:11px;color:var(--text3);background:var(--blue-ll);border-radius:20px;padding:1px 10px">${items.length}경기</span>
    </div>`;
    items.forEach(({m,idx})=>{
      const a=m.a||'',b=m.b||'';
      const ca=gc(a),cb=gc(b);
      const aWin=m.sa>m.sb,bWin=m.sb>m.sa;
      const key=`${context}-tourney-${idx}`;
      const rIdx=(m._src==='comps')?m._origIdx:-1;
      const grpBadge=m._src==='tour'
        ?`<span style="background:${m.grpColor||'#2563eb'};color:#fff;font-size:10px;font-weight:700;padding:1px 8px;border-radius:4px">GROUP ${m.grpLetter||''}</span>`:'';
      h+=`<div class="rec-summary" style="margin-left:12px;border-left:3px solid var(--blue-ll)">
        <div class="rec-sum-header">
          <span style="color:var(--gray-l);font-size:11px;min-width:72px">${m.d||''}</span>
          ${grpBadge}
          <div class="rec-sum-vs">
            ${a?`<span class="ubadge${aWin?'':' loser'} clickable-univ" style="background:${ca}" onclick="openUnivModal('${a}')">${a}</span>`:''}
            ${(a&&b)?`<div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세 보기">
              <span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa||0}</span>
              <span style="color:var(--gray-l);font-size:14px">:</span>
              <span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb||0}</span>
            </div>`:''}
            ${b?`<span class="ubadge${bWin?'':' loser'} clickable-univ" style="background:${cb}" onclick="openUnivModal('${b}')">${b}</span>`:''}
            ${(a&&b)?`<span style="font-size:12px;font-weight:700;color:${aWin?ca:bWin?cb:'#888'}">
              ${aWin?'▶ '+a+' 승':bWin?'▶ '+b+' 승':'무승부'}
            </span>`:''}
          </div>
          <div style="margin-left:auto;display:flex;gap:5px;align-items:center" class="no-export">
            <button id="detbtn-${key}" class="btn-detail" onclick="toggleDetail('${key}')">▼ 상세</button>
            ${rIdx>=0?adminBtn(`<button class="btn btn-o btn-xs" onclick="openRE('comp',${rIdx})">수정</button>`):''}
            ${rIdx>=0?adminBtn(`<button class="btn btn-r btn-xs" onclick="delRec('comp',${rIdx})">삭제</button>`):''}
            ${m._src==='tour'?adminBtn(`<button class="btn btn-o btn-xs" onclick="leagueEditMatch('${m._tnId}',${m._gi},${m._mi})">수정</button>`):''}
          </div>
        </div>
        <div id="det-${key}" class="rec-detail-area">
          ${_regDet(key,{...m,_editRef:rIdx>=0?'comp:'+rIdx:''},  'comp',a,b,ca,cb,aWin,bWin)}
          <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)" class="no-export">
            ${m.memo?`<div style="font-size:12px;color:var(--text2);background:#fffbeb;border:1px solid var(--gold-b);border-radius:6px;padding:6px 10px;margin-bottom:6px">📝 ${m.memo}</div>`:''}
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              <button class="btn-capture btn-xs" onclick="captureDetail('det-${key}','대회_${(m.d||'match').replace(/\//g,'-')}')">📷 이미지 저장</button>
              <button class="btn btn-p btn-xs" onclick="_shareMode='match';window._shareMatchObj=_getHistTourneyMatchObj(${idx},'${context}');openShareCardModal();setTimeout(()=>renderShareCardByMatchObj(window._shareMatchObj),80)">🎴 공유 카드</button>
              ${rIdx>=0&&isLoggedIn?`<input type="text" id="memo-${key}" placeholder="경기 메모..." value="${m.memo||''}" style="flex:1;font-size:12px">
              <button class="btn btn-w btn-xs" onclick="saveMemo('comp',${rIdx},'memo-${key}')">💾 메모</button>
              ${m.memo?`<button class="btn btn-r btn-xs" onclick="saveMemo('comp',${rIdx},null)">삭제</button>`:''}`:''}
            </div>
          </div>
        </div>
      </div>`;
    });
  });
  return h;
}

// 대회 탭 공유카드용 헬퍼
window._histTourneyCache={};
function _getHistTourneyMatchObj(idx, context){
  const key=context+'_tourney';
  if(!window._histTourneyCache[key]){
    const tourItems=getTourneyMatches();
    const compItems=[...comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
    const all=[...tourItems,...compItems].filter(m=>{
      if(!m.a||!m.b) return false;
      if(m.sa==null||m.sb==null) return false;
      return typeof passDateFilter!=='function'||passDateFilter(m.d||'');
    });
    all.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
    window._histTourneyCache[key]=all;
  }
  return window._histTourneyCache[key][idx]||null;
}


function rHistUnivStat(){
  const allU=getAllUnivs();
  if(!histUniv&&allU.length) histUniv=allU[0].name;
  let h='';
  if(typeof buildYearMonthFilter==='function'){
    h+=buildYearMonthFilter('hist-univ');
  }
  h+=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;" class="no-export">`;
  allU.forEach(u=>{
    const sel=histUniv===u.name;
    h+=`<button class="pill ${sel?'on':''}" style="${sel?`background:${u.color};border-color:${u.color};color:#fff`:''}" onclick="histUniv='${u.name}';openDetails={};render()">${u.name}</button>`;
  });
  h+=`</div>`;
  if(!histUniv) return h+`<div style="padding:40px;text-align:center;color:var(--gray-l)">대학을 선택하세요.</div>`;
  const col=gc(histUniv);
  const myMini=miniM.filter(m=>(m.a===histUniv||m.b===histUniv)&&(!passDateFilter||passDateFilter(m.d||'')));
  const myUnivM=univM.filter(m=>(m.a===histUniv||m.b===histUniv)&&(!passDateFilter||passDateFilter(m.d||'')));
  const myCK=ckM.filter(m=>((m.teamAMembers||[]).some(x=>x.univ===histUniv)||(m.teamBMembers||[]).some(x=>x.univ===histUniv))&&(!passDateFilter||passDateFilter(m.d||'')));
  const myComp=comps.filter(m=>(((m.a||m.u)===histUniv)||m.b===histUniv)&&(!passDateFilter||passDateFilter(m.d||'')));
  // 조별대회(tourneys) 경기 추가
  const myTourney=(typeof getTourneyMatches==='function'?getTourneyMatches():[])
    .filter(m=>(m.a===histUniv||m.b===histUniv)&&(!passDateFilter||passDateFilter(m.d||'')));
  function calcStats(arr,getA,getB){let w=0,l=0,d=0;arr.forEach(m=>{const a=getA(m),b=getB(m);const iA=(a===histUniv),iB=(b===histUniv);if(iA){if(m.sa>m.sb)w++;else if(m.sb>m.sa)l++;else d++;}else if(iB){if(m.sb>m.sa)w++;else if(m.sa>m.sb)l++;else d++;}});return{w,l,d,total:w+l+d};}
  const sm=calcStats(myMini,m=>m.a,m=>m.b);
  const su=calcStats(myUnivM,m=>m.a,m=>m.b);
  const sc=calcStats(myComp,m=>m.a||m.u,m=>m.b);
  const st=calcStats(myTourney,m=>m.a,m=>m.b);
  let ckW=0,ckL=0;
  myCK.forEach(m=>{if(m.univWins&&m.univWins[histUniv])ckW+=m.univWins[histUniv];if(m.univLosses&&m.univLosses[histUniv])ckL+=m.univLosses[histUniv];});

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

  h+=`<div style="background:${col}0d;border:2px solid ${col}44;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <span class="ubadge clickable-univ" style="background:${col};font-size:14px;padding:5px 16px" onclick="openUnivModal('${histUniv}')">${histUniv}</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px;color:${col}">대전 통합 성적</span>
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      ${statCard('⚡ 미니대전',sm.w,sm.l,sm.d,col)}
      ${statCard('🏟️ 대학대전',su.w,su.l,su.d,col)}
      ${statCard('🎖️ 대회',sc.w,sc.l,sc.d,col)}
      ${st.total>0?statCard('🏆 조별대회',st.w,st.l,st.d,col):''}
      ${statCard('🤝 대학CK (게임)',ckW,ckL,0,col)}
    </div>
  </div>`;

  // 상대 대학별 전적표
  const oppList=Object.entries(oppStats).filter(([,s])=>s.w+s.l>0).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l));
  if(oppList.length){
    h+=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#7c3aed;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #ede9fe">🆚 상대 대학 대전 전적</div>`;
    h+=`<table style="margin-bottom:20px"><thead><tr><th>상대 대학</th><th>승</th><th>패</th><th>승률</th></tr></thead><tbody>`;
    oppList.forEach(([opp,s])=>{
      const ot=s.w+s.l;const ow=ot?Math.round(s.w/ot*100):0;const oc=gc(opp);
      h+=`<tr><td><span class="ubadge clickable-univ" style="background:${oc}" onclick="openUnivModal('${opp}')">${opp}</span></td>
        <td class="wt" style="font-weight:800;font-size:14px">${s.w}</td>
        <td class="lt" style="font-weight:800;font-size:14px">${s.l}</td>
        <td style="font-weight:700;color:${ow>=50?'var(--green)':'var(--red)'}">${ot?ow+'%':'-'}</td></tr>`;
    });
    h+=`</tbody></table>`;
  }

  if(myMini.length){h+=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:var(--blue);margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll)">⚡ 미니대전 기록</div>`;h+=recSummaryListHTMLFiltered(myMini,'mini','ustat-mini',histUniv);}
  if(myUnivM.length){h+=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#7c3aed;margin:16px 0 10px;padding-bottom:6px;border-bottom:2px solid #ede9fe">🏟️ 대학대전 기록</div>`;h+=recSummaryListHTMLFiltered(myUnivM,'univm','ustat-univm',histUniv);}
  if(myCK.length){h+=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#dc2626;margin:16px 0 10px;padding-bottom:6px;border-bottom:2px solid #fee2e2">🤝 대학CK 기록</div>`;h+=recSummaryListHTMLFiltered(myCK,'ck','ustat-ck',histUniv);}
  if(myComp.length){
    h+=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:var(--gold);margin:16px 0 10px;padding-bottom:6px;border-bottom:2px solid var(--gold-b)">🎖️ 대회 기록</div>`;
    myComp.forEach(m=>{
      const rIdx=comps.indexOf(m);const a=m.a||m.hostUniv||m.u||'';const b=m.b||'';
      const ca=gc(a);const cb=gc(b);const aWin=m.sa>m.sb;const bWin=m.sb>m.sa;
      const isA=(a===histUniv),isB=(b===histUniv);const myWin=(isA&&aWin)||(isB&&bWin);
      const key=`ustat-comp-${rIdx}`;
      h+=`<div class="rec-summary">
        <div class="rec-sum-header">
          <span style="color:var(--gray-l);font-size:11px;min-width:72px">${m.d||''}</span>
          <span style="font-weight:700;font-size:13px">🎖️ ${m.n||'대회'}</span>
          <div class="rec-sum-vs">
            ${a?`<span class="ubadge${aWin?'':' loser'} clickable-univ" style="background:${ca}" onclick="openUnivModal('${a}')">${a}</span>`:''}
            ${(a&&b)?`<div class="rec-sum-score score-click" onclick="toggleDetail('${key}')"><span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa||0}</span><span style="color:var(--gray-l);font-size:14px">:</span><span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb||0}</span></div>`:''}
            ${b?`<span class="ubadge${bWin?'':' loser'} clickable-univ" style="background:${cb}" onclick="openUnivModal('${b}')">${b}</span>`:''}
            <span style="font-size:12px;font-weight:700;color:${myWin?col:'#888'}">${myWin?'▶ '+histUniv+' 승':aWin?'▶ '+a+' 승':bWin?'▶ '+b+' 승':'무승부'}</span>
          </div>
          <div style="margin-left:auto" class="no-export"><button id="detbtn-${key}" class="btn-detail" onclick="toggleDetail('${key}')">▼ 상세 열기</button></div>
        </div>
        <div id="det-${key}" class="rec-detail-area">
          ${_regDet(key,rIdx>=0?{...m,_editRef:'comp:'+rIdx}:m,'comp',a,b,ca,cb,aWin,bWin)}
          <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              <button class="btn-capture btn-xs no-export" onclick="captureDetail('det-${key}','대회_${m.d||'match'}')">📷 이미지 저장</button>
              <button class="btn btn-p btn-xs no-export" onclick="_shareMode='match';window._shareMatchObj={a:'${a.replace(/'/g,"\\'")}',b:'${b.replace(/'/g,"\\'")}',sa:${m.sa||0},sb:${m.sb||0},d:'${(m.d||'').replace(/'/g,"\\'")}',n:'${(m.n||'대회').replace(/'/g,"\\'")}',sets:[]};openShareCardModal();setTimeout(()=>renderShareCardByMatchObj(window._shareMatchObj),80)">🎴 공유 카드</button>
            </div>
          </div>
        </div>
      </div>`;
    });
  }
  if(!myMini.length&&!myUnivM.length&&!myCK.length&&!myComp.length&&!myTourney.length)h+=`<div style="padding:40px;text-align:center;color:var(--gray-l)">이 대학의 대전 기록이 없습니다.</div>`;
  // 조별대회 기록
  if(myTourney.length){
    h+=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#0891b2;margin:16px 0 10px;padding-bottom:6px;border-bottom:2px solid #cffafe">🏆 조별대회 기록</div>`;
    myTourney.forEach(m=>{
      const a=m.a||'';const b=m.b||'';
      const ca=gc(a);const cb=gc(b);const aWin=m.sa>m.sb;const bWin=m.sb>m.sa;
      const isA=(a===histUniv),isB=(b===histUniv);const myWin=(isA&&aWin)||(isB&&bWin);
      const key=`ustat-tour-${m._tnId||''}-${m._gi||0}-${m._mi||0}`;
      h+=`<div class="rec-summary">
        <div class="rec-sum-header">
          <span style="color:var(--gray-l);font-size:11px;min-width:72px">${m.d||''}</span>
          <span style="font-weight:700;font-size:13px">🏆 ${m.n||'조별대회'} ${m.grpName?'GROUP '+m.grpLetter:''}</span>
          <div class="rec-sum-vs">
            ${a?`<span class="ubadge${aWin?'':' loser'} clickable-univ" style="background:${ca}" onclick="openUnivModal('${a}')">${a}</span>`:''}
            <div class="rec-sum-score"><span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa||0}</span><span style="color:var(--gray-l);font-size:14px">:</span><span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb||0}</span></div>
            ${b?`<span class="ubadge${bWin?'':' loser'} clickable-univ" style="background:${cb}" onclick="openUnivModal('${b}')">${b}</span>`:''}
            <span style="font-size:12px;font-weight:700;color:${myWin?col:'#888'}">${myWin?'▶ '+histUniv+' 승':aWin?'▶ '+a+' 승':bWin?'▶ '+b+' 승':'무승부'}</span>
          </div>
        </div>
      </div>`;
    });
  }
  return h;
}

function statCard(label,w,l,d,col){
  const tot=w+l+d;const wr=tot?Math.round(w/tot*100):0;
  return `<div style="background:var(--white);border:1px solid ${col}33;border-radius:10px;padding:12px 16px;min-width:120px;text-align:center;flex:1">
    <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:8px">${label}</div>
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:20px"><span class="wt">${w}승</span> <span class="lt">${l}패</span>${d?` <span style="color:var(--gray-l)">${d}무</span>`:''}</div>
    <div style="font-size:12px;font-weight:700;color:${wr>=50?'var(--green)':'var(--red)'};margin-top:4px">${tot?wr+'%':'-'}</div>
  </div>`;
}

function recSummaryListHTMLFiltered(arr,mode,ctxPrefix,filterUniv){
  if(!arr.length)return`<div style="padding:20px;text-align:center;color:var(--gray-l);">기록이 없습니다.</div>`;
  const isCKmode=(mode==='ck'||mode==='pro'||mode==='tt');
  let h='';
  arr.forEach(m=>{
    if(isCKmode){if(!m.teamAMembers||!m.teamBMembers) return;}
    else{if(!m.a||!m.b) return;}
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return;
    if(typeof passDateFilter==='function' && !passDateFilter(m.d||''))return;
    const srcArr=mode==='mini'?miniM:mode==='univm'?univM:mode==='pro'?proM:mode==='tt'?ttM:ckM;
    const i=srcArr.indexOf(m);
    const isCK=isCKmode;
    const ca=isCK?'#2563eb':gc(m.a);const cb=isCK?'#dc2626':gc(m.b);
    const rawLA2=(m.teamALabel||'').replace(/^\$\{.*\}$/,'');
    const rawLB2=(m.teamBLabel||'').replace(/^\$\{.*\}$/,'');
    const labelA=isCK?(rawLA2||'A팀'):m.a;const labelB=isCK?(rawLB2||'B팀'):m.b;
    const aWin=(m.sa>m.sb),bWin=(m.sb>m.sa);
    const col=gc(filterUniv);
    const isA=(!isCK&&m.a===filterUniv)||(isCK&&(m.teamAMembers||[]).some(x=>x.univ===filterUniv));
    const isB=(!isCK&&m.b===filterUniv)||(isCK&&(m.teamBMembers||[]).some(x=>x.univ===filterUniv));
    const myWin=(isA&&aWin)||(isB&&bWin);
    const key=`${ctxPrefix}-${mode}-${i}`;
    h+=`<div class="rec-summary">
      <div class="rec-sum-header">
        <span style="color:var(--gray-l);font-size:11px;min-width:72px">${m.d||''}</span>
        ${m.t?`<span style="font-weight:700;font-size:12px;color:var(--text3)">${m.t}</span>`:''}
        ${(m.n&&mode!=='comp')?`<span style="font-weight:700;font-size:12px;color:var(--text3)">${m.n}</span>`:''}
        <div class="rec-sum-vs">
          <span class="ubadge${aWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${ca};display:inline-flex;align-items:center;gap:4px" onclick="openUnivModal('${isCK?'':m.a}')">${(()=>{const n=isCK?'':m.a;const url=UNIV_ICONS[n]||(univCfg.find(x=>x.name===n)||{}).icon||'';return url?`<img src="${url}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`:''})()}${labelA}</span>
          <div class="rec-sum-score score-click" onclick="toggleDetail('${key}')"><span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa}</span><span style="color:var(--gray-l);font-size:14px">:</span><span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb}</span></div>
          <span class="ubadge${bWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${cb};display:inline-flex;align-items:center;gap:4px" onclick="openUnivModal('${isCK?'':m.b}')">${(()=>{const n=isCK?'':m.b;const url=UNIV_ICONS[n]||(univCfg.find(x=>x.name===n)||{}).icon||'';return url?`<img src="${url}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`:''})()}${labelB}</span>
          <span style="font-size:12px;font-weight:700;color:${myWin?col:'#888'}">${myWin?'▶ '+filterUniv+' 승':aWin?'▶ '+labelA+' 승':bWin?'▶ '+labelB+' 승':'무승부'}</span>
        </div>
        <div style="margin-left:auto;display:flex;gap:5px;align-items:center" class="no-export">
          <button id="detbtn-${key}" class="btn-detail" onclick="toggleDetail('${key}')">▼ 상세</button>
          ${(mode==='tt'||mode==='mini'||mode==='univm'||mode==='comp')?adminBtn(`<button class="btn btn-o btn-xs" onclick="openRE('${mode}',${i})">수정</button>`):''}
          ${adminBtn(`<button class="btn btn-r btn-xs" onclick="delRec('${mode}',${i})">삭제</button>`)}
        </div>
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,{...m,_editRef:`${mode}:${i}`},mode,labelA,labelB,ca,cb,aWin,bWin)}
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <button class="btn-capture btn-xs no-export" onclick="captureDetail('det-${key}','${m.d||'match'}')">📷 이미지 저장</button>
            <button class="btn btn-p btn-xs no-export" onclick="openShareCardFromMatch('${mode}',${i})">🎴 공유 카드</button>
          </div>
        </div>
      </div>
    </div>`;
  });
  return h;
}

function recSummaryListHTML(arr, mode, context){
  const isCKmode=(mode==='ck'||mode==='pro'||mode==='tt');
  if(!window._recQ)window._recQ={};
  if(!arr.length){
    const hasQ=!!(window._recQ&&window._recQ[mode]);
    const initQ=(window._recQ&&window._recQ[mode])||'';
    const emptyBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <span style="font-size:11px;color:var(--text3)">날짜</span>
    <button class="sort-btn ${recSortDir==='desc'?'on':''}" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="sort-btn ${recSortDir==='asc'?'on':''}" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    <div style="margin-left:auto;display:flex;align-items:center;gap:4px">
      <input type="text" id="rq-${mode}" placeholder="🔍 선수/대학/종족 검색..." value="${initQ}"
        oninput="recFilterInPlace('${mode}',this.value)"
        style="padding:4px 10px;border:1px solid var(--border2);border-radius:6px;font-size:12px;width:140px">
      <button id="rq-clear-${mode}" onclick="recClearSearch('${mode}')" style="display:${initQ?'inline-block':'none'};background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:16px;line-height:1;padding:0 2px" title="검색 초기화">✕</button>
    </div>
  </div>`;
    return emptyBar+`<div style="padding:40px;text-align:center;color:var(--gray-l);">기록이 없습니다.</div>`;
  }
  // 날짜 필터만 적용 (검색어 필터는 DOM에서 실시간 처리)
  let filtered=arr.map((m,i)=>({m,i})).filter(({m})=>{
    if(isCKmode){
      if(!m.teamAMembers||!m.teamBMembers) return false;
    } else {
      if(!m.a||!m.b) return false;
    }
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return false;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return false;
    if(typeof passDateFilter==='function'&&!passDateFilter(m.d||'')) return false;
    return true;
  });
  filtered.sort((a,b)=>recSortDir==='asc'?(a.m.d||'').localeCompare(b.m.d||''):(b.m.d||'').localeCompare(a.m.d||''));

  // ── 검색바 + 전체 렌더링 (DOM 실시간 필터링) ──
  const totalItems=filtered.length;
  const initQ2=(window._recQ&&window._recQ[mode])||'';
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <span style="font-size:11px;color:var(--text3)">날짜</span>
    <button class="sort-btn ${recSortDir==='desc'?'on':''}" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="sort-btn ${recSortDir==='asc'?'on':''}" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    <span id="rq-count-${mode}" style="font-size:11px;color:var(--gray-l);margin-left:4px">${totalItems}건</span>
    <div style="margin-left:auto;display:flex;align-items:center;gap:4px">
      <input type="text" id="rq-${mode}" placeholder="🔍 선수/대학 검색..." value="${initQ2}"
        oninput="recFilterInPlace('${mode}',this.value)"
        style="padding:4px 10px;border:1px solid var(--border2);border-radius:6px;font-size:12px;width:140px">
      <button id="rq-clear-${mode}" onclick="recClearSearch('${mode}')" style="display:${initQ2?'inline-block':'none'};background:none;border:none;cursor:pointer;color:var(--gray-l);font-size:16px;line-height:1;padding:0 2px" title="검색 초기화">✕</button>
    </div>
  </div>
  <div id="rq-empty-${mode}" style="display:none;padding:24px;text-align:center;color:var(--gray-l)">검색 결과가 없습니다. <button onclick="recClearSearch('${mode}')" style="margin-left:6px;padding:2px 10px;border-radius:6px;border:1px solid var(--border2);background:var(--white);color:var(--text3);font-size:12px;cursor:pointer">초기화</button></div>`;

  if(!totalItems){
    return sortBar+`<div style="padding:40px;text-align:center;color:var(--gray-l);">해당 기간에 기록이 없습니다.</div>`;
  }

  // filtered 전체(페이지 관계없이) data-hay로 렌더링 후 DOM 필터링
  // → 페이지네이션 대신 전체 렌더링 + CSS display:none 방식
  let h=sortBar+`<div id="rec-list-${mode}">`;
  filtered.forEach(({m,i})=>{
    const isCK=(mode==='ck'||mode==='pro'||mode==='tt');
    const ca=isCK?'#2563eb':gc(m.a);
    const cb=isCK?'#dc2626':gc(m.b);
    // teamALabel/B 필드 정리: 잘못된 값({...} 포함) 필터링
    const rawLA=(m.teamALabel||'').replace(/^\$\{.*\}$/,'');
    const rawLB=(m.teamBLabel||'').replace(/^\$\{.*\}$/,'');
    const labelA=isCK?(rawLA||'A팀'):m.a;
    const labelB=isCK?(rawLB||'B팀'):m.b;
    const aWin=(m.sa>m.sb);const bWin=(m.sb>m.sa);
    const key=`${context}-${mode}-${i}`;
    // 검색용 hay 데이터
    const hayData=[m.a||'',m.b||'',m.n||'',m.d||'',labelA,labelB,
      (m.sets||[]).flatMap(s=>(s.games||[]).flatMap(g=>[g.playerA||'',g.playerB||''])).join(' '),
      (m.teamAMembers||[]).map(x=>x.name||'').join(' '),
      (m.teamBMembers||[]).map(x=>x.name||'').join(' ')
    ].join(' ').toLowerCase().replace(/"/g,'&quot;');
    // 대학 아이콘 (대학끼리 경기: mini/univm/comp/tour 는 상대 대학 아이콘, CK/pro/tt는 소속 대학 아이콘)
    const iconA=(()=>{const n=isCK?'':m.a;const u=univCfg.find(x=>x.name===n)||{};const url=UNIV_ICONS[n]||u.icon||'';return url?`<img src="${url}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0;vertical-align:middle" onerror="this.style.display='none'">`:''})();
    const iconB=(()=>{const n=isCK?'':m.b;const u=univCfg.find(x=>x.name===n)||{};const url=UNIV_ICONS[n]||u.icon||'';return url?`<img src="${url}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0;vertical-align:middle" onerror="this.style.display='none'">`:''})();
    h+=`<div class="rec-summary" data-hay="${hayData}">
      <div class="rec-sum-header">
        <span style="color:var(--gray-l);font-size:11px;min-width:72px">${m.d||''}</span>
        <div class="rec-sum-vs">
          <span class="ubadge${aWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${ca};display:inline-flex;align-items:center;gap:4px" onclick="${!isCK?`openUnivModal('${m.a||''}')`:''}">${iconA}${labelA}</span>
          <div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세 보기/닫기">
            <span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa}</span>
            <span style="color:var(--gray-l);font-size:14px">:</span>
            <span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb}</span>
          </div>
          <span class="ubadge${bWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${cb};display:inline-flex;align-items:center;gap:4px" onclick="${!isCK?`openUnivModal('${m.b||''}')`:''}">${iconB}${labelB}</span>
          <span style="font-size:12px;color:${aWin?ca:bWin?cb:'#888'};font-weight:600">
            ${aWin?'▶ '+labelA+' 승':bWin?'▶ '+labelB+' 승':'무승부'}
          </span>
        </div>
        <div style="margin-left:auto;display:flex;align-items:center;gap:4px;flex-shrink:0">
          <button class="btn btn-w btn-xs" onclick="copyMatchResult('${(m.a||'').replace(/'/g,"\\'")}',${m.sa||0},'${(m.b||'').replace(/'/g,"\\'")}',${m.sb||0},'${m.d||''}','${mode}',${i})" title="결과 복사" style="padding:3px 8px;font-size:14px">📋</button>
          <div style="display:flex;gap:4px;align-items:center" class="no-export">
            <button id="detbtn-${key}" class="btn-detail" onclick="toggleDetail('${key}')">▼ 상세</button>
            ${(mode!=='ck'&&mode!=='pro')||mode==='tt'?adminBtn(`<button class="btn btn-o btn-xs" onclick="openRE('${mode}',${i})">수정</button>`):''}
            ${adminBtn(`<button class="btn btn-r btn-xs" onclick="delRec('${mode}',${i})">삭제</button>`)}
          </div>
        </div>
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,{...m,_editRef:`${mode}:${i}`}, mode, labelA, labelB, ca, cb, aWin, bWin)}
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
          ${m.memo?`<div style="font-size:12px;color:var(--text2);background:#fffbeb;border:1px solid var(--gold-b);border-radius:6px;padding:6px 10px;margin-bottom:6px">📝 ${m.memo}</div>`:''}
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <button class="btn-capture btn-xs no-export" onclick="captureDetail('det-${key}','${m.d||'match'}')">📷 이미지 저장</button>
            <button class="btn btn-p btn-xs no-export" onclick="openShareCardFromMatch('${mode}',${i})">🎴 공유 카드</button>
            ${isLoggedIn?`<input type="text" id="memo-${key}" placeholder="경기 메모 입력..." value="${m.memo||''}" style="flex:1;font-size:12px">
            <button class="btn btn-w btn-xs" onclick="saveMemo('${mode}',${i},'memo-${key}')">💾 메모</button>
            ${m.memo?`<button class="btn btn-r btn-xs" onclick="saveMemo('${mode}',${i},null)">삭제</button>`:''}`:''}
          </div>
        </div>
      </div>
    </div>`;
  });

  // ── 페이지 컨트롤 ──
  if(totalItems>getHistPageSize()){
    const pages=totalPages;
    let pager=`<div class="no-export" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:16px 0;flex-wrap:wrap">`;
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=0;render()" ${curPage===0?'disabled':''}>«</button>`;
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=Math.max(0,${curPage}-1);render()" ${curPage===0?'disabled':''}>‹</button>`;
    // 페이지 번호 버튼 (최대 7개)
    let startP=Math.max(0,curPage-3);let endP=Math.min(pages-1,startP+6);
    if(endP-startP<6)startP=Math.max(0,endP-6);
    for(let p=startP;p<=endP;p++){
      pager+=`<button class="btn ${p===curPage?'btn-b':'btn-w'} btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=${p};render()">${p+1}</button>`;
    }
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=Math.min(${pages-1},${curPage}+1);render()" ${curPage===pages-1?'disabled':''}>›</button>`;
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=${pages-1};render()" ${curPage===pages-1?'disabled':''}>»</button>`;
    pager+=`<span style="font-size:11px;color:var(--text3);margin-left:6px">${curPage+1} / ${pages}</span>`;
    pager+=`</div>`;
    h+=pager;
  }

  return h||`<div style="padding:40px;text-align:center;color:var(--gray-l);">해당 기간에 기록이 없습니다.</div>`;
}

/* 모바일 시트용 레지스트리 */
window._detReg = window._detReg || {};
function _regDet(key, m, mode, lA, lB, ca, cb, aW, bW){
  window._detReg[key] = {m, mode, lA, lB, ca, cb, aW, bW};
  return buildDetailHTML(m, mode, lA, lB, ca, cb, aW, bW);
}

function buildDetailHTML(m, mode, labelA, labelB, ca, cb, aWin, bWin){
  if(!m.sets||!m.sets.length) return '<div style="font-size:12px;color:var(--gray-l);padding:8px 0">세트 상세 기록 없음</div>';
  let h='';
  m.sets.forEach((set,si)=>{
    const isAce=(si===2);
    const sLabel=isAce?'🎯 에이스전':`${si+1}세트`;
    const swA=set.scoreA||0, swB=set.scoreB||0;
    const setAWin=swA>swB, setBWin=swB>swA;
    h+=`<div class="set-row">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:7px 12px;background:${isAce?'#f5f3ff':'var(--blue-l)'};border-radius:7px;border:1px solid ${isAce?'#ddd6fe':'var(--blue-ll)'}">
        <span class="set-row-title ${isAce?'ace-t':''}" style="margin-bottom:0">${sLabel}</span>
        <span class="ubadge${setAWin?'':' loser'}" style="background:${ca};font-size:10px">${labelA}</span>
        <span style="font-weight:800;font-size:15px">
          <span class="${setAWin?'wt':setBWin?'lt':'pt-z'}">${swA}</span>
          <span style="color:var(--border2)"> : </span>
          <span class="${setBWin?'wt':setAWin?'lt':'pt-z'}">${swB}</span>
        </span>
        <span class="ubadge${setBWin?'':' loser'}" style="background:${cb};font-size:10px">${labelB}</span>
        ${setAWin?`<span style="font-size:11px;font-weight:800;color:${ca};margin-left:4px">▶ ${labelA} 세트 승</span>`:setBWin?`<span style="font-size:11px;font-weight:800;color:${cb};margin-left:4px">▶ ${labelB} 세트 승</span>`:'<span style="font-size:11px;color:var(--gray-l)">무승부</span>'}
      </div>`;
    if(set.games&&set.games.length){
      set.games.forEach((g,gi)=>{
        if(!g.playerA&&!g.playerB)return;
        const pA=players.find(p=>p.name===g.playerA);
        const pB=players.find(p=>p.name===g.playerB);
        const aIsWinner=(g.winner==='A');
        const bIsWinner=(g.winner==='B');
        const hasWinner=!!(g.winner);
        const winBgA=ca+'22'; const winBgB=cb+'22';
        const winBorderA=ca+'88'; const winBorderB=cb+'88';
        const clickA=g.playerA?`onclick="openPlayerModal('${g.playerA}')" style="cursor:pointer;text-decoration:underline dotted;"`:''
        const clickB=g.playerB?`onclick="openPlayerModal('${g.playerB}')" style="cursor:pointer;text-decoration:underline dotted;"`:''
        const raceA=pA?`<span class="rbadge r${pA.race}" style="font-size:10px;flex-shrink:0">${pA.race}</span>`:'';
        const raceB=pB?`<span class="rbadge r${pB.race}" style="font-size:10px;flex-shrink:0">${pB.race}</span>`:'';
        const photoA=pA?getPlayerPhotoHTML(pA.name,'40px','margin-right:5px;flex-shrink:0;border:2.5px solid '+ca+';box-shadow:0 1px 6px '+ca+'66'):'';
        const photoB=pB?getPlayerPhotoHTML(pB.name,'40px','margin-right:5px;flex-shrink:0;border:2.5px solid '+cb+';box-shadow:0 1px 6px '+cb+'66'):'';
        const editBtn=isLoggedIn&&m._editRef?`<button class="btn btn-o btn-xs no-export" style="margin-left:4px;flex-shrink:0" onclick="openGameEditModal('${m._editRef}',${si},${gi})">✏️</button>`:'';

        {
          // ── PC/모바일 통합: 선수 vs 선수 가로 레이아웃 ──
          const bgA = hasWinner ? (aIsWinner ? `background:${winBgA};border:1.5px solid ${winBorderA};` : `background:#f8fafc;border:1px solid #e2e8f0;opacity:.5;filter:grayscale(.6);`) : `background:var(--surface);border:1px solid var(--border);`;
          const bgB = hasWinner ? (bIsWinner ? `background:${winBgB};border:1.5px solid ${winBorderB};` : `background:#f8fafc;border:1px solid #e2e8f0;opacity:.5;filter:grayscale(.6);`) : `background:var(--surface);border:1px solid var(--border);`;
          const winTagApc = aIsWinner&&hasWinner ? `<span style="background:${ca};color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:4px;letter-spacing:.3px;flex-shrink:0">WIN</span>` : '';
          const winTagBpc = bIsWinner&&hasWinner ? `<span style="background:${cb};color:#fff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:4px;letter-spacing:.3px;flex-shrink:0">WIN</span>` : '';
          const teamBadgeA = `<span style="font-size:10px;font-weight:700;color:${ca};background:${ca}18;padding:1px 6px;border-radius:4px;flex-shrink:0">${labelA}</span>`;
          const teamBadgeB = `<span style="font-size:10px;font-weight:700;color:${cb};background:${cb}18;padding:1px 6px;border-radius:4px;flex-shrink:0">${labelB}</span>`;
          const mapDotPc = g.map ? `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#94a3b8;flex-shrink:0"></span><span style="font-size:10px;color:var(--text3);white-space:nowrap">${g.map}</span>` : '';
          h+=`<div style="display:flex;align-items:center;gap:6px;padding:6px 2px;">
            <span style="color:var(--gray-l);font-size:11px;min-width:44px;font-weight:700;flex-shrink:0;text-align:center">경기${gi+1}</span>
            <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:12px;${bgA}flex:1;min-width:0;">
              ${photoA}${raceA}
              <strong style="font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0" ${clickA}>${g.playerA||'?'}</strong>
              ${teamBadgeA}
              ${winTagApc}
            </div>
            <span style="color:var(--gray-l);font-size:13px;font-weight:800;flex-shrink:0;padding:0 4px">vs</span>
            <div style="display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:12px;${bgB}flex:1;min-width:0;">
              ${photoB}${raceB}
              <strong style="font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0" ${clickB}>${g.playerB||'?'}</strong>
              ${teamBadgeB}
              ${winTagBpc}
            </div>
            ${g.map?`<div style="display:flex;align-items:center;gap:3px;flex-shrink:0">${mapDotPc}</div>`:''}
            ${editBtn}
          </div>`;
        }
      });
    } else {
      h+=`<div style="font-size:11px;color:var(--gray-l);padding:4px 0">상세 경기 기록 없음</div>`;
    }
    h+=`</div>`;
  });
  h+=`</div>`;
  if(typeof requestAnimationFrame!=='undefined'){
    const _mode=mode, _q=(window._recQ&&window._recQ[_mode])||'';
    if(_q) requestAnimationFrame(()=>recFilterInPlace(_mode,_q));
  }
  return h;
}

// tourneys에서 완료된 모든 경기를 flat하게 추출
function getTourneyMatches(){
  const result=[];
  if(!Array.isArray(tourneys))return result;
  (tourneys||[]).forEach(tn=>{
    (tn.groups||[]).forEach((grp,gi)=>{
      const gl='ABCDEFGHIJ'[gi]||String(gi);
      const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      (grp.matches||[]).forEach((m,mi)=>{
        if(!m.a||!m.b)return;
        if(m.sa==null||m.sb==null)return;
        result.push({
          _src:'tour',_tnId:tn.id,_gi:gi,_mi:mi,
          d:m.d||'',n:tn.name,a:m.a,b:m.b,
          sa:m.sa,sb:m.sb,sets:m.sets||[],
          grpName:grp.name,grpLetter:gl,grpColor:col
        });
      });
    });
  });
  return result;
}
function compSummaryListHTML(context){
  // tourneys 경기 + comps 배열 모두 합산
  const tourItems=getTourneyMatches();
  const compItems=[...comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
  const allItems=[...tourItems,...compItems];
  if(!allItems.length)return`<div style="padding:40px;text-align:center;color:var(--gray-l);">기록이 없습니다.</div>`;
  // 날짜 필터 적용 후 정렬
  const filtered=allItems.filter(m=>
    typeof passDateFilter!=='function'||passDateFilter(m.d||'')
  );
  filtered.sort((a,b)=>recSortDir==='asc'
    ?(a.d||'').localeCompare(b.d||'')
    :(b.d||'').localeCompare(a.d||''));
  const sortBar=`<div class="sort-bar no-export">
    <span style="font-size:11px;color:var(--text3)">날짜 정렬</span>
    <button class="sort-btn ${recSortDir==='desc'?'on':''}" onclick="recSortDir='desc';render()">최신순 ↓</button>
    <button class="sort-btn ${recSortDir==='asc'?'on':''}" onclick="recSortDir='asc';render()">오래된순 ↑</button>
    <span style="font-size:11px;color:var(--gray-l);margin-left:4px">${filtered.length}건</span>
  </div>`;
  if(!filtered.length)return sortBar+`<div style="padding:40px;text-align:center;color:var(--gray-l);">해당 기간에 기록이 없습니다.</div>`;
  let h=sortBar;
  filtered.forEach((m,listIdx)=>{
    const a=m.a||m.hostUniv||m.u||'';const b=m.b||'';
    const ca=gc(a);const cb=gc(b);
    const aWin=m.sa>m.sb;const bWin=m.sb>m.sa;
    const key=`${context}-comp-${listIdx}`;
    const rIdx=(m._src==='comps')?m._origIdx:-1;
    // GROUP 배지 (tourneys 경기)
    const grpBadge=m._src==='tour'
      ?`<span style="background:${m.grpColor};color:#fff;font-size:10px;font-weight:700;padding:1px 8px;border-radius:4px;margin-left:6px">GROUP ${m.grpLetter}</span>`:'';
    h+=`<div class="rec-summary">
      <div class="rec-sum-header">
        <span style="color:var(--gray-l);font-size:11px;min-width:72px">${m.d||''}</span>
        <span style="font-weight:700;font-size:13px">🎖️ ${m.n||'대회'}${grpBadge}</span>
        <div class="rec-sum-vs">
          ${a?`<span class="ubadge${aWin?'':' loser'} clickable-univ" style="background:${ca}" onclick="openUnivModal('${a}')">${a}</span>`:''}
          ${(a&&b)?`<div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세보기">
            <span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa||0}</span>
            <span style="color:var(--gray-l);font-size:14px">:</span>
            <span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb||0}</span>
          </div>`:''}
          ${b?`<span class="ubadge${bWin?'':' loser'} clickable-univ" style="background:${cb}" onclick="openUnivModal('${b}')">${b}</span>`:''}
          ${(a&&b)?`<span style="font-size:12px;font-weight:700;color:${aWin?ca:bWin?cb:'#888'}">
            ${aWin?'▶ '+a+' 승':bWin?'▶ '+b+' 승':'무승부'}
          </span>`:''}
        </div>
        <div style="margin-left:auto;display:flex;align-items:center;gap:4px;flex-shrink:0">
          <button class="btn btn-w btn-xs" onclick="copyMatchResult('${a.replace(/'/g,"\\'")}',${m.sa||0},'${b.replace(/'/g,"\\'")}',${m.sb||0},'${m.d||''}','comp',${rIdx>=0?rIdx:'null'})" title="결과 복사" style="padding:3px 8px;font-size:14px">📋</button>
          <div style="display:flex;gap:4px;align-items:center" class="no-export">
            <button id="detbtn-${key}" class="btn-detail" onclick="toggleDetail('${key}')">▼ 상세 열기</button>
            ${rIdx>=0?adminBtn(`<button class="btn btn-o btn-xs" onclick="openRE('comp',${rIdx})">수정</button>`):''}
            ${rIdx>=0?adminBtn(`<button class="btn btn-r btn-xs" onclick="delRec('comp',${rIdx})">삭제</button>`):''}
            ${m._src==='tour'?adminBtn(`<button class="btn btn-o btn-xs" onclick="leagueEditMatch('${m._tnId}',${m._gi},${m._mi})">수정</button>`):''}
          </div>
        </div>
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,rIdx>=0?{...m,_editRef:'comp:'+rIdx}:m,'comp',a,b,ca,cb,aWin,bWin)}
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)" class="no-export">
          ${m.memo?`<div style="font-size:12px;color:var(--text2);background:#fffbeb;border:1px solid var(--gold-b);border-radius:6px;padding:6px 10px;margin-bottom:6px">📝 ${m.memo}</div>`:''}
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <button class="btn-capture btn-xs" onclick="captureDetail('det-${key}','대회_${(m.d||'match').replace(/\\//g,'-')}')">📷 이미지 저장</button>
            <button class="btn btn-p btn-xs" onclick="_shareMode='match';window._shareMatchObj=_getCompMatchObj(${listIdx},'${context}');openShareCardModal();setTimeout(()=>renderShareCardByMatchObj(window._shareMatchObj),80)">🎴 공유 카드</button>
            ${rIdx>=0&&isLoggedIn?`<input type="text" id="memo-${key}" placeholder="경기 메모..." value="${m.memo||''}" style="flex:1;font-size:12px">
            <button class="btn btn-w btn-xs" onclick="saveMemo('comp',${rIdx},'memo-${key}')">💾 메모</button>
            ${m.memo?`<button class="btn btn-r btn-xs" onclick="saveMemo('comp',${rIdx},null)">삭제</button>`:''}`:''}
          </div>
        </div>
      </div>
    </div>`;
  });
  return h||`<div style="padding:40px;text-align:center;color:var(--gray-l);">해당 기간에 기록이 없습니다.</div>`;
}
// 공유카드용 - context별 캐시된 filtered 배열에서 m 객체 반환 헬퍼
window._compListCache={};
function _getCompMatchObj(listIdx,context){
  // 캐시 없거나 데이터 변경 시 재생성
  if(!window._compListCache||!window._compListCache[context]){
    if(!window._compListCache)window._compListCache={};
    const tourItems=getTourneyMatches();
    const compItems=[...comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
    const all=[...tourItems,...compItems].filter(m=>typeof passDateFilter!=='function'||passDateFilter(m.d||''));
    all.sort((a,b)=>recSortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
    window._compListCache[context]=all;
  }
  return window._compListCache[context][listIdx]||null;
}

function delRec(mode,i){
  if(!confirm('삭제하시겠습니까?\n\n⚠️ 해당 대전의 모든 경기 결과가 선수 성적에서 차감됩니다.'))return;
  let matchObj=null;
  if(mode==='mini')     { matchObj=miniM[i];  miniM.splice(i,1); }
  else if(mode==='univm'){ matchObj=univM[i];  univM.splice(i,1); }
  else if(mode==='comp') { matchObj=comps[i];  comps.splice(i,1); }
  else if(mode==='ck')   { matchObj=ckM[i];    ckM.splice(i,1);   }
  else if(mode==='pro')  { matchObj=proM[i];   proM.splice(i,1);  }
  else if(mode==='tt')   { matchObj=ttM[i];    ttM.splice(i,1);   }
  if(matchObj) revertMatchRecord(matchObj);
  if(typeof fixPoints==='function')fixPoints();
  save();render();
}

function goToPlayer(name){
  searchTarget=name;histSub='player';openDetails={};curTab='hist';
  document.getElementById('fstrip').style.display='none';
  render();
}

function doSearch(val){
  const v=(val||'').toLowerCase().trim();
  const R=document.getElementById('hres');
  if(!R)return;
  if(!v){R.innerHTML='';return;}
  // 여러 선수 매칭 지원
  const _RMAP3={'테란':'T','테':'T','저그':'Z','저':'Z','프로토스':'P','프토':'P','프':'P'};
  const _GMAP3={'여':'F','여자':'F','남':'M','남자':'M'};
  const _toks3=v.split(/\s+/).filter(Boolean);
  let _rf3='',_gf3='',_nts3=[];
  _toks3.forEach(t=>{if(_RMAP3[t])_rf3=_RMAP3[t];else if(_GMAP3[t])_gf3=_GMAP3[t];else _nts3.push(t);});
  const matched=players.filter(x=>{
    const nm=_nts3.length===0||_nts3.every(t=>
      x.name.toLowerCase().includes(t)||(x.univ||'').toLowerCase().includes(t)||
      (x.tier||'').toLowerCase().includes(t)||(x.role||'').toLowerCase().includes(t)
    );
    return nm&&(!_rf3||x.race===_rf3)&&(!_gf3||x.gender===_gf3);
  });
  if(!matched.length){R.innerHTML=`<div style="color:var(--gray-l);padding:20px">검색 결과 없음</div>`;return;}
  // 완전 일치 우선, 아니면 첫 번째
  const p=matched.find(x=>x.name.toLowerCase()===v)||matched[0];
  // 여러 결과일 때 선택 버튼 표시
  if(matched.length>1&&matched[0].name.toLowerCase()!==v){
    let pick=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">`;
    matched.slice(0,10).forEach(m=>{
      const col=gc(m.univ);
      pick+=`<button onclick="searchTarget='${m.name.replace(/'/g,"\\'")}';doSearch('${m.name.replace(/'/g,"\\'")}');document.getElementById('hs').value='${m.name.replace(/'/g,"\\'")}'"
        style="padding:4px 12px;border-radius:20px;background:${col};color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer">${m.name}</button>`;
    });
    pick+=`</div>`;
    if(p===matched[0]&&matched.length>1){
      R.innerHTML=pick;
      // 완전 일치가 없으면 여기서 멈춤
      if(matched[0].name.toLowerCase()!==v) return;
    }
  }
  searchTarget=p.name;
  const opps={},rv={T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0}};
  p.history.forEach(h=>{
    if(!opps[h.opp])opps[h.opp]={w:0,l:0,race:h.oppRace};
    if(h.result==='승'){opps[h.opp].w++;if(rv[h.oppRace])rv[h.oppRace].w++;}
    else{opps[h.opp].l++;if(rv[h.oppRace])rv[h.oppRace].l++;}
  });
  const matchLog=[];
  function scanMatches(arr, modeLabel, getLabel){
    arr.forEach(m=>{
      if(!m.sets)return;
      m.sets.forEach((set,si)=>{
        if(!set.games)return;
        set.games.forEach(g=>{
          const isA=(g.playerA===p.name), isB=(g.playerB===p.name);
          if(!isA&&!isB)return;
          const isWin=(isA&&g.winner==='A')||(isB&&g.winner==='B');
          const opp=isA?g.playerB:g.playerA;
          const oppP=players.find(x=>x.name===opp);
          const d=m.d||'';
          if(typeof passDateFilter==='function' && !passDateFilter(d)) return;
          matchLog.push({
            date:d,
            mode:modeLabel,
            label:getLabel(m),
            result:isWin?'승':'패',
            opp:opp||'?',
            oppRace:oppP?.race||'?',
            map:g.map||'-',
            setLabel:si===2?'에이스전':`${si+1}세트`,
            mObj:m,
            si:si,
            gi:set.games.indexOf(g)
          });
        });
      });
    });
  }
  scanMatches(miniM,'미니대전',m=>m.t||'미니대전');
  scanMatches(univM,'대학대전',m=>m.n||`${m.a} vs ${m.b}`);
  scanMatches(comps,'대회',m=>m.n||'대회');
  scanMatches(ckM,'대학CK',m=>'대학CK');
  matchLog.sort((a,b)=>b.date.localeCompare(a.date));

  // 필터에 따른 기간별 전적 집계
  let fWin=p.win, fLoss=p.loss;
  if(!(filterYear==='전체' && filterMonth==='전체')){
    fWin=0;fLoss=0;
    matchLog.forEach(lg=>{
      if(lg.result==='승')fWin++; else if(lg.result==='패')fLoss++;
    });
  }
  const fTot=fWin+fLoss;
  const fWr=fTot?Math.round(fWin/fTot*100):0;

  const col=gc(p.univ);

  const modeBg={'미니대전':'#2563eb','대학대전':'#7c3aed','대회':'#d97706','대학CK':'#dc2626'};
  let h=`<div class="ipanel" style="border-color:${col}66;background:${col}0d;">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px">
      <span class="ubadge clickable-univ" style="background:${col};font-size:13px;padding:5px 14px" onclick="openUnivModal('${p.univ}')">${p.univ}</span>
      <span class="rbadge r${p.race}">${p.race}</span>
      <span style="font-size:20px">${p.name}${genderIcon(p.gender)}</span>
      ${getTierBadge(p.tier)}
    </div>
    <div style="display:flex;gap:24px;flex-wrap:wrap">
      <div><div style="font-size:11px;color:var(--gray-l)">총 전적</div>
        <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:18px"><span class="wt">${fWin}승</span> <span class="lt">${fLoss}패</span></div></div>
      <div><div style="font-size:11px;color:var(--gray-l)">승률</div>
        <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:18px;color:${fWr>=50?'var(--green)':'var(--red)'}">${fTot?fWr+'%':'-'}</div></div>
      <div><div style="font-size:11px;color:var(--gray-l)">포인트</div>
        <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:18px" class="${pC(p.points)}">${pS(p.points)}</div></div>
    </div>
  </div>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">`;
  RACES.forEach(r=>{
    const s=rv[r];const t=s.w+s.l;const w=t?Math.round(s.w/t*100):0;
    h+=`<div class="rscard"><div style="margin-bottom:6px"><span class="rbadge r${r}">${r} ${RNAME[r]}</span></div>
      <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:20px;color:${w>=50?'var(--green)':'var(--red)'}">${t?w+'%':'-'}</div>
      <div style="font-size:11px;margin-top:4px"><span class="wt">${s.w}승</span> <span class="lt">${s.l}패</span></div></div>`;
  });
  h+=`</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">`;
  Object.entries(opps).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l)).forEach(([opp,s])=>{
    const ot=s.w+s.l;const ow=ot?Math.round(s.w/ot*100):0;
    h+=`<div class="ocard" style="cursor:pointer" onclick="openPlayerModal('${opp}')">
      <div style="font-weight:700;font-size:13px;color:var(--blue);text-decoration:underline dotted">${opp}</div>
      <div style="font-size:11px;margin:3px 0"><span class="rbadge r${s.race}">${s.race}</span></div>
      <div><span class="wt">${s.w}승</span> <span class="lt">${s.l}패</span></div>
      <div style="font-weight:700;font-size:12px;color:${ow>=50?'var(--green)':'var(--red)'}">${ow}%</div>
    </div>`;
  });
  h+=`</div>`;

  if(matchLog.length){
    const totalItems=matchLog.length;
    const totalPages=Math.ceil(totalItems/PLAYER_HIST_PAGE_SIZE);
    if(playerHistPage>=totalPages)playerHistPage=Math.max(0,totalPages-1);
    const pageStart=playerHistPage*PLAYER_HIST_PAGE_SIZE;
    const pageLogs=totalItems>PLAYER_HIST_PAGE_SIZE?matchLog.slice(pageStart,pageStart+PLAYER_HIST_PAGE_SIZE):matchLog;

    h+=`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;color:var(--blue);margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid var(--blue-ll);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
      <span>📋 대전별 상세 기록 <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(행 클릭 시 경기 상세 / 이름 클릭 시 해당 선수 이동)</span></span>
      <span style="font-size:11px;font-weight:400;color:var(--gray-l)">${totalItems}건${totalItems>PLAYER_HIST_PAGE_SIZE?` (${pageStart+1}~${Math.min(pageStart+PLAYER_HIST_PAGE_SIZE,totalItems)})`:''}</span>
    </div>`;
    h+=`<table><thead><tr><th>날짜</th><th>대전 종류</th><th>세트</th><th>결과</th><th>상대</th><th>상대종족</th><th>맵</th><th style="width:20px"></th>${isLoggedIn?'<th class="no-export" style="width:60px">관리</th>':''}</tr></thead><tbody>`;
    pageLogs.forEach((lg,li)=>{
      const globalLi=pageStart+li;
      const mb=modeBg[lg.mode]||'#6b7280';
      const modeCell=lg.mode==='대회'
        ?`<span style="background:${mb};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">${lg.mode}</span><span style="font-size:11px;font-weight:700;color:var(--gold);margin-left:4px">${lg.label}</span>`
        :`<span style="background:${mb};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">${lg.mode}</span>`;
      const resultCell=lg.result==='승'
        ?`<span style="background:var(--blue);color:#fff;font-size:12px;font-weight:800;padding:3px 11px;border-radius:5px;letter-spacing:.5px">WIN</span>`
        :`<span style="background:#94a3b8;color:#fff;font-size:12px;font-weight:700;padding:3px 11px;border-radius:5px;letter-spacing:.5px;opacity:0.7">LOSE</span>`;
      const oppP=players.find(x=>x.name===lg.opp);
      const oppClick=lg.opp!=='?'?`onclick="event.stopPropagation();openPlayerModal('${lg.opp}')" style="color:var(--blue);text-decoration:underline dotted;cursor:pointer;font-weight:700"`:'';
      const detKey=`psearch-${globalLi}`;
      const mObj=lg.mObj;
      const isCK=(lg.mode==='대학CK');
      const ca=isCK?'#2563eb':(mObj.a?gc(mObj.a):'#888');
      const cb=isCK?'#dc2626':(mObj.b?gc(mObj.b):'#888');
      const labelA=isCK?'A팀':(mObj.a||'A');
      const labelB=isCK?'B팀':(mObj.b||'B');
      const singleSetHTML=buildSingleSetHTML(mObj,lg.si,labelA,labelB,ca,cb);
      // REQ4: 수정/삭제 버튼 - mObj 원본 배열 인덱스 계산
      let editMode='',editIdx=-1;
      if(lg.mode==='미니대전'){editMode='mini';editIdx=miniM.indexOf(mObj);}
      else if(lg.mode==='대학대전'){editMode='univm';editIdx=univM.indexOf(mObj);}
      else if(lg.mode==='대회'){editMode='comp';editIdx=comps.indexOf(mObj);}
      else if(lg.mode==='대학CK'){editMode='ck';editIdx=ckM.indexOf(mObj);}
      h+=`<tr style="cursor:pointer" onclick="toggleDetail('${detKey}')">
        <td style="color:var(--gray-l);font-size:11px">${lg.date}</td>
        <td>${modeCell}</td>
        <td style="color:var(--gray-l);font-size:11px">${lg.setLabel}</td>
        <td>${resultCell}</td>
        <td><span ${oppClick}>${lg.opp}</span></td>
        <td>${lg.oppRace!=='?'?`<span class="rbadge r${lg.oppRace}">${lg.oppRace}</span>`:'-'}</td>
        <td style="color:var(--gray-l);font-size:11px">${lg.map}</td>
        <td style="color:var(--gray-l);font-size:10px" id="detbtn-${detKey}">▼</td>
        ${isLoggedIn&&editIdx>=0&&(editMode==='mini'||editMode==='univm'||editMode==='comp')?`<td class="no-export" style="text-align:center" onclick="event.stopPropagation()">
          ${adminBtn(`<button class="btn btn-o btn-xs" onclick="openRE('${editMode}',${editIdx})">수정</button>`)}
          ${adminBtn(`<button class="btn btn-r btn-xs" onclick="delRec('${editMode}',${editIdx})">삭제</button>`)}
        </td>`:isLoggedIn?'<td class="no-export"></td>':''}
      </tr>
      <tr id="det-${detKey}" style="display:none">
        <td colspan="${isLoggedIn?9:8}" style="padding:0;background:var(--surface)">
          <div style="padding:10px 16px">${singleSetHTML}</div>
        </td>
      </tr>`;
    });
    h+=`</tbody></table>`;

    // REQ4: 페이지 컨트롤
    if(totalItems>PLAYER_HIST_PAGE_SIZE){
      const pages=totalPages;
      let pager=`<div class="no-export" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:14px 0;flex-wrap:wrap">`;
      pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="playerHistPage=0;openPlayerModal('${name}')" ${playerHistPage===0?'disabled':''}>«</button>`;
      pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="playerHistPage=Math.max(0,${playerHistPage}-1);openPlayerModal('${name}')" ${playerHistPage===0?'disabled':''}>‹</button>`;
      let startP=Math.max(0,playerHistPage-3);let endP=Math.min(pages-1,startP+6);
      if(endP-startP<6)startP=Math.max(0,endP-6);
      for(let pg=startP;pg<=endP;pg++){
        pager+=`<button class="btn ${pg===playerHistPage?'btn-b':'btn-w'} btn-xs" style="min-width:32px" onclick="playerHistPage=${pg};openPlayerModal('${name}')">${pg+1}</button>`;
      }
      pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="playerHistPage=Math.min(${pages-1},${playerHistPage}+1);openPlayerModal('${name}')" ${playerHistPage===pages-1?'disabled':''}>›</button>`;
      pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="playerHistPage=${pages-1};openPlayerModal('${name}')" ${playerHistPage===pages-1?'disabled':''}>»</button>`;
      pager+=`</div>`;
      h+=pager;
    }
  } else {
    h+=`<div style="padding:20px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:8px;border:1px solid var(--border)">대전 기록에서 이 선수의 경기를 찾을 수 없습니다.</div>`;
  }
  R.innerHTML=h;
}

function toggleDetail(key){
  const area=document.getElementById('det-'+key);
  const btn=document.getElementById('detbtn-'+key);
  if(!area)return;
  const isTR=area.tagName==='TR';
  if(isTR){
    const open=area.style.display==='none'||area.style.display==='';
    area.style.display=open?'table-row':'none';
    if(btn)btn.textContent=open?'▲':'▼';
  } else {
    openDetails[key]=!openDetails[key];
    area.classList.toggle('open',!!openDetails[key]);
    if(btn){btn.classList.toggle('open',!!openDetails[key]);btn.textContent=openDetails[key]?'▲ 상세 닫기':'▼ 상세 보기';}
  }
}

function savePlayerMemo(name, del=false){
  const p=players.find(x=>x.name===name);
  if(!p)return;
  if(del){
    delete p.memo;
  } else {
    const el=document.getElementById('player-memo-input');
    if(el) p.memo=el.value.trim();
  }
  save();
  document.getElementById('playerModalBody').innerHTML=buildPlayerDetailHTML(p);
}

function saveMemo(mode,idx,inputId){
  let arr;
  if(mode==='mini') arr=miniM;
  else if(mode==='univm') arr=univM;
  else if(mode==='comp') arr=comps;
  else if(mode==='ck') arr=ckM;
  else if(mode==='pro') arr=proM;
  else return;
  if(!arr[idx])return;
  if(inputId===null){
    delete arr[idx].memo;
  } else {
    const el=document.getElementById(inputId);
    if(el) arr[idx].memo=el.value.trim();
  }
  save();render();
}

function buildSingleSetHTML(m, si, labelA, labelB, ca, cb){
  if(!m.sets||!m.sets[si])return`<div style="font-size:11px;color:var(--gray-l)">세트 기록 없음</div>`;
  const set=m.sets[si];
  const isAce=(si===2);
  const sLabel=isAce?'🎯 에이스전':`${si+1}세트`;
  const swA=set.scoreA||0,swB=set.scoreB||0;
  const setAWin=swA>swB,setBWin=swB>swA;
  let h=`<div style="font-size:11px;font-weight:700;color:${isAce?'#7c3aed':'var(--blue)'};margin-bottom:8px">${sLabel} — ${labelA} <span class="${setAWin?'wt':'lt'}">${swA}</span>:<span class="${setBWin?'wt':'lt'}">${swB}</span> ${labelB}</div>`;
  if(set.games&&set.games.length){
    set.games.forEach((g,gi)=>{
      if(!g.playerA&&!g.playerB)return;
      const pA=players.find(p=>p.name===g.playerA);
      const pB=players.find(p=>p.name===g.playerB);
      const aIsWinner=g.winner==='A';const bIsWinner=g.winner==='B';const hasWinner=!!g.winner;
      const winBgA=ca+'22',winBgB=cb+'22',winBorderA=ca+'66',winBorderB=cb+'66';
      const styleA=hasWinner?(aIsWinner?`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${winBgA};border:2px solid ${winBorderA};`:`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:#f1f5f9;border:1px solid #cbd5e1;opacity:0.45;filter:grayscale(1);`):`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border);`;
      const styleB=hasWinner?(bIsWinner?`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${winBgB};border:2px solid ${winBorderB};`:`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:#f1f5f9;border:1px solid #cbd5e1;opacity:0.45;filter:grayscale(1);`):`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border);`;
      const cA=g.playerA?`onclick="openPlayerModal('${g.playerA}')" style="cursor:pointer;text-decoration:underline dotted"`:'';
      const cB=g.playerB?`onclick="openPlayerModal('${g.playerB}')" style="cursor:pointer;text-decoration:underline dotted"`:'';
      const mapStr=g.map?`<span style="background:var(--surface);border:1px solid var(--border);padding:2px 6px;border-radius:4px;font-size:10px">📍${g.map}</span>`:'';
      h+=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
        <span style="color:var(--gray-l);font-size:11px;font-weight:700;min-width:44px">G${gi+1}</span>
        <div style="${styleA}">${pA?getPlayerPhotoHTML(pA.name,'30px','margin-right:4px'):''} ${pA?`<span class="rbadge r${pA.race}" style="font-size:11px;padding:2px 6px">${pA.race}</span>`:''}<strong style="font-size:14px" ${cA}>${g.playerA||'?'}</strong>${pA?genderIcon(pA.gender):''}<span style="font-size:11px;color:${ca};font-weight:700;margin-left:2px">(${labelA})</span>${aIsWinner&&hasWinner?`<span style="background:${ca};color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:4px;margin-left:4px">WIN</span>`:''}</div>
        <span style="color:var(--gray-l);font-size:12px;font-weight:700">vs</span>
        <div style="${styleB}">${pB?getPlayerPhotoHTML(pB.name,'30px','margin-right:4px'):''} ${pB?`<span class="rbadge r${pB.race}" style="font-size:11px;padding:2px 6px">${pB.race}</span>`:''}<strong style="font-size:14px" ${cB}>${g.playerB||'?'}</strong>${pB?genderIcon(pB.gender):''}<span style="font-size:11px;color:${cb};font-weight:700;margin-left:2px">(${labelB})</span>${bIsWinner&&hasWinner?`<span style="background:${cb};color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:4px;margin-left:4px">WIN</span>`:''}</div>
        ${mapStr}
      </div>`;
    });
  }
  return h;
}
