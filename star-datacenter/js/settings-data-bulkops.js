// settings-data-ops.js에서 분리됨 (설정 - 일괄변환/시즌목록/현황판 메모·배경 조작)
function bulkChangeTier(){
  if(!isLoggedIn) return;
  const fromTier=document.getElementById('bulk-tier-from')?.value||'';
  const toTier=document.getElementById('bulk-tier-to')?.value||'';
  const targetUniv=document.getElementById('bulk-tier-univ')?.value||'';
  if(!toTier){alert('변경할 티어를 선택하세요.');return;}
  const targets=players.filter(p=>{
    if(fromTier && (p.tier||'미정')!==fromTier) return false;
    if(targetUniv && p.univ!==targetUniv) return false;
    return true;
  });
  if(!targets.length){alert('해당하는 선수가 없습니다.');return;}
  if(!confirm(`${targets.length}명의 티어를 '${toTier}'으로 변경할까요?\n\n${targets.slice(0,5).map(p=>p.name).join(', ')}${targets.length>5?` 외 ${targets.length-5}명`:''}`)) return;
  targets.forEach(p=>{ p.tier=toTier; });
  save(); render();
  const el=document.getElementById('bulk-tier-result');
  if(el){ el.textContent=`✅ ${targets.length}명 변경 완료!`; setTimeout(()=>{if(el)el.textContent='';},3000); }
}

/* ══════════════════════════════════════
   경기 일괄 수정 함수들
══════════════════════════════════════ */
function bulkConvertToGameScore(){
  if(!isLoggedIn) return;
  const arrMap = {mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM};
  const targets = ['mini','univm','ck','pro','tt'].filter(m=>document.getElementById('bulk-conv-chk-'+m)?.checked);
  if(!targets.length){ alert('대상을 선택하세요.'); return; }

  let converted = 0;
  targets.forEach(key=>{
    const arr = arrMap[key]||[];
    arr.forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const gA = m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB = m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      // 세트 수와 다를 때만 변환
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        m.scoreMode='game';
        converted++;
      }
    });
  });

  // 대회(tourneys) 조별리그도 변환
  (tourneys||[]).forEach(tn=>{
    if(!tn.groups) return;
    tn.groups.forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m.sets||!m.sets.length) return;
        const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
        const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
        if(gA!==m.sa||gB!==m.sb){
          m.sa=gA; m.sb=gB;
          m.scoreMode='game';
          converted++;
        }
      });
    });
    // 브라켓 경기도 변환
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>{
      if(!m||!m.sets||!m.sets.length) return;
      const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        m.scoreMode='game';
        converted++;
      }
    });
    (br.manualMatches||[]).forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const gA=m.sets.reduce((s,st)=>s+(st.scoreA||0),0);
      const gB=m.sets.reduce((s,st)=>s+(st.scoreB||0),0);
      if(gA!==m.sa||gB!==m.sb){
        m.sa=gA; m.sb=gB;
        m.scoreMode='game';
        converted++;
      }
    });
  });

  if(converted===0){
    const el=document.getElementById('bulk-conv-result');
    if(el) el.textContent='변환할 경기가 없습니다. (이미 게임수 합산으로 저장됨)';
    return;
  }
  save(); render();
  const el=document.getElementById('bulk-conv-result');
  if(el) el.textContent='✅ '+converted+'건 변환 완료!';
  setTimeout(()=>{ if(el) el.textContent=''; }, 3000);
}

// (요청사항) 저장된 점수 방식(scoreMode: set/game)에 맞춰 sa/sb를 일괄 재계산
// - 세트로 저장된 기록은 세트승으로, 경기제로 저장된 기록은 게임수 합산으로 정리
// - scoreMode 미설정(old data)은 sets 기반으로 추정(set wins 합이 2 이상이면 set, 아니면 game)
function bulkRecalcScoreByMode(){
  if(!isLoggedIn) return;
  const arrMap = {mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM};
  const targets = ['mini','univm','ck','pro','tt'].filter(m=>document.getElementById('bulk-conv-chk-'+m)?.checked);
  if(!targets.length){ alert('대상을 선택하세요.'); return; }

  const _calc = (sets, mode)=>{
    let sa=0, sb=0;
    (sets||[]).forEach(st=>{
      if(!st) return;
      const games = Array.isArray(st.games) ? st.games : [];
      const scoreA = (st.scoreA!=null) ? Number(st.scoreA) : games.filter(g=>g && g.winner==='A').length;
      const scoreB = (st.scoreB!=null) ? Number(st.scoreB) : games.filter(g=>g && g.winner==='B').length;
      let w = st.winner;
      if(!w) w = scoreA>scoreB?'A':scoreB>scoreA?'B':'';
      if(mode==='set'){
        if(w==='A') sa += 1;
        else if(w==='B') sb += 1;
      }else{
        sa += (isNaN(scoreA)?0:scoreA);
        sb += (isNaN(scoreB)?0:scoreB);
      }
    });
    return {sa, sb};
  };
  const _inferMode = (m)=>{
    const sm = (m && m.scoreMode) ? String(m.scoreMode) : '';
    if(sm==='set' || sm==='game') return sm;
    const sets = Array.isArray(m?.sets) ? m.sets : [];
    let wA=0, wB=0;
    sets.forEach(st=>{
      if(!st) return;
      const w = st.winner || ((st.scoreA||0)>(st.scoreB||0)?'A':(st.scoreB||0)>(st.scoreA||0)?'B':'');
      if(w==='A') wA++; else if(w==='B') wB++;
    });
    return (wA+wB>=2) ? 'set' : 'game';
  };

  let changed=0, setCnt=0, gameCnt=0;
  const _applyToMatch = (m)=>{
    if(!m || !m.sets || !m.sets.length) return;
    const mode = _inferMode(m);
    const sc = _calc(m.sets, mode);
    const need = (m.sa!==sc.sa || m.sb!==sc.sb) || (m.scoreMode!==mode);
    if(!need) return;
    m.sa = sc.sa;
    m.sb = sc.sb;
    m.scoreMode = mode;
    changed++;
    if(mode==='set') setCnt++; else gameCnt++;
  };

  targets.forEach(key=>{
    (arrMap[key]||[]).forEach(_applyToMatch);
  });
  // 대회(tourneys)도 포함
  (tourneys||[]).forEach(tn=>{
    if(tn?.groups){
      tn.groups.forEach(grp=>{
        (grp?.matches||[]).forEach(_applyToMatch);
      });
    }
    const br=tn?.bracket||{};
    Object.values(br.matchDetails||{}).forEach(_applyToMatch);
    (br.manualMatches||[]).forEach(_applyToMatch);
  });

  const el=document.getElementById('bulk-conv3-result');
  if(changed===0){
    if(el) el.textContent='재계산할 항목이 없습니다. (이미 저장형식대로 정리됨)';
    return;
  }
  save(); render();
  if(el) el.textContent=`✅ ${changed}건 재계산 완료! (세트제 ${setCnt} / 경기제 ${gameCnt})`;
  setTimeout(()=>{ if(el) el.textContent=''; }, 3500);
}

// (요청사항) 경기 기록을 "세트제(세트 승리 수)" 스코어로 일괄 변환
// - sets 배열 기반으로 sa/sb를 (세트 승)으로 재계산
// - 기존 sa/sb가 게임수로 저장된 경우를 한번에 수정하기 위함
function bulkConvertToSetScore(){
  if(!isLoggedIn) return;
  const arrMap = {mini:miniM, univm:univM, ck:ckM, pro:proM, tt:ttM};
  const targets = ['mini','univm','ck','pro','tt'].filter(m=>document.getElementById('bulk-conv-chk-'+m)?.checked);
  if(!targets.length){ alert('대상을 선택하세요.'); return; }

  const _setWins = (sets)=>{
    let sa=0, sb=0;
    (sets||[]).forEach(st=>{
      if(!st) return;
      const w = st.winner || ((st.scoreA||0)>(st.scoreB||0)?'A':(st.scoreB||0)>(st.scoreA||0)?'B':'');
      if(w==='A') sa++;
      else if(w==='B') sb++;
    });
    return {sa, sb};
  };

  let converted = 0;
  targets.forEach(key=>{
    const arr = arrMap[key]||[];
    arr.forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const w=_setWins(m.sets);
      if(w.sa!==m.sa || w.sb!==m.sb){
        m.sa=w.sa; m.sb=w.sb;
        m.scoreMode='set';
        converted++;
      }
    });
  });

  // 대회(tourneys) 조별리그/브라켓도 변환(있으면)
  (tourneys||[]).forEach(tn=>{
    if(!tn.groups) return;
    tn.groups.forEach(grp=>{
      (grp.matches||[]).forEach(m=>{
        if(!m.sets||!m.sets.length) return;
        const w=_setWins(m.sets);
        if(w.sa!==m.sa || w.sb!==m.sb){
          m.sa=w.sa; m.sb=w.sb;
          m.scoreMode='set';
          converted++;
        }
      });
    });
    const br=tn.bracket||{};
    Object.values(br.matchDetails||{}).forEach(m=>{
      if(!m||!m.sets||!m.sets.length) return;
      const w=_setWins(m.sets);
      if(w.sa!==m.sa || w.sb!==m.sb){
        m.sa=w.sa; m.sb=w.sb;
        m.scoreMode='set';
        converted++;
      }
    });
    (br.manualMatches||[]).forEach(m=>{
      if(!m.sets||!m.sets.length) return;
      const w=_setWins(m.sets);
      if(w.sa!==m.sa || w.sb!==m.sb){
        m.sa=w.sa; m.sb=w.sb;
        m.scoreMode='set';
        converted++;
      }
    });
  });

  if(converted===0){
    const el=document.getElementById('bulk-conv2-result');
    if(el) el.textContent='변환할 경기가 없습니다. (이미 세트제로 저장됨)';
    return;
  }
  save(); render();
  const el=document.getElementById('bulk-conv2-result');
  if(el) el.textContent='✅ '+converted+'건 변환 완료!';
  setTimeout(()=>{ if(el) el.textContent=''; }, 3000);
}


/* ══════════════════════════════════════
   시즌 관리 함수
══════════════════════════════════════ */
function renderSeasonList(){
  const el = document.getElementById('cfg-season-list');
  if(!el) return;
  if(!seasons.length){
    el.innerHTML = '<div style="font-size:var(--fs-sm);color:var(--gray-l);padding:8px 0">등록된 시즌이 없습니다.</div>';
    return;
  }
  el.innerHTML = seasons.map((s,i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--white);border:1px solid var(--border);border-radius:8px;margin-bottom:6px;flex-wrap:wrap">
      <span style="font-size:var(--fs-base);font-weight:800;color:#7c3aed;min-width:100px">🏆 ${s.name}</span>
      <span style="font-size:var(--fs-caption);color:var(--gray-l)">${s.from} ~ ${s.to}</span>
      ${isLoggedIn ? '<button class="btn btn-w btn-xs" style="margin-left:auto" onclick="editSeason('+i+')">✏️ 수정</button><button class="btn btn-r btn-xs" onclick="deleteSeason('+i+')">🗑️</button>' : '<span style="margin-left:auto"></span>'}
    </div>`).join('');
}

function setBoardMemo2(univName, text){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.memo2=text;
  save();
}
function toggleBoardHide(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.hidden=!u.hidden;
  save();render();
}
function changeBoardUnivColor(univName, color){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.color=color;
  save();render();
}
function setBoardMemo(univName, text){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.memo=text;
  save();
}
function adjustChampionship(univName, delta){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.championships=Math.max(0,(u.championships||0)+delta);
  save();render();
}
function setBoardNote(univName, text){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bMemo=text;
  save();
}
function addBoardNoteImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.bMemoImgs)u.bMemoImgs=[];
  u.bMemoImgs.push(dataUrl);
  save();render();
}
function removeBoardNoteImg(univName, idx){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.bMemoImgs)u.bMemoImgs=[];
  u.bMemoImgs.splice(idx,1);
  save();render();
}
function setBoardMemoImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.memoImg=dataUrl;
  save();render();
}
function addBoardMemoImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.memoImgs)u.memoImgs=[];
  u.memoImgs.push(dataUrl);
  save();render();
}
function removeBoardMemoImg(univName, idx){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(!u.memoImgs)u.memoImgs=[];
  u.memoImgs.splice(idx,1);
  save();render();
}

function setBoardBgImg(univName, dataUrl){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImg=dataUrl;
  save();render();
}
function removeBoardBgImg(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  delete u.bgImg;
  delete u.bgImgPos;
  save();render();
}
function setBoardBgImgPos(univName, pos){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImgPos=pos;
  save();render();
}
function setBoardBgImgSize(univName, size){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  u.bgImgSize=size;
  save();render();
}
// [FIX-BRIGHT-5] 대학별 "로고형 배경"(중앙에 작게 배치) 여부 토글
function setBoardBgIsLogo(univName, checked){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(checked) u.bgIsLogo=true; else delete u.bgIsLogo;
  save();render();
}
// [FIX-BRIGHT-7] 설정탭(cfg)에 머무는 동안은 전체 화면을 다시 그리지 않고
// board2 라이브 화면만(보이는 경우) 가볍게 갱신합니다.
// → 밝기 슬라이더를 조작할 때마다 설정탭 전체가 다시 그려지면서
//   방금 펼친 <details>가 접히고 대학 선택이 풀리는 문제를 방지합니다.
function _cfgSoftPersist(){
  try{
    if(typeof window.curTab!=='undefined' && window.curTab==='cfg'){
      try{ window._cfgSoftRefreshBoard2 && window._cfgSoftRefreshBoard2(); }catch(e){}
      return;
    }
  }catch(e){}
  if(typeof render==='function')render();
}
// [FIX-BRIGHT-5b] 대학별 배경 밝기 개별 오버라이드 (null이면 전체값 사용)
function setBoardBgImgAlpha(univName, pct){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  if(pct===null || pct===undefined || pct==='') delete u.bgImgAlpha;
  else u.bgImgAlpha = Math.max(0, Math.min(100, parseInt(pct,10) || 0));
  save();
  _cfgSoftPersist();
}
// [FIX-BRIGHT-6] 대학 전체 배경 밝기(전역 기본값) 저장 — 설정탭 슬라이더용
function setBoardBgAlphaGlobal(pct, silent){
  const v = Math.max(0, Math.min(100, parseInt(pct,10) || 0));
  b2BgImgAlpha = v;
  try{ localStorage.setItem('su_b2bia', v); }catch(e){}
  if(typeof save==='function')save();
  _cfgSoftPersist();
  if(!silent){
    try{ if(typeof showToast==='function') showToast('🎨 대학 배경 이미지 밝기가 저장되었습니다.'); }catch(e){}
  }
}
function promptBoardBgImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const cur=u.bgImg&&!u.bgImg.startsWith('data:')?u.bgImg:'';
  const url=prompt('배경 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)',cur);
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  setBoardBgImg(univName,trimmed);
}
function promptBoardMemoImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const url=prompt('사이드 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)','');
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  addBoardMemoImg(univName,trimmed);
}
function promptBoardNoteImgUrl(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn)return;
  const url=prompt('하단 이미지 URL을 입력하세요:\n(예: https://example.com/image.png)','');
  if(url===null)return;
  const trimmed=url.trim();
  if(!trimmed){showToast('URL을 입력해주세요.');return;}
  addBoardNoteImg(univName,trimmed);
}
