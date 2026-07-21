/* ══════════════════════════════════════
   GitHub split-store 저장/조회
══════════════════════════════════════ */

function _repoApiUrl(repoPath){
  return `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${repoPath}`;
}
function _repoRawUrl(repoPath){
  return `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}/${repoPath}`;
}
function _repoCdnUrl(repoPath){
  return `https://cdn.jsdelivr.net/gh/${GH_OWNER}/${GH_REPO}@${GH_BRANCH}/${repoPath}`;
}
function _decodeGithubPayload(raw){
  let d = raw;
  if(d && d.content && d.encoding === 'base64'){
    const b64 = String(d.content || '').replace(/\s/g,'');
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
    d = JSON.parse(new TextDecoder('utf-8').decode(bytes));
  }
  if(d && typeof d._lz === 'string' && window.LZString){
    d = JSON.parse(window.LZString.decompressFromBase64(d._lz));
  }
  return d;
}
function _encodeGithubPayload(obj){
  try{
    if(window.LZString){
      return { _lz: window.LZString.compressToBase64(JSON.stringify(obj)) };
    }
  }catch(e){}
  return obj;
}
async function _fetchRepoJson(repoPath){
  const urls = [
    _repoRawUrl(repoPath) + '?_=' + Date.now(),
    _repoCdnUrl(repoPath) + '?_=' + Date.now(),
    _repoApiUrl(repoPath)
  ];
  let lastErr = null;
  for(const url of urls){
    try{
      const res = await fetch(url, { cache:'no-store', mode:'cors' });
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const text = (await res.text()).replace(/^\uFEFF/, '').trim();
      if(!text || text.startsWith('<')) throw new Error('invalid response');
      const raw = JSON.parse(text);
      return _decodeGithubPayload(raw);
    }catch(e){
      lastErr = e;
    }
  }
  throw lastErr || new Error(`${repoPath} fetch failed`);
}
async function _putRepoJsonOnce(repoPath, payloadObj, message){
  const token = localStorage.getItem('su_gh_token');
  if(!token) throw new Error('GitHub 토큰이 설정되어 있지 않습니다.');
  const apiUrl = _repoApiUrl(repoPath);
  let sha = undefined;
  const getRes = await fetch(apiUrl, {
    headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
  });
  if(getRes.ok){
    const fileInfo = await getRes.json();
    sha = fileInfo && fileInfo.sha;
  }else if(getRes.status !== 404){
    throw new Error('GitHub 파일 조회 실패: ' + getRes.status);
  }
  const jsonStr = JSON.stringify(payloadObj);
  const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
  const body = {
    message: `${message} ${new Date().toLocaleString('ko-KR')}`,
    content: b64,
    branch: GH_BRANCH
  };
  if(sha) body.sha = sha;
  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!putRes.ok) throw new Error(`${repoPath} 저장 실패: ${putRes.status}`);
}
async function _putRepoJson(repoPath, payloadObj, message){
  let lastErr = null;
  for(let attempt=0; attempt<3; attempt++){
    try{
      return await _putRepoJsonOnce(repoPath, payloadObj, message);
    }catch(e){
      lastErr = e;
      const msg = String((e && e.message) || e || '');
      if(!/409/.test(msg)) throw e;
      await new Promise(r=>setTimeout(r, 250 * (attempt + 1)));
    }
  }
  throw lastErr || new Error(`${repoPath} 저장 실패: 409`);
}
function _monthKeyFromValue(v){
  try{
    if(typeof v === 'number' && isFinite(v)){
      return new Date(v).toISOString().slice(0,7);
    }
    const s = String(v || '').trim();
    if(/^\d{4}-\d{2}/.test(s)) return s.slice(0,7);
    if(/^\d{4}\.\d{2}/.test(s)) return s.slice(0,7).replace('.', '-');
    if(/^\d{4}\/\d{2}/.test(s)) return s.slice(0,7).replace('/', '-');
  }catch(e){}
  return '';
}
function _ensureMonthBucket(months, mk){
  const key = mk || 'unknown';
  if(!months[key]){
    months[key] = {
      playerHistory: {},
      histExtItems: []
    };
    GH_MONTHLY_KEYS.forEach(k=>{ months[key][k] = []; });
  }
  return months[key];
}
function _clonePlain(v){
  try{ return JSON.parse(JSON.stringify(v)); }catch(e){ return v; }
}
function _buildSplitStoreData(fullData){
  const src = _clonePlain(fullData || {}) || {};
  const months = {};
  const savedAt = Number(src.savedAt || Date.now()) || Date.now();
  const core = { ...src, savedAt, schemaVersion: GH_SPLIT_SCHEMA_VERSION };
  if(Array.isArray(core.players)){
    core.players = core.players.map(p=>{
      const c = { ...(p || {}) };
      delete c.history;
      return c;
    });
  }
  GH_MONTHLY_KEYS.forEach(k=>{
    const arr = Array.isArray(src[k]) ? src[k] : [];
    arr.forEach(item=>{
      const mk = _monthKeyFromValue(item && (item.d || item.date || item.createdAt || item.savedAt)) || 'unknown';
      _ensureMonthBucket(months, mk)[k].push(item);
    });
    core[k] = [];
  });
  try{
    const hx = src.histExt || {};
    const items = Array.isArray(hx.items) ? hx.items : [];
    items.forEach(item=>{
      const mk = _monthKeyFromValue(item && (item.date || item.d || item.time)) || 'unknown';
      _ensureMonthBucket(months, mk).histExtItems.push(item);
    });
    core.histExt = { ...hx, items: [] };
  }catch(e){}
  try{
    (Array.isArray(src.players) ? src.players : []).forEach(p=>{
      const name = String(p && p.name || '').trim();
      const hist = Array.isArray(p && p.history) ? p.history : [];
      if(!name || !hist.length) return;
      hist.forEach(h=>{
        const mk = _monthKeyFromValue(h && (h.date || h.d || h.time)) || 'unknown';
        const bucket = _ensureMonthBucket(months, mk);
        if(!bucket.playerHistory[name]) bucket.playerHistory[name] = [];
        bucket.playerHistory[name].push(h);
      });
    });
  }catch(e){}
  const historyMonths = Object.keys(months).sort();
  const index = {
    schemaVersion: GH_SPLIT_SCHEMA_VERSION,
    splitStore: true,
    savedAt,
    corePath: GH_SPLIT_CORE_PATH,
    historyMonths,
    historyDir: GH_SPLIT_HISTORY_DIR
  };
  const entry = {
    schemaVersion: GH_SPLIT_SCHEMA_VERSION,
    splitStore: true,
    indexPath: GH_SPLIT_INDEX_PATH,
    savedAt,
    historyMonths
  };
  return { entry, index, core, months, historyMonths };
}
function _estimateSplitStore(fullData){
  const built = _buildSplitStoreData(fullData);
  const files = [];
  files.push({ path: GH_ENTRY_PATH, bytes: JSON.stringify(_encodeGithubPayload(built.entry)).length });
  files.push({ path: GH_SPLIT_INDEX_PATH, bytes: JSON.stringify(_encodeGithubPayload(built.index)).length });
  files.push({ path: GH_SPLIT_CORE_PATH, bytes: JSON.stringify(_encodeGithubPayload(built.core)).length });
  built.historyMonths.forEach(mk=>{
    const part = {
      schemaVersion: GH_SPLIT_SCHEMA_VERSION,
      month: mk,
      savedAt: built.index.savedAt,
      ...built.months[mk]
    };
    files.push({ path: `${GH_SPLIT_HISTORY_DIR}/${mk}.json`, bytes: JSON.stringify(_encodeGithubPayload(part)).length });
  });
  files.sort((a,b)=>b.bytes-a.bytes);
  return {
    fileCount: files.length,
    maxBytes: files[0] ? files[0].bytes : 0,
    totalBytes: files.reduce((s,x)=>s+x.bytes,0),
    files
  };
}
async function _saveSplitStore(fullData){
  const built = _buildSplitStoreData(fullData);
  await _putRepoJson(GH_SPLIT_CORE_PATH, _encodeGithubPayload(built.core), 'core.json 업데이트');
  for(const mk of built.historyMonths){
    const part = {
      schemaVersion: GH_SPLIT_SCHEMA_VERSION,
      month: mk,
      savedAt: built.index.savedAt,
      ...built.months[mk]
    };
    await _putRepoJson(`${GH_SPLIT_HISTORY_DIR}/${mk}.json`, _encodeGithubPayload(part), `${mk}.json 업데이트`);
  }
  await _putRepoJson(GH_SPLIT_INDEX_PATH, _encodeGithubPayload(built.index), 'index.json 업데이트');
  await _putRepoJson(GH_ENTRY_PATH, _encodeGithubPayload(built.entry), 'data.json 엔트리 업데이트');
}
async function _saveLegacySingleFile(fullData){
  const legacy = _encodeGithubPayload(fullData || {});
  await _putRepoJson(GH_ENTRY_PATH, legacy, 'data.json 단일 저장');
}
function _queueGithubSave(task){
  const run = async ()=>task();
  const p = _saveChain.then(run, run);
  _saveChain = p.catch(()=>{});
  return p;
}
async function _fetchSplitGithubData(indexLike){
  const idx = indexLike && indexLike.corePath ? indexLike : await _fetchRepoJson(GH_SPLIT_INDEX_PATH);
  const months = Array.isArray(idx && idx.historyMonths) ? idx.historyMonths : [];
  const core = await _fetchRepoJson(String(idx.corePath || GH_SPLIT_CORE_PATH));
  const missingMonths = [];
  const monthParts = await Promise.all(months.map(async mk=>{
    try{
      return await _fetchRepoJson(`${String(idx.historyDir || GH_SPLIT_HISTORY_DIR)}/${mk}.json`);
    }catch(e){
      missingMonths.push(mk);
      return null;
    }
  }));
  const out = { ...(core || {}), savedAt: Number((idx && idx.savedAt) || (core && core.savedAt) || Date.now()) || Date.now() };
  GH_MONTHLY_KEYS.forEach(k=>{ out[k] = []; });
  if(!out.histExt || typeof out.histExt !== 'object') out.histExt = {};
  out.histExt.items = [];
  const histMap = {};
  monthParts.filter(Boolean).forEach(part=>{
    GH_MONTHLY_KEYS.forEach(k=>{
      if(Array.isArray(part[k])) out[k] = out[k].concat(part[k]);
    });
    if(Array.isArray(part.histExtItems)) out.histExt.items = out.histExt.items.concat(part.histExtItems);
    const ph = part.playerHistory || {};
    Object.keys(ph).forEach(name=>{
      if(!histMap[name]) histMap[name] = [];
      if(Array.isArray(ph[name])) histMap[name] = histMap[name].concat(ph[name]);
    });
  });
  if(Array.isArray(out.players)){
    out.players = out.players.map(p=>{
      const name = String(p && p.name || '').trim();
      return { ...(p || {}), history: histMap[name] || [] };
    });
  }
  const recovered = _recoverMatchArraysFromPlayerHistory(out, monthParts);
  out.indM = recovered.indM;
  out.gjM = recovered.gjM;
  const civilRecovered = _recoverCivilMiniFromPlayerHistory(out, monthParts);
  out.miniM = civilRecovered.miniM;
  const tierRecovered = _recoverTierGeneralFromPlayerHistory(out, monthParts);
  out.ttM = tierRecovered.ttM;
  out.schemaVersion = GH_SPLIT_SCHEMA_VERSION;
  out._missingMonths = missingMonths;
  return out;
}
function _mergeMonthPartsIntoData(baseData, monthParts){
  const out = _clonePlain(baseData || {}) || {};
  GH_MONTHLY_KEYS.forEach(k=>{ if(!Array.isArray(out[k])) out[k] = []; });
  if(!out.histExt || typeof out.histExt !== 'object') out.histExt = {};
  if(!Array.isArray(out.histExt.items)) out.histExt.items = [];
  const playerMap = new Map();
  if(Array.isArray(out.players)){
    out.players.forEach((p, idx)=>{
      const name = String(p && p.name || '').trim();
      if(name) playerMap.set(name, idx);
      if(!Array.isArray(out.players[idx].history)) out.players[idx].history = [];
    });
  }
  (Array.isArray(monthParts) ? monthParts : []).filter(Boolean).forEach(part=>{
    GH_MONTHLY_KEYS.forEach(k=>{
      if(Array.isArray(part[k])) out[k] = out[k].concat(part[k]);
    });
    if(Array.isArray(part.histExtItems)) out.histExt.items = out.histExt.items.concat(part.histExtItems);
    const ph = part.playerHistory || {};
    Object.keys(ph).forEach(name=>{
      if(!playerMap.has(name)) return;
      const idx = playerMap.get(name);
      const cur = Array.isArray(out.players[idx].history) ? out.players[idx].history : [];
      out.players[idx].history = cur.concat(Array.isArray(ph[name]) ? ph[name] : []);
    });
    const psa = Number(part && part.savedAt || 0) || 0;
    if(psa) out.savedAt = Math.max(Number(out.savedAt||0)||0, psa);
  });
  return out;
}
function _recoverMatchArraysFromPlayerHistory(baseData, monthParts){
  const out = _clonePlain(baseData || {}) || {};
  if(!Array.isArray(out.indM)) out.indM = [];
  if(!Array.isArray(out.gjM)) out.gjM = [];
  if(out.indM.length && out.gjM.length) return out;
  const needInd = !out.indM.length;
  const needGj = !out.gjM.length;
  const seenInd = new Set();
  const seenGj = new Set();
  (Array.isArray(monthParts) ? monthParts : []).filter(Boolean).forEach(part=>{
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
}
function _recoverCivilMiniFromPlayerHistory(baseData, monthParts){
  const out = _clonePlain(baseData || {}) || {};
  if(!Array.isArray(out.miniM)) out.miniM = [];
  const hasCivil = out.miniM.some(m=>m && (m.type==='civil' || (m.a==='A팀' && m.b==='B팀')));
  if(hasCivil) return out;
  const gameMap = new Map();
  const _splitNames = (v) => String(v || '').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
  (Array.isArray(monthParts) ? monthParts : []).filter(Boolean).forEach(part=>{
    const ph = part && part.playerHistory || {};
    Object.keys(ph).forEach(name=>{
      (Array.isArray(ph[name]) ? ph[name] : []).forEach(h=>{
        if(String(h && h.mode || '').trim() !== '시빌워') return;
        const matchId = String(h.matchId || '').trim();
        if(!matchId) return;
        const prev = gameMap.get(matchId) || { _id:matchId, d:String(h.date||'').trim(), map:String(h.map||'').trim(), p1:'', p2:'', wName:'', lName:'', winNames:new Set(), loseNames:new Set(), univMap:{} };
        prev.d = prev.d || String(h.date||'').trim();
        prev.map = prev.map || String(h.map||'').trim();
        prev.univMap[name] = String(h.univ || '').trim();
        if(h.result === '승'){
          prev.wName = name;
          prev.lName = String(h.opp || '').trim();
          prev.winNames.add(name);
          _splitNames(h.opp).forEach(n => prev.loseNames.add(n));
        }
        else if(h.result === '패'){
          prev.wName = String(h.opp || '').trim();
          prev.lName = name;
          _splitNames(h.opp).forEach(n => prev.winNames.add(n));
          prev.loseNames.add(name);
        }
        prev.p1 = prev.p1 || name;
        prev.p2 = prev.p2 || String(h.opp || '').trim();
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
    const _gameNames = [...(rec.winNames || []), ...(rec.loseNames || [])];
    _gameNames.forEach(n=>{
      if(!n) return;
      if(!sess.players.has(n)) sess.players.set(n, { name:n, univ: String(rec.univMap && rec.univMap[n] || '') });
      if(!sess.adj.has(n)) sess.adj.set(n, new Set());
    });
    const winNames = [...(rec.winNames || [])];
    const loseNames = [...(rec.loseNames || [])];
    winNames.forEach(wn => {
      loseNames.forEach(ln => {
        if(!wn || !ln) return;
        sess.adj.get(wn).add(ln);
        sess.adj.get(ln).add(wn);
      });
    });
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
      const winNames = [...(g.winNames || [])];
      const loseNames = [...(g.loseNames || [])];
      const sa = side.get(winNames[0] || g.wName)||'A';
      const teamA = sa==='A' ? winNames : loseNames;
      const teamB = sa==='A' ? loseNames : winNames;
      const playerA = teamA.join(',');
      const playerB = teamB.join(',');
      const winner = sa==='A' ? 'A' : 'B';
      if(!setsMap.has(g.setIdx)) setsMap.set(g.setIdx, { scoreA:0, scoreB:0, winner:'', games:[] });
      const st = setsMap.get(g.setIdx);
      if(winner==='A') st.scoreA++; else st.scoreB++;
      st.games.push({
        _id:g._id, playerA, playerB, winner, map:g.map||'-',
        wName: winNames.join(','), lName: loseNames.join(','),
        ...(teamA.length >= 2 && teamB.length >= 2 ? { _isTeam:true, teamA:[...teamA], teamB:[...teamB], a1:teamA[0]||'', a2:teamA[1]||'', b1:teamB[0]||'', b2:teamB[1]||'' } : {})
      });
    });
    const sets = [...setsMap.entries()].sort((a,b)=>a[0]-b[0]).map(([,st])=>{
      st.winner = st.scoreA>st.scoreB ? 'A' : (st.scoreB>st.scoreA ? 'B' : '');
      return st;
    });
    const teamAMembers = [...sess.players.values()].filter(p=>(side.get(p.name)||'A')==='A');
    const teamBMembers = [...sess.players.values()].filter(p=>(side.get(p.name)||'A')==='B');
    const sa = sets.reduce((n,s)=>n+(s.scoreA||0),0);
    const sb = sets.reduce((n,s)=>n+(s.scoreB||0),0);
    recovered.push({
      _id:sess._id, d:sess.d||'', a:'A팀', b:'B팀', sa, sb, sets,
      type:'civil', teamAMembers, teamBMembers
    });
  }
  recovered.sort((a,b)=>String(b && b.d || '').localeCompare(String(a && a.d || '')));
  if(recovered.length) out.miniM = out.miniM.concat(recovered);
  return out;
}
function _recoverTierGeneralFromPlayerHistory(baseData, monthParts){
  const out = _clonePlain(baseData || {}) || {};
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
  (Array.isArray(monthParts) ? monthParts : []).filter(Boolean).forEach(part=>{
    const ph = part && part.playerHistory || {};
    Object.keys(ph).forEach(name=>{
      (Array.isArray(ph[name]) ? ph[name] : []).forEach(h=>{
        if(String(h && h.mode || '').trim() !== '티어대회') return;
        const mid = String(h.matchId || '').trim();
        if(!mid || existing.has(mid)) return;
        const prev = byId.get(mid) || { _id:mid, d:String(h.date||'').trim(), map:String(h.map||'').trim(), wName:'', lName:'', count:0, compName:parseTierComp(mid) };
        prev.d = prev.d || String(h.date||'').trim();
        prev.map = prev.map || String(h.map||'').trim();
        prev.count += 1;
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
      _id:rec._id,
      d:rec.d||'',
      a:rec.wName,
      b:rec.lName,
      sa:1,
      sb:0,
      sets:[{ scoreA:1, scoreB:0, winner:'A', games:[{ _id:rec._id, playerA:rec.wName, playerB:rec.lName, winner:'A', map:rec.map||'-', wName:rec.wName, lName:rec.lName }] }],
      n:rec.compName||'복구된 일반전',
      compName:rec.compName||'복구된 일반전',
      stage:'general'
    });
  });
  recovered.sort((a,b)=>String(b && b.d || '').localeCompare(String(a && a.d || '')));
  if(recovered.length) out.ttM = out.ttM.concat(recovered);
  return out;
}
async function _fetchGithubData(){
  let entryErr = null;
  try{
    const entry = await _fetchRepoJson(GH_ENTRY_PATH);
    if(entry && entry.splitStore){
      return await _fetchSplitGithubData(entry.indexPath ? await _fetchRepoJson(entry.indexPath) : entry);
    }
    return entry;
  }catch(e){
    entryErr = e;
  }
  try{
    const idx = await _fetchRepoJson(GH_SPLIT_INDEX_PATH);
    return await _fetchSplitGithubData(idx);
  }catch(e){
    throw entryErr || e || new Error('GitHub data fetch failed');
  }
}
async function _pollGithubOnce(force){
  try{
    const d = await _fetchGithubData();
    const sa = Number(d && d.savedAt || 0) || 0;
    if(force || (sa && sa > _lastSavedAt) || !_lastSnapshot){
      _deliver(d);
    }
  }catch(e){}
}
window.fbRetryMissingMonths = async function(){
  if(_missingRetryInFlight){
    return { ok:false, retried:[], stillMissing:[], busy:true };
  }
  _missingRetryInFlight = true;
  const missing = (()=>{ try{ return JSON.parse(localStorage.getItem('su_sync_missing_months')||'[]')||[]; }catch(e){ return []; } })().filter(Boolean);
  if(!missing.length){
    _toastSync('✅ 누락된 월이 없습니다', 1800);
    try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('✅ 누락 월 없음', '#16a34a'); }catch(e){}
    _missingRetryInFlight = false;
    return { ok:true, retried:[], stillMissing:[] };
  }
  try{
    try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('🔄 누락 월 다시 받는 중...', '#2563eb'); }catch(e){}
    const idx = await _fetchRepoJson(GH_SPLIT_INDEX_PATH);
    const historyDir = String((idx && idx.historyDir) || GH_SPLIT_HISTORY_DIR);
    const retried = [];
    const stillMissing = [];
    const parts = await Promise.all(missing.map(async mk=>{
      try{
        const part = await _fetchRepoJson(`${historyDir}/${mk}.json`);
        retried.push(mk);
        return part;
      }catch(e){
        stillMissing.push(mk);
        return null;
      }
    }));
    if(retried.length){
      const base = _lastSnapshot || await _fetchGithubData();
      const next = _mergeMonthPartsIntoData(base, parts);
      next._missingMonths = stillMissing;
      _deliver(next);
      try{ if(typeof localSave==='function') localSave(); }catch(e){}
      try{ if(typeof window._primeMatchSyncSignature === 'function') window._primeMatchSyncSignature(true); }catch(e){}
    }else{
      _setMissingMonthsMeta(stillMissing);
      try{ if(typeof window.refreshCloudSyncStatus==='function') window.refreshCloudSyncStatus('⚠️ 누락 월 재수신 실패', '#d97706'); }catch(e){}
    }
    if(retried.length && !stillMissing.length) _toastSync('✅ 누락 월 데이터를 모두 다시 받았습니다', 2400);
    else if(retried.length) _toastSync(`⚠️ 일부만 복구됨: ${stillMissing.join(', ')}`, 3200);
    else _toastSync('❌ 누락 월 다시받기 실패', 2400);
    return { ok: retried.length>0, retried, stillMissing };
  } finally {
    _missingRetryInFlight = false;
  }
};
window.fbSet = async function (data) {
  return _queueGithubSave(async ()=>{
    const full = _decodeGithubPayload(data);
    const savedAt = Number(full && full.savedAt || Date.now()) || Date.now();
    try{
      await _saveSplitStore(full);
    }catch(splitErr){
      console.warn('[split-save] failed, fallback to legacy data.json', splitErr);
      await _saveLegacySingleFile(full);
    }
    try{ await _pushFirebaseSignal({ savedAt, changed:['all'] }); }catch(sigErr){ console.warn('[firebase-signal] notify failed', sigErr); }
  });
};
window.fbUpdate = async function (patch) {
  return _queueGithubSave(async ()=>{
    const cur = await _fetchGithubData().catch(()=>({}));
    const next = { ...(cur || {}), ...(patch || {}), savedAt: Date.now() };
    const changed = Object.keys(patch || {});
    try{
      await _saveSplitStore(next);
    }catch(splitErr){
      console.warn('[split-save] failed on update, fallback to legacy data.json', splitErr);
      await _saveLegacySingleFile(next);
    }
    try{ await _pushFirebaseSignal({ savedAt: next.savedAt, changed }); }catch(sigErr){ console.warn('[firebase-signal] notify failed', sigErr); }
  });
};
window.__suBuildSplitStoreData = _buildSplitStoreData;
window.__suEstimateSplitStore = _estimateSplitStore;
window.__suFetchGithubMergedData = _fetchGithubData;
window.__suRecoverMatchArraysFromPlayerHistory = _recoverMatchArraysFromPlayerHistory;
window.__suRecoverCivilMiniFromPlayerHistory = _recoverCivilMiniFromPlayerHistory;
window.__suRecoverTierGeneralFromPlayerHistory = _recoverTierGeneralFromPlayerHistory;
try{ window._fetchGithubData = _fetchGithubData; }catch(e){}
try{ window._pollGithubOnce = _pollGithubOnce; }catch(e){}
