/* ══════════════════════════════════════
   성적 관리
══════════════════════════════════════ */
let totalRaceFilter='전체'; // 스트리머 탭 종족 필터
let totalSearch=''; // 스트리머 탭 이름 검색
let totalHideNoRecord=true; // 전적 없는 선수 숨기기
let totalShowRetired=false; // 은퇴 선수 표시

function rTotal(C,T){
  T.innerText='🎬 전체 스타크래프트 스트리머 리스트';
  const raceOpts=['전체','T','Z','P','N'];
  let filterBar=`<div class="fbar" style="margin-bottom:16px;flex-wrap:wrap;gap:6px">
    <strong style="font-size:11px;color:var(--gray-l)">종족:</strong>
    ${raceOpts.map(r=>`<button class="pill ${totalRaceFilter===r?'on':''}" onclick="totalRaceFilter='${r}';render()">${r==='전체'?'전체':RNAME[r]||r}</button>`).join('')}
    <button class="pill ${totalHideNoRecord?'on':''}" onclick="totalHideNoRecord=!totalHideNoRecord;render()" style="${totalHideNoRecord?'background:#f59e0b;border-color:#f59e0b;color:#fff':''}">전적없는 선수 숨기기</button>
    <button class="pill ${totalShowRetired?'on':''}" onclick="totalShowRetired=!totalShowRetired;render()" style="${totalShowRetired?'background:#6b7280;border-color:#6b7280;color:#fff':''}">🎗️ 은퇴 선수 포함</button>
    <div style="margin-left:auto;position:relative;display:inline-block">
      <input type="text" id="total-search" value="${totalSearch}" placeholder="🔍 이름/대학/종족/성별 검색..."
        oninput="(function(inp){totalSearch=inp.value;window._searchFocusId='total-search';clearTimeout(window._totalSearchTm);window._totalSearchTm=setTimeout(function(){render();window._searchFocusId=null;},200);})(this)"
        style="padding:4px 10px;border:1px solid var(--border2);border-radius:6px;font-size:12px;width:130px">
    </div>
  </div>`;

    let tableHTML=`<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%"><table style="table-layout:fixed;width:100%"><colgroup>
    <col style="width:80px"><col style="width:60px"><col style="width:220px">
    <col style="width:52px"><col style="width:52px">
    <col style="width:70px"><col style="width:80px"><col style="width:60px">
    ${isLoggedIn?'<col style="width:70px">':''}
  </colgroup><thead><tr>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">티어</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 8px">종족</th>
    <th style="text-align:left;padding:8px 12px">스트리머</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">승</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">패</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">승률</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">포인트</th>
    <th class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:8px 10px">ELO</th>
    ${isLoggedIn?'<th class="no-export" style="text-align:center;white-space:nowrap;padding:8px 10px">관리</th>':''}
  </tr></thead><tbody>`;

  let totalShown=0;
  getAllUnivs().filter(u=>isLoggedIn||!u.hidden).forEach(u=>{
    const _isHiddenUniv=isLoggedIn&&u.hidden;
    let up=players.filter(p=>p.univ===u.name);
    if(totalRaceFilter!=='전체') up=up.filter(p=>p.race===totalRaceFilter);
    if(totalSearch.trim()){
      const _tsq=totalSearch.trim().toLowerCase();
      const _RMAP={'테란':'T','테':'T','저그':'Z','저':'Z','프로토스':'P','프토':'P','프':'P'};
      const _GMAP={'여':'F','여자':'F','남':'M','남자':'M'};
      const _toks=_tsq.split(/\s+/).filter(Boolean);
      let _rf='',_gf='',_nts=[];
      _toks.forEach(t=>{if(_RMAP[t])_rf=_RMAP[t];else if(_GMAP[t])_gf=_GMAP[t];else _nts.push(t);});
      up=up.filter(p=>{
        const nm=_nts.length===0||_nts.every(t=>
          p.name.toLowerCase().includes(t)||(p.univ||'').toLowerCase().includes(t)||
          (p.tier||'').toLowerCase().includes(t)||(p.role||'').toLowerCase().includes(t)
        );
        return nm&&(!_rf||p.race===_rf)&&(!_gf||p.gender===_gf);
      });
    }
    if(!totalShowRetired) up=up.filter(p=>!p.retired);
    if(totalHideNoRecord) up=up.filter(p=>(p.win+p.loss)>0);
    if(!up.length)return;
    totalShown+=up.length;
    tableHTML+=`<tr class="ugrp" style="--c:${u.color};${_isHiddenUniv?'opacity:.55;':''}"><td colspan="${isLoggedIn?9:8}">
      <span class="clickable-univ" onclick="openUnivModal('${u.name}')" style="color:#fff;font-size:14px;display:inline-flex;align-items:center;gap:4px">${gUI(u.name,'18px')}${u.name}</span>
      ${u.dissolved?`<span style="font-size:10px;background:rgba(0,0,0,.35);color:#fca5a5;border-radius:4px;padding:1px 6px;margin-left:4px;font-weight:700">🏚️ 해체${u.dissolvedDate?' '+u.dissolvedDate:''}</span>`:''}
      ${_isHiddenUniv?`<span style="font-size:10px;background:rgba(0,0,0,.4);border-radius:4px;padding:1px 6px;margin-left:4px;font-weight:700">🚫 방문자 숨김</span>`:''}
      <span style="font-size:11px;color:rgba(255,255,255,.75);margin-left:6px">(${up.length}명)</span>
    </td></tr>`;
    const sorted=(typeof _getBoardPlayers==='function')
      ? _getBoardPlayers(u.name).filter(p=>{
          if(!totalShowRetired&&p.retired)return false;
          if(totalRaceFilter!=='전체'&&p.race!==totalRaceFilter)return false;
          if(totalSearch.trim()){
            const _tsq2=totalSearch.trim().toLowerCase();
            const _RMAP2={'테란':'T','테':'T','저그':'Z','저':'Z','프로토스':'P','프토':'P','프':'P'};
            const _GMAP2={'여':'F','여자':'F','남':'M','남자':'M'};
            const _toks2=_tsq2.split(/\s+/).filter(Boolean);
            let _rf2='',_gf2='',_nts2=[];
            _toks2.forEach(t=>{if(_RMAP2[t])_rf2=_RMAP2[t];else if(_GMAP2[t])_gf2=_GMAP2[t];else _nts2.push(t);});
            const _nm2=_nts2.length===0||_nts2.every(t=>
              p.name.toLowerCase().includes(t)||(p.univ||'').toLowerCase().includes(t)||
              (p.tier||'').toLowerCase().includes(t)||(p.role||'').toLowerCase().includes(t)
            );
            if(!(_nm2&&(!_rf2||p.race===_rf2)&&(!_gf2||p.gender===_gf2)))return false;
          }
          if(totalHideNoRecord&&!(p.win+p.loss))return false;
          return true;
        })
      : [...up].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||b.points-a.points);
    // 직책자와 일반 선수 분리
    const _rolePl = sorted.filter(p=>p.role&&MAIN_ROLES.includes(p.role));
    const _normalPl = sorted.filter(p=>!p.role||!MAIN_ROLES.includes(p.role));
    const _displayList = _rolePl.length ? [..._rolePl, null, ..._normalPl] : _normalPl; // null = 구분자
    let lt='';
    let _inRoleSection = _rolePl.length > 0;
    if(_inRoleSection) tableHTML+=`<tr class="tgrp" style="--c:${u.color||'#6366f1'}"><td colspan="${isLoggedIn?9:8}" style="background:${(u.color||'#6366f1')}22;color:${u.color||'#6366f1'}">👑 직책자 (${_rolePl.length}명)</td></tr>`;
    _displayList.forEach(p=>{
      if(p===null){
        // 구분자 - 직책 섹션 끝, 일반 선수 시작
        _inRoleSection=false; lt='';
        if(_normalPl.length) tableHTML+=`<tr class="tgrp" style="--c:${u.color||'#6366f1'}"><td colspan="${isLoggedIn?9:8}">▷ 일반 선수 (${_normalPl.length}명)</td></tr>`;
        return;
      }
      if(!_inRoleSection && p.tier!==lt){lt=p.tier;tableHTML+=`<tr class="tgrp"><td colspan="${isLoggedIn?9:8}">▷ ${getTierLabel(p.tier)}</td></tr>`;}
      const wr=(p.win+p.loss)?Math.round(p.win/(p.win+p.loss)*100):0;
      tableHTML+=`<tr>
        <td style="text-align:center;white-space:nowrap;padding:7px 10px">${getTierBadge(p.tier)}</td>
        <td style="text-align:center;white-space:nowrap;padding:7px 8px"><span class="rbadge r${p.race}">${p.race}</span></td>
        <td style="text-align:left;padding:6px 12px;white-space:nowrap">
          <span style="display:inline-flex;align-items:center;gap:8px">
            ${p.photo?`<img src="${p.photo}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid var(--border);flex-shrink:0" onerror="this.style.display='none'">`:'<span style="display:inline-block;width:32px;height:32px;border-radius:50%;background:var(--border2);border:2px solid var(--border);flex-shrink:0"></span>'}
            <span style="font-weight:600">${p.role?`${getRoleBadgeHTML(p.role,'10px')} `:''}<span class="clickable-name" onclick="openPlayerModal('${p.name}')">${p.name}</span>${p.retired?'<span style="font-size:10px;background:#e2e8f0;color:#64748b;border-radius:4px;padding:1px 5px;margin-left:4px;font-weight:700">🎗️ 은퇴</span>':''}${genderIcon(p.gender)}${getStatusIconHTML(p.name)}</span>
          </span>
        </td>
        <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:7px 10px" class="wt">${p.win}</td>
        <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:7px 10px" class="lt">${p.loss}</td>
        <td style="text-align:center;white-space:nowrap;padding:7px 10px;font-weight:700;color:${(p.win+p.loss)===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">
          ${(p.win+p.loss)?wr+'%':'-'}${(p.win+p.loss)?`<br><span style="font-size:9px;color:var(--gray-l);font-weight:400">${p.win+p.loss}전</span>`:''}
        </td>
        <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:7px 10px;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px" class="${pC(p.points)}">${pS(p.points)}</td>
        <td class="col-hide-mobile" style="text-align:center;white-space:nowrap;padding:7px 10px;font-family:'Noto Sans KR',sans-serif;font-weight:700;font-size:12px;color:${(p.elo||1200)>=1200?'#2563eb':'#dc2626'}">${p.elo||1200}</td>
        ${isLoggedIn?`<td class="no-export" style="text-align:center;white-space:nowrap;padding:7px 8px">${adminBtn(`<button class="btn btn-w btn-xs" onclick="openEP('${p.name}')">✏️ 수정</button>`)}</td>`:''}
      </tr>`;
    });
  });
  if(totalShown===0){
    tableHTML+=`<tr><td colspan="${isLoggedIn?9:8}"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">검색 결과가 없습니다</div><div class="empty-state-desc">다른 검색어나 필터를 사용해보세요</div></div></td></tr>`;
  }
  tableHTML+=`</tbody></table></div>`;

  C.innerHTML = filterBar + tableHTML;
  injectUnivIcons(C);
  requestAnimationFrame(()=>injectUnivIcons(C));
  const si=C.querySelector('#total-search');
  if(si&&totalSearch){si.focus();si.setSelectionRange(si.value.length,si.value.length);}
}

/* ══════════════════════════════════════
   티어 순위표
══════════════════════════════════════ */
let tierRankMode='tier'; // tier | winstreak | wins | revstreak | winrate | recent

function rTier(C,T){
  T.innerText='📊 티어 순위표';
  const allU=getAllUnivs();
  const F=document.getElementById('farea');
  // 모드 버튼
  const modes=[
    {id:'tier',lbl:'📊 티어순'},
    {id:'wins',lbl:'🏆 다승순'},
    {id:'winstreak',lbl:'🔥 승차순'},
    {id:'winrate',lbl:'📈 승률순'},
    {id:'revstreak',lbl:'❄️ 역승차순'},
    {id:'recent',lbl:'🕐 최근 경기'},
  ];
  const modeSortBtns=[
    {id:'mini_win',lbl:'⚡ 미니대전 승순',color:'#7c3aed'},
    {id:'mini_loss',lbl:'⚡ 미니대전 패순',color:'#7c3aed'},
    {id:'ck_win',lbl:'🤝 대학CK 승순',color:'#dc2626'},
    {id:'ck_loss',lbl:'🤝 대학CK 패순',color:'#dc2626'},
    {id:'comp_win',lbl:'🏆 대회 승순',color:'#d97706'},
    {id:'comp_loss',lbl:'🏆 대회 패순',color:'#d97706'},
  ];
  const allModeIds=new Set([...modes.map(m=>m.id),...modeSortBtns.map(m=>m.id)]);
  let fh=`<div class="fbar"><strong>보기:</strong>`;
  modes.forEach(m=>{fh+=`<button class="pill ${tierRankMode===m.id?'on':''}" onclick="tierRankMode='${m.id}';render()">${m.lbl}</button>`;});
  fh+=`</div>`;
  fh+=`<div class="fbar"><strong>유형별:</strong>`;
  modeSortBtns.forEach(m=>{
    const on=tierRankMode===m.id;
    fh+=`<button class="pill ${on?'on':''}" style="${on?`background:${m.color};border-color:${m.color};color:#fff`:''}" onclick="tierRankMode='${m.id}';render()">${m.lbl}</button>`;
  });
  fh+=`</div>`;
  if(tierRankMode!=='recent'){
    fh+=`<div class="fbar"><strong>대학:</strong><button class="pill ${fUniv==='전체'?'on':''}" onclick="sf('전체','${fTier}')">전체</button>`;
    allU.forEach(u=>{fh+=`<button class="pill ${fUniv===u.name?'on':''}" style="${fUniv===u.name?`background:${u.color};border-color:${u.color};color:#fff`:''}" onclick="sf('${u.name}','${fTier}')">${u.name}</button>`;});
    fh+=`</div><div class="fbar"><strong>티어:</strong><button class="pill ${fTier==='전체'?'on':''}" onclick="sf('${fUniv}','전체')">전체</button>`;
    TIERS.forEach(t=>{
    const _bc=getTierBtnColor(t),_bt=getTierBtnTextColor(t),_sel=fTier===t;
    fh+=`<button class="pill" style="border-color:${_bc};border-width:${_sel?'2':'1'}px;${_sel?`background:${_bc};color:${_bt};font-weight:700;`:'color:'+_bc+';'}" onmouseover="if(!${_sel})this.style.background='${_bc}22'" onmouseout="if(!${_sel})this.style.background=''" onclick="sf('${fUniv}','${t}')">${getTierPillLabel(t)}</button>`;
  });
    fh+=`</div>`;
    // 종족 필터 + 전적없는 선수 숨기기
    if(!window._tierRaceFilter) window._tierRaceFilter='전체';
    if(window._tierHideNoRecord===undefined) window._tierHideNoRecord=false;
    fh+=`<div class="fbar"><strong>종족:</strong>`;
    ['전체','T','Z','P'].forEach(r=>{
      fh+=`<button class="pill ${window._tierRaceFilter===r?'on':''}" onclick="window._tierRaceFilter='${r}';render()">${r==='전체'?'전체':r}</button>`;
    });
    fh+=`<button class="pill ${window._tierHideNoRecord?'on':''}" onclick="window._tierHideNoRecord=!window._tierHideNoRecord;render()" style="${window._tierHideNoRecord?'background:#f59e0b;border-color:#f59e0b;color:#fff':''}">전적없는 선수 숨기기</button>`;
    fh+=`</div>`;
  }
  F.innerHTML=fh;

  if(tierRankMode==='recent'){
    // 최근 경기 내역: 모든 대전에서 최근 게임 추출 (대회/티어대회 포함)
    const recentGames=[];
    function extractGames(matchList,label){
      matchList.forEach(m=>{
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(!g.playerA||!g.playerB||!g.winner)return;
            const wn=g.winner==='A'?g.playerA:g.playerB;
            const ln=g.winner==='A'?g.playerB:g.playerA;
            recentGames.push({date:m.d||'',winner:wn,loser:ln,map:g.map||'-',label:label||''});
          });
        });
      });
    }
    extractGames(miniM,'미니대전');
    extractGames(univM,'대학대전');
    extractGames(comps,'대회');
    extractGames(ckM,'대학CK');
    extractGames(proM,'프로리그');
    // 조별리그 대회 경기 포함
    const tourItems=typeof getTourneyMatches==='function'?getTourneyMatches():[];
    extractGames(tourItems,'조별대회');
    // 티어대회 포함
    if(ttM&&ttM.length) extractGames(ttM,'티어대회');
    recentGames.sort((a,b)=>b.date.localeCompare(a.date));

    // 종족 필터 상태
    if(!window._recentRaceFilter) window._recentRaceFilter='전체';
    // 티어 필터 상태
    if(!window._recentTierFilter) window._recentTierFilter='전체';

    let filtered=recentGames;
    if(window._recentRaceFilter!=='전체'){
      filtered=filtered.filter(g=>{
        const wp=players.find(p=>p.name===g.winner);
        const lp=players.find(p=>p.name===g.loser);
        return (wp&&wp.race===window._recentRaceFilter)||(lp&&lp.race===window._recentRaceFilter);
      });
    }
    if(window._recentTierFilter!=='전체'){
      filtered=filtered.filter(g=>{
        const wp=players.find(p=>p.name===g.winner);
        const lp=players.find(p=>p.name===g.loser);
        return (wp&&wp.tier===window._recentTierFilter)||(lp&&lp.tier===window._recentTierFilter);
      });
    }

    let fh=`<div class="fbar"><strong>종족:</strong>`;
    ['전체','T','Z','P'].forEach(r=>{
      fh+=`<button class="pill ${window._recentRaceFilter===r?'on':''}" onclick="window._recentRaceFilter='${r}';render()">${r==='전체'?'전체':r}</button>`;
    });
    fh+=`<strong style="margin-left:8px">티어:</strong><button class="pill ${window._recentTierFilter==='전체'?'on':''}" onclick="window._recentTierFilter='전체';render()">전체</button>`;
    TIERS.forEach(t=>{
    const _bc=getTierBtnColor(t),_bt=getTierBtnTextColor(t),_sel=window._recentTierFilter===t;
    fh+=`<button class="pill" style="border-color:${_bc};border-width:${_sel?'2':'1'}px;${_sel?`background:${_bc};color:${_bt};font-weight:700;`:'color:'+_bc+';'}" onmouseover="if(!${_sel})this.style.background='${_bc}22'" onmouseout="if(!${_sel})this.style.background=''" onclick="window._recentTierFilter='${t}';render()">${getTierPillLabel(t)}</button>`;
  });
    fh+=`</div>`;
    F.innerHTML+=fh;

    let h=`<div style="font-size:11px;color:var(--gray-l);margin-bottom:8px">총 ${filtered.length}건</div>`;
    h+=`<table><thead><tr><th>날짜</th><th>종류</th><th>승자</th><th>패자</th><th>맵</th></tr></thead><tbody>`;
    if(!filtered.length)h+=`<tr><td colspan="5" style="padding:30px;color:var(--gray-l);text-align:center">경기 기록 없음</td></tr>`;
    filtered.slice(0,100).forEach(g=>{
      const wp=players.find(p=>p.name===g.winner);const lp=players.find(p=>p.name===g.loser);
      const wc=wp?gc(wp.univ):'#888';const lc=lp?gc(lp.univ):'#888';
      const lblColors={'미니대전':'#2563eb','대학대전':'#7c3aed','대회':'#d97706','대학CK':'#dc2626','프로리그':'#0891b2','조별대회':'#16a34a','티어대회':'#7c3aed'};
      const lblColor=lblColors[g.label]||'#6b7280';
      h+=`<tr>
        <td style="color:var(--gray-l);font-size:11px">${g.date}</td>
        <td><span style="background:${lblColor};color:#fff;padding:1px 7px;border-radius:4px;font-size:10px;font-weight:700">${g.label||'-'}</span></td>
        <td><span style="display:inline-flex;align-items:center;gap:5px;font-weight:800" class="wt">
          ${wp?getPlayerPhotoHTML(g.winner,'22px'):''}
          <span style="cursor:pointer" onclick="openPlayerModal('${g.winner.replace(/'/g,"\\'")}')">
            ${wp?`<span class="rbadge r${wp.race}" style="font-size:10px;margin-right:2px">${wp.race}</span>`:''}${g.winner}${getStatusIconHTML(g.winner)}</span></span>
          ${wp?`<span class="ubadge" style="background:${wc};font-size:10px;padding:1px 6px;margin-left:4px">${wp.univ}</span>`:''}</td>
        <td><span style="display:inline-flex;align-items:center;gap:5px;opacity:.75">
          ${lp?getPlayerPhotoHTML(g.loser,'22px'):''}
          <span style="cursor:pointer" onclick="openPlayerModal('${g.loser.replace(/'/g,"\\'")}')">
            ${lp?`<span class="rbadge r${lp.race}" style="font-size:10px;margin-right:2px">${lp.race}</span>`:''}${g.loser}</span></span>
          ${lp?`<span class="ubadge" style="background:${lc};font-size:10px;padding:1px 6px;margin-left:4px;opacity:.7">${lp.univ}</span>`:''}</td>
        <td style="color:var(--gray-l);font-size:11px">${g.map}</td>
      </tr>`;
    });
    C.innerHTML=h+`</tbody></table>`;
    return;
  }

  let list=[...players]; // 모든 선수 표시 (승패 기록 없어도)
  if(fUniv!=='전체')list=list.filter(p=>p.univ===fUniv);
  if(fTier!=='전체')list=list.filter(p=>p.tier===fTier);
  // 종족 필터 적용
  if(window._tierRaceFilter&&window._tierRaceFilter!=='전체') list=list.filter(p=>p.race===window._tierRaceFilter);
  // 전적없는 선수 숨기기
  if(window._tierHideNoRecord) list=list.filter(p=>(p.win+p.loss)>0);

  let _modePStats=null;
  if(tierRankMode==='tier') list.sort((a,b)=>TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||b.points-a.points);
  else if(tierRankMode==='wins') list.sort((a,b)=>b.win-a.win||a.loss-b.loss);
  else if(tierRankMode==='winrate'){
    list=list.filter(p=>(p.win+p.loss)>=1);
    list.sort((a,b)=>{const ra=(a.win+a.loss)?a.win/(a.win+a.loss):0;const rb=(b.win+b.loss)?b.win/(b.win+b.loss):0;return rb-ra||b.win-a.win;});
  }
  else if(tierRankMode==='winstreak'){
    // 승차: 승수 - 패수 (많을수록 상위)
    list.sort((a,b)=>(b.win-b.loss)-(a.win-a.loss)||b.win-a.win);
  }
  else if(tierRankMode==='revstreak'){
    // 역승차: 패수 - 승수 (많을수록 상위, 즉 승차 낮은 순)
    list.sort((a,b)=>(b.loss-b.win)-(a.loss-a.win)||b.loss-a.loss);
  }
  else if(tierRankMode==='elo'){
    list.sort((a,b)=>(b.elo||ELO_DEFAULT)-(a.elo||ELO_DEFAULT));
  }
  else if(tierRankMode==='mini_win'||tierRankMode==='mini_loss'){
    const _ps={};
    (miniM||[]).forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(g=>{
      let wn,ln;
      if(g.wName&&g.lName){wn=g.wName;ln=g.lName;}
      else if(g.playerA&&g.playerB&&g.winner){wn=g.winner==='A'?g.playerA:g.playerB;ln=g.winner==='A'?g.playerB:g.playerA;}
      else return;
      if(!_ps[wn])_ps[wn]={w:0,l:0};if(!_ps[ln])_ps[ln]={w:0,l:0};
      _ps[wn].w++;_ps[ln].l++;
    });});});
    _modePStats=_ps;
    list.sort((a,b)=>tierRankMode==='mini_win'?(_ps[b.name]?.w||0)-(_ps[a.name]?.w||0):(_ps[b.name]?.l||0)-(_ps[a.name]?.l||0));
  }
  else if(tierRankMode==='ck_win'||tierRankMode==='ck_loss'){
    const _ps={};
    (ckM||[]).forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(g=>{
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
      if(!_ps[wn])_ps[wn]={w:0,l:0};if(!_ps[ln])_ps[ln]={w:0,l:0};
      _ps[wn].w++;_ps[ln].l++;
    });});});
    _modePStats=_ps;
    list.sort((a,b)=>tierRankMode==='ck_win'?(_ps[b.name]?.w||0)-(_ps[a.name]?.w||0):(_ps[b.name]?.l||0)-(_ps[a.name]?.l||0));
  }
  else if(tierRankMode==='comp_win'||tierRankMode==='comp_loss'){
    const _ps={};
    function _cntGame(g){
      if(!g.playerA||!g.playerB||!g.winner)return;
      const wn=g.winner==='A'?g.playerA:g.playerB;const ln=g.winner==='A'?g.playerB:g.playerA;
      if(!_ps[wn])_ps[wn]={w:0,l:0};if(!_ps[ln])_ps[ln]={w:0,l:0};
      _ps[wn].w++;_ps[ln].l++;
    }
    (tourneys||[]).forEach(tn=>{
      (tn.groups||[]).forEach(grp=>{(grp.matches||[]).forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(_cntGame);});});});
      const _br=typeof getBracket==='function'?getBracket(tn):{};
      Object.values(_br.matchDetails||{}).forEach(m=>{(m.sets||[]).forEach(st=>{(st.games||[]).forEach(_cntGame);});});
    });
    _modePStats=_ps;
    list.sort((a,b)=>tierRankMode==='comp_win'?(_ps[b.name]?.w||0)-(_ps[a.name]?.w||0):(_ps[b.name]?.l||0)-(_ps[a.name]?.l||0));
  }

  const modeHeaders={
    tier:'포인트',wins:'승',winrate:'승률',winstreak:'승차',revstreak:'역승차',
    mini_win:'미니승',mini_loss:'미니패',ck_win:'CK승',ck_loss:'CK패',comp_win:'대회승',comp_loss:'대회패'
  };
  if(tierRankMode==='elo') tierRankMode='tier'; // ELO 제거 후 fallback
  const extraHeader=modeHeaders[tierRankMode]||'포인트';

  let h=`<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%"><table style="table-layout:auto;width:100%"><thead><tr>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">순위</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">티어</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">대학</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 8px">종족</th>
    <th style="text-align:left;padding:8px 12px">스트리머</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">승</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">패</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">승률</th>
    <th style="text-align:center;white-space:nowrap;padding:8px 10px">${extraHeader}</th>
  </tr></thead><tbody>`;
  list.forEach((p,i)=>{
    const col=gc(p.univ);const tot=p.win+p.loss;const wr=tot?Math.round(p.win/tot*100):0;
    let rnkHTML;
    if(i===0) rnkHTML=`<span class="rk1">1등</span>`;
    else if(i===1) rnkHTML=`<span class="rk2">2등</span>`;
    else if(i===2) rnkHTML=`<span class="rk3">3등</span>`;
    else rnkHTML=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px">${i+1}위</span>`;
    let extraVal='';
    if(tierRankMode==='tier') extraVal=`<span class="${pC(p.points)}" style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px">${pS(p.points)}</span>`;
    else if(tierRankMode==='wins') extraVal=`<span class="wt" style="font-size:15px;font-weight:800">${p.win}</span>`;
    else if(tierRankMode==='winrate') extraVal=`<span style="font-weight:700;color:${wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'}</span>`;
    else if(tierRankMode==='winstreak'){const diff=p.win-p.loss;extraVal=`<span style="font-weight:800;color:${diff>0?'var(--green)':diff<0?'var(--red)':'var(--gray-l)'}">${diff>0?'+':''}${diff}</span>`;}
    else if(tierRankMode==='revstreak'){const diff=p.loss-p.win;extraVal=`<span style="font-weight:800;color:${diff>0?'var(--red)':diff<0?'var(--green)':'var(--gray-l)'}">${diff>0?'+':''}${diff}</span>`;}
    else if(tierRankMode==='elo'){const e=p.elo||ELO_DEFAULT;extraVal=`<span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:${e>=1400?'#7c3aed':e>=1300?'var(--gold)':e>=1200?'var(--green)':'var(--red)'}">${e}</span>`;}
    else if(['mini_win','mini_loss','ck_win','ck_loss','comp_win','comp_loss'].includes(tierRankMode)){
      const _v=_modePStats?_modePStats[p.name]:null;
      const isWin=tierRankMode.endsWith('_win');
      const cnt=_v?(isWin?_v.w:_v.l):0;
      extraVal=`<span style="font-weight:800;color:${isWin?'#16a34a':'#dc2626'}">${cnt}</span>`;
    }
    const univIconHTML=(()=>{const url=UNIV_ICONS[p.univ]||(univCfg.find(x=>x.name===p.univ)||{}).icon||'';return url?`<img src="${url}" style="width:16px;height:16px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`:``})();
    h+=`<tr style="border-left:3px solid ${col};background:${gcHex8(p.univ,.06)}">
      <td style="text-align:center;white-space:nowrap;padding:7px 10px">${rnkHTML}</td>
      <td style="text-align:center;white-space:nowrap;padding:7px 10px">${getTierBadge(p.tier)}</td>
      <td style="text-align:center;white-space:nowrap;padding:7px 8px"><span class="ubadge clickable-univ" data-icon-done="1" style="background:${col};display:inline-flex;align-items:center;gap:4px" onclick="openUnivModal('${p.univ}')">${univIconHTML}${p.univ}</span></td>
      <td style="text-align:center;white-space:nowrap;padding:7px 8px"><span class="rbadge r${p.race}">${p.race}</span></td>
      <td style="text-align:left;padding:7px 12px;font-weight:700;white-space:nowrap"><span style="display:inline-flex;align-items:center;gap:6px">${getPlayerPhotoHTML(p.name,'32px')}<span class="clickable-name" onclick="openPlayerModal('${p.name}')">${p.name}</span>${genderIcon(p.gender)}${getStatusIconHTML(p.name)}</span></td>
      <td style="text-align:center;white-space:nowrap;padding:7px 10px" class="wt">${p.win}</td>
      <td style="text-align:center;white-space:nowrap;padding:7px 10px" class="lt">${p.loss}</td>
      <td style="text-align:center;white-space:nowrap;padding:7px 10px;font-weight:700;color:${tot===0?'var(--gray-l)':wr>=50?'var(--green)':'var(--red)'}">${tot?wr+'%':'-'}</td>
      <td style="text-align:center;white-space:nowrap;padding:7px 10px">${extraVal}</td>
    </tr>`;
  });
  C.innerHTML=h+`</tbody></table></div>`;
}
