/* ══════════════════════════════════════════════════════════════
   초기화 - 기록카드/대회카드 테마 & 초기 UI 옵션 적용 (init.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function _applyRecCardTheme(){
  const onKey='su_rc_theme_on';
  const acKey='su_rc_accent_mode';
  const bgKey='su_rc_bg_alpha';
  const hdKey='su_rc_hd_alpha';
  const iconKey='su_rc_uicon';
  const iconScopeOffKey='su_rc_uicon_scope_off';
  const iconScopeSizeKey='su_rc_uicon_scope_size';
  const univFontKey='su_rc_univ_font_pct';
  const ymScaleKey='su_ym_scale_pct';
  const memoKey='su_rc_memo_on';
  const vsKey='su_rc_vs_align';
  const scKey='su_rc_score_scale';
  let on=true, accent='none', bg=12, hd=14, uicon=24;
  let uiconScopeOff=false, uiconScopeSize=24;
  let univFontPct=110, ymScalePct=100;
  let memoOn=false, vsAlign='center', scScale=108;
  // (요청사항) 배경 효과 완전 OFF 감지(승리 배경 + 양끝 효과 모두 OFF)
  let sideFxOn = true;
  try{
    const v=localStorage.getItem(onKey); if(v!=null) on = v==='1';
    const sfx=localStorage.getItem('su_rec_side_fx_on'); if(sfx!=null) sideFxOn = sfx!=='0';
    const a=localStorage.getItem(acKey); if(a) accent=a;
    const b=parseInt(localStorage.getItem(bgKey)||'',10); if(!isNaN(b)) bg=b;
    const h=parseInt(localStorage.getItem(hdKey)||'',10); if(!isNaN(h)) hd=h;
    const ic=parseInt(localStorage.getItem(iconKey)||'',10); if(!isNaN(ic)) uicon=ic;
    const iso=localStorage.getItem(iconScopeOffKey); if(iso!=null) uiconScopeOff = iso==='1';
    const iss=parseInt(localStorage.getItem(iconScopeSizeKey)||'',10); if(!isNaN(iss)) uiconScopeSize=iss; else uiconScopeSize=uicon;
    const uf=parseInt(localStorage.getItem(univFontKey)||'',10); if(!isNaN(uf)) univFontPct=uf;
    const ys=parseInt(localStorage.getItem(ymScaleKey)||'',10); if(!isNaN(ys)) ymScalePct=ys;
    const mo=localStorage.getItem(memoKey); if(mo!=null) memoOn = mo==='1';
    const va=localStorage.getItem(vsKey); if(va) vsAlign=va;
    const ss=parseInt(localStorage.getItem(scKey)||'',10); if(!isNaN(ss)) scScale=ss;
  }catch(e){}
  bg=Math.max(0,Math.min(30,bg));
  hd=Math.max(0,Math.min(30,hd));
  uicon=Math.max(12,Math.min(34,uicon));
  uiconScopeSize=Math.max(12,Math.min(34,uiconScopeSize||uicon));
  univFontPct=Math.max(90,Math.min(150,univFontPct||100));
  ymScalePct=Math.max(80,Math.min(140,ymScalePct||100));
  accent = ['none','header','border','full','gradient'].includes(accent) ? accent : 'none';
  vsAlign = ['left','center','right'].includes(vsAlign) ? vsAlign : 'center';
  scScale = Math.max(80, Math.min(130, scScale||108));
  const vsJust = (vsAlign==='center')?'center':(vsAlign==='right')?'flex-end':'flex-start';

  try{
    if(document.body){
      document.body.classList.toggle('rc-theme-on', !!on);
      document.body.classList.toggle('rc-accent-header', !!on && accent==='header');
      document.body.classList.toggle('rc-accent-border', !!on && accent==='border');
      document.body.classList.toggle('rc-accent-full', !!on && accent==='full');
      document.body.classList.toggle('rc-accent-gradient', !!on && accent==='gradient');
      // 배경 효과(모드 컬러/헤더 틴트 포함) 완전 OFF 시, 잔색 제거용 클래스
      document.body.classList.toggle('rc-bgfx-off', (!on && !sideFxOn));
      document.body.classList.toggle('rc-uicon-scope-off', !!uiconScopeOff);
    }
    document.documentElement.style.setProperty('--rc-bg-a', String(bg/100));
    document.documentElement.style.setProperty('--rc-hd-a', String(hd/100));
    document.documentElement.style.setProperty('--rc-uicon', uicon+'px');
    document.documentElement.style.setProperty('--rc-uicon-scope', uiconScopeSize+'px');
    document.documentElement.style.setProperty('--rc-univ-font-scale', String(univFontPct/100));
    document.documentElement.style.setProperty('--ym-scale', String(ymScalePct/100));
    document.documentElement.style.setProperty('--rc-memo-on', memoOn?'1':'0');
    document.documentElement.style.setProperty('--rc-vs-justify', vsJust);
    document.documentElement.style.setProperty('--rc-score-scale', String(scScale/100));
  }catch(e){}
}
window._applyRecCardTheme=_applyRecCardTheme;
_applyRecCardTheme();

// [FIX-RECCARD-SHAPE] 새로고침해도 저장된 카드 모양이 유지되도록 초기 1회 적용
try{
  const _savedShape = localStorage.getItem('su_rc_card_shape');
  if(_savedShape && _savedShape!=='default' && document.body){
    document.body.classList.add('rc-shape--'+_savedShape);
  }
}catch(e){}

// 대회탭 스코어 크기 초기 적용
(function(){
  try{
    var isMb = window.innerWidth <= 768;
    var pcV = parseInt(localStorage.getItem('su_tc_score_scale_pc')||'82',10);
    var mbV = parseInt(localStorage.getItem('su_tc_score_scale_mb')||'75',10);
    var val = isMb ? Math.max(50,Math.min(150,mbV)) : Math.max(50,Math.min(150,pcV));
    document.documentElement.style.setProperty('--tc-score-scale', String(val/100));
    // 기록탭 스코어도 초기 적용
    var rcSc = parseInt(localStorage.getItem('su_rc_score_scale')||'88',10);
    document.documentElement.style.setProperty('--rc-score-scale', String(rcSc/100));
  }catch(e){}
})();

// 창 크기 변경 시 tc-score-scale 재적용
(function(){
  try{
    window.addEventListener('resize', function(){
      try{
        var isMb2 = window.innerWidth <= 768;
        var pcV2 = parseInt(localStorage.getItem('su_tc_score_scale_pc')||'82',10);
        var mbV2 = parseInt(localStorage.getItem('su_tc_score_scale_mb')||'75',10);
        var val2 = isMb2 ? Math.max(50,Math.min(150,mbV2)) : Math.max(50,Math.min(150,pcV2));
        document.documentElement.style.setProperty('--tc-score-scale', String(val2/100));
      }catch(e){}
    }, {passive:true});
  }catch(e){}
})();

// 팀 버튼 스타일 초기 적용
(function(){
  try{
    var TEAM_BTN_STYLES=['solid','pill','badge','gradient','chip-xl','neon','outline','flat'];
    var v=localStorage.getItem('su_rc_team_btn_style')||'solid';
    if(v&&v!=='solid'&&TEAM_BTN_STYLES.indexOf(v)!==-1) document.body.classList.add('team-btn--'+v);
  }catch(e){}
})();

// 버튼 모양 테마 초기 적용
(function(){
  try{
    var BTN_THEMES=['default','flat','outline','pill','soft','glass','retro','neon','brutal'];
    var v=localStorage.getItem('su_btn_theme')||'default';
    if(v&&v!=='default'&&BTN_THEMES.indexOf(v)!==-1) document.body.classList.add('btn-theme--'+v);
  }catch(e){}
})();

// ─────────────────────────────────────────────────────────────
// (요청사항) 대회탭 카드(조별리그 일정 등) 테마/디자인 모드
// ─────────────────────────────────────────────────────────────
function _applyTourneyCardTheme(){
  const onKey='su_tc_theme_on';
  const acKey='su_tc_accent_mode';
  const hdKey='su_tc_hd_alpha';
  const bwKey='su_tc_border_w';
  const icKey='su_tc_uicon';
  const lwKey='su_tc_line_w';
  const laKey='su_tc_line_a';
  let on=false, accent='none', hd=12, bw=4, ic=34;
  let lw=2, la=70;
  try{
    const v=localStorage.getItem(onKey); if(v!=null) on = v==='1';
    const a=localStorage.getItem(acKey); if(a) accent=a;
    const h=parseInt(localStorage.getItem(hdKey)||'',10); if(!isNaN(h)) hd=h;
    const b=parseInt(localStorage.getItem(bwKey)||'',10); if(!isNaN(b)) bw=b;
    const i=parseInt(localStorage.getItem(icKey)||'',10); if(!isNaN(i)) ic=i;
    const w=parseInt(localStorage.getItem(lwKey)||'',10); if(!isNaN(w)) lw=w;
    const o=parseInt(localStorage.getItem(laKey)||'',10); if(!isNaN(o)) la=o;
  }catch(e){}
  hd=Math.max(0,Math.min(30,hd));
  bw=Math.max(2,Math.min(6,bw));
  ic=Math.max(24,Math.min(48,ic));
  lw=Math.max(1,Math.min(4,lw));
  la=Math.max(25,Math.min(100,la));
  accent = ['none','header','border'].includes(accent) ? accent : 'none';

  try{
    if(document.body){
      document.body.classList.toggle('tc-theme-on', !!on);
      document.body.classList.toggle('tc-accent-header', !!on && accent==='header');
      document.body.classList.toggle('tc-accent-border', !!on && accent==='border');
    }
    document.documentElement.style.setProperty('--tc-hd-a', String(hd/100));
    document.documentElement.style.setProperty('--tc-bw', bw+'px');
    document.documentElement.style.setProperty('--tc-uicon', ic+'px');
    document.documentElement.style.setProperty('--tc-line-w', lw+'px');
    document.documentElement.style.setProperty('--tc-line-a', String(la/100));
  }catch(e){}
}
window._applyTourneyCardTheme=_applyTourneyCardTheme;
_applyTourneyCardTheme();

// ─────────────────────────────────────────────────────────────
// 상단 탭/필터바와 기록 인라인바는 공통 `enableDragScroll()`로 처리
// ─────────────────────────────────────────────────────────────
// 초기 1회
setTimeout(()=>{ try{ window.enableDragScroll && window.enableDragScroll(); }catch(e){} }, 400);

// ── 사이트 첫 접속 시 자동 불러오기 ──
(async function autoLoad(){
  try{
    try{
      if(window.MatchStore && typeof window.MatchStore.init==='function') await window.MatchStore.init();
      if(window.PlayerStore && typeof window.PlayerStore.init==='function') await window.PlayerStore.init();
    }catch(e){}
    let _forceAutoLoad = false;
    try{ _forceAutoLoad = (localStorage.getItem('su_force_autoload') === '1'); }catch(e){}
    try{ _forceAutoLoad = _forceAutoLoad || (sessionStorage.getItem('su_force_autoload') === '1'); }catch(e){}
    if(_forceAutoLoad){
      try{ localStorage.removeItem('su_force_autoload'); }catch(e){}
      try{ sessionStorage.removeItem('su_force_autoload'); }catch(e){}
      try{ if(window.MatchStore && typeof window.MatchStore.clear==='function') await window.MatchStore.clear(); }catch(e){}
      try{ if(window.PlayerStore && typeof window.PlayerStore.clear==='function') await window.PlayerStore.clear(); }catch(e){}
    }
    // (복구) 로컬 기록이 있으면 자동 불러오기 금지 (덮어쓰기 방지)
    const hasAnyLocalKey = (k)=>{ try{ const v=localStorage.getItem(k); return !!(v && v.length>2); }catch(e){ return false; } };
    const hasAnyRecordPayload = (payload)=>{
      if(!payload || typeof payload!=='object') return false;
      return ['miniM','univM','comps','ckM','proM','proTourneys','tourneys','ttM','indM','gjM']
        .some(k=>Array.isArray(payload[k]) && payload[k].length>0);
    };
    const hasMatchIdbData = await (async()=>{
      try{
        if(!window.indexedDB) return false;
        const db = await new Promise((resolve,reject)=>{
          const req = indexedDB.open('star_datacenter_matches', 1);
          req.onupgradeneeded = ()=>resolve(req.result);
          req.onsuccess = ()=>resolve(req.result);
          req.onerror = ()=>reject(req.error||new Error('indexedDB open failed'));
        });
        if(!db || !db.objectStoreNames.contains('match_payloads')) return false;
        const payload = await new Promise((resolve,reject)=>{
          const tx = db.transaction('match_payloads','readonly');
          const req = tx.objectStore('match_payloads').get('main');
          req.onsuccess = ()=>resolve(req.result||null);
          req.onerror = ()=>reject(req.error||new Error('indexedDB get failed'));
        });
        return hasAnyRecordPayload(payload);
      }catch(e){
        return false;
      }
    })();
    const hasPlayerIdbData = await (async()=>{
      try{
        if(window.PlayerStore && typeof window.PlayerStore.load==='function'){
          const payload = await window.PlayerStore.load();
          return !!(payload && Array.isArray(payload.players) && payload.players.length>0);
        }
      }catch(e){}
      return Array.isArray(players) && players.length>0;
    })();
    const hasRuntimePlayers = Array.isArray(players) && players.length>0;
    const hasRuntimeRecords = [miniM,univM,comps,ckM,proM,tourneys,ttM,indM,gjM].some(v=>Array.isArray(v)&&v.length>0);
    const hasRecordKeys = ['su_mm','su_um','su_ck','su_pro','su_cm','su_tn','su_ttm','su_indm','su_gjm'].some(hasAnyLocalKey) || hasMatchIdbData;
    if(!_forceAutoLoad){
      if(hasRuntimePlayers || hasRuntimeRecords) return;
      if(hasRecordKeys && hasPlayerIdbData) return;
    }
  }catch(e){}
  window.LOG('자동 불러오기', '로컬 데이터 없음 → GitHub 자동 로드');
  const _fetchAutoJson = async (url)=>{
    const res = await Promise.race([
      fetch(url, {cache:'no-store', mode:'cors'}),
      new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),10000))
    ]);
    if(!res || !res.ok) throw new Error(`fetch failed: ${url}`);
    const text = await res.text();
    if(!text || !text.trim()) throw new Error(`empty response: ${url}`);
    let raw = JSON.parse(text);
    if(raw && raw.content && raw.encoding==='base64'){
      const b64 = raw.content.replace(/\s/g,'');
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
      raw = JSON.parse(new TextDecoder('utf-8').decode(bytes));
    }
    if(raw && typeof raw._lz === 'string'){
      raw = JSON.parse(LZString.decompressFromBase64(raw._lz));
    }
    return raw;
  };
  const _resolveAutoUrl = (baseUrl, rel)=>{
    try{
      let next = String(rel || '').trim();
      next = next.replace(/^\.?\//,'');
      next = next.replace(/^star-datacenter\//,'');
      return new URL(next, new URL(baseUrl, location.href)).toString();
    }
    catch(e){ return String(rel || ''); }
  };
  // [FIX-404] 존재하지 않는 월별 파일을 매번 다시 요청하지 않도록 세션 단위 miss 캐시.
  //  index.json 의 historyMonths 에 실제로 존재하지 않는 월이 남아 있어도
  //  같은 URL 을 반복 요청하지 않고 조용히 건너뛴다.
  const _monthMiss = (window.__suMonthMissCache = window.__suMonthMissCache || new Set());
  const _fetchMonthJsonSafe = async (url)=>{
    if(_monthMiss.has(url)) return null;
    try{ return await _fetchAutoJson(url); }
    catch(e){ _monthMiss.add(url); return null; }
  };
  const _recoverMatchArraysFromPlayerHistoryLocal = (baseData, monthParts)=>{
    const out = {...(baseData||{})};
    if(!Array.isArray(out.indM)) out.indM = [];
    if(!Array.isArray(out.gjM)) out.gjM = [];
    const needInd = !out.indM.length;
    const needGj = !out.gjM.length;
    if(!needInd && !needGj) return out;
    const seenInd = new Set();
    const seenGj = new Set();
    (Array.isArray(monthParts)?monthParts:[]).filter(Boolean).forEach(part=>{
      const ph = part && part.playerHistory || {};
      Object.keys(ph).forEach(name=>{
        (Array.isArray(ph[name]) ? ph[name] : []).forEach(h=>{
          const mode = String(h && h.mode || '').trim();
          const opp = String(h && h.opp || '').trim();
          const res = String(h && h.result || '').trim();
          if(!opp || !res) return;
          let target = '';
          let proLabel = false;
          if(mode === '개인전') target = 'ind';
          else if(mode === '끝장전') target = 'gj';
          else if(mode === '프로리그끝장전'){ target = 'gj'; proLabel = true; }
          else return;
          if((target==='ind' && !needInd) || (target==='gj' && !needGj)) return;
          let wName='', lName='';
          if(res === '승'){ wName = name; lName = opp; }
          else if(res === '패'){ wName = opp; lName = name; }
          else return;
          const d = String(h.date || h.d || '').trim();
          const map = String(h.map || '').trim();
          const mid = String(h.matchId || '').trim();
          const key = mid || [target, proLabel?'pro':'normal', d, map, wName, lName].join('|');
          if(target === 'ind'){
            if(seenInd.has(key)) return;
            seenInd.add(key);
            out.indM.push({ _id: mid || key, d, wName, lName, map: map || '-' });
            return;
          }
          if(seenGj.has(key)) return;
          seenGj.add(key);
          const rec = { _id: mid || key, d, wName, lName, map: map || '-' };
          if(proLabel) rec._proLabel = true;
          out.gjM.push(rec);
        });
      });
    });
    const _byDateDesc = (a,b)=>String(b && b.d || '').localeCompare(String(a && a.d || ''));
    if(needInd) out.indM.sort(_byDateDesc);
    if(needGj) out.gjM.sort(_byDateDesc);
    return out;
  };
  const _recoverCivilMiniFromPlayerHistoryLocal = (baseData, monthParts)=>{
    const out = {...(baseData||{})};
    if(!Array.isArray(out.miniM)) out.miniM = [];
    const hasCivil = out.miniM.some(m=>m && (m.type==='civil' || (m.a==='A팀' && m.b==='B팀')));
    if(hasCivil) return out;
    const gameMap = new Map();
    (Array.isArray(monthParts)?monthParts:[]).filter(Boolean).forEach(part=>{
      const ph = part && part.playerHistory || {};
      Object.keys(ph).forEach(name=>{
        (Array.isArray(ph[name]) ? ph[name] : []).forEach(h=>{
          if(String(h && h.mode || '').trim() !== '시빌워') return;
          const matchId = String(h.matchId || '').trim();
          if(!matchId) return;
          const prev = gameMap.get(matchId) || { _id:matchId, d:String(h.date||'').trim(), map:String(h.map||'').trim(), wName:'', lName:'', univMap:{} };
          prev.d = prev.d || String(h.date||'').trim();
          prev.map = prev.map || String(h.map||'').trim();
          prev.univMap[name] = String(h.univ || '').trim();
          if(h.result === '승'){ prev.wName = name; prev.lName = String(h.opp || '').trim(); }
          else if(h.result === '패'){ prev.wName = String(h.opp || '').trim(); prev.lName = name; }
          gameMap.set(matchId, prev);
        });
      });
    });
    if(!gameMap.size) return out;
    const sessions = new Map();
    const parseParts = (matchId)=>{
      const m = String(matchId||'').match(/^(.*)_s(\d+)_g(\d+)$/);
      if(m) return { base:m[1], setIdx:+m[2], gameIdx:+m[3] };
      return { base:String(matchId||''), setIdx:0, gameIdx:0 };
    };
    for(const rec of gameMap.values()){
      const { base, setIdx, gameIdx } = parseParts(rec._id);
      if(!rec.wName || !rec.lName) continue;
      if(!sessions.has(base)) sessions.set(base, { _id:base, d:rec.d||'', games:[], players:new Map(), adj:new Map() });
      const sess = sessions.get(base);
      sess.d = sess.d || rec.d || '';
      sess.games.push({ ...rec, setIdx, gameIdx });
      [rec.wName, rec.lName].forEach(n=>{
        if(!n) return;
        if(!sess.players.has(n)) sess.players.set(n, { name:n, univ:String(rec.univMap && rec.univMap[n] || '') });
        if(!sess.adj.has(n)) sess.adj.set(n, new Set());
      });
      sess.adj.get(rec.wName).add(rec.lName);
      sess.adj.get(rec.lName).add(rec.wName);
    }
    const recovered = [];
    for(const sess of sessions.values()){
      const side = new Map();
      for(const n of sess.players.keys()){
        if(side.has(n)) continue;
        side.set(n, 'A');
        const q=[n];
        while(q.length){
          const cur=q.shift();
          const curSide=side.get(cur);
          (sess.adj.get(cur)||[]).forEach(nx=>{
            if(!side.has(nx)){ side.set(nx, curSide==='A'?'B':'A'); q.push(nx); }
          });
        }
      }
      const setsMap = new Map();
      sess.games.sort((a,b)=>(a.setIdx-b.setIdx)||(a.gameIdx-b.gameIdx));
      sess.games.forEach(g=>{
        const sA = side.get(g.wName)||'A';
        const playerA = sA==='A' ? g.wName : g.lName;
        const playerB = sA==='A' ? g.lName : g.wName;
        const winner = sA==='A' ? 'A' : 'B';
        if(!setsMap.has(g.setIdx)) setsMap.set(g.setIdx, { scoreA:0, scoreB:0, winner:'', games:[] });
        const st = setsMap.get(g.setIdx);
        if(winner==='A') st.scoreA++; else st.scoreB++;
        st.games.push({ _id:g._id, playerA, playerB, winner, map:g.map||'-', wName:g.wName, lName:g.lName });
      });
      const sets = [...setsMap.entries()].sort((a,b)=>a[0]-b[0]).map(([,st])=>{
        st.winner = st.scoreA>st.scoreB ? 'A' : (st.scoreB>st.scoreA ? 'B' : '');
        return st;
      });
      const teamAMembers = [...sess.players.values()].filter(p=>(side.get(p.name)||'A')==='A');
      const teamBMembers = [...sess.players.values()].filter(p=>(side.get(p.name)||'A')==='B');
      const sa = sets.reduce((n,s)=>n+(s.scoreA||0),0);
      const sb = sets.reduce((n,s)=>n+(s.scoreB||0),0);
      recovered.push({ _id:sess._id, d:sess.d||'', a:'A팀', b:'B팀', sa, sb, sets, type:'civil', teamAMembers, teamBMembers });
    }
    recovered.sort((a,b)=>String(b && b.d || '').localeCompare(String(a && a.d || '')));
    if(recovered.length) out.miniM = out.miniM.concat(recovered);
    return out;
  };
  const _recoverTierGeneralFromPlayerHistoryLocal = (baseData, monthParts)=>{
    const out = {...(baseData||{})};
    if(!Array.isArray(out.ttM)) out.ttM = [];
    const existing = new Set(out.ttM.map(m=>String(m && m._id || '')).filter(Boolean));
    const tierIdMap = new Map(((Array.isArray(out.tourneys) ? out.tourneys : [])||[])
      .filter(t=>t && t.type==='tier' && t.id && t.name)
      .map(t=>[String(t.id).trim(), String(t.name).trim()]));
    const parseTierComp = (mid)=>{
      const s = String(mid||'').trim();
      let tid = '';
      let m = s.match(/^pbn_([^_]+)_/);
      if(m) tid = m[1];
      if(!tid){
        m = s.match(/^([a-z0-9]+)_s\d+_g\d+$/i);
        if(m) tid = m[1];
      }
      return tierIdMap.get(tid) || '복구된 일반전';
    };
    const byId = new Map();
    (Array.isArray(monthParts)?monthParts:[]).filter(Boolean).forEach(part=>{
      const ph = part && part.playerHistory || {};
      Object.keys(ph).forEach(name=>{
        (Array.isArray(ph[name]) ? ph[name] : []).forEach(h=>{
          if(String(h && h.mode || '').trim() !== '티어대회') return;
          const mid = String(h.matchId || '').trim();
          if(!mid || existing.has(mid)) return;
          const prev = byId.get(mid) || { _id:mid, d:String(h.date||'').trim(), map:String(h.map||'').trim(), wName:'', lName:'', compName:parseTierComp(mid) };
          prev.d = prev.d || String(h.date||'').trim();
          prev.map = prev.map || String(h.map||'').trim();
          if(h.result === '승'){ prev.wName = name; prev.lName = String(h.opp || '').trim(); }
          else if(h.result === '패'){ prev.wName = String(h.opp || '').trim(); prev.lName = name; }
          byId.set(mid, prev);
        });
      });
    });
    const recovered = [];
    byId.forEach(rec=>{
      if(!rec.wName || !rec.lName) return;
      recovered.push({
        _id:rec._id, d:rec.d||'', a:rec.wName, b:rec.lName, sa:1, sb:0,
        sets:[{ scoreA:1, scoreB:0, winner:'A', games:[{ _id:rec._id, playerA:rec.wName, playerB:rec.lName, winner:'A', map:rec.map||'-', wName:rec.wName, lName:rec.lName }] }],
        n:rec.compName||'복구된 일반전', compName:rec.compName||'복구된 일반전', stage:'general'
      });
    });
    recovered.sort((a,b)=>String(b && b.d || '').localeCompare(String(a && a.d || '')));
    if(recovered.length) out.ttM = out.ttM.concat(recovered);
    return out;
  };
  const _mergePlayerPhotosIntoPlayers = (arr, photoMap)=>{
    if(!Array.isArray(arr) || !photoMap || typeof photoMap!=='object') return arr;
    arr.forEach(p=>{
      if(p && p.name && !p.photo && photoMap[p.name]) p.photo = photoMap[p.name];
    });
    try{ window.playerPhotos = photoMap; }catch(e){}
    return arr;
  };
  const _mergeSplitStoreData = async (seed, seedUrl)=>{
    let idx = seed;
    if(seed && seed.indexPath){
      try{ idx = await _fetchAutoJson(_resolveAutoUrl(seedUrl, seed.indexPath)); }
      catch(e){ idx = seed; }
    }
    if(!(idx && (idx.splitStore || idx.corePath || idx.historyMonths))) return seed;
    const coreUrl = _resolveAutoUrl(seedUrl, idx.corePath || 'data/core.json');
    const historyDirUrl = _resolveAutoUrl(seedUrl, String(idx.historyDir || 'data/history/').replace(/\/?$/, '/'));
    const core = await _fetchAutoJson(coreUrl);
    const merged = {...core};
    const monthParts = [];
    const histKeys = ['miniM','univM','comps','ckM','proM','ttM','indM','gjM'];
    histKeys.forEach(k=>{ merged[k] = Array.isArray(core[k]) ? [...core[k]] : []; });
    const months = Array.isArray(idx.historyMonths) ? idx.historyMonths : [];
    let _monthSkipAll = false;
    for(const month of months){
      if(_monthSkipAll) break;
      try{
        const monthUrl = _resolveAutoUrl(historyDirUrl, `${month}.json`);
        const part = await _fetchMonthJsonSafe(monthUrl);
        if(!part){
          // [FIX-404] 첫 월부터 실패하고 성공한 월이 하나도 없으면 월별 저장소가
          // 배포에 포함되지 않은 것으로 보고 남은 월 요청을 중단한다(404 연쇄 방지).
          if(!monthParts.length){ _monthSkipAll = true; break; }
          continue;
        }
        monthParts.push(part);
        histKeys.forEach(k=>{
          if(Array.isArray(part[k]) && part[k].length) merged[k].push(...part[k]);
        });
        if(Array.isArray(part.histExtItems) && part.histExtItems.length){
          merged.histExtItems = (Array.isArray(merged.histExtItems) ? merged.histExtItems : []).concat(part.histExtItems);
        }
      }catch(e){
        console.warn('[자동 불러오기] 월별 데이터 로드 실패:', month, e.message);
      }
    }
    try{
      const recoverFn = (typeof window.__suRecoverMatchArraysFromPlayerHistory === 'function')
        ? window.__suRecoverMatchArraysFromPlayerHistory
        : _recoverMatchArraysFromPlayerHistoryLocal;
      const recovered = recoverFn(merged, monthParts);
      if(recovered){
        if(Array.isArray(recovered.indM)) merged.indM = recovered.indM;
        if(Array.isArray(recovered.gjM)) merged.gjM = recovered.gjM;
      }
      const recoverCivilFn = (typeof window.__suRecoverCivilMiniFromPlayerHistory === 'function')
        ? window.__suRecoverCivilMiniFromPlayerHistory
        : _recoverCivilMiniFromPlayerHistoryLocal;
      const recoveredCivil = recoverCivilFn(merged, monthParts);
      if(recoveredCivil && Array.isArray(recoveredCivil.miniM)) merged.miniM = recoveredCivil.miniM;
      const recoverTierFn = (typeof window.__suRecoverTierGeneralFromPlayerHistory === 'function')
        ? window.__suRecoverTierGeneralFromPlayerHistory
        : _recoverTierGeneralFromPlayerHistoryLocal;
      const recoveredTier = recoverTierFn(merged, monthParts);
      if(recoveredTier && Array.isArray(recoveredTier.ttM)) merged.ttM = recoveredTier.ttM;
    }catch(e){
      console.warn('[자동 불러오기] playerHistory match 복구 실패:', e.message);
    }
    return merged;
  };
  // (복구) 번들에 포함된 data.json을 최우선으로 시도
  const _LOCAL = 'data.json';
  // (수정) 실제 경로: star-datacenter/data.json
  const _RAW = 'https://raw.githubusercontent.com/nada1004/star-system/main/star-datacenter/data.json';
  const _API = 'https://api.github.com/repos/nada1004/star-system/contents/star-datacenter/data.json';
  const _CDN = 'https://cdn.jsdelivr.net/gh/nada1004/star-system@main/star-datacenter/data.json';
  const _PROXY = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(_RAW);
  const urls = [_LOCAL, _RAW, _CDN, _API, _PROXY];
  if(typeof window.gsSetStatus === 'function') window.gsSetStatus('🔄 데이터 불러오는 중...','var(--blue)');
  let d = null;
  let loadedFromUrl = '';
  for(const url of urls){
    try{
      d = await _fetchAutoJson(url);
      d = await _mergeSplitStoreData(d, url);
      if(d){ loadedFromUrl = url; window.LOG('자동 불러오기', '성공:', url); break; }
    }catch(e){ window.LOG('자동 불러오기', '실패:', url, e.message); continue; }
  }
  if(d){
    try{
      const hasPlayers = Array.isArray(d.players) ? d.players.length>0 : (Array.isArray(d.player) ? d.player.length>0 : false);
      if(!hasPlayers && loadedFromUrl){
        try{
          const coreFallback = await _fetchAutoJson(_resolveAutoUrl(loadedFromUrl, 'data/core.json'));
          if(Array.isArray(coreFallback.players) && coreFallback.players.length) d.players = coreFallback.players;
          if(!d.playerPhotos && coreFallback.playerPhotos) d.playerPhotos = coreFallback.playerPhotos;
          if(!d.univCfg && coreFallback.univCfg) d.univCfg = coreFallback.univCfg;
          if(!d.maps && coreFallback.maps) d.maps = coreFallback.maps;
          if(!d.tourD && coreFallback.tourD) d.tourD = coreFallback.tourD;
          if(!d.tourneys && coreFallback.tourneys) d.tourneys = coreFallback.tourneys;
        }catch(e){
          console.warn('[자동 불러오기] core fallback 실패:', e.message);
        }
      }
      const _prevIndM = Array.isArray(indM) ? indM : [];
      const _prevGjM  = Array.isArray(gjM) ? gjM : [];
      players  = d.players  || d.player  || [];
      players  = _mergePlayerPhotosIntoPlayers(players, d.playerPhotos || d.pPhotoMap || d.playerPhotoMap || null);
      try{ window.players = players; }catch(e){}
      univCfg  = d.univCfg  || d.univConfig || d.universities || univCfg;
      maps     = d.maps     || d.map     || maps;
      tourD    = d.tourD    || d.tournamentDates || Array(15).fill('');
      miniM    = d.miniM    || d.mini    || d.miniMatches || [];
      univM    = d.univM    || d.univ    || d.univMatches || [];
      comps    = d.comps    || d.comp    || d.competitions || [];
      ckM      = d.ckM      || d.ck      || d.ckMatches   || [];
      compNames= d.compNames|| d.competitionNames || [];
      curComp  = d.curComp  || d.currentComp || '';
      proM     = d.proM     || d.pro     || d.proMatches  || [];
      tourneys = d.tourneys || d.tournaments || d.tourney || [];
      ttM      = d.ttM      || d.tt      || [];
      indM     = Array.isArray(d.indM) ? d.indM : (Array.isArray(d.ind) ? d.ind : _prevIndM);
      gjM      = Array.isArray(d.gjM) ? d.gjM : _prevGjM;
      if((!indM || !indM.length) && _prevIndM.length) indM = _prevIndM;
      if((!gjM || !gjM.length) && _prevGjM.length) gjM = _prevGjM;
      try{ window.indM = indM; }catch(e){}
      try{ window.gjM = gjM; }catch(e){}
      if((!players || !players.length) && loadedFromUrl){
        try{
          const coreFallback2 = await _fetchAutoJson(_resolveAutoUrl(loadedFromUrl, 'data/core.json'));
          if(Array.isArray(coreFallback2.players) && coreFallback2.players.length) players = coreFallback2.players;
          players = _mergePlayerPhotosIntoPlayers(players, coreFallback2.playerPhotos || null);
          try{ window.players = players; }catch(e){}
        }catch(e){}
      }
      if(((!players || !players.length) || (!gjM || !gjM.length) || (!indM || !indM.length)) && loadedFromUrl){
        try{
          const idxFallback = await _fetchAutoJson(_resolveAutoUrl(loadedFromUrl, 'data/index.json'));
          const coreFallback3 = await _fetchAutoJson(_resolveAutoUrl(loadedFromUrl, String(idxFallback.corePath || 'data/core.json')));
          const historyDir = String(idxFallback.historyDir || 'data/history/').replace(/\/?$/, '/');
          const monthParts = [];
          for(const month of (Array.isArray(idxFallback.historyMonths) ? idxFallback.historyMonths : [])){
            try{
              const _mp = await _fetchMonthJsonSafe(_resolveAutoUrl(loadedFromUrl, `${historyDir}${month}.json`));
              if(_mp) monthParts.push(_mp);
              else if(!monthParts.length) break; // [FIX-404] 월별 저장소 없음 → 나머지 요청 중단
            }catch(e){}
          }
          const repaired = _recoverMatchArraysFromPlayerHistoryLocal({
            ...coreFallback3,
            miniM, univM, comps, ckM, proM, ttM, indM, gjM
          }, monthParts);
          const repairedCivil = _recoverCivilMiniFromPlayerHistoryLocal({
            ...coreFallback3,
            miniM, univM, comps, ckM, proM, ttM, indM, gjM
          }, monthParts);
          const repairedTier = _recoverTierGeneralFromPlayerHistoryLocal({
            ...coreFallback3,
            miniM, univM, comps, ckM, proM, ttM, indM, gjM
          }, monthParts);
          if((!players || !players.length) && Array.isArray(coreFallback3.players) && coreFallback3.players.length) players = coreFallback3.players;
          players = _mergePlayerPhotosIntoPlayers(players, coreFallback3.playerPhotos || null);
          try{ window.players = players; }catch(e){}
          if((!indM || !indM.length) && Array.isArray(repaired.indM) && repaired.indM.length) indM = repaired.indM;
          if((!gjM || !gjM.length) && Array.isArray(repaired.gjM) && repaired.gjM.length) gjM = repaired.gjM;
          if(Array.isArray(repairedCivil.miniM) && repairedCivil.miniM.length > (Array.isArray(miniM)?miniM.length:0)) miniM = repairedCivil.miniM;
          if(Array.isArray(repairedTier.ttM) && repairedTier.ttM.length > (Array.isArray(ttM)?ttM.length:0)) ttM = repairedTier.ttM;
        }catch(e){
          console.warn('[자동 불러오기] split-store rescue 실패:', e.message);
        }
      }
      if(!players || !players.length){
        try{
          const coreDirect = await _fetchAutoJson('data/core.json');
          if(Array.isArray(coreDirect.players) && coreDirect.players.length) players = coreDirect.players;
          players = _mergePlayerPhotosIntoPlayers(players, coreDirect.playerPhotos || null);
          try{ window.players = players; }catch(e){}
        }catch(e){}
      }
      if(d.notices && d.notices.length) notices = d.notices;
      if(d.tiers && d.tiers.length) TIERS.splice(0, TIERS.length, ...d.tiers);
      try{
        if(typeof _rebuildAllPlayerHistoryCore === 'function'){
          _rebuildAllPlayerHistoryCore();
          try{ window.__stats_hist_ready = true; }catch(e){}
        }else{
          try{ window.__stats_hist_ready = false; }catch(e){}
        }
      }catch(e){
        try{ window.__stats_hist_ready = false; }catch(e){}
      }
      const allD=[...miniM,...univM,...comps,...ckM,...proM];
      mergeValidYearsIntoOptions(yearOptions, allD);
      fixPoints();
      // autoLoad 후 티어대회 마이그레이션 재실행 (flag 리셋 후 재호출)
      if(typeof _migrateTierTourneys==='function'){
        if(typeof _ttMigrated!=='undefined') _ttMigrated=false;
        _migrateTierTourneys();
      }
      // autoLoad 후 티어대전→티어대회 명칭 마이그레이션 재실행
      if(typeof _migrateTierTourName==='function'){
        if(typeof _tierTourNameMigrated!=='undefined') _tierTourNameMigrated=false;
        _migrateTierTourName();
      }
      localSave(); render();
      if(typeof window.gsSetStatus === 'function') window.gsSetStatus('✅ 자동 불러오기 완료 ('+new Date().toLocaleTimeString()+')','var(--green)');
    }catch(e){
      console.error('[자동 불러오기] 데이터 적용 오류:', e);
      if(typeof window.gsSetStatus === 'function') window.gsSetStatus('','');
    }
  } else {
    if(typeof window.gsSetStatus === 'function') window.gsSetStatus('','');
    console.warn('[자동 불러오기] 모든 URL 실패');
  }
})();
