/* ══════════════════════════════════════
   competition-bracket-views.js — 대진표 렌더 모드(트리/컴팩트/포스터/브로드캐스트)
   competition.js에서 분리됨
══════════════════════════════════════ */

function rCompTourDynamic(tn){
  if(!window._bktViewMode) window._bktViewMode=(()=>{try{return localStorage.getItem('su_bkt_view_mode')||'tree';}catch(e){return 'tree';}})();
  const _switcher=_rBktModeSwitcherHTML();
  const vm=window._bktViewMode;
  if(vm==='compact') return _switcher+_rCompTourCompact(tn);
  if(vm==='poster') return _switcher+_rCompTourPoster(tn);
  if(vm==='broadcast') return _switcher+_rCompTourBroadcast(tn);
  return _switcher+_rCompTourTree(tn);
}
function _rBktModeSwitcherHTML(){
  const _modes=[
    {id:'tree',      icon:'🗂️', title:'대진표'},
    {id:'compact',   icon:'📝', title:'컴팩트'},
    {id:'poster',    icon:'🖼️', title:'포스터'},
    {id:'broadcast', icon:'📺', title:'브로드캐스트'},
  ];
  if(!window._bktViewMode) window._bktViewMode=(()=>{try{return localStorage.getItem('su_bkt_view_mode')||'tree';}catch(e){return 'tree';}})();
  let h=`<div class="tier-view-row no-export"><span class="tier-view-row-label">🎛️ 모드</span><div class="tier-view-row-btns">`;
  _modes.forEach(vm=>{
    const on=window._bktViewMode===vm.id;
    h+=`<button class="tier-view-btn ${on?'on':''}" title="${vm.title}" onclick="window._bktViewMode='${vm.id}';try{localStorage.setItem('su_bkt_view_mode','${vm.id}');}catch(e){}render()"><span class="tier-view-btn-icon">${vm.icon}</span><span class="tier-view-btn-label">${vm.title}</span></button>`;
  });
  h+=`</div></div>`;
  return h;
}
/* ── 대진표 비-기본형 모드 공용 데이터 빌더: 조 배정/시드/승자 계산을 한 곳에서 ──
   (기본형=_rCompTourTree는 슬롯 직접 편집 select 등 별도 로직이 있어 그대로 유지) */
function _rCompTourBuildData(tn){
  const grpRanks=(tn.groups&&tn.groups.length>=2)?tn.groups.map((grp,gi)=>{
    const gl='ABCDEFGHIJ'[gi]||String(gi+1);
    const color=['var(--blue)','var(--red)','var(--green)','var(--gold)','var(--god)','#0891b2'][gi%6];
    return{grpName:grp.name||('조'+gl),color,ranked:_calcGrpRank(grp)};
  }):[];
  const numGroups=grpRanks.length;
  const pairCount=Math.floor(numGroups/2)*2;
  const r1teams=[];
  for(let i=0;i<pairCount;i+=2){
    const gA=grpRanks[i],gB=grpRanks[i+1]||grpRanks[0];
    r1teams.push(
      {univ:gA.ranked[0]?.u||''},{univ:gB.ranked[1]?.u||''},
      {univ:gB.ranked[0]?.u||''},{univ:gA.ranked[1]?.u||''}
    );
  }
  if(numGroups%2===1){
    const last=grpRanks[numGroups-1];
    r1teams.push({univ:last.ranked[0]?.u||''},{univ:''});
  }
  const overrideSize=tn.bracketOverrideSize||0;
  const numTeams=overrideSize>1?overrideSize:(r1teams.length>0?r1teams.length:8);
  let totalRounds=0;{let n=numTeams;while(n>1){n=Math.ceil(n/2);totalRounds++;}} if(!totalRounds)totalRounds=1;
  const roundLabels={1:'결승',2:'4강',3:'8강',4:'16강',5:'32강',6:'64강',7:'128강',8:'256강'};
  const br=getBracket(tn);
  const rounds=[];
  for(let r=0;r<totalRounds;r++){
    const matchCount=Math.ceil(numTeams/Math.pow(2,r+1));
    const pairs=[];
    for(let mi=0;mi<matchCount;mi++){
      let tA=null,tB=null;
      if(r===0){
        const bA=r1teams[mi*2]||null,bB=r1teams[mi*2+1]||null;
        const sA=br.slots[`0-${mi}-a`],sB=br.slots[`0-${mi}-b`];
        tA=sA!==undefined?(sA?{univ:sA}:null):(bA?.univ?bA:null);
        tB=sB!==undefined?(sB?{univ:sB}:null):(bB?.univ?bB:null);
      }else{
        const pA=br.winners[`${r-1}-${mi*2}`]||null,pB=br.winners[`${r-1}-${mi*2+1}`]||null;
        const sA=br.slots[`${r}-${mi}-a`],sB=br.slots[`${r}-${mi}-b`];
        tA=sA!==undefined?(sA?{univ:sA}:null):(pA?{univ:pA}:null);
        tB=sB!==undefined?(sB?{univ:sB}:null):(pB?{univ:pB}:null);
      }
      pairs.push({a:tA,b:tB,winner:br.winners[`${r}-${mi}`]||null});
    }
    rounds.push(pairs);
  }
  const finalPairs=rounds[totalRounds-1]||[];
  const finalWinner=finalPairs[0]?.winner||br.champ||'';
  return {rounds,totalRounds,roundLabels,br,finalWinner};
}
function _rCompTourChampBanner(tn,finalWinner){
  if(!finalWinner) return '';
  return `<div style="background:linear-gradient(135deg,#f59e0b,var(--gold));border-radius:14px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;gap:14px;box-shadow:0 4px 20px rgba(217,119,6,.35)">
    ${gUI(finalWinner,'52px')}
    <div>
      <div style="font-size:10px;color:rgba(255,255,255,.8);font-weight:700;letter-spacing:.5px">🏆 TOURNAMENT CHAMPION</div>
      <div style="font-size:20px;font-weight:900;color:#fff">${finalWinner}</div>
    </div>
  </div>`;
}
/* ── 대진표 컴팩트(리스트)형: 라운드별 세로 리스트, 모바일 스크롤 친화 ── */
function _rCompTourCompact(tn){
  const {rounds,totalRounds,roundLabels,br,finalWinner}=_rCompTourBuildData(tn);
  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <span style="font-weight:900;font-size:var(--fs-md);color:var(--blue)">⚔️ ${tn.name} — 토너먼트 브라켓</span>
    <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 컴팩트형 · 라운드별 리스트</span>
  </div>`+_rCompTourChampBanner(tn,finalWinner);
  for(let r=0;r<totalRounds;r++){
    const rNum=totalRounds-r;
    const rLabel=roundLabels[rNum]||(rNum+'강');
    h+=`<div style="margin-bottom:14px">
      <div style="font-size:var(--fs-sm);font-weight:900;color:#fff;padding:6px 12px;background:linear-gradient(135deg,#3b82f6,var(--blue-d));border-radius:8px 8px 0 0;letter-spacing:.5px">${rLabel}</div>
      <div style="border:1.5px solid var(--border);border-top:0;border-radius:0 0 10px 10px;overflow:hidden">`;
    rounds[r].forEach((pair,mi)=>{
      const a=pair.a?.univ||'', b=pair.b?.univ||'';
      const aWin=pair.winner&&pair.winner===a, bWin=pair.winner&&pair.winner===b;
      const det=br.matchDetails?.[`${r}-${mi}`];
      const hasScore=det&&det.sa!=null&&det.sb!=null;
      const aC=a?gc(a):'var(--border)', bC=b?gc(b):'var(--border)';
      h+=`<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;${mi>0?'border-top:1px solid var(--bg)':''}">
        <div style="flex:1;min-width:0;display:flex;align-items:center;justify-content:flex-end;gap:6px;font-weight:${aWin?'900':'700'};color:${aWin?aC:a?'var(--text2)':'var(--text3)'};overflow:hidden">
          <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a||'미정'}</span>
          ${hasScore?`<span style="color:${aWin?aC:'var(--text3)'}">${det.sa}</span>`:''}
        </div>
        <div style="flex-shrink:0;font-size:var(--fs-caption);font-weight:800;color:var(--gray-l)">vs</div>
        <div style="flex:1;min-width:0;display:flex;align-items:center;gap:6px;font-weight:${bWin?'900':'700'};color:${bWin?bC:b?'var(--text2)':'var(--text3)'};overflow:hidden">
          ${hasScore?`<span style="color:${bWin?bC:'var(--text3)'}">${det.sb}</span>`:''}
          <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b||'미정'}</span>
        </div>
      </div>`;
    });
    h+=`</div></div>`;
  }
  return h;
}
/* ── 대진표 포스터형: 라운드별로 큰 카드 그리드, 대학 로고 크게 강조 ── */
function _rCompTourPoster(tn){
  const {rounds,totalRounds,roundLabels,br,finalWinner}=_rCompTourBuildData(tn);
  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <span style="font-weight:900;font-size:var(--fs-md);color:var(--blue)">⚔️ ${tn.name} — 토너먼트 브라켓</span>
    <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 포스터형 · 라운드별 카드</span>
  </div>`+_rCompTourChampBanner(tn,finalWinner);
  for(let r=0;r<totalRounds;r++){
    const rNum=totalRounds-r;
    const rLabel=roundLabels[rNum]||(rNum+'강');
    h+=`<div style="margin-bottom:18px">
      <div style="font-size:var(--fs-sm);font-weight:900;color:var(--blue);margin-bottom:9px;letter-spacing:.5px">${rLabel}</div>
      <div style="display:flex;flex-wrap:wrap;gap:12px">`;
    rounds[r].forEach((pair,mi)=>{
      const a=pair.a?.univ||'', b=pair.b?.univ||'';
      const aWin=pair.winner&&pair.winner===a, bWin=pair.winner&&pair.winner===b;
      const det=br.matchDetails?.[`${r}-${mi}`];
      const hasScore=det&&det.sa!=null&&det.sb!=null;
      const aC=a?gc(a):'var(--border)', bC=b?gc(b):'var(--border)';
      const winC=pair.winner?(aWin?aC:bC):'var(--border)';
      h+=`<div style="width:230px;background:var(--white);border:2px solid ${winC}55;border-radius:16px;overflow:hidden;box-shadow:0 3px 14px rgba(0,0,0,.08)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px 8px;gap:8px;${!pair.winner?'':aWin?`background:${aC}12`:''}">
          <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;min-width:0">
            ${a?gUI(a,'44px'):`<div style="width:44px;height:44px;border-radius:50%;background:var(--surface)"></div>`}
            <span style="font-size:var(--fs-sm);font-weight:${aWin?'900':'700'};color:${aWin?aC:a?'var(--text2)':'var(--text3)'};text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90px">${a||'미정'}</span>
          </div>
          <span style="font-size:11px;font-weight:900;color:var(--gray-l);flex-shrink:0">VS</span>
          <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;min-width:0">
            ${b?gUI(b,'44px'):`<div style="width:44px;height:44px;border-radius:50%;background:var(--surface)"></div>`}
            <span style="font-size:var(--fs-sm);font-weight:${bWin?'900':'700'};color:${bWin?bC:b?'var(--text2)':'var(--text3)'};text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90px">${b||'미정'}</span>
          </div>
        </div>
        ${hasScore?`<div style="text-align:center;padding:6px;font-weight:900;font-size:var(--fs-md);color:var(--text2);border-top:1px solid var(--bg);background:var(--surface)">${det.sa} : ${det.sb}</div>`:`<div style="text-align:center;padding:6px;font-size:var(--fs-caption);color:var(--gray-l);border-top:1px solid var(--bg);background:var(--surface)">${a&&b?'경기 예정':'대진 확정 전'}</div>`}
      </div>`;
    });
    h+=`</div></div>`;
  }
  return h;
}
/* ── 대진표 브로드캐스트형: 방송 그래픽 느낌의 가로 바 스타일 ──
   (개선) 날짜/스코어 정보 노출, LIVE/다음 경기 강조, 방송 그래픽 톤 강화, 모바일 대응 클래스화 */
function _rCompTourBroadcast(tn){
  const {rounds,totalRounds,roundLabels,br,finalWinner}=_rCompTourBuildData(tn);
  const _today=(()=>{try{return new Date().toISOString().slice(0,10);}catch(e){return '';}})();

  // 대진표 순서상 가장 먼저 나오는 "양팀 확정 + 미완료" 매치 = 다음 경기
  let _nextKey=null;
  outer:
  for(let r=0;r<totalRounds;r++){
    for(let mi=0;mi<rounds[r].length;mi++){
      const p=rounds[r][mi];
      if(!p.winner && p.a?.univ && p.b?.univ){ _nextKey=`${r}-${mi}`; break outer; }
    }
  }

  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <span style="font-weight:900;font-size:var(--fs-md);color:var(--blue)">⚔️ ${tn.name} — 토너먼트 브라켓</span>
    <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 브로드캐스트형</span>
  </div>`+_rCompTourChampBanner(tn,finalWinner);

  for(let r=0;r<totalRounds;r++){
    const rNum=totalRounds-r;
    const rLabel=roundLabels[rNum]||(rNum+'강');
    h+=`<div style="margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:9px">
        <div class="bc-round-badge"><span class="bc-round-dot"></span>${rLabel}</div>
        <div class="bc-round-line"></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">`;
    rounds[r].forEach((pair,mi)=>{
      const a=pair.a?.univ||'', b=pair.b?.univ||'';
      const aWin=pair.winner&&pair.winner===a, bWin=pair.winner&&pair.winner===b;
      const key=`${r}-${mi}`;
      const det=br.matchDetails?.[key];
      const hasScore=det&&det.sa!=null&&det.sb!=null;
      const aC=a?gc(a):'#334155', bC=b?gc(b):'#334155';
      const aLose=!!(pair.winner&&!aWin&&a), bLose=!!(pair.winner&&!bWin&&b);
      const aBg=aWin?`linear-gradient(135deg,${aC},${aC}cc)`:(aLose?'#e2e8f0':'#1e293b');
      const bBg=bWin?`linear-gradient(225deg,${bC},${bC}cc)`:(bLose?'#e2e8f0':'#1e293b');
      const aTxt=aWin?'#fff':(aLose?'#94a3b8':'#fff');
      const bTxt=bWin?'#fff':(bLose?'#94a3b8':'#fff');
      const isLive=!!(det&&det.d===_today&&!pair.winner&&a&&b);
      const isNext=!isLive&&key===_nextKey;
      const dateLabel=det&&det.d?det.d.slice(5).replace('-','.'):'';
      const statusTag=isLive
        ?`<span class="bc-status-tag bc-status-live">● LIVE</span>`
        :isNext?`<span class="bc-status-tag bc-status-next">다음 경기</span>`:'';
      h+=`<div class="bc-row${(isLive||isNext)?' bc-row--flag':''}">
        ${statusTag}
        <div class="bc-card${isLive?' bc-card--live':isNext?' bc-card--next':''}">
          <div class="bc-side" style="background:${aBg};${aLose?'filter:grayscale(.4)':''}">
            ${a?gUI(a,'26px'):'<div class="bc-logo-ph"></div>'}
            <span class="bc-name" style="font-weight:${aWin?'900':'700'};color:${aTxt}">${a||'미정'}</span>
          </div>
          <div class="bc-mid">
            <span class="bc-mid-score">${hasScore?`${det.sa} : ${det.sb}`:'VS'}</span>
            ${dateLabel&&!hasScore?`<span class="bc-mid-date">${dateLabel}</span>`:''}
          </div>
          <div class="bc-side bc-side-b" style="background:${bBg};${bLose?'filter:grayscale(.4)':''}">
            <span class="bc-name" style="font-weight:${bWin?'900':'700'};text-align:right;color:${bTxt}">${b||'미정'}</span>
            ${b?gUI(b,'26px'):'<div class="bc-logo-ph"></div>'}
          </div>
        </div>
      </div>`;
    });
    h+=`</div></div>`;
  }
  return h;
}
function _rCompTourTree(tn){
  const grpRanks=(tn.groups&&tn.groups.length>=2)?tn.groups.map((grp,gi)=>{
    const gl='ABCDEFGHIJ'[gi]||String(gi+1);
    const color=['var(--blue)','var(--red)','var(--green)','var(--gold)','var(--god)','#0891b2'][gi%6];
    return{grpName:grp.name||('조'+gl),color,ranked:_calcGrpRank(grp)};
  }):[];

  const numGroups=grpRanks.length;
  const pairCount=Math.floor(numGroups/2)*2;
  const r1teams=[];
  for(let i=0;i<pairCount;i+=2){
    const gA=grpRanks[i],gB=grpRanks[i+1]||grpRanks[0];
    r1teams.push(
      {univ:gA.ranked[0]?.u||'',grpName:gA.grpName,color:gA.color,rank:1},
      {univ:gB.ranked[1]?.u||'',grpName:gB.grpName,color:gB.color,rank:2},
      {univ:gB.ranked[0]?.u||'',grpName:gB.grpName,color:gB.color,rank:1},
      {univ:gA.ranked[1]?.u||'',grpName:gA.grpName,color:gA.color,rank:2}
    );
  }
  if(numGroups%2===1){
    const last=grpRanks[numGroups-1];
    r1teams.push(
      {univ:last.ranked[0]?.u||'',grpName:last.grpName,color:last.color,rank:1},
      {univ:'',grpName:'와일드카드',color:'var(--text3)',rank:'-'}
    );
  }

  const overrideSize=tn.bracketOverrideSize||0;
  const numTeams=overrideSize>1?overrideSize:(r1teams.length>0?r1teams.length:8);
  let totalRounds=0;
  {let n=numTeams;while(n>1){n=Math.ceil(n/2);totalRounds++;}}
  if(!totalRounds)totalRounds=1;

  const roundLabels={1:'결승',2:'4강',3:'8강',4:'16강',5:'32강',6:'64강',7:'128강',8:'256강'};
  const br=getBracket(tn);
  const allU=getAllUnivs();
  const tnId=tn.id;
  const BASE_H=165; // px per R0 match slot (카드 겹침 방지를 위해 130→165로 증가)

  // Build rounds data
  const rounds=[];
  for(let r=0;r<totalRounds;r++){
    const matchCount=Math.ceil(numTeams/Math.pow(2,r+1));
    const pairs=[];
    for(let mi=0;mi<matchCount;mi++){
      let tA=null,tB=null;
      if(r===0){
        const bA=r1teams[mi*2]||null,bB=r1teams[mi*2+1]||null;
        const sA=br.slots[`0-${mi}-a`],sB=br.slots[`0-${mi}-b`];
        tA=sA!==undefined?(sA?{univ:sA,color:gc(sA)}:null):(bA?.univ?bA:null);
        tB=sB!==undefined?(sB?{univ:sB,color:gc(sB)}:null):(bB?.univ?bB:null);
      }else{
        const pA=br.winners[`${r-1}-${mi*2}`]||null,pB=br.winners[`${r-1}-${mi*2+1}`]||null;
        const sA=br.slots[`${r}-${mi}-a`],sB=br.slots[`${r}-${mi}-b`];
        tA=sA!==undefined?(sA?{univ:sA,color:gc(sA)}:null):(pA?{univ:pA,color:gc(pA)}:null);
        tB=sB!==undefined?(sB?{univ:sB,color:gc(sB)}:null):(pB?{univ:pB,color:gc(pB)}:null);
      }
      pairs.push({a:tA,b:tB,winner:br.winners[`${r}-${mi}`]||null});
    }
    rounds.push(pairs);
  }

  // === 팀 vs 팀 한줄 표시 HTML (대학 vs 대학, 가운데 정렬·이름 안 잘림·로고 표시) ===
  function teamRow(a,b,aWin,bWin,rnd,mi,aScore,bScore,detailClick){
    const aName=a?.univ||'', bName=b?.univ||'';
    const aTbd=!aName, bTbd=!bName;
    const aCol=a?gc(aName):'var(--border)', bCol=b?gc(bName):'var(--border)';
    const aTextCol=aTbd?'#b0bec5':bWin?'var(--text3)':aWin?aCol:'var(--text)';
    const bTextCol=bTbd?'#b0bec5':aWin?'var(--text3)':bWin?bCol:'var(--text)';
    const aFw=aWin?800:bWin?500:600, bFw=bWin?800:aWin?500:600;
    const detAttr = detailClick ? ` onclick="openCompMatchDetailModal('${tnId}',null,${mi},${rnd},false)"` : '';
    const hasScore = aScore!=null && bScore!=null;
    const midEl = hasScore
      ? `<span style="flex-shrink:0;padding:0 8px;font-size:var(--fs-base);font-weight:900;white-space:nowrap;text-decoration:underline;text-underline-offset:2px;${detailClick?'cursor:pointer;':''}"${detAttr}><span style="color:${aWin?'var(--win-col)':bWin?'var(--lose-col)':'var(--text2)'}">${aScore}</span><span style="color:var(--text3);margin:0 2px">:</span><span style="color:${bWin?'var(--win-col)':aWin?'var(--lose-col)':'var(--text2)'}">${bScore}</span></span>`
      : `<span style="flex-shrink:0;padding:0 8px;font-size:var(--fs-caption);font-weight:800;color:var(--gray-l);white-space:nowrap">vs</span>`;
    const aLogo = aTbd?'':gUI(aName,'20px');
    const bLogo = bTbd?'':gUI(bName,'20px');
    if(isLoggedIn){
      return `<div style="display:flex;align-items:center;justify-content:center;height:38px;padding:0 6px">
        <span style="flex:1;min-width:0;display:flex;align-items:center;justify-content:flex-end;gap:5px;padding:0 6px 0 4px">
          <select onchange="setBracketSlot('${tnId}',${rnd},${mi},'a',this.value)"
            style="flex:0 1 auto;min-width:0;width:auto;max-width:110px;height:100%;border:none;background:transparent;font-size:var(--fs-sm);font-weight:${aFw};color:${aTextCol};padding:0;cursor:pointer;outline:none;text-align:right;text-align-last:right">
            <option value="">— 미정 —</option>
            ${allU.map(u=>`<option value="${u.name}"${aName===u.name?' selected':''}>${u.name}</option>`).join('')}
          </select>${aLogo}
        </span>
        ${midEl}
        <span style="flex:1;min-width:0;display:flex;align-items:center;justify-content:flex-start;gap:5px;padding:0 4px 0 6px">${bLogo}
          <select onchange="setBracketSlot('${tnId}',${rnd},${mi},'b',this.value)"
            style="flex:0 1 auto;min-width:0;width:auto;max-width:110px;height:100%;border:none;background:transparent;font-size:var(--fs-sm);font-weight:${bFw};color:${bTextCol};padding:0;cursor:pointer;outline:none;text-align:left">
            <option value="">— 미정 —</option>
            ${allU.map(u=>`<option value="${u.name}"${bName===u.name?' selected':''}>${u.name}</option>`).join('')}
          </select>
        </span>
      </div>`;
    }
    return `<div style="display:flex;align-items:center;justify-content:center;height:auto;min-height:38px;padding:6px">
      <span style="flex:1;min-width:0;display:flex;align-items:center;justify-content:flex-end;gap:5px;padding:0 6px 0 4px;font-size:var(--fs-sm);font-weight:${aFw};color:${aTextCol};white-space:nowrap">${aTbd?'미정':aName}${aLogo}</span>
      ${midEl}
      <span style="flex:1;min-width:0;display:flex;align-items:center;justify-content:flex-start;gap:5px;padding:0 4px 0 6px;font-size:var(--fs-sm);font-weight:${bFw};color:${bTextCol};white-space:nowrap">${bLogo}${bTbd?'미정':bName}</span>
    </div>`;
  }

  // === 매치 카드 HTML ===
  function matchCard(pair,rnd,mi){
    const {a,b,winner}=pair;
    const aC=a?gc(a.univ):'var(--border)',bC=b?gc(b.univ):'var(--border)';
    const aWin=!!(winner&&winner===a?.univ),bWin=!!(winner&&winner===b?.univ);
    const isDone=!!winner;
    const bktKey=`${rnd}-${mi}`;
    const det=br.matchDetails?.[bktKey];
    const detDone=det&&det.sa!=null;
    const hasGames=det?.sets?.some(s=>(s.games||[]).some(g=>g.playerA||g.playerB));
    const detId=`bkt-det-${rnd}-${mi}`;
    let footer='';
    if(isLoggedIn&&a?.univ&&b?.univ){
      footer=`<div style="display:flex;gap:2px;padding:4px;background:var(--surface);border-top:1px solid var(--border);flex-wrap:wrap">
        <div style="display:flex;gap:2px;flex:1;min-width:0">
          <button onclick="setBracketWinner('${tnId}',${rnd},${mi},'${a.univ}')"
            style="flex:1;padding:2px 4px;border-radius:4px;border:1.5px solid ${aWin?'var(--red)':'var(--border)'};background:${aWin?'#dc262622':'var(--white)'};font-size:10px;font-weight:700;color:${aWin?'var(--red)':'var(--text3)'};cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">
            ${aWin?'✅ ':''}${a.univ}승
          </button>
          <button onclick="setBracketWinner('${tnId}',${rnd},${mi},'${b.univ}')"
            style="flex:1;padding:2px 4px;border-radius:4px;border:1.5px solid ${bWin?'var(--red)':'var(--border)'};background:${bWin?'#dc262622':'var(--white)'};font-size:10px;font-weight:700;color:${bWin?'var(--red)':'var(--text3)'};cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">
            ${bWin?'✅ ':''}${b.univ}승
          </button>
        </div>
        <div style="display:flex;gap:2px">
          <button onclick="openBracketMatchModal('${tnId}',${rnd},${mi},'${a.univ}','${b.univ}')"
            style="padding:2px 5px;border-radius:4px;border:1px solid var(--blue);background:var(--blue-l);font-size:10px;color:var(--blue);cursor:pointer" title="결과 직접 입력">✏️</button>
          <button onclick="bracketMatchState={tnId:'${tnId}',rnd:${rnd},mi:${mi},teamA:'${a.univ}',teamB:'${b.univ}'};openBktPasteModal()"
            style="padding:2px 5px;border-radius:4px;border:1px solid var(--green);background:#f0fdf4;font-size:10px;color:var(--green);cursor:pointer" title="붙여넣기로 입력">📋</button>
          ${detDone?`<button onclick="openBktShareCard('${tnId}',${rnd},${mi})" style="padding:2px 5px;border-radius:4px;border:1px solid var(--god);background:#f5f3ff;font-size:10px;color:var(--god);cursor:pointer">🎴</button>`:''}
        </div>
      </div>`;
    }else if(!a?.univ||!b?.univ){
      footer=`<div style="font-size:9px;color:var(--text3);text-align:center;padding:4px;border-top:1px solid var(--bg)">팀 배정 후 입력</div>`;
    }
    const aSc=detDone?det.sa:null, bSc=detDone?det.sb:null;
    const _winCol = winner ? (winner===a?.univ?aC:winner===b?.univ?bC:'var(--gray)') : 'var(--gray)';
    const _winRgb = _tcHexToRgbStr(_winCol);
    // 대진표(브라켓) 카드에도 양끝 색상 효과 적용
    const _bktFxCfg=(typeof _getRecSideFxCfg==='function')?_getRecSideFxCfg():{on:true,mode:'soft',intensity:68,length:25};
    const _bktFxOn=!!_bktFxCfg.on;
    const _bktFxMetrics=(typeof _buildRecSideFxMetrics==='function')?_buildRecSideFxMetrics(_bktFxCfg):null;
    const _bktFxMode=_bktFxMetrics?_bktFxMetrics.mode:'soft';
    const _bktFxVars=(_bktFxOn&&a?.univ&&b?.univ&&typeof _recSideFxVarStyle==='function')?_recSideFxVarStyle(aC,bC,_bktFxCfg):'';
    const _hexRgb=(h)=>{const s=String(h||'').replace('#','');if(s.length===6){const r=parseInt(s.slice(0,2),16),g=parseInt(s.slice(2,4),16),b=parseInt(s.slice(4,6),16);if(![r,g,b].some(isNaN))return r+','+g+','+b;}return'100,116,139';};
    const _bktSideRgbVars=`--rec-side-left-rgb:${_hexRgb(aC)};--rec-side-right-rgb:${_hexRgb(bC)};`;
    const _bktFxCls=(_bktFxOn&&a?.univ&&b?.univ)?` grp-match-card grp-sidefx grp-sidefx--${_bktFxMode}`:'';
    return `<div class="grp-match-card tc-card${_bktFxCls}" style="--tc-win-rgb:${_winRgb};${_bktSideRgbVars}${_bktFxVars}background:var(--white);border:1px solid ${isDone?_winCol+'40':'var(--border)'};border-radius:16px;overflow:hidden;width:220px;min-width:150px;max-width:min(220px,100%);flex-shrink:0;box-shadow:0 6px 18px rgba(15,23,42,.09), 0 1px 3px rgba(15,23,42,.06)">
      ${teamRow(a,b,aWin,bWin,rnd,mi,aSc,bSc,detDone)}
      ${footer}
    </div>`;
  }

  // 팀 수 선택
  let sizeHTML='';
  if(isLoggedIn){
    sizeHTML=`<div class="no-export" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:12px">
      <span style="font-size:var(--fs-sm);font-weight:700;color:var(--text3)">⚙️ 참가 팀 수:</span>
      ${[2,4,8,16].map(s=>`<button onclick="setBracketSize('${tnId}',${s})"
        style="padding:3px 10px;border-radius:6px;border:1.5px solid ${numTeams===s&&overrideSize>0?'var(--blue)':'var(--border2)'};background:${numTeams===s&&overrideSize>0?'var(--blue)':'var(--white)'};color:${numTeams===s&&overrideSize>0?'#fff':'var(--text3)'};font-size:var(--fs-sm);font-weight:700;cursor:pointer">${s}팀</button>`).join('')}
      ${overrideSize>0?`<button onclick="setBracketSize('${tnId}',0)" style="padding:3px 10px;border-radius:6px;border:1.5px solid var(--text3);background:var(--white);color:var(--text3);font-size:var(--fs-sm);cursor:pointer">🔄 자동</button>`:''}
      <span style="font-size:var(--fs-caption);color:var(--gray-l)">현재 ${numTeams}팀 / ${totalRounds}라운드</span>
      <button class="btn btn-w btn-xs" onclick="resetBracket('${tnId}')" title="브라켓 초기화">🔄 초기화</button>
    </div>`;
  }

  // 조별 순위 요약
  const grpSummary=grpRanks.length>0?`<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px">
    ${grpRanks.map(g=>`<div style="background:${g.color}10;border:1px solid ${g.color}44;border-radius:8px;padding:7px 11px;min-width:120px">
      <div style="font-size:var(--fs-caption);font-weight:800;color:${g.color};margin-bottom:5px">${g.grpName}</div>
      ${g.ranked.slice(0,2).map((s,ri)=>`<div style="display:flex;align-items:center;gap:4px;margin-bottom:2px">
        <span style="font-size:10px">${ri===0?'🥇':'🥈'}</span>
        <span style="background:${gc(s.u)};color:#fff;font-size:10px;font-weight:700;padding:1px 5px;border-radius:3px">${s.u}</span>
        <span style="font-size:9px;color:var(--gray-l)">${s.w}승${s.l}패</span>
      </div>`).join('')}
    </div>`).join('')}
  </div>`:`<div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:10px;padding:6px 10px;background:var(--surface);border-radius:6px">💡 조편성이 없습니다. 팀 수를 선택하고 슬롯에서 직접 팀을 배치하세요.</div>`;

  // 브라켓 레이아웃
  let bracketHTML=`<div style="display:inline-flex;align-items:flex-start;gap:0;padding-bottom:8px">`;
  for(let r=0;r<totalRounds;r++){
    const rNum=totalRounds-r;
    const rLabel=roundLabels[rNum]||(rNum+'강');
    const unitH=BASE_H*Math.pow(2,r);
    const matchCount=rounds[r].length;
    bracketHTML+=`<div style="display:flex;flex-direction:column">
      <div style="text-align:center;font-size:var(--fs-caption);font-weight:800;color:var(--blue);padding:5px 12px 10px;letter-spacing:.5px;white-space:nowrap">${rLabel}</div>`;
    for(let mi=0;mi<matchCount;mi++){
      bracketHTML+=`<div style="height:${unitH}px;display:flex;align-items:center;justify-content:center;padding:0 8px">
        ${matchCard(rounds[r][mi],r,mi)}
      </div>`;
    }
    bracketHTML+=`</div>`;
    // 연결선 (매치 중심점에서 정확히 연결)
    if(r<totalRounds-1){
      const CL=`var(--tc-line-w) solid rgba(var(--tc-line-rgb), var(--tc-line-a))`;
      const nextMatchCount=rounds[r+1].length;
      // 연결선 컬럼
      bracketHTML+=`<div style="display:flex;flex-direction:column;width:20px;padding-top:31px">`;
      for(let ci=0;ci<matchCount-1;ci+=2){
        // 4분할: 빈칸(상) / 꺾임선(하) / 꺾임선(상) / 빈칸(하)
        bracketHTML+=`<div style="height:${unitH}px;display:flex;flex-direction:column">
          <div style="flex:1"></div>
          <div style="flex:1;border-right:${CL};border-bottom:${CL};border-bottom-right-radius:6px"></div>
        </div>
        <div style="height:${unitH}px;display:flex;flex-direction:column">
          <div style="flex:1;border-right:${CL};border-top:${CL};border-top-right-radius:6px"></div>
          <div style="flex:1"></div>
        </div>`;
        if(ci+2<matchCount&&ci+2!==matchCount-1+(matchCount%2)){
          // 짝수 쌍 사이 여백 없음 (연속)
        }
      }
      if(matchCount%2===1){
        // 홀수 매치: 직선 연결 (높이를 unitH*2로 맞춰 다음 라운드와 정렬)
        bracketHTML+=`<div style="height:${unitH*2}px;display:flex;align-items:center">
          <div style="width:100%;border-top:${CL}"></div>
        </div>`;
      }
      bracketHTML+=`</div>`;
      // bridge 컬럼 (다음 라운드 매치 입력선)
      bracketHTML+=`<div style="display:flex;flex-direction:column;width:14px;padding-top:31px">`;
      for(let ni=0;ni<nextMatchCount;ni++){
        bracketHTML+=`<div style="height:${unitH*2}px;display:flex;align-items:center">
          <div style="width:100%;border-top:${CL}"></div>
        </div>`;
      }
      bracketHTML+=`</div>`;
    }
  }
  // 챔피언 박스 연결선
  const finalPairs=rounds[totalRounds-1]||[];
  const finalWinner=finalPairs[0]?.winner||br.champ||'';
  const cc=finalWinner?gc(finalWinner):'var(--gold)';
  const champUnitH=BASE_H*Math.pow(2,totalRounds-1);
  bracketHTML+=`<div style="display:flex;flex-direction:column;width:32px;padding-top:31px">
    <div style="height:${champUnitH}px;display:flex;align-items:center">
      <div style="width:100%;height:var(--tc-line-w);background:linear-gradient(90deg, rgba(var(--tc-line-rgb), var(--tc-line-a)), ${cc})"></div>
    </div>
  </div>`;
  // 챔피언 박스
  bracketHTML+=`<div style="display:flex;flex-direction:column;padding-top:31px">
    <div style="height:${champUnitH}px;display:flex;align-items:center;padding:0 8px">
      <div style="background:linear-gradient(160deg, ${cc}1c, ${cc}08);border:1px solid ${cc}3a;border-radius:18px;padding:16px 22px;text-align:center;min-width:130px;box-shadow:0 8px 22px rgba(15,23,42,.10), 0 1px 3px rgba(15,23,42,.06)">
        <div style="display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:900;color:${cc};letter-spacing:1.5px;margin-bottom:8px;background:${cc}14;padding:3px 10px;border-radius:999px">🎖️ CHAMPION</div>
        <div style="font-size:26px;margin-bottom:6px">🏆</div>
        <div style="font-weight:900;font-size:var(--fs-md);color:${cc};white-space:nowrap">${finalWinner||'?'}</div>
        ${isLoggedIn?`<select onchange="setBracketChamp('${tnId}',this.value)" style="margin-top:8px;font-size:var(--fs-caption);padding:3px 6px;border:1px solid ${cc}44;border-radius:6px;background:transparent;color:${cc};max-width:120px">
          <option value="">직접 지정...</option>
          ${allU.map(u=>`<option value="${u.name}"${finalWinner===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>`:''}
      </div>
    </div>
  </div>`;
  bracketHTML+=`</div>`;

  return `<div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
      <span style="font-weight:900;font-size:var(--fs-md);color:var(--blue)">⚔️ ${tn.name} — 토너먼트 브라켓</span>
      ${isLoggedIn?`<span class="no-export" style="font-size:var(--fs-caption);color:var(--gray-l)">💡 슬롯 클릭으로 팀 변경 · 승 버튼으로 결과 입력</span>`:''}
    </div>
    ${finalWinner?`<div style="background:linear-gradient(135deg,#f59e0b,var(--gold));border-radius:14px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;gap:14px;box-shadow:0 4px 20px rgba(217,119,6,.35)">
      ${gUI(finalWinner,'52px')}
      <div>
        <div style="font-size:10px;color:rgba(255,255,255,.8);font-weight:700;letter-spacing:.5px">🏆 TOURNAMENT CHAMPION</div>
        <div style="font-size:20px;font-weight:900;color:#fff">${finalWinner}</div>
      </div>
    </div>`:''}
    ${sizeHTML}
    ${grpSummary}
    <div style="overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch;touch-action:pan-x">${bracketHTML}</div>
  </div>`;
}

function setBracketSize(tnId,size){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  if(size>0)tn.bracketOverrideSize=size;else delete tn.bracketOverrideSize;
  save();render();
}

