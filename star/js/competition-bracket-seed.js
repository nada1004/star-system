/* ══════════════════════════════════════
   competition-bracket-seed.js — 대진표 시드/부전승 자동 배치
   competition.js에서 분리됨
══════════════════════════════════════ */

function _bktRoundLabelBySize(sz){
  if(sz===2) return '결승';
  if(sz===4) return '4강';
  if(sz===8) return '8강';
  if(sz===16) return '16강';
  if(sz===32) return '32강';
  if(sz===64) return '64강';
  return `${sz}강`;
}
function _bktComputeBracketSize(tn){
  // rCompTourDynamic 기준: r1teams 길이(또는 overrideSize)를 기반으로 브라켓 규모 결정
  const grpRanks=(tn.groups&&tn.groups.length>=2)?tn.groups.map((grp,gi)=>({ranked:_calcGrpRank(grp)})):[];
  const numGroups=grpRanks.length;
  const pairCount=Math.floor(numGroups/2)*2;
  const r1teams=[];
  for(let i=0;i<pairCount;i+=2){
    const gA=grpRanks[i],gB=grpRanks[i+1]||grpRanks[0];
    r1teams.push(gA.ranked[0]?.u||'', gB.ranked[1]?.u||'', gB.ranked[0]?.u||'', gA.ranked[1]?.u||'');
  }
  if(numGroups%2===1){
    const last=grpRanks[numGroups-1];
    r1teams.push(last.ranked[0]?.u||'');
  }
  const overrideSize=tn.bracketOverrideSize||0;
  const numTeams=overrideSize>1?overrideSize:(r1teams.length>0?r1teams.length:8);
  // 올림으로 2의 거듭제곱(라운드 합류 옵션 계산용)
  let brSize=2;
  while(brSize<numTeams) brSize*=2;
  return brSize;
}
function _bktCollectTeams(tn){
  const br=getBracket(tn);
  const s=new Set();
  // 조별 순위 기반 1라운드 후보
  try{
    (tn.groups||[]).forEach(grp=>{
      const ranked=_calcGrpRank(grp);
      ranked.slice(0,2).forEach(x=>{ if(x?.u) s.add(x.u); });
    });
  }catch(e){}
  // 슬롯/승자/수동경기/기록에서 추가 수집
  try{ Object.values(br.slots||{}).forEach(v=>{ if(v) s.add(v); }); }catch(e){}
  try{ Object.values(br.winners||{}).forEach(v=>{ if(v) s.add(v); }); }catch(e){}
  try{ (br.manualMatches||[]).forEach(m=>{ if(m?.a) s.add(m.a); if(m?.b) s.add(m.b); }); }catch(e){}
  return Array.from(s).filter(Boolean).sort((a,b)=>a.localeCompare(b));
}
function openBktSeedModal(tnId){
  const tn=tourneys.find(t=>t.id===tnId);
  if(!tn) return;
  const br=getBracket(tn);
  if(!br.seedStarts) br.seedStarts={};
  const firstSize=_bktComputeBracketSize(tn);
  const sizes=[]; for(let s=firstSize;s>=2;s=Math.floor(s/2)) sizes.push(s);
  const cand=_bktCollectTeams(tn);
  if(!cand.length) return alert('시드 후보(대학)를 찾을 수 없습니다.');
  const modal=document.createElement('div');
  modal.id='_bktSeedModal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML=`<div style="background:var(--white);border-radius:14px;padding:18px;width:min(560px,100%);max-height:90vh;overflow:auto;box-shadow:0 10px 40px rgba(0,0,0,.25)">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <div style="font-weight:900;font-size:14px">🎫 시드/부전승(라운드 합류)</div>
      <div style="margin-left:auto;display:flex;gap:6px">
        <button class="btn btn-b btn-sm" onclick="applyBktSeedStarts('${tnId}')">✅ 적용(자동 배치)</button>
        <button class="btn btn-w btn-sm" onclick="document.getElementById('_bktSeedModal')?.remove()">닫기</button>
      </div>
    </div>
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:12px">
      예: 32강 대회에서 상위 시드가 16강/8강부터 합류(부전승)하는 케이스를 지원합니다.<br>
      <span style="font-size:var(--fs-caption)">※ 정확한 위치 재배치는 각 경기의 <b>✏️ 수정</b>에서 팀A/팀B를 바꾸면 됩니다.</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${cand.map(name=>{
        const cur=parseInt(br.seedStarts[name]||firstSize,10)||firstSize;
        return `<div style="display:flex;align-items:center;gap:10px;border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;background:var(--surface)">
          <div style="font-weight:900;font-size:var(--fs-sm);min-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
          <select data-seed-team="${name.replace(/\"/g,'&quot;')}" style="flex:1;padding:6px 10px;border-radius:var(--r);border:1px solid var(--border2);font-weight:800;font-size:var(--fs-sm)">
            ${sizes.map((s,i)=>`<option value="${s}" ${s===cur?'selected':''}>${i===0?`${_bktRoundLabelBySize(s)}(첫 라운드)`:`${_bktRoundLabelBySize(s)}부터`}</option>`).join('')}
          </select>
        </div>`;
      }).join('')}
    </div>
  </div>`;
  document.body.appendChild(modal);
}
function applyBktSeedStarts(tnId){
  const tn=tourneys.find(t=>t.id===tnId);
  if(!tn) return;
  const br=getBracket(tn);
  const wrap=document.getElementById('_bktSeedModal');
  if(!wrap) return;
  const firstSize=_bktComputeBracketSize(tn);
  if(!br.seedStarts) br.seedStarts={};
  wrap.querySelectorAll('select[data-seed-team]').forEach(sel=>{
    const name=sel.getAttribute('data-seed-team')||'';
    const v=parseInt(sel.value,10)||firstSize;
    if(!name) return;
    br.seedStarts[name]=v;
  });
  if(!confirm('선택한 “시작 라운드” 기준으로 자동 배치할까요?\n(첫 라운드가 아닌 팀은 기존 위치에서 제거 후, 해당 라운드의 빈 슬롯에 배치됩니다.)')) return;

  const sizeToR=(sz)=>{
    const ratio = firstSize / sz;
    const r = Math.round(Math.log2(ratio));
    return Math.max(0, r);
  };
  const normEmpty=v=>(v===undefined||v===null||v===''||v==='BYE');

  // 1) 첫 라운드가 아닌 팀은 기존 슬롯에서 제거
  Object.entries(br.seedStarts||{}).forEach(([name,sz])=>{
    const v=parseInt(sz,10)||firstSize;
    if(v>=firstSize) return;
    Object.keys(br.slots||{}).forEach(k=>{ if(br.slots[k]===name) delete br.slots[k]; });
    // 승자도 제거될 수 있어 전체 winners는 보수적으로 초기화
    Object.keys(br.winners||{}).forEach(k=>{ if(br.winners[k]===name) delete br.winners[k]; });
  });

  // 2) 대상 팀들을 라운드별로 채우기
  const targets = Object.entries(br.seedStarts||{})
    .map(([name,sz])=>({name,sz:parseInt(sz,10)||firstSize}))
    .filter(x=>x.name && x.sz<firstSize)
    .sort((a,b)=>a.sz-b.sz||a.name.localeCompare(b.name));

  const failed=[];
  targets.forEach(({name,sz})=>{
    const r=sizeToR(sz);
    const matchCount = Math.max(1, Math.floor(firstSize / Math.pow(2,r+1)));
    let placed=false;
    for(let mi=0;mi<matchCount&&!placed;mi++){
      const ka=`${r}-${mi}-a`, kb=`${r}-${mi}-b`;
      const va=br.slots[ka], vb=br.slots[kb];
      if(normEmpty(va)){ br.slots[ka]=name; placed=true; break; }
      if(normEmpty(vb)){ br.slots[kb]=name; placed=true; break; }
    }
    if(!placed) failed.push(`${name}(${_bktRoundLabelBySize(sz)})`);
  });
  save(); render();
  if(failed.length) alert('빈 슬롯이 부족해 일부 시드를 배치하지 못했습니다:\n- '+failed.join('\n- '));
}

