/* 대회 조별리그 일정/기록 렌더 */

function rCompLeague(tn){
  if(!tn||!tn.groups) tn=tn?{...tn,groups:[]}:null;
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const allMatches=[];
  tn.groups.forEach((grp,gi)=>{
    const gl='ABCDEFGHIJ'[gi]||gi;
    const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
    (grp.matches||[]).forEach((m,mi)=>{
      allMatches.push({...m,grpName:grp.name,grpIdx:gi,grpLetter:gl,matchNum:mi+1,grpColor:col});
    });
  });
  allMatches.sort((a,b)=>leagueSortDir==='asc'?(a.d||'9999').localeCompare(b.d||'9999'):(b.d||'').localeCompare(a.d||''));
  const dates=[...new Set(allMatches.map(m=>m.d).filter(Boolean))].sort();
  const _totalM=allMatches.length, _doneM=allMatches.filter(m=>m.sa!=null&&m.sb!=null).length;
  const _pct=_totalM?Math.round(_doneM/_totalM*100):0;
  const _pctColor=_pct===100?'#16a34a':_pct>=50?'#2563eb':'#d97706';
  let h=``;
  if(_totalM>0){
    h+=`<div style="margin-bottom:12px;padding:10px 14px;background:var(--surface);border-radius:10px;border:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:12px;font-weight:700;color:${_pctColor}">📊 진행률</span>
        <span style="font-size:12px;color:var(--gray-l)">${_doneM}/${_totalM}경기 완료</span>
        <span style="margin-left:auto;font-size:13px;font-weight:800;color:${_pctColor}">${_pct}%</span>
      </div>
      <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${_pct}%;background:${_pctColor};border-radius:4px;transition:.3s"></div>
      </div>
    </div>`;
  }
  h+=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:15px;color:var(--blue)">🏆 ${tn.name}</div>
  </div>`;
  if(isLoggedIn&&tn.groups.length){
    h+=`<div class="no-export grp-univ-action-row" style="margin-bottom:12px">
      <button class="btn btn-p btn-sm" onclick="openCompAutoDetectPaste('${tn.id}')" title="선수 소속 대학을 자동으로 인식해 해당 조 경기에 저장">📋 자동인식</button>
      <span class="grp-univ-action-label" style="margin-left:4px">경기 추가:</span>`;
    tn.groups.forEach((grp,gi)=>{
      const gl='ABCDEFGHIJ'[gi];
      const col=['#2563eb','#dc2626','#16a34a','#d97706','#7c3aed','#0891b2'][gi%6];
      h+=`<button class="btn btn-xs grp-univ-action-btn" style="background:${col};color:#fff;border-color:${col}" onclick="grpAddMatch('${tn.id}',${gi})">+ ${gl}조</button>`;
    });
    h+=`</div>`;
  }
  {
    const days=['일','월','화','수','목','금','토'];
    const fmt=(d)=>{
      if(!d) return '전체';
      const dt=new Date(d+'T00:00:00');
      return `${dt.getMonth()+1}/${dt.getDate()}(${days[dt.getDay()]})`;
    };
    const grpOpts=(tn.groups||[]).map((grp,gi)=>({name:grp.name,label:`GROUP ${'ABCDEFGHIJ'[gi]||gi+1}`}));
    h+=`<div class="no-export" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid var(--border)">
      <div class="ym-filter-controls compact">
        <span class="ym-lbl"></span>
        <select class="ym-sel" onchange="leagueFilterDate=this.value;render()">
          <option value=""${!leagueFilterDate?' selected':''}>전체</option>
          ${dates.map(d=>`<option value="${d}"${leagueFilterDate===d?' selected':''}>${fmt(d)}</option>`).join('')}
        </select>
      </div>
      ${grpOpts.length>1?`<div class="ym-filter-controls compact">
        <span class="ym-lbl">조</span>
        <select class="ym-sel" onchange="leagueFilterGrp=this.value;render()">
          <option value=""${!leagueFilterGrp?' selected':''}>전체</option>
          ${grpOpts.map(o=>`<option value="${o.name}"${leagueFilterGrp===o.name?' selected':''}>${o.label}</option>`).join('')}
        </select>
      </div>`:''}
      <div style="margin-left:auto;display:flex;gap:6px;flex-wrap:nowrap">
        <button class="pill ${leagueSortDir==='desc'?'on':''}" style="flex-shrink:0" onclick="leagueSortDir='desc';render()">최신순</button>
        <button class="pill ${leagueSortDir==='asc'?'on':''}" style="flex-shrink:0" onclick="leagueSortDir='asc';render()">오래된순</button>
      </div>
    </div>`;
  }
  let filtered=allMatches;
  if(leagueFilterDate) filtered=filtered.filter(m=>m.d===leagueFilterDate);
  if(leagueFilterGrp) filtered=filtered.filter(m=>m.grpName===leagueFilterGrp);
  if(!filtered.length){
    h+=`<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px">
      ${allMatches.length?'해당 조건의 경기가 없습니다.':'아직 등록된 경기가 없습니다.'}
      ${isLoggedIn?`<br><br><button class="btn btn-b btn-sm" onclick="compSub='grpedit';render()">+ 조편성 관리에서 경기 추가</button>`:''}
    </div>`;
    return h;
  }
  const byDate={};
  filtered.forEach(m=>{const k=m.d||'날짜 미정';if(!byDate[k])byDate[k]=[];byDate[k].push(m);});
  Object.keys(byDate).sort((a,b)=>leagueSortDir==='asc'?a.localeCompare(b):b.localeCompare(a)).forEach(date=>{
    let dateLabel=date;
    if(date!=='날짜 미정'){
      const dt=new Date(date+'T00:00:00');
      const days=['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
      dateLabel=`${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 ${days[dt.getDay()]}`;
    }
    h+=`<div style="margin-bottom:22px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">📅 ${dateLabel}</div>
        ${isLoggedIn?`<button class="btn btn-b btn-xs no-export" onclick="grpAddMatchByDate('${tn.id}','${date}')">+ 경기 추가</button>`:''}
      </div>`;
    byDate[date].forEach(m=>{
      const ca=gc(m.a||'');const cb=gc(m.b||'');
      const isDone=m.sa!=null&&m.sb!=null;
      const aWin=isDone&&m.sa>m.sb;const bWin=isDone&&m.sb>m.sa;
      const winCol=(aWin||bWin)?(aWin?ca:cb):'#64748b';
      const winRgb=_tcHexToRgbStr(winCol);
      const _leagueActions = [
        isLoggedIn?{ t:'✏️ 결과 입력', d:'경기 결과와 세트 입력', kind:'normal', on:()=>leagueEditMatch(tn.id,m.grpIdx,m.matchNum-1) }:null,
        isDone?(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?{ t:'🎴 공유카드', d:'공유용 카드 생성', kind:'accent', on:()=>openCompMatchShareCard(tn.id,m.grpIdx,m.matchNum-1) }:null;})():null,
        isLoggedIn?{ t:'🗑️ 삭제', d:'이 경기 기록 삭제', kind:'danger', on:()=>grpDelMatch(tn.id,m.grpIdx,m.matchNum-1) }:null
      ].filter(Boolean);
      const _leagueMenu = _leagueActions.length ? _compActionMenuHTML(_leagueActions) : '';
      // 팀 멤버 추출
      let aMembers = m.teamAMembers || [];
      let bMembers = m.teamBMembers || [];
      if (!aMembers.length && !bMembers.length && m.sets) {
        const aSet = new Set(), bSet = new Set();
        m.sets.forEach(s => {
          (s.games || []).forEach(g => {
            if (g.playerA) aSet.add(g.playerA);
            if (g.playerB) bSet.add(g.playerB);
            if (g.winner === 'A' && g.wName) { aSet.add(g.wName); if (g.lName) bSet.add(g.lName); }
            else if (g.winner === 'B' && g.wName) { bSet.add(g.wName); if (g.lName) aSet.add(g.lName); }
          });
        });
        aMembers = Array.from(aSet).map(n => ({ name: n }));
        bMembers = Array.from(bSet).map(n => ({ name: n }));
      }
      const aMemJson = JSON.stringify(aMembers).replace(/"/g, "'");
      const bMemJson = JSON.stringify(bMembers).replace(/"/g, "'");
      const aBtnColor = ca || '#3b82f6';
      const bBtnColor = cb || '#ef4444';
      const _fxCfg=(typeof _getRecSideFxCfg==='function')?_getRecSideFxCfg():{on:true,mode:'soft',intensity:68,length:25};
      const _fxOn=!!_fxCfg.on;
      const _fxMetrics=(typeof _buildRecSideFxMetrics==='function')?_buildRecSideFxMetrics(_fxCfg):null;
      const _fxMode=_fxMetrics?_fxMetrics.mode:'soft';
      const _fxVars=(_fxOn&&typeof _recSideFxVarStyle==='function')?_recSideFxVarStyle(ca||'#3b82f6',cb||'#ef4444',_fxCfg):'';
      /* 양쪽 프로필/로고 패널 */
      const _compSide=(typeof window._buildCompSidePanel==='function')
        ? window._buildCompSidePanel(m.a||'',m.b||'',aWin,bWin,ca,cb,m)
        : {left:'',right:''};
      h+=`<div class="grp-match-card match-card-v3 tc-card${_fxOn?' grp-sidefx grp-sidefx--'+_fxMode:''}${(_compSide.left||_compSide.right)?' has-side-panels':''}" style="--tc-win-rgb:${winRgb};${_fxVars}background:var(--white);border:1px solid var(--border);border-left:4px solid ${m.grpColor};">
        ${_compSide.left}
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:72px">
          <span class="grp-badge" style="background:linear-gradient(135deg,${m.grpColor},${m.grpColor}cc);font-size:10px;letter-spacing:.5px;box-shadow:0 2px 6px ${m.grpColor}55">GROUP ${m.grpLetter}</span>
          <span style="font-size:10px;color:var(--gray-l);font-weight:600">${m.matchNum}경기</span>
          ${!isDone?`<span style="background:var(--surface);color:var(--gray-l);font-size:10px;padding:2px 8px;border-radius:10px;border:1px solid var(--border)">예정</span>`:''}
        </div>
        <div class="grp-match-main" style="flex:1;display:flex;align-items:center;gap:var(--tc-vs-gap,12px);justify-content:center;flex-wrap:wrap">
          <div class="grp-team-col" style="display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;min-width:100px">
            <div class="grp-team-chip" style="--chip-col:${ca||'#888'};display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,color-mix(in srgb, var(--chip-col) 92%, #ffffff 8%),color-mix(in srgb, var(--chip-col) 78%, #000000 22%));padding:10px 16px;border-radius:12px;cursor:pointer;transition:.15s;border:1px solid rgba(255,255,255,.26);${(isDone && bWin)?'opacity:.55;filter:saturate(0.65) grayscale(.15)':''}" onclick="openUnivModal('${m.a||''}')">
            ${(()=>{const url=UNIV_ICONS[m.a]||(univCfg.find(x=>x.name===m.a)||{}).icon||'';return url?`<img class="tc-uicon" src="${toHttpsUrl(url)}" style="width:var(--tc-uicon);height:var(--tc-uicon);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px);flex-shrink:0" onerror="this.style.display='none'">`:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='24' height='24'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;})()}
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${m.a||'—'}</span>
            </div>
            ${aMembers.length ? `<button class="grp-mem-btn" style="--mem-col:${aBtnColor};" onclick="event.stopPropagation();openProMembersPopup('${m.a.replace(/'/g,"\\'")}', '${ca}', ${aMemJson})">
              <span class="mem-ico">👥</span><span>${aMembers.length}명</span>
            </button>` : ''}
          </div>
          <div class="grp-score-col" style="display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;min-width:80px">
            ${isDone?`<div class="grp-match-score score-click" onclick="openCompMatchDetailModal('${tn.id}',${m.grpIdx},${m.matchNum-1})"><span class="${aWin?'wt':bWin?'lt':''}">${m.sa}</span><span style="color:var(--gray-l);font-size:14px;margin:0 3px">:</span><span class="${bWin?'wt':aWin?'lt':''}">${m.sb}</span></div>
            `:`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:22px;color:${m.grpColor};text-shadow:0 1px 8px ${m.grpColor}44">VS</div>`}
          </div>
          <div class="grp-team-col" style="display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;min-width:100px">
            <div class="grp-team-chip" style="--chip-col:${cb||'#888'};display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,color-mix(in srgb, var(--chip-col) 92%, #ffffff 8%),color-mix(in srgb, var(--chip-col) 78%, #000000 22%));padding:10px 16px;border-radius:12px;cursor:pointer;transition:.15s;border:1px solid rgba(255,255,255,.26);${(isDone && aWin)?'opacity:.55;filter:saturate(0.65) grayscale(.15)':''}" onclick="openUnivModal('${m.b||''}')">
            ${(()=>{const url=UNIV_ICONS[m.b]||(univCfg.find(x=>x.name===m.b)||{}).icon||'';return url?`<img class="tc-uicon" src="${toHttpsUrl(url)}" style="width:var(--tc-uicon);height:var(--tc-uicon);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px);flex-shrink:0" onerror="this.style.display='none'">`:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='24' height='24'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;})()}
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${m.b||'—'}</span>
            </div>
            ${bMembers.length ? `<button class="grp-mem-btn" style="--mem-col:${bBtnColor};" onclick="event.stopPropagation();openProMembersPopup('${m.b.replace(/'/g,"\\'")}', '${cb}', ${bMemJson})">
              <span class="mem-ico">👥</span><span>${bMembers.length}명</span>
            </button>` : ''}
          </div>
        </div>
        ${_leagueMenu?`<div class="no-export" style="display:flex;flex-direction:column;gap:4px">${_leagueMenu}</div>`:''}
        ${_compSide.right}
      </div>`;
    });
    h+=`</div>`;
  });
  return h;
}

function leagueToggleDet(id,btn){
  const el=document.getElementById(id);if(!el)return;
  const open=el.style.display==='none'||!el.style.display;
  el.style.display=open?'block':'none';
  el.classList.toggle('open', open);
  const detBtn=btn||document.getElementById('detbtn-'+id);
  if(detBtn){detBtn.textContent=open?'🔼 닫기':'📂 상세';detBtn.classList.toggle('open',open);}
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
      </div>`;
    });
    h+=`</div></div>`;
  });
  return h;
}

try{
  window.rCompLeague = rCompLeague;
  window.leagueToggleDet = leagueToggleDet;
  window.leagueEditMatch = leagueEditMatch;
  window.openLeaguePaste = openLeaguePaste;
  window.openCompAutoDetectPaste = openCompAutoDetectPaste;
  window.grpMatchDetail = grpMatchDetail;
}catch(e){}
