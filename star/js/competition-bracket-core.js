/* competition-bracket-core.js: extracted from competition.js */
/* ══════════════════════════════════════
   (요청사항) 시드/부전승(라운드 합류) + 자동 배치 (대회 토너먼트)
   - 저장: tn.bracket.seedStarts = { "대학명": 16|8|4|2 ... } (숫자는 시작 라운드 강수)
══════════════════════════════════════ */
function _bktRoundLabelBySize(sz){
  if(sz===2) return '결승';
  if(sz===4) return '4강';
  if(sz===8) return '8강';
  if(sz===16) return '16강';
  if(sz===32) return '32강';
  if(sz===64) return '64강';
  return `${sz}강`;
}
function _bktComputeBracketSize(tn){
  // rCompTourDynamic 기준: r1teams 길이(또는 overrideSize)를 기반으로 브라켓 규모 결정
  const grpRanks=(tn.groups&&tn.groups.length>=2)?tn.groups.map((grp,gi)=>({ranked:_calcGrpRank(grp)})):[];
  const numGroups=grpRanks.length;
  const pairCount=Math.floor(numGroups/2)*2;
  const r1teams=[];
  for(let i=0;i<pairCount;i+=2){
    const gA=grpRanks[i],gB=grpRanks[i+1]||grpRanks[0];
    r1teams.push(gA.ranked[0]?.u||'', gB.ranked[1]?.u||'', gB.ranked[0]?.u||'', gA.ranked[1]?.u||'');
  }
  if(numGroups%2===1){
    const last=grpRanks[numGroups-1];
    r1teams.push(last.ranked[0]?.u||'');
  }
  const overrideSize=tn.bracketOverrideSize||0;
  const numTeams=overrideSize>1?overrideSize:(r1teams.length>0?r1teams.length:8);
  // 올림으로 2의 거듭제곱(라운드 합류 옵션 계산용)
  let brSize=2;
  while(brSize<numTeams) brSize*=2;
  return brSize;
}
function _bktCollectTeams(tn){
  const br=getBracket(tn);
  const s=new Set();
  // 조별 순위 기반 1라운드 후보
  try{
    (tn.groups||[]).forEach(grp=>{
      const ranked=_calcGrpRank(grp);
      ranked.slice(0,2).forEach(x=>{ if(x?.u) s.add(x.u); });
    });
  }catch(e){}
  // 슬롯/승자/수동경기/기록에서 추가 수집
  try{ Object.values(br.slots||{}).forEach(v=>{ if(v) s.add(v); }); }catch(e){}
  try{ Object.values(br.winners||{}).forEach(v=>{ if(v) s.add(v); }); }catch(e){}
  try{ (br.manualMatches||[]).forEach(m=>{ if(m?.a) s.add(m.a); if(m?.b) s.add(m.b); }); }catch(e){}
  return Array.from(s).filter(Boolean).sort((a,b)=>a.localeCompare(b));
}
function openBktSeedModal(tnId){
  const tn=tourneys.find(t=>t.id===tnId);
  if(!tn) return;
  const br=getBracket(tn);
  if(!br.seedStarts) br.seedStarts={};
  const firstSize=_bktComputeBracketSize(tn);
  const sizes=[]; for(let s=firstSize;s>=2;s=Math.floor(s/2)) sizes.push(s);
  const cand=_bktCollectTeams(tn);
  if(!cand.length) return alert('시드 후보(대학)를 찾을 수 없습니다.');
  const modal=document.createElement('div');
  modal.id='_bktSeedModal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML=`<div style="background:var(--white);border-radius:14px;padding:18px;width:min(560px,100%);max-height:90vh;overflow:auto;box-shadow:0 10px 40px rgba(0,0,0,.25)">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <div style="font-weight:900;font-size:14px">🎫 시드/부전승(라운드 합류)</div>
      <div style="margin-left:auto;display:flex;gap:6px">
        <button class="btn btn-b btn-sm" onclick="applyBktSeedStarts('${tnId}')">✅ 적용(자동 배치)</button>
        <button class="btn btn-w btn-sm" onclick="document.getElementById('_bktSeedModal')?.remove()">닫기</button>
      </div>
    </div>
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">
      예: 32강 대회에서 상위 시드가 16강/8강부터 합류(부전승)하는 케이스를 지원합니다.<br>
      <span style="font-size:11px">※ 정확한 위치 재배치는 각 경기의 <b>✏️ 수정</b>에서 팀A/팀B를 바꾸면 됩니다.</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${cand.map(name=>{
        const cur=parseInt(br.seedStarts[name]||firstSize,10)||firstSize;
        return `<div style="display:flex;align-items:center;gap:10px;border:1px solid var(--border);border-radius:10px;padding:10px 12px;background:var(--surface)">
          <div style="font-weight:900;font-size:12px;min-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
          <select data-seed-team="${name.replace(/\"/g,'&quot;')}" style="flex:1;padding:6px 10px;border-radius:10px;border:1px solid var(--border2);font-weight:800;font-size:12px">
            ${sizes.map((s,i)=>`<option value="${s}" ${s===cur?'selected':''}>${i===0?`${_bktRoundLabelBySize(s)}(첫 라운드)`:`${_bktRoundLabelBySize(s)}부터`}</option>`).join('')}
          </select>
        </div>`;
      }).join('')}
    </div>
  </div>`;
  document.body.appendChild(modal);
}
function applyBktSeedStarts(tnId){
  const tn=tourneys.find(t=>t.id===tnId);
  if(!tn) return;
  const br=getBracket(tn);
  const wrap=document.getElementById('_bktSeedModal');
  if(!wrap) return;
  const firstSize=_bktComputeBracketSize(tn);
  if(!br.seedStarts) br.seedStarts={};
  wrap.querySelectorAll('select[data-seed-team]').forEach(sel=>{
    const name=sel.getAttribute('data-seed-team')||'';
    const v=parseInt(sel.value,10)||firstSize;
    if(!name) return;
    br.seedStarts[name]=v;
  });
  if(!confirm('선택한 “시작 라운드” 기준으로 자동 배치할까요?\n(첫 라운드가 아닌 팀은 기존 위치에서 제거 후, 해당 라운드의 빈 슬롯에 배치됩니다.)')) return;

  const sizeToR=(sz)=>{
    const ratio = firstSize / sz;
    const r = Math.round(Math.log2(ratio));
    return Math.max(0, r);
  };
  const normEmpty=v=>(v===undefined||v===null||v===''||v==='BYE');

  // 1) 첫 라운드가 아닌 팀은 기존 슬롯에서 제거
  Object.entries(br.seedStarts||{}).forEach(([name,sz])=>{
    const v=parseInt(sz,10)||firstSize;
    if(v>=firstSize) return;
    Object.keys(br.slots||{}).forEach(k=>{ if(br.slots[k]===name) delete br.slots[k]; });
    // 승자도 제거될 수 있어 전체 winners는 보수적으로 초기화
    Object.keys(br.winners||{}).forEach(k=>{ if(br.winners[k]===name) delete br.winners[k]; });
  });

  // 2) 대상 팀들을 라운드별로 채우기
  const targets = Object.entries(br.seedStarts||{})
    .map(([name,sz])=>({name,sz:parseInt(sz,10)||firstSize}))
    .filter(x=>x.name && x.sz<firstSize)
    .sort((a,b)=>a.sz-b.sz||a.name.localeCompare(b.name));

  const failed=[];
  targets.forEach(({name,sz})=>{
    const r=sizeToR(sz);
    const matchCount = Math.max(1, Math.floor(firstSize / Math.pow(2,r+1)));
    let placed=false;
    for(let mi=0;mi<matchCount&&!placed;mi++){
      const ka=`${r}-${mi}-a`, kb=`${r}-${mi}-b`;
      const va=br.slots[ka], vb=br.slots[kb];
      if(normEmpty(va)){ br.slots[ka]=name; placed=true; break; }
      if(normEmpty(vb)){ br.slots[kb]=name; placed=true; break; }
    }
    if(!placed) failed.push(`${name}(${_bktRoundLabelBySize(sz)})`);
  });
  save(); render();
  if(failed.length) alert('빈 슬롯이 부족해 일부 시드를 배치하지 못했습니다:\n- '+failed.join('\n- '));
}

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
    // (요청사항) 날짜/조 선택을 "선택 메뉴(드롭다운)"로 변경 (버튼 나열 제거)
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
  // 조 선택은 "전체/일자" 메뉴 영역 우측으로 이동됨
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
      const detId=`ld-${m.grpIdx}-${m.matchNum-1}`;
      const hasDetail=isDone&&m.sets&&m.sets.some(s=>(s.games||[]).some(g=>g.playerA||g.playerB));
      const _leagueMenu = isLoggedIn ? _compActionMenuHTML([
        `<button class="btn btn-b btn-xs" style="white-space:nowrap;justify-content:flex-start" onclick="leagueEditMatch('${tn.id}',${m.grpIdx},${m.matchNum-1})">✏️ 결과 입력</button>`,
        isDone?(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?`<button class="btn btn-p btn-xs" style="justify-content:flex-start" data-share-open="comp-match" data-tn-id="${encodeURIComponent(tn.id||'')}" data-gi="${m.grpIdx}" data-mi="${m.matchNum-1}">🎴 공유 카드</button>`:'';})():'',
        `<button class="btn btn-r btn-xs" style="justify-content:flex-start" onclick="grpDelMatch('${tn.id}',${m.grpIdx},${m.matchNum-1})">🗑️ 삭제</button>`
      ]) : '';
      h+=`<div class="grp-match-card tc-card" style="--tc-win-rgb:${winRgb};background:linear-gradient(135deg,var(--white) 0%,var(--blue-l) 100%);border:1.5px solid ${m.grpColor}22;border-left:4px solid ${m.grpColor};box-shadow:0 2px 12px rgba(0,0,0,.06);">
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px;min-width:72px">
          <span class="grp-badge" style="background:linear-gradient(135deg,${m.grpColor},${m.grpColor}cc);font-size:10px;letter-spacing:.5px;box-shadow:0 2px 6px ${m.grpColor}55">GROUP ${m.grpLetter}</span>
          <span style="font-size:10px;color:var(--gray-l);font-weight:600">${m.matchNum}경기</span>
          ${!isDone?`<span style="background:var(--surface);color:var(--gray-l);font-size:10px;padding:2px 8px;border-radius:10px;border:1px solid var(--border)">예정</span>`:''}
        </div>
        <div style="flex:1;display:flex;align-items:center;gap:10px;justify-content:center;flex-wrap:wrap">
          <div style="text-align:center;min-width:100px">
            <div style="display:flex;align-items:center;justify-content:center;gap:7px;background:${ca||'#888'};padding:10px 16px;border-radius:12px;cursor:pointer;transition:.15s;${aWin?'box-shadow:0 0 0 3px #fff,0 0 0 5px '+ca+',0 6px 18px '+ca+'66':isDone?'opacity:.5;filter:saturate(0.6)':''}" onclick="openUnivModal('${m.a||''}')">
            ${(()=>{const url=UNIV_ICONS[m.a]||(univCfg.find(x=>x.name===m.a)||{}).icon||'';return url?`<img class="tc-uicon" src="${toHttpsUrl(url)}" style="width:var(--tc-uicon);height:var(--tc-uicon);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px);flex-shrink:0" onerror="this.style.display='none'">`:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='24' height='24'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;})()}
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${m.a||'—'}</span>
            </div>
          </div>
          <div style="text-align:center;min-width:80px">
            ${isDone?`<div class="grp-match-score score-click" style="cursor:pointer;padding:6px 14px;background:var(--white);border-radius:12px;border:1.5px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,.08)" onclick="openCompMatchDetailModal('${tn.id}',${m.grpIdx},${m.matchNum-1})"><span style="color:${aWin?'#16a34a':bWin?'#dc2626':'var(--text)'}">${m.sa}</span><span style="color:var(--gray-l);font-size:14px;margin:0 3px">:</span><span style="color:${bWin?'#16a34a':aWin?'#dc2626':'var(--text)'}">${m.sb}</span></div>
            <div style="display:flex;align-items:center;justify-content:center;gap:4px;margin-top:5px">${(()=>{const winTeam=aWin?m.a:bWin?m.b:'';if(!winTeam)return '<span style="font-size:10px;color:var(--gray-l)">무승부</span>';const url=UNIV_ICONS[winTeam]||(univCfg.find(x=>x.name===winTeam)||{}).icon||'';return url?`<img class="tc-uicon" src="${toHttpsUrl(url)}" style="width:calc(var(--tc-uicon) * 0.55);height:calc(var(--tc-uicon) * 0.55);object-fit:contain;border-radius:3px" onerror="this.style.display='none'"><span style="font-size:10px;font-weight:700;color:${aWin?ca:cb}">${winTeam} 승</span>`:`<span style="font-size:10px;font-weight:700;color:${aWin?ca:cb}">${winTeam} 승</span>`;})()}</div>
            ${isDone && !isLoggedIn ? (()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?`<button class="btn btn-p" style="margin-top:6px;font-size:10px;padding:4px 10px;border-radius:9px" data-share-open="comp-match" data-tn-id="${encodeURIComponent(tn.id||'')}" data-gi="${m.grpIdx}" data-mi="${m.matchNum-1}">🎴 공유 카드</button>`:'';})() : ''}
            `:`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:22px;color:${m.grpColor};text-shadow:0 1px 8px ${m.grpColor}44">VS</div>`}
          </div>
          <div style="text-align:center;min-width:100px">
            <div style="display:flex;align-items:center;justify-content:center;gap:7px;background:${cb||'#888'};padding:10px 16px;border-radius:12px;cursor:pointer;transition:.15s;${bWin?'box-shadow:0 0 0 3px #fff,0 0 0 5px '+cb+',0 6px 18px '+cb+'66':isDone?'opacity:.5;filter:saturate(0.6)':''}" onclick="openUnivModal('${m.b||''}')">
            ${(()=>{const url=UNIV_ICONS[m.b]||(univCfg.find(x=>x.name===m.b)||{}).icon||'';return url?`<img class="tc-uicon" src="${toHttpsUrl(url)}" style="width:var(--tc-uicon);height:var(--tc-uicon);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px);flex-shrink:0" onerror="this.style.display='none'">`:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='24' height='24'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;})()}
              <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${m.b||'—'}</span>
            </div>
          </div>
        </div>
        ${isLoggedIn?`<div class="no-export" style="display:flex;flex-direction:column;gap:4px">${_leagueMenu}</div>`:''}
      </div>`;
    });
    h+=`</div>`;
  });
  return h;
}

