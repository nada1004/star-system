/* ══════════════════════════════════════
   TAB & RENDER
══════════════════════════════════════ */
function sw(t,el){
  // 탭 변경 시 서브탭 초기화
  if(t==='comp') { compSub='league'; leagueFilterDate=''; leagueFilterGrp=''; grpRankFilter=''; }
  if(t==='mini') miniSub='records';
  if(t==='ind') indSub='records';
  if(t==='gj') gjSub='records';
  if(t==='univck') ckSub='records';
  if(t==='univm') univmSub='records';
  if(t==='pro') proSub='records';
  if(t==='hist') histSub='mini'; // 대전 기록 탭으로 돌아올 때 초기화
  // 탭 전환 시 해당 탭 검색어 초기화
  if(window._recQ){const tabModeMap={mini:'mini',univck:'ck',univm:'univm',comp:'comp',pro:'pro',ind:'ind'};const m=tabModeMap[t];if(m)window._recQ[m]='';}
  if(t==='total')totalSearch='';
  curTab=t;openDetails={};
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  const _fs=document.getElementById('fstrip');if(_fs)_fs.style.display=(t==='total'&&isLoggedIn)?'block':'none';
  // 이전 내용 제거 후 렌더링
  const C=document.getElementById('rcont');
  if(C) C.innerHTML='';
  render();
}
function render(){
  const C=document.getElementById('rcont');
  const T=document.getElementById('rtitle');
  if(!C||!T)return;
  const farea=document.getElementById('farea');if(farea)farea.innerHTML='';
  // 탭 버튼 UI 동기화
  document.querySelectorAll('.tab').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    const active=oc.includes("'"+curTab+"'");
    b.classList.toggle('on',active);
  });
  // 이전 내용 제거
  C.innerHTML='';
  // 날짜 필터 변경 시 캐시 초기화
  window._compListCache={};
  window._histTourneyCache={};
  // 탭별 렌더 함수 직접 호출 (object literal 일괄 평가 에러 방지)
  switch(curTab){
    case 'total':   if(typeof rTotal==='function')   rTotal(C,T);   break;
    case 'tier':    if(typeof rTier==='function')    rTier(C,T);    break;
    case 'hist':    if(typeof rHist==='function')    rHist(C,T);    break;
    case 'mini':    if(typeof rMini==='function')    rMini(C,T);    break;
    case 'ind':     rMergedInd(C,T);   break;
    case 'gj':      rMergedInd(C,T);   break;
    case 'univck':  rMergedUnivM(C,T); break;
    case 'univm':   rMergedUnivM(C,T); break;
    case 'tiertour':rMergedComp(C,T);  break;
    case 'comp':    rMergedComp(C,T);  break;
    case 'pro':     if(typeof rPro==='function')     rPro(C,T);     break;
    case 'member':  if(typeof rMember==='function')  rMember(C,T);  break;
    case 'cfg':     if(typeof rCfg==='function')     rCfg(C,T);     break;
    case 'stats':   if(typeof rStats==='function')   rStats(C,T);   break;
    case 'cal':     if(typeof rCal==='function')     rCal(C,T);     break;
    case 'vote':    if(typeof rVote==='function')    rVote(C,T);    break;
    case 'board':   if(typeof rBoard==='function')   rBoard(C,T);   break;
    case 'board2':  if(typeof rBoard2==='function')  rBoard2(C,T);  break;
    default: break;
  }
  // 렌더링 후 빈 rec-summary 제거 (내용 없는 빈 줄 방지)
  // 즉시 1차 inject (PC 포함 즉시 적용)
  injectUnivIcons(C);
  requestAnimationFrame(()=>{
    C.querySelectorAll('.rec-summary').forEach(el=>{
      const header=el.querySelector('.rec-sum-header');
      if(!header||header.innerText.trim()==='')el.remove();
    });
    injectUnivIcons(C);
    // 경기 검색창 포커스 복원
    const _restoreFocus=()=>{
      // 검색 중인 특정 input으로 포커스
      if(window._searchFocusId){
        const el=document.getElementById(window._searchFocusId);
        if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);return;}
      }
      if(window._recQ){
        Object.keys(window._recQ).forEach(mode=>{
          if(!window._recQ[mode]) return;
          const el=document.getElementById('rq-'+mode);
          if(el&&document.activeElement!==el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}
        });
      }
      // 스트리머 탭 검색창 포커스 복원
      const tsi=document.getElementById('total-search');
      if(tsi&&typeof totalSearch!=='undefined'&&totalSearch&&document.activeElement!==tsi){tsi.focus();tsi.setSelectionRange(tsi.value.length,tsi.value.length);}
    };
    _restoreFocus();
    // 모바일: 첫 rAF 후 한 프레임 더 (포커스 복원만, 아이콘은 앞에서 완료)
    requestAnimationFrame(()=>{_restoreFocus();});
  });
}

/* ══════════════════════════════════════
   선수 이름 클릭 → 모달
   대학 클릭 → 모달
══════════════════════════════════════ */
function openPlayerModal(name){
  const p=players.find(x=>x.name===name);
  if(!p)return;
  // REQ4: 다른 선수로 변경 시 페이지 초기화
  if(window._playerModalCurrentName!==name) playerHistPage=0;
  document.getElementById('playerModalTitle').innerText=`👤 ${name} 스트리머 상세`;
  document.getElementById('playerModalBody').innerHTML=buildPlayerDetailHTML(p);
  injectUnivIcons(document.getElementById('playerModalBody'));
  // 어드민 전용 수정 버튼 (이름을 data 속성에 직접 저장 → openEP 호출 시 신뢰성 향상)
  const editBtn=document.getElementById('playerModalEditBtn');
  if(editBtn){
    editBtn.style.display=isLoggedIn?'inline-flex':'none';
    editBtn.dataset.playerName=name;
  }
  // 현재 모달에 표시 중인 선수명 저장
  window._playerModalCurrentName=name;
  om('playerModal');
}

// openEPFromModal은 openEP와 같은 파일(tier-tour.js)에 정의됨

/* ── 선수 최근 경기 수정 (관리자 전용) ── */
function deletePlayerHist(playerName, histIdx){
  if(!isLoggedIn)return;
  if(!confirm('이 경기 기록을 삭제할까요?\n\n⚠️ ELO와 승패 기록이 차감됩니다.'))return;
  const p=players.find(x=>x.name===playerName);
  if(!p||!p.history||!p.history[histIdx])return;
  const hh=p.history[histIdx];
  // ELO 차감
  if(hh.eloDelta!=null) p.elo=(p.elo||ELO_DEFAULT)-hh.eloDelta;
  // 승/패 카운트 차감
  if(hh.result==='승'){ p.win=Math.max(0,(p.win||0)-1); }
  else { p.loss=Math.max(0,(p.loss||0)-1); }
  // 상대 기록도 차감
  const opp=players.find(x=>x.name===hh.opp);
  if(opp){
    const oppHist=opp.history||[];
    const oppIdx=oppHist.findIndex(o=>o.opp===playerName&&o.date===hh.date&&o.map===hh.map);
    if(oppIdx>=0){
      const oh=oppHist[oppIdx];
      if(oh.eloDelta!=null) opp.elo=(opp.elo||ELO_DEFAULT)-oh.eloDelta;
      if(oh.result==='승'){ opp.win=Math.max(0,(opp.win||0)-1); }
      else { opp.loss=Math.max(0,(opp.loss||0)-1); }
      oppHist.splice(oppIdx,1);
    }
  }
  p.history.splice(histIdx,1);
  // univM 세트 게임에서도 해당 경기 제거 → 순위 재계산 반영
  if(hh.matchId){
    const um=univM.find(m=>m._id===hh.matchId);
    if(um&&um.sets){
      um.sets.forEach(s=>{
        if(!s.games)return;
        const gi=s.games.findIndex(g=>(g.playerA===playerName||g.playerB===playerName)&&(g.playerA===hh.opp||g.playerB===hh.opp));
        if(gi>=0){
          s.games.splice(gi,1);
          s.scoreA=s.games.filter(g=>g.winner==='A').length;
          s.scoreB=s.games.filter(g=>g.winner==='B').length;
          s.winner=s.scoreA>s.scoreB?'A':s.scoreB>s.scoreA?'B':'';
        }
      });
      um.sets=um.sets.filter(s=>s.games&&s.games.length>0);
      um.sa=um.sets.filter(s=>s.winner==='A').length;
      um.sb=um.sets.filter(s=>s.winner==='B').length;
    }
  }
  if(typeof fixPoints==='function')fixPoints();
  save();
  document.getElementById('playerModalBody').innerHTML=buildPlayerDetailHTML(p);
  injectUnivIcons(document.getElementById('playerModalBody'));
}

function openPlayerHistEdit(playerName, histIdx){
  if(!isLoggedIn)return;
  const p=players.find(x=>x.name===playerName);
  if(!p||!p.history||!p.history[histIdx])return;
  const hh=p.history[histIdx];
  const races=['T','Z','P'];
  const mapOpts=maps.map(m=>`<option value="${m}"${hh.map===m?' selected':''}>${m}</option>`).join('');
  document.getElementById('reTitle').textContent=`✏️ 경기 수정 — ${playerName} vs ${hh.opp}`;
  document.getElementById('reBody').innerHTML=`
    <div style="display:flex;flex-direction:column;gap:8px">
      <div><label>날짜</label><input id="phe-date" type="date" value="${hh.date||''}" style="width:100%"></div>
      <div><label>결과</label>
        <select id="phe-result" style="width:100%">
          <option value="승"${hh.result==='승'?' selected':''}>승</option>
          <option value="패"${hh.result==='패'?' selected':''}>패</option>
        </select>
      </div>
      <div><label>상대 이름</label><input id="phe-opp" type="text" value="${hh.opp||''}" style="width:100%"></div>
      <div><label>상대 종족</label>
        <select id="phe-race" style="width:100%">
          ${races.map(r=>`<option value="${r}"${hh.oppRace===r?' selected':''}>${r}</option>`).join('')}
        </select>
      </div>
      <div><label>맵</label>
        <select id="phe-map" style="width:100%">
          <option value="">-</option>${mapOpts}
        </select>
      </div>
    </div>`;
  // 저장 버튼 임시 교체
  const saveBtnOrig=document.querySelector('#reModal .btn-b');
  if(saveBtnOrig){
    saveBtnOrig.onclick=function(){
      hh.date=document.getElementById('phe-date').value;
      hh.result=document.getElementById('phe-result').value;
      hh.opp=document.getElementById('phe-opp').value;
      hh.oppRace=document.getElementById('phe-race').value;
      hh.map=document.getElementById('phe-map').value;
      // 포인트 재계산은 복잡하므로 스킵, 날짜/맵/상대 정도만 수정
      save();
      cm('reModal');
      // 모달 업데이트
      const pb=document.getElementById('playerModalBody');
      if(pb&&window._playerModalCurrentName===playerName){
        pb.innerHTML=buildPlayerDetailHTML(p);
        injectUnivIcons(pb);
      }
    };
  }
  om('reModal');
}

// 현황판 대학 공유카드 바로 열기
function openBoardUnivShareCard(univName){
  if(!univName||univName==='전체')return;
  _shareMode='univ';
  _shareUnivSearch=univName;
  openShareCardModal();
  setTimeout(()=>renderShareCardByUniv(univName),80);
}

function openShareCardFromPlayer(){
  const name=window._playerModalCurrentName;
  if(!name)return;
  cm('playerModal');
  _shareMode='player';
  _sharePlayerSearch=name;
  openShareCardModal();
  setTimeout(()=>renderShareCardByPlayer(name),80);
}

function openShareCardFromUniv(){
  const name=window._univModalCurrentName;
  if(!name)return;
  cm('univModal');
  _shareMode='univ';
  _shareUnivSearch=name;
  openShareCardModal();
  setTimeout(()=>renderShareCardByUniv(name),80);
}
function openShareCardFromMatch(mode,idx){
  const arr=mode==='mini'?miniM:mode==='univm'?univM:mode==='ck'?ckM:mode==='comp'?comps:mode==='pro'?proM:mode==='tt'?ttM:miniM;
  const m=arr[idx]||null;
  const isCKorPro=(mode==='ck'||mode==='pro'||mode==='tt');
  window._shareMatchObj=m?{...m,_noUnivIcon:isCKorPro,_matchType:isCKorPro?mode:''}:null;
  _shareMode='match';
  openShareCardModal();
  setTimeout(()=>{
    if(window._shareMatchObj)renderShareCardByMatchObj(window._shareMatchObj);
  },80);
}

// ── 이미지 저장 로딩 토스트 ──────────────────────────────────────
function _showSaveLoading(){
  let t=document.getElementById('_save-toast');
  if(!t){
    t=document.createElement('div');
    t.id='_save-toast';
    t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,.88);color:#fff;padding:10px 22px;border-radius:24px;font-size:13px;font-weight:700;z-index:99999;display:none;align-items:center;gap:8px;backdrop-filter:blur(6px);font-family:"Noto Sans KR",sans-serif;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.3)';
    document.body.appendChild(t);
  }
  t.innerHTML='<span style="display:inline-block;animation:_spin .8s linear infinite">⏳</span> 저장 중...';
  t.style.display='flex';
  if(!document.getElementById('_spin-style')){
    const s=document.createElement('style');s.id='_spin-style';
    s.textContent='@keyframes _spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }
}
function _hideSaveLoading(){
  const t=document.getElementById('_save-toast');
  if(t) t.style.display='none';
}

async function capturePlayerModal(){
  const body=document.getElementById('playerModalBody');
  if(!body){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    await _imgToDataUrls(body);
    const canvas=await html2canvas(body,{backgroundColor:'#ffffff',scale:2,useCORS:false,allowTaint:false});
    await _saveCanvasImage(canvas,`${window._playerModalCurrentName||'player'}_stat.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

async function captureUnivModal(){
  const body=document.getElementById('univModalBody');
  const title=document.getElementById('univModalTitle');
  if(!body){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    await _imgToDataUrls(body);
    const canvas=await html2canvas(body,{backgroundColor:'#ffffff',scale:2,useCORS:false,allowTaint:false});
    await _saveCanvasImage(canvas,`${title?title.innerText.replace('🏛️ ',''):'univ'}_대학정보.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

async function captureDetail(id, filename){
  const el=document.getElementById(id);
  if(!el){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
    await _imgToDataUrls(el);
    const canvas=await html2canvas(el,{backgroundColor:'#ffffff',scale:2,useCORS:false,allowTaint:false});
    await _saveCanvasImage(canvas,`경기상세_${filename}.png`,'png');
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

function openUnivModal(univName){
  if(!univName)return;
  document.getElementById('univModalTitle').innerText=`${univName} 대학 상세`;
  document.getElementById('univModalBody').innerHTML=buildUnivDetailHTML(univName);
  injectUnivIcons(document.getElementById('univModalBody'));
  window._univModalCurrentName=univName;
  om('univModal');
}

function buildPlayerDetailHTML(p){
  const col=gc(p.univ);
  const opps={},rv={T:{w:0,l:0},Z:{w:0,l:0},P:{w:0,l:0},N:{w:0,l:0}};
  (p.history||[]).forEach(h=>{
    if(!opps[h.opp])opps[h.opp]={w:0,l:0,race:h.oppRace};
    if(h.result==='승'){opps[h.opp].w++;if(rv[h.oppRace])rv[h.oppRace].w++;}
    else{opps[h.opp].l++;if(rv[h.oppRace])rv[h.oppRace].l++;}
  });
  const tot=p.win+p.loss;const wr=tot?Math.round(p.win/tot*100):0;
  const eloVal=p.elo||ELO_DEFAULT;
  const eloColor=eloVal>=1400?'#7c3aed':eloVal>=1300?'#d97706':eloVal>=1200?'#16a34a':'#dc2626';

  // ── 상단 프로필 패널 ──
  let h=`<div style="background:linear-gradient(135deg,${col} 0%,${col}dd 60%,${col}bb 100%);border-radius:18px;padding:22px 24px;margin-bottom:16px;position:relative;overflow:hidden;box-shadow:0 8px 28px ${col}44">
    <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.1);pointer-events:none"></div>
    <div style="position:absolute;bottom:-50px;left:10px;width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.06);pointer-events:none"></div>
    <div style="position:absolute;top:0;right:0;width:200px;height:100%;background:linear-gradient(to left,rgba(255,255,255,.06),transparent);pointer-events:none"></div>
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;flex-wrap:wrap;position:relative">
      <div style="width:90px;height:90px;border-radius:18px;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;flex-shrink:0;border:2.5px solid rgba(255,255,255,.45);overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.2)">${(()=>{if(p.photo)return`<img src="${p.photo}" style="width:90px;height:90px;object-fit:cover" onerror="this.style.display='none'">`;const url=UNIV_ICONS[p.univ]||(univCfg.find(x=>x.name===p.univ)||{}).icon||'';return url?`<img src="${url}" style="width:44px;height:44px;object-fit:contain" onerror="this.outerHTML='<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'white\\' width=\\'34\\' height=\\'34\\'><path d=\\'M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z\\'/></svg>'">`:`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white' width='34' height='34'><path d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z'/></svg>`;})()}</div>
      <div style="flex:1;min-width:0;position:relative">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px">
          <span style="font-size:22px;font-weight:900;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.15)">${p.name}${genderIcon(p.gender)}</span>${p.role?`<span style="display:block;margin-top:3px">${getRoleBadgeHTML(p.role,'11px')}</span>`:''}
          <span style="background:rgba(255,255,255,.22);border:1.5px solid rgba(255,255,255,.4);border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;color:#fff;letter-spacing:.3px">${getTierLabel(p.tier)||p.tier}</span>
        </div>
        <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap">
          <span class="ubadge clickable-univ" data-icon-done="1" style="background:rgba(255,255,255,.22);color:#fff;border:1.5px solid rgba(255,255,255,.4);font-size:11px;padding:3px 11px;display:inline-flex;align-items:center;gap:4px;border-radius:6px" onclick="cm('playerModal');setTimeout(()=>openUnivModal('${p.univ}'),100)">${gUI(p.univ,'12px')}${p.univ}</span>
          <span style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;color:#fff">${p.race} ${RNAME[p.race]||''}</span>
          ${p.channelUrl?`<a href="${p.channelUrl}" target="_blank" title="방송국 바로가기" style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:rgba(255,255,255,.22);border:1.5px solid rgba(255,255,255,.4);text-decoration:none;font-size:16px;color:#fff;transition:.15s;flex-shrink:0" onmouseover="this.style.background='rgba(255,255,255,.35)'" onmouseout="this.style.background='rgba(255,255,255,.22)'">🏠</a>`:''}
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;position:relative">
      <div style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.22);border-radius:12px;padding:10px 8px;text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.7);font-weight:600;margin-bottom:4px;letter-spacing:.3px">전적</div>
        <div style="font-weight:900;font-size:13px;color:#fff"><span style="color:#86efac">${p.win}W</span> <span style="color:#fca5a5">${p.loss}L</span></div>
      </div>
      <div style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.22);border-radius:12px;padding:10px 8px;text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.7);font-weight:600;margin-bottom:4px;letter-spacing:.3px">승률</div>
        <div style="font-weight:900;font-size:16px;color:${wr>=50?'#86efac':'#fca5a5'}">${tot?wr+'%':'-'}</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.22);border-radius:12px;padding:10px 8px;text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.7);font-weight:600;margin-bottom:4px;letter-spacing:.3px">포인트</div>
        <div style="font-weight:900;font-size:16px;color:${p.points>=0?'#86efac':'#fca5a5'}">${pS(p.points)}</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.22);border-radius:12px;padding:10px 8px;text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.75);font-weight:600;margin-bottom:4px;letter-spacing:.3px">ELO</div>
        <div style="font-weight:900;font-size:16px;color:#fff">${eloVal}</div>
        ${(()=>{
          // ELO 스파크라인: history에서 eloDelta로 추이 계산
          const deltas=(p.history||[]).filter(h=>h.eloDelta!=null).slice(-12);
          if(deltas.length<2) return '';
          let cur=eloVal;
          const points=[];
          [...deltas].reverse().forEach(h=>{cur-=h.eloDelta;});
          let val=cur;
          const elos=[val];
          deltas.forEach(h=>{val+=h.eloDelta;elos.push(val);});
          const min=Math.min(...elos),max=Math.max(...elos);
          const range=max-min||1;
          const W=68,H=22;
          const coords=elos.map((e,i)=>`${Math.round(i/(elos.length-1)*W)},${Math.round(H-((e-min)/range)*H)}`);
          const last=elos[elos.length-1],prev=elos[elos.length-2];
          const lineColor=last>=prev?'#86efac':'#fca5a5';
          return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;margin:4px auto 0;overflow:visible"><polyline points="${coords.join(' ')}" fill="none" stroke="${lineColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        })()}
      </div>
    </div>
  </div>`;

  // ── 종족별 승률 ──
  h+=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">`;
  RACES.forEach(r=>{
    const s=rv[r];const t=s.w+s.l;const w=t?Math.round(s.w/t*100):0;
    const raceColors={T:'#3b82f6',Z:'#7c3aed',P:'#d97706',N:'#6b7280'};
    const rc=raceColors[r]||'#6b7280';
    h+=`<div class="rscard" style="border-color:${rc}55;background:${rc}12;flex:1;min-width:80px">
      <div style="margin-bottom:6px"><span class="rbadge r${r}" style="font-size:11px">${r} ${RNAME[r]||''}</span></div>
      <div style="font-weight:900;font-size:22px;color:${t?(w>=50?rc:'#94a3b8'):'#d1d5db'}">${t?w+'%':'-'}</div>
      <div style="font-size:10px;margin-top:4px"><span style="color:#16a34a;font-weight:700">${s.w}W</span> <span style="color:#dc2626;font-weight:700">${s.l}L</span></div>
    </div>`;
  });
  h+=`</div>`;

  // ── 모드별 전적 ──
  const _modeColors={'미니대전':'#7c3aed','대학대전':'#2563eb','대학CK':'#dc2626','끝장전':'#8b5cf6','개인전':'#0891b2','티어대회':'#f59e0b','대회':'#d97706','프로리그':'#16a34a'};
  const _histModeStats={};
  (p.history||[]).forEach(hh=>{if(hh.mode){if(!_histModeStats[hh.mode])_histModeStats[hh.mode]={w:0,l:0};if(hh.result==='승')_histModeStats[hh.mode].w++;else _histModeStats[hh.mode].l++;}});
  // 대회: 조별리그+토너먼트+대회 통합
  const _compW=(_histModeStats['대회']?.w||0)+(_histModeStats['조별리그']?.w||0)+(_histModeStats['토너먼트']?.w||0);
  const _compL=(_histModeStats['대회']?.l||0)+(_histModeStats['조별리그']?.l||0)+(_histModeStats['토너먼트']?.l||0);
  // 끝장전: gjM에서 직접 집계
  const _gjW=(gjM||[]).filter(g=>g.wName===p.name).length;
  const _gjL=(gjM||[]).filter(g=>g.lName===p.name).length;
  const _fixedModes=[
    {key:'미니대전',w:_histModeStats['미니대전']?.w||0,l:_histModeStats['미니대전']?.l||0},
    {key:'대학대전',w:_histModeStats['대학대전']?.w||0,l:_histModeStats['대학대전']?.l||0},
    {key:'대학CK',w:_histModeStats['대학CK']?.w||0,l:_histModeStats['대학CK']?.l||0},
    {key:'끝장전',w:_gjW,l:_gjL},
    {key:'개인전',w:_histModeStats['개인전']?.w||0,l:_histModeStats['개인전']?.l||0},
    {key:'티어대회',w:_histModeStats['티어대회']?.w||0,l:_histModeStats['티어대회']?.l||0},
    {key:'대회',w:_compW,l:_compL},
    {key:'프로리그',w:_histModeStats['프로리그']?.w||0,l:_histModeStats['프로리그']?.l||0},
  ];
  h+=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:14px">`;
  _fixedModes.forEach(({key,w,l})=>{
    const t=w+l;const wr=t?Math.round(w/t*100):0;
    const mc=_modeColors[key]||'#6b7280';
    h+=`<div style="background:var(--surface);border:1.5px solid ${mc}33;border-radius:10px;padding:8px 6px;text-align:center">
      <div style="font-size:10px;color:${mc};font-weight:700;margin-bottom:4px">${key}</div>
      <div style="font-size:11px"><span class="wt">${w}승</span> <span class="lt">${l}패</span></div>
      <div style="font-size:12px;font-weight:800;color:${t?(wr>=50?'#16a34a':'#dc2626'):'var(--gray-l)'}">${t?wr+'%':'-'}</div>
    </div>`;
  });
  h+=`</div>`;

  // ── 상대 전적 ──
  const oppList=Object.entries(opps).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l));
  if(oppList.length){
    h+=`<div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:10px;display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:3px;height:14px;background:var(--blue);border-radius:2px"></span>상대 전적 (${oppList.length}명)</div>
    <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px">`;
    oppList.forEach(([opp,s])=>{
      const ot=s.w+s.l;const ow=ot?Math.round(s.w/ot*100):0;
      const oc=gc((players.find(x=>x.name===opp)||{}).univ||'');
      const oppUniv=(players.find(x=>x.name===opp)||{}).univ||'';
      h+=`<div class="ocard" onclick="cm('playerModal');setTimeout(()=>openPlayerModal('${opp}'),100)" style="border-color:${oc}44;background:${oc}08">
        <div style="width:28px;height:28px;border-radius:8px;background:${oc};margin:0 auto 5px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff;box-shadow:0 2px 6px ${oc}55">${opp[0]}</div>
        <div style="font-weight:800;font-size:11px;color:var(--text);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60px">${opp}</div>
        <div style="font-size:9px;color:var(--gray-l);margin-bottom:3px">${oppUniv}</div>
        <div style="font-size:10px;margin-bottom:2px"><span class="rbadge r${s.race}" style="font-size:9px;padding:1px 5px">${s.race}</span></div>
        <div style="font-size:10px"><span style="color:#16a34a;font-weight:700">${s.w}W</span> <span style="color:#dc2626;font-weight:700">${s.l}L</span></div>
        <div style="font-weight:800;font-size:12px;margin-top:2px;color:${ow>=50?'#16a34a':'#dc2626'}">${ow}%</div>
      </div>`;
    });
    h+=`</div>`;
  }

  // ── 최근 기록 ──
  if((p.history||[]).length){
    // 경기 타입 필터
    if(!window._playerHistFilter) window._playerHistFilter='전체';
    const allModes=[...new Set((p.history||[]).map(h=>h.mode||'').filter(Boolean))];
    const filterBar=allModes.length>1?`<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">
      <button onclick="window._playerHistFilter='전체';playerHistPage=0;document.getElementById('playerModalBody').innerHTML=buildPlayerDetailHTML(players.find(x=>x.name==='${p.name.replace(/'/g,"\\'")}'));injectUnivIcons(document.getElementById('playerModalBody'))" style="padding:2px 8px;border-radius:10px;border:1px solid ${window._playerHistFilter==='전체'?'var(--blue)':'var(--border2)'};background:${window._playerHistFilter==='전체'?'var(--blue)':'var(--white)'};color:${window._playerHistFilter==='전체'?'#fff':'var(--text3)'};font-size:10px;font-weight:700;cursor:pointer">전체</button>
      ${allModes.map(m=>`<button onclick="window._playerHistFilter='${m}';playerHistPage=0;document.getElementById('playerModalBody').innerHTML=buildPlayerDetailHTML(players.find(x=>x.name==='${p.name.replace(/'/g,"\\'")}'));injectUnivIcons(document.getElementById('playerModalBody'))" style="padding:2px 8px;border-radius:10px;border:1px solid ${window._playerHistFilter===m?'var(--blue)':'var(--border2)'};background:${window._playerHistFilter===m?'var(--blue)':'var(--white)'};color:${window._playerHistFilter===m?'#fff':'var(--text3)'};font-size:10px;font-weight:700;cursor:pointer">${m}</button>`).join('')}
    </div>`:'';
    const filteredHist=window._playerHistFilter&&window._playerHistFilter!=='전체'
      ?(p.history||[]).filter(hh=>hh.mode===window._playerHistFilter)
      :(p.history||[]);
    const totalGames=filteredHist.length;
    const pageSize=20;
    const totalPages=Math.ceil(totalGames/pageSize)||1;
    const curPage=Math.max(0,Math.min(playerHistPage,totalPages-1));
    // 날짜 최신순 정렬 (원본 인덱스 보존)
    const sortedHist=[...filteredHist.map((h,i)=>({...h,_origIdx:p.history.indexOf(h)}))]
      .sort((a,b)=>(b.date||'').localeCompare(a.date||'')||(b.time||0)-(a.time||0));
    const displayHist=sortedHist.slice(curPage*pageSize,(curPage+1)*pageSize);
    const fromN=curPage*pageSize+1, toN=Math.min((curPage+1)*pageSize,totalGames);
    h+=`<div style="font-weight:700;font-size:12px;color:var(--text2);margin-bottom:6px;display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:3px;height:14px;background:var(--blue);border-radius:2px"></span>최근 경기 기록 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(총 ${totalGames}게임 · ${fromN}–${toN}번째 표시)</span></div>`;
    h+=filterBar;
    h+=`<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:16px">`;
    h+=`<table style="margin:0;border:none;border-radius:0"><thead><tr><th>날짜</th><th>종류</th><th>결과</th><th>상대</th><th>종족</th><th>맵</th><th>ELO</th>${isLoggedIn?'<th class="no-export" style="width:48px">관리</th>':''}</tr></thead><tbody>`;
    displayHist.forEach((hh)=>{
      const hi=hh._origIdx;
      const isWin=hh.result==='승';
      const eloStr=hh.eloDelta!=null?`<span style="font-weight:700;font-size:11px;color:${hh.eloDelta>0?'#16a34a':'#dc2626'}">${hh.eloDelta>0?'+':''}${hh.eloDelta}</span>`:'-';
      const oppP=players.find(x=>x.name===hh.opp);const oppCol=oppP?gc(oppP.univ):'#6b7280';
      const editBtnHTML=isLoggedIn?`<td class="no-export" style="text-align:center;white-space:nowrap">
        <button class="btn btn-w btn-xs" onclick="openPlayerHistEdit('${p.name}',${hi})" title="경기 수정" style="padding:2px 6px;font-size:10px;border-color:var(--border2)">✏️</button>
        <button class="btn btn-r btn-xs" onclick="deletePlayerHist('${p.name}',${hi})" title="경기 삭제" style="padding:2px 6px;font-size:10px;margin-left:2px">🗑</button>
      </td>`:'';
      const modeLbl=hh.mode||'';
      const modeBadgeColors={'조별리그':'#2563eb','토너먼트':'#16a34a','미니대전':'#7c3aed','시빌워':'#db2777','대학대전':'#7c3aed','대학CK':'#dc2626','프로리그':'#0891b2','티어대회':'#f59e0b','끝장전':'#8b5cf6','개인전':'#8b5cf6','테스트':'#6b7280'};
      const modeColor=modeBadgeColors[modeLbl]||'#6b7280';
      const modeCellHTML=modeLbl?`<span style="background:${modeColor};color:#fff;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700">${modeLbl}</span>`:'';
      h+=`<tr style="background:${isWin?'#f0fdf4':'#fef2f2'}10">
        <td style="color:var(--gray-l);font-size:11px">${hh.date}</td>
        <td>${modeCellHTML}</td>
        <td>${isWin?`<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:800;padding:2px 8px;border-radius:20px">WIN</span>`:`<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:800;padding:2px 8px;border-radius:20px">LOSE</span>`}</td>
        <td style="cursor:pointer;font-weight:700" onclick="cm('playerModal');setTimeout(()=>openPlayerModal('${hh.opp}'),100)"><span style="display:inline-flex;align-items:center;gap:4px"><span style="width:16px;height:16px;border-radius:4px;background:${oppCol};display:inline-block;flex-shrink:0"></span><span style="color:var(--blue)">${hh.opp}</span></span></td>
        <td><span class="rbadge r${hh.oppRace}" style="font-size:10px">${hh.oppRace}</span></td>
        <td style="color:var(--gray-l);font-size:11px">${hh.map && hh.map !== '-' ? hh.map : ''}</td>
        <td>${eloStr}</td>
        ${editBtnHTML}
      </tr>`;
    });
    h+=`</tbody></table>`;
    if(totalPages>1){
      h+=`<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 12px;background:var(--surface);border-top:1px solid var(--border)">
        <button class="btn btn-w btn-xs" ${curPage===0?'disabled':''} onclick="playerHistPage=${curPage-1};document.getElementById('playerModalBody').innerHTML=buildPlayerDetailHTML(players.find(x=>x.name==='${p.name}'));injectUnivIcons(document.getElementById('playerModalBody'))">◀ 이전</button>
        <span style="font-size:12px;color:var(--gray-l)">${curPage+1} / ${totalPages} 페이지</span>
        <button class="btn btn-w btn-xs" ${curPage>=totalPages-1?'disabled':''} onclick="playerHistPage=${curPage+1};document.getElementById('playerModalBody').innerHTML=buildPlayerDetailHTML(players.find(x=>x.name==='${p.name}'));injectUnivIcons(document.getElementById('playerModalBody'))">다음 ▶</button>
      </div>`;
    }
    h+=`</div>`;
  }

  // ── 선수 메모 (관리자만) ──
  if(isLoggedIn){
    h+=`<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 16px">
      <div style="font-weight:700;font-size:12px;color:#d97706;margin-bottom:8px">📝 선수 메모</div>
      ${p.memo?`<div style="font-size:12px;color:var(--text2);margin-bottom:10px;line-height:1.7;white-space:pre-wrap">${p.memo}</div>`:'<div style="font-size:12px;color:var(--gray-l);margin-bottom:10px">메모 없음</div>'}
      <textarea id="player-memo-input" style="width:100%;min-height:60px;font-size:12px;border:1px solid #fde68a;border-radius:8px;padding:8px 10px;resize:vertical;font-family:'Noto Sans KR',sans-serif;background:var(--surface)" placeholder="선수 메모...">${p.memo||''}</textarea>
      <div style="display:flex;gap:6px;margin-top:8px">
        <button class="btn btn-b btn-sm" onclick="savePlayerMemo('${p.name}')">💾 저장</button>
        ${p.memo?`<button class="btn btn-r btn-sm" onclick="savePlayerMemo('${p.name}',true)">🗑️ 삭제</button>`:''}
      </div>
    </div>`;
  }
  return h;
}

function buildUnivDetailHTML(univName){
  const col=gc(univName);
  const members=getMembers(univName);
  const oppStats={};
  function addOpp(myU,oppU,myWin){
    if(myU!==univName)return;
    if(oppU===univName)return;
    if(!oppStats[oppU])oppStats[oppU]={w:0,l:0};
    if(myWin)oppStats[oppU].w++;else oppStats[oppU].l++;
  }
  miniM.forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  univM.forEach(m=>{addOpp(m.a,m.b,m.sa>m.sb);addOpp(m.b,m.a,m.sb>m.sa);});
  comps.forEach(m=>{const a=m.a||m.u||'';addOpp(a,m.b,m.sa>m.sb);addOpp(m.b,a,m.sb>m.sa);});

  const tot=members.reduce((s,p)=>s+p.win+p.loss,0);
  const wins=members.reduce((s,p)=>s+p.win,0);
  const pts=members.reduce((s,p)=>s+p.points,0);
  const wr=tot?Math.round(wins/tot*100):0;

  // ── 상단 대학 헤더 카드 ──
  let h=`<div style="background:linear-gradient(135deg,${col},${col}cc);border-radius:16px;padding:20px 24px;margin-bottom:18px;color:#fff;position:relative;overflow:hidden">
    <div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.08);pointer-events:none"></div>
    <div style="position:absolute;bottom:-30px;right:40px;width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,.05);pointer-events:none"></div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
      <div style="width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:28px;border:2px solid rgba(255,255,255,.35);flex-shrink:0">
        ${gUI(univName,'32px')}
      </div>
      <div>
        <div style="font-size:20px;font-weight:900;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.2)">
          ${univName}
          ${(()=>{const _u=univCfg.find(u=>u.name===univName);return _u?.dissolved?`<span style="font-size:12px;font-weight:700;background:rgba(0,0,0,.3);color:#fca5a5;border-radius:6px;padding:2px 8px;margin-left:6px;vertical-align:middle">🏚️ 해체${_u.dissolvedDate?' '+_u.dissolvedDate:''}</span>`:'';})()}
        </div>
        <div style="font-size:12px;color:rgba(255,255,255,.75);margin-top:2px">소속 선수 ${members.length}명</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px 8px;text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.75);margin-bottom:3px">개인 전적</div>
        <div style="font-weight:900;font-size:13px;color:#fff">${wins}승 ${tot-wins}패</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px 8px;text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.75);margin-bottom:3px">개인 승률</div>
        <div style="font-weight:900;font-size:14px;color:${wr>=50?'#bbf7d0':'#fca5a5'}">${tot?wr+'%':'-'}</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px 8px;text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.75);margin-bottom:3px">총 포인트</div>
        <div style="font-weight:900;font-size:13px;color:${pts>0?'#fef08a':pts<0?'#fca5a5':'#fff'}">${pts>0?'+':''}${pts}</div>
      </div>
      <div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px 8px;text-align:center;backdrop-filter:blur(4px)">
        <div style="font-size:10px;color:rgba(255,255,255,.75);margin-bottom:3px">선수 수</div>
        <div style="font-weight:900;font-size:14px;color:#fff">${members.length}명</div>
      </div>
    </div>
  </div>`;

  // ── 소속 선수 ──
  if(members.length){
    const sorted=[...members].sort((a,b)=>getRoleOrder(a.role)-getRoleOrder(b.role)||TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||b.points-a.points);
    const displayList=sorted; // 전체 선수 표시 (남자 포함, 경기 이력 없어도)
    h+=`<div style="font-weight:700;font-size:12px;color:${col};margin-bottom:10px;display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:3px;height:14px;background:${col};border-radius:2px"></span>소속 선수 (${displayList.length}명)
    </div>`;
    h+=`<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:18px"><table style="margin:0;border:none;border-radius:0;table-layout:auto"><thead><tr><th style="text-align:center;width:1px;white-space:nowrap;padding:7px 6px">직책</th><th style="text-align:center">티어</th><th style="text-align:center;width:50px">종족</th><th style="text-align:left;padding-left:10px">이름</th><th style="text-align:center;width:40px">성별</th><th style="text-align:center;width:40px">승</th><th style="text-align:center;width:40px">패</th><th style="text-align:center;width:52px">승률</th><th style="text-align:center;width:60px">포인트</th></tr></thead><tbody>`;
    displayList.forEach(p=>{
      const tw=p.win+p.loss;const twr=tw?Math.round(p.win/tw*100):0;
      h+=`<tr style="cursor:pointer" onclick="cm('univModal');setTimeout(()=>openPlayerModal('${p.name}'),100)" onmouseover="this.style.background=gcHex8('${p.univ}',.12)" onmouseout="this.style.background=gcHex8('${p.univ}',.06)"
          style="border-left:3px solid ${col};background:${gcHex8(p.univ,.06)}">\r\n        <td style="text-align:center;padding:5px 4px;white-space:nowrap">${p.role?getRoleBadgeHTML(p.role,'10px'):''}</td>
        <td style="text-align:center">${getTierBadge(p.tier)}</td>
        <td style="text-align:center"><span class="rbadge r${p.race}">${p.race}</span></td>
        <td style="text-align:left;padding-left:10px;font-weight:600"><span style="display:inline-flex;align-items:center;gap:6px">${getPlayerPhotoHTML(p.name,'32px')}<span class="clickable-name">${p.name}</span>${getStatusIconHTML(p.name)}</span></td>
        <td style="text-align:center">${genderIcon(p.gender)}</td>
        <td style="text-align:center" class="wt">${p.win}</td>
        <td style="text-align:center" class="lt">${p.loss}</td>
        <td style="text-align:center;font-weight:700;color:${twr>=50?'#16a34a':'#dc2626'}">${tw?twr+'%':'-'}</td>
        <td style="text-align:center" class="${pC(p.points)}">${pS(p.points)}</td>
      </tr>`;
    });
    h+=`</tbody></table></div>`;
  }

  // ── 상대 대학 전적 ──
  const oppList=Object.entries(oppStats).filter(([,s])=>s.w+s.l>0).sort((a,b)=>(b[1].w+b[1].l)-(a[1].w+a[1].l));
  if(oppList.length){
    h+=`<div style="font-weight:700;font-size:12px;color:#7c3aed;margin-bottom:10px;display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:3px;height:14px;background:#7c3aed;border-radius:2px"></span>상대 대학 전적
    </div>`;
    h+=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">`;
    oppList.forEach(([opp,s])=>{
      const ot=s.w+s.l;const ow=ot?Math.round(s.w/ot*100):0;
      const oc=gc(opp);
      h+=`<div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:10px 14px;text-align:center;cursor:pointer;min-width:90px;box-shadow:0 1px 4px rgba(0,0,0,.04)"
        onclick="cm('univModal');setTimeout(()=>openUnivModal('${opp}'),100)">
        <span class="ubadge" data-icon-done="1" style="background:${oc};font-size:11px;margin-bottom:6px;display:inline-flex;align-items:center;gap:3px">${gUI(opp,'11px')}${opp}</span>
        <div style="font-size:11px;margin-top:4px"><span class="wt">${s.w}</span>승 <span class="lt">${s.l}</span>패</div>
        <div style="font-weight:700;font-size:11px;color:${ow>=50?'#16a34a':'#dc2626'}">${ow}%</div>
      </div>`;
    });
    h+=`</div>`;
  }

  // ── 최근 대전 기록 ──
  const myMatches=[
    ...miniM.filter(m=>m.a===univName||m.b===univName).map(m=>({...m,mode:'미니대전'})),
    ...univM.filter(m=>m.a===univName||m.b===univName).map(m=>({...m,mode:'대학대전'})),
  ].sort((a,b)=>(b.d||'').localeCompare(a.d||''));
  if(myMatches.length){
    h+=`<div style="font-weight:700;font-size:12px;color:#d97706;margin-bottom:10px;display:flex;align-items:center;gap:6px">
      <span style="display:inline-block;width:3px;height:14px;background:#d97706;border-radius:2px"></span>최근 대전 기록
    </div>`;
    h+=`<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden">`;
    h+=`<table style="margin:0;border:none;border-radius:0"><thead><tr><th>날짜</th><th>종류</th><th>상대</th><th>결과</th></tr></thead><tbody>`;
    myMatches.slice(0,10).forEach(m=>{
      const isA=m.a===univName;
      const opp=isA?m.b:m.a;
      const myS=isA?m.sa:m.sb;const oppS=isA?m.sb:m.sa;
      const win=myS>oppS;const oc=gc(opp);
      const modeBg=m.mode==='미니대전'?'#2563eb':'#7c3aed';
      h+=`<tr>
        <td style="color:var(--gray-l);font-size:11px">${m.d||''}</td>
        <td><span style="background:${modeBg};color:#fff;padding:1px 8px;border-radius:4px;font-size:10px;font-weight:700">${m.mode}</span></td>
        <td><span class="ubadge clickable-univ" style="background:${oc};font-size:10px;padding:1px 7px" onclick="cm('univModal');setTimeout(()=>openUnivModal('${opp}'),100)">${opp}</span></td>
        <td>${win?`<span class="wt" style="font-weight:800">${myS}:${oppS} 승</span>`:`<span class="lt" style="font-weight:800">${myS}:${oppS} 패</span>`}</td>
      </tr>`;
    });
    h+=`</tbody></table></div>`;
  }
  return h;
}

/* ══════════════════════════════════════
   통합 탭 렌더 함수
══════════════════════════════════════ */
let _mergedIndSub  = 'ind';   // 개인전 서브탭: 'ind' | 'gj'
let _mergedUnivSub = 'mini';  // 대학대전 서브탭: 'mini' | 'univm'
let _mergedCompSub = 'comp';  // 대회 서브탭: 'comp' | 'tiertour'

function _mergedSubBar(tabs, curSub, setFn) {
  return `<div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap">
    ${tabs.map(t=>`<button onclick="${setFn}('${t.id}');render()"
      style="padding:5px 16px;border-radius:20px;border:2px solid ${curSub===t.id?'var(--blue)':'var(--border2)'};background:${curSub===t.id?'var(--blue)':'var(--white)'};color:${curSub===t.id?'#fff':'var(--text3)'};font-weight:700;font-size:12px;cursor:pointer">${t.lbl}</button>`).join('')}
  </div>`;
}

function rMergedInd(C, T) {
  // curTab이 'gj'로 진입 시 서브탭 자동 전환
  if(curTab==='gj') _mergedIndSub='gj';
  else if(curTab==='ind') _mergedIndSub='ind';
  const bar = _mergedSubBar(
    [{id:'ind',lbl:'🎮 개인전'},{id:'gj',lbl:'⚔️ 끝장전'}],
    _mergedIndSub, '_mergedIndSub'
  );
  const sub = document.createElement('div');
  if(_mergedIndSub==='ind') { if(typeof rInd==='function') rInd(sub,T); }
  else                       { if(typeof rGJ==='function')  rGJ(sub,T);  }
  C.innerHTML = bar;
  C.appendChild(sub);
}

function rMergedUnivM(C, T) {
  if(curTab==='mini') _mergedUnivSub='mini';
  else if(curTab==='univck') _mergedUnivSub='univck';
  const bar = _mergedSubBar(
    [{id:'mini',lbl:'⚡ 미니대전'},{id:'univm',lbl:'🏟️ 대학대전'},{id:'univck',lbl:'🤝 대학CK'}],
    _mergedUnivSub, '_mergedUnivSub'
  );
  const sub = document.createElement('div');
  if(_mergedUnivSub==='mini')        { if(typeof rMini==='function')  rMini(sub,T); }
  else if(_mergedUnivSub==='univck') { if(typeof rCK==='function')    rCK(sub,T);   }
  else                                { if(typeof rUnivM==='function') rUnivM(sub,T); }
  C.innerHTML = bar;
  C.appendChild(sub);
}

function rMergedComp(C, T) {
  if(curTab==='tiertour') _mergedCompSub='tiertour';
  else if(curTab==='comp') _mergedCompSub='comp';
  const bar = _mergedSubBar(
    [{id:'comp',lbl:'🎖️ 대회'},{id:'tiertour',lbl:'🎯 티어대회'}],
    _mergedCompSub, '_mergedCompSub'
  );
  const sub = document.createElement('div');
  if(_mergedCompSub==='comp') { if(typeof rComp==='function')        rComp(sub,T); }
  else                         { if(typeof rTierTourTab==='function') rTierTourTab(sub,T); }
  C.innerHTML = bar;
  C.appendChild(sub);
}
