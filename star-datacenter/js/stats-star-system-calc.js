/* ══════════════════════════════════════════════════════════════
   통계 - Star System 설정/계산 (stats-core.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

window.starSystemSetEnabled = function(on){
  const v = on ? '1' : '0';
  try{ localStorage.setItem('su_starSystem_enabled', v); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync==="function") window.cfgTouchPrefsSync(); }catch(e){}
  render();
};
window.starSystemSetKeywords = function(v){
  try{ localStorage.setItem('su_starSystem_keywords', String(v||'')); }catch(e){}
  try{ if(typeof window.cfgTouchPrefsSync==="function") window.cfgTouchPrefsSync(); }catch(e){}
  render();
};
function _ssKeywords(){
  const dflt = '대학대전,대학CK,CK,교수,코치,주관,끝장전,미니대전,프로리그,티어대회,대회,토너먼트';
  try{
    const raw = (localStorage.getItem('su_starSystem_keywords') || dflt).trim();
    return raw.split(/[\n,]+/).map(s=>s.trim()).filter(Boolean);
  }catch(e){ return dflt.split(','); }
}
function _ssTierToNum(t){
  const s=String(t||'').trim();
  if(!s) return null;
  if(s==='G' || s==='갓' || s==='K') return 0;
  const m = s.match(/^(\d+)/);
  if(m) return parseInt(m[1],10);
  if(s.includes('0티어')) return 0;
  if(s.includes('1티어')) return 1;
  if(s.includes('2티어')) return 2;
  if(s.includes('3티어')) return 3;
  if(s.includes('4티어')) return 4;
  if(s.includes('5티어')) return 5;
  if(s.includes('6티어')) return 6;
  if(s.includes('7티어')) return 7;
  if(s.includes('8티어')) return 8;
  return null;
}
function _ssCalcFairPoints(tierDiff, result){
  const td = Number.isFinite(tierDiff) ? Math.max(-99, Math.min(99, Math.trunc(tierDiff))) : 0;
  const r = String(result||'').toUpperCase();
  const isWin = (r==='WIN');
  // (최선책) 제로섬(Zero-sum): 승자 +X / 패자 -X
  // - 동일 티어: ±3
  // - 상위 티어 상대(업셋): ±5
  // - 하위 티어 상대(기대승): ±2
  if(td===0) return isWin ? 3 : -3;
  if(td>0) return isWin ? 5 : -5;
  return isWin ? 2 : -2;
}
function _ssDaysAgo(dateStr){
  const d=(dateStr||'');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d)) return 99999;
  const t = new Date(d+'T00:00:00').getTime();
  if(!t) return 99999;
  return Math.max(0, Math.floor((Date.now()-t)/86400000));
}
function _ssStatus(points){
  if(points>=130) return '승급 검증';
  if(points<70) return '강등 위기';
  return '정상';
}
var _ssCacheTime='', _ssCacheKey='', _ssCache=null;
function _ssComputeAll(){
  const t=localStorage.getItem('su_last_save_time')||'0';
  const kw=_ssKeywords().join('|');
  const fk=`${_statsDateFrom}|${_statsDateTo}|${_statsMinGames}|${_statsLastN}`;
  const key=`${t}|${kw}|${fk}`;
  if(_ssCache && _ssCacheTime===t && _ssCacheKey===key) return _ssCache;
  _ssCacheTime=t; _ssCacheKey=key;

  const kws=_ssKeywords();
  const matchOfficial = (mode) => {
    const m=String(mode||'');
    if(!m) return false;
    return kws.some(k=>k && m.includes(k));
  };

  const _players = Array.isArray(players) ? players : [];
  const out = [];
  _players.forEach(p=>{
    const myTierNum=_ssTierToNum(p.tier);
    if(myTierNum==null) return;
    let pts=100;
    let games=0;
    let last='';
    const hist = statsNonProHist(p).filter(h=>matchOfficial(h.mode||h.type||''));
    const sorted=[...hist].sort((a,b)=>(String(a.date||'')).localeCompare(String(b.date||'')));
    sorted.forEach(h=>{
      const opp = statsP(h.opp);
      const oppTierNum = _ssTierToNum(opp?.tier);
      if(oppTierNum==null) return;
      const tierDiff = oppTierNum - myTierNum;
      const res = (h.result==='승') ? 'WIN' : (h.result==='패') ? 'LOSS' : '';
      if(!res) return;
      pts += _ssCalcFairPoints(tierDiff, res);
      games++;
      if(h.date && h.date>last) last=h.date;
    });

    const days=_ssDaysAgo(last);
    let inactiveNote='';
    if(myTierNum<=1){
      if(days>=365){ inactiveNote='비활성(1년+)'; }
    }else if(myTierNum===2){
      if(days>=183 && days<365){
        const months = Math.min(6, Math.max(1, Math.floor((days-183)/30)+1));
        pts -= (months*3);
        inactiveNote=`미활동 감쇄 -${months*3}점`;
      }
    }else{
      if(days>=183){
        inactiveNote='미활동(6개월+) → 강등/말소 대상';
      }
    }

    out.push({
      name:p.name, univ:p.univ, race:p.race,
      tier:p.tier, tierNum:myTierNum,
      points:Math.round(pts),
      status:_ssStatus(pts),
      inactiveNote,
      games,
      last,
    });
  });
  out.sort((a,b)=> a.tierNum-b.tierNum || b.points-a.points || b.games-a.games);
  _ssCache = out;
  return out;
}
