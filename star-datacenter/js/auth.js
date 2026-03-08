/* ══════════════════════════════════════
   로그인 시스템
══════════════════════════════════════ */
// SHA-256 암호화
async function sha256(str){
  const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
const ADMIN_HASH_KEY='su_admin_hashes'; // 배열로 저장 (다중 관리자)
async function initLoginHash(){
  if(!localStorage.getItem(ADMIN_HASH_KEY)){
    const h=await sha256('admin99:99admin');
    // 기존 단일키도 마이그레이션
    const oldH=localStorage.getItem('su_admin_hash');
    const arr=oldH?[oldH,h]:[h];
    localStorage.setItem(ADMIN_HASH_KEY,JSON.stringify(arr));
  }
}
function getAdminHashes(){
  try{
    const raw=localStorage.getItem(ADMIN_HASH_KEY);
    if(!raw)return [];
    const parsed=JSON.parse(raw);
    return Array.isArray(parsed)?parsed:[parsed];
  }catch{return [];}
}
let isLoggedIn=localStorage.getItem('su_session')==='1';

async function doLogin(){
  const id=document.getElementById('li-id').value.trim();
  const pw=document.getElementById('li-pw').value;
  const err=document.getElementById('li-err');
  if(!id||!pw){err.textContent='아이디와 비밀번호를 입력하세요.';return;}
  const inputHash=await sha256(id+':'+pw);
  const hashes=getAdminHashes();
  if(hashes.includes(inputHash)){
    isLoggedIn=true;
    localStorage.setItem('su_session','1');
    cm('loginModal');
    document.getElementById('li-id').value='';
    document.getElementById('li-pw').value='';
    document.getElementById('li-err').textContent='';
    applyLoginState();
  } else {
    err.textContent='아이디 또는 비밀번호가 올바르지 않습니다.';
    document.getElementById('li-pw').value='';
  }
}

function doLogout(){
  isLoggedIn=false;
  localStorage.removeItem('su_session');
  if(['member','cfg'].includes(curTab)){curTab='total';document.querySelectorAll('.tab').forEach(b=>b.classList.remove('on'));document.querySelector('.tab').classList.add('on');}
  if(['grpedit','input'].includes(compSub)) compSub='league';
  applyLoginState();
}

function applyLoginState(){
  // 헤더 버튼 표시
  document.getElementById('hdrLoginBtn').style.display=isLoggedIn?'none':'';
  document.getElementById('hdrLogoutBtn').style.display=isLoggedIn?'':'none';
  document.getElementById('hdrLoginStatus').style.display=isLoggedIn?'':'none';
  const _mobileBar=document.getElementById('mobileActionBar');
  if(_mobileBar && !isLoggedIn) { const _mBtn=_mobileBar.querySelector('button[onclick*="cloudLoad"]'); if(_mBtn) _mBtn.style.display='none'; }
  if(_mobileBar && isLoggedIn) { const _mBtn=_mobileBar.querySelector('button[onclick*="cloudLoad"]'); if(_mBtn) _mBtn.style.display='flex'; }
  // 잠금 요소
  document.querySelectorAll('.lock-admin').forEach(el=>{
    el.classList.toggle('locked',!isLoggedIn);
  });
  // 관리자 전용 탭 (회원관리, 설정)
  const ADMIN_TABS=['tabMember','tabCfg'];
  ADMIN_TABS.forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display=isLoggedIn?'':'none';
  });
  // 데이터 내보내기/가져오기 버튼 — 로그인 시에만 표시
  const exportHint=document.getElementById('exportHint');
  if(exportHint)exportHint.style.display=isLoggedIn?'':'none';
  const exportVis=document.getElementById('btnExportVis');
  const importVis=document.getElementById('btnImportVis');
  if(exportVis)exportVis.style.display=isLoggedIn?'flex':'none';
  if(importVis)importVis.style.display=isLoggedIn?'flex':'none';
  // 스트리머 등록/경기 기록 입력폼 — 로그인 + 스트리머 탭일 때만 표시
  const fstrip=document.getElementById('fstrip');
  if(fstrip){
    if(!isLoggedIn){fstrip.style.display='none';}
    else{fstrip.style.display=(curTab==='total')?'block':'none';}
  }
  render();
}

// 수정/삭제 버튼 — 비로그인 시 숨김
function adminBtn(html){
  return isLoggedIn ? html : '';
}
function doExport(){
  try{
    const b=new Blob([JSON.stringify({players,univCfg,maps,tourD,miniM,univM,comps,ckM,compNames,curComp,proM,tiers:TIERS,members,tourneys},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(b);
    const a=document.createElement('a');
    a.href=url;a.download='star_backup.json';
    document.body.appendChild(a);a.click();
    setTimeout(()=>{document.body.removeChild(a);URL.revokeObjectURL(url);},100);
  }catch(e){alert('내보내기 오류: '+e.message);}
}

function doImport(){document.getElementById('fi').click();}
function doFile(inp){
  const r=new FileReader();
  r.onload=e=>{
    try{
      const d=JSON.parse(e.target.result);
      players=d.players||[];univCfg=d.univCfg||univCfg;maps=d.maps||maps;tourD=d.tourD||Array(15).fill('');
      if(d.tiers&&d.tiers.length)TIERS.splice(0,TIERS.length,...d.tiers);
      miniM=d.miniM||[];univM=d.univM||[];comps=d.comps||[];ckM=d.ckM||[];
      compNames=d.compNames||[];curComp=d.curComp||'';
      proM=d.proM||[];
      members=d.members||[];tourneys=d.tourneys||[];ttM=d.ttM||[];
      window._compListCache={};window._shareAllMatchesCached=null;
      (function(){
        const allD=[...miniM,...univM,...comps,...ckM,...proM];
        const years=new Set(allD.map(m=>(m.d||'').slice(0,4)).filter(y=>/^\d{4}$/.test(y)));
        years.forEach(y=>{if(!yearOptions.includes(y))yearOptions.push(y);});
        yearOptions.sort();
      })();
      filterYear='전체';filterMonth='전체';
      fixPoints();save();init();
    }catch{alert('파일 읽기 오류');}
  };
  r.readAsText(inp.files[0]);
}

function refreshSel(){
  const allU=getAllUnivs();
  document.getElementById('p-univ').innerHTML=allU.map(u=>`<option value="${u.name}">${u.name}</option>`).join('');
  document.getElementById('m-map').innerHTML=maps.map(m=>`<option value="${m}">${m}</option>`).join('');
}
function openGameEditModal(editRef, si, gi){
  const [mode, idxStr]=editRef.split(':');
  const idx=parseInt(idxStr);
  const arr=mode==='mini'?miniM:mode==='univm'?univM:mode==='ck'?ckM:mode==='pro'?proM:mode==='tt'?ttM:mode==='comp'?comps:null;
  if(!arr)return;
  const m=arr[idx];if(!m)return;
  const set=m.sets&&m.sets[si];if(!set)return;
  const g=set.games&&set.games[gi];if(!g)return;

  // 해당 경기에 뛴 팀 멤버만 추출
  const isCKmode=(mode==='ck'||mode==='pro'||mode==='tt');
  let teamANames=[], teamBNames=[];
  if(isCKmode){
    teamANames=(m.teamAMembers||[]).map(x=>x.name);
    teamBNames=(m.teamBMembers||[]).map(x=>x.name);
  } else {
    // mini/univm: 같은 대학 선수들
    const univA=m.a||''; const univB=m.b||'';
    teamANames=players.filter(p=>p.univ===univA).map(p=>p.name).sort();
    teamBNames=players.filter(p=>p.univ===univB).map(p=>p.name).sort();
  }

  const mapOpts=maps.map(mp=>`<option value="${mp}"${g.map===mp?' selected':''}>${mp}</option>`).join('');
  const modal=document.createElement('div');
  modal.className='modal';modal.style.display='flex';
  modal.innerHTML=`<div class="mbox" style="max-width:460px">
    <div class="mtitle">✏️ 경기 수정 (${si===2?'에이스전':(si+1)+'세트'} · 경기${gi+1})</div>
    <div style="display:flex;flex-direction:column;gap:10px;padding:4px 0 16px">
      <div style="display:flex;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:700;color:#2563eb;min-width:60px">🔵 A팀 선수</label>
        <select id="gem-pA" style="flex:1">
          <option value="">—선택—</option>
          ${teamANames.map(n=>`<option value="${n}"${g.playerA===n?' selected':''}>${n}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:700;color:#dc2626;min-width:60px">🔴 B팀 선수</label>
        <select id="gem-pB" style="flex:1">
          <option value="">—선택—</option>
          ${teamBNames.map(n=>`<option value="${n}"${g.playerB===n?' selected':''}>${n}</option>`).join('')}
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:700;min-width:60px">승자</label>
        <select id="gem-winner" style="flex:1">
          <option value="">(미정)</option>
          <option value="A"${g.winner==='A'?' selected':''}>🔵 A팀 승</option>
          <option value="B"${g.winner==='B'?' selected':''}>🔴 B팀 승</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:700;min-width:60px">맵</label>
        <select id="gem-map" style="flex:1"><option value="">맵 없음</option>${mapOpts}</select>
      </div>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button class="btn btn-w btn-sm" onclick="this.closest('.modal').remove()">취소</button>
      <button class="btn btn-g btn-sm" onclick="saveGameEdit('${editRef}',${si},${gi},this)">✅ 저장</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}

function saveGameEdit(editRef, si, gi, btn){
  const [mode, idxStr]=editRef.split(':');
  const idx=parseInt(idxStr);
  const arr=mode==='mini'?miniM:mode==='univm'?univM:mode==='ck'?ckM:mode==='pro'?proM:mode==='tt'?ttM:mode==='comp'?comps:null;
  if(!arr)return;
  const m=arr[idx];if(!m)return;
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
      wP.win=Math.max(0,(wP.win||0)-1);
      wP.points=(wP.points||0)-3;
      let wi=mid?wP.history.findIndex(h=>h.matchId===mid&&h.result==='승'&&h.opp===oldLose):-1;
      if(wi<0)wi=wP.history.findIndex(h=>h.result==='승'&&h.opp===oldLose&&h.date===mdate);
      if(wi>=0){const hr=wP.history[wi];if(hr.eloDelta!=null)wP.elo=(wP.elo||ELO_DEFAULT)-hr.eloDelta;wP.history.splice(wi,1);}
    }
    if(lP){
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
  g.playerA=newPA; g.playerB=newPB; g.winner=newWinner; g.map=newMap;

  // pro 외 모드: 새 결과 선수 history에 반영
  if(mode!=='pro' && newPA && newPB && newWinner){
    applyGameResult(
      newWinner==='A'?newPA:newPB,
      newWinner==='A'?newPB:newPA,
      m.d||'', newMap||'-', m._id||''
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
  btn.closest('.modal').remove();
  render();
}

async function captureStats(){
  const el=document.getElementById('stats-univ-sec');
  if(!el){alert('캡처할 영역이 없습니다.');return;}
  try{
    _showSaveLoading();
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
    await _imgToDataUrls(el);
    const canvas=await html2canvas(el,{backgroundColor:'#ffffff',scale:2,useCORS:false,allowTaint:false,logging:false});
    const a=document.createElement('a');
    a.download=`${filename||sectionId}_${new Date().toISOString().slice(0,10)}.jpg`;
    a.href=canvas.toDataURL('image/jpeg',.93);a.click();
  }catch(e){alert('이미지 저장 오류: '+e.message);}
  finally{_hideSaveLoading();}
}

/* ══ 모바일 헤더 검색 토글 ══ */
function toggleHdrSearch(){
  const wrap = document.getElementById('hdrSearchWrap');
  const input = document.getElementById('globalSearch');
  if(!wrap) return;
  wrap.classList.toggle('open');
  if(wrap.classList.contains('open')){
    input.style.cssText = 'width:140px!important;opacity:1!important;pointer-events:auto!important;position:relative!important;padding:5px 10px!important;font-size:12px!important;border-radius:20px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.15);color:#fff;outline:none;';
    setTimeout(()=>input.focus(), 50);
    input.onblur = ()=>{ if(!input.value){ wrap.classList.remove('open'); input.style.cssText=''; } };
  } else {
    input.style.cssText = '';
    input.value = '';
    onGlobalSearch('');
  }
}
/* 모바일에서 다크 버튼, 로그인 버튼 텍스트 처리 */
(function(){
  function fixHdrBtnsForMobile(){
    if(window.innerWidth <= 768){
      const dk = document.getElementById('darkToggleBtn');
      if(dk) dk.innerHTML = dk.textContent.includes('다크') ? '🌙' : '☀️';
      const li = document.getElementById('hdrLoginBtn');
      if(li) li.innerHTML = '🔐';
      const lo = document.getElementById('hdrLogoutBtn');
      if(lo) lo.innerHTML = '🔓';
    } else {
      const dk = document.getElementById('darkToggleBtn');
      const isDark = document.body.classList.contains('dark');
      if(dk) dk.innerHTML = isDark ? '☀️ 라이트' : '🌙 다크';
      const li = document.getElementById('hdrLoginBtn');
      if(li) li.innerHTML = '🔐 로그인하기';
      const lo = document.getElementById('hdrLogoutBtn');
      if(lo) lo.innerHTML = '🔓 로그아웃';
    }
  }
  window.addEventListener('resize', fixHdrBtnsForMobile);
  document.addEventListener('DOMContentLoaded', fixHdrBtnsForMobile);
  setTimeout(fixHdrBtnsForMobile, 100);
  window._fixHdrBtns = fixHdrBtnsForMobile;
})();

function toggleDark(){
  const isDark=document.body.classList.toggle('dark');
  localStorage.setItem('su_dark',isDark?'1':'');
  if(window._fixHdrBtns) window._fixHdrBtns(); else document.getElementById('darkToggleBtn').textContent=isDark?'☀️ 라이트':'🌙 다크';
}

/* ── 클립보드 복사 유틸 ── */
function copyMatchResult(a, sa, b, sb, date, mode, idx){
  const winner=sa>sb?a:sb>sa?b:'무승부';
  const lines=[];
  lines.push(`📋 경기 결과 [${date||'날짜미상'}]`);
  lines.push(`${a} ${sa} : ${sb} ${b}${winner!=='무승부'?' → '+winner+' 승':' → 무승부'}`);

  // 세트/게임 상세 내역 추가
  let m=null;
  if(mode==='mini'&&idx!=null&&idx!=='null') m=miniM[idx];
  else if(mode==='univm'&&idx!=null&&idx!=='null') m=univM[idx];
  else if(mode==='ck'&&idx!=null&&idx!=='null') m=ckM[idx];
  else if(mode==='pro'&&idx!=null&&idx!=='null') m=proM[idx];
  else if(mode==='comp'&&idx!=null&&idx!=='null') m=comps[idx];
  else if(mode==='tt'&&idx!=null&&idx!=='null') m=ttM[idx];

  if(m&&m.sets&&m.sets.length){
    lines.push('');
    const isCK=(mode==='ck'||mode==='pro'||mode==='tt');
    m.sets.forEach((set,si)=>{
      const sLabel=si===2?'에이스전':`${si+1}세트`;
      const sA=set.scoreA||0,sB=set.scoreB||0;
      const sw=sA>sB?a:sB>sA?b:'무승부';
      lines.push(`[${sLabel}] ${a} ${sA}:${sB} ${b}${sw!=='무승부'?' ('+sw+')':''}`);
      if(set.games&&set.games.length){
        set.games.forEach((g,gi)=>{
          if(!g.playerA&&!g.playerB)return;
          const wn=g.winner==='A'?g.playerA:g.winner==='B'?g.playerB:'';
          const mapStr=g.map&&g.map!=='-'?` | ${g.map}`:'';
          lines.push(`  경기${gi+1}: ${g.playerA||'?'} vs ${g.playerB||'?'}${wn?' → '+wn+' 승':''}${mapStr}`);
        });
      }
    });
  }

  const text=lines.join('\n');
  navigator.clipboard.writeText(text).then(()=>{
    showToast('📋 상세 결과 복사됐습니다!');
  }).catch(()=>{
    const ta=document.createElement('textarea');
    ta.value=text;document.body.appendChild(ta);ta.select();
    document.execCommand('copy');document.body.removeChild(ta);
    showToast('📋 복사됐습니다!');
  });
}

/* ── 토스트 알림 ── */
function showToast(msg, duration=2000){
  let t=document.getElementById('_toast');
  if(!t){
    t=document.createElement('div');t.id='_toast';
    t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:9px 20px;border-radius:20px;font-size:13px;font-weight:600;z-index:9999;pointer-events:none;opacity:0;transition:opacity .2s;font-family:"Noto Sans KR",sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.25)';
    document.body.appendChild(t);
  }
  t.textContent=msg;
  t.style.opacity='1';
  clearTimeout(t._tid);
  t._tid=setTimeout(()=>{t.style.opacity='0';},duration);
}
function initDark(){
  if(localStorage.getItem('su_dark')==='1'){
    document.body.classList.add('dark');
  }
  // 초기화 후 버튼 텍스트 설정 (모바일/PC 자동 대응)
  setTimeout(()=>{ if(window._fixHdrBtns) window._fixHdrBtns(); }, 50);
}
