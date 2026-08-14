/* ══════════════════════════════════════════════════════════════
   대전기록 - 방송형(스코어보드) 보기모드 (신규기능, 2026-08-14, histbroadcastview)
   시빌워/미니대전/대학대전/대학CK 기록탭에 실제 e스포츠 중계 그래픽풍
   스코어보드 카드를 추가한다. (history-tab-alt-views.js의 4종 보기모드에
   "📺 방송형"을 5번째 옵션으로 추가, 대상 탭에서만 노출)
   상단: 대회명 + 팀(대학) 로고/이름 + 스코어
   하단: 번호별 세부경기 목록 - 승자(팀 색상 강조) · 종족뱃지 · 패자
   ══════════════════════════════════════════════════════════════ */

function _bcSplitNames(v){
  return String(v||'').split(/[,+，]/).map(s=>s.trim()).filter(Boolean);
}
function _bcSideNames(g, side){
  if(!g) return [];
  if(side==='A'){
    if(Array.isArray(g.teamA) && g.teamA.length) return g.teamA.map(x=>typeof x==='string'?x:(x&&x.name)||'').filter(Boolean);
    if(g.a1 || g.a2) return [g.a1, g.a2].filter(Boolean);
    return _bcSplitNames(g.playerA);
  }
  if(Array.isArray(g.teamB) && g.teamB.length) return g.teamB.map(x=>typeof x==='string'?x:(x&&x.name)||'').filter(Boolean);
  if(g.b1 || g.b2) return [g.b1, g.b2].filter(Boolean);
  return _bcSplitNames(g.playerB);
}
// m(경기)의 세트/게임 배열을 [{winSide,aNames,bNames,map,si,gi,setCount}] 형태로 평탄화
// (양쪽 선수를 모두 보존해 맵 가운데 배치 + 양쪽 종족뱃지 + 승자 박스 표시에 사용)
// si/gi: 세트 인덱스·세트 내 경기 인덱스 (번호 라벨을 "N경기"/"N세트 M경기"로 표시하기 위함)
function _bcFlattenGames(m){
  const out=[];
  const sets=m.sets||[];
  const setCount=sets.length;
  sets.forEach((s,si)=>{
    (s.games||[]).forEach((g,gi)=>{
      if(!g) return;
      let winSide = (g.winner==='A'||g.winner==='B') ? g.winner : '';
      let aNames, bNames;
      if(g.wName && g.lName){
        if(g.playerA===g.wName){ aNames=[g.wName]; bNames=[g.lName]; winSide=winSide||'A'; }
        else if(g.playerB===g.wName){ aNames=[g.lName]; bNames=[g.wName]; winSide=winSide||'B'; }
        else { aNames=[g.wName]; bNames=[g.lName]; winSide=winSide||'A'; }
      } else {
        aNames=_bcSideNames(g,'A'); bNames=_bcSideNames(g,'B');
        if(!aNames.length || !bNames.length) return;
      }
      if(!aNames.length || !bNames.length) return;
      out.push({winSide: winSide||'', aNames, bNames, map:g.map||'', si, gi, setCount});
    });
  });
  // (확장, 2026-08-14) 세트/게임 기록이 없는 단판 기록(개인전·끝장전·대회 단판 등)은
  // 승자/패자(wName/lName) 또는 팀명(a/b)으로 1행짜리 목록을 만들어 방송형에서도 표시한다.
  if(!out.length){
    const w=String(m.wName||'').trim(), l=String(m.lName||'').trim();
    if(w && l) out.push({winSide:'A', aNames:[w], bNames:[l], map:m.map||'', si:0, gi:0, setCount:1});
  }
  return out;
}
// 세트제(세트가 2개 이상)면 "N세트 M경기", 아니면 "N경기"
function _bcGameNumLabel(g){
  const gameNo = (g.gi!=null ? g.gi+1 : 1);
  if(g.setCount>1) return `${(g.si!=null?g.si+1:1)}세트 ${gameNo}경기`;
  return `${gameNo}경기`;
}
function _bcRaceBadge(name){
  try{
    const p=(typeof players!=='undefined'?players:[]).find(x=>x&&x.name===name);
    if(p && (p.race==='T'||p.race==='P'||p.race==='Z')) return `<span class="rbadge r${p.race} bc-race">${p.race}</span>`;
  }catch(e){}
  return '';
}
// 헥스 컬러(#rrggbb) → "r,g,b" 문자열 (배경 그라디언트 rgba용)
function _bcHexToRgb(hex){
  const h=String(hex||'').replace('#','');
  if(h.length!==6) return '100,116,139';
  const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
  if(isNaN(r)||isNaN(g)||isNaN(b)) return '100,116,139';
  return `${r},${g},${b}`;
}
// 개별 매치(m) 1건을 방송 스코어보드 카드로 렌더
function _bcMatchCardHTML(type, d, m, typeInfo){
  const ti=(typeInfo&&typeInfo[type])||{lbl:type,col:'#64748b'};
  // (확장, 2026-08-14) 개인전/끝장전/대회·티어대회/프로리그 기록탭에서도 방송형을 쓰도록
  // 타입별 라벨/색상/썸네일 규칙을 분기한다.
  const isInd=(type==='ind'||type==='gj'||type==='progj'||type==='procomp'||type==='procompbkt'||type==='procompgj');
  const isFixedTeam=(type==='ck'||type==='pro'||type==='pcteam'||type==='procompteam');
  const rawLA=(m.teamALabel||'').replace(/^\$\{.*\}$/,'');
  const rawLB=(m.teamBLabel||'').replace(/^\$\{.*\}$/,'');
  let labelA, labelB;
  if(isInd){ labelA=String(m.wName||'A'); labelB=String(m.lName||'B'); }
  else if(isFixedTeam){ labelA=rawLA||m.a||'A팀'; labelB=rawLB||m.b||'B팀'; }
  else { labelA=m.a||rawLA||'A'; labelB=m.b||rawLB||'B'; }
  const _fixedKey = (type==='ck') ? 'ck' : (type==='pro'||type==='pcteam'||type==='procompteam') ? 'pro' : '';
  const _sideCols = (_fixedKey && typeof getFixedSideColors==='function') ? getFixedSideColors(_fixedKey) : null;
  const _playerCol=(n)=>{
    try{
      const pl=(typeof players!=='undefined'?players:[]).find(x=>x&&x.name===n);
      if(pl && pl.univ) return gc(pl.univ);
    }catch(e){}
    return typeof gc==='function' ? gc(n) : '#64748b';
  };
  const ca=_sideCols?_sideCols.a:(isInd?_playerCol(labelA):gc(labelA));
  const cb=_sideCols?_sideCols.b:(isInd?_playerCol(labelB):gc(labelB));
  let sa, sb;
  if(m.sa!=null && m.sa!=='' && m.sb!=null && m.sb!==''){ sa=m.sa; sb=m.sb; }
  else if(isInd){ sa=1; sb=0; }
  else { sa=0; sb=0; }
  const aWin=Number(sa)>Number(sb), bWin=Number(sb)>Number(sa);
  const dLabel=d?d.slice(2).replace(/-/g,'/'):'날짜 미정';
  const title=(m.t&&String(m.t).trim())?m.t:(m.compName&&String(m.compName).trim()?m.compName:(ti.lbl||''));
  const logoHTML=(n)=>{
    if(!n) return '';
    const url=(typeof UNIV_ICONS!=='undefined'&&UNIV_ICONS[n])||((typeof univCfg!=='undefined'&&univCfg.find(x=>x&&x.name===n))||{}).icon||'';
    if(url){
      const src=(typeof toHttpsUrl==='function')?toHttpsUrl(url):url;
      return `<img src="${src}" loading="lazy" class="bc-team-logo-img" onerror="this.style.display='none'">`;
    }
    // 선수(스트리머)명이면 프로필 사진으로 대체 (개인전/끝장전 등)
    try{
      if(typeof getPlayerPhotoHTML==='function' && typeof players!=='undefined'){
        const pl=players.find(x=>x&&x.name===n);
        if(pl) return getPlayerPhotoHTML(pl.name,'28px','border:none;',{lazy:true});
      }
    }catch(e){}
    return '';
  };
  const games=_bcFlattenGames(m);
  const rows = games.map((g)=>{
    const aIsWin = g.winSide==='A';
    const bIsWin = g.winSide==='B';
    const aName = g.aNames.join(' / ');
    const bName = g.bNames.join(' / ');
    const aRace = g.aNames.length===1 ? _bcRaceBadge(g.aNames[0]) : '';
    const bRace = g.bNames.length===1 ? _bcRaceBadge(g.bNames[0]) : '';
    const aClick = g.aNames.length===1?` onclick="openPlayerModal('${escJS(g.aNames[0])}')"`:'';
    const bClick = g.bNames.length===1?` onclick="openPlayerModal('${escJS(g.bNames[0])}')"`:'';
    const winBox = `<span class="bc-win-box">승</span>`;
    return `<div class="bc-game-row">
      <span class="bc-game-num">${_bcGameNumLabel(g)}</span>
      <span class="bc-game-side bc-game-side-a ${aIsWin?'is-win':''}"${aClick} style="--side-col:${ca}">
        <span class="bc-win-slot">${aIsWin?winBox:''}</span><span class="bc-name-wrap"><span class="bc-game-name">${aName}</span>${aRace}</span>
      </span>
      <span class="bc-game-map">${g.map?g.map:'-'}</span>
      <span class="bc-game-side bc-game-side-b ${bIsWin?'is-win':''}"${bClick} style="--side-col:${cb}">
        <span class="bc-name-wrap">${bRace}<span class="bc-game-name">${bName}</span></span><span class="bc-win-slot">${bIsWin?winBox:''}</span>
      </span>
    </div>`;
  }).join('');
  const _teamClick=(n)=>{
    if(isFixedTeam) return '';
    if(isInd) return ` onclick="openPlayerModal('${escJS(n)}')"`;
    return ` onclick="openUnivModal('${escJS(n)}')"`;
  };
  const aClickTeam = _teamClick(labelA);
  const bClickTeam = _teamClick(labelB);
  const rgbA=_bcHexToRgb(ca), rgbB=_bcHexToRgb(cb);
  return `<div class="bc-match-card" style="--bc-ca:${ca};--bc-cb:${cb};--bc-ca-rgb:${rgbA};--bc-cb-rgb:${rgbB}">
    <div class="bc-card-top">
      <div class="bc-match-meta">
        <span class="bc-match-title-badge" style="background:${ti.col}1f;color:${ti.col}">${ti.lbl}</span>
        <span class="bc-match-title-txt">${title}</span>
        <span class="bc-match-date">${dLabel}</span>
      </div>
      <div class="bc-scoreboard">
        <span class="bc-sb-spacer" aria-hidden="true"></span>
        <div class="bc-team bc-team-a ${aWin?'is-win':''}">
          ${logoHTML(isFixedTeam?'':labelA)}
          <span class="ubadge bc-team-badge clickable-univ" data-icon-done="1" style="background:${ca}"${aClickTeam}>${labelA}</span>
        </div>
        <div class="bc-score"><span class="${aWin?'wt':bWin?'lt':'pt-z'}">${sa}</span><span class="bc-score-sep">:</span><span class="${bWin?'wt':aWin?'lt':'pt-z'}">${sb}</span></div>
        <div class="bc-team bc-team-b ${bWin?'is-win':''}">
          <span class="ubadge bc-team-badge clickable-univ" data-icon-done="1" style="background:${cb}"${bClickTeam}>${labelB}</span>
          ${logoHTML(isFixedTeam?'':labelB)}
        </div>
      </div>
    </div>
    ${rows ? `<div class="bc-games">${rows}</div>` : `<div class="bc-games-empty">세부 경기 기록 없음</div>`}
  </div>`;
}
// 방송형 보기모드 메인 렌더 (날짜별 헤더 + 카드 목록) - histTabAltRecordsHTML에서 호출
function histBroadcastModeHTML(paged, typeInfo){
  let h='';
  let lastD=null;
  paged.forEach(({type,d,m},pageIdx)=>{
    if(d!==lastD){
      lastD=d;
      const dv=d?d.slice(2).replace(/-/g,'/'):'날짜 미정';
      h+=`<div style="display:flex;align-items:center;gap:8px;margin:16px 0 10px;${pageIdx===0?'margin-top:0;':''}">
        <span style="font-size:var(--fs-sm);font-weight:800;color:var(--text2);white-space:nowrap">${dv}</span>
        <span style="flex:1;height:1px;background:var(--border)"></span>
      </div>`;
    }
    h+=_bcMatchCardHTML(type,d,m,typeInfo);
  });
  return h;
}
