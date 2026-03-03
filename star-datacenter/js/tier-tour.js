/* ══════════════════════════════════════
   📋 대회 경기 붙여넣기 일괄 입력
══════════════════════════════════════ */
let _grpPasteState = null; // {tnId, gi, mi}

/* ── 대회 경기 붙여넣기: 일반 pasteModal을 재활용 ── */
function openGrpPasteModal(){
  _grpPasteState = {...grpMatchState};
  const tn = tourneys.find(t=>t.id===grpMatchState.tnId); if(!tn) return;
  const grp = tn.groups[grpMatchState.gi];
  const m = grp.matches[grpMatchState.mi];
  const teamA = document.getElementById('gm-a')?.value||m.a||'';
  const teamB = document.getElementById('gm-b')?.value||m.b||'';

  // 일반 pasteModal을 열되 대회 세트 적용 모드로 표시
  window._grpPasteMode = true; // pasteApply에서 대회 세트 적용으로 분기

  // pasteModal 초기화 (openPasteModal 로직 인라인)
  const textarea  = document.getElementById('paste-input');
  const previewEl = document.getElementById('paste-preview');
  const applyBtn  = document.getElementById('paste-apply-btn');
  const badge     = document.getElementById('paste-summary-badge');
  const pendWarn  = document.getElementById('paste-pending-warn');
  if (textarea)  textarea.value  = '';
  if (previewEl) previewEl.innerHTML = '';
  if (applyBtn)  { applyBtn.style.display = 'none'; applyBtn.textContent = '✅ 세트에 적용'; }
  if (badge)     badge.style.display = 'none';
  if (pendWarn)  pendWarn.style.display = 'none';
  window._pasteResults = null;
  window._pasteErrors  = null;

  const dateInput = document.getElementById('paste-date');
  if (dateInput) dateInput.value = m.d || new Date().toISOString().slice(0,10);

  // 저장형식 영역에 대회 팀 정보 안내로 대체 (숨김 처리)
  const modeWrap = document.querySelector('#pasteModal [id="paste-mode"]')?.closest('div');
  // 모드 선택 숨기고 대회 안내 배너 추가
  const modeSel = document.getElementById('paste-mode');
  if(modeSel){ modeSel.value='comp'; modeSel.style.display='none'; }
  const modeLabel = document.getElementById('paste-mode-label');
  if(modeLabel) modeLabel.style.display='none';
  const hintEl = document.getElementById('paste-mode-hint');
  if(hintEl) hintEl.innerHTML = `<span style="color:#1d4ed8;font-weight:700">🏆 대회 경기 입력 모드</span> — <b>팀A: ${teamA}</b> vs <b>팀B: ${teamB}</b> · 붙여넣기 후 [세트에 적용]을 누르면 세트에 자동 추가됩니다.`;

  // 세트 선택 드롭다운을 paste-comp-wrap 영역에 삽입
  const compWrap = document.getElementById('paste-comp-wrap');
  if(compWrap){
    const setOpts = (m.sets||[]).map((s,i)=>{
      const lbl = i===2?'🎯 에이스전':`${i+1}세트`;
      return `<option value="${i}">${lbl}</option>`;
    }).join('');
    compWrap.style.display='flex';
    compWrap.innerHTML = `
      <label style="font-size:12px;font-weight:700;white-space:nowrap">추가할 세트:</label>
      <select id="grp-paste-set-sel" style="padding:5px 10px;border-radius:6px;border:1px solid var(--border2);font-size:12px">
        ${setOpts||'<option value="new">새 세트 자동 추가</option>'}
        <option value="new">+ 새 세트 추가</option>
      </select>`;
  }

  om('pasteModal');
}

// grpPasteApply: 대회 세트 적용 버튼 핸들러 (HTML에서 직접 호출)
function grpPasteApply(){
  if(!window._pasteResults) return;
  const savable = window._pasteResults.filter(r=>r.wPlayer&&r.lPlayer);
  if(!savable.length){ alert('저장 가능한 경기가 없습니다.'); return; }
  const ok = _grpPasteApplyLogic(savable);
  if(ok){
    window._grpPasteMode = false;
    cm('pasteModal');
    window._pasteResults = null;
    window._pasteErrors  = null;
  }
}

// grpPasteApply 내부 로직
function _grpPasteApplyLogic(savable){
  const tn = tourneys.find(t=>t.id===_grpPasteState.tnId); if(!tn) return false;
  const m = tn.groups[_grpPasteState.gi].matches[_grpPasteState.mi];
  const teamA = document.getElementById('gm-a')?.value||m.a||'';
  const teamB = document.getElementById('gm-b')?.value||m.b||'';

  let setIdxEl = document.getElementById('grp-paste-set-sel');
  let setIdx = setIdxEl ? setIdxEl.value : 'new';
  if(!m.sets) m.sets=[];
  if(setIdx==='new'||setIdx===undefined){
    if(m.sets.length>=3){ alert('최대 3세트까지만 가능합니다.'); return false; }
    m.sets.push({games:[],scoreA:0,scoreB:0,winner:''});
    setIdx = m.sets.length-1;
  } else {
    setIdx = parseInt(setIdx);
  }
  const set = m.sets[setIdx];
  if(!set.games) set.games=[];

  const teamANamesSet = new Set(players.filter(p=>p.univ===teamA).map(p=>p.name));
  savable.forEach(r=>{
    const wn = r.wPlayer.name; const ln = r.lPlayer.name;
    let pA='', pB='', winner='';
    if(teamANamesSet.has(wn)){ pA=wn; pB=ln; winner='A'; }
    else { pA=ln; pB=wn; winner='B'; }
    set.games.push({playerA:pA, playerB:pB, winner:winner, map:r.map||''});
  });
  let sA=0,sB=0;
  set.games.forEach(g=>{ if(g.winner==='A')sA++; else if(g.winner==='B')sB++; });
  set.scoreA=sA; set.scoreB=sB; set.winner=sA>sB?'A':sB>sA?'B':'';
  if(!m.a) m.a=teamA;
  if(!m.b) m.b=teamB;
  const dateEl = document.getElementById('paste-date');
  if(dateEl&&dateEl.value) m.d=dateEl.value;

  // 개인 전적 반영
  const matchId = genId();
  savable.forEach(r=>{ applyGameResult(r.wPlayer.name, r.lPlayer.name, dateEl?.value||'', r.map||'-', matchId); });

  save();
  grpRefreshSets();

  const toast=document.createElement('div');
  toast.textContent=`✅ ${savable.length}건 ${setIdx===2?'에이스전':(setIdx+1)+'세트'}에 추가됨!`;
  toast.style.cssText='position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#16a34a;color:#fff;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.2)';
  document.body.appendChild(toast);
  setTimeout(()=>toast.remove(),2500);
  return true;
}

/* ══════════════════════════════════════
   🎯 티어대회 - CK 방식 경기 입력
══════════════════════════════════════ */
let _ttSub = 'input'; // input | records

function rTierTour(){
  if(!isLoggedIn && _ttSub==='input') _ttSub='records';
  const subOpts=[
    {id:'input',lbl:'📝 경기 입력',fn:`_ttSub='input';render()`},
    {id:'records',lbl:'📋 기록',fn:`_ttSub='records';openDetails={};render()`}
  ];
  let h=stabs(_ttSub,subOpts);
  if(_ttSub==='input' && isLoggedIn){
    if(!BLD['tt'])BLD['tt']={date:'',tiers:[],membersA:[],membersB:[],sets:[]};
    h+=buildTierTourInputHTML();
  } else {
    // 기록은 ckM 중 tt 타입만 or 별도 ttM 배열 사용
    // 간단하게 ttM 배열에 저장
    h+=ttM&&ttM.length?recSummaryListHTML(ttM,'tt','tiertour'):'<div style="padding:40px;text-align:center;color:var(--gray-l)">기록이 없습니다.</div>';
  }
  return h;
}

function buildTierTourInputHTML(){
  const bld=BLD['tt'];
  if(!bld.tiers)bld.tiers=[];
  const tfs=bld.tiers;
  const eligible=players.filter(p=>tfs.length===0||tfs.includes(p.tier));
  const mA=bld.membersA||[];const mB=bld.membersB||[];
  const addedNames=[...mA,...mB].map(m=>m.name);

  let h=`<div class="match-builder"><h3>🎯 티어대회 입력</h3>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <label style="font-size:12px;font-weight:700;color:var(--blue)">날짜</label>
      <input type="date" value="${bld.date||''}" onchange="BLD['tt'].date=this.value">
    </div>

    <!-- 참가 티어 선택 -->
    <div style="background:var(--blue-l);border:1px solid var(--blue-ll);border-radius:10px;padding:10px 14px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:8px">① 참가 티어 <span style="font-weight:400;color:var(--gray-l)">(복수 선택)</span></div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <button class="tier-filter-btn ${tfs.length===0?'on':''}" onclick="BLD['tt'].tiers=[];BLD['tt'].membersA=[];BLD['tt'].membersB=[];BLD['tt'].sets=[];render()">전체</button>
        ${TIERS.map(t=>{const _bg=getTierBtnColor(t),_tc=getTierBtnTextColor(t),_on=tfs.includes(t);return`<button class="tier-filter-btn ${_on?'on':''}" style="${_on?`background:${_bg};color:${_tc};border-color:${_bg}`:''}" onclick="ttToggleTier('${t}')">${getTierLabel(t)}</button>`;}).join('')}
      </div>
      <div style="font-size:11px;color:var(--blue);margin-top:6px">대상 선수: <strong>${eligible.length}명</strong></div>
    </div>

    <!-- 선수 목록 클릭으로 팀 배정 -->
    <div style="margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">② 선수 클릭 → 팀 배정 <span style="font-weight:400;color:var(--gray-l);font-size:11px">(A팀 버튼 / B팀 버튼으로 추가)</span></div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;max-height:200px;overflow-y:auto">
        ${eligible.length===0
          ?'<span style="color:var(--gray-l);font-size:12px">티어를 선택하면 선수 목록이 표시됩니다</span>'
          :eligible.map(p=>{
              const inA=mA.some(m=>m.name===p.name);
              const inB=mB.some(m=>m.name===p.name);
              const bg=inA?'#2563eb':inB?'#dc2626':gc(p.univ);
              if(inA||inB){
                return `<span style="display:inline-flex;align-items:center;gap:3px;background:${bg};color:#fff;padding:4px 8px;border-radius:6px;font-size:11px;opacity:0.55">${p.name}<span style="opacity:.8;font-size:10px;margin-left:2px">${p.univ}/${p.tier}</span><span style="background:rgba(255,255,255,.3);border-radius:2px;padding:0 4px;font-size:9px;font-weight:800;margin-left:3px">${inA?'A팀':'B팀'}</span></span>`;
              }
              return `<span style="display:inline-flex;align-items:center;gap:4px;background:${bg};color:#fff;padding:3px 6px;border-radius:6px;font-size:11px">
                <span style="font-weight:700">${p.name}</span><span style="opacity:.8;font-size:10px">${p.univ}/${p.tier}</span>
                <button onclick="ttAddPlayer('A','${p.name}')" style="background:var(--white);color:#2563eb;border:none;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:800;cursor:pointer;margin-left:2px">A팀</button>
                <button onclick="ttAddPlayer('B','${p.name}')" style="background:var(--white);color:#dc2626;border:none;border-radius:3px;padding:1px 6px;font-size:10px;font-weight:800;cursor:pointer">B팀</button>
              </span>`;
            }).join('')
        }
      </div>
    </div>

    <!-- 팀 구성 확인 + 검색 추가 -->
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:16px">
      <div class="ck-panel">
        <h4>🔵 팀 A (${mA.length}명)</h4>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="tt-a-search" placeholder="🔍 이름·메모 검색..." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="ttSearchPlayer('A')">
        </div>
        <div id="tt-a-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mA.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''})</span><button onclick="BLD['tt'].membersA.splice(${i},1);BLD['tt'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">선수 없음</span>'}</div>
      </div>
      <div class="ck-panel">
        <h4>🔴 팀 B (${mB.length}명)</h4>
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input type="text" id="tt-b-search" placeholder="🔍 이름·메모 검색..." style="flex:1;padding:5px 8px;border:1px solid var(--border2);border-radius:6px;font-size:12px" oninput="ttSearchPlayer('B')">
        </div>
        <div id="tt-b-drop" style="display:none;max-height:140px;overflow-y:auto;border:1px solid var(--border2);border-radius:6px;background:var(--white);margin-bottom:6px"></div>
        <div>${mB.map((m,i)=>`<span class="mem-tag" style="background:${gc(m.univ)}">${m.name}<span style="font-size:10px;opacity:.8">(${m.univ}${m.tier?'/'+m.tier:''})</span><button onclick="BLD['tt'].membersB.splice(${i},1);BLD['tt'].sets=[];render()">×</button></span>`).join('')||'<span style="color:var(--gray-l);font-size:12px">선수 없음</span>'}</div>
      </div>
    </div>`;
  h+=setBuilderHTML(bld,'tt');h+=`</div>`;return h;
}

function ttToggleTier(t){
  const bld=BLD['tt'];if(!bld)return;
  if(!bld.tiers)bld.tiers=[];
  const i=bld.tiers.indexOf(t);
  if(i>=0)bld.tiers.splice(i,1);else bld.tiers.push(t);
  bld.membersA=[];bld.membersB=[];bld.sets=[];render();
}

function ttAddPlayer(team, name){
  const bld=BLD['tt'];if(!bld)return;
  const all=[...(bld.membersA||[]),...(bld.membersB||[])];
  if(all.find(m=>m.name===name))return;
  const pObj=players.find(p=>p.name===name)||{};
  const mem={name,univ:pObj.univ||'',race:pObj.race||'',tier:pObj.tier||''};
  if(team==='A')bld.membersA.push(mem);else bld.membersB.push(mem);
  bld.sets=[];render();
}

function ttSearchPlayer(team){
  const searchEl=document.getElementById(`tt-${team.toLowerCase()}-search`);
  const dropEl=document.getElementById(`tt-${team.toLowerCase()}-drop`);
  if(!searchEl||!dropEl)return;
  const q=searchEl.value.trim().toLowerCase();
  if(!q){dropEl.style.display='none';dropEl.innerHTML='';return;}
  const bld=BLD['tt']||{};
  const tfs=bld.tiers||[];
  const already=[...(bld.membersA||[]),...(bld.membersB||[])].map(m=>m.name);
  const results=players.filter(p=>
    (tfs.length===0||tfs.includes(p.tier)) &&
    !already.includes(p.name) &&
    (p.name.toLowerCase().includes(q)||(p.memo||'').toLowerCase().includes(q)||(p.univ||'').toLowerCase().includes(q))
  ).slice(0,15);
  if(!results.length){dropEl.innerHTML='<div style="padding:8px 12px;color:var(--gray-l);font-size:12px">결과 없음</div>';dropEl.style.display='block';return;}
  dropEl.innerHTML=results.map(p=>`<div onclick="ttAddPlayer('${team}','${p.name}')"
    style="padding:7px 12px;cursor:pointer;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:7px;font-size:12px"
    onmouseover="this.style.background='#f0f6ff'" onmouseout="this.style.background=''">
    <span style="width:26px;height:26px;border-radius:5px;background:${gc(p.univ)};color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${p.race||'?'}</span>
    <div><div style="font-weight:700">${p.name} <span style="font-size:10px;color:var(--gray-l)">${p.univ} · ${p.tier||'-'}</span></div></div>
  </div>`).join('');
  dropEl.style.display='block';
}

function tierTourAutoGroup(){
  const st=_tierTourState;
  if(!st.groups.length){
    const n=parseInt(prompt('몇 조로 나눌까요?','4')||'0');
    if(!n||n<2)return;
    st.groups=[];
    for(let i=0;i<n;i++) st.groups.push({name:'GROUP '+String.fromCharCode(65+i),players:[],matches:[]});
  }
  // 선택된 티어 선수들 섞어서 배정
  const eligible=players.filter(p=>st.tiers.length===0||st.tiers.includes(p.tier));
  const shuffled=[...eligible].sort(()=>Math.random()-0.5);
  st.groups.forEach(g=>g.players=[]);
  shuffled.forEach((p,i)=>{
    st.groups[i%st.groups.length].players.push(p.name);
  });
  render();
}

function grpRenameTourney(){
  const tn=tourneys.find(t=>t.name===curComp);
  if(!tn){alert('대회를 먼저 선택하세요.');return;}
  const newName=prompt('새 대회명을 입력하세요:',tn.name);
  if(!newName||!newName.trim()||newName.trim()===tn.name)return;
  const trimmed=newName.trim();
  if(tourneys.find(t=>t.name===trimmed&&t.id!==tn.id)){alert('이미 같은 이름의 대회가 있습니다.');return;}
  // comps에서도 대회명 업데이트
  comps.forEach(m=>{if(m.n===tn.name)m.n=trimmed;if(m.a===tn.name)m.a=trimmed;});
  curComp=trimmed;
  tn.name=trimmed;
  save();render();
}

function grpDelCurTourney(){
  const tn=tourneys.find(t=>t.name===curComp);
  if(!tn){alert('대회를 먼저 선택하세요.');return;}
  const matchCount=tn.groups.reduce((s,g)=>s+(g.matches||[]).length,0);
  if(!confirm(`"${tn.name}" 대회를 삭제하시겠습니까?\n(${tn.groups.length}개 조 · ${matchCount}경기 모두 삭제됩니다)`))return;
  const ti=tourneys.indexOf(tn);
  tourneys.splice(ti,1);
  curComp=tourneys.length?tourneys[0].name:'';
  save();render();
}

function grpNewLeagueTourney(){
  const name=prompt('일반 대회명을 입력하세요:');if(!name||!name.trim())return;
  const id=genId();tourneys.unshift({id,name:name.trim(),type:'league',groups:[],createdAt:new Date().toISOString()});
  curComp=name.trim();save();grpEditId=tourneys[0].id;grpSub='edit';compSub='grpedit';render();
}
function grpNewTierTourney(){
  const name=prompt('티어 대회명을 입력하세요:');if(!name||!name.trim())return;
  const id=genId();tourneys.unshift({id,name:name.trim(),type:'tier',groups:[],createdAt:new Date().toISOString()});
  curComp=name.trim();save();compSub='tiertour';render();
}
function grpNewTourney(){grpNewLeagueTourney();}
function grpDelTourney(ti){
  if(!confirm(`"${tourneys[ti].name}" 대회를 삭제하시겠습니까?`))return;
  if(curComp===tourneys[ti].name)curComp='';tourneys.splice(ti,1);save();render();
}
function grpFilterUnivSel(gi){
  const searchEl=document.getElementById(`grp-univ-search-${gi}`);
  const selEl=document.getElementById(`grp-univ-sel-${gi}`);
  if(!searchEl||!selEl)return;
  const q=searchEl.value.trim().toLowerCase();
  Array.from(selEl.options).forEach(opt=>{
    if(!opt.value)return;
    opt.style.display=(!q||opt.text.toLowerCase().includes(q))?'':'none';
  });
  // 첫 번째 매칭 옵션 자동 선택
  const firstMatch=Array.from(selEl.options).find(o=>o.value&&o.style.display!=='none');
  if(firstMatch)selEl.value=firstMatch.value;
}

function grpAddGroup(tnId){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const name=`${'ABCDEFGHIJ'[tn.groups.length]||tn.groups.length+1}조`;
  tn.groups.push({name,univs:[],matches:[]});save();render();
}
function grpDelGroup(tnId,gi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  if(!confirm(`"${tn.groups[gi].name}"을 삭제하시겠습니까?`))return;
  tn.groups.splice(gi,1);save();render();
}
function grpAddUniv(tnId,gi){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  const sel=document.getElementById(`grp-univ-sel-${gi}`);const val=sel?sel.value:'';
  if(!val){alert('대학을 선택하세요.');return;}
  if(tn.groups[gi].univs.includes(val)){alert('이미 추가된 대학입니다.');return;}
  tn.groups[gi].univs.push(val);save();render();
}
function grpRemoveUniv(tnId,gi,ui){
  const tn=tourneys.find(t=>t.id===tnId);if(!tn)return;
  tn.groups[gi].univs.splice(ui,1);save();render();
}
function bindLeagueDateBtns(){}


/* ══════════════════════════════════════
   회원 관리 (rMember)
══════════════════════════════════════ */
let memberSearch='';
let memberEditId=null;

const BAN_TYPES=[
  {val:'30h',lbl:'30시간'},{val:'60h',lbl:'60시간'},{val:'100h',lbl:'100시간'},
  {val:'10d',lbl:'10일'},{val:'30d',lbl:'30일'},{val:'60d',lbl:'60일'},{val:'perm',lbl:'영구차단'}
];
const MEMBER_CATS=[{val:'warn',lbl:'⚠️ 주의'},{val:'bad',lbl:'😡 악성'},{val:'sus',lbl:'🔍 의심'}];

function banEndLabel(m){
  if(!m.banType)return '';
  if(m.banType==='perm')return '영구차단';
  if(!m.banEnd)return m.banType;
  const end=new Date(m.banEnd);const now=new Date();
  if(now>=end)return '✅ 차단 완료';
  const diff=Math.ceil((end-now)/3600000);
  return `차단 중 (${diff}시간 남음)`;
}

function isBanDone(m){
  if(!m.banType||m.banType==='perm')return false;
  if(!m.banEnd)return false;
  return new Date()>=new Date(m.banEnd);
}

function rMember(C,T){
  T.innerText='👥 회원 관리';
  const adminOk=isLoggedIn;
  // 차단 완료자 분리
  const done=members.filter(m=>isBanDone(m));
  const active=members.filter(m=>!isBanDone(m));
  const filtered=memberSearch
    ? active.filter(m=>m.nick.toLowerCase().includes(memberSearch.toLowerCase())||m.uid.toLowerCase().includes(memberSearch.toLowerCase()))
    : active;

  let h=`<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:16px">
    <input type="text" id="memberSearchInput" placeholder="닉네임 또는 회원번호 입력..." value="${memberSearch}"
      style="flex:1;max-width:280px" onkeydown="if(event.key==='Enter')memberDoSearch()">
    <button class="btn btn-b btn-sm" onclick="memberDoSearch()">🔍 회원검색</button>
    ${memberSearch?`<button class="btn btn-w btn-sm" onclick="memberSearch='';render()">✕ 초기화</button>`:''}
    ${adminOk?`<button class="btn btn-g btn-sm" onclick="memberOpenAdd()">+ 회원 추가</button>`:''}
  </div>`;

  // 차단 완료자 알림
  if(done.length){
    h+=`<div style="background:#f0fdf4;border:2px solid #86efac;border-radius:10px;padding:12px 16px;margin-bottom:16px">
      <div style="font-weight:700;font-size:13px;color:#16a34a;margin-bottom:8px">✅ 차단 완료자 (${done.length}명)</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">`;
    done.forEach(m=>{
      h+=`<span style="background:#dcfce7;color:#16a34a;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:700">
        ${m.nick} <span style="opacity:.6">(${m.uid})</span>
        ${adminOk?`<button onclick="memberConfirmDone('${m.id}')" style="background:none;border:none;color:#16a34a;cursor:pointer;font-weight:700;margin-left:4px">✓ 확인</button>`:''}
      </span>`;
    });
    h+=`</div></div>`;
  }

  if(!filtered.length){h+=`<div style="padding:40px;text-align:center;color:var(--gray-l);background:var(--surface);border-radius:10px">${memberSearch?'검색 결과 없음':'등록된 회원이 없습니다.'}</div>`;C.innerHTML=h;return;}

  h+=`<table><thead><tr><th>닉네임</th><th>회원번호</th><th>분류</th><th>차단</th><th>차단이력</th><th>상태</th><th>등록일</th><th>관리</th></tr></thead><tbody>`;
  filtered.forEach(m=>{
    const catObj=MEMBER_CATS.find(c=>c.val===m.category)||{lbl:''};
    const banLabel=banEndLabel(m);
    const isActive=m.banType&&!isBanDone(m);
    const banHistCount=(m.banHistory||[]).length;
    h+=`<tr style="${isActive?'background:#fff1f1':''}">
      <td style="font-weight:700">${m.nick}</td>
      <td style="color:var(--gray-l)">${m.uid}</td>
      <td>${catObj.lbl?`<span style="font-size:11px">${catObj.lbl}</span>`:'-'}</td>
      <td><span style="font-size:11px;font-weight:700;color:${isActive?'var(--red)':banLabel.startsWith('✅')?'var(--green)':'var(--gray-l)'}">${banLabel||'-'}</span></td>
      <td><span style="font-size:11px;font-weight:700;color:${banHistCount>0?'var(--red)':'var(--gray-l)'}">${banHistCount}건</span></td>
      <td><button class="btn-detail" style="font-size:11px" onclick="memberOpenDetail('${m.id}')">상세보기</button></td>
      <td style="color:var(--gray-l);font-size:11px">${(m.createdAt||'').slice(0,10)}</td>
      <td class="no-export">${adminOk?`<button class="btn btn-o btn-xs" onclick="memberOpenEdit('${m.id}')">수정</button> <button class="btn btn-r btn-xs" onclick="memberDel('${m.id}')">삭제</button>`:'-'}</td>
    </tr>`;
  });
  h+=`</tbody></table>`;
  C.innerHTML=h;
}

function memberDoSearch(){
  const inp=document.getElementById('memberSearchInput');
  if(inp) memberSearch=inp.value.trim();
  render();
}

function memberOpenAdd(){
  memberEditId=null;_tmpPosts=[];_tmpComments=[];
  document.getElementById('memberModalTitle').textContent='회원 추가';
  memberFillForm({nick:'',uid:'',category:'warn',banType:'',memo:'',report:'',posts:[]});
  om('memberModal');
}

function memberOpenEdit(id){
  const m=members.find(x=>x.id===id);if(!m)return;
  memberEditId=id;_tmpPosts=[...(m.posts||[])];_tmpComments=[...(m.comments||[])];
  document.getElementById('memberModalTitle').textContent='회원 수정';
  memberFillForm(m);
  om('memberModal');
}

function memberFillForm(m){
  const banOpts=BAN_TYPES.map(b=>`<option value="${b.val}"${m.banType===b.val?' selected':''}>${b.lbl}</option>`).join('');
  const catOpts=MEMBER_CATS.map(c=>`<option value="${c.val}"${m.category===c.val?' selected':''}>${c.lbl}</option>`).join('');
  // 차단 이력 표시 (저장된 기록)
  const banHist=(m.banHistory||[]);
  const banHistHTML=banHist.length?`<div style="margin-top:8px;max-height:120px;overflow-y:auto;">`+banHist.map(h=>`<div style="font-size:11px;padding:3px 8px;background:var(--surface);border-radius:4px;margin-bottom:3px;color:var(--gray-l)">${h.date} · ${h.type} · ${h.memo||''}</div>`).join('')+`</div>`:'<div style="font-size:11px;color:var(--gray-l)">없음</div>';
  document.getElementById('memberModalBody').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--gray-l);display:block;margin-bottom:4px">닉네임 *</label>
        <input type="text" id="mb-nick" value="${m.nick||''}" placeholder="닉네임" style="width:100%">
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--gray-l);display:block;margin-bottom:4px">회원번호 *</label>
        <input type="text" id="mb-uid" value="${m.uid||''}" placeholder="회원번호" style="width:100%">
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--gray-l);display:block;margin-bottom:4px">분류</label>
        <select id="mb-cat" style="width:100%"><option value="">분류 없음</option>${catOpts}</select>
      </div>
      <div>
        <label style="font-size:11px;font-weight:700;color:var(--gray-l);display:block;margin-bottom:4px">차단 기간 (새로 추가)</label>
        <select id="mb-ban" style="width:100%"><option value="">차단 없음</option>${banOpts}</select>
      </div>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:11px;font-weight:700;color:var(--gray-l);display:block;margin-bottom:4px">메모</label>
      <textarea id="mb-memo" rows="2" style="width:100%;padding:8px;border:1px solid var(--border2);border-radius:6px;font-size:12px;resize:vertical">${m.memo||''}</textarea>
    </div>
    <div style="margin-bottom:10px">
      <label style="font-size:11px;font-weight:700;color:var(--red);display:block;margin-bottom:4px">🚨 신고 내용</label>
      <textarea id="mb-report" rows="2" style="width:100%;padding:8px;border:1.5px solid var(--red);border-radius:6px;font-size:12px;resize:vertical;color:var(--text)">${m.report||''}</textarea>
    </div>
    <div style="background:var(--surface);border-radius:8px;padding:10px 12px;margin-bottom:10px">
      <div style="font-weight:700;font-size:12px;color:var(--red);margin-bottom:6px">🚫 차단 이력 (${banHist.length}건)</div>
      ${banHistHTML}
    </div>
    <div>
      <div style="font-weight:700;font-size:12px;color:var(--blue);margin-bottom:6px">🔗 게시글 이력</div>
      <div id="mb-posts">${memberPostsHTML(_tmpPosts)}</div>
      <div style="display:flex;gap:6px;margin-top:6px">
        <input type="text" id="mb-post-url" placeholder="게시글 URL" style="flex:1">
        <input type="text" id="mb-post-note" placeholder="메모" style="width:100px">
        <button class="btn btn-b btn-xs" onclick="memberAddPost()">추가</button>
      </div>
    </div>
    <div style="margin-top:10px">
      <div style="font-weight:700;font-size:12px;color:var(--red);margin-bottom:6px">💬 댓글 이력</div>
      <div id="mb-comments">${memberCommentsHTML(_tmpComments)}</div>
    </div>`;
}

function memberPostsHTML(posts){
  if(!posts.length)return '<div style="color:var(--gray-l);font-size:11px">없음</div>';
  return posts.map((p,i)=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;background:var(--surface);padding:4px 8px;border-radius:6px">
    <a href="${p.url}" target="_blank" style="color:var(--blue);font-size:11px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.url}</a>
    ${p.note?`<span style="font-size:10px;color:var(--gray-l)">${p.note}</span>`:''}
    <span style="font-size:10px;color:var(--gray-l)">${(p.savedAt||'').slice(0,10)}</span>
    <button onclick="memberRemovePost(${i})" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:12px">×</button>
  </div>`).join('');
}

function memberCommentsHTML(comments){
  if(!comments.length)return '<div style="color:var(--gray-l);font-size:11px">없음</div>';
  return comments.map((c,i)=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;background:var(--surface);padding:4px 8px;border-radius:6px">
    <a href="${c.url}" target="_blank" style="color:var(--red);font-size:11px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.url}</a>
    ${c.note?`<span style="font-size:10px;color:var(--gray-l)">${c.note}</span>`:''}
    <span style="font-size:10px;color:var(--gray-l)">${(c.savedAt||'').slice(0,10)}</span>
    <button onclick="memberRemoveComment(${i})" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:12px">×</button>
  </div>`).join('');
}

// 임시 편집용 배열
let _tmpPosts=[];
function memberAddPost(){
  const url=document.getElementById('mb-post-url').value.trim();
  const note=document.getElementById('mb-post-note').value.trim();
  if(!url)return;
  _tmpPosts.push({url,note,savedAt:new Date().toISOString()});
  document.getElementById('mb-post-url').value='';
  document.getElementById('mb-post-note').value='';
  document.getElementById('mb-posts').innerHTML=memberPostsHTML(_tmpPosts);
}
function memberRemovePost(i){_tmpPosts.splice(i,1);document.getElementById('mb-posts').innerHTML=memberPostsHTML(_tmpPosts);}

let _tmpComments=[];
function memberRemoveComment(i){_tmpComments.splice(i,1);const el=document.getElementById('mb-comments');if(el)el.innerHTML=memberCommentsHTML(_tmpComments);}

function memberSave(){
  const nick=document.getElementById('mb-nick').value.trim();
  const uid=document.getElementById('mb-uid').value.trim();
  if(!nick||!uid){alert('닉네임과 회원번호를 입력하세요.');return;}
  const banType=document.getElementById('mb-ban').value;
  const cat=document.getElementById('mb-cat').value;
  const memo=document.getElementById('mb-memo').value;
  const report=document.getElementById('mb-report').value;
  let banEnd=null;
  if(banType&&banType!=='perm'){
    const now2=new Date();
    if(banType.endsWith('h'))banEnd=new Date(now2.getTime()+parseInt(banType)*3600000).toISOString();
    else if(banType.endsWith('d'))banEnd=new Date(now2.getTime()+parseInt(banType)*86400000).toISOString();
  }
  const now=new Date().toISOString();
  if(memberEditId){
    const idx=members.findIndex(m=>m.id===memberEditId);
    if(idx>=0){
      const existing=members[idx];
      const banHistory=[...(existing.banHistory||[])];
      // 새로운 차단이 추가된 경우에만 이력에 기록
      if(banType&&banType!==existing.banType){
        const bt=BAN_TYPES.find(b=>b.val===banType);
        banHistory.push({date:now.slice(0,10),type:bt?bt.lbl:banType,memo,banEnd});
      }
      members[idx]={...existing,nick,uid,category:cat,banType,banEnd,banHistory,memo,report,posts:_tmpPosts,updatedAt:now};
    }
  } else {
    const banHistory=[];
    if(banType){const bt=BAN_TYPES.find(b=>b.val===banType);banHistory.push({date:now.slice(0,10),type:bt?bt.lbl:banType,memo,banEnd});}
    members.unshift({id:genId(),nick,uid,category:cat,banType,banEnd,banHistory,memo,report,posts:_tmpPosts,createdAt:now,updatedAt:now});
  }
  save();cm('memberModal');render();
}

function memberDel(id){
  if(!confirm('삭제하시겠습니까?'))return;
  members=members.filter(m=>m.id!==id);save();render();
}

function memberConfirmDone(id){
  const m=members.find(x=>x.id===id);if(!m)return;
  m.banType='';m.banEnd=null;save();render();
}

function memberOpenDetail(id){
  const m=members.find(x=>x.id===id);if(!m)return;
  const catObj=MEMBER_CATS.find(c=>c.val===m.category)||{lbl:''};
  const banLabel=banEndLabel(m);
  const banHist=(m.banHistory||[]);
  document.getElementById('memberDetailTitle').textContent=`👤 ${m.nick} 상세`;
  document.getElementById('memberDetailBody').innerHTML=`
    <div style="background:var(--surface);border-radius:8px;padding:14px;margin-bottom:14px">
      <div style="display:flex;gap:14px;flex-wrap:wrap">
        <div><div style="font-size:10px;color:var(--gray-l)">닉네임</div><div style="font-weight:700;font-size:15px">${m.nick}</div></div>
        <div><div style="font-size:10px;color:var(--gray-l)">회원번호</div><div style="font-weight:700">${m.uid}</div></div>
        <div><div style="font-size:10px;color:var(--gray-l)">분류</div><div>${catObj.lbl||'-'}</div></div>
        <div><div style="font-size:10px;color:var(--gray-l)">차단 상태</div><div style="font-weight:700;color:${banLabel.startsWith('✅')?'var(--green)':'var(--red)'}">${banLabel||'없음'}</div></div>
        <div><div style="font-size:10px;color:var(--gray-l)">등록일</div><div style="font-size:11px">${(m.createdAt||'').slice(0,10)}</div></div>
      </div>
      ${m.memo?`<div style="margin-top:10px;font-size:12px;background:var(--white);padding:8px 12px;border-radius:6px;border:1px solid var(--border)">📝 ${m.memo}</div>`:''}
      ${m.report?`<div style="margin-top:8px;font-size:12px;background:#fff1f1;padding:8px 12px;border-radius:6px;border:1px solid #fca5a5;color:var(--red)">🚨 신고내용: ${m.report}</div>`:''}
    </div>
    <div style="font-weight:700;font-size:12px;color:var(--red);margin-bottom:8px">🚫 차단 이력 (${banHist.length}건)</div>
    ${banHist.length?`<div style="max-height:150px;overflow-y:auto;margin-bottom:14px">`+banHist.map(h=>`<div style="font-size:11px;padding:4px 8px;background:var(--surface);border-radius:4px;margin-bottom:3px;color:var(--gray-l)">${h.date} · ${h.type} · ${h.memo||''}</div>`).join('')+'</div>':`<div style="color:var(--gray-l);font-size:11px;margin-bottom:14px">없음</div>`}
    <div style="font-weight:700;font-size:12px;color:var(--blue);margin-bottom:8px">🔗 게시글 이력 (${(m.posts||[]).length}건)</div>
    ${(m.posts||[]).length?m.posts.map(p=>`<div style="margin-bottom:6px;padding:6px 10px;background:var(--surface);border-radius:6px;display:flex;align-items:center;gap:8px">
      <a href="${p.url}" target="_blank" onclick="event.stopPropagation()" style="color:var(--blue);font-size:12px;flex:1">🔗 글 이력 확인하기</a>
      ${p.note?`<span style="font-size:10px;color:var(--gray-l)">${p.note}</span>`:''}
      <span style="font-size:10px;color:var(--gray-l)">${(p.savedAt||'').slice(0,10)}</span>
    </div>`).join(''):'<div style="color:var(--gray-l);font-size:11px">없음</div>'}`;
  om('memberDetailModal');
}

/* ══════════════════════════════════════
   설정
══════════════════════════════════════ */
function rCfg(C,T){
  T.innerText='⚙️ 설정';
  let h=`<div class="ssec"><h4>🏛️ 대학 관리</h4>
    <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">👁️ 숨김 처리된 대학은 비로그인 상태에서 현황판에 표시되지 않습니다.</div>`;
  univCfg.forEach((u,i)=>{
    const isHidden = !!u.hidden;
    h+=`<div class="srow" style="background:${isHidden?'var(--surface)':'transparent'};border-radius:8px;padding:4px 6px;margin:-2px -6px">
      <div class="cdot" style="background:${u.color};opacity:${isHidden?0.4:1}"></div>
      <input type="text" value="${u.name}" style="flex:1;max-width:130px;opacity:${isHidden?0.5:1}" onblur="univCfg[${i}].name=this.value;save()">
      <input type="color" value="${u.color}" style="width:36px;height:30px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)" title="대학 색상" onchange="univCfg[${i}].color=this.value;this.previousElementSibling.previousElementSibling.style.background=this.value;save();if(typeof renderBoard==='function')renderBoard()">
      <button class="btn btn-xs" style="background:${isHidden?'#fef2f2':'#f0fdf4'};color:${isHidden?'#dc2626':'#16a34a'};border:1px solid ${isHidden?'#fca5a5':'#86efac'};min-width:58px"
        onclick="univCfg[${i}].hidden=!univCfg[${i}].hidden;save();reCfg();if(typeof renderBoard==='function')renderBoard()">
        ${isHidden?'👁️ 숨김':'✅ 표시'}</button>
      <button class="btn btn-r btn-xs" onclick="delUniv(${i})">삭제</button>
    </div>`;
  });
  h+=`<div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
    <input type="text" id="nu-n" placeholder="새 대학명" style="width:150px">
    <input type="color" id="nu-c" value="#2563eb" style="width:40px;height:34px;padding:2px;border-radius:5px;cursor:pointer;border:1px solid var(--border2)">
    <button class="btn btn-b" onclick="addUniv()">+ 대학 추가</button>
  </div></div>
  <div class="ssec"><h4>🗺️ 맵 관리</h4>`;
  maps.forEach((m,i)=>{
    h+=`<div class="srow">
      <span style="font-size:14px">📍</span>
      <input type="text" value="${m}" style="flex:1" onblur="maps[${i}]=this.value;save();refreshSel()">
      <button class="btn btn-r btn-xs" onclick="delMap(${i})">삭제</button>
    </div>`;
  });
  h+=`<div style="margin-top:12px;display:flex;gap:8px">
    <input type="text" id="nm" placeholder="새 맵 이름" style="width:200px">
    <button class="btn btn-b" onclick="addMap()">+ 맵 추가</button>
  </div></div>
  <div class="ssec"><h4>⚡ 맵 약자 관리 <span style="font-size:11px;font-weight:400;color:var(--gray-l)">붙여넣기 입력 시 자동 변환</span></h4>
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">
      약자를 입력하면 경기 결과 붙여넣기 시 자동으로 전체 맵 이름으로 변환됩니다.<br>
      <span style="color:var(--blue);font-weight:600">예:</span> <code style="background:var(--surface);padding:1px 6px;border-radius:4px">녹 → 녹아웃</code>, <code style="background:var(--surface);padding:1px 6px;border-radius:4px">폴 → 폴리포이드</code>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:12px">
      <div style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:8px">📦 기본 내장 약자</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">
        ${Object.entries(PASTE_MAP_ALIAS_DEFAULT).slice(0,30).map(([k,v])=>k!==v?`<span style="background:var(--white);border:1px solid var(--border);border-radius:6px;padding:2px 9px;font-size:11px;font-family:monospace"><b>${k}</b> → ${v}</span>`:'').filter(Boolean).join('')}
      </div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">🔧 사용자 정의 약자</div>
    <div id="alias-list" style="margin-bottom:10px"></div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="alias-key" placeholder="약자 (예: 녹)" style="width:100px" maxlength="10">
      <span style="color:var(--gray-l)">→</span>
      <select id="alias-val" style="width:180px;border:1px solid var(--border2);border-radius:7px;padding:5px 8px;font-size:13px">
        <option value="">맵 선택...</option>
        ${maps.map(m=>`<option value="${m}">${m}</option>`).join('')}
      </select>
      <button class="btn btn-b" onclick="addMapAlias()">+ 약자 추가</button>
    </div>
    <div id="alias-msg" style="font-size:12px;margin-top:6px;min-height:16px"></div>
  </div>
  <div class="ssec"><h4>🏷️ 선수 상태 아이콘 관리</h4>
    <div style="font-size:12px;color:var(--gray-l);margin-bottom:12px">이름 우측에 표시될 상태 아이콘을 선수별로 지정합니다. 현황판·순위표·이미지 저장 모두 반영됩니다.</div>
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:10px">🎭 사용 가능한 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${Object.entries(STATUS_ICON_DEFS).filter(([id])=>id!=='none').map(([id,d])=>`<span style="padding:4px 10px;border-radius:7px;background:var(--white);border:1px solid var(--border);font-size:14px" title="${d.label}">${d.emoji}</span>`).join('')}
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:8px">스트리머 정보 수정 또는 현황판 클릭 팝업에서 각 스트리머의 아이콘을 설정하세요.</div>
    </div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:8px">선수별 상태 아이콘 지정</div>
    <div style="max-height:320px;overflow-y:auto;border:1px solid var(--border);border-radius:8px">
      ${players.length===0?'<div style="padding:20px;text-align:center;color:var(--gray-l)">등록된 선수 없음</div>':
        [...players].sort((a,b)=>a.name.localeCompare(b.name,'ko')).map(p=>{
          const cur=playerStatusIcons[p.name]||'';
          const pN=p.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
          return `<div style="display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:1px solid var(--border)">
            ${getPlayerPhotoHTML(p.name,'32px')}
            <span style="font-weight:600;flex:1;min-width:0;font-size:13px">${p.name}<span style="font-size:10px;color:var(--gray-l);margin-left:4px">${p.univ||''}·${p.tier||''}</span></span>
            <span style="font-size:18px;min-width:24px;text-align:center">${cur}</span>
            <select onchange="setStatusIcon('${pN}',this.value);render()" style="font-size:12px;padding:3px 6px;border:1px solid var(--border2);border-radius:5px;max-width:110px">
              ${Object.entries(STATUS_ICON_DEFS).map(([id,d])=>`<option value="${id}"${(!cur&&id==='none')||(cur&&cur===d.emoji&&id!=='none')?' selected':''}>${d.emoji?d.emoji+' ':''}${d.label}</option>`).join('')}
            </select>
          </div>`;
        }).join('')
      }
    </div>
    <button class="btn btn-r btn-sm" style="margin-top:10px" onclick="if(confirm('모든 상태 아이콘을 초기화할까요?')){playerStatusIcons={};localStorage.setItem('su_psi','{}');render();}">전체 초기화</button>
  </div>
  <div class="ssec"><h4>🎭 티어 관리</h4>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      ${TIERS.map((t,i)=>`<div style="text-align:center;padding:8px 12px;background:var(--white);border:1px solid var(--border);border-radius:8px;display:flex;flex-direction:column;align-items:center;gap:4px">
        ${getTierBadge(t)}
        <div style="font-size:10px;color:var(--gray-l)">${i+1}순위</div>
        ${!['G','K','JA','J','S','0티어'].includes(t)?`<button class="btn btn-r btn-xs" onclick="delTier('${t}')">삭제</button>`:''}
      </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="text" id="nt-name" placeholder="티어 이름 (예: 9티어)" style="width:160px">
      <button class="btn btn-b" onclick="addTier()">+ 티어 추가</button>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin-top:6px">※ 기본 티어(G/K/JA/J/S/0티어)는 삭제할 수 없습니다.</div>
  </div>
  <div class="ssec"><h4>👤 관리자 계정 관리</h4>
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">관리자를 여러 명 등록할 수 있습니다. 기존 계정은 유지되고 새 계정이 추가됩니다.</p>
    <div style="margin-bottom:14px;padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:8px">현재 등록된 관리자 계정 수: <span id="adm-count">-</span>명</div>
      <div id="adm-list" style="font-size:11px;color:var(--gray-l)"></div>
      <button class="btn btn-r btn-xs" style="margin-top:8px" onclick="clearAllAdmins()">⚠️ 전체 계정 초기화 (기본값으로 리셋)</button>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
      <input type="text" id="adm-id" placeholder="새 관리자 아이디" style="width:180px" autocomplete="off">
      <input type="password" id="adm-pw" placeholder="새 비밀번호 (4자 이상)" style="width:180px" autocomplete="new-password">
      <button class="btn btn-p" onclick="addAdminAccount()">👤 관리자 추가</button>
    </div>
    <div id="adm-msg" style="font-size:12px;min-height:18px"></div>
  </div>
  <div class="ssec"><h4>🔗 GitHub 자동 반영 설정</h4>
    <p style="font-size:12px;color:var(--gray-l);margin-bottom:12px">
      데이터 저장 시 GitHub <code style="background:var(--surface);padding:1px 5px;border-radius:4px">data.json</code>에 자동으로 반영됩니다.<br>
      Personal Access Token(Fine-grained) 발급: <a href="https://github.com/settings/tokens" target="_blank" style="color:var(--blue)">github.com/settings/tokens</a><br>
      <span style="color:#d97706;font-weight:600">권한: Repository contents → Read and write</span>
    </p>
    <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:700;color:var(--blue);margin-bottom:6px">현재 저장된 토큰</div>
      <div id="gh-token-status" style="font-size:12px;font-family:monospace;color:var(--gray-l)">—</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">
      <input type="password" id="cfg-gh-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" style="width:280px;font-family:monospace" autocomplete="off">
      <button class="btn btn-b" onclick="saveGhToken()">💾 토큰 저장</button>
      <button class="btn btn-r btn-xs" onclick="clearGhToken()">🗑️ 삭제</button>
    </div>
    <div id="gh-token-msg" style="font-size:12px;min-height:18px"></div>
  </div>`;
  // 관리자 수 표시 + 맵 약자 목록 렌더링
  setTimeout(()=>{
    const el=document.getElementById('adm-count');
    const listEl=document.getElementById('adm-list');
    if(el){const h=getAdminHashes();el.textContent=h.length;}
    if(listEl){listEl.textContent='※ 보안상 계정 목록은 표시되지 않습니다.';}
    // GitHub 토큰 상태 표시
    const ghStat=document.getElementById('gh-token-status');
    if(ghStat){
      const tok=localStorage.getItem('su_gh_token')||'';
      ghStat.textContent=tok?`${tok.slice(0,6)}${'*'.repeat(Math.max(0,tok.length-9))}${tok.slice(-3)} (${tok.length}자)`:'설정되지 않음';
      ghStat.style.color=tok?'var(--blue)':'var(--gray-l)';
    }
  },50);
  C.innerHTML=h;
  // alias-list는 C.innerHTML 세팅 후 렌더링
  setTimeout(_refreshAliasList, 10);
}
function saveGhToken(){
  const inp=document.getElementById('cfg-gh-token');
  const msg=document.getElementById('gh-token-msg');
  const val=(inp?.value||'').trim();
  if(!val){if(msg)msg.textContent='토큰을 입력하세요.';return;}
  if(!val.startsWith('ghp_')&&!val.startsWith('github_pat_')){if(msg){msg.textContent='⚠️ 유효하지 않은 토큰 형식입니다.';msg.style.color='#d97706';}return;}
  localStorage.setItem('su_gh_token',val);
  if(inp)inp.value='';
  if(msg){msg.textContent='✅ 토큰이 저장되었습니다.';msg.style.color='#16a34a';}
  const ghStat=document.getElementById('gh-token-status');
  if(ghStat){ghStat.textContent=`${val.slice(0,6)}${'*'.repeat(Math.max(0,val.length-9))}${val.slice(-3)} (${val.length}자)`;ghStat.style.color='var(--blue)';}
}
function clearGhToken(){
  if(!confirm('GitHub 토큰을 삭제할까요?'))return;
  localStorage.removeItem('su_gh_token');
  const msg=document.getElementById('gh-token-msg');
  const ghStat=document.getElementById('gh-token-status');
  if(msg){msg.textContent='토큰이 삭제되었습니다.';msg.style.color='var(--gray-l)';}
  if(ghStat){ghStat.textContent='설정되지 않음';ghStat.style.color='var(--gray-l)';}
}
function reCfg(){
  const tabs=document.querySelectorAll('.stab');
  let C=null,T=document.createElement('span');
  tabs.forEach(t=>{if(t.classList.contains('active')){const sid=t.dataset.tab||t.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];C=document.getElementById('s-'+sid)||null;T=t;}});
  if(!C) C=document.querySelector('.scontent');
  if(C) rCfg(C,T);
}
// 현황판에서 대학 숨기기 토글 (관리자 전용)
function toggleBoardHide(univName){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn) return;
  u.hidden=!u.hidden;
  save();
  render();
}
function changeBoardUnivColor(univName, newColor){
  const u=univCfg.find(x=>x.name===univName);
  if(!u||!isLoggedIn) return;
  u.color=newColor;
  save();
  render();
}

/* ══════════════════════════════════════
   선수 CRUD
══════════════════════════════════════ */
function addPlayer(){
  const n=document.getElementById('p-name').value.trim();
  if(!n)return alert('이름을 입력하세요.');
  if(players.find(p=>p.name===n))return alert('이미 존재합니다.');
  const _pRole=(document.getElementById('p-role')?.value||'').trim();
  players.push({name:n,univ:document.getElementById('p-univ').value,tier:document.getElementById('p-tier').value,race:document.getElementById('p-race').value,gender:document.getElementById('p-gender').value,role:_pRole||undefined,win:0,loss:0,points:0,history:[]});
  document.getElementById('p-name').value='';save();render();
}
function recMatch(){
  const wN=document.getElementById('ws').value.trim();const lN=document.getElementById('ls').value.trim();
  const w=players.find(p=>p.name===wN);const l=players.find(p=>p.name===lN);
  if(!w||!l||w===l)return alert('선수를 올바르게 선택하세요.');
  const m=document.getElementById('m-map').value;const d=document.getElementById('m-date').value;
  applyGameResult(wN,lN,d,m,genId());
  document.getElementById('ws').value='';document.getElementById('ls').value='';save();render();
}
function openEP(name){
  editName=name;const p=players.find(x=>x.name===name);
  document.getElementById('emBody').innerHTML=`
    <label>스트리머 이름</label><input type="text" id="ed-n" value="${p.name}">
    <label>티어</label><select id="ed-t">${TIERS.map(t=>`<option value="${t}"${p.tier===t?' selected':''}>${getTierLabel(t)}</option>`).join('')}</select>
    <label>대학</label><select id="ed-u">${getAllUnivs().map(u=>`<option value="${u.name}"${p.univ===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
    <label>종족</label><select id="ed-r"><option value="T"${p.race==='T'?' selected':''}>테란</option><option value="Z"${p.race==='Z'?' selected':''}>저그</option><option value="P"${p.race==='P'?' selected':''}>프로토스</option></select>
    <label>성별</label><select id="ed-g"><option value="F"${(p.gender||'F')==='F'?' selected':''}>👩 여자</option><option value="M"${p.gender==='M'?' selected':''}>👨 남자</option></select>
    <label>직책 <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(이사장/총장/부총장/총괄/교수/코치는 정렬 우선순위 적용)</span></label>
    <input type="text" id="ed-role" value="${p.role||''}" placeholder="예: 이사장, 총장, 부총장, 총괄, 교수, 코치, 학생회장, 오락부장 등" style="width:100%">
    <label>🖼 프로필 사진 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(현황판 카드에 표시 · 비워두면 기본 아이콘)</span></label>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="ed-photo" value="${p.photo||''}" placeholder="https://... 이미지 URL 입력" style="flex:1" oninput="const v=this.value.trim();const img=document.getElementById('ed-photo-preview');if(v){img.src=v;img.style.display='block';}else{img.style.display='none';}">
      <img id="ed-photo-preview" src="${p.photo||''}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid var(--border);flex-shrink:0;${p.photo?'':' display:none'}" onerror="this.style.display='none'">
    </div>
    <div style="font-size:10px;color:var(--gray-l);margin-top:-6px">이미지 URL을 붙여넣으면 현황판 선수 카드에 프로필 사진이 표시됩니다.</div>
    <label>🏠 방송국 홈 URL <span style="font-size:10px;font-weight:400;color:var(--gray-l)">(홈 아이콘 클릭 시 이동)</span></label>
    <div style="display:flex;gap:8px;align-items:center">
      <input type="text" id="ed-channel" value="${p.channelUrl||''}" placeholder="https://chzzk.naver.com/... 또는 https://twitch.tv/..." style="flex:1">
      ${p.channelUrl?`<a href="${p.channelUrl}" target="_blank" style="font-size:18px;text-decoration:none" title="방송국 바로가기">🏠</a>`:''}
    </div>
    <div style="font-size:10px;color:var(--gray-l);margin-top:-6px">치지직/트위치/유튜브 등 방송국 주소. 스트리머 상세에서 홈 아이콘으로 이동됩니다.</div>
    <div style="margin-top:14px;padding:14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:#15803d;margin-bottom:10px">🎭 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px" id="ed-icon-btns">
        ${(()=>{const cur=getStatusIcon(p.name);return Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const isSelected=(id==='none'&&!cur)||(d.emoji&&cur===d.emoji);return `<button type="button" onclick="setStatusIconFromModal(this,'${p.name}','${id}')" data-icon-id="${id}" title="${d.label}" style="padding:5px 10px;border-radius:7px;border:2px solid ${isSelected?'#16a34a':'var(--border)'};background:${isSelected?'#dcfce7':'var(--white)'};cursor:pointer;font-size:15px;min-width:38px;transition:.12s;font-family:'Noto Sans KR',sans-serif;">${d.emoji||'<span style="font-size:11px;font-weight:700">없음</span>'}</button>`}).join('')})()}
      </div>
      <div id="ed-icon-label" style="font-size:11px;color:var(--gray-l);margin-top:7px">선택: ${(()=>{const c=getStatusIcon(p.name);const found=Object.entries(STATUS_ICON_DEFS).find(([,d])=>d.emoji&&d.emoji===c);return found?found[1].label:'없음';})()}</div>
    </div>
    <div style="margin-top:16px;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:var(--blue);margin-bottom:12px">📊 승패 직접 조정</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px">
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">승 (현재: ${p.win})</div>
          <input type="number" id="ed-win" value="${p.win}" min="0" style="width:100%">
        </div>
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">패 (현재: ${p.loss})</div>
          <input type="number" id="ed-loss" value="${p.loss}" min="0" style="width:100%">
        </div>
        <div style="flex:1;min-width:100px">
          <div style="font-size:11px;font-weight:700;color:var(--gray-l);margin-bottom:4px">포인트 (현재: ${p.points})</div>
          <input type="number" id="ed-pts" value="${p.points}" style="width:100%">
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-o btn-sm" onclick="
          if(confirm('승패와 히스토리를 모두 초기화하시겠습니까?')){
            const p=players.find(x=>x.name===editName);
            p.win=0;p.loss=0;p.points=0;p.history=[];
            document.getElementById('ed-win').value=0;
            document.getElementById('ed-loss').value=0;
            document.getElementById('ed-pts').value=0;
            save();render();
          }
        ">🔄 승패 전체 초기화</button>
        <button class="btn btn-w btn-sm" onclick="
          const p=players.find(x=>x.name===editName);
          p.win=parseInt(document.getElementById('ed-win').value)||0;
          p.loss=parseInt(document.getElementById('ed-loss').value)||0;
          p.points=parseInt(document.getElementById('ed-pts').value)||0;
          save();render();
          document.getElementById('emBody').querySelector('.apply-ok').style.display='inline-block';
          setTimeout(()=>document.getElementById('emBody').querySelector('.apply-ok').style.display='none',1500);
        " style="border-color:var(--green);color:var(--green)">✅ 승패 적용</button>
        <span class="apply-ok" style="display:none;color:var(--green);font-weight:700;font-size:12px;align-self:center">적용됨!</span>
      </div>
      <div style="font-size:10px;color:var(--gray-l);margin-top:8px">※ 승패 초기화 시 개인 경기 기록(히스토리)도 함께 삭제됩니다. 대전 기록(미니/대학대전 등)은 유지됩니다.</div>
    </div>
    <div style="margin-top:14px;padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;">
      <div style="font-weight:700;font-size:12px;color:#b45309;margin-bottom:8px">📝 선수 메모</div>
      <textarea id="ed-memo" style="width:100%;min-height:70px;font-size:12px;border:1px solid #fde68a;border-radius:6px;padding:8px;background:#fff;resize:vertical;font-family:'Noto Sans KR',sans-serif;line-height:1.6;box-sizing:border-box;" placeholder="선수에 대한 메모를 입력하세요...">${p.memo||''}</textarea>
    </div>`;
  om('emModal');
}
// 스트리머 상세 모달 → 수정창 열기
// emModal(z-index:5000) > playerModal(z-index:4000) 이므로 playerModal을 닫지 않고
// 그 위에 emModal을 열기만 함 → cm/om 순서 경쟁조건 완전 제거
function openEPFromModal(nameArg){
  const name=nameArg||window._playerModalCurrentName;
  if(!name){alert('선수 이름을 확인할 수 없습니다.');return;}
  const p=players.find(x=>x.name===name);
  if(!p){alert('선수 정보를 찾을 수 없습니다: '+name);return;}
  try{
    openEP(name);
  }catch(e){
    console.error('[openEP] 오류:',e);
    alert('수정창 열기 실패: '+e.message);
  }
}
function savePlayer(){
  const p=players.find(x=>x.name===editName);
  const newName=document.getElementById('ed-n').value.trim();
  const oldName=editName;

  // 이름 변경 시 모든 기록 자동 갱신
  if(newName && newName !== oldName){
    // 히스토리 내 상대방 이름 갱신
    players.forEach(other=>{
      (other.history||[]).forEach(h=>{
        if(h.opp===oldName) h.opp=newName;
      });
    });
    // 히스토리 내 본인 이름은 p.name 변경으로 자동 처리
    // 미니대전/대학대전/대회/CK/프로 경기 내 선수명 갱신
    const renameInMatches=(arr)=>{
      arr.forEach(m=>{
        (m.sets||[]).forEach(set=>{
          (set.games||[]).forEach(g=>{
            if(g.playerA===oldName) g.playerA=newName;
            if(g.playerB===oldName) g.playerB=newName;
            // g.winner는 'A'/'B' 값이므로 이름 비교 불필요
          });
        });
        (m.teamAMembers||[]).forEach(mb=>{if(mb.name===oldName)mb.name=newName;});
        (m.teamBMembers||[]).forEach(mb=>{if(mb.name===oldName)mb.name=newName;});
      });
    };
    renameInMatches(miniM);
    renameInMatches(univM);
    renameInMatches(comps);
    renameInMatches(ckM);
    renameInMatches(proM);
    // 조편성 대회
    tourneys.forEach(tn=>{
      tn.groups.forEach(grp=>{
        (grp.matches||[]).forEach(m=>{
          (m.sets||[]).forEach(set=>{
            (set.games||[]).forEach(g=>{
              if(g.playerA===oldName) g.playerA=newName;
              if(g.playerB===oldName) g.playerB=newName;
            });
          });
        });
      });
    });
  }

  p.name=newName||oldName;
  p.tier=document.getElementById('ed-t').value;
  p.univ=document.getElementById('ed-u').value;
  p.race=document.getElementById('ed-r').value;
  p.gender=document.getElementById('ed-g').value;
  const _rv=(document.getElementById('ed-role')?.value||'').trim();
  p.role=_rv||undefined;
  const _photo=(document.getElementById('ed-photo')?.value||'').trim();
  p.photo=_photo||undefined;
  p.win=parseInt(document.getElementById('ed-win').value)||0;
  p.loss=parseInt(document.getElementById('ed-loss').value)||0;
  p.points=parseInt(document.getElementById('ed-pts').value)||0;
  const _memo=(document.getElementById('ed-memo')?.value||'').trim();
  p.memo=_memo||undefined;
  const _channel=(document.getElementById('ed-channel')?.value||'').trim();
  p.channelUrl=_channel||undefined;
  save();render();cm('emModal');
  // playerModal이 열려있으면 저장된 내용으로 갱신 후 다시 표시
  if(typeof openPlayerModal==='function'){
    setTimeout(()=>openPlayerModal(p.name),30);
  }
}
function setAllFemale(){
  if(!confirm(`모든 스트리머 ${players.length}명을 여자로 일괄 변경하시겠습니까?\n이후 남자 선수는 개별 수정으로 변경하세요.`))return;
  players.forEach(p=>p.gender='F');
  save();render();
  alert(`완료! 총 ${players.length}명이 여자로 변경되었습니다.`);
}

function delPlayer(){
  if(confirm(`"${editName}" 선수를 삭제할까요?`)){const idx=players.findIndex(p=>p.name===editName);if(idx>=0)players.splice(idx,1);save();render();cm('emModal');cm('playerModal');}
}

function openRE(mode,idx){
  reMode=mode;reIdx=idx;const allU=getAllUnivs();
  let body='',tit='';
  if(mode==='mini'){
    const m=miniM[idx];tit='⚡ 미니대전 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d}">
      <label>팀 A 대학</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${m.a===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>팀 A 세트 승</label><input type="number" id="re-sa" value="${m.sa}">
      <label>팀 B 대학</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${m.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>팀 B 세트 승</label><input type="number" id="re-sb" value="${m.sb}">`;
  } else if(mode==='univm'){
    const m=univM[idx];tit='🏟️ 대학대전 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d}">
      <label>팀 A</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${m.a===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>A 세트 승</label><input type="number" id="re-sa" value="${m.sa}">
      <label>팀 B</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${m.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>B 세트 승</label><input type="number" id="re-sb" value="${m.sb}">`;
  } else if(mode==='comp'){
    const c=comps[idx];tit='🎖️ 대회 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${c.d}">
      <label>대회명</label><input type="text" id="re-cn" value="${c.n}">
      <label>대학 A</label><select id="re-a">${allU.map(u=>`<option value="${u.name}"${(c.a||c.u)===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>A 세트 승</label><input type="number" id="re-sa" value="${c.sa||0}">
      <label>대학 B</label><select id="re-b">${allU.map(u=>`<option value="${u.name}"${c.b===u.name?' selected':''}>${u.name}</option>`).join('')}</select>
      <label>B 세트 승</label><input type="number" id="re-sb" value="${c.sb||0}">`;
  } else if(mode==='pro'){
    const m=proM[idx];tit='🏅 프로리그 수정';
    const mA=m.teamAMembers||[];const mB=m.teamBMembers||[];
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>A팀 레이블</label><input type="text" id="re-tla" value="${m.teamALabel||''}">
      <label>A팀 세트 승</label><input type="number" id="re-sa" value="${m.sa||0}">
      <label>B팀 레이블</label><input type="text" id="re-tlb" value="${m.teamBLabel||''}">
      <label>B팀 세트 승</label><input type="number" id="re-sb" value="${m.sb||0}">
      <div style="margin-top:10px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  } else if(mode==='tt'){
    const m=ttM[idx];tit='🎯 티어대회 수정';
    body=`<label>날짜</label><input type="date" id="re-d" value="${m.d||''}">
      <label>대회명/메모</label><input type="text" id="re-ttn" value="${m.n||m.t||''}">
      <label>A팀 세트 승</label><input type="number" id="re-sa" value="${m.sa||0}">
      <label>B팀 세트 승</label><input type="number" id="re-sb" value="${m.sb||0}">
      <div style="margin-top:10px;font-size:11px;color:var(--gray-l)">※ 세트별 개인 경기는 기록 상세보기에서 수정하세요.</div>`;
  }
  document.getElementById('reTitle').innerText=tit;
  document.getElementById('reBody').innerHTML=body;om('reModal');
}
function saveRow(){
  const d=document.getElementById('re-d')?.value||'';
  if(reMode==='mini'){
    miniM[reIdx].d=d;
    miniM[reIdx].a=document.getElementById('re-a')?.value||miniM[reIdx].a;
    miniM[reIdx].b=document.getElementById('re-b')?.value||miniM[reIdx].b;
    miniM[reIdx].sa=parseInt(document.getElementById('re-sa').value)||0;
    miniM[reIdx].sb=parseInt(document.getElementById('re-sb').value)||0;
  } else if(reMode==='univm'){
    const m=univM[reIdx];m.d=d;m.a=document.getElementById('re-a').value;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.b=document.getElementById('re-b').value;m.sb=parseInt(document.getElementById('re-sb').value)||0;
  } else if(reMode==='comp'){
    const c=comps[reIdx];c.d=d;c.n=document.getElementById('re-cn').value;
    c.a=document.getElementById('re-a').value;c.u=c.a;c.hostUniv=c.a;
    c.sa=parseInt(document.getElementById('re-sa').value)||0;
    c.b=document.getElementById('re-b').value;c.sb=parseInt(document.getElementById('re-sb').value)||0;
  } else if(reMode==='pro'){
    const m=proM[reIdx];m.d=d;
    m.teamALabel=document.getElementById('re-tla')?.value||m.teamALabel;
    m.teamBLabel=document.getElementById('re-tlb')?.value||m.teamBLabel;
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
  } else if(reMode==='tt'){
    const m=ttM[reIdx];m.d=d;
    const ttn=document.getElementById('re-ttn')?.value;
    if(ttn!==undefined){m.n=ttn;m.t=ttn;}
    m.sa=parseInt(document.getElementById('re-sa').value)||0;
    m.sb=parseInt(document.getElementById('re-sb').value)||0;
  }
  save();render();cm('reModal');
}

function addUniv(){const n=document.getElementById('nu-n').value.trim();const c=document.getElementById('nu-c').value;if(!n)return;univCfg.push({name:n,color:c});save();render();refreshSel();}
function delUniv(i){if(confirm(`"${univCfg[i].name}" 삭제?`)){univCfg.splice(i,1);save();render();refreshSel();}}
function addMap(){const n=document.getElementById('nm').value.trim();if(!n)return;maps.push(n);save();render();refreshSel();}
function delMap(i){maps.splice(i,1);save();render();refreshSel();}

function _refreshAliasList(){
  const listEl = document.getElementById('alias-list');
  if(!listEl) return;
  const entries = Object.entries(userMapAlias);
  if(entries.length === 0){
    listEl.innerHTML = '<div style="font-size:12px;color:var(--gray-l);padding:8px 0">아직 추가된 약자가 없습니다.</div>';
    return;
  }
  listEl.innerHTML = entries.map(([k,v])=>`
    <div class="srow">
      <code style="background:var(--blue-ll);color:var(--blue);border-radius:5px;padding:2px 10px;font-size:13px;font-weight:700;min-width:50px;text-align:center">${k}</code>
      <span style="color:var(--gray-l)">→</span>
      <span style="font-weight:600;font-size:13px">${v}</span>
      <button class="btn btn-r btn-xs" data-ak="${encodeURIComponent(k)}" onclick="delMapAlias(decodeURIComponent(this.getAttribute('data-ak')))">삭제</button>
    </div>`).join('');
}

function addMapAlias(){
  const key = (document.getElementById('alias-key')?.value || '').trim();
  const val = (document.getElementById('alias-val')?.value || '').trim();
  const msg = document.getElementById('alias-msg');
  if(!key){ if(msg){msg.style.color='var(--red)';msg.textContent='약자를 입력하세요.';} return; }
  if(!val){ if(msg){msg.style.color='var(--red)';msg.textContent='맵을 선택하세요.';} return; }
  if(key===val){ if(msg){msg.style.color='var(--red)';msg.textContent='약자와 맵 이름이 같습니다.';} return; }
  if(PASTE_MAP_ALIAS_DEFAULT[key] && PASTE_MAP_ALIAS_DEFAULT[key]!==val){
    if(!confirm(`'${key}'는 기본 내장 약자(${PASTE_MAP_ALIAS_DEFAULT[key]})입니다.\n'${val}'으로 덮어쓸까요?`)) return;
  }
  userMapAlias[key]=val;
  save();
  if(msg){msg.style.color='var(--green)';msg.textContent=`✅ '${key}' → '${val}' 추가됨`;}
  document.getElementById('alias-key').value='';
  document.getElementById('alias-val').value='';
  _refreshAliasList(); // render() 대신 목록만 부분 업데이트
}

function delMapAlias(key){
  delete userMapAlias[key];
  save();
  _refreshAliasList();
}

function addTier(){
  const n=document.getElementById('nt-name').value.trim();
  if(!n)return alert('티어 이름을 입력하세요.');
  if(TIERS.includes(n))return alert('이미 존재하는 티어입니다.');
  TIERS.push(n);
  // TIERS는 const이므로 push 가능
  save();render();
  document.getElementById('p-tier').innerHTML=TIERS.map(t=>`<option value="${t}">${getTierLabel(t)}</option>`).join('');
}
function delTier(t){
  const protectedTiers=['G','K','JA','J','S','0티어'];
  if(protectedTiers.includes(t))return alert('기본 티어는 삭제할 수 없습니다.');
  if(!confirm(`"${t}" 티어를 삭제하시겠습니까?\n해당 티어의 선수는 기본 티어로 변경되지 않습니다.`))return;
  const idx=TIERS.indexOf(t);
  if(idx>=0)TIERS.splice(idx,1);
  save();render();
  document.getElementById('p-tier').innerHTML=TIERS.map(t2=>`<option value="${t2}">${getTierLabel(t2)}</option>`).join('');
}

async function addAdminAccount(){
  const id=document.getElementById('adm-id').value.trim();
  const pw=document.getElementById('adm-pw').value;
  const msg=document.getElementById('adm-msg');
  if(!id||!pw){msg.style.color='var(--red)';msg.textContent='아이디와 비밀번호를 모두 입력하세요.';return;}
  if(pw.length<4){msg.style.color='var(--red)';msg.textContent='비밀번호는 4자 이상이어야 합니다.';return;}
  const h=await sha256(id+':'+pw);
  const hashes=getAdminHashes();
  if(hashes.includes(h)){msg.style.color='var(--gold)';msg.textContent='이미 동일한 계정이 등록되어 있습니다.';return;}
  hashes.push(h);
  localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(hashes));
  msg.style.color='var(--green)';
  msg.textContent=`✅ 관리자 계정이 추가되었습니다. (아이디: ${id}) 현재 총 ${hashes.length}명`;
  document.getElementById('adm-id').value='';
  document.getElementById('adm-pw').value='';
  // 카운트 갱신
  const el=document.getElementById('adm-count');
  if(el)el.textContent=hashes.length;
}

async function clearAllAdmins(){
  if(!confirm('모든 관리자 계정을 초기화하고 기본 계정(admin99)으로 리셋하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'))return;
  const h=await sha256('admin99:99admin');
  localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify([h]));
  alert('초기화 완료. 기본 계정(admin99 / 99admin)으로 로그인하세요.');
  doLogout();
}

/* ══════════════════════════════════════
   📊 통계 탭
══════════════════════════════════════ */
let statsSub='overview';
