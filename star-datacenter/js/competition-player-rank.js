/* ══════════════════════════════════════
   competition-player-rank.js — 개인 순위탭 + 조편성 관리 UI
   competition.js에서 분리됨
══════════════════════════════════════ */

function rCompPlayerRank(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const pStats={};
  function _ensure(n){ if(!pStats[n])pStats[n]={w:0,l:0,form:[],maps:{},grpW:0,grpL:0,bktW:0,bktL:0,grpCount:{}}; }
  function countGames(m, phase, grpName){
    if(m.sa==null)return;
    (m.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner)return;
        const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
        _ensure(wn);_ensure(ln);
        pStats[wn].w++;pStats[ln].l++;
        pStats[wn].form.push({d:m.d||'',win:true});
        pStats[ln].form.push({d:m.d||'',win:false});
        if(phase==='grp'){ pStats[wn].grpW++; pStats[ln].grpL++; }
        else { pStats[wn].bktW++; pStats[ln].bktL++; }
        if(grpName){
          pStats[wn].grpCount[grpName]=(pStats[wn].grpCount[grpName]||0)+1;
          pStats[ln].grpCount[grpName]=(pStats[ln].grpCount[grpName]||0)+1;
        }
        if(g.map){
          if(!pStats[wn].maps[g.map])pStats[wn].maps[g.map]={w:0,l:0};
          if(!pStats[ln].maps[g.map])pStats[ln].maps[g.map]={w:0,l:0};
          pStats[wn].maps[g.map].w++; pStats[ln].maps[g.map].l++;
        }
      });
    });
  }
  (tn.groups||[]).forEach(grp=>{
    (grp.matches||[]).forEach(m=>countGames(m,'grp',grp.name||''));
  });
  // 브라켓 경기 포함
  const br=getBracket(tn);
  Object.values(br.matchDetails||{}).forEach(m=>countGames(m,'bkt'));
  (br.manualMatches||[]).forEach(m=>{if(m)countGames(m,'bkt');});
  if(!window._rankSort)window._rankSort={};
  const sk=window._rankSort['comp']||'w';
  const sorted=Object.entries(pStats)
    .map(([name,s])=>{
      const formAll=(s.form||[]).slice().sort((a,b)=>(a.d||'').localeCompare(b.d||''));
      const form=formAll.slice(-5);
      let bestMap='';
      const mapEntries=Object.entries(s.maps||{}).map(([mp,ms])=>({mp,w:ms.w,l:ms.l,t:ms.w+ms.l}));
      if(mapEntries.length){
        mapEntries.sort((a,b)=>b.t-a.t||b.w-a.w);
        bestMap=mapEntries[0].mp;
      }
      // 연승/연패 스트릭 (최근 경기 기준)
      let streak=0,streakWin=null;
      for(let i=formAll.length-1;i>=0;i--){
        if(streakWin===null){streakWin=formAll[i].win;streak=1;}
        else if(formAll[i].win===streakWin){streak++;}
        else break;
      }
      // 주 소속 조 (가장 많이 경기한 조)
      let grpName='';
      const grpEntries=Object.entries(s.grpCount||{});
      if(grpEntries.length){grpEntries.sort((a,b)=>b[1]-a[1]);grpName=grpEntries[0][0];}
      return {name,w:s.w,l:s.l,total:s.w+s.l,rate:s.w+s.l?Math.round(s.w/(s.w+s.l)*100):0,
        form,bestMap,bestMapStat:mapEntries[0]||null,
        grpW:s.grpW,grpL:s.grpL,bktW:s.bktW,bktL:s.bktL,streak,streakWin,grpName};
    })
    .filter(p=>p.total>0)
    .sort((a,b)=>sk==='w'?b.w-a.w||b.rate-a.rate:sk==='l'?b.l-a.l||a.rate-b.rate:b.rate-a.rate||b.w-a.w);
  const sortBar=`<div class="sort-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap"><button class="sort-btn ${sk==='w'?'on':''}" onclick="window._rankSort['comp']='w';render()">승순</button><button class="sort-btn ${sk==='rate'?'on':''}" onclick="window._rankSort['comp']='rate';render()">승률순</button><button class="sort-btn ${sk==='l'?'on':''}" onclick="window._rankSort['comp']='l';render()">패순</button></div>`;
  if(!sorted.length) return sortBar+`<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:var(--r)">⏳ 아직 기록된 경기 결과가 없습니다.</div>`;
  if(!window._rankPage)window._rankPage={};
  const _PK='comp_rank';
  const _PAGE=20;
  if(window._rankPage[_PK]===undefined)window._rankPage[_PK]=0;
  const _tot=sorted.length;
  const _totP=Math.ceil(_tot/_PAGE)||1;
  if(window._rankPage[_PK]>=_totP)window._rankPage[_PK]=0;
  const _cp=window._rankPage[_PK];
  const _paged=_tot>_PAGE?sorted.slice(_cp*_PAGE,(_cp+1)*_PAGE):sorted;
  let h=sortBar+`<div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:var(--blue);margin-bottom:14px">🏅 ${tn.name} 개인 순위</div>
  <table><thead><tr><th style="text-align:left">순위</th><th style="text-align:left">이름</th><th style="text-align:left">소속</th><th>승</th><th>패</th><th>승차</th><th>승률</th><th>조별리그</th><th>대진표</th><th style="text-align:left">소속 조</th><th style="text-align:left">베스트맵</th><th>연속</th><th>최근 폼</th></tr></thead><tbody>`;
  _paged.forEach((p,i)=>{
    const pObj=players.find(x=>x.name===p.name);const col=pObj?gc(pObj.univ):'#888';
    const diff=p.w-p.l;
    const _ri=_cp*_PAGE+i;
    const formHTML=(p.form||[]).map(f=>`<span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:4px;font-size:9px;font-weight:900;color:#fff;background:${f.win?'var(--red)':'var(--text3)'}">${f.win?'승':'패'}</span>`).join('');
    const bestMapHTML=p.bestMapStat?`<span style="font-size:var(--fs-caption);font-weight:700;color:var(--text2)">🗺️ ${p.bestMap} <span style="color:var(--gray-l)">(${p.bestMapStat.w}승${p.bestMapStat.l}패)</span></span>`:'<span style="color:var(--gray-l)">-</span>';
    const grpHTML=p.grpName?`<span style="font-size:var(--fs-caption);font-weight:700;color:var(--text2)">${p.grpName}</span>`:'<span style="color:var(--gray-l)">-</span>';
    const streakHTML=p.streak?`<span style="font-size:var(--fs-caption);font-weight:900;color:${p.streakWin?'var(--red)':'var(--text3)'}">${p.streak}${p.streakWin?'연승':'연패'}</span>`:'<span style="color:var(--gray-l)">-</span>';
    h+=`<tr>
      <td style="text-align:left">${_ri===0?`<span class="rk1">1등</span>`:_ri===1?`<span class="rk2">2등</span>`:_ri===2?`<span class="rk3">3등</span>`:`${_ri+1}위`}</td>
      <td style="text-align:left"><span style="display:inline-flex;align-items:center;gap:7px">${typeof getPlayerPhotoHTML==='function'?getPlayerPhotoHTML(p.name,'34px'):''}<span class="clickable-name" style="font-weight:700;font-size:14px" onclick="openPlayerModal('${escJS(p.name)}')">${p.name}</span></span></td>
      <td style="text-align:left">${pObj?`<span class="ubadge" style="background:${col};font-size:var(--fs-caption)">${pObj.univ}</span>`:'-'}</td>
      <td class="wt" style="font-weight:800">${p.w}</td><td class="lt" style="font-weight:800">${p.l}</td>
      <td style="font-weight:800;color:${diff>0?'var(--red)':diff<0?'var(--text3)':'var(--gray-l)'}">${diff>=0?'+':''}${diff}</td>
      <td style="font-weight:700;color:${p.rate>=50?'var(--red)':'var(--text3)'}">${p.total?p.rate+'%':'-'}</td>
      <td style="font-size:var(--fs-caption);color:var(--text3)">${p.grpW||p.grpL?`${p.grpW}승${p.grpL}패`:'-'}</td>
      <td style="font-size:var(--fs-caption);color:var(--text3)">${p.bktW||p.bktL?`${p.bktW}승${p.bktL}패`:'-'}</td>
      <td style="text-align:left">${grpHTML}</td>
      <td style="text-align:left">${bestMapHTML}</td>
      <td>${streakHTML}</td>
      <td><span style="display:inline-flex;gap:2px">${formHTML||'<span style="color:var(--gray-l);font-size:var(--fs-caption)">-</span>'}</span></td>
    </tr>`;
  });
  const _pageNav=_tot>_PAGE?`<div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap">
  <button class="btn btn-sm" ${_cp===0?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp-1};render()">← 이전</button>
  <span style="font-size:var(--fs-sm);color:var(--gray-l)">${_cp+1} / ${_totP} (${_tot}명)</span>
  <button class="btn btn-sm" ${_cp>=_totP-1?'disabled':''} onclick="if(!window._rankPage)window._rankPage={};window._rankPage['${_PK}']=${_cp+1};render()">다음 →</button>
</div>`:'';
  return h+`</tbody></table>`+_pageNav;
}

function grpToggleTierFilter(t){
  if(!window._grpTierFilters)window._grpTierFilters=[];
  const i=window._grpTierFilters.indexOf(t);
  if(i>=0)window._grpTierFilters.splice(i,1);else window._grpTierFilters.push(t);
  render();
}

function rCompGrpEdit(){
  if(!isLoggedIn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">로그인 후 이용 가능합니다.</div>`;
  if(grpSub==='edit'&&grpEditId) return rGrpEditInner();
  if(!window._grpTierFilters)window._grpTierFilters=[];
  const tfs=window._grpTierFilters;
  let h=`<div class="grp-edit-header" style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:var(--blue)">🏗️ 대회 조편성 관리</span>
      <button class="btn btn-b btn-sm" style="margin-left:auto" onclick="grpNewTourney()">+ 새 대회 만들기</button>
    </div>
    <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap">
      <span style="font-size:var(--fs-caption);font-weight:700;color:var(--gray-l)">출전 티어:</span>
      <button class="tier-filter-btn ${tfs.length===0?'on':''}" onclick="window._grpTierFilters=[];render()">전체</button>
      ${TIERS.map(t=>{const _bg=getTierBtnColor(t),_tc=getTierBtnTextColor(t),_on=tfs.includes(t);return`<button class="tier-filter-btn ${_on?'on':''}" style="${_on?`background:${_bg};color:${_tc};border-color:${_bg}`:''}" onclick="grpToggleTierFilter('${t}')">${getTierLabel(t)}</button>`;}).join('')}
    </div>
  </div>`;
  if(!tourneys.length){h+=`<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:var(--r);border:2px dashed var(--border2)">등록된 대회가 없습니다.<br><button class="btn btn-b btn-sm" style="margin-top:10px" onclick="grpNewTourney()">+ 첫 대회 만들기</button></div>`;return h;}
  tourneys.forEach((tn,ti)=>{
    const isActive=tn.name===curComp;
    const gCount=(tn.groups||[]).length;
    const mCount=(tn.groups||[]).reduce((s,g)=>s+(g.matches||[]).length,0);
    const mDone=(tn.groups||[]).reduce((s,g)=>s+(g.matches||[]).filter(m=>m.sa!=null&&m.sb!=null).length,0);
    h+=`<div style="background:${isActive?'var(--blue-l)':'var(--surface)'};border:${isActive?'2px solid var(--blue)':'1px solid var(--border)'};border-radius:12px;padding:12px 16px;margin-bottom:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md)">${isActive?'📌 ':''}${tn.name}</span>
      <span style="font-size:var(--fs-caption);color:var(--gray-l)">${gCount?`${gCount}개조 · ${mDone}/${mCount}경기 완료`:'조 없음'}</span>
      <div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        ${!isActive?`<button class="btn btn-w btn-xs" onclick="curComp='${escJS(tn.name)}';save();render()">현재 대회로</button>`:''}
        <button class="btn btn-b btn-sm" onclick="grpEditId='${tn.id}';grpSub='edit';render()">📝 조편성 편집</button>
        <button class="btn btn-r btn-xs" onclick="grpDelTourney(${ti})" title="삭제" style="padding:5px 8px">🗑️</button>
      </div>
    </div>`;
  });
  return h;
}

function rGrpEditInner(){
  const tn=tourneys.find(t=>t.id===grpEditId);
  if(!tn){grpSub='list';render();return '';}
  const isTier=tn.type==='tier';
  const _memberLbl=isTier?'선수':'대학';
  const _memberUnit=isTier?'명':'개';
  const GL='ABCDEFGHIJ';
  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
    <button class="btn btn-w btn-sm" onclick="grpSub='list';render()">← 목록</button>
    <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:16px">🏆 ${tn.name} — 조편성</span>
    <button class="btn btn-b btn-sm" style="margin-left:auto" onclick="grpAddGroup('${tn.id}')">+ ${GL[tn.groups.length]||'?'}조 추가</button>
  </div>`;
  if(!tn.groups.length){
    h+=`<div style="text-align:center;padding:50px;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:32px;margin-bottom:12px">🏆</div>
      <div style="font-weight:700;margin-bottom:10px">A조부터 순차적으로 조를 만들어주세요</div>
      <button class="btn btn-b" onclick="grpAddGroup('${tn.id}')">+ GROUP A조 만들기</button>
    </div>`;
    return h;
  }
  tn.groups.forEach((grp,gi)=>{
    const gl=GL[gi]||gi;const col=['var(--blue)','var(--red)','var(--green)','var(--gold)','var(--god)','#0891b2'][gi%6];
    const availU=isTier
      ?(players||[]).filter(p=>p.name&&!grp.univs.includes(p.name)).map(p=>p.name)
      :getAllUnivs().filter(u=>!u.dissolved).map(u=>u.name).filter(n=>!grp.univs.includes(n));
    const _badgeCol=(name)=>isTier?gc((players||[]).find(p=>p.name===name)?.univ||''):gc(name);
    const _gKey=`${tn.id}_${gi}`;
    const _gOpen=_grpOpen(_gKey);
    h+=`<details class="grp-acc" ${_gOpen?'open':''} ontoggle="_grpToggle('${_gKey}',this)" style="background:${col}08;border:2px solid ${col}44;border-radius:12px;margin-bottom:12px;overflow:hidden">
      <summary style="cursor:pointer;list-style:none;outline:none;-webkit-appearance:none;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 16px">
        <span style="background:${col};color:#fff;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;padding:3px 16px;border-radius:20px">GROUP ${gl}조</span>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">${grp.univs.length}${_memberUnit} ${_memberLbl} · ${(grp.matches||[]).length}경기</span>
        <span class="grp-acc-toggle" style="font-size:var(--fs-caption);color:var(--gray-l)">${_gOpen?'▴ 접기':'▾ 펼치기'}</span>
        <button class="btn btn-r btn-xs" style="margin-left:auto" onclick="event.preventDefault();event.stopPropagation();grpDelGroup('${tn.id}',${gi})">조 삭제</button>
      </summary>
      <div style="padding:2px 16px 16px">
      <div style="margin-bottom:14px">
        <div style="font-size:var(--fs-sm);font-weight:700;color:${col};margin-bottom:8px">① ${_memberLbl} 선택</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
          ${grp.univs.map((u,ui)=>`<span class="ubadge" style="background:${_badgeCol(u)};font-size:var(--fs-sm)">${u}<button onclick="grpRemoveUniv('${tn.id}',${gi},${ui})" style="background:rgba(255,255,255,.3);border:none;border-radius:50%;color:#fff;width:16px;height:16px;font-size:9px;cursor:pointer;margin-left:3px;line-height:16px;text-align:center">×</button></span>`).join('')}
          ${!grp.univs.length?`<span style="color:var(--gray-l);font-size:var(--fs-sm)">아직 없음</span>`:''}
        </div>
        ${availU.length?`<input type="text" id="grp-univ-search-${gi}" placeholder="🔍 ${_memberLbl} 검색 후 클릭해서 추가" style="width:100%;padding:6px 10px;font-size:var(--fs-sm);border:1px solid var(--border2);border-radius:6px;margin-bottom:6px" oninput="grpFilterUnivChips('${tn.id}',${gi})" onkeydown="if(event.key==='Enter'){event.preventDefault();grpAddFirstVisible('${tn.id}',${gi});}">
        <div id="grp-univ-chips-${gi}" style="display:flex;gap:5px;flex-wrap:wrap;max-height:130px;overflow-y:auto;padding:2px">
          ${availU.map(u=>`<button type="button" class="grp-add-chip" data-name="${escAttr(u.toLowerCase())}" onclick="grpAddUniv('${tn.id}',${gi},'${escJS(u)}')" style="padding:4px 10px;font-size:var(--fs-caption);border:1px solid var(--border2);border-radius:14px;background:var(--white);cursor:pointer;white-space:nowrap">+ ${u}</button>`).join('')}
        </div>`:`<div style="font-size:var(--fs-caption);color:var(--gray-l)">모든 ${_memberLbl}이 추가됨</div>`}
      </div>
      <div>
        <div style="font-size:var(--fs-sm);font-weight:700;color:${col};margin-bottom:8px">② 경기 일정 (${(grp.matches||[]).length}경기 등록)</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin:-2px 0 10px">
          <button class="btn btn-p btn-xs" onclick="openCompLeaguePasteModal('${tn.id}',${gi})">📋 경기 결과 붙여넣기</button>
          <span style="font-size:var(--fs-caption);color:var(--gray-l);align-self:center">※ 해당 조에 경기(1줄=1게임)를 일괄 추가</span>
        </div>
        ${(grp.matches||[]).length?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">${grp.matches.map((m,mi)=>{
          const isDone=m.sa!=null&&m.sb!=null;
          const ca=isTier?gc((players||[]).find(p=>p.name===m.a)?.univ||''):gc(m.a||'');
          const cb=isTier?gc((players||[]).find(p=>p.name===m.b)?.univ||''):gc(m.b||'');
          const aWin=isDone&&Number(m.sa)>Number(m.sb), bWin=isDone&&Number(m.sb)>Number(m.sa);
          const aLogo = isTier ? '' : gUI(m.a||'', '14px');
          const bLogo = isTier ? '' : gUI(m.b||'', '14px');
          return `<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:7px 12px;font-size:var(--fs-sm);display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="font-size:10px;font-weight:700;color:${col}">${gl}조 ${mi+1}경기</span>
            ${m.d?`<span style="font-size:var(--fs-caption);font-weight:600;color:var(--text3)">${m.d.slice(2).replace(/-/g,'/')}</span>`:''}
            <span style="display:inline-flex;align-items:center;gap:5px;background:${ca||'#888'};color:#fff;padding:${aWin?'2px 9px':'1px 7px'};border-radius:6px;font-size:${aWin?'11px':'10px'};font-weight:900;transform:${bWin?'scale(.94)':'none'};opacity:${bWin?'.76':'1'}">${aLogo}${m.a||'?'}</span>
            <span style="color:var(--gray-l)">vs</span>
            <span style="display:inline-flex;align-items:center;gap:5px;background:${cb||'#888'};color:#fff;padding:${bWin?'2px 9px':'1px 7px'};border-radius:6px;font-size:${bWin?'11px':'10px'};font-weight:900;transform:${aWin?'scale(.94)':'none'};opacity:${aWin?'.76':'1'}">${bLogo}${m.b||'?'}</span>
            ${isDone?`<span style="font-weight:800;font-size:var(--fs-sm)"><span class="wt">${m.sa}</span>:<span class="lt">${m.sb}</span></span>`:'<span style="font-size:10px;color:var(--gray-l)">예정</span>'}
            <button class="btn btn-b btn-xs" onclick="grpEditMatch('${tn.id}',${gi},${mi})">✏️ 결과입력</button>
            <button class="btn btn-r btn-xs" onclick="grpDelMatch('${tn.id}',${gi},${mi})">×</button>
          </div>`;
        }).join('')}</div>`:''}
        ${grp.univs.length>=2?`<button class="btn btn-b btn-sm" onclick="grpAddMatch('${tn.id}',${gi})">+ ${gl}조 경기 추가</button>`:`<span style="font-size:var(--fs-caption);color:var(--gray-l)">※ ${_memberLbl} 2${_memberUnit} 이상 추가 후 경기 등록 가능</span>`}
      </div>
      </div>
    </details>`;
  });
  return h;
}


/* ══════════════════════════════════════
   브라켓 경기 상세 입력
══════════════════════════════════════ */
