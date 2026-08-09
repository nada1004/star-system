/* ══════════════════════════════════════════════════════════════
   대전기록 - 전체탭 인라인편집 & 맵명 일괄치환 (history-render-tabs.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _openAllTabIndEdit(type, m, regIdx){
  try{
    // 1) 세션 캐시에서 이 게임(m._id 또는 m.sid)이 속한 세션 키 탐색
    const cacheKey = (type==='gj'||type==='progj') ? 'gj' : 'ind';
    const cache = cacheKey==='gj' ? (window._gjSessCache||{}) : (window._indSessCache||{});
    const gameId = m._id || '';
    const gameSid = m.sid || '';
    let foundSessKey = null;

    if(gameId || gameSid){
      for(const [sk, sess] of Object.entries(cache)){
        const games = Array.isArray(sess?.games) ? sess.games : [];
        const hit = games.some(g=>
          (gameId && (g._id===gameId || g.sid===gameId)) ||
          (gameSid && (g.sid===gameSid || g._id===gameSid))
        );
        if(hit){ foundSessKey=sk; break; }
      }
    }

    // 2) p1/p2 + date 기반 세션 키도 시도 (캐시 키 생성 방식과 동일하게)
    if(!foundSessKey){
      const p1 = m.wName||''; const p2 = m.lName||''; const dd = m.d||'';
      const guessKey = ('inds_' + `${dd}|${p1}|${p2}`.replace(/[^\w\-]/g,'_')).slice(0,120);
      const guessKeyGJ = ('gjs_' + `${dd}|${p1}|${p2}`.replace(/[^\w\-]/g,'_')).slice(0,120);
      if(cache[guessKey]) foundSessKey=guessKey;
      else if(cache[guessKeyGJ]) foundSessKey=guessKeyGJ;
      // 역순(p2 vs p1)도 시도
      if(!foundSessKey){
        const guessKeyR = ('inds_' + `${dd}|${p2}|${p1}`.replace(/[^\w\-]/g,'_')).slice(0,120);
        const guessKeyGJR = ('gjs_' + `${dd}|${p2}|${p1}`.replace(/[^\w\-]/g,'_')).slice(0,120);
        if(cache[guessKeyR]) foundSessKey=guessKeyR;
        else if(cache[guessKeyGJR]) foundSessKey=guessKeyGJR;
      }
      // 전체 캐시에서 p1/p2/date 일치 세션 탐색
      if(!foundSessKey){
        for(const [sk, sess] of Object.entries(cache)){
          if(sess.d===dd && ((sess.p1===p1&&sess.p2===p2)||(sess.p1===p2&&sess.p2===p1))){
            foundSessKey=sk; break;
          }
        }
      }
    }

    if(foundSessKey){
      if(cacheKey==='gj' && typeof openGJSessionEdit==='function'){ openGJSessionEdit(foundSessKey); return; }
      if(cacheKey==='ind' && typeof openIndSessionEdit==='function'){ openIndSessionEdit(foundSessKey); return; }
    }
  }catch(e){}
  // 폴백: 단건 openRE
  if(typeof openRE==='function') openRE(type, regIdx);
}

/* ══════════════════════════════════════
   대전 기록 > 전체 통합 탭
══════════════════════════════════════ */
window._scanBulkMapEverywhere = window._scanBulkMapEverywhere || function(from, onMatch, replaceTo){
  const norm = (s)=>String(s||'').trim().toLowerCase().replace(/\s+/g,'');
  const fromV = String(from||'').trim();
  if(!fromV) return 0;
  const fromN = norm(fromV);
  let changed = 0;
  const rep = (obj)=>{
    if(!obj || typeof obj !== 'object') return;
    if(typeof obj.map === 'string'){
      const cur = obj.map.trim();
      if(cur===fromV || norm(cur)===fromN){
        changed++;
        if(typeof onMatch === 'function') onMatch(obj, replaceTo);
      }
    }
    (obj.games||[]).forEach(rep);
    (obj._games||[]).forEach(rep);
    (obj.sets||[]).forEach(rep);
  };
  try{
    const arrMap = (typeof _bulkArrMapAll==='function') ? _bulkArrMapAll() : {};
    Object.keys(arrMap||{}).forEach(k => (arrMap[k]||[]).forEach(rep));
  }catch(e){}
  try{
    (tourneys||[]).forEach(tn=>{
      (tn.groups||[]).forEach(grp=> (grp.matches||[]).forEach(rep));
      (tn.normalMatches||[]).forEach(rep);
      if(tn.thirdPlace) rep(tn.thirdPlace);
      const br = tn.bracket || {};
      if(Array.isArray(br)) br.forEach(round => (round||[]).forEach(rep));
      Object.values(br.matchDetails||{}).forEach(rep);
      (br.manualMatches||[]).forEach(rep);
    });
  }catch(e){}
  try{
    (proTourneys||[]).forEach(tn=>{
      (tn.groups||[]).forEach(grp=> (grp.matches||[]).forEach(rep));
      Object.values(tn.stageRecords||{}).forEach(arr => (arr||[]).forEach(rep));
      (tn.bracket||[]).forEach(round => (round||[]).forEach(rep));
      if(tn.thirdPlace) rep(tn.thirdPlace);
      (tn.teamMatches||[]).forEach(rep);
      (tn.gjMatches||[]).forEach(rep);
    });
  }catch(e){}
  try{
    if(Array.isArray(maps)){
      maps = maps.map(m=>((String(m||'').trim()===fromV || norm(m)===fromN) ? toV : m));
    }
  }catch(e){}
  return changed;
};
window.bulkCountMapEverywhere = window.bulkCountMapEverywhere || function(from){
  return window._scanBulkMapEverywhere(from, null, '');
};
window.bulkReplaceMapEverywhere = window.bulkReplaceMapEverywhere || function(from, to){
  const toV = String(to||'').trim();
  if(!String(from||'').trim() || !toV) return 0;
  return window._scanBulkMapEverywhere(from, (obj, next)=>{ obj.map = next; }, toV);
};
window.histBulkPreviewMapFromAllTab = window.histBulkPreviewMapFromAllTab || function(){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li){ alert('로그인이 필요합니다.'); return; }
  const from = (document.getElementById('hist-bulk-map-from')?.value||'').trim();
  if(!from){ alert('교체 전 맵 이름을 입력하세요.'); return; }
  const cnt = (typeof window.bulkCountMapEverywhere === 'function') ? window.bulkCountMapEverywhere(from) : 0;
  const el = document.getElementById('hist-bulk-map-result');
  if(el){
    el.textContent = cnt ? `🔎 변경 예정 ${cnt}개` : '일치하는 맵이 없습니다.';
    setTimeout(()=>{ if(el && el.textContent.startsWith('🔎')) el.textContent=''; }, 3500);
  }
};
window.histBulkChangeMapFromAllTab = window.histBulkChangeMapFromAllTab || function(){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li){ alert('로그인이 필요합니다.'); return; }
  const from = (document.getElementById('hist-bulk-map-from')?.value||'').trim();
  const to = (document.getElementById('hist-bulk-map-to')?.value||'').trim();
  if(!from || !to){ alert('교체 전/후 맵 이름을 입력하세요.'); return; }
  const changed = window.bulkReplaceMapEverywhere(from, to);
  if(changed){ save(); render(); }
  const el = document.getElementById('hist-bulk-map-result');
  if(el){
    el.textContent = changed ? `✅ ${changed}개 맵명 교체 완료!` : '교체할 항목이 없습니다.';
    setTimeout(()=>{ if(el) el.textContent=''; }, 3500);
  }
};
