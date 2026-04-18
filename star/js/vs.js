/* ══════════════════════════════════════
   대전 기록 탭
══════════════════════════════════════ */
/* ═══════════════════════════════
   1:1 상대전적 — 이름 검색 방식
═══════════════════════════════ */
// 검색 입력 상태 (렌더 사이 유지)
let _vsInputA='', _vsInputB='';
// 대학 대결 상태
let _uvA='', _uvB='';

function vsSearchHTML(){
  const colA=vsNameA?(gc((players.find(p=>p.name===vsNameA)||{}).univ||'')):'#2563eb';
  const colB=vsNameB?(gc((players.find(p=>p.name===vsNameB)||{}).univ||'')):'#dc2626';

  // 선택 완료된 선수 뱃지 or 검색박스
  function playerSlot(slot){
    const name   = slot==='A'?vsNameA:vsNameB;
    const col    = slot==='A'?colA:colB;
    const inputId= `vs-input-${slot}`;
    const dropId = `vs-drop-${slot}`;
    const label  = slot==='A'?'스트리머 A':'스트리머 B';
    const inputVal= slot==='A'?_vsInputA:_vsInputB;
    if(name){
      const p=players.find(x=>x.name===name);
      const raceLabel=p?(p.race==='T'?'테란':p.race==='Z'?'저그':'프로토스'):'';
      return `<div style="display:flex;align-items:center;gap:7px;flex:1;min-width:160px;background:${col}18;border:2px solid ${col}55;border-radius:10px;padding:8px 12px">
        ${p&&p.photo?`<img src="${p.photo}" onclick="openPlayerModal('${(name||'').replace(/'/g,"\\'")}')" title="스트리머 상세" style="width:36px;height:36px;border-radius:var(--su_profile_radius,50%);object-fit:cover;border:2px solid ${col};flex-shrink:0;cursor:pointer" onerror="this.style.display='none'">` : `<div onclick="openPlayerModal('${(name||'').replace(/'/g,"\\'")}')" title="스트리머 상세" style="width:34px;height:34px;border-radius:var(--su_profile_radius,50%);background:${col};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#fff;flex-shrink:0;cursor:pointer">${name[0]}</div>`}
        <div style="flex:1;min-width:0">
          <div style="font-weight:800;font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
          <div style="font-size:10px;color:var(--gray-l)">${p?p.univ+' · '+p.tier+' · '+raceLabel:''}</div>
        </div>
        <button onclick="vsClearSlot('${slot}')" style="background:none;border:none;font-size:16px;color:var(--gray-l);cursor:pointer;padding:0 2px;line-height:1" title="변경">✕</button>
      </div>`;
    }
    return `<div style="flex:1;min-width:160px;position:relative">
      <div style="display:flex;align-items:center;gap:6px;border:2px solid var(--border2);border-radius:10px;padding:7px 12px;background:var(--white);transition:.15s" id="vs-wrap-${slot}">
        <span style="font-size:14px">${slot==='A'?'🔵':'🔴'}</span>
        <input id="${inputId}" type="text" placeholder="${label} 이름 검색..."
          value="${inputVal}"
          oninput="_vsInput('${slot}',this.value)"
          onfocus="this.parentElement.style.borderColor='var(--blue)';this.parentElement.style.boxShadow='0 0 0 3px rgba(37,99,235,.1)'"
          onblur="setTimeout(()=>{this.parentElement.style.borderColor='';this.parentElement.style.boxShadow='';_vsHideDrop('${slot}')},180)"
          style="border:none;outline:none;background:transparent;font-size:13px;flex:1;color:var(--text);font-family:'Noto Sans KR',sans-serif">
        ${inputVal?`<button onclick="vsClearInput('${slot}')" style="background:none;border:none;font-size:13px;color:var(--gray-l);cursor:pointer;padding:0;line-height:1">✕</button>`:''}
      </div>
      <div id="${dropId}" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--white);border:1px solid var(--border2);border-radius:10px;z-index:600;max-height:220px;overflow-y:auto;box-shadow:0 8px 24px rgba(0,0,0,.13)"></div>
    </div>`;
  }

  return `
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;margin-bottom:14px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:6px">
      <div style="font-size:13px;font-weight:700;color:var(--text2)">⚔️ 1:1 상대 전적 조회</div>
      ${(vsNameA||vsNameB)?`<button onclick="vsClearAll()" class="btn btn-w btn-sm" style="font-size:11px">🗑 초기화</button>`:''}
    </div>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      ${playerSlot('A')}
      <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:18px;color:var(--gray-l);flex-shrink:0">VS</div>
      ${playerSlot('B')}
    </div>
    ${(!vsNameA&&!vsNameB)?`<div style="margin-top:12px;font-size:11px;color:var(--gray-l);text-align:center">💡 스트리머 이름을 입력하면 목록이 나타납니다</div>`:''}
  </div>
  <div id="vsResult"></div>`;
}

// 검색 입력 핸들러
function _vsInput(slot, val){
  if(slot==='A') _vsInputA=val; else _vsInputB=val;
  const dropId='vs-drop-'+slot;
  const drop=document.getElementById(dropId);
  if(!drop)return;
  const q=val.trim().toLowerCase();
  if(!q){drop.style.display='none';drop.innerHTML='';return;}
  const results=players.filter(p=>
    p.name.toLowerCase().includes(q)||(p.univ||'').toLowerCase().includes(q)||
    (p.memo||'').split(/[\s,，\n]+/).some(m=>m.trim()&&m.trim().toLowerCase().includes(q))
  ).slice(0,20);
  if(!results.length){
    drop.innerHTML='<div style="padding:12px 14px;color:var(--gray-l);font-size:12px">검색 결과 없음</div>';
    drop.style.display='block';return;
  }
  drop.innerHTML=results.map(p=>{
    const col=gc(p.univ);
    const raceLabel=p.race==='T'?'테란':p.race==='Z'?'저그':'프로토스';
    const otherName=slot==='A'?vsNameB:vsNameA;
    const isSame=(p.name===otherName);
    return `<div onclick="${isSame?'':'vsSelectPlayer(\''+slot+'\',\''+p.name+'\')'}"
      style="padding:9px 14px;display:flex;align-items:center;gap:10px;cursor:${isSame?'not-allowed':'pointer'};opacity:${isSame?'.4':'1'};border-bottom:1px solid var(--border);transition:.1s"
      onmouseover="if(!${isSame})this.style.background='var(--blue-l)'"
      onmouseout="this.style.background=''">
      <div style="width:30px;height:30px;border-radius:7px;background:${col};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;flex-shrink:0">${p.name[0]}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:12px;color:var(--text)">${p.name}${isSame?'<span style="font-size:10px;color:var(--red);margin-left:4px">(이미 선택됨)</span>':''}</div>
        <div style="font-size:10px;color:var(--gray-l)">${p.univ} · ${p.tier||'-'} · ${raceLabel}</div>
      </div>
      <span class="rbadge r${p.race}" style="font-size:10px;flex-shrink:0">${p.race}</span>
    </div>`;
  }).join('');
  drop.style.display='block';
}

function _vsHideDrop(slot){
  const drop=document.getElementById('vs-drop-'+slot);
  if(drop)drop.style.display='none';
}

function vsSelectPlayer(slot, name){
  if(slot==='A'){vsNameA=name;_vsInputA='';}
  else{vsNameB=name;_vsInputB='';}
  _vsHideDrop(slot);
  const C=document.getElementById('rcont');
  const T=document.getElementById('rtitle');
  if(C&&T) rHist(C,T);
}

function vsClearSlot(slot){
  if(slot==='A'){vsNameA='';_vsInputA='';}
  else{vsNameB='';_vsInputB='';}
  const C=document.getElementById('rcont');const T=document.getElementById('rtitle');
  if(C&&T)rHist(C,T);
}

function vsClearInput(slot){
  if(slot==='A')_vsInputA=''; else _vsInputB='';
  const C=document.getElementById('rcont');const T=document.getElementById('rtitle');
  if(C&&T){rHist(C,T);setTimeout(()=>{const inp=document.getElementById('vs-input-'+slot);if(inp)inp.focus();},0);}
  _vsHideDrop(slot);
}

function vsClearAll(){
  vsNameA='';vsNameB='';_vsInputA='';_vsInputB='';
  const C=document.getElementById('rcont');const T=document.getElementById('rtitle');
  if(C&&T)rHist(C,T);
}

// 실제 결과 계산 + 렌더
function _vsRenderResult(){
  const r=document.getElementById('vsResult');
  if(!r)return;
  if(!vsNameA||!vsNameB||vsNameA===vsNameB){r.innerHTML='';return;}

  const pA=players.find(p=>p.name===vsNameA);
  const pB=players.find(p=>p.name===vsNameB);
  const colA=pA?gc(pA.univ):'#2563eb';
  const colB=pB?gc(pB.univ):'#dc2626';

  let aWins=0,bWins=0;
  const gameLogs=[];

  function scanVs(arr,modeLabel){
    arr.forEach(m=>{
      (m.sets||[]).forEach(set=>{
        (set.games||[]).forEach(g=>{
          const aIsA=(g.playerA===vsNameA&&g.playerB===vsNameB);
          const aIsB=(g.playerA===vsNameB&&g.playerB===vsNameA);
          if(!aIsA&&!aIsB)return;
          const aWon=(aIsA&&g.winner==='A')||(aIsB&&g.winner==='B');
          const bWon=(aIsA&&g.winner==='B')||(aIsB&&g.winner==='A');
          if(aWon)aWins++;else if(bWon)bWins++;
          gameLogs.push({date:m.d||'',mode:modeLabel,map:g.map||'-',aWon,bWon});
        });
      });
    });
  }
  scanVs(miniM,'⚡ 미니대전');
  scanVs(univM,'🏟️ 대학대전');
  scanVs(comps,'🎖️ 대회');
  scanVs(ckM,'🤝 대학CK');
  scanVs(proM,'🏅 프로리그');
  gameLogs.sort((a,b)=>b.date.localeCompare(a.date));

  const total=aWins+bWins;
  const aRate=total?Math.round(aWins/total*100):0;
  const bRate=total?100-aRate:0;
  const aLeading=aWins>bWins, bLeading=bWins>aWins;

  // 스트릭 계산
  let streak=0, streakName='';
  for(const lg of gameLogs){
    if(streak===0){streak=lg.aWon?1:lg.bWon?-1:0;streakName=lg.aWon?vsNameA:vsNameB;}
    else if(streak>0&&lg.aWon)streak++;
    else if(streak<0&&lg.bWon)streak--;
    else break;
  }
  const streakAbs=Math.abs(streak);

  r.innerHTML=`<div class="vs-box" id="vs-result-card">
    <!-- 상단 헤더: 두 선수 정보 -->
    <div style="display:flex;align-items:stretch;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <!-- A 선수 카드 -->
      <div style="flex:1;min-width:130px;background:${colA}18;border:2px solid ${colA}44;border-radius:10px;padding:12px;text-align:center">
        <div style="width:44px;height:44px;border-radius:10px;background:${colA};margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff">${vsNameA[0]}</div>
        <div style="font-weight:800;font-size:13px;color:var(--text)">${vsNameA}</div>
        ${pA?`<div style="font-size:10px;color:var(--gray-l);margin-top:2px">${pA.univ}</div>`:''}
        ${pA?getTierBadge(pA.tier):''}
        ${aLeading?'<div style="margin-top:6px;font-size:10px;font-weight:800;color:'+colA+'">🏆 우세</div>':''}
      </div>
      <!-- 중앙 스코어 -->
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;min-width:80px">
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:4px;letter-spacing:.5px">전체 전적</div>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:34px;color:${aLeading?colA:'var(--text3)'}">${aWins}</span>
          <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:22px;color:var(--gray-l)">:</span>
          <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:34px;color:${bLeading?colB:'var(--text3)'}">${bWins}</span>
        </div>
        <div style="font-size:10px;color:var(--text3);margin-top:3px">총 ${total}게임</div>
        ${streakAbs>=2?`<div style="margin-top:6px;font-size:10px;font-weight:700;color:${aWins>bWins?colA:colB};background:${aWins>bWins?colA+'18':colB+'18'};border-radius:20px;padding:2px 8px">${streakName} ${streakAbs}연승</div>`:''}
      </div>
      <!-- B 선수 카드 -->
      <div style="flex:1;min-width:130px;background:${colB}18;border:2px solid ${colB}44;border-radius:10px;padding:12px;text-align:center">
        <div style="width:44px;height:44px;border-radius:10px;background:${colB};margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff">${vsNameB[0]}</div>
        <div style="font-weight:800;font-size:13px;color:var(--text)">${vsNameB}</div>
        ${pB?`<div style="font-size:10px;color:var(--gray-l);margin-top:2px">${pB.univ}</div>`:''}
        ${pB?getTierBadge(pB.tier):''}
        ${bLeading?'<div style="margin-top:6px;font-size:10px;font-weight:800;color:'+colB+'">🏆 우세</div>':''}
      </div>
    </div>

    ${total===0?`<div style="padding:24px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:8px;font-size:13px">두 선수 간 직접 대결 기록이 없습니다.</div>`:`
    <!-- 승률 바 -->
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;margin-bottom:5px">
        <span style="color:${colA}">${vsNameA} ${aRate}%</span>
        <span style="color:${colB}">${bRate}% ${vsNameB}</span>
      </div>
      <div class="vs-bar-wrap">
        <div class="vs-bar-a" style="width:${aRate}%"></div>
        <div class="vs-bar-b" style="width:${bRate}%"></div>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div style="display:flex;gap:7px;margin-bottom:14px;flex-wrap:wrap" class="no-export">
      <button class="btn btn-p btn-sm" onclick="openVsShareCard()">🎴 공유 카드</button>
      <button class="btn-capture btn-sm" onclick="captureVsCard()">📷 이미지 저장</button>
      <button class="btn btn-w btn-sm" onclick="vsClearAll()">🗑 결과 지우기</button>
    </div>

    <!-- 대전 내역 테이블 -->
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📋 게임 내역 (${gameLogs.length}건)</div>
    <div style="overflow-x:auto">
      <table style="min-width:340px"><thead><tr><th>날짜</th><th>대전 종류</th><th>맵</th><th>결과</th></tr></thead><tbody>
      ${gameLogs.length===0?`<tr><td colspan="4" style="padding:20px;color:var(--gray-l)">없음</td></tr>`:''}
      ${gameLogs.map(lg=>`<tr>
        <td style="color:var(--gray-l);font-size:11px">${lg.date}</td>
        <td style="font-size:11px">${lg.mode}</td>
        <td style="color:var(--gray-l);font-size:11px">${lg.map!=='-'?'📍'+lg.map:'-'}</td>
        <td>${lg.aWon?`<span style="font-weight:700;color:${colA}">▶ ${vsNameA} 승</span>`:lg.bWon?`<span style="font-weight:700;color:${colB}">▶ ${vsNameB} 승</span>`:'<span style="color:var(--gray-l)">미정</span>'}</td>
      </tr>`).join('')}
      </tbody></table>
    </div>

    <!-- 선수 스탯 비교 -->
    ${(()=>{
      if(!pA||!pB)return '';
      const eloA=pA.elo||ELO_DEFAULT, eloB=pB.elo||ELO_DEFAULT;
      const wrA=(pA.win+pA.loss)?Math.round(pA.win/(pA.win+pA.loss)*100):0;
      const wrB=(pB.win+pB.loss)?Math.round(pB.win/(pB.win+pB.loss)*100):0;
      const raceA=pA.race==='T'?'테란':pA.race==='Z'?'저그':pA.race==='P'?'프로토스':'?';
      const raceB=pB.race==='T'?'테란':pB.race==='Z'?'저그':pB.race==='P'?'프로토스':'?';
      function statRow(label,va,vb,higherBetter=true){
        const numA=parseFloat(va),numB=parseFloat(vb);
        const aWins=!isNaN(numA)&&!isNaN(numB)&&(higherBetter?numA>numB:numA<numB);
        const bWins=!isNaN(numA)&&!isNaN(numB)&&(higherBetter?numB>numA:numB<numA);
        return `<tr>
          <td style="font-weight:${aWins?'800':'600'};color:${aWins?colA:'var(--text)'};text-align:right;padding:5px 10px">${va}${aWins?` <span style="color:${colA}">◀</span>`:''}</td>
          <td style="text-align:center;padding:5px 6px;color:var(--gray-l);font-size:11px;white-space:nowrap">${label}</td>
          <td style="font-weight:${bWins?'800':'600'};color:${bWins?colB:'var(--text)'};text-align:left;padding:5px 10px">${bWins?`<span style="color:${colB}">▶</span> `:''}${vb}</td>
        </tr>`;
      }
      return `<div style="margin-top:14px">
        <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📊 스탯 비교</div>
        <div style="overflow-x:auto">
          <table style="min-width:300px;table-layout:fixed">
            <thead><tr>
              <th style="text-align:right;color:${colA};width:40%">${vsNameA}</th>
              <th style="text-align:center;color:var(--gray-l);width:20%">항목</th>
              <th style="text-align:left;color:${colB};width:40%">${vsNameB}</th>
            </tr></thead>
            <tbody>
              ${statRow('ELO',eloA,eloB)}
              ${statRow('승률',wrA+'%',wrB+'%')}
              ${statRow('승',pA.win,pB.win)}
              ${statRow('패',pA.loss,pB.loss,false)}
              ${statRow('경기수',pA.win+pA.loss,pB.win+pB.loss)}
              ${statRow('포인트',pA.points||0,pB.points||0)}
              ${statRow('티어',pA.tier||'?',pB.tier||'?',false)}
              <tr>
                <td style="text-align:right;padding:5px 10px;color:var(--text)">${raceA}</td>
                <td style="text-align:center;padding:5px 6px;color:var(--gray-l);font-size:11px">종족</td>
                <td style="text-align:left;padding:5px 10px;color:var(--text)">${raceB}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>`;
    })()}`}
  </div>`;
}

// renderVs는 하위 호환성 유지
function renderVs(){
  if(vsNameA&&vsNameB&&vsNameA!==vsNameB) _vsRenderResult();
}

/* ── 1:1 전적 공유 카드 ─────────────────────────── */
function openVsShareCard(){
  if(!vsNameA||!vsNameB||vsNameA===vsNameB)return;
  const pA=players.find(p=>p.name===vsNameA);
  const pB=players.find(p=>p.name===vsNameB);
  const colA=pA?gc(pA.univ):'#2563eb';
  const colB=pB?gc(pB.univ):'#dc2626';

  let aWins=0,bWins=0;
  const gameLogs=[];
  function scanVs(arr,label){
    arr.forEach(m=>{(m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
      const aIsA=(g.playerA===vsNameA&&g.playerB===vsNameB);
      const aIsB=(g.playerA===vsNameB&&g.playerB===vsNameA);
      if(!aIsA&&!aIsB)return;
      const aWon=(aIsA&&g.winner==='A')||(aIsB&&g.winner==='B');
      const bWon=(aIsA&&g.winner==='B')||(aIsB&&g.winner==='A');
      if(aWon)aWins++;else if(bWon)bWins++;
      gameLogs.push({date:m.d||'',mode:label,map:g.map||'-',aWon,bWon});
    });});});
  }
  scanVs(miniM,'⚡ 미니대전');
  scanVs(univM,'🏟️ 대학대전');
  scanVs(comps,'🎖️ 대회');
  scanVs(ckM,'🤝 대학CK');
  scanVs(proM,'🏅 프로리그');
  gameLogs.sort((a,b)=>b.date.localeCompare(a.date));

  const total=aWins+bWins;
  const aRate=total?Math.round(aWins/total*100):0;
  const bRate=total?100-aRate:0;
  const aLead=aWins>bWins,bLead=bWins>aWins;

  // 배경: 우세한 쪽 색상 HSL 기반 — 채도·색조 살리고 명도만 낮춤
  function hexToHslVs(hex){
    let h=(hex||'').replace('#','');
    if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if(h.length!==6)return null;
    let r=parseInt(h.slice(0,2),16)/255,g=parseInt(h.slice(2,4),16)/255,b=parseInt(h.slice(4,6),16)/255;
    const mx=Math.max(r,g,b),mn=Math.min(r,g,b);
    let hue=0,sat=0,lit=(mx+mn)/2;
    if(mx!==mn){const d=mx-mn;sat=lit>.5?d/(2-mx-mn):d/(mx+mn);
      if(mx===r)hue=((g-b)/d+(g<b?6:0))/6;
      else if(mx===g)hue=((b-r)/d+2)/6;
      else hue=((r-g)/d+4)/6;}
    return{h:Math.round(hue*360),s:Math.round(sat*100),l:Math.round(lit*100)};
  }
  function makeVsBg(hex){
    const hsl=hexToHslVs(hex);
    if(!hsl)return{bg:'linear-gradient(135deg,#1e3a5c,#1e4a7c)',accent:'#60a5fa'};
    const {h,s,l}=hsl;
    const bgS=Math.max(Math.min(s,60),25);
    const bgL1=Math.min(l+28,90);
    const bgL2=Math.min(l+38,96);
    const accent=`hsl(${h},${Math.min(s+5,90)}%,${Math.max(l-5,25)}%)`;
    return{bg:`linear-gradient(135deg,hsl(${h},${bgS}%,${bgL1}%),hsl(${h},${Math.max(bgS-10,15)}%,${bgL2}%))`,accent};
  }
  const vsWinBg=aLead?makeVsBg(colA):bLead?makeVsBg(colB):{bg:'linear-gradient(135deg,#1e3a5c,#1e4a7c)',accent:'#60a5fa'};
  const winCol=vsWinBg.accent;
  const cardBg=vsWinBg.bg;
  // 배경이 밝아졌으므로 텍스트 어둡게
  const vsHslWin=aLead?hexToHslVs(colA):bLead?hexToHslVs(colB):null;
  const vsTextColor=vsHslWin?`hsl(${vsHslWin.h},${Math.min(vsHslWin.s,50)}%,${Math.max(vsHslWin.l-40,8)}%)`:'#fff';
  const vsDimColor=vsHslWin?`hsla(${vsHslWin.h},${Math.min(vsHslWin.s,40)}%,${Math.max(vsHslWin.l-25,20)}%,.7)`:'rgba(255,255,255,.5)';

  // 최근 5경기 폼
  const recentForm=gameLogs.slice(0,5).map(lg=>
    lg.aWon?`<span style="display:inline-block;width:22px;height:22px;background:${colA};color:#fff;font-size:10px;font-weight:800;border-radius:5px;text-align:center;line-height:22px">W</span>`
    :lg.bWon?`<span style="display:inline-block;width:22px;height:22px;background:${colB};color:#fff;font-size:10px;font-weight:800;border-radius:5px;text-align:center;line-height:22px">W</span>`
    :`<span style="display:inline-block;width:22px;height:22px;background:#475569;color:#fff;font-size:10px;border-radius:5px;text-align:center;line-height:22px">-</span>`
  ).join('');

  // 종족 라벨
  const raceA=pA?(pA.race==='T'?'테란':pA.race==='Z'?'저그':pA.race==='P'?'프로토스':''):'';
  const raceB=pB?(pB.race==='T'?'테란':pB.race==='Z'?'저그':pB.race==='P'?'프로토스':''):'';
  const ct=t=>t?t.replace(/티어$/,''):'';
  const tierBadgeVS=(tier,lead)=>tier?`<span style="background:${_TIER_BG[tier]||'#64748b'};color:${_TIER_TEXT[tier]||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">${ct(tier)}</span>`:'';
  const raceBadgeVS=race=>race?`<span style="font-size:10px;opacity:.8">${race}</span>`:'';
  const photoA=getPlayerPhotoHTML(vsNameA,'56px',`border:3px solid ${aLead?colA:'rgba(255,255,255,.3)'};${aLead?'box-shadow:0 0 12px '+colA+'66':''}`);
  const photoB=getPlayerPhotoHTML(vsNameB,'56px',`border:3px solid ${bLead?colB:'rgba(255,255,255,.3)'};${bLead?'box-shadow:0 0 12px '+colB+'66':''}`);

  // 카드 HTML
  const cardHTML=`<div id="vs-share-card-inner" style="background:${cardBg};padding:22px;color:${vsTextColor};width:min(380px,calc(100vw - 48px));font-family:'Noto Sans KR',sans-serif;position:relative;overflow:hidden">
    <div style="position:absolute;top:-30px;right:-30px;width:130px;height:130px;border-radius:50%;background:${winCol};opacity:.08;pointer-events:none"></div>
    <!-- 제목 -->
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:10px;color:${vsDimColor};letter-spacing:1px;margin-bottom:4px">⚔️ 1:1 상대 전적</div>
      <div style="font-size:11px;color:${vsDimColor}">${new Date().toLocaleDateString('ko-KR')} 기준</div>
    </div>
    <!-- 두 선수 대결 -->
    <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:16px">
      <!-- A: 왼쪽 정렬 -->
      <div style="flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-width:0;${aLead?'':'opacity:.7'}">
        <div style="flex-shrink:0">${photoA}</div>
        <div style="text-align:left;width:100%;min-width:0">
          <div style="font-size:13px;font-weight:${aLead?'900':'700'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${vsNameA}</div>
          <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-top:3px">
            ${tierBadgeVS(pA?.tier)}${raceBadgeVS(raceA)}
          </div>
          ${aLead?`<div style="font-size:10px;font-weight:800;color:${colA};margin-top:4px">🏆 우세</div>`:''}
        </div>
      </div>
      <!-- 스코어 -->
      <div style="text-align:center;flex-shrink:0;padding:0 4px;padding-top:6px">
        <div style="font-size:36px;font-weight:900;letter-spacing:2px;line-height:1">
          <span style="color:${aLead?colA:vsTextColor};${aLead?'':'opacity:.5'}">${aWins}</span>
          <span style="opacity:.25;font-size:20px;margin:0 1px">:</span>
          <span style="color:${bLead?colB:vsTextColor};${bLead?'':'opacity:.5'}">${bWins}</span>
        </div>
        <div style="font-size:9px;color:${vsDimColor};margin-top:2px">총 ${total}게임</div>
      </div>
      <!-- B: 오른쪽 정렬 -->
      <div style="flex:1;display:flex;flex-direction:column;align-items:flex-end;gap:6px;min-width:0;${bLead?'':'opacity:.7'}">
        <div style="flex-shrink:0">${photoB}</div>
        <div style="text-align:right;width:100%;min-width:0">
          <div style="font-size:13px;font-weight:${bLead?'900':'700'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${vsNameB}</div>
          <div style="display:flex;align-items:center;justify-content:flex-end;gap:4px;flex-wrap:wrap;margin-top:3px">
            ${raceBadgeVS(raceB)}${tierBadgeVS(pB?.tier)}
          </div>
          ${bLead?`<div style="font-size:10px;font-weight:800;color:${colB};margin-top:4px">우세 🏆</div>`:''}
        </div>
      </div>
    </div>
    <!-- 승률 바 -->
    ${total>0?`<div style="margin-bottom:12px">
      <div style="height:6px;border-radius:3px;background:rgba(255,255,255,.15);overflow:hidden;display:flex">
        <div style="width:${aRate}%;background:${colA};border-radius:3px 0 0 3px"></div>
        <div style="width:${bRate}%;background:${colB};border-radius:0 3px 3px 0"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:10px">
        <span style="color:${colA};font-weight:700">${aRate}%</span>
        <span style="color:${colB};font-weight:700">${bRate}%</span>
      </div>
    </div>`:''}
    <!-- 최근 5경기 -->
    ${gameLogs.length?`<div style="margin-bottom:12px">
      <div style="font-size:9px;color:${vsDimColor};letter-spacing:.5px;margin-bottom:5px">최근 경기 (${vsNameA}기준: W=승, ${vsNameB} W=패)</div>
      <div style="display:flex;gap:4px">${recentForm}</div>
    </div>`:''}
    <!-- 푸터 -->
    <div style="text-align:right;font-size:9px;color:${vsDimColor};letter-spacing:.3px">⭐ 스타대학 데이터 센터</div>
  </div>`;

  // 모달 열기
  const existing=document.getElementById('sharecard-overlay');
  if(existing)existing.remove();
  const overlay=document.createElement('div');
  overlay.id='sharecard-overlay';
  overlay.className='sharecard-modal-overlay';
  overlay.innerHTML=`<div class="sharecard-modal-box" onclick="event.stopPropagation()" style="max-width:460px;width:96vw">
    <button class="sharecard-modal-close" onclick="document.getElementById('sharecard-overlay').remove()">✕</button>
    <div style="font-weight:700;font-size:14px;color:var(--blue);margin-bottom:14px;padding-right:30px">🎴 1:1 상대 전적 공유 카드</div>
    <div id="modal-share-card" style="display:flex;justify-content:center;overflow:auto;max-height:70vh">
      <div id="share-card">${cardHTML}</div>
    </div>
    <div class="sharecard-modal-actions" style="margin-top:16px">
      <button class="btn btn-p" onclick="downloadVsShareCard('jpg')">📷 JPG 저장</button>
      <button class="btn btn-w" onclick="downloadVsShareCard('png')">🖼 PNG 저장</button>
      <button class="btn btn-w" onclick="document.getElementById('sharecard-overlay').remove()">닫기</button>
    </div>
  </div>`;
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove();});
  document.body.appendChild(overlay);
}

async function downloadVsShareCard(fmt){
  const el=document.getElementById('vs-share-card-inner')||document.getElementById('share-card');
  if(!el){alert('카드를 먼저 생성하세요.');return;}
  try{
    _showSaveLoading();
    await _imgToDataUrls(el);
    const canvas=await html2canvas(el,{backgroundColor:null,scale:3,useCORS:false,allowTaint:false,logging:false});
    const _fn=`vs_${vsNameA}_vs_${vsNameB}_${new Date().toISOString().slice(0,10)}.${fmt}`;
    await _saveCanvasImage(canvas,_fn,fmt);
  }catch(e){alert('저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

/* ══════════════════════════════════════
   대학 대결 히스토리
══════════════════════════════════════ */
function univVsHTML(){
  const univs=getAllUnivs().map(u=>u.name);
  const selStyle='padding:7px 10px;border-radius:8px;border:1.5px solid var(--border2);background:var(--white);font-size:13px;color:var(--text);font-family:\'Noto Sans KR\',sans-serif;flex:1;min-width:120px';
  return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;margin-bottom:14px">
    <div style="font-size:13px;font-weight:700;color:var(--text2);margin-bottom:14px">🏟️ 대학 대결 히스토리</div>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px">
      <select id="uv-a" style="${selStyle}" onchange="_uvA=this.value;renderUnivVsResult()">
        <option value="">대학 A 선택</option>
        ${univs.map(u=>`<option value="${u}"${_uvA===u?' selected':''}>${u}</option>`).join('')}
      </select>
      <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:18px;color:var(--gray-l);flex-shrink:0">VS</div>
      <select id="uv-b" style="${selStyle}" onchange="_uvB=this.value;renderUnivVsResult()">
        <option value="">대학 B 선택</option>
        ${univs.map(u=>`<option value="${u}"${_uvB===u?' selected':''}>${u}</option>`).join('')}
      </select>
      ${(_uvA||_uvB)?`<button onclick="_uvA='';_uvB='';renderUnivVsResult()" class="btn btn-w btn-sm" style="font-size:11px">🗑 초기화</button>`:''}
    </div>
    <div id="uvResult"></div>
  </div>`;
}

function renderUnivVsResult(){
  const r=document.getElementById('uvResult');
  if(!r)return;
  if(!_uvA||!_uvB||_uvA===_uvB){
    r.innerHTML=(!_uvA&&!_uvB)?'<div style="font-size:11px;color:var(--gray-l);text-align:center">💡 두 대학을 선택하면 대결 기록이 표시됩니다</div>':'';
    return;
  }
  const colA=gc(_uvA), colB=gc(_uvB);
  let aWins=0,bWins=0;
  const logs=[];

  function scanUnivMatch(arr, modeLabel){
    arr.forEach(m=>{
      const matchA=m.a===_uvA&&m.b===_uvB, matchB=m.a===_uvB&&m.b===_uvA;
      if(!matchA&&!matchB)return;
      const sa=matchA?(m.sa||0):(m.sb||0);
      const sb=matchA?(m.sb||0):(m.sa||0);
      if(sa>sb)aWins++;else if(sb>sa)bWins++;
      logs.push({date:m.d||'',mode:modeLabel,sa,sb,draw:sa===sb});
    });
  }
  scanUnivMatch(univM,'🏟️ 대학대전');
  scanUnivMatch(ckM,'🤝 대학CK');
  logs.sort((a,b)=>b.date.localeCompare(a.date));

  const total=aWins+bWins;
  const aRate=total?Math.round(aWins/total*100):0;
  const bRate=total?100-aRate:0;

  r.innerHTML=`
    <div style="display:flex;align-items:stretch;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <div style="flex:1;min-width:110px;background:${colA}18;border:2px solid ${colA}44;border-radius:10px;padding:12px;text-align:center">
        <div style="width:40px;height:40px;border-radius:10px;background:${colA};margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#fff">${_uvA[0]}</div>
        <div style="font-weight:800;font-size:13px;color:var(--text)">${_uvA}</div>
        ${aWins>bWins?`<div style="margin-top:6px;font-size:10px;font-weight:800;color:${colA}">🏆 우세</div>`:''}
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;min-width:80px">
        <div style="font-size:11px;color:var(--gray-l);margin-bottom:4px">전체 전적</div>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:34px;color:${aWins>bWins?colA:'var(--text3)'}">${aWins}</span>
          <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:22px;color:var(--gray-l)">:</span>
          <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:34px;color:${bWins>aWins?colB:'var(--text3)'}">${bWins}</span>
        </div>
        <div style="font-size:10px;color:var(--text3);margin-top:3px">총 ${logs.length}매치</div>
      </div>
      <div style="flex:1;min-width:110px;background:${colB}18;border:2px solid ${colB}44;border-radius:10px;padding:12px;text-align:center">
        <div style="width:40px;height:40px;border-radius:10px;background:${colB};margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#fff">${_uvB[0]}</div>
        <div style="font-weight:800;font-size:13px;color:var(--text)">${_uvB}</div>
        ${bWins>aWins?`<div style="margin-top:6px;font-size:10px;font-weight:800;color:${colB}">🏆 우세</div>`:''}
      </div>
    </div>
    ${total>0?`<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;margin-bottom:5px">
        <span style="color:${colA}">${_uvA} ${aRate}%</span>
        <span style="color:${colB}">${bRate}% ${_uvB}</span>
      </div>
      <div class="vs-bar-wrap">
        <div class="vs-bar-a" style="width:${aRate}%;background:${colA}"></div>
        <div class="vs-bar-b" style="width:${bRate}%;background:${colB}"></div>
      </div>
    </div>`:''}
    ${logs.length===0?`<div style="padding:20px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:8px;font-size:13px">두 대학 간 대결 기록이 없습니다.</div>`:`
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">📋 매치 기록 (${logs.length}건)</div>
    <div style="overflow-x:auto">
      <table style="min-width:300px"><thead><tr><th>날짜</th><th>대전 종류</th><th>스코어</th><th>결과</th></tr></thead><tbody>
      ${logs.map(lg=>{
        const aW=lg.sa>lg.sb, bW=lg.sb>lg.sa;
        return `<tr>
          <td style="color:var(--gray-l);font-size:11px">${lg.date}</td>
          <td style="font-size:11px">${lg.mode}</td>
          <td style="font-size:12px;font-weight:700"><span style="color:${aW?colA:'var(--text3)'}">${lg.sa}</span> : <span style="color:${bW?colB:'var(--text3)'}">${lg.sb}</span></td>
          <td>${aW?`<span style="font-weight:700;color:${colA}">▶ ${_uvA} 승</span>`:bW?`<span style="font-weight:700;color:${colB}">▶ ${_uvB} 승</span>`:'<span style="color:var(--gray-l)">무승부</span>'}</td>
        </tr>`;
      }).join('')}
      </tbody></table>
    </div>`}`;
}

async function captureVsCard(){
  const el=document.getElementById('vs-result-card');
  if(!el){alert('결과 카드가 없습니다.');return;}
  try{
    _showSaveLoading();
    await _imgToDataUrls(el);
    const canvas=await html2canvas(el,{backgroundColor:null,scale:2,useCORS:false,allowTaint:false,logging:false,ignoreElements:e=>e.classList.contains('no-export')});
    const a=document.createElement('a');
    a.download=`vs_${vsNameA}_vs_${vsNameB}_${new Date().toISOString().slice(0,10)}.jpg`;
    a.href=canvas.toDataURL('image/jpeg',0.95);
    a.click();
  }catch(e){alert('저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}
