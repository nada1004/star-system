/* competition-detail.js: extracted from competition.js */
function leagueToggleDet(id,btn){
  const el=document.getElementById(id);if(!el)return;
  const open=el.style.display==='none'||!el.style.display;
  el.style.display=open?'block':'none';
  el.classList.toggle('open', open);
  const detBtn=btn||document.getElementById('detbtn-'+id);
  if(detBtn){detBtn.textContent=open?'🔼 닫기':'📂 상세';detBtn.classList.toggle('open',open);}
}

function openCompMatchDetailModal(tnId, gi, mi, rnd, isManual){
  // buildDetailHTML 렌더링 컨텍스트(대회 상세 모달 전용 UI)
  try{ window.__detailCtx = 'compModal'; }catch(_){}
  const tn=tourneys.find(t=>t.id===tnId);
  if(!tn)return;
  let m;
  // 조별리그 경기(league / grpedit에서 호출): gi/mi만 넘어오는 케이스
  if(gi!=null && (rnd==null || rnd===undefined) && !isManual){
    m=(tn.groups && tn.groups[gi] && tn.groups[gi].matches) ? tn.groups[gi].matches[mi] : null;
  } else if(isManual){
    m=(tn.bracket?.manualMatches||[])[mi];
  }else{
    const br=getBracket(tn);
    m=br?.matchDetails?.[`${rnd}-${mi}`];
  }
  if(!m)return;
  const ca=gc(m.a||'');const cb=gc(m.b||'');
  const isDone=m.sa!=null&&m.sb!=null;
  const aWin=isDone&&m.sa>m.sb;const bWin=isDone&&m.sb>m.sa;

  // ── 상단 헤더/스코어바 채우기(디자인 개선용) ──
  try{
    const titleEl=document.getElementById('cmdTitle');
    const subEl=document.getElementById('cmdSub');
    const bar=document.getElementById('cmdScoreBar');
    const shareBtn=document.getElementById('cmdShareBtn');
    const safe=(s)=>String(s||'').replace(/[<>]/g,'');
    const label = (gi!=null && (rnd==null || rnd===undefined) && !isManual)
      ? `${(m.grpName||('GROUP '+(m.grpLetter||''))).trim()} · ${((m.matchNum!=null)?(m.matchNum+'경기'):'경기')}`
      : (isManual ? (m.rndLabel||'토너먼트 경기') : ((rnd!=null)?`${(m.rndLabel||'')} `.trim()+'' : '토너먼트'));
    if(titleEl) titleEl.textContent = `📊 ${tn.name || '대회'} · ${label || '경기 상세'}`;
    const dStr = m.d ? String(m.d).slice(0,10) : '';
    if(subEl) subEl.textContent = dStr ? `📅 ${dStr}` : '';

    // 스코어바
    if(bar){
      if(isDone){
        const sa = m.sa ?? '';
        const sb = m.sb ?? '';
        const aBg = ca || '#64748b';
        const bBg = cb || '#64748b';
        const uicon = (team)=>{
          try{
            const url=UNIV_ICONS[team]||(univCfg.find(x=>x.name===team)||{}).icon||'';
            // 크기는 CSS 변수(--su_md_logo_size)로 제어
            return url?`<img class="cmd-uicon" src="${toHttpsUrl(url)}" style="object-fit:contain;border-radius:var(--su_univ_logo_radius,12px);background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);padding:7px" onerror="this.style.display='none'">`:'';
          }catch(e){ return ''; }
        };
        bar.innerHTML = `<div class="cmd-score">
          <div class="cmd-team" style="background:linear-gradient(135deg,${aBg},${aBg}cc);justify-content:center;text-align:center">${uicon(m.a||'')}<span style="font-weight:1000;font-size:22px">${safe(m.a||'A팀')}</span></div>
          <div class="cmd-mid"><span style="color:${aWin?'#16a34a':bWin?'#dc2626':'#111827'}">${sa}</span><span class="cmd-colon">:</span><span style="color:${bWin?'#16a34a':aWin?'#dc2626':'#111827'}">${sb}</span></div>
          <div class="cmd-team" style="background:linear-gradient(135deg,${bBg},${bBg}cc);justify-content:center;text-align:center">${uicon(m.b||'')}<span style="font-weight:1000;font-size:22px">${safe(m.b||'B팀')}</span></div>
        </div>`;
        bar.style.display='block';
      }else{
        bar.innerHTML='';
        bar.style.display='none';
      }
    }

    // 공유카드 버튼 노출 여부(관리자 제한 옵션 반영)
    if(shareBtn){
      const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';
      const okShare=(!_adm||isLoggedIn) && isDone;
      shareBtn.style.display = okShare ? '' : 'none';
    }
    // 현재 상세 상태 저장(공유카드에서 사용)
    window._cmdDetailState = { tnId, gi, mi, rnd, isManual, isLeague: (gi!=null && (rnd==null || rnd===undefined) && !isManual) };
  }catch(e){}

  const content=document.getElementById('compMatchDetailContent');
  if(content){
    // 경기 상세 본문은 스코프 전용 래퍼로 감싸서(대회 상세 모달만) CSS를 세련되게 적용
    content.innerHTML=`<div class="cmd-detail">${buildDetailHTML(m,'comp',m.a||'A팀',m.b||'B팀',ca,cb,aWin,bWin)}</div>`;
  }
  // modal-open.js: om=open, cm=close
  try{
    if(typeof om==='function') om('compMatchDetailModal');
    else { const mm=document.getElementById('compMatchDetailModal'); if(mm) mm.style.display='flex'; }
  }catch(e){}
}

function closeCompMatchDetailModal(){
  try{
    if(typeof cm==='function') cm('compMatchDetailModal');
    else { const mm=document.getElementById('compMatchDetailModal'); if(mm) mm.style.display='none'; }
  }catch(e){}
}

// 경기 상세 모달 하단 "공유 카드" 버튼
function openCompDetailShareCard(){
  try{
    const st = window._cmdDetailState || null;
    if(!st) return;
    if(st.isLeague){
      if(typeof openCompMatchShareCard==='function') openCompMatchShareCard(st.tnId, st.gi, st.mi);
      return;
    }
    if(typeof openBktShareCard==='function') openBktShareCard(st.tnId, st.rnd, st.mi);
  }catch(e){}
}

function _compActionMenuHTML(items){
  const body = (items||[]).filter(Boolean).join('');
  if(!body) return '';
  return `<details class="no-export su-more-menu" style="position:relative">
    <summary style="list-style:none;cursor:pointer;width:30px;height:30px;border-radius:10px;border:1px solid var(--border);background:var(--white);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:var(--text2)">⋯</summary>
    <div class="su-more-menu-pop" style="position:absolute;right:0;top:36px;min-width:152px;padding:6px;background:var(--white);border:1px solid var(--border);border-radius:12px;display:flex;flex-direction:column;gap:6px">
      ${body}
    </div>
  </details>`;
}

function leagueEditMatch(tnId,gi,mi){
  grpMatchState={tnId,gi,mi};
  const tn=tourneys.find(t=>t.id===tnId);
  if(tn)grpOpenMatchModal(tn,gi,mi);
}
function openLeaguePaste(tnId,gi,mi){
  grpMatchState={tnId,gi,mi};
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const m=tn.groups[gi].matches[mi];if(!m)return;
  if(!m.sets)m.sets=[];
  openGrpPasteModal();
}
// 상단 버튼: 조/팀 자동인식 모드
function openCompAutoDetectPaste(tnId){
  grpMatchState={tnId,gi:null,mi:null};
  openGrpPasteModal();
}

function grpMatchDetail(m){
  if(!m.sets||!m.sets.length) return `<div style="font-size:12px;color:var(--gray-l)">상세 기록이 없습니다.</div>`;
  let h=`<div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🔍 세부 경기 기록</div>`;
  m.sets.forEach((set,si)=>{
    const lbl=si===2?'🎯 에이스전':`${si+1}세트`;
    const sA=set.scoreA||0;const sB=set.scoreB||0;
    h+=`<div style="margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px;padding:5px 10px;background:${si===2?'#f5f3ff':'var(--blue-l)'};border-radius:6px;margin-bottom:6px">
        <strong style="font-size:11px;color:${si===2?'#7c3aed':'var(--blue)'}">${lbl}</strong>
        <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px"><span class="${sA>sB?'wt':''}">${sA}</span><span style="color:var(--gray-l)">:</span><span class="${sB>sA?'wt':''}">${sB}</span></span>
        <span style="font-size:11px;font-weight:700;color:${sA>sB?'var(--green)':sB>sA?'var(--red)':'var(--gray-l)'}">${sA>sB?(m.a||'A팀')+' 승':sB>sA?(m.b||'B팀')+' 승':'무승부'}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">`;
    (set.games||[]).forEach((g,gi)=>{
      if(!g.playerA&&!g.playerB)return;
      const pa=players.find(p=>p.name===g.playerA);const pb=players.find(p=>p.name===g.playerB);
      const wA=g.winner==='A';const wB=g.winner==='B';
      const _ct=t=>t?t.replace(/티어$/,''):'';
      const _tb=tier=>tier?`<span style="background:${getTierBtnColor(tier)||'#64748b'};color:${getTierBtnTextColor(tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 4px;border-radius:3px;flex-shrink:0"><span class="tier-pc">${tier}</span><span class="tier-mob">${_ct(tier)}</span></span>`:'';
      h+=`<div style="font-size:11px;background:var(--white);padding:5px 10px;border-radius:6px;border:1px solid ${wA?'var(--green)33':wB?'var(--red)33':'var(--border)'};display:flex;align-items:center;gap:4px">
        <span style="font-size:10px;color:var(--gray-l);min-width:14px;flex-shrink:0">${gi+1}</span>
        <span style="font-weight:${wA?'800':'400'};color:${wA?'var(--green)':'var(--text)'};white-space:nowrap">${g.playerA||'?'}</span>
        ${pa?`<span class="rbadge r${pa.race}" style="font-size:9px;padding:0 3px">${pa.race||''}</span>`:''}
        ${_tb(pa?.tier)}
        <span style="color:var(--gray-l);font-size:10px;flex-shrink:0">vs</span>
        <span style="font-weight:${wB?'800':'400'};color:${wB?'var(--green)':'var(--text)'};white-space:nowrap">${g.playerB||'?'}</span>
        ${pb?`<span class="rbadge r${pb.race}" style="font-size:9px;padding:0 3px">${pb.race||''}</span>`:''}
        ${_tb(pb?.tier)}
        ${g.map?`<span style="color:var(--gray-l);font-size:10px;margin-left:2px;flex-shrink:0">📍${g.map}</span>`:''}
      </div>`;
    });
    h+=`</div></div>`;
  });
  return h;
}

function rCompGrpRankFull(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const isTier=tn.type==='tier';
  const GL='ABCDEFGHIJ';
  let filterHTML='';
  if(tn.groups&&tn.groups.length>1){
    filterHTML=`<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-left:auto">
      <button class="pill ${!grpRankFilter?'on':''}" onclick="grpRankFilter='';render()">전체</button>`;
    tn.groups.forEach((grp,gi)=>{
      const gl=GL[gi];const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      filterHTML+=`<button class="pill ${grpRankFilter===grp.name?'on':''}" style="${grpRankFilter===grp.name?`background:${col};border-color:${col};color:#fff`:''}" onclick="grpRankFilter='${grp.name}';render()">GROUP ${gl}</button>`;
    });
    filterHTML+=`</div>`;
  }
  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;flex-wrap:wrap">
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">📊 ${tn.name} — 조별 순위</div>
    ${filterHTML}
  </div>
  <div style="font-size:11px;color:var(--gray-l);margin-bottom:14px">승점 → 세트 득실 → 득점 순 · 상위 2팀 토너먼트 진출</div>`;
  if(!tn.groups||!tn.groups.length){
    return h+`<div style="padding:40px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2);color:var(--gray-l)">
      <div style="font-size:28px;margin-bottom:10px">🏗️</div>
      <div style="font-weight:700;margin-bottom:8px">조편성이 필요합니다</div>
      <div style="font-size:12px;margin-bottom:14px">먼저 <b>조편성</b> 탭에서 조를 만들고 ${isTier?'선수':'대학'}를 배정해주세요.</div>
      ${isLoggedIn?`<button class="btn btn-b btn-sm" onclick="${isTier?`_ttSub='grpedit';grpSub='edit';render()`:`compSub='grpedit';grpEditId='${tn.id}';grpSub='edit';render()`}">🏗️ 조편성 하러 가기</button>`:''}
    </div>`;
  }
  const targetGroups=grpRankFilter?tn.groups.filter(g=>g.name===grpRankFilter):tn.groups;
  targetGroups.forEach(grp=>{
    const gi=tn.groups.indexOf(grp);const gl=GL[gi]||gi;
    const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    const sc={};
    grp.univs.forEach(u=>{sc[u]={w:0,l:0,gw:0,gl2:0,pts:0,played:0};});
    (grp.matches||[]).forEach(m=>{
      if(m.sa==null||m.sb==null)return;
      if(!sc[m.a])sc[m.a]={w:0,l:0,gw:0,gl2:0,pts:0,played:0};
      if(!sc[m.b])sc[m.b]={w:0,l:0,gw:0,gl2:0,pts:0,played:0};
      sc[m.a].played++;sc[m.b].played++;
      sc[m.a].gw+=m.sa;sc[m.a].gl2+=m.sb;sc[m.b].gw+=m.sb;sc[m.b].gl2+=m.sa;
      if(m.sa>m.sb){sc[m.a].w++;sc[m.a].pts+=3;sc[m.b].l++;}
      else if(m.sb>m.sa){sc[m.b].w++;sc[m.b].pts+=3;sc[m.a].l++;}
      else{sc[m.a].pts++;sc[m.b].pts++;}
    });
    const sorted=Object.entries(sc).sort((a,b)=>b[1].pts-a[1].pts||(b[1].gw-b[1].gl2)-(a[1].gw-a[1].gl2)||b[1].gw-a[1].gw);
    const played=grp.matches.filter(m=>m.sa!=null).length;
    h+=`<div style="background:var(--white);border:1.5px solid var(--border);border-radius:12px;padding:16px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,.04)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <span style="background:${col};color:#fff;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;padding:3px 14px;border-radius:20px">GROUP ${gl}</span>
        <span style="font-size:11px;color:var(--gray-l)">${played}/${grp.matches.length}경기 완료</span>
        <div style="margin-left:auto;display:flex;gap:5px;flex-wrap:wrap">${grp.univs.map(u=>`<span class="ubadge" style="background:${gc(u)};font-size:11px">${isTier?'':gUI(u,'10px')}${u}</span>`).join('')}</div>
      </div>
      <table class="grp-rank-table"><thead><tr><th>순위</th><th>${isTier?'선수':'대학'}</th><th>경기</th><th>승</th><th>패</th><th>득</th><th>실</th><th>득실</th><th>승점</th></tr></thead><tbody>`;
    sorted.forEach(([name,s],i)=>{
      const uc=gc(name);const diff=s.gw-s.gl2;const isTop=i<2;
      const rowClass=i===0?'grp-rank-top1':i===1?'grp-rank-top2':'';
      h+=`<tr class="${rowClass}">
        <td>${i===0?`<span class="rk1">1위</span>`:i===1?`<span class="rk2">2위</span>`:i===2?`<span class="rk3">3위</span>`:`${i+1}위`}</td>
        <td><span class="ubadge ${isTier?'':'clickable-univ'}" style="background:${uc};font-size:11px" ${isTier?'':`onclick="openUnivModal('${name}')"`}>${name}</span></td>
        <td style="color:var(--gray-l)">${s.played}</td><td class="wt">${s.w}</td><td class="lt">${s.l}</td>
        <td class="wt">${s.gw}</td><td class="lt">${s.gl2}</td>
        <td style="font-weight:700;color:${diff>0?'var(--green)':diff<0?'var(--red)':'var(--gray-l)'}">${diff>=0?'+':''}${diff}</td>
        <td style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:${col}">${s.pts}</td>
      </tr>`;
    });
    h+=`</tbody></table>`;
    if(played===0) h+=`<div style="font-size:12px;color:var(--gray-l);padding:10px 0;text-align:center">⏳ 아직 진행된 경기가 없습니다</div>`;
    h+=`</div>`;
  });
  return h;
}

/* ── 토너먼트 경기 일정 (브라켓 아래) ── */
function rBracketSchedule(tn){
  if(!tn)return '';
  const br=getBracket(tn);
  const _grpsB=(tn.groups&&tn.groups.length>=2)?tn.groups:[];
  const _rankedB=_grpsB.map(grp=>_calcGrpRank(grp));
  const _pcB=Math.floor(_rankedB.length/2)*2;
  const _r1teamsB=[];
  for(let _i=0;_i<_pcB;_i+=2){const gA=_rankedB[_i],gB=_rankedB[_i+1];_r1teamsB.push(gA?.[0]?.u||'',gB?.[0]?.u||'',gB?.[1]?.u||'',gA?.[1]?.u||'');}
  if(_rankedB.length%2===1){const gL=_rankedB[_rankedB.length-1];_r1teamsB.push(gL?.[0]?.u||'');}
  // 총 라운드 수 계산
  // (요청사항) 64강 이상 지원: 조 수 기반이 아니라 브라켓 규모(override 포함)를 기준으로 계산
  const firstSize = (typeof _bktComputeBracketSize==='function') ? _bktComputeBracketSize(tn) : 8;
  let numR1 = Math.max(1, Math.floor(firstSize / 2)); // 첫 라운드 경기 수
  let totalRounds = 0;
  let n = firstSize;
  while(n>1){ n = Math.ceil(n/2); totalRounds++; }
  if(totalRounds===0) totalRounds=1;
  // 기존 표기 유지: 4팀 = 준결승(=4강), 8팀 = 8강 ...
  const roundLabels={1:'결승',2:'준결승',3:'8강',4:'16강',5:'32강',6:'64강',7:'128강',8:'256강'};

  // 브라켓 경기 수집
  const rLabelToR={};
  const matches=[];
  for(let r=0;r<totalRounds;r++){
    const matchCount=Math.ceil(numR1/Math.pow(2,r));
    const rNum=totalRounds-r;
    // rNum → 남은 라운드 수, 라벨은 (예: 6라운드면 64강)
    const rLabel=roundLabels[rNum]||(Math.pow(2,rNum)+'강');
    if(!rLabelToR[rLabel])rLabelToR[rLabel]={r,matchCount:Math.ceil(numR1/Math.pow(2,r))};
    for(let mi=0;mi<matchCount;mi++){
      let teamA='',teamB='';
      if(r===0){
        const bA=_r1teamsB[mi*2]||'',bB=_r1teamsB[mi*2+1]||'';
        const sA=br.slots[`0-${mi}-a`],sB=br.slots[`0-${mi}-b`];
        teamA=sA!==undefined?sA:bA;teamB=sB!==undefined?sB:bB;
      }else{
        const pA=br.winners[`${r-1}-${mi*2}`]||'',pB=br.winners[`${r-1}-${mi*2+1}`]||'';
        const sA=br.slots[`${r}-${mi}-a`],sB=br.slots[`${r}-${mi}-b`];
        teamA=sA!==undefined?sA:pA;teamB=sB!==undefined?sB:pB;
      }
      const mDetail=br.matchDetails&&br.matchDetails[`${r}-${mi}`];
      const mA=mDetail?.a||teamA;const mB=mDetail?.b||teamB;
      const isDone=mDetail&&mDetail.sa!=null;
      const winner=br.winners[`${r}-${mi}`]||'';
      if(mA||mB)matches.push({r,mi,rLabel,teamA:mA,teamB:mB,detail:mDetail,isDone,winner,isManual:false});
    }
  }
  // 수동 추가 경기
  (br.manualMatches||[]).forEach((mm,idx)=>{
    if(!mm)return;
    const isDone=mm.sa!=null;
    const winner=isDone?(mm.sa>mm.sb?mm.a:mm.sb>mm.sa?mm.b:''):'';
    matches.push({r:-1,mi:idx,rLabel:mm.rndLabel||'토너먼트 경기',teamA:mm.a||'',teamB:mm.b||'',detail:mm,isDone,winner,isManual:true});
  });

  function matchCard(mc){
    const {r,mi,rLabel,teamA,teamB,detail,isDone,winner,isManual}=mc;
    const ca=gc(teamA||'');const cb=gc(teamB||'');
    const aWin=isDone&&winner===teamA;const bWin=isDone&&winner===teamB;
    const sa=detail?.sa??'';const sb=detail?.sb??'';
    const detId=`bsched-det-${r==-1?'m'+mi:r+'-'+mi}`;
    const hasGames=detail?.sets?.some(s=>(s.games||[]).some(g=>g.playerA||g.playerB));
    const dateStr=detail?.d||'';
    const winCol=(aWin||bWin)?(aWin?ca:cb):'#64748b';
    const winRgb=_tcHexToRgbStr(winCol);
    const _bktMenu = isLoggedIn ? _compActionMenuHTML([
      `<button class="btn btn-b btn-xs" style="white-space:nowrap;justify-content:flex-start" onclick="openBracketMatchModal('${tn.id}',${r},${mi},'${teamA}','${teamB}')">✏️ 수정</button>`,
      `<button class="btn btn-p btn-xs" style="white-space:nowrap;justify-content:flex-start" onclick="bracketMatchState={tnId:'${tn.id}',rnd:${r},mi:${mi},teamA:'${teamA}',teamB:'${teamB}'};openBktPasteModal()">📋 붙여넣기</button>`,
      isDone?`<button class="btn btn-p btn-xs" style="justify-content:flex-start" onclick="openBktShareCard('${tn.id}',${r},${mi})">🎴 공유 카드</button>`:'',
      isManual?`<button class="btn btn-r btn-xs" style="justify-content:flex-start" onclick="bktDelManualMatch('${tn.id}',${mi})">🗑️ 삭제</button>`:`<button class="btn btn-r btn-xs" style="justify-content:flex-start" onclick="bktClearMatchResult('${tn.id}',${r},${mi})">🗑️ 초기화</button>`
    ]) : '';
    return `<div style="margin-bottom:8px">
      <div class="grp-match-card tc-card" style="--tc-win-rgb:${winRgb};border-left:4px solid ${isManual?'#7c3aed':'var(--blue)'};background:linear-gradient(135deg,var(--white) 0%,${isManual?'#f5f3ff':'#eff6ff'} 100%);margin-bottom:0">
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:72px">
          <span class="grp-badge" style="background:${isManual?'#7c3aed':'var(--blue)'};font-size:10px">${rLabel}</span>
          ${dateStr?`<span style="font-size:9px;color:var(--gray-l)">${dateStr.slice(5).replace('-','/')}</span>`:''}
          ${!isDone?`<span style="background:var(--surface);color:var(--gray-l);font-size:10px;padding:2px 8px;border-radius:10px">예정</span>`:''}
        </div>
        <div style="flex:1;display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap">
          <div style="text-align:center;min-width:100px">
            <div style="display:flex;align-items:center;justify-content:center;gap:7px;background:${ca||'#888'};padding:10px 16px;border-radius:12px;${aWin?'box-shadow:0 0 0 3px #fff,0 0 0 5px '+ca:isDone?'opacity:.5;filter:saturate(0.6)':''}">
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${teamA||'미정'}</span>
            </div>
          </div>
          <div style="text-align:center;min-width:80px">
            ${isDone?`<div class="grp-match-score score-click" style="cursor:pointer;padding:6px 14px;background:var(--white);border-radius:12px;border:1.5px solid var(--border);font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:18px" onclick="openCompMatchDetailModal('${tn.id}',null,${mi},${r},${isManual})"><span style="color:${aWin?'#16a34a':bWin?'#dc2626':'var(--text)'}">${sa}</span><span style="color:var(--gray-l);font-size:14px;margin:0 3px">:</span><span style="color:${bWin?'#16a34a':aWin?'#dc2626':'var(--text)'}">${sb}</span></div>
            <div style="margin-top:4px;font-size:11px;font-weight:700;color:${aWin?ca:bWin?cb:'var(--gray-l)'}">${winner?winner+' 승':''}</div>
            ${!isLoggedIn?`<button class="btn btn-p btn-xs no-export" style="margin-top:4px" onclick="openBktShareCard('${tn.id}',${r},${mi})">🎴 공유 카드</button>`:''}
            `:`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:22px;color:var(--blue)">VS</div>`}
          </div>
          <div style="text-align:center;min-width:100px">
            <div style="display:flex;align-items:center;justify-content:center;gap:7px;background:${cb||'#888'};padding:10px 16px;border-radius:12px;${bWin?'box-shadow:0 0 0 3px #fff,0 0 0 5px '+cb:isDone?'opacity:.5;filter:saturate(0.6)':''}">
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${teamB||'미정'}</span>
            </div>
          </div>
        </div>
        ${isLoggedIn?`<div class="no-export" style="display:flex;flex-direction:column;gap:4px">${_bktMenu}</div>`:''}
      </div>
    </div>`;
  }

  // 라운드 필터 버튼용 라운드 목록
  const _roundOrder=['결승','준결승','4강','8강','16강','32강','64강'];
  const _roundSet=new Set(matches.map(m=>m.rLabel));
  const _availRounds=['전체',..._roundOrder.filter(r=>_roundSet.has(r))];
  _roundSet.forEach(r=>{if(!_roundOrder.includes(r)&&r!=='전체')_availRounds.push(r);});

  // 필터 적용
  const _filtered=bktSchedRound==='전체'?matches:matches.filter(m=>m.rLabel===bktSchedRound);
  const done=_filtered.filter(m=>m.isDone);
  const pending=_filtered.filter(m=>!m.isDone);

  // 정렬
  const _sortedDone=bktSchedSortDir==='asc'?done.slice().sort((a,b)=>(a.detail?.d||'').localeCompare(b.detail?.d||'')):done.slice().sort((a,b)=>(b.detail?.d||'').localeCompare(a.detail?.d||''));

  let h=`<div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">⚔️ 토너먼트</span>
      ${isLoggedIn?`<button class="btn btn-w btn-sm no-export" onclick="openBktSeedModal('${tn.id}')" title="상위 시드(부전승/라운드 합류) 및 자동 배치">🎫 시드/부전승</button>
<button class="btn btn-b btn-sm no-export" onclick="bktAddManualMatch('${tn.id}')">+ 경기 추가</button><button class="btn btn-p btn-sm no-export" onclick="openBktBulkPaste('${tn.id}')">📋 결과 붙여넣기</button>
<button class="btn btn-w btn-xs no-export" onclick="openBktBulkPaste('${tn.id}','64강')">64강</button>
<button class="btn btn-w btn-xs no-export" onclick="openBktBulkPaste('${tn.id}','32강')">32강</button>
<button class="btn btn-w btn-xs no-export" onclick="openBktBulkPaste('${tn.id}','16강')">16강</button>
<button class="btn btn-w btn-xs no-export" onclick="openBktBulkPaste('${tn.id}','8강')">8강</button>
<button class="btn btn-w btn-xs no-export" onclick="openBktBulkPaste('${tn.id}','4강')">4강</button>
<button class="btn btn-w btn-xs no-export" onclick="openBktBulkPaste('${tn.id}','결승')">결승</button>`:''}
      <div style="margin-left:auto;display:flex;gap:4px">
        <button class="pill ${bktSchedSortDir==='desc'?'on':''}" onclick="bktSchedSortDir='desc';render()">최신순</button>
        <button class="pill ${bktSchedSortDir==='asc'?'on':''}" onclick="bktSchedSortDir='asc';render()">오래된순</button>
      </div>
    </div>
    ${(()=>{if(_availRounds.length<=2)return '';const _pillsHtml=_availRounds.map(rv=>{const _ri=rLabelToR[rv];const _delR=_ri?_ri.r:-1;const _delC=_ri?_ri.matchCount:0;const _delBtn=isLoggedIn&&rv!=='전체'?`<button onclick="bktDelRound('${tn.id}',${_delR},${_delC},'${rv}')" style="padding:2px 5px;border-radius:4px;border:1px solid #f87171;background:#fef2f2;color:#ef4444;font-size:9px;cursor:pointer;line-height:1" title="${rv} 라운드 초기화">\u2715</button>`:'';return `<span style="display:inline-flex;align-items:center;gap:2px"><button class="pill ${bktSchedRound===rv?'on':''}" onclick="bktSchedRound='${rv}';render()">${rv}</button>${_delBtn}</span>`;}).join('');return `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">${_pillsHtml}</div>`;})()}
    `;

  if(!pending.filter(m=>m.teamA||m.teamB).length&&!done.length){
    h+=`<div style="padding:30px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px">
      ${isLoggedIn?'+ 경기 추가 버튼으로 경기를 등록하거나 브라켓에서 팀을 배정하세요.':'팀이 배정되면 경기 일정이 표시됩니다.'}
    </div>`;
  } else {
    if(pending.filter(m=>m.teamA||m.teamB).length){
      h+=`<div style="margin-bottom:16px">
        <div style="font-size:12px;font-weight:700;color:var(--gray-l);margin-bottom:8px;padding:4px 10px;background:var(--surface);border-radius:6px;display:inline-block">📅 예정 경기</div>`;
      pending.filter(m=>m.teamA||m.teamB).forEach(m=>{h+=matchCard(m);});
      h+=`</div>`;
    }
    if(_sortedDone.length){
      h+=`<div>
        `;
      _sortedDone.forEach(m=>{h+=matchCard(m);});
      h+=`</div>`;
    }
  }
  h+=`</div>`;
  return h;
}

function bktDelRound(tnId,r,matchCount,rLabel){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  if(!confirm(`'${rLabel}' 라운드 슬롯/결과를 초기화하시겠습니까?`))return;
  const br=getBracket(tn);
  if(r===-1){
    if(br.manualMatches)br.manualMatches=br.manualMatches.filter(m=>!m||(m.rndLabel||'토너먼트 경기')!==rLabel);
  } else {
    for(let mi=0;mi<matchCount;mi++){
      delete br.slots[`${r}-${mi}-a`];
      delete br.slots[`${r}-${mi}-b`];
      delete br.winners[`${r}-${mi}`];
      if(br.matchDetails)delete br.matchDetails[`${r}-${mi}`];
    }
  }
  bktSchedRound='전체';
  save();render();
}

function openBktSchedulePaste(tnId,rnd,mi,teamA,teamB){
  bracketMatchState={tnId,rnd,mi,teamA,teamB};
  const m=getBktMatch(tnId,rnd,mi);
  if(m){if(!m.a&&teamA)m.a=teamA;if(!m.b&&teamB)m.b=teamB;}
  openBktPasteModal();
}

function bktAddManualMatch(tnId){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  if(!br.manualMatches)br.manualMatches=[];
  br.manualMatches.push({a:'',b:'',d:new Date().toISOString().slice(0,10),rndLabel:'',sa:null,sb:null,sets:[],_id:null});
  const idx=br.manualMatches.length-1;
  save();
  openBracketMatchModal(tnId,-1,idx,'','');
}

function bktDelManualMatch(tnId,idx){
  if(!confirm('경기를 삭제하시겠습니까?\n⚠️ 선수 개인 전적도 롤백됩니다.'))return;
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  if(br.manualMatches&&br.manualMatches[idx]){
    revertMatchRecord(br.manualMatches[idx]);
    br.manualMatches.splice(idx,1);
  }
  save();render();
}

function bktClearMatchResult(tnId,r,mi){
  if(!confirm('경기 결과를 초기화하시겠습니까?\n⚠️ 선수 개인 전적도 롤백됩니다.'))return;
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  const key=`${r}-${mi}`;
  if(br.matchDetails&&br.matchDetails[key]){
    revertMatchRecord(br.matchDetails[key]);
    delete br.matchDetails[key];
  }
  if(br.winners&&br.winners[key])delete br.winners[key];
  save();render();
}

function openBktBulkPaste(tnId, roundLabel){
  // 새 수동 매치 생성 후 바로 붙여넣기 모달 열기
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  if(!br.manualMatches)br.manualMatches=[];
  br.manualMatches.push({a:'',b:'',d:new Date().toISOString().slice(0,10),rndLabel:roundLabel||'',sa:null,sb:null,sets:[],_id:null});
  const idx=br.manualMatches.length-1;
  save();
  bracketMatchState={tnId,rnd:-1,mi:idx,teamA:'',teamB:''};
  openBktPasteModal();
}

