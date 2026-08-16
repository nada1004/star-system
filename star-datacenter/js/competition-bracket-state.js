/* ══════════════════════════════════════
   competition-bracket-state.js — 대진표 상태 관리 (승자/슬롯/우승자 설정, 조별순위 풀뷰)
   competition.js에서 분리됨
══════════════════════════════════════ */

function rCompGrpRankFull(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const isTier=tn.type==='tier';
  const GL='ABCDEFGHIJ';
  let filterHTML='';
  if(tn.groups&&tn.groups.length>1){
    filterHTML=`<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-left:auto">
      <button class="pill ${!grpRankFilter?'on':''}" onclick="grpRankFilter='';render()">전체</button>`;
    tn.groups.forEach((grp,gi)=>{
      const gl=GL[gi];const col=['var(--blue)','var(--red)','var(--green)','var(--gold)','var(--god)','#0891b2'][gi%6];
      filterHTML+=`<button class="pill ${grpRankFilter===grp.name?'on':''}" style="${grpRankFilter===grp.name?`background:${col};border-color:${col};color:#fff`:''}" onclick="grpRankFilter='${escJS(grp.name)}';render()">GROUP ${gl}</button>`;
    });
    filterHTML+=`</div>`;
  }
  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;flex-wrap:wrap">
    <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:var(--blue)">📊 ${tn.name} — 조별 순위</div>
    ${filterHTML}
  </div>
  <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:14px">승점 → 세트 득실 → 득점 순 · 상위 2팀 토너먼트 진출</div>`;
  if(!tn.groups||!tn.groups.length){
    return h+`<div style="padding:40px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2);color:var(--gray-l)">
      <div style="font-size:28px;margin-bottom:10px">🏗️</div>
      <div style="font-weight:700;margin-bottom:8px">조편성이 필요합니다</div>
      <div style="font-size:var(--fs-sm);margin-bottom:14px">먼저 <b>조편성</b> 탭에서 조를 만들고 ${isTier?'선수':'대학'}를 배정해주세요.</div>
      ${isLoggedIn?`<button class="btn btn-b btn-sm" onclick="${isTier?`_ttSub='grpedit';grpSub='edit';render()`:`compSub='grpedit';grpEditId='${tn.id}';grpSub='edit';render()`}">🏗️ 조편성 하러 가기</button>`:''}
    </div>`;
  }
  const targetGroups=grpRankFilter?tn.groups.filter(g=>g.name===grpRankFilter):tn.groups;
  targetGroups.forEach(grp=>{
    const gi=tn.groups.indexOf(grp);const gl=GL[gi]||gi;
    const col=['var(--blue)','var(--red)','var(--green)','var(--gold)','var(--god)','#0891b2'][gi%6];
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
        <span style="background:${col};color:#fff;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-base);padding:3px 14px;border-radius:20px">GROUP ${gl}</span>
        <span style="font-size:var(--fs-caption);color:var(--gray-l)">${played}/${grp.matches.length}경기 완료</span>
        <div style="margin-left:auto;display:flex;gap:5px;flex-wrap:wrap">${grp.univs.map(u=>`<span class="ubadge" style="background:${gc(u)};font-size:var(--fs-caption)">${isTier?'':gUI(u,'10px')}${u}</span>`).join('')}</div>
      </div>
      <table class="grp-rank-table" style="--grt-col:${col}"><thead><tr><th>순위</th><th>${isTier?'선수':'대학'}</th><th>경기</th><th>승</th><th>패</th><th>득</th><th>실</th><th>득실</th><th>승점</th></tr></thead><tbody>`;
    sorted.forEach(([name,s],i)=>{
      const uc=gc(name);const diff=s.gw-s.gl2;const isTop=i<2;
      const rowClass=i===0?'grp-rank-top1':i===1?'grp-rank-top2':'';
      h+=`<tr class="${rowClass}">
        <td>${i===0?`<span class="rk1">1위</span>`:i===1?`<span class="rk2">2위</span>`:i===2?`<span class="rk3">3위</span>`:`${i+1}위`}</td>
        <td><span class="ubadge ${isTier?'':'clickable-univ'}" style="background:${uc};font-size:var(--fs-caption)" ${isTier?'':`onclick="openUnivModal('${escJS(name)}')"`}>${name}</span></td>
        <td style="color:var(--gray-l)">${s.played}</td><td class="wt">${s.w}</td><td class="lt">${s.l}</td>
        <td class="wt">${s.gw}</td><td class="lt">${s.gl2}</td>
        <td><span style="display:inline-flex;align-items:center;gap:2px;padding:2px 9px;border-radius:20px;font-weight:800;font-size:var(--fs-sm);background:${diff>0?'color-mix(in srgb, var(--red) 14%, var(--white))':diff<0?'var(--surface)':'transparent'};color:${diff>0?'var(--red)':diff<0?'var(--text3)':'var(--gray-l)'}">${diff>0?'▲':diff<0?'▼':''}${diff>=0?'+':''}${diff}</span></td>
        <td style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:${col}">${s.pts}</td>
      </tr>`;
    });
    h+=`</tbody></table>`;
    if(played===0) h+=`<div style="font-size:var(--fs-sm);color:var(--gray-l);padding:10px 0;text-align:center">⏳ 아직 진행된 경기가 없습니다</div>`;
    h+=`</div>`;
  });
  return h;
}

/* ══════════════════════════════════════
   브라켓 상태 저장 유틸
   tn.bracket = {
     slots: { "r-mi-side": "대학명" },   // 각 라운드 각 경기 슬롯 수동 override
     winners: { "r-mi": "대학명" },       // 각 라운드 각 경기 승자
     champ: "대학명"
   }
══════════════════════════════════════ */
function getBracket(tn){
  if(!tn.bracket)tn.bracket={slots:{},winners:{},champ:''};
  if(!tn.bracket.slots)tn.bracket.slots={};
  if(!tn.bracket.winners)tn.bracket.winners={};
  if(tn.bracket.champ===undefined)tn.bracket.champ='';
  return tn.bracket;
}

/* ── 티어대회(개인전) 전용 동적 브라켓 ──
   - tn.type==='tier'
   - tn.bracket: {slots,winners,champ,matchDetails}
   - slots: "r-mi-side" → 선수명
   - winners: "r-mi" → 선수명
*/
function rTierBracketDynamic(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  const br=getBracket(tn);
  const overrideSize=parseInt(tn.bracketOverrideSize||'0',10)||0;
  const numTeams = overrideSize>1 ? overrideSize : 8;
  let totalRounds=0;{let n=numTeams;while(n>1){n=Math.ceil(n/2);totalRounds++;}} if(!totalRounds) totalRounds=1;

  const slotName = (rnd,mi,side)=>{
    const k=`${rnd}-${mi}-${side}`;
    if(Object.prototype.hasOwnProperty.call(br.slots||{}, k)) return String(br.slots[k]||'');
    if(rnd<=0) return '';
    const pk=`${rnd-1}-${mi*2 + (side==='a'?0:1)}`;
    return String((br.winners||{})[pk]||'');
  };
  const matchDetail = (rnd,mi)=>{
    // matchDetails는 optional. 없으면 표시용만.
    const k=`${rnd}-${mi}`;
    return (br.matchDetails && br.matchDetails[k]) ? br.matchDetails[k] : null;
  };
  const rndLabel = (ri)=>{
    const sz = Math.pow(2, totalRounds-ri);
    if(sz===2) return '결승';
    if(sz===4) return '4강';
    if(sz===8) return '8강';
    if(sz===16) return '16강';
    if(sz===32) return '32강';
    return `${sz}강`;
  };

  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
    <div style="font-weight:900;font-size:var(--fs-md);color:var(--blue)">🗂️ ${tn.name} 토너먼트</div>
    <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 티어대회(개인전) 대진표</span>
    ${isLoggedIn?`
      <div style="display:flex;align-items:center;gap:6px;margin-left:auto;flex-wrap:wrap">
        <button class="btn btn-p btn-sm" onclick="openTierBktPasteModal && openTierBktPasteModal('${tn.id}')" title="여러 경기 결과를 붙여넣어 토너먼트 기록으로 저장">📋 자동인식</button>
        <span style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:800">강수</span>
        <select onchange="setTierBracketSize('${tn.id}', this.value)" style="border:1px solid var(--border2);border-radius:8px;padding:5px 8px;font-size:var(--fs-sm)">
          ${[2,4,8,16,32,64].map(x=>`<option value="${x}" ${x===numTeams?'selected':''}>${x}강</option>`).join('')}
        </select>
      </div>
    `:''}
  </div>`;

  h += `<div style="overflow-x:auto;padding-bottom:14px"><div style="display:inline-flex;gap:0;align-items:flex-start;min-width:fit-content">`;
  for(let ri=0; ri<totalRounds; ri++){
    const matchCount = Math.ceil(numTeams/Math.pow(2,ri+1));
    const isLast = ri===totalRounds-1;
    const gap = ri===0?8:(Math.pow(2,ri)*60+8);
    h += `<div style="display:flex;align-items:center">
      <div style="min-width:${isLast?220:200}px;flex-shrink:0">
        <div style="text-align:center;font-size:var(--fs-sm);font-weight:900;color:#fff;margin-bottom:10px;padding:7px 10px;background:linear-gradient(135deg,#3b82f6,var(--blue-d));border-radius:var(--r);box-shadow:0 3px 8px rgba(37,99,235,.25);letter-spacing:.5px">${rndLabel(ri)}</div>
        <div style="display:flex;flex-direction:column;gap:${gap}px">`;
    for(let mi=0; mi<matchCount; mi++){
      const a = slotName(ri,mi,'a') || 'TBD';
      const b = slotName(ri,mi,'b') || 'TBD';
      const w = (br.winners||{})[`${ri}-${mi}`] || '';
      const aWin = w && w===a, bWin = w && w===b;
      const md = matchDetail(ri,mi);
      const sa = md?.sa, sb = md?.sb;
      const hasScore = (sa!=null && sb!=null);
      const _esc = s => String(s||'').replace(/'/g,"\\'");
      h += `<div style="border-radius:12px;overflow:hidden;background:var(--white);box-shadow:0 1px 6px rgba(0,0,0,.07);border:1.5px solid var(--border)">
        <div style="padding:9px 12px;border-bottom:1px solid var(--bg);background:${aWin?'var(--red)18':a==='TBD'?'var(--surface)':'#fff'};display:flex;align-items:center;gap:8px;${aWin?`border-left:3px solid var(--red)`:''};${w && !aWin?'opacity:.55':''}">
          <div style="flex:1;min-width:0">
            <div style="font-size:var(--fs-sm);font-weight:${aWin?'900':a==='TBD'?'400':'700'};color:${aWin?'var(--red)':a==='TBD'?'var(--text3)':'var(--text2)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${a!=='TBD'?'pointer':'default'}" onclick="${a!=='TBD'?`openPlayerModal('${String(a).replace(/'/g,"\\'")}')`:''}">${a}</div>
          </div>
          ${hasScore?`<span style="font-size:var(--fs-caption);font-weight:900;color:${aWin?'var(--red)':'var(--text3)'};flex-shrink:0">${sa}</span>`:''}
          ${isLoggedIn?`<button class="btn btn-xs" style="font-size:10px;padding:0 6px" onclick="(function(){const v=prompt('A 슬롯 선수명 입력(빈칸=삭제, BYE 가능)', '${_esc(a==='TBD'?'':a)}'); if(v===null)return; setBracketSlot('${tn.id}',${ri},${mi},'a', (v||'').trim()); })()">✏️</button>`:''}
        </div>
        <div style="padding:9px 12px;background:${bWin?'var(--red)18':b==='TBD'?'var(--surface)':'#fff'};display:flex;align-items:center;gap:8px;${bWin?`border-left:3px solid var(--red)`:''};${w && !bWin?'opacity:.55':''}">
          <div style="flex:1;min-width:0">
            <div style="font-size:var(--fs-sm);font-weight:${bWin?'900':b==='TBD'?'400':'700'};color:${bWin?'var(--red)':b==='TBD'?'var(--text3)':'var(--text2)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${b!=='TBD'?'pointer':'default'}" onclick="${b!=='TBD'?`openPlayerModal('${String(b).replace(/'/g,"\\'")}')`:''}">${b}</div>
          </div>
          ${hasScore?`<span style="font-size:var(--fs-caption);font-weight:900;color:${bWin?'var(--red)':'var(--text3)'};flex-shrink:0">${sb}</span>`:''}
          ${isLoggedIn?`<button class="btn btn-xs" style="font-size:10px;padding:0 6px" onclick="(function(){const v=prompt('B 슬롯 선수명 입력(빈칸=삭제, BYE 가능)', '${_esc(b==='TBD'?'':b)}'); if(v===null)return; setBracketSlot('${tn.id}',${ri},${mi},'b', (v||'').trim()); })()">✏️</button>`:''}
        </div>
        ${(md?.d||md?.map)?`<div style="padding:3px 12px;font-size:var(--fs-caption);font-weight:600;color:var(--text3);background:var(--surface);border-top:1px solid var(--bg);display:flex;gap:8px">${md?.d?`<span>🗓️ ${(md.d||'').slice(2).replace(/-/g,'.')}</span>`:''}${md?.map?`<span>🗺️ ${md.map}</span>`:''}</div>`:''}
        ${isLoggedIn?`<div style="padding:5px 8px;background:var(--surface);border-top:1px solid var(--bg);display:flex;gap:3px;flex-wrap:wrap">
          ${(a!=='TBD'&&b!=='TBD')?`<button class="btn btn-xs" style="flex:1;font-size:10px;${aWin?`background:var(--blue);color:#fff;border-color:var(--blue)`:''}" onclick="setBracketWinner('${tn.id}',${ri},${mi},'${a.replace(/'/g,"\\'")}')">${a.slice(0,5)} 승</button>
          <button class="btn btn-xs" style="flex:1;font-size:10px;${bWin?`background:var(--blue);color:#fff;border-color:var(--blue)`:''}" onclick="setBracketWinner('${tn.id}',${ri},${mi},'${b.replace(/'/g,"\\'")}')">${b.slice(0,5)} 승</button>`:''}
          <button class="btn btn-xs btn-r" style="font-size:10px;padding:0 6px" onclick="clearBracketWinner('${tn.id}',${ri},${mi})" title="승자 초기화">↩️</button>
        </div>`:''}
      </div>`;
    }
    h += `</div></div>`;
    if(ri < totalRounds-1){
      // 각 매치 행마다 ➔를 배치해 연결 관계 명확히 표시
      h += `<div style="display:flex;flex-direction:column;width:28px;flex-shrink:0;padding-top:36px">`;
      for(let _ai=0;_ai<matchCount;_ai++){
        h += `<div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:16px;color:var(--border2);font-weight:900;min-height:${gap+80}px">➔</div>`;
      }
      h += `</div>`;
    }
    h += `</div>`;
  }
  h += `</div></div>`;
  return h;
}
function setBracketWinner(tnId,rnd,mi,winner){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  const key=`${rnd}-${mi}`;
  if(br.winners[key]===winner){br.winners[key]='';} // 토글 off
  else{br.winners[key]=winner;}
  save();render();
}
function clearBracketWinner(tnId,rnd,mi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  const key=`${rnd}-${mi}`;
  if(br.winners && Object.prototype.hasOwnProperty.call(br.winners, key)){
    delete br.winners[key];
  }
  save();render();
}
function setBracketSlot(tnId,rnd,mi,side,val){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const br=getBracket(tn);
  br.slots[`${rnd}-${mi}-${side}`]=val;
  // 슬롯 바꾸면 해당 매치 승자 초기화
  delete br.winners[`${rnd}-${mi}`];
  save();render();
}
function setBracketChamp(tnId,val){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  getBracket(tn).champ=val;save();render();
}
function resetBracket(tnId){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  if(!confirm('브라켓을 초기화하시겠습니까?\n수동으로 입력한 팀 배치와 결과가 모두 삭제됩니다.'))return;
  tn.bracket={slots:{},winners:{},champ:''};save();render();
}

// (요청사항) 티어대회 토너먼트 강수(브라켓 크기) 선택 지원
// - tn.bracketOverrideSize: 2/4/8/16/32/64...
// - 강수를 바꾸면 기존 슬롯/결과가 의미가 없어질 수 있으므로 브라켓을 초기화한다.
function setTierBracketSize(tnId, size){
  const tn=(tourneys||[]).find(t=>t && t.id===tnId); if(!tn) return;
  const sz=parseInt(size,10)||0;
  if(sz<2) return;
  const cur=parseInt(tn.bracketOverrideSize||'0',10)||0;
  if(cur===sz) return;
  if(!confirm(`토너먼트 강수를 ${sz}강으로 변경할까요?\n\n⚠️ 강수를 변경하면 기존 대진표 슬롯/결과가 초기화됩니다.`)) return;
  tn.bracketOverrideSize = sz;
  // 브라켓 데이터 초기화
  tn.bracket = {slots:{},winners:{},champ:'',matchDetails:{}};
  save(); render();
}

/* ── 동적 브라켓 시각화 (스포츠 대진표 스타일) ── */
