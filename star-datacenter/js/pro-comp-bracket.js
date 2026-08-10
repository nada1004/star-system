/* ══════════════════════════════════════════════════════════════
   프로리그 - 대진표(브라켓) 렌더 (pro-comp-core.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function proCompBracket(tn) {
  if (!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  if (!tn.bracket || !tn.bracket.length) {
    const hasGroups = tn.groups && tn.groups.length>0 && tn.groups.some(g=>(g.players||g.univs||[]).length>0||(g.matches||[]).length>0);
    return `<div style="padding:40px;text-align:center;background:var(--surface);border-radius:12px;border:2px dashed var(--border2)">
      <div style="font-size:36px;margin-bottom:12px">🗂️</div>
      <div style="font-size:var(--fs-md);font-weight:700;margin-bottom:8px">대진표가 없습니다</div>
      ${isLoggedIn?`<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px">
        ${hasGroups?`<button class="btn btn-b" onclick="proCompInitBracket('${tn.id}')">📊 조별 순위로 대진표 생성</button>`:''}
        <button class="btn btn-w" onclick="proCompInitBracketManual('${tn.id}')">✏️ 직접 대진표 만들기</button>
      </div>`:''}
    </div>`;
  }
  const _switcher=(typeof _rBktModeSwitcherHTML==='function')?_rBktModeSwitcherHTML():'';
  const vm=window._bktViewMode||'tree';
  if(vm==='compact') return _switcher+_pcBracketCompact(tn);
  if(vm==='poster') return _switcher+_pcBracketPoster(tn);
  if(vm==='broadcast') return _switcher+_pcBracketBroadcast(tn);
  return _switcher+_pcBracketTree(tn);
}
/* ── 프로리그/티어대회 대진표 컴팩트·포스터·브로드캐스트형 공용 헬퍼 ──
   proCompBracket과 동일한 tn.bracket(rounds 배열) 데이터를 그대로 읽어 view-only로 렌더 */
function _pcBracketMeta(tn){
  const rounds=tn.bracket;
  const _pc=name=>players.find(x=>x.name===name)||null;
  const isTierTourney=tn.type==='tier';
  const rndLabel=ri=>ri===rounds.length-1?'🏆 결승':ri===rounds.length-2?'🥈 4강':ri===rounds.length-3?'🥉 8강':`${Math.pow(2,rounds.length-ri)}강`;
  const finalMatch=(rounds[rounds.length-1]||[])[0];
  const champion=finalMatch?.winner==='A'?finalMatch.a:finalMatch?.winner==='B'?finalMatch.b:null;
  return {rounds,_pc,isTierTourney,rndLabel,champion};
}
function _pcChampBanner(champion,_pc,isTierTourney){
  if(!champion) return '';
  const cp=_pc(champion);
  const cpPhoto=cp?.photo?`<img src="${toHttpsUrl(cp.photo)}" style="width:52px;height:52px;border-radius:var(--su_profile_radius,50%);object-fit:cover;border:3px solid rgba(255,255,255,.8)" onerror="this.outerHTML=''">`:
    `<div style="width:52px;height:52px;border-radius:var(--su_profile_radius,50%);background:rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff">${champion[0]}</div>`;
  return `<div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:14px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;gap:14px;box-shadow:0 4px 20px rgba(217,119,6,.35)">
    ${cpPhoto}
    <div>
      <div style="font-size:10px;color:rgba(255,255,255,.8);font-weight:700;letter-spacing:.5px">FINAL CHAMPION</div>
      <div style="font-size:20px;font-weight:900;color:#fff;letter-spacing:.5px">${champion}</div>
      ${isTierTourney?(cp?.tier?`<div style="font-size:var(--fs-caption);color:rgba(255,255,255,.7)">${cp.tier}${cp.race?' · '+cp.race:''}</div>`:''):(cp?.univ?`<div style="font-size:var(--fs-caption);color:rgba(255,255,255,.7)">${cp.univ}${cp.race?' · '+cp.race:''}</div>`:'')}
    </div>
  </div>`;
}
function _pcBracketCompact(tn){
  const {rounds,_pc,isTierTourney,rndLabel,champion}=_pcBracketMeta(tn);
  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <span style="font-weight:900;font-size:var(--fs-md);color:var(--blue)">🏆 ${tn.name} 토너먼트</span>
    <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 컴팩트형 · 라운드별 리스트</span>
  </div>`+_pcChampBanner(champion,_pc,isTierTourney);
  rounds.forEach((rnd,ri)=>{
    h+=`<div style="margin-bottom:14px">
      <div style="font-size:var(--fs-sm);font-weight:900;color:#fff;padding:6px 12px;background:linear-gradient(135deg,#3b82f6,var(--blue-d));border-radius:8px 8px 0 0;letter-spacing:.5px">${rndLabel(ri)}</div>
      <div style="border:1.5px solid var(--border);border-top:0;border-radius:0 0 10px 10px;overflow:hidden">`;
    rnd.forEach((m,mi)=>{
      const aWin=m.winner==='A', bWin=m.winner==='B';
      const scoreA=(m._games||[]).filter(g=>g.winner==='A').length;
      const scoreB=(m._games||[]).filter(g=>g.winner==='B').length;
      const hasScore=Array.isArray(m._games)&&m._games.length>1;
      h+=`<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;${mi>0?'border-top:1px solid var(--bg)':''}">
        <div style="flex:1;min-width:0;text-align:right;font-weight:${aWin?'900':'700'};color:${aWin?'var(--red)':m.a&&m.a!=='TBD'?'var(--text2)':'var(--text3)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.a||'TBD'}${hasScore?` <span style="color:${aWin?'var(--red)':'var(--text3)'}">${scoreA}</span>`:''}</div>
        <div style="flex-shrink:0;font-size:var(--fs-caption);font-weight:800;color:var(--gray-l)">vs</div>
        <div style="flex:1;min-width:0;font-weight:${bWin?'900':'700'};color:${bWin?'var(--red)':m.b&&m.b!=='TBD'?'var(--text2)':'var(--text3)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${hasScore?`<span style="color:${bWin?'var(--red)':'var(--text3)'}">${scoreB}</span> `:''}${m.b||'TBD'}</div>
      </div>`;
    });
    h+=`</div></div>`;
  });
  return h;
}
function _pcBracketPoster(tn){
  const {rounds,_pc,isTierTourney,rndLabel,champion}=_pcBracketMeta(tn);
  const _av=(name)=>{
    if(!name||name==='TBD') return `<div style="width:44px;height:44px;border-radius:var(--su_profile_radius,50%);background:var(--surface)"></div>`;
    const p=_pc(name);
    return p&&p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:44px;height:44px;border-radius:var(--su_profile_radius,50%);object-fit:cover" onerror="this.style.display='none'">`
      :`<div style="width:44px;height:44px;border-radius:var(--su_profile_radius,50%);background:var(--blue);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#fff">${name[0]}</div>`;
  };
  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <span style="font-weight:900;font-size:var(--fs-md);color:var(--blue)">🏆 ${tn.name} 토너먼트</span>
    <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 포스터형 · 라운드별 카드</span>
  </div>`+_pcChampBanner(champion,_pc,isTierTourney);
  rounds.forEach((rnd,ri)=>{
    h+=`<div style="margin-bottom:18px">
      <div style="font-size:var(--fs-sm);font-weight:900;color:var(--blue);margin-bottom:9px;letter-spacing:.5px">${rndLabel(ri)}</div>
      <div style="display:flex;flex-wrap:wrap;gap:12px">`;
    rnd.forEach(m=>{
      const aWin=m.winner==='A', bWin=m.winner==='B';
      const scoreA=(m._games||[]).filter(g=>g.winner==='A').length;
      const scoreB=(m._games||[]).filter(g=>g.winner==='B').length;
      const hasScore=Array.isArray(m._games)&&m._games.length>1;
      const winC=m.winner?'var(--red)':'var(--border)';
      h+=`<div style="width:230px;background:var(--white);border:2px solid ${winC}55;border-radius:16px;overflow:hidden;box-shadow:0 3px 14px rgba(0,0,0,.08)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px 8px;gap:8px">
          <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;min-width:0">
            ${_av(m.a)}
            <span style="font-size:var(--fs-sm);font-weight:${aWin?'900':'700'};color:${aWin?'var(--red)':m.a&&m.a!=='TBD'?'var(--text2)':'var(--text3)'};text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90px">${m.a||'TBD'}</span>
          </div>
          <span style="font-size:11px;font-weight:900;color:var(--gray-l);flex-shrink:0">VS</span>
          <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;min-width:0">
            ${_av(m.b)}
            <span style="font-size:var(--fs-sm);font-weight:${bWin?'900':'700'};color:${bWin?'var(--red)':m.b&&m.b!=='TBD'?'var(--text2)':'var(--text3)'};text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90px">${m.b||'TBD'}</span>
          </div>
        </div>
        ${hasScore?`<div style="text-align:center;padding:6px;font-weight:900;font-size:var(--fs-md);color:var(--text2);border-top:1px solid var(--bg);background:var(--surface)">${scoreA} : ${scoreB}</div>`:`<div style="text-align:center;padding:6px;font-size:var(--fs-caption);color:var(--gray-l);border-top:1px solid var(--bg);background:var(--surface)">${m.a&&m.b&&m.a!=='TBD'&&m.b!=='TBD'?'경기 예정':'대진 확정 전'}</div>`}
      </div>`;
    });
    h+=`</div></div>`;
  });
  return h;
}
function _pcBracketBroadcast(tn){
  const {rounds,_pc,isTierTourney,rndLabel,champion}=_pcBracketMeta(tn);
  const _av=(name)=>{
    if(!name||name==='TBD') return '';
    const p=_pc(name);
    return p&&p.photo?`<img src="${toHttpsUrl(p.photo)}" style="width:24px;height:24px;border-radius:var(--su_profile_radius,50%);object-fit:cover" onerror="this.style.display='none'">`
      :`<div style="width:24px;height:24px;border-radius:var(--su_profile_radius,50%);background:#334155;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#fff">${name[0]}</div>`;
  };
  let h=`<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
    <span style="font-weight:900;font-size:var(--fs-md);color:var(--blue)">🏆 ${tn.name} 토너먼트</span>
    <span style="font-size:var(--fs-caption);color:var(--gray-l)">※ 브로드캐스트형</span>
  </div>`+_pcChampBanner(champion,_pc,isTierTourney);
  rounds.forEach((rnd,ri)=>{
    h+=`<div style="margin-bottom:14px">
      <div style="display:inline-block;font-size:var(--fs-caption);font-weight:900;color:#fff;background:#0f172a;padding:4px 14px;border-radius:999px;margin-bottom:8px;letter-spacing:1px">${rndLabel(ri)}</div>
      <div style="display:flex;flex-direction:column;gap:6px">`;
    rnd.forEach(m=>{
      const aWin=m.winner==='A', bWin=m.winner==='B';
      const scoreA=(m._games||[]).filter(g=>g.winner==='A').length;
      const scoreB=(m._games||[]).filter(g=>g.winner==='B').length;
      const hasScore=Array.isArray(m._games)&&m._games.length>1;
      h+=`<div style="display:flex;align-items:stretch;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.12)">
        <div style="flex:1;display:flex;align-items:center;gap:8px;padding:10px 14px;background:${aWin?'#b91c1c':'#1e293b'};${!m.winner?'':aWin?'':'opacity:.55'}">
          ${_av(m.a)}
          <span style="color:#fff;font-weight:${aWin?'900':'700'};font-size:var(--fs-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.a||'TBD'}</span>
        </div>
        <div style="flex-shrink:0;display:flex;align-items:center;justify-content:center;padding:0 14px;background:#0f172a;color:#fff;font-weight:900;font-size:var(--fs-sm);min-width:64px">${hasScore?`${scoreA} : ${scoreB}`:'VS'}</div>
        <div style="flex:1;display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:10px 14px;background:${bWin?'#b91c1c':'#1e293b'};${!m.winner?'':bWin?'':'opacity:.55'}">
          <span style="color:#fff;font-weight:${bWin?'900':'700'};font-size:var(--fs-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:right">${m.b||'TBD'}</span>
          ${_av(m.b)}
        </div>
      </div>`;
    });
    h+=`</div></div>`;
  });
  return h;
}
function _pcBracketTree(tn) {
  const rounds = tn.bracket;
  const _pc = name => players.find(x=>x.name===name)||null;
  const isTierTourney = tn.type === 'tier';
  const _ls = (typeof proCompGetLayoutScale==='function') ? proCompGetLayoutScale() : 1;
  const _s = (n, min)=>Math.max(min||0, Math.round(n*_ls));
  const _photo = (name, isWin, isDone, col) => {
    const p=_pc(name);
    const isLose = !!isDone && !isWin;
    const sz = _s(36, 22);
    if (!name||name==='TBD') return `<div style="width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,50%);background:#e2e8f0;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:${_s(14,11)}px;color:#94a3b8">?</div>`;
    const ring = isWin?`box-shadow:0 0 0 2px ${col},0 0 0 4px ${col}33`:`border:2px solid #e2e8f0`;
    const safe = escJS(name);
    const click = `onclick="openPlayerModal('${safe}')"`;
    const pointer = `cursor:pointer;`;
    return p&&p.photo
      ?`<img ${click} src="${toHttpsUrl(p.photo)}" style="${pointer}width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,50%);object-fit:cover;flex-shrink:0;${ring};${isLose?'filter:grayscale(1);opacity:.58;':''}" onerror="this.style.display='none'">`
      :`<div ${click} style="${pointer}width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,50%);background:${isLose?'#cbd5e1':col};flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:${_s(13,11)}px;font-weight:900;color:${isLose?'#64748b':'#fff'};${ring};${isLose?'opacity:.7;':''}">${name[0]}</div>`;
  };
  const _info = name => {
    const p=_pc(name); if(!p) return '';
    const rb = p.race?`<span style="font-size:8px;padding:1px 4px;border-radius:2px;font-weight:700;background:${p.race==='T'?'#dbeafe':p.race==='Z'?'#ede9fe':'#fef3c7'};color:${p.race==='T'?'#1e40af':p.race==='Z'?'#5b21b6':'#92400e'}">${p.race}</span>`:'';
    const meta = isTierTourney ? (p.tier||'') : `${p.tier?p.tier+' · ':''}${p.univ||''}`;
    return meta ? `<div style="display:flex;align-items:center;gap:3px;margin-top:1px">${rb}<span style="font-size:var(--fs-caption);font-weight:600;color:var(--text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px">${meta}</span></div>`
      : (rb ? `<div style="display:flex;align-items:center;gap:3px;margin-top:1px">${rb}</div>` : '');
  };
  // 라운드 표기: 16강/8강/4강/결승 (※ 4강=준결승)
  const rndLabel = ri => ri===rounds.length-1?'🏆 결승':ri===rounds.length-2?'🥈 4강':ri===rounds.length-3?'🥉 8강':`${Math.pow(2,rounds.length-ri)}강`;
  const rndColor = ri => ri===rounds.length-1?'#d97706':ri===rounds.length-2?'#7c3aed':ri===rounds.length-3?'#dc2626':'#2563eb';
  const rndBg   = ri => ri===rounds.length-1?'linear-gradient(135deg,#f59e0b,#d97706)':ri===rounds.length-2?'linear-gradient(135deg,#8b5cf6,#6d28d9)':ri===rounds.length-3?'linear-gradient(135deg,#ef4444,#b91c1c)':'linear-gradient(135deg,#3b82f6,#1d4ed8)';

  // 브라켓 경기 목록 (매치 셀렉터용)
  const _allBktMatches = [];
  (rounds||[]).forEach((rnd,ri)=>{
    (rnd||[]).forEach((m,mi)=>{
      if(m.a&&m.b&&m.a!=='TBD'&&m.b!=='TBD') _allBktMatches.push({ri,mi,a:m.a,b:m.b,label:`${rnd.length>1?`${Math.pow(2,rounds.length-ri)}강 경기${mi+1}`:ri===rounds.length-1?'결승':'준결승'} — ${m.a} vs ${m.b}`});
    });
  });

  let h = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap">
    <div style="font-weight:900;font-size:var(--fs-md);color:var(--blue)">🏆 ${tn.name} 토너먼트</div>
    ${isLoggedIn?`<button class="btn btn-w btn-sm" onclick="proCompOpenSeedModal('${tn.id}')" title="상위시드(부전승/라운드 합류) 및 배치 지원">🎫 시드/부전승</button>`:''}
    ${isLoggedIn&&_allBktMatches.length?`<button class="btn btn-p btn-sm" onclick="openPcBktBulkPasteModal('${tn.id}')" style="display:inline-flex;align-items:center;gap:5px">📋 자동인식</button><span style="font-size:var(--fs-caption);color:var(--gray-l)">여러 경기 한번에 입력 가능</span>`:''}
    ${isLoggedIn?`<button class="btn btn-b btn-sm" onclick="openPcBktAutoBuildModal('${tn.id}')" title="결과 붙여넣기로 대진표를 자동 생성">🧠 대진표 자동인식</button>`:''}
    ${isLoggedIn?`<button class="btn btn-r btn-sm" onclick="proCompDeleteBracket('${tn.id}')" title="대진표(토너먼트) 삭제">🗑️ 대진표 삭제</button>`:''}
  </div>`;

  // 챔피언 배너
  const finalMatch = (rounds[rounds.length-1]||[])[0];
  const champion = finalMatch?.winner==='A'?finalMatch.a:finalMatch?.winner==='B'?finalMatch.b:null;
  if (champion) {
    const cp = _pc(champion);
    const cpSz = _s(52, 34);
    const cpPhoto = cp?.photo?`<img src="${toHttpsUrl(cp.photo)}" style="width:${cpSz}px;height:${cpSz}px;border-radius:var(--su_profile_radius,50%);object-fit:cover;border:3px solid rgba(255,255,255,.8)" onerror="this.outerHTML=''">`:
      `<div style="width:${cpSz}px;height:${cpSz}px;border-radius:var(--su_profile_radius,50%);background:rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-size:${_s(22,16)}px;font-weight:900;color:#fff">${champion[0]}</div>`;
    h += `<div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:14px;padding:${_s(14,10)}px ${_s(20,14)}px;margin-bottom:${_s(16,12)}px;display:flex;align-items:center;gap:${_s(14,10)}px;box-shadow:0 4px 20px rgba(217,119,6,.35)">
      ${cpPhoto}
      <div>
        <div style="font-size:10px;color:rgba(255,255,255,.8);font-weight:700;letter-spacing:.5px">FINAL CHAMPION</div>
        <div style="font-size:20px;font-weight:900;color:#fff;letter-spacing:.5px">${champion}</div>
        ${isTierTourney ? (cp?.tier?`<div style="font-size:var(--fs-caption);color:rgba(255,255,255,.7)">${cp.tier}${cp.race?' · '+cp.race:''}</div>`:'') : (cp?.univ?`<div style="font-size:var(--fs-caption);color:rgba(255,255,255,.7)">${cp.univ}${cp.race?' · '+cp.race:''}</div>`:'')}
      </div>
    </div>`;
  }

  h += `<div style="overflow-x:auto;padding-bottom:16px"><div style="display:inline-flex;gap:0;align-items:flex-start;min-width:fit-content">`;
  rounds.forEach((rnd, ri) => {
    const lbl=rndLabel(ri), col=rndColor(ri), bg=rndBg(ri);
    const isLast=ri===rounds.length-1;
    const gap=ri===0?_s(8,6):(Math.pow(2,ri)*_s(60,40)+_s(8,6));
    h += `<div style="display:flex;align-items:center">
      <div style="min-width:${isLast?_s(220,160):_s(200,150)}px;flex-shrink:0">
        <div style="text-align:center;font-size:var(--fs-sm);font-weight:900;color:#fff;margin-bottom:${_s(10,8)}px;padding:${_s(7,6)}px ${_s(10,8)}px;background:${bg};border-radius:var(--r);box-shadow:0 3px 8px ${col}44;letter-spacing:.5px">${lbl}</div>
        <div style="display:flex;flex-direction:column;gap:${gap}px">`;
    rnd.forEach((m, mi) => {
      const aWin=m.winner==='A', bWin=m.winner==='B', isDone=!!m.winner;
      const hasBoth=m.a&&m.b&&m.a!=='TBD'&&m.b!=='TBD';
      const aTBD=!m.a||m.a==='TBD', bTBD=!m.b||m.b==='TBD';
      const _isBye = (x)=>!x||x==='TBD'||String(x).toUpperCase()==='BYE';
      const _canBye = (!aTBD && _isBye(m.b)) || (!bTBD && _isBye(m.a));
      const winnerName=aWin?m.a:bWin?m.b:'';
      const scoreA=(m._games||[]).filter(g=>g.winner==='A').length;
      const scoreB=(m._games||[]).filter(g=>g.winner==='B').length;
      const hasGames = Array.isArray(m._games) && m._games.length>0;
      const isTieSaved = !isDone && hasGames && scoreA===scoreB && (scoreA+scoreB)>0;
      const showScore=(isDone||isTieSaved) && hasGames && m._games.length>1;
      h += `<div style="border-radius:12px;overflow:hidden;background:var(--white);box-shadow:${isDone?`0 4px 16px ${col}28,0 1px 4px rgba(0,0,0,.08)`:isLast?`0 2px 12px rgba(0,0,0,.1)`:'0 1px 6px rgba(0,0,0,.07)'};border:${isLast&&isDone?`2px solid ${col}66`:isDone?`1.5px solid ${col}44`:'1.5px solid #e2e8f0'}">
        <!-- A 선수 -->
        <div style="padding:${_s(9,7)}px ${_s(12,10)}px;border-bottom:1px solid #f1f5f9;background:${aWin?col+'18':aTBD?'#f8fafc':'#fff'};display:flex;align-items:center;gap:${_s(8,6)}px;${aWin?`border-left:3px solid ${col}`:''};${!isDone||aWin?'':'opacity:.55'}">
          ${_photo(m.a, aWin, isDone, col)}
          <div style="flex:1;min-width:0">
            <div style="font-size:var(--fs-sm);font-weight:${aWin?'800':aTBD?'400':'550'};color:${aWin?col:aTBD?'#94a3b8':isDone?'#94a3b8':'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${m.a&&!aTBD?'pointer':'default'}" onclick="${m.a&&!aTBD?`openPlayerModal('${(m.a||'').replace(/'/g,"\\'")}')`:''}">${m.a||'TBD'}</div>
            ${!aTBD?_info(m.a):''}
          </div>
          ${showScore?`<span style="font-size:var(--fs-caption);font-weight:900;color:${aWin?col:'#94a3b8'};flex-shrink:0">${scoreA}</span>`:''}
          ${aWin?`<span style="font-size:9px;font-weight:900;color:#fff;background:${col};padding:2px 7px;border-radius:6px;flex-shrink:0">WIN</span>`:''}
        </div>
        <!-- B 선수 -->
        <div style="padding:${_s(9,7)}px ${_s(12,10)}px;background:${bWin?col+'18':bTBD?'#f8fafc':'#fff'};display:flex;align-items:center;gap:${_s(8,6)}px;${bWin?`border-left:3px solid ${col}`:''};${!isDone||bWin?'':'opacity:.55'}">
          ${_photo(m.b, bWin, isDone, col)}
          <div style="flex:1;min-width:0">
            <div style="font-size:var(--fs-sm);font-weight:${bWin?'800':bTBD?'400':'550'};color:${bWin?col:bTBD?'#94a3b8':isDone?'#94a3b8':'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${m.b&&!bTBD?'pointer':'default'}" onclick="${m.b&&!bTBD?`openPlayerModal('${(m.b||'').replace(/'/g,"\\'")}')`:''}">${m.b||'TBD'}</div>
            ${!bTBD?_info(m.b):''}
          </div>
          ${showScore?`<span style="font-size:var(--fs-caption);font-weight:900;color:${bWin?col:'#94a3b8'};flex-shrink:0">${scoreB}</span>`:''}
          ${bWin?`<span style="font-size:9px;font-weight:900;color:#fff;background:${col};padding:2px 7px;border-radius:6px;flex-shrink:0">WIN</span>`:''}
        </div>
        <!-- 맵 -->
        ${m.map?`<div style="padding:${_s(3,3)}px ${_s(12,10)}px;font-size:var(--fs-caption);font-weight:600;color:var(--text3);background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:${_s(8,6)}px;flex-wrap:wrap"><span>🗺️ ${m.map}</span></div>`:''}
        ${m.note?`<div style="padding:${_s(4,4)}px ${_s(12,10)}px;font-size:10px;color:#64748b;background:#f8fafc;border-top:1px solid #f1f5f9;line-height:1.5;word-break:break-word">📝 ${String(m.note).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`:''}
        ${isTieSaved?`<div style="padding:${_s(3,3)}px ${_s(12,10)}px;font-size:var(--fs-caption);font-weight:900;color:#b45309;background:#fffbeb;border-top:1px solid #f1f5f9;display:flex;gap:${_s(8,6)}px;align-items:center">
          <span>⚖️ 동률 저장</span><span style="margin-left:auto">${scoreA}:${scoreB}</span>
        </div>`:''}
        <!-- 게임 상세 -->
        ${hasGames?`<div style="padding:${_s(3,3)}px ${_s(12,10)}px ${_s(4,4)}px;font-size:9px;background:#f8fafc;border-top:1px solid #f1f5f9;color:#64748b;line-height:1.9">${m._games.map((g,gi)=>`<span style="margin-right:${_s(8,6)}px">${gi+1}G·<b style="color:${g.winner==='A'?col:'#dc2626'}">${g.winner==='A'?m.a||'A':m.b||'B'}</b>${g.map?` <span style="color:#94a3b8">${g.map}</span>`:''}</span>`).join('')}</div>`:''}
        <!-- 옵션 버튼 -->
        <div style="padding:${_s(5,5)}px ${_s(8,7)}px;background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:${_s(3,3)}px;flex-wrap:wrap">
          ${isDone?(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?`<button class="btn btn-p btn-xs no-export" style="min-width:98px;display:inline-flex;align-items:center;justify-content:center" onclick="_openProCompBktShareCard('${tn.id}',${ri},${mi})">🎴 공유 카드</button>`:'';})():''}
          ${isLoggedIn?`${hasBoth?`<button class="btn btn-xs" style="flex:1;font-size:9px;${aWin?`background:${col};color:#fff;border-color:${col}`:''}" onclick="proCompSetBktWinner('${tn.id}',${ri},${mi},'A')">${(m.a||'A').slice(0,5)} 승</button>
            <button class="btn btn-xs" style="flex:1;font-size:9px;${bWin?`background:${col};color:#fff;border-color:${col}`:''}" onclick="proCompSetBktWinner('${tn.id}',${ri},${mi},'B')">${(m.b||'B').slice(0,5)} 승</button>`:''}
            ${_canBye?`<button class="btn btn-xs" style="font-size:9px;padding:0 6px;border-color:#f59e0b;color:#b45309;background:#fffbeb" onclick="proCompApplyBye('${tn.id}',${ri},${mi})" title="부전승 처리">부전승</button>`:''}
            <button class="btn btn-xs btn-p" style="font-size:9px;padding:0 6px;${hasBoth?'':'opacity:.35'}" onclick="${hasBoth?`openPcBktPasteModal('${tn.id}',${ri},${mi})`:'alert(\"선수 확정 후 사용\")'}" title="자동인식">📋 자동인식</button>
            <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompBktEditPlayers('${tn.id}',${ri},${mi})" title="경기 추가/수정">✏️ 경기수정</button>
            <button class="btn btn-xs btn-r" style="font-size:9px;padding:0 6px" onclick="proCompClearBktMatch('${tn.id}',${ri},${mi})" title="경기 삭제(초기화)">🗑</button>`:''}
        </div>
      </div>`;
    });
    h += `</div></div>`;
    // 라운드 간 화살표 커넥터
    if (ri < rounds.length-1) h += `<div style="width:${_s(28,22)}px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:${_s(18,14)}px;color:#cbd5e1;font-weight:900;align-self:center;padding-top:${_s(36,26)}px">➔</div>`;
    h += `</div>`;
  });
  h += `</div></div>`;
  // 3위전
  if (rounds.length >= 2 && tn.thirdPlace) {
    const tp = tn.thirdPlace;
    const tpA = tp.winner==='A', tpB = tp.winner==='B';
    const tpBoth = tp.a&&tp.b&&tp.a!=='TBD'&&tp.b!=='TBD';
    const tpCol = '#78716c';
    const tpWinner = tpA?tp.a:tpB?tp.b:null;
    h += `<div style="margin-top:20px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:var(--fs-base);font-weight:900;color:${tpCol}">🥉 3·4위전</span>
        ${tpWinner?`<span style="font-size:var(--fs-caption);background:#78716c18;color:#78716c;padding:2px 10px;border-radius:20px;font-weight:700">3위 · ${tpWinner}</span>`:''}
      </div>
      <div style="border-radius:12px;overflow:hidden;background:var(--white);box-shadow:0 2px 10px rgba(0,0,0,.08);border:${tp.winner?`1.5px solid ${tpCol}44`:'1.5px solid #e2e8f0'};max-width:230px">
        <div style="padding:9px 12px;border-bottom:1px solid #f1f5f9;background:${tpA?tpCol+'18':'#fff'};display:flex;align-items:center;gap:8px;${tpA?`border-left:3px solid ${tpCol}`:''};${tp.winner&&!tpA?'opacity:.55':''}">
          ${_photo(tp.a, tpA, !!tp.winner, tpCol)}
          <div style="flex:1;min-width:0">
            <div style="font-size:var(--fs-sm);font-weight:${tpA?'800':'550'};color:${tpA?tpCol:'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${tp.a&&tp.a!=='TBD'?'pointer':'default'}" onclick="${tp.a&&tp.a!=='TBD'?`openPlayerModal('${(tp.a||'').replace(/'/g,"\\'")}')`:''}">${tp.a||'TBD'}</div>
            ${tp.a&&tp.a!=='TBD'?_info(tp.a):''}
          </div>
          ${tpB?`<span style="font-size:9px;font-weight:900;color:#fff;background:${tpCol};padding:2px 7px;border-radius:6px;flex-shrink:0">🏆 3위</span>`:''}
        </div>
        <div style="padding:9px 12px;background:${tpB?tpCol+'18':'#fff'};display:flex;align-items:center;gap:8px;${tpB?`border-left:3px solid ${tpCol}`:''};${tp.winner&&!tpB?'opacity:.55':''}">
          ${_photo(tp.b, tpB, !!tp.winner, tpCol)}
          <div style="flex:1;min-width:0">
            <div style="font-size:var(--fs-sm);font-weight:${tpB?'800':'550'};color:${tpB?tpCol:'#374151'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:${tp.b&&tp.b!=='TBD'?'pointer':'default'}" onclick="${tp.b&&tp.b!=='TBD'?`openPlayerModal('${(tp.b||'').replace(/'/g,"\\'")}')`:''}">${tp.b||'TBD'}</div>
            ${tp.b&&tp.b!=='TBD'?_info(tp.b):''}
          </div>
          ${tpB?`<span style="font-size:9px;font-weight:900;color:#fff;background:${tpCol};padding:2px 7px;border-radius:6px;flex-shrink:0">🏆 3위</span>`:''}
        </div>
        ${(tp.map||tp.d)?`<div style="padding:3px 12px;font-size:var(--fs-caption);font-weight:600;color:var(--text3);background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:8px">${tp.d?`<span>🗓️ ${tp.d.slice(2).replace(/-/g,'.')}</span>`:''}${tp.map?`<span>🗺️ ${tp.map}</span>`:''}</div>`:''}
        <div style="padding:5px 8px;background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;gap:3px;flex-wrap:wrap">
          ${tp.winner?(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?`<button class="btn btn-xs no-export" style="font-size:9px;padding:1px 6px;background:${tpCol}18;color:${tpCol};border-color:${tpCol}44" onclick="_openProCompBktShareCard('${tn.id}','3rd',0)" title="공유카드">📷</button>`:'';})():''}
          ${isLoggedIn?`${tpBoth?`<button class="btn btn-xs" style="flex:1;font-size:9px;${tpA?`background:${tpCol};color:#fff;border-color:${tpCol}`:''}" onclick="proCompSetThirdWinner('${tn.id}','A')">${(tp.a||'A').slice(0,5)} 승</button>
            <button class="btn btn-xs" style="flex:1;font-size:9px;${tpB?`background:${tpCol};color:#fff;border-color:${tpCol}`:''}" onclick="proCompSetThirdWinner('${tn.id}','B')">${(tp.b||'B').slice(0,5)} 승</button>`:''}
            <button class="btn btn-xs" style="font-size:9px;padding:0 5px;${tpBoth?'':'opacity:.35'}" onclick="proCompOpenThirdPaste('${tn.id}')" title="${tpBoth?'결과 붙여넣기':'선수 확정 후 사용'}">📋</button>
            <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompSetThirdDate('${tn.id}')">🗓️</button>
            <button class="btn btn-xs" style="font-size:9px;padding:0 5px" onclick="proCompSetThirdMap('${tn.id}')">🗺️</button>`:''}
        </div>
      </div>
    </div>`;
  }
  if (isLoggedIn) h += `<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
    ${rounds.length >= 2 && !tn.thirdPlace ? `<button class="btn btn-w btn-sm" onclick="proCompAddThirdPlace('${tn.id}')">+ 3·4위전 추가</button>` : ''}
    ${rounds.length >= 2 && tn.thirdPlace ? `<button class="btn btn-w btn-sm" onclick="proCompRemoveThirdPlace('${tn.id}')">🗑️ 3·4위전 제거</button>` : ''}
    <button class="btn btn-r btn-sm" onclick="proCompResetBracket('${tn.id}')">🔄 대진표 초기화</button>
  </div>`;
  return h;
}

/* ══════════════════════════════════════════════════════════════
   (요청사항) 시드/부전승(라운드 합류) + 자동 배치
   - 예: 32강 대회에서 일부 선수가 16강/8강부터 합류
   - 저장: tn.seedStarts = { "선수명": 16|8|4|2 ... } (숫자는 시작 라운드 강수)
══════════════════════════════════════════════════════════════ */
function _pcRoundLabelBySize(sz){
  if(sz===2) return '결승';
  if(sz===4) return '4강';
  if(sz===8) return '8강';
  if(sz===16) return '16강';
  if(sz===32) return '32강';
  if(sz===64) return '64강';
  return `${sz}강`;
}
const _PC_STAGE_ROUNDS = ['64강','32강','16강','8강','4강','결승'];
function _pcEnsureStageRecords(tn){
  if(!tn.stageRecords) tn.stageRecords = {};
  _PC_STAGE_ROUNDS.forEach(r=>{ if(!Array.isArray(tn.stageRecords[r])) tn.stageRecords[r] = []; });
}
function _pcNormalizeStageRound(round){
  const r = String(round||'').trim();
  return _PC_STAGE_ROUNDS.includes(r) ? r : '16강';
}

// (요청사항) 붙여넣기 결과로 대진표(토너먼트) 자동 생성
// - 입력은 "승자 패자 [맵]" 여러 줄(게임 단위) 또는 세트 구분을 허용
// - 동일한 두 선수 조합은 한 매치로 묶어서 점수 계산 후 winner 결정
function _pcBktBuildFromPasteApplyLogic(savable, tn){
  if(!tn) return false;
  const dateEl = document.getElementById('paste-date');
  const dateVal = dateEl ? (dateEl.value||'') : '';

  // 1) 게임들을 매치(선수쌍)로 묶기
  const matchMap = {}; // key => {a,b,games:[{w,l,map}]}
  const _extractRound = (txt)=>{
    const s=String(txt||'');
    const m=s.match(/(64강|32강|16강|8강|4강|준결승|결승)/);
    return m ? m[1] : null;
  };
  savable.forEach(r=>{
    const w = r.wPlayer?.name; const l = r.lPlayer?.name;
    if(!w || !l) return;
    const k = [w,l].sort().join('|');
    const rndHint = r._rndLabel || r.rndLabel || r._roundLabel || _extractRound(r._lineMemo) || _extractRound(r.memo) || null;
    if(!matchMap[k]) matchMap[k] = { p1: w, p2: l, games: [], rnd: rndHint };
    // 라운드 정보는 첫 등장 라인 기준
    if(!matchMap[k].rnd && rndHint) matchMap[k].rnd = rndHint;
    matchMap[k].games.push({ w, l, map: r.map||'' });
  });
  const matches = Object.values(matchMap);
  if(!matches.length){ alert('저장 가능한 경기가 없습니다.'); return false; }

  // 2) 대진표 크기 추정: (라운드 라벨 우선) → 없으면 참가자 수 기준
  const playersSet = new Set();
  matches.forEach(m=>{ playersSet.add(m.p1); playersSet.add(m.p2); });
  const nPlayers = playersSet.size;
  // (요청사항) 티어대회(개인전)일 때: 붙여넣기에 등장한 선수들을 조편성에 자동 반영
  try{
    if(tn.type==='tier'){
      if(!tn.groups) tn.groups=[];
      if(!tn.groups.length) tn.groups.push({name:'A조',univs:[],matches:[]});
      const g0=tn.groups[0];
      if(!g0.univs) g0.univs=[];
      playersSet.forEach(n=>{ if(n && !g0.univs.includes(n)) g0.univs.push(n); });
    }
  }catch(e){}
  const _lblToSize = (lbl)=>{
    const s=String(lbl||'').replace(/\s+/g,'');
    if(!s) return null;
    if(s==='결승') return 2;
    if(s==='준결승') return 4;
    if(s==='4강') return 4;
    const m=s.match(/^(\d{1,3})강$/);
    if(m) return parseInt(m[1],10);
    return null;
  };
  let firstSizeFromLabel = 0;
  matches.forEach(m=>{ const sz=_lblToSize(m.rnd); if(sz) firstSizeFromLabel=Math.max(firstSizeFromLabel, sz); });
  let firstSize = firstSizeFromLabel || 2;
  while(firstSize < nPlayers) firstSize *= 2;
  const totalRounds = Math.round(Math.log2(firstSize));
  if(!totalRounds || totalRounds<1){ alert('대진표 크기를 계산할 수 없습니다.'); return false; }

  // 3) 빈 브라켓 생성
  const rounds = [];
  for(let r=0;r<totalRounds;r++){
    const len = Math.max(1, Math.floor(firstSize / Math.pow(2, r+1)));
    const arr=[];
    for(let i=0;i<len;i++) arr.push({a:'TBD', b:'TBD', winner:'', d:'', map:'', _games:[]});
    rounds.push(arr);
  }
  tn.bracket = rounds;

  // 4) 매치를 라운드 라벨 기준으로 배치 (없으면 1라운드로)
  //    - winner를 A/B로 계산하고, 다음 라운드로 전파
  const miCounter = {};
  matches.forEach(m=>{
    const sz = _lblToSize(m.rnd) || firstSize; // 라벨 없으면 최상위(예: 64강)로 처리
    const ri = Math.max(0, Math.min(totalRounds-1, Math.round(Math.log2(firstSize / sz))));
    miCounter[ri] = (miCounter[ri]||0);
    const mi = miCounter[ri]++;
    if(!tn.bracket[ri] || mi >= tn.bracket[ri].length) return;
    const slot = tn.bracket[ri][mi];
    // 참가자
    const pA = m.p1;
    const pB = m.p2;
    slot.a = pA; slot.b = pB;
    if(dateVal) slot.d = dateVal;
    // 게임 목록
    slot._games = m.games.map(g=>{
      const winner = (g.w === pA) ? 'A' : (g.w === pB) ? 'B' : '';
      return { winner, map: g.map||'' };
    }).filter(g=>g.winner);
    const scoreA = slot._games.filter(g=>g.winner==='A').length;
    const scoreB = slot._games.filter(g=>g.winner==='B').length;
    if(scoreA===scoreB){
      // 동률이면 winner 비움
      slot.winner = '';
    } else {
      slot.winner = scoreA>scoreB ? 'A' : 'B';
    }
    // 맵 필드: 단판이면 사용
    if(slot._games.length===1 && slot._games[0].map) slot.map = slot._games[0].map;
    else slot.map = '';

    // 다음 라운드 전파
    if(slot.winner && tn.bracket[ri+1] && tn.bracket[ri+1][Math.floor(mi/2)]){
      const next = tn.bracket[ri+1][Math.floor(mi/2)];
      const isA = (mi%2===0);
      const wName = slot.winner==='A' ? slot.a : slot.b;
      if(isA && (next.a==='TBD' || !next.a)) next.a = wName;
      if(!isA && (next.b==='TBD' || !next.b)) next.b = wName;
    }

    // 개인 최근경기/대전기록 반영
    if(slot.winner){
      try{ _syncBktMatchToHistory(tn, slot, `pbn_${tn.id}_${ri}_${mi}`, ri, mi); }catch(e){}
    }
  });

  save();
  try{ render(); }catch(e){}
  return true;
}

/* ─────────────────────────────────────────────
   (요청사항) 토너먼트 경기 입력 메뉴
   - "대진표(브라켓) 작성"이 아니라 "토너먼트 기록(16강/8강/4강/결승)"을 입력하는 화면
   - 저장 시: player.history 반영 + 대전기록(프로리그 대회 > 토너먼트) 반영
   - (옵션) 대진표(bracket)가 있는 경우에도 별개로 기록 입력 가능
───────────────────────────────────────────── */
function proCompTourMatchInput(tn){
  if(!tn) return `<div style="padding:30px;text-align:center;color:var(--gray-l)">대회를 선택하세요.</div>`;
  _pcEnsureStageRecords(tn);
  const _roundList = (typeof _PC_STAGE_ROUNDS !== 'undefined' && Array.isArray(_PC_STAGE_ROUNDS)) ? _PC_STAGE_ROUNDS : ['64강','32강','16강','8강','4강','결승'];
  const _defaultRound = '16강';
  const _viewRound0 = String(window._pcStageRecRound||'').trim();
  const viewRound = (_viewRound0==='ALL' || _roundList.includes(_viewRound0)) ? _viewRound0 : _defaultRound;
  window._pcStageRecRound = viewRound;

  // ── (요청사항) "대진표에서 기록"한 내용도 이 탭에 자동 반영되도록: 브라켓에서 게임 단위로 수집
  const _getBracketRoundLabel = (tn, ri)=>{
    const total = (tn && Array.isArray(tn.bracket)) ? tn.bracket.length : 0;
    if (!total) return '';
    if (ri === total-1) return '결승';
    if (ri === total-2) return '4강';
    if (ri === total-3) return '8강';
    const n = Math.pow(2, total - ri);
    return `${n}강`;
  };
  const _bracketItems = [];
  let _stageRecSortSeq = 0;
  try{
    if (tn && Array.isArray(tn.bracket)) {
      tn.bracket.forEach((rnd, ri)=>{
        const lbl = _getBracketRoundLabel(tn, ri);
        // 모든 라운드 표시 (round 필터 제거)
        (rnd||[]).forEach((m, mi)=>{
          if (!m || !m.a || !m.b) return;
          const baseId = `pbn_${tn.id}_${ri}_${mi}`;
          const d = m.d || '';
          // (요청사항) 같은 대결(같은 라운드/같은 두 선수)의 게임들은 여러 카드로 쪼개지 않고 매치 1건으로 합쳐서 표시
          const games = (Array.isArray(m._games) && m._games.length)
            ? m._games.filter(g=>g && g.winner)
            : (m.winner ? [{winner:m.winner, map:m.map||'', d:m.d||''}] : []);
          if (!games.length) return;
          const scoreA = games.filter(g=>g.winner==='A').length;
          const scoreB = games.filter(g=>g.winner==='B').length;
          const overallWinner = scoreA>scoreB ? 'A' : scoreB>scoreA ? 'B' : (m.winner||'');
          _bracketItems.push({
            m:{a:m.a,b:m.b,winner:overallWinner,d,map:(games.length===1?(games[0].map||m.map||''):''), _id:`${baseId}_s0_g0`, _roundLabel:lbl, _games:games},
            src:'bkt',
            ri, mi,
            key: baseId,
            _dateKey: d || '',
            _sortSeq: _stageRecSortSeq++
          });
        });
      });
    }
  }catch(e){}

  // 모든 라운드의 stageRecords 수집
  const _stageList = [];
  const _PC_ALL_ROUNDS = Object.keys(tn.stageRecords||{});
  _PC_ALL_ROUNDS.forEach(rndKey => {
    (tn.stageRecords[rndKey]||[]).forEach((m,i) => {
      _stageList.push({
        m: {...m, _roundLabel: rndKey},
        src:'stage',
        idx:i,
        key:(m&&m._id)||`stage_${rndKey}_${i}`,
        mergeKey:`${rndKey}__${(m&&m._id)?m._id:('idx_'+i)}`,
        _dateKey:(m&&m.d)||'',
        _sortSeq: _stageRecSortSeq++,
        _rnd: rndKey
      });
    });
  });

  const sorted = [..._bracketItems, ..._stageList]
    .sort((a,b)=>(b._dateKey||'').localeCompare(a._dateKey||'')||((a._sortSeq??0)-(b._sortSeq??0))||String(a.key).localeCompare(String(b.key)));

  const _getItemRound = (it)=> String(it?._rnd || it?.m?._roundLabel || '').trim();
  const _filtered = (viewRound === 'ALL') ? sorted : sorted.filter(it => _getItemRound(it) === viewRound);
  const _counts = (() => {
    const c = { ALL: sorted.length };
    _roundList.forEach(r => { c[r] = 0; });
    sorted.forEach(it => {
      const r = _getItemRound(it);
      if (r && (r in c)) c[r] += 1;
    });
    return c;
  })();
  const roundBtns = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
    <button class="btn ${viewRound==='ALL'?'btn-b':'btn-w'} btn-xs" onclick="window._pcStageRecRound='ALL';render()">전체 <span style="opacity:.8">(${_counts.ALL||0})</span></button>
    ${_roundList.map(r=>`<button class="btn ${viewRound===r?'btn-b':'btn-w'} btn-xs" onclick="window._pcStageRecRound='${r}';render()">${r} <span style="opacity:.8">(${_counts[r]||0})</span></button>`).join('')}
    ${(typeof pcAltViewModeBarHTML==='function')?`<span class="hist-inline-sep"></span>${pcAltViewModeBarHTML('pctourmatch')}`:''}
  </div>`;
  const _pcAltHTML = ((typeof pcAltViewMode==='function') && pcAltViewMode('pctourmatch')!=='basic') ? pcAltRecordsHTML('pctourmatch', tn) : '';

  const card = (item, displayNo)=>{
    const m = item.m;
    const _cardRound = item._rnd || m._roundLabel || _defaultRound;
    const pa = players.find(p=>p.name===m.a);
    const pb = players.find(p=>p.name===m.b);
    const _ls = (typeof proCompGetLayoutScale==='function') ? proCompGetLayoutScale() : 1;
    const _mainGap = Math.max(6, Math.round(10*_ls));
    const _mainPadT = Math.max(8, Math.round(10*_ls));
    const _mainPadX = Math.max(10, Math.round(12*_ls));
    const _mainPadB = Math.max(10, Math.round(12*_ls));
    const _scoreMinW = Math.max(48, Math.round(60*_ls));
    const isDone = !!m.winner;
    const aWin = isDone && m.winner==='A';
    const bWin = isDone && m.winner==='B';
    const _mGames = Array.isArray(m._games) && m._games.length ? m._games : null;
    const _scoreA = _mGames ? _mGames.filter(g=>g.winner==='A').length : (aWin?1:0);
    const _scoreB = _mGames ? _mGames.filter(g=>g.winner==='B').length : (bWin?1:0);
    const _gameCnt = _mGames ? _mGames.length : 1;
    const col = _cardRound==='결승'?'#f59e0b':_cardRound==='4강'?'#7c3aed':_cardRound==='8강'?'#dc2626':'#2563eb';
    const winRgb = _tcHexToRgbStr(col);
    const _tb = p => p&&p.tier?`<span style="background:${getTierBtnColor(p.tier)||'#64748b'};color:${getTierBtnTextColor(p.tier)||'#fff'};font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px">${p.tier}</span>`:'';
    const _rb = p => p&&p.race?`<span class="rbadge r${p.race}" style="font-size:9px;padding:0 4px">${p.race}</span>`:'';
    const _univ = p => p&&p.univ?`<span style="font-size:9px;color:var(--gray-l);font-weight:600">${p.univ}</span>`:'';
    const dLabel = (m.d||'') ? (m.d||'').slice(2).replace(/-/g,'/') : '미정';
    const _gcByUniv2=(name,p)=>{const _u=p&&p.univ?gc(p.univ):'';return(_u&&_u!=='#6b7280')?_u:gc(name||'');};
    const ca = (typeof gc==='function' ? _gcByUniv2(m.a,players.find(p=>p.name===m.a)) : '#3b82f6');
    const cb = (typeof gc==='function' ? _gcByUniv2(m.b,players.find(p=>p.name===m.b)) : '#ef4444');
    const _fxCfg=(typeof _getRecSideFxCfg==='function')?_getRecSideFxCfg():{on:true,mode:'soft',intensity:68,length:25};
    const _fxOn=!!_fxCfg.on;
    const _fxMetrics=(typeof _buildRecSideFxMetrics==='function')?_buildRecSideFxMetrics(_fxCfg):null;
    const _fxMode=_fxMetrics?_fxMetrics.mode:'soft';
    const _fxVars=(_fxOn&&typeof _recSideFxVarStyle==='function')?_recSideFxVarStyle(ca||'#3b82f6',cb||'#ef4444',_fxCfg):'';
    const _hexRgb2=(h)=>{const s=String(h||'').replace('#','');if(s.length===6){const r=parseInt(s.slice(0,2),16),g=parseInt(s.slice(2,4),16),b=parseInt(s.slice(4,6),16);if(![r,g,b].some(isNaN))return r+','+g+','+b;}return'100,116,139';};
    const _sideRgbVars2=`--rec-side-left-rgb:${_hexRgb2(ca||'#3b82f6')};--rec-side-right-rgb:${_hexRgb2(cb||'#ef4444')};`;
    const _menuBtn = `<button class="btn btn-w btn-xs" style="white-space:nowrap;padding:2px 8px;font-size:16px;line-height:1;font-weight:900" onclick="event.stopPropagation();openPcStageActionMenu(this,'${tn.id}','${_cardRound}',${item.src==='stage'?item.idx:-1},'${item.src}',${item.ri??-1},${item.mi??-1})">⋯</button>`;
    const safe = (s)=>String(s??'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const _photo = (p, name, isLose)=>{
      const sz=28;
      const url = p && p.photo ? toHttpsUrl(p.photo) : '';
      const click = name ? `onclick="openPlayerModal('${escJS(name)}')"` : '';
      const loseStyle = isLose ? 'filter:grayscale(1);opacity:.55;' : '';
      if(url) return `<img src="${url}" style="width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);object-fit:cover;flex-shrink:0;cursor:pointer;${loseStyle}" ${click} onerror="this.style.display='none'">`;
      return `<span style="width:${sz}px;height:${sz}px;border-radius:var(--su_profile_radius,50%);clip-path:var(--su_profile_clip,none);background:var(--surface);border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;font-size:var(--fs-sm);font-weight:900;color:var(--gray-l);flex-shrink:0;${loseStyle}">${safe(name).slice(0,1)||'?'}</span>`;
    };
    const _name = (name, col, isWin, p)=>{
      const click = name ? `onclick="openPlayerModal('${escJS(name)}')"` : '';
      const isLose = isDone && !isWin;
      return `<span style="display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:230px">
        ${_photo(p,name,isLose)}
        <span ${click} style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;font-weight:${isWin?900:700};color:${isWin?'#dc2626':(isLose?'var(--gray-l)':'var(--text)')};${isLose?'opacity:.75;':''}">${safe(name||'?')}</span>
        ${_rb(p)}${_tb(p)}
        ${_univ(p)}
        ${isDone?`<span style="font-size:10px;font-weight:900;color:${isWin?'#dc2626':'#2563eb'}">${isWin?'WIN':'LOSE'}</span>`:''}
      </span>`;
    };
    const _srcChip = item.src==='bkt'
      ? `<span class="rec-meta-chip rec-meta-chip--indigo">🗂️ 대진표</span>`
      : `<span class="rec-meta-chip rec-meta-chip--gray">📝 입력</span>`;
    const _detailPayload = encodeURIComponent(JSON.stringify({
      title:'프로리그 대회 조별리그 대진표 기록',
      subtitle:`${tn.name||''} · ${_cardRound} · ${displayNo}경기`,
      p1:m.a, p2:m.b, p1Score:_scoreA, p2Score:_scoreB,
      winner:aWin?m.a:(bWin?m.b:''), date:m.d||'', games:_mGames||[m]
    }));
    return _proCompH2HCardHTML({
      p1:m.a, p2:m.b, p1Col:ca, p2Col:cb,
      p1Score:_scoreA, p2Score:_scoreB,
      winner:aWin?m.a:(bWin?m.b:''),
      date:m.d||'', games:_mGames||[m],
      badges:[
        `<span style="font-size:var(--fs-caption);color:var(--gray-l)">${dLabel}</span>`,
        `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:linear-gradient(135deg,${col},${col}cc);color:#fff">${_cardRound}</span>`,
        _srcChip,
        `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#f1f5f9;color:#475569">${_gameCnt>1?`${_gameCnt}경기`:`${displayNo}경기`}</span>`,
        m.map?`<span style="font-size:var(--fs-caption);color:var(--gray-l)">🗺️ ${safe(m.map)}</span>`:'',
        m.note?`<span style="font-size:var(--fs-caption);color:var(--gray-l)">📝 ${safe(m.note)}</span>`:'',
        pa&&pa.univ?`<span style="font-size:var(--fs-caption);color:${ca};font-weight:800">${pa.univ}</span>`:'',
        pb&&pb.univ?`<span style="font-size:var(--fs-caption);color:${cb};font-weight:800">${pb.univ}</span>`:'',
        !isDone?`<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#fff7ed;color:#c2410c">예정</span>`:''
      ],
      detailOnClick:`window.openProCompRecordDetailPopup('${_detailPayload}')`,
      actionHtml:_menuBtn
    });
  };

  // 날짜별 그룹화하여 날짜 헤더 카드 추가
  let listHTML;
  if (!_filtered.length) {
    listHTML = `<div style="margin-top:10px;font-size:var(--fs-sm);color:var(--gray-l)">등록된 기록이 없습니다.</div>`;
  } else {
    const _tByDate = {};
    _filtered.forEach((it, idx) => {
      const k = it._dateKey || '날짜 미정';
      if (!_tByDate[k]) _tByDate[k] = [];
      _tByDate[k].push({it, idx});
    });
    const _tDayKeys = Object.keys(_tByDate).sort((a,b) => b.localeCompare(a));
    const _tDayLabels = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
    let _tNo = 0;
    let _tHtml = '';
    _tDayKeys.forEach(dk => {
      let _tDkLabel = dk;
      if (dk !== '날짜 미정') {
        const dt = new Date(dk + 'T00:00:00');
        _tDkLabel = `${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 ${_tDayLabels[dt.getDay()]}`;
      }
      _tHtml += `<div style="margin-bottom:22px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-base);color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">📅 ${_tDkLabel}</div></div>`;
      _tByDate[dk].forEach(({it}) => {
        const _cardHtml = card(it, ++_tNo);
        if (window._pcStageMergeMode && it.src === 'stage') {
          const _mChecked = !!(window._pcStageMergeSel && window._pcStageMergeSel.has(it.mergeKey));
          _tHtml += `<div style="position:relative;${_mChecked?'outline:2px solid #7c3aed;border-radius:14px;':''}">
            <label style="position:absolute;top:8px;left:8px;z-index:5;display:flex;align-items:center;gap:4px;background:#fff;border:1px solid var(--border);border-radius:8px;padding:3px 8px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.08)" onclick="event.stopPropagation()">
              <input type="checkbox" ${_mChecked?'checked':''} onchange="proCompToggleStageMergeSel('${it.mergeKey}')" style="width:16px;height:16px;cursor:pointer">
              <span style="font-size:10px;font-weight:700;color:var(--gray-l)">선택</span>
            </label>
            ${_cardHtml}
          </div>`;
        } else {
          _tHtml += _cardHtml;
        }
      });
      _tHtml += `</div>`;
    });
    listHTML = `<div style="margin-top:10px;display:flex;flex-direction:column;gap:0">${_tHtml}</div>`;
  }

  return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:12px">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <div style="font-weight:900;color:#1d4ed8">🗂️ 대진표 기록(토너먼트 기록)</div>
      <div style="font-size:var(--fs-sm);color:var(--gray-l)">대진표 작성이 아니라, 라운드별 경기 결과를 기록합니다 (64강/32강/16강/8강/4강/결승)</div>
      <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">
        ${isLoggedIn?`<button class="btn btn-b btn-sm" onclick="openPcStageAddMenu(this,'${tn.id}')">+ 대진표 추가</button>
        <button class="btn btn-p btn-sm" onclick="openPcStageBulkPasteModal('${tn.id}','ALL')">📋 붙여넣기(자동인식)</button>
        <button class="btn ${window._pcStageMergeMode?'btn-b':'btn-w'} btn-sm" onclick="proCompToggleStageMergeMode()">${window._pcStageMergeMode?'✅ 합치기 모드 종료':'🔀 경기 선택해서 합치기'}</button>
        ${window._pcStageMergeMode?`<button class="btn btn-p btn-sm" onclick="proCompMergeSelectedStageMatches('${tn.id}')" ${(!window._pcStageMergeSel||window._pcStageMergeSel.size<2)?'disabled':''}>선택 합치기 (${(window._pcStageMergeSel&&window._pcStageMergeSel.size)||0})</button>`:''}`:''}
      </div>
    </div>
    ${window._pcStageMergeMode?`<div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">같은 라운드 · 같은 두 선수(팀)의 "📝 입력" 기록만 선택해서 합칠 수 있습니다. (🗂️ 대진표에서 온 기록은 이미 자동으로 합쳐져 있습니다)</div>`:''}
    ${roundBtns}
    ${_pcAltHTML || listHTML}
  </div>`;
}

/* ══════════════════════════════════════════════════════════════
   (요청사항) 대진표 기록(토너먼트 기록) - 사용자가 직접 선택해서 합치기
   - "📝 입력"으로 등록된 stageRecords 항목만 대상 (🗂️ 대진표 항목은 슬롯 단위로 이미 자동 합쳐짐)
   ══════════════════════════════════════════════════════════════ */
