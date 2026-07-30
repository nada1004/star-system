/* ══════════════════════════════════════════════════════════════
   인증 - 경기 수정 모달 & 통계 캡처 (auth.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

window._gemCtx = null;

function openGameEditModal(editRef, si, gi){
  const parts=editRef.split(':');
  const mode=parts[0];
  // nm mode: editRef = "nm:tnId:nmIdx"
  let m, idx;
  if(mode==='nm'){
    const tnId=parts[1]; const nmIdx=parseInt(parts[2]);
    const tn=(typeof tourneys!=='undefined'?tourneys:[]).find(t=>t.id===tnId);
    if(!tn)return;
    m=(tn.normalMatches||[])[nmIdx];
    if(!m)return;
    idx=nmIdx;
  } else {
    idx=parseInt(parts[1]);
    const arr=mode==='mini'?miniM:mode==='univm'?univM:mode==='ck'?ckM:mode==='pro'?proM:mode==='tt'?ttM:mode==='comp'?comps:null;
    if(!arr)return;
    m=arr[idx];if(!m)return;
  }
  const set=m.sets&&m.sets[si];if(!set)return;
  const g=set.games&&set.games[gi];if(!g)return;

  // 상태 저장
  window._gemCtx = { editRef, si, gi };

  // 팀 멤버 추출
  const isCKmode=(mode==='ck'||mode==='pro'||mode==='tt');
  let teamANames=[], teamBNames=[];
  if(isCKmode){
    teamANames=(m.teamAMembers||[]).map(x=>x.name);
    teamBNames=(m.teamBMembers||[]).map(x=>x.name);
  } else {
    const univA=m.a||''; const univB=m.b||'';
    teamANames=players.filter(p=>p.univ===univA).map(p=>p.name).sort();
    teamBNames=players.filter(p=>p.univ===univB).map(p=>p.name).sort();
  }

  // 모드별 색상·이름
  const _modeColor = {mini:'#7c3aed',univm:'#16a34a',ck:'#f59e0b',pro:'#0ea5e9',tt:'#10b981',comp:'#2563eb'}[mode]||'#2563eb';
  const _modeName  = {mini:'⚡ 미니대전',univm:'🏟️ 대학대전',ck:'🤝 대학CK',pro:'🏅 프로리그',tt:'🎯 티어대회',comp:'🎖️ 조별리그'}[mode]||'경기';
  const _setLabel  = si===2 ? '🎯 에이스전' : (si+1)+'세트';

  // 승자 버튼용 선수 이름
  const _nameA = g.playerA || 'A팀';
  const _nameB = g.playerB || 'B팀';

  // 선수 선택 드롭다운 생성
  function _pSelect(id, names, current, color, label){
    const inList = !current || names.includes(current);
    const opts = '<option value="">— 선택 —</option>' +
      names.map(n=>'<option value="'+n+'"'+(current===n?' selected':'')+'>'+n+'</option>').join('') +
      (!inList && current ? '<option value="'+current+'" selected>'+current+' (현재)</option>' : '');
    return '<div class="su-field-row" style="border-left:3px solid '+color+';border-radius:0 14px 14px 0"><label class="su-field-label" style="color:'+color+'">'+label+'</label><select id="'+id+'" style="flex:1;min-width:0">'+opts+'</select></div>';
  }

  const mapOpts=maps.map(mp=>'<option value="'+mp+'"'+( g.map===mp?' selected':'')+'>'+mp+'</option>').join('');

  // 헤더 색상
  const head = document.getElementById('gem-head');
  if(head) head.style.background = 'linear-gradient(135deg, '+_modeColor+'18, '+_modeColor+'08, #f8fafc)';

  document.getElementById('gem-title').textContent = '✏️ 경기 수정 — '+_modeName;
  document.getElementById('gem-sub').textContent   = _setLabel+' · '+(gi+1)+'번 경기'+(m.caster?' · 🎙️ '+m.caster:'');

  const winA_style = g.winner==='A'
    ? 'border:2px solid #2563eb;background:#2563eb;color:#fff;'
    : 'border:2px solid rgba(148,163,184,.3);background:var(--white);color:var(--text2);';
  const winB_style = g.winner==='B'
    ? 'border:2px solid #dc2626;background:#dc2626;color:#fff;'
    : 'border:2px solid rgba(148,163,184,.3);background:var(--white);color:var(--text2);';

  document.getElementById('gem-body').innerHTML =
    _pSelect('gem-pA', teamANames, g.playerA, '#2563eb', '🔵 A팀 선수') +
    _pSelect('gem-pB', teamBNames, g.playerB, '#dc2626', '🔴 B팀 선수') +
    '<div class="su-field-row" style="border-left:3px solid #16a34a;border-radius:0 14px 14px 0">' +
    '<label class="su-field-label" style="color:#16a34a">🏆 승자</label>' +
    '<div style="display:flex;gap:8px;flex:1">' +
    '<button type="button" id="gem-win-A" onclick="gemSetWinner('+"\'A\'"+')" style="flex:1;padding:8px 0;border-radius:var(--r);'+winA_style+'font-weight:800;font-size:var(--fs-sm);cursor:pointer;transition:all .15s">🔵 '+ _nameA +' 승</button>' +
    '<button type="button" id="gem-win-B" onclick="gemSetWinner('+"\'B\'"+')" style="flex:1;padding:8px 0;border-radius:var(--r);'+winB_style+'font-weight:800;font-size:var(--fs-sm);cursor:pointer;transition:all .15s">🔴 '+ _nameB +' 승</button>' +
    '</div><input type="hidden" id="gem-winner" value="' + (g.winner||'')+'"></div>' +
    '<div class="su-field-row"><label class="su-field-label">🗺️ 맵</label><select id="gem-map" style="flex:1;min-width:0"><option value="">맵 없음</option>'+mapOpts+'</select></div>' +
    '<div class="su-field-row" style="border-left:3px solid #f59e0b;border-radius:0 14px 14px 0">' +
    '<label class="su-field-label" style="color:#f59e0b">🎙️ 캐스터/스트리머</label>' +
    '<input type="text" id="gem-caster" value="'+(m.caster||'')+'" placeholder="방송 스트리머 이름 (선택)" style="flex:1;min-width:0;padding:7px 10px;border:1px solid var(--border2);border-radius:8px;font-size:var(--fs-sm)">' +
    '</div>';

  om('gameEditModal');
}

function gemSetWinner(side){
  document.getElementById('gem-winner').value = side;
  const btnA = document.getElementById('gem-win-A');
  const btnB = document.getElementById('gem-win-B');
  const pA = document.getElementById('gem-pA');
  const pB = document.getElementById('gem-pB');
  const nameA = (pA && pA.value) || 'A팀';
  const nameB = (pB && pB.value) || 'B팀';
  if(btnA){
    btnA.style.cssText = 'flex:1;padding:8px 0;border-radius:var(--r);font-weight:800;font-size:var(--fs-sm);cursor:pointer;transition:all .15s;' +
      (side==='A' ? 'border:2px solid #2563eb;background:#2563eb;color:#fff;' : 'border:2px solid rgba(148,163,184,.3);background:var(--white);color:var(--text2);');
    btnA.textContent = '🔵 '+nameA+' 승';
  }
  if(btnB){
    btnB.style.cssText = 'flex:1;padding:8px 0;border-radius:var(--r);font-weight:800;font-size:var(--fs-sm);cursor:pointer;transition:all .15s;' +
      (side==='B' ? 'border:2px solid #dc2626;background:#dc2626;color:#fff;' : 'border:2px solid rgba(148,163,184,.3);background:var(--white);color:var(--text2);');
    btnB.textContent = '🔴 '+nameB+' 승';
  }
}

function saveGameEditModal(){
  const ctx = window._gemCtx;
  if(!ctx) return;
  saveGameEdit(ctx.editRef, ctx.si, ctx.gi, document.getElementById('gem-save-btn'));
}

function saveGameEdit(editRef, si, gi, btn){
  const parts=editRef.split(':');
  const mode=parts[0];
  let m, idx;
  if(mode==='nm'){
    const tnId=parts[1]; const nmIdx=parseInt(parts[2]);
    const tn=(typeof tourneys!=='undefined'?tourneys:[]).find(t=>t.id===tnId);
    if(!tn)return;
    m=(tn.normalMatches||[])[nmIdx];
    if(!m)return;
    idx=nmIdx;
  } else {
    idx=parseInt(parts[1]);
    const arr=mode==='mini'?miniM:mode==='univm'?univM:mode==='ck'?ckM:mode==='pro'?proM:mode==='tt'?ttM:mode==='comp'?comps:null;
    if(!arr)return;
    m=arr[idx];if(!m)return;
  }
  const set=m.sets&&m.sets[si];if(!set)return;
  const g=set.games&&set.games[gi];if(!g)return;

  // pro 외 모드: 기존 이 게임의 선수 history 되돌리기
  if(mode!=='pro' && g.playerA && g.playerB && g.winner){
    const oldWin=g.winner==='A'?g.playerA:g.playerB;
    const oldLose=g.winner==='A'?g.playerB:g.playerA;
    const mid=m._id||null;
    const mdate=m.d||'';
    const wP=players.find(p=>p.name===oldWin);
    const lP=players.find(p=>p.name===oldLose);
    if(wP){
      if(!wP.history)wP.history=[];
      wP.win=Math.max(0,(wP.win||0)-1);
      wP.points=(wP.points||0)-3;
      let wi=mid?wP.history.findIndex(h=>h.matchId===mid&&h.result==='승'&&h.opp===oldLose):-1;
      if(wi<0)wi=wP.history.findIndex(h=>h.result==='승'&&h.opp===oldLose&&h.date===mdate);
      if(wi>=0){const hr=wP.history[wi];if(hr.eloDelta!=null)wP.elo=(wP.elo||ELO_DEFAULT)-hr.eloDelta;wP.history.splice(wi,1);}
    }
    if(lP){
      if(!lP.history)lP.history=[];
      lP.loss=Math.max(0,(lP.loss||0)-1);
      lP.points=(lP.points||0)+3;
      let li=mid?lP.history.findIndex(h=>h.matchId===mid&&h.result==='패'&&h.opp===oldWin):-1;
      if(li<0)li=lP.history.findIndex(h=>h.result==='패'&&h.opp===oldWin&&h.date===mdate);
      if(li>=0){const hr=lP.history[li];if(hr.eloDelta!=null)lP.elo=(lP.elo||ELO_DEFAULT)-hr.eloDelta;lP.history.splice(li,1);}
    }
  }

  // 게임 데이터 업데이트
  const newPA=document.getElementById('gem-pA').value||g.playerA;
  const newPB=document.getElementById('gem-pB').value||g.playerB;
  const newWinner=document.getElementById('gem-winner').value||g.winner;
  const newMap=document.getElementById('gem-map').value||g.map;
  const newCaster=(document.getElementById('gem-caster')?.value??'').trim();
  g.playerA=newPA; g.playerB=newPB; g.winner=newWinner; g.map=newMap;
  // 경기(match) 레벨 캐스터/스트리머 저장
  if(newCaster) m.caster=newCaster; else delete m.caster;

  // pro 외 모드: 새 결과 선수 history에 반영
  if(mode!=='pro' && newPA && newPB && newWinner){
    const _geLabel={mini:'미니대전',univm:'대학대전',ck:'대학CK',tt:'티어대회',comp:'조별리그',nm:'대회'}[mode]||'';
    applyGameResult(
      newWinner==='A'?newPA:newPB,
      newWinner==='A'?newPB:newPA,
      m.d||'', newMap||'-', m._id||'', '', '', _geLabel
    );
  }

  // 세트/총점 재계산
  let sA=0,sB=0;
  (set.games||[]).forEach(gg=>{if(gg.winner==='A')sA++;else if(gg.winner==='B')sB++;});
  set.scoreA=sA;set.scoreB=sB;
  set.winner=sA>sB?'A':sB>sA?'B':'';
  let tA=0,tB=0;
  (m.sets||[]).forEach(s=>{if(s.winner==='A')tA++;else if(s.winner==='B')tB++;});
  m.sa=tA;m.sb=tB;
  save();
  // 전용 모달이면 cm()으로 닫기, 레거시(동적 생성) 모달이면 remove()
  try{ if(document.getElementById('gameEditModal')) cm('gameEditModal'); else if(btn&&btn.closest) btn.closest('.modal').remove(); }catch(e){ try{ cm('gameEditModal'); }catch(_){} }
  render();
  try{ if(typeof window._refreshOpenHistDetailAfterEdit==='function') window._refreshOpenHistDetailAfterEdit(mode, idx); }catch(e){}
  // nm 모드: 상세 팝업 새로고침
  try{
    if(mode==='nm'){
      const _nmParts=editRef.split(':');
      if(typeof nmOpenDetailModal==='function') nmOpenDetailModal(_nmParts[1], parseInt(_nmParts[2]));
    }
  }catch(e){}
  // (보강) 티어대회 경기 수정 후 최근 경기 누락 방지
  try{ if(mode==='tt' && typeof syncTierTtMHistory==='function') syncTierTtMHistory(); }catch(e){}
  try{ if(typeof window.refreshPlayerModalIfOpen==='function') window.refreshPlayerModalIfOpen(); }catch(e){}
}

async function captureStats(){
  const el=document.getElementById('stats-univ-sec');
  if(!el){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    await _imgToDataUrls(el);
    const canvas=await html2canvas(el,{backgroundColor:'#ffffff',scale:2,useCORS:false,allowTaint:false});
    const a=document.createElement('a');a.download=`stats_${new Date().toISOString().slice(0,10)}.jpg`;
    a.href=canvas.toDataURL('image/jpeg',.93);a.click();
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

async function captureSection(sectionId, filename){
  const el=document.getElementById(sectionId);
  if(!el){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    try{ await (window.ensureHtml2Canvas && window.ensureHtml2Canvas()); }catch(e){}
    await _imgToDataUrls(el);
    const canvas=await html2canvas(el,{backgroundColor:'#ffffff',scale:2,useCORS:false,allowTaint:false,logging:false});
    const a=document.createElement('a');
    a.download=`${filename||sectionId}_${new Date().toISOString().slice(0,10)}.jpg`;
    a.href=canvas.toDataURL('image/jpeg',.93);a.click();
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

