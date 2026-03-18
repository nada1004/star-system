/* ══════════════════════════════════════
   GitHub JSON 읽기 전용 불러오기
   ▼ GitHub에 올린 data.json 의 RAW URL을 입력하세요 ▼
══════════════════════════════════════ */
const GITHUB_JSON_URL = 'https://raw.githubusercontent.com/nada1004/star-system/main/star-datacenter/data.json';

/* ══════════════════════════════════════
   Firebase 연동 (실시간 동기화)
══════════════════════════════════════ */
// 클라우드 데이터를 전역 변수에 반영 (cloudLoad + onFirebaseLoad 공통)
function _applyCloudData(d) {
  players=d.players||d.player||[];
  univCfg=d.univCfg||d.univConfig||d.universities||univCfg;
  maps=d.maps||d.map||maps;
  tourD=d.tourD||d.tournamentDates||Array(15).fill('');
  miniM=d.miniM||d.mini||d.miniMatches||[];
  univM=d.univM||d.univ||d.univMatches||[];
  comps=d.comps||d.comp||d.competitions||[];
  ckM=d.ckM||d.ck||d.ckMatches||[];
  compNames=d.compNames||d.competitionNames||[];
  curComp=d.curComp||d.currentComp||'';
  proM=d.proM||d.pro||d.proMatches||[];
  if(d.proTourneys!==undefined) proTourneys=d.proTourneys;  // undefined면 기존값 유지 (구버전 Firebase 데이터 호환)
  tourneys=d.tourneys||d.tournaments||d.tourney||[];
  ttM=d.ttM||d.tt||[];
  indM=d.indM||d.ind||[];
  gjM=d.gjM||[];
  if(d.tiers&&d.tiers.length&&typeof TIERS!=='undefined'){TIERS.splice(0,TIERS.length,...d.tiers);}
}

// Firebase 실시간 수신 콜백 (firebase-init.js 에서 호출)
// - 비관리자: 항상 실시간 업데이트 적용 + 재렌더링
// - 관리자 + 로컬 데이터 있음: 스킵 (관리자는 자신이 저장한 데이터를 권위 있는 소스로 사용)
// - 로컬 데이터 없음 (첫 접속): 항상 적용
window.onFirebaseLoad = function(data) {
  const { admin_pw: _, ...clean } = data;
  try{window._lastFbDataSize=JSON.stringify(data).length;window._lastFbLoadTime=Date.now();}catch(e){}
  const isAdmin = typeof isLoggedIn !== 'undefined' && isLoggedIn && !!localStorage.getItem('su_fb_pw');
  if (!window._forcingSync) {
    // 저장 중 or 30초 이내 저장 → skip (race condition 방지)
    const justSaved = isAdmin && window._lastAdminSaveTime && (Date.now() - window._lastAdminSaveTime < 30000);
    if (justSaved || window._isSaving) return;
    // 새로고침 후에도 보호: 로컬 저장 시각이 Firebase 저장 시각보다 최신이면 skip
    // (Firebase 쓰기 실패했거나 에코가 아직 안 온 경우 로컬 데이터 보존)
    if (isAdmin && clean.savedAt !== undefined) {
      const localSavedAt = parseInt(localStorage.getItem('su_last_admin_save') || '0');
      if (localSavedAt > clean.savedAt) return;
    }
  }
  _applyCloudData(clean);
  if (typeof localSave === 'function') localSave();
  if (typeof fixPoints === 'function') fixPoints();
  window._compListCache = {}; window._shareAllMatchesCached = null; window._histTourneyCache = {};
  if (typeof render === 'function') render();
  const fbTs = document.getElementById('fbLastSync');
  if(fbTs) fbTs.textContent = '🔄 ' + new Date().toLocaleTimeString('ko-KR');
};

// Firebase에 현재 데이터 저장 (관리자 전용)
async function fbCloudSave() {
  const pw = localStorage.getItem('su_fb_pw');
  if (!pw || !isLoggedIn || typeof window.fbSet !== 'function') return;
  const savedAt = Date.now();
  // await 이전에 설정 → race condition 방지 + 새로고침 후에도 로컬 데이터 보호
  window._lastAdminSaveTime = savedAt;
  window._isSaving = true;
  localStorage.setItem('su_last_admin_save', String(savedAt)); // 새로고침 후에도 복원
  const dataObj = {
    players, univCfg, maps, tourD, miniM, univM, comps, ckM,
    compNames, curComp, proM, proTourneys, tiers: TIERS, tourneys, ttM, indM, gjM,
    savedAt // Firebase 데이터에도 저장 시각 기록
  };
  try {
    await window.fbSet(dataObj, pw);
    window._lastAdminSaveTime = Date.now(); // 완료 후 window 연장
    // GitHub data.json도 업로드 (관람자 폴링용, 실패해도 Firebase 저장은 유지)
    githubDataSave(dataObj).catch(e => console.warn('[githubDataSave]', e));
  } finally {
    window._isSaving = false;
  }
}

// GitHub data.json 자동 업로드 (관람자 수천 명 무료 처리용)
// 설정탭에서 GitHub 토큰(su_gh_token) 설정 시 활성화
async function githubDataSave(dataObj) {
  const token = localStorage.getItem('su_gh_token');
  if (!token) return; // 토큰 미설정 시 skip
  const apiUrl = 'https://api.github.com/repos/nada1004/star-system/contents/data.json';
  // 현재 파일 SHA 조회 (업데이트 시 필수)
  const getRes = await fetch(apiUrl, {
    headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
  });
  if (!getRes.ok) throw new Error('GitHub 파일 조회 실패: ' + getRes.status);
  const fileInfo = await getRes.json();
  // 내용 base64 인코딩
  const jsonStr = JSON.stringify(dataObj, null, 2);
  const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
  // 파일 업데이트
  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `데이터 업데이트 ${new Date().toLocaleString('ko-KR')}`,
      content: b64,
      sha: fileInfo.sha
    })
  });
  if (!putRes.ok) throw new Error('GitHub 저장 실패: ' + putRes.status);
}


function gsSetStatus(msg, color='var(--gray-l)'){
  const el=document.getElementById('cloudStatus');
  if(el){el.textContent=msg;el.style.color=color;}
}

// ── GitHub JSON 불러오기 ───────────────────────────────────
window.cloudLoad = async function(){
  try{
    gsSetStatus('📥 불러오는 중...', 'var(--blue)');
    const loadBtn=document.getElementById('btnCloudLoad');
    if(loadBtn){loadBtn.disabled=true;loadBtn.textContent='⏳ 불러오는 중...';}
    let d=null;
    const baseUrl=GITHUB_JSON_URL;
    const ghApiUrl='https://api.github.com/repos/nada1004/star-system/contents/star-datacenter/data.json';
    const urls=[
      baseUrl+'?nocache='+Date.now(),
      'https://cdn.jsdelivr.net/gh/nada1004/star-system@main/star-datacenter/data.json',
      ghApiUrl,
      'https://corsproxy.io/?url='+encodeURIComponent(baseUrl),
      'https://api.allorigins.win/raw?url='+encodeURIComponent(baseUrl),
    ];

    // 각 URL을 파싱까지 완료한 데이터 객체로 변환하는 함수
    const tryUrl = async (url) => {
      const ctrl=new AbortController();
      const timer=setTimeout(()=>ctrl.abort(),12000);
      try{
        const res=await fetch(url,{cache:'no-store',mode:'cors',signal:ctrl.signal});
        clearTimeout(timer);
        if(!res.ok) throw new Error('HTTP '+res.status);
        const text=(await res.text()).replace(/^\uFEFF/,'').trim();
        if(text.startsWith('<')) throw new Error('HTML 응답');
        const raw=JSON.parse(text);
        if(raw&&raw.content&&raw.encoding==='base64'){
          const bin=atob(raw.content.replace(/\s/g,''));
          const bytes=new Uint8Array(bin.length);
          for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
          return JSON.parse(new TextDecoder('utf-8').decode(bytes));
        }
        return raw;
      }catch(e){ clearTimeout(timer); throw e; }
    };

    // 모든 URL 동시 시도 → 가장 먼저 성공한 결과 사용 (Promise.any)
    try{
      d=await Promise.any(urls.map(tryUrl));
    }catch(aggErr){
      const errs=(aggErr.errors||[aggErr]).map((e,i)=>`[${i+1}] ${e?.message||e}`).join('\n');
      throw new Error('데이터를 불러올 수 없습니다.\n\n원인:\n'+errs+'\n\n해결방법:\n· 인터넷 연결 확인\n· GitHub 저장소(nada1004/star-system)가 공개(Public) 상태인지 확인\n· data.json 파일이 main 브랜치에 있는지 확인');
    }
    if(!confirm('GitHub 데이터를 불러옵니다.\n\n⚠️ 현재 로컬 데이터가 덮어씌워집니다. 계속하시겠습니까?')) return;

    // 필드명 별칭 지원 (파싱 유연성)
    _applyCloudData(d);
    console.log('[불러오기] 데이터 구조:', {players:players.length,miniM:miniM.length,univM:univM.length,comps:comps.length,ckM:ckM.length,proM:proM.length,tourneys:tourneys.length});

    save();
    fixPoints();
    window._compListCache={}; // 대회 목록 캐시 초기화
    window._shareAllMatchesCached=null; // 공유카드 캐시 초기화
    window._histTourneyCache={}; // 대회 기록 탭 캐시 초기화
    curTab='total'; // 탭 초기화 (렌더링 오류 방지)
    statsSub='overview';
    histSub='mini';
    compSub='league';
    // yearOptions를 불러온 데이터에서 자동 추출
    (function(){
      const allD=[...d.miniM||[],...d.univM||[],...d.comps||[],...d.ckM||[],...d.proM||[]];
      const years=new Set(allD.map(m=>(m.d||'').slice(0,4)).filter(y=>/^\d{4}$/.test(y)));
      years.forEach(y=>{if(!yearOptions.includes(y))yearOptions.push(y);});
      yearOptions.sort();
    })();
    filterYear='전체'; // 연도 필터 초기화 (데이터가 다른 년도일 수 있음)
    filterMonth='전체';
    init();

    const compCount=(d.comps||[]).length;
    const tourCount=(d.tourneys||[]).reduce((s,t)=>s+(t.groups||[]).reduce((ss,g)=>ss+(g.matches||[]).filter(m=>m.sa!=null).length,0),0);
    const miniCount=(d.miniM||[]).length;
    const _lb=document.getElementById('btnCloudLoad');if(_lb){_lb.disabled=false;_lb.innerHTML='<span>☁️</span> 데이터 불러오기';}
    gsSetStatus(`✅ 불러오기 완료 (${new Date().toLocaleTimeString()}) — 미니 ${miniCount}건·대회 ${compCount+tourCount}건`, 'var(--green)');
  } catch(e){
    const _lb2=document.getElementById('btnCloudLoad');if(_lb2){_lb2.disabled=false;_lb2.innerHTML='<span>☁️</span> 데이터 불러오기';}
    const errMsg=e.message||String(e);
    gsSetStatus('❌ 불러오기 실패 (하단 메시지 확인)', 'var(--red)');
    console.error('[cloudLoad 오류]', e);
    // 간결한 에러 메시지 표시
    const shortMsg=errMsg.split('\n').slice(0,3).join('\n');
    setTimeout(()=>alert('⚠️ 데이터 불러오기 실패\n\n'+shortMsg), 100);
  }
};


/* ════ 현황판 탭 rBoard ════ */
let boardSelUniv='전체';
let boardCompactMode=false; // 소형 칩 보기
let boardGridCols=1; // 1열/2열 보기
// 현황판 선수 순서: {univ: [name, name, ...]}
let boardPlayerOrder = J('su_bpo') || {};

function _getBoardUnivs(){
  const univs = getAllUnivs();
  if(!boardOrder.length) return univs;
  const ordered = [];
  boardOrder.forEach(name => { const u = univs.find(x=>x.name===name); if(u) ordered.push(u); });
  univs.forEach(u => { if(!boardOrder.includes(u.name)) ordered.push(u); });
  return ordered;
}
function toggleBoardUniv(name){
  if(typeof boardSelUniv==='undefined') return;
  boardSelUniv = (boardSelUniv===name) ? '전체' : name;
  const sel = document.getElementById('board-univ-sel');
  if(sel) sel.value = boardSelUniv;
  _updateBoardSaveLabel();
  render();
}
function _updateBoardSaveLabel(){
  const lbl = document.getElementById('btn-img-save-label');
  const brdLbl = document.getElementById('brd-save-btn-label');
  const text = (boardSelUniv && boardSelUniv!=='전체') ? boardSelUniv+' 이미지저장' : '이미지저장';
  if(lbl) lbl.textContent = text;
  if(brdLbl) brdLbl.textContent = text;
}

// 하단 이미지저장 버튼: 현재 보이는 화면을 그대로 캡처 (현황판 전체/개별 저장은 현황판 탭 내 버튼 사용)
function saveCurrentView(){
  if(typeof doJpg==='function') doJpg();
}


// 대학 내 선수 정렬 (boardPlayerOrder 우선, 없으면 기본 정렬)
function _getBoardPlayers(univName, includeRetired=false){
  const univPlayers = players.filter(p=>p.univ===univName&&(includeRetired||!p.retired));
  const order = boardPlayerOrder[univName] || [];
  if(!order.length){
    // 기본: MAIN_ROLES → 티어 → 포인트
    return [...univPlayers].sort((a,b)=>{
      const ra=getRoleOrder(a.role),rb=getRoleOrder(b.role);
      if(ra!==rb)return ra-rb;
      return TIERS.indexOf(a.tier)-TIERS.indexOf(b.tier)||b.points-a.points;
    });
  }
  const sorted = [];
  order.forEach(name=>{ const p=univPlayers.find(x=>x.name===name); if(p) sorted.push(p); });
  univPlayers.forEach(p=>{ if(!order.includes(p.name)) sorted.push(p); });
  return sorted;
}

function saveBoardPlayerOrder(){
  localStorage.setItem('su_bpo', JSON.stringify(boardPlayerOrder));
}

function rBoard(C,T){
  T.textContent='📊 현황판';
  const univs=_getBoardUnivs();
  const visUnivs=isLoggedIn?univs:univs.filter(u=>!u.hidden);
  if(!univs.length){C.innerHTML='<div style="padding:40px;text-align:center;color:var(--gray-l)">등록된 선수가 없습니다.</div>';return;}
  let h=`
  <style>
    .brd-card{background:var(--brd-col,#dbeafe);border-radius:18px;overflow:hidden;box-shadow:0 4px 18px var(--brd-shd,rgba(37,99,235,.15)),0 1px 6px rgba(0,0,0,.07);position:relative;transition:transform .18s,box-shadow .18s;align-self:start;border:1px solid rgba(0,0,0,.06);}
    .brd-card:hover{transform:translateY(-2px);box-shadow:0 10px 32px var(--brd-shd,rgba(37,99,235,.22)),0 3px 10px rgba(0,0,0,.1);}
    .brd-card.drag-over{outline:3px solid rgba(0,0,0,.2);opacity:.85;}
    .brd-card.dragging{opacity:.45;transform:scale(.97);}
    .brd-hdr{padding:16px 18px 13px;position:relative;z-index:1;cursor:grab;}
    .brd-hdr:active{cursor:grabbing;}
    .brd-hdr::before{content:'';position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,.18) 0%,rgba(255,255,255,0) 55%);pointer-events:none;z-index:0;}
    .brd-circle{position:absolute;border-radius:50%;background:rgba(255,255,255,.15);pointer-events:none;}
    .brd-row{display:flex;align-items:center;gap:7px;padding:5px 10px;border-radius:9px;background:rgba(255,255,255,.82);border:1px solid rgba(255,255,255,.7);transition:background .12s,box-shadow .12s;}
    .brd-row:hover{box-shadow:0 2px 8px rgba(0,0,0,.1);}
    .brd-row-btn{cursor:pointer;flex:1;display:flex;align-items:center;gap:7px;background:none;border:none;padding:0;font-family:'Noto Sans KR',sans-serif;min-width:0;}
    .brd-photo{width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;background:rgba(0,0,0,.08);border:1.5px solid rgba(255,255,255,.7);}
    .brd-photo-placeholder{width:26px;height:26px;border-radius:50%;flex-shrink:0;background:rgba(255,255,255,.4);border:1.5px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:12px;color:rgba(0,0,0,.35);}
    .brd-race{font-size:9px;font-weight:800;padding:2px 6px;border-radius:5px;flex-shrink:0;letter-spacing:.3px;}
    .brd-name{font-weight:700;font-size:12px;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0;text-align:left;}
    .brd-role-main{font-size:9px;padding:1px 5px;border-radius:4px;font-weight:700;white-space:nowrap;flex-shrink:0;border:1px solid;}
    .brd-role-sub{font-size:9px;padding:1px 5px;border-radius:4px;font-weight:600;white-space:nowrap;flex-shrink:0;background:rgba(100,116,139,.1);color:#475569;border:1px solid rgba(100,116,139,.2);}
    .brd-move-btn{display:flex;flex-direction:column;gap:1px;flex-shrink:0;opacity:.55;}
    .brd-move-btn button{background:none;border:none;cursor:pointer;font-size:9px;padding:0 2px;line-height:1;color:#1e293b;transition:opacity .12s;}
    .brd-move-btn button:hover{opacity:.5;}
    .brd-move-btn button:disabled{opacity:.18;cursor:default;}
    .brd-sep{height:1px;background:rgba(0,0,0,.1);margin:0 18px;}
    .brd-body{padding:10px 10px 14px;display:flex;flex-direction:column;gap:4px;overflow:hidden;}
    .brd-row-drag{cursor:grab;}.brd-row-drag:active{cursor:grabbing;}
    .brd-tier-lbl{font-size:9px;font-weight:700;color:rgba(0,0,0,.45);letter-spacing:.8px;text-transform:uppercase;padding:0 2px;margin:6px 0 2px;}
    .brd-tier-lbl:first-child{margin-top:0;}
    .brd-univ-name-btn{font-weight:900;font-size:18px;color:#fff;letter-spacing:.2px;line-height:1.15;text-shadow:0 1px 4px rgba(0,0,0,.2);cursor:pointer;border:none;background:none;padding:0;font-family:'Noto Sans KR',sans-serif;text-align:left;transition:opacity .15s;}
    .brd-univ-name-btn:hover{text-decoration:underline;text-underline-offset:3px;opacity:.8;}
    .brd-drag-hint{font-size:10px;color:rgba(255,255,255,.5);margin-left:auto;padding:2px 6px;border-radius:4px;background:rgba(255,255,255,.1);cursor:grab;flex-shrink:0;user-select:none;}
    .brd-side-panel{float:right;width:230px;margin:0 0 6px 10px;}
    .brd-bottom-img{max-width:200px;max-height:160px;object-fit:contain;}
    @media(max-width:640px){.brd-side-panel{display:none!important;}.brd-bottom-section-img{display:none!important;}}
    /* 이동 팝업 */
    .brd-move-popup{position:fixed;z-index:5000;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.22);padding:10px;min-width:220px;max-width:260px;max-height:90vh;overflow-y:auto;border:1px solid var(--border);}
    .brd-move-popup-title{font-size:11px;font-weight:700;color:var(--text3);padding:4px 6px 8px;border-bottom:1px solid var(--border);margin-bottom:6px;}
    .brd-move-popup-btn{display:flex;align-items:center;gap:8px;width:100%;padding:7px 10px;border:none;background:none;border-radius:7px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;font-size:12px;font-weight:600;color:var(--text);transition:background .1s;text-align:left;}
    .brd-move-popup-btn:hover{background:var(--blue-l);color:var(--blue);}
    .brd-move-popup-btn:disabled{opacity:.35;cursor:default;background:none;}
    .brd-move-popup-sep{height:1px;background:var(--border);margin:4px 0;}
    /* 현황판 툴바 버튼 */
    .brd-tbtn{display:inline-flex;align-items:center;gap:6px;padding:6px 13px;border-radius:9px;border:1.5px solid var(--border2);background:var(--surface);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;font-family:'Noto Sans KR',sans-serif;white-space:nowrap;line-height:1.4;}
    .brd-tbtn:hover{transform:translateY(-1px);box-shadow:0 3px 10px rgba(0,0,0,.12);}
    .brd-tbtn:active{transform:translateY(0);box-shadow:none;}
    .brd-tbtn-img{border-color:#3b82f6;color:#2563eb;background:linear-gradient(135deg,#eff6ff,#dbeafe);}
    .brd-tbtn-img:hover{background:linear-gradient(135deg,#dbeafe,#bfdbfe);border-color:#2563eb;}
    .brd-tbtn-share{border-color:#8b5cf6;color:#6d28d9;background:linear-gradient(135deg,#f5f3ff,#ede9fe);}
    .brd-tbtn-share:hover{background:linear-gradient(135deg,#ede9fe,#ddd6fe);border-color:#6d28d9;}
    body.dark .brd-tbtn-img{background:linear-gradient(135deg,#1e3a5f,#1e3a8a);color:#93c5fd;border-color:#3b82f6;}
    body.dark .brd-tbtn-share{background:linear-gradient(135deg,#2e1f5e,#3b2080);color:#c4b5fd;border-color:#7c3aed;}
    .brd-toolbar{position:sticky;top:0;z-index:100;background:var(--white)!important;}
    .brd-tbtn-grid{border-color:#6366f1;color:#4338ca;background:linear-gradient(135deg,#eef2ff,#e0e7ff);}
    .brd-tbtn-grid:hover{background:linear-gradient(135deg,#e0e7ff,#c7d2fe);border-color:#4338ca;}
    body.dark .brd-tbtn-grid{background:linear-gradient(135deg,#1e1b4b,#312e81);color:#a5b4fc;border-color:#6366f1;}
    @media(max-width:768px){#board-wrap{grid-template-columns:1fr!important;}}
  </style>
  <div class="no-export brd-toolbar" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 16px;background:var(--white);border:1px solid var(--border);border-radius:14px;margin-bottom:20px;box-shadow:0 2px 12px rgba(0,0,0,.07)">
    <div style="display:flex;align-items:center;gap:8px;margin-right:2px">
      <span style="font-size:18px;line-height:1">📊</span>
      <span style="font-weight:900;font-size:15px;color:var(--text);letter-spacing:-.3px">현황판</span>
    </div>
    <div style="width:1px;height:22px;background:var(--border);opacity:.6"></div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <div style="position:relative">
        <select id="board-univ-sel" onchange="boardSelUniv=this.value;_updateBoardSaveLabel();render();if(boardSelUniv!=='전체'){setTimeout(()=>{const c=document.querySelector(\`.brd-card[data-univ='\${boardSelUniv}']\`);if(c)c.scrollIntoView({behavior:'smooth',block:'center'});},120);}" style="appearance:none;-webkit-appearance:none;padding:6px 28px 6px 12px;border-radius:9px;border:1.5px solid var(--border2);font-size:12px;font-weight:700;color:var(--text);background:var(--surface);cursor:pointer;outline:none;min-width:120px;">
          <option value="전체">🏫 전체 보기</option>
          ${visUnivs.map(u=>`<option value="${u.name}"${boardSelUniv===u.name?' selected':''}>${u.name}${isLoggedIn&&u.hidden?' (숨김)':''}</option>`).join('')}
        </select>
        <svg style="position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--gray-l)" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      <button class="brd-tbtn brd-tbtn-img" onclick="boardSelUniv&&boardSelUniv!=='전체'?downloadBoardSel():downloadBoardAll()" id="brd-save-btn">
        📷 <span id="brd-save-btn-label">${boardSelUniv&&boardSelUniv!=='전체'?boardSelUniv+' 이미지저장':'이미지저장'}</span>
      </button>
      <button class="brd-tbtn brd-tbtn-grid" onclick="boardGridCols=boardGridCols===2?1:2;render()" style="${boardGridCols===2?'background:#e0e7ff;border-color:#4338ca;color:#3730a3;':''}" title="1열/2열 보기 전환">${boardGridCols===2?'▦ 1열':'⊞ 2열'}</button>
      <button class="brd-tbtn" onclick="boardCompactMode=!boardCompactMode;render()" style="${boardCompactMode?'background:#f0fdf4;border-color:#22c55e;color:#15803d;':''}" title="소형/대형 칩 전환">${boardCompactMode?'⬛ 크게보기':'🔲 소형으로'}</button>
    </div>
    <span style="font-size:11px;color:var(--gray-l);margin-left:auto">${isLoggedIn?`🖱️ 헤더 드래그·◀▶ = 대학순서 &nbsp;|&nbsp; 스트리머 드래그/클릭 = 순서·대학이동 &nbsp;<button onclick="sw('cfg')" style="background:var(--surface);border:1px solid var(--border2);border-radius:6px;padding:2px 9px;font-size:11px;cursor:pointer;color:var(--text2);font-weight:600">⚙️ 대학 색상·숨기기</button>`:'👆 스트리머 클릭 → 스트리머 상세'}</span>
  </div>
  <div id="board-wrap" style="display:grid;grid-template-columns:${boardGridCols===2?'repeat(2,1fr)':'1fr'};gap:14px;align-items:start">`;
  const targets=boardSelUniv==='전체'?visUnivs:visUnivs.filter(u=>u.name===boardSelUniv);
  targets.forEach(u=>{ h+=buildUnivBoardCard(u); });
  h+=`</div>
`;
  C.innerHTML=h;
  injectUnivIcons(C);
  requestAnimationFrame(()=>{
    injectUnivIcons(C);
    initBoardDrag();
  });
  // 팝업 닫기 이벤트 (한 번만 등록)
  if(!_brdPopupListenerAdded){
    document.addEventListener('click', _closeBrdPopup, {capture:true});
    _brdPopupListenerAdded = true;
  }
}

function buildUnivBoardCard(u, forExport){
  if(!u)return'';
  const col=gc(u.name);
  const iconUrl=UNIV_ICONS[u.name]||(univCfg.find(x=>x.name===u.name)||{}).icon||'';
  const sorted=_getBoardPlayers(u.name);
  if(!sorted.length&&!forExport){
    // 선수 없는 대학도 빈 카드로 표시
    return `<div class="brd-card" data-univ="${u.name}" style="border:2px dashed ${col}66;border-radius:14px;padding:20px 18px;background:${col}08;display:flex;align-items:center;gap:10px;opacity:.75">
      ${iconUrl?`<img src="${iconUrl}" style="width:32px;height:32px;object-fit:contain;border-radius:6px" onerror="this.style.display='none'">`:''}
      <span style="font-weight:900;font-size:15px;color:${col}">${u.name}</span>
      <span style="font-size:11px;color:var(--gray-l)">등록된 선수 없음</span>
    </div>`;
  }
  const cnt=sorted.length;
  const allUnivs=getAllUnivs();

  const RACE_CFG={T:{bg:'#dbeafe',col:'#1e40af',txt:'테'},Z:{bg:'#ede9fe',col:'#5b21b6',txt:'저'},P:{bg:'#fef3c7',col:'#92400e',txt:'프'},N:{bg:'#f1f5f9',col:'#475569',txt:'?'}};
  const hexToRgba=(h,a)=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};
  // 파스텔 변환: 원색을 흰색과 mix=60% 블렌딩
  const toPastel=(hex,mix=0.72)=>{
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    const pr=Math.round(r*(1-mix)+255*mix),pg=Math.round(g*(1-mix)+255*mix),pb=Math.round(b*(1-mix)+255*mix);
    return '#'+[pr,pg,pb].map(v=>v.toString(16).padStart(2,'0')).join('');
  };
  const pastelCol=forExport?col:toPastel(col, 0.72);
  const headerCol = col; // 헤더는 대학 상징색 그대로 사용
  const shd=hexToRgba(col,.18);

  // 티어별 칩 레이아웃 빌더 (무소속 + forExport 시 모든 대학에 적용)
  const buildChipLayout=(isWide)=>{
    // 직급자와 일반 선수 분리
    const rolePlayers = sorted.filter(p=>p.role&&MAIN_ROLES.includes(p.role));
    const normalPlayers = sorted.filter(p=>!p.role||!MAIN_ROLES.includes(p.role));

    const tierMap={};
    normalPlayers.forEach(p=>{
      const t=p.tier||'기타';
      if(!tierMap[t])tierMap[t]=[];
      tierMap[t].push(p);
    });
    const tierOrder=TIERS.filter(t=>tierMap[t]);
    if(tierMap['기타']&&!TIERS.includes('기타'))tierOrder.push('기타');

    const buildPlayerChip=(p, chipIdx)=>{
      const rc=RACE_CFG[p.race]||{bg:'#f1f5f9',col:'#475569',txt:p.race||'?'};
      const isMain=p.role&&MAIN_ROLES.includes(p.role);
      const rCol=ROLE_COLORS[p.role]||'';
      const rIcon=ROLE_ICONS[p.role]||'';
      const photoSrcChip = p.photo||'';
      if(forExport){
        // 이미지 저장: 화면 칩과 동일한 스타일로 렌더링
        const cBgE=hexToRgba(col,.16);
        const cBdE=hexToRgba(col,.45);
        const rTxt=rc.txt||p.race||'?';
        const chipTierCol2 = p.tier ? (_TIER_BG[p.tier] || col) : '#9ca3af';
        const chipTierText2 = p.tier ? (_TIER_TEXT[p.tier] || '#fff') : '#fff';
        return `<span style="display:inline-flex;align-items:center;gap:12px;background:${cBgE};border-radius:16px;padding:10px 18px 10px 10px;margin:5px;box-shadow:0 2px 10px rgba(0,0,0,.13);border:2px solid ${cBdE}">
          ${photoSrcChip
            ?`<img src="${photoSrcChip}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;flex-shrink:0;border:3px solid ${col};box-shadow:0 2px 10px ${hexToRgba(col,.4)}">`
            :`<span style="width:64px;height:64px;border-radius:50%;background:${col};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;flex-shrink:0;border:3px solid ${hexToRgba(col,.7)}">${rTxt}</span>`}
          <span style="display:inline-flex;flex-direction:column;gap:3px;min-width:0">
            ${isMain?`<span style="font-size:11px;font-weight:900;color:#fff;background:${col};border-radius:5px;padding:2px 8px;display:inline-block">${rIcon}${p.role}</span>`:''}
            <span style="font-weight:900;color:#111;font-size:16px;line-height:1.3;white-space:nowrap">${p.name}</span>
            <span style="display:inline-flex;align-items:center;gap:5px;line-height:1.2">
              <span style="font-size:12px;font-weight:900;background:${rc.col};color:#fff;border-radius:6px;padding:2px 8px">${rTxt}</span>
              ${p.tier?`<span style="font-size:11px;font-weight:800;background:${chipTierCol2};color:${chipTierText2};border-radius:6px;padding:2px 8px">${p.tier}</span>`:''}
            </span>
          </span>
        </span>`;
      }
      const compact=!forExport&&boardCompactMode;
      const pNameSafe=p.name.replace(/'/g,"\\'").replace(/"/g,'&quot;');
      const totalInUniv=sorted.length;
      // 관리자는 이동/직책 팝업, 비관리자는 스트리머 상세
      const clickFn=isLoggedIn
        ? `openBrdPlayerPopupFromChip(event,'${pNameSafe}','${u.name}',${chipIdx??0},${totalInUniv})`
        : `openPlayerModal('${pNameSafe}')`;

      // 티어 고정 색상 (칩)
      const chipTierCol = p.tier ? (_TIER_BG[p.tier] || col) : '#9ca3af';
      const chipTierText = p.tier ? (_TIER_TEXT[p.tier] || '#fff') : '#fff';

      // 칩 배경: 대학 지정색
      const cBgL=hexToRgba(col,.16);
      const cBgH=hexToRgba(col,.28);
      const cBd=hexToRgba(col,.45);
      const rTxt=rc.txt||p.race||'?';
      const photoSz=compact?'36px':'64px';
      const photoFs=compact?'14px':'26px';
      const chipPad=compact?'5px 10px 5px 6px':'10px 18px 10px 10px';
      const chipGap=compact?'7px':'12px';
      const nameFs=compact?'13px':'16px';
      const badgeFs=compact?'10px':'12px';
      const tierBadgeFs=compact?'9px':'11px';
      return `<span class="brd-chip" data-player="${p.name}" data-univ="${u.name}" data-idx="${chipIdx??0}"${isLoggedIn?' draggable="true"':''} style="display:inline-flex;align-items:center;gap:${chipGap};background:${cBgL};border-radius:16px;padding:${chipPad};margin:${compact?'3px':'5px'};cursor:${isLoggedIn?'grab':'pointer'};transition:all .15s;box-shadow:0 2px 10px rgba(0,0,0,.13);border:2px solid ${cBd}" onmouseover="this.style.background='${cBgH}';this.style.boxShadow='0 5px 18px rgba(0,0,0,.2)';this.style.borderColor='${hexToRgba(col,.65)}'" onmouseout="this.style.background='${cBgL}';this.style.boxShadow='0 2px 10px rgba(0,0,0,.13)';this.style.borderColor='${cBd}'" onclick="event.stopPropagation();${clickFn}" ondragstart="if(isLoggedIn){event.stopPropagation();event.dataTransfer.setData('text/chip',this.dataset.player);}">
        ${photoSrcChip
          ?`<img src="${photoSrcChip}" style="width:${photoSz};height:${photoSz};border-radius:50%;object-fit:cover;flex-shrink:0;border:${compact?'2':'3'}px solid ${col};box-shadow:0 2px 10px ${hexToRgba(col,.4)}" onerror="this.style.display='none'">`
          :`<span style="width:${photoSz};height:${photoSz};border-radius:50%;background:${col};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:${photoFs};font-weight:900;flex-shrink:0;border:${compact?'2':'3'}px solid ${hexToRgba(col,.7)}">${rTxt}</span>`}
        <span style="display:inline-flex;flex-direction:column;gap:${compact?'2px':'3px'};min-width:0">
          ${isMain&&!compact?`<span style="font-size:11px;font-weight:900;color:#fff;background:${col};border-radius:5px;padding:2px 8px;display:inline-block">${rIcon}${p.role}</span>`:''}
          <span style="font-weight:900;color:#111;font-size:${nameFs};line-height:1.3;white-space:nowrap;${p.inactive?'opacity:.6':''}">${compact&&isMain?`${rIcon}`:''}${p.name}${getStatusIconHTML(p.name)}${p.inactive?'<span style="font-size:9px;background:#fff7ed;color:#9a3412;border-radius:4px;padding:1px 4px;font-weight:700;margin-left:3px">⏸️</span>':''}</span>
          <span style="display:inline-flex;align-items:center;gap:${compact?'3px':'5px'};line-height:1.2">
            <span style="font-size:${badgeFs};font-weight:900;background:${rc.col};color:#fff;border-radius:6px;padding:${compact?'1px 5px':'2px 8px'}">${rTxt}</span>
            ${p.tier?`<span style="font-size:${tierBadgeFs};font-weight:800;background:${chipTierCol};color:${chipTierText};border-radius:6px;padding:${compact?'1px 5px':'2px 8px'}">${p.tier}</span>`:''}
          </span>
        </span>
      </span>`;    };

    // 전체 순서에서의 인덱스 맵
    const chipIdxMap={};
    sorted.forEach((p,i)=>{ chipIdxMap[p.name]=i; });

    // 직급자 섹션
    // 직책별 개별 행 (MAIN_ROLES 순서대로 각 역할 따로 표시)
    const roleRowsArr = MAIN_ROLES
      .map(role => rolePlayers.filter(p => p.role === role))
      .filter(group => group.length > 0);
    const roleSection = roleRowsArr.length > 0
      ? roleRowsArr.map(group => {
          const role = group[0].role;
          const rIcon = ROLE_ICONS[role] || '';
          const rCol = ROLE_COLORS[role] || col;
          return `<div style="margin-bottom:6px;padding:6px 8px 8px;border-radius:10px;background:${hexToRgba(col,.1)};border:1.5px solid ${hexToRgba(col,.25)}">
            <div style="font-size:10px;font-weight:900;color:#fff;padding:2px 9px;margin-bottom:4px;background:${rCol};border-radius:5px;display:inline-block;line-height:1.6">${rIcon}${role}</div>
            <div style="display:flex;flex-wrap:wrap;gap:0">${group.map(p=>buildPlayerChip(p, chipIdxMap[p.name]??0)).join('')}</div>
          </div>`;
        }).join('')
      : '';

    const tierRows=tierOrder.map((tier,tidx)=>{
      const ps=tierMap[tier];
      const tColor = _TIER_BG[tier] || col;
      const tText = _TIER_TEXT[tier] || '#fff';
      return `<div style="padding:4px 0 2px;border-bottom:1px solid ${hexToRgba(col,.22)}">
        <div style="font-size:10px;font-weight:900;color:${tText};letter-spacing:1px;padding:2px 9px;margin-bottom:3px;background:${tColor};border-radius:5px;box-shadow:0 1px 4px rgba(0,0,0,.15);display:inline-block;line-height:1.5">${tier}</div>
        <div style="display:flex;flex-wrap:wrap;gap:0">${ps.map(p=>buildPlayerChip(p, chipIdxMap[p.name]??0)).join('')}</div>
      </div>`;
    }).join('');
    const allRows = roleSection + tierRows;

    const hdrDrag=isLoggedIn&&!forExport?' draggable="true" ondragstart="event.stopPropagation();const card=this.closest(\'.brd-card\');const wrap=document.getElementById(\'board-wrap\');_brdDragSrc=card;card.classList.add(\'dragging\');event.dataTransfer.effectAllowed=\'move\';event.dataTransfer.setData(\'text/card\',card.dataset.univ);" ondragend="event.stopPropagation();const card=this.closest(\'.brd-card\');card.classList.remove(\'dragging\');const wrap=document.getElementById(\'board-wrap\');if(wrap){boardOrder=[...wrap.querySelectorAll(\'.brd-card\')].map(c=>c.dataset.univ);save();syncBoardOrderToUnivCfg();}wrap&&wrap.querySelectorAll(\'.brd-card\').forEach(c=>c.classList.remove(\'drag-over\'));_brdDragSrc=null;"':'';

    const _bgPos=u.bgImgPos||'center center';
    const _bgSize=u.bgImgSize||'cover';
    const _bgOverlay=u.bgImg?`<div style="position:absolute;inset:0;background:url('${u.bgImg}') ${_bgPos}/${_bgSize} no-repeat;opacity:0.18;pointer-events:none;z-index:0"></div>`:'';
    const _uNameSafe=u.name.replace(/'/g,"\\'");
    const _bgPosGrid=u.bgImg?(()=>{
      const vs=['top','center','bottom'],hs=['left','center','right'];
      return `<div onclick="event.stopPropagation()" style="display:flex;flex-direction:column;gap:1px" title="배경 위치">${vs.map(v=>`<div style="display:flex;gap:1px">${hs.map(h=>{const p=`${v} ${h}`,a=_bgPos===p;return`<button onclick="event.stopPropagation();setBoardBgImgPos('${_uNameSafe}','${p}')" style="width:10px;height:10px;border-radius:2px;border:1px solid ${a?'rgba(255,255,255,.9)':'rgba(255,255,255,.3)'};background:${a?'rgba(255,255,255,.6)':'rgba(255,255,255,.15)'};cursor:pointer;padding:0" title="${p}"></button>`;}).join('')}</div>`).join('')}</div>`;
    })():'';
    return `<div class="brd-card" data-univ="${u.name}" style="--brd-col:${toPastel(col,0.9)};--brd-shd:${shd}${isWide?';grid-column:1/-1':''}" draggable="false">
      <div class="brd-hdr" style="background:linear-gradient(135deg,${col} 0%,${hexToRgba(col,.85)} 100%);border-radius:18px 18px 0 0;cursor:${isLoggedIn&&!forExport?'grab':'default'};overflow:hidden"${hdrDrag}>
        <div style="display:flex;align-items:center;gap:10px;position:relative;z-index:1">
          <div style="width:46px;height:46px;border-radius:13px;background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;${forExport?'':'cursor:pointer'}" ${forExport?'':`onclick="event.stopPropagation();toggleBoardUniv('${u.name}')"` } title="클릭: 해당 대학만 보기 / 다시 클릭: 전체 보기">
            ${iconUrl?`<img src="${iconUrl}" style="width:34px;height:34px;object-fit:contain" onerror="this.parentElement.innerHTML='🏫'">`:'<span style="font-size:22px">🏫</span>'}
          </div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;min-width:0;overflow:hidden">
              <button class="brd-univ-name-btn" style="color:#fff!important;font-weight:900;text-shadow:0 1px 4px rgba(0,0,0,.25);font-size:18px;display:inline-flex;align-items:center;gap:7px;flex-shrink:0" ${forExport?'':(`onclick="event.stopPropagation();toggleBoardUniv('${u.name}')"`)}>
                ${u.name}${(!forExport&&boardSelUniv===u.name)?`<span style="background:rgba(255,255,255,.95);color:${col};border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;box-shadow:0 2px 6px rgba(0,0,0,.2);flex-shrink:0">✓</span>`:''}</button>
              ${(u.championships||0)>0?`<span style="display:flex;gap:1px;flex-shrink:0">${'<span style="font-size:15px">⭐</span>'.repeat(u.championships||0)}</span>`:''}
              ${isLoggedIn&&!forExport?`<input type="text" placeholder="📌 메모..." value="${(u.memo2||'').replace(/"/g,'&quot;')}" style="margin-left:4px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:6px;padding:2px 8px;font-size:12px;color:#fff;outline:none;font-family:inherit;min-width:60px;width:200px;max-width:45%;flex:0 1 auto" oninput="event.stopPropagation();setBoardMemo2('${u.name.replace(/'/g,"\\'")}',this.value)" onclick="event.stopPropagation()">`:(u.memo2?`<span style="margin-left:4px;font-size:12px;color:rgba(255,255,255,.92);font-weight:600;background:rgba(255,255,255,.15);border-radius:6px;padding:2px 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex-shrink:1;max-width:45%">${u.memo2}</span>`:'')}
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,.8);margin-top:3px;display:flex;align-items:center;gap:5px">${cnt}명${u.dissolved?`<span style="background:rgba(0,0,0,.4);font-size:10px;padding:1px 7px;border-radius:10px;color:#fca5a5">🏚️ 해체${u.dissolvedDate?' '+u.dissolvedDate:''}</span>`:''}${isLoggedIn&&u.hidden?`<span style="background:rgba(0,0,0,.4);font-size:10px;padding:1px 7px;border-radius:10px">🚫 방문자 숨김</span>`:''}</div>
          </div>
          ${!forExport?`<div class="no-export" style="display:flex;flex-direction:column;gap:3px;flex-shrink:0">
            ${isLoggedIn?`<div style="display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end">
              <button onclick="event.stopPropagation();boardCardMove('${u.name}','left')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="왼쪽 이동">◀</button>
              <button onclick="event.stopPropagation();boardCardMove('${u.name}','right')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="오른쪽 이동">▶</button>
              <button onclick="event.stopPropagation();toggleBoardHide('${u.name}')" style="background:${u.hidden?'rgba(239,68,68,.55)':'rgba(255,255,255,.18)'};border:1px solid ${u.hidden?'rgba(239,68,68,.8)':'rgba(255,255,255,.35)'};border-radius:5px;color:#fff;font-size:12px;padding:0 7px;height:22px;cursor:pointer" title="${u.hidden?'숨김':'표시'}">${u.hidden?'🚫':'👁️'}</button>
              <label style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:12px;padding:0 7px;height:22px;cursor:pointer;display:flex;align-items:center;position:relative;overflow:hidden" onclick="event.stopPropagation()" title="색상">🎨<input type="color" value="${col}" style="position:absolute;opacity:0;width:100%;height:100%;cursor:pointer;top:0;left:0" onchange="event.stopPropagation();changeBoardUnivColor('${u.name}',this.value)"></label>
              <button onclick="event.stopPropagation();adjustChampionship('${u.name}',1)" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="우승 추가">⭐+</button>
              <button onclick="event.stopPropagation();adjustChampionship('${u.name}',-1)" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="우승 제거">⭐-</button>
              <label style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer;display:flex;align-items:center;gap:2px" onclick="event.stopPropagation()" title="배경 이미지 파일 업로드">🖼️<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){setBoardBgImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${_uNameSafe}')"></label>
              <button onclick="event.stopPropagation();promptBoardBgImgUrl('${_uNameSafe}')" style="background:${u.bgImg&&!u.bgImg.startsWith('data:')?'rgba(99,102,241,.45)':'rgba(255,255,255,.18)'};border:1px solid ${u.bgImg&&!u.bgImg.startsWith('data:')?'rgba(165,180,252,.8)':'rgba(255,255,255,.35)'};border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="배경 이미지 URL 링크">🔗</button>
              ${u.bgImg?`<button onclick="event.stopPropagation();removeBoardBgImg('${_uNameSafe}')" style="background:rgba(239,68,68,.35);border:1px solid rgba(239,68,68,.6);border-radius:5px;color:#fff;font-size:11px;padding:0 7px;height:22px;cursor:pointer" title="배경 제거">🗑️</button>
              <button onclick="event.stopPropagation();setBoardBgImgSize('${_uNameSafe}','${_bgSize==='cover'?'contain':'cover'}')" style="background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);border-radius:5px;color:#fff;font-size:10px;padding:0 6px;height:22px;cursor:pointer" title="${_bgSize==='cover'?'맞추기(contain)':'채우기(cover)'}">${_bgSize==='cover'?'↔맞추기':'⬛채우기'}</button>
              ${_bgPosGrid}`:''}
            </div>`:''}
          </div>`:''}
        </div>
      </div>
      <div class="brd-sep" style="background:${hexToRgba(col,.25)}"></div>
      <div class="brd-body" style="background:${toPastel(col,0.65)};overflow:hidden;position:relative">${_bgOverlay}${(()=>{
        const _memo=u.memo||'';
        const _imgs=(u.memoImgs||[]).length?u.memoImgs:(u.memoImg?[u.memoImg]:[]);
        const _uname=u.name.replace(/'/g,"\\'").replace(/"/g,'&quot;');
        const panelStyle=`border-radius:10px;padding:8px;background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.45);backdrop-filter:blur(8px);box-shadow:0 2px 12px rgba(0,0,0,.1)`;
        // 사이드 패널 (PC only, .brd-side-panel 클래스로 모바일 숨김)
        let sidePanelHtml='';
        if(isLoggedIn&&!forExport){
          const imgList=_imgs.map((src,i)=>`<div style="position:relative;margin-bottom:5px">
            <img src="${src}" style="width:100%;border-radius:7px;display:block" onerror="this.style.display='none'">
            <button onclick="event.stopPropagation();removeBoardMemoImg('${_uname}',${i})" style="position:absolute;top:3px;right:3px;font-size:9px;background:rgba(239,68,68,.75);border:none;border-radius:4px;padding:1px 5px;color:#fff;cursor:pointer">✕</button>
          </div>`).join('');
          sidePanelHtml=`<div class="brd-side-panel no-export" style="${panelStyle}">
            ${imgList}
            <textarea placeholder="📝 사이드 메모..." rows="2" style="width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.55);border-radius:7px;padding:4px 6px;font-size:11px;background:rgba(255,255,255,.45);resize:none;outline:none;font-family:inherit;color:#222;margin-top:${_imgs.length?'2px':'0'}" oninput="event.stopPropagation();setBoardMemo('${_uname}',this.value)" onclick="event.stopPropagation()">${_memo}</textarea>
            <div style="display:flex;gap:4px;margin-top:4px">
              <label style="display:inline-flex;align-items:center;gap:2px;cursor:pointer;font-size:10px;font-weight:700;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.65);border-radius:5px;padding:2px 6px" onclick="event.stopPropagation()" title="파일 업로드">🖼️ 업로드<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){addBoardMemoImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${_uname}')"></label>
              <button onclick="event.stopPropagation();promptBoardMemoImgUrl('${_uname}')" style="display:inline-flex;align-items:center;gap:2px;cursor:pointer;font-size:10px;font-weight:700;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.65);border-radius:5px;padding:2px 6px" title="이미지 URL 링크">🔗 링크</button>
            </div>
          </div>`;
        } else if(!forExport&&(_memo||_imgs.length)){
          const imgList=_imgs.map(src=>`<img src="${src}" style="width:100%;border-radius:7px;margin-bottom:5px;display:block" onerror="this.style.display='none'">`).join('');
          sidePanelHtml=`<div class="brd-side-panel no-export" style="${panelStyle}">${imgList}${_memo?`<div style="font-size:11px;color:#333;white-space:pre-wrap;line-height:1.5;margin-top:${_imgs.length?'4px':'0'}">${_memo}</div>`:''}</div>`;
        }
        // 하단 메모 (bMemo + bMemoImgs 배열)
        const _bnote=u.bMemo||'';
        const _bimgs=(u.bMemoImgs||[]).concat(u.bMemoImg?[u.bMemoImg]:[]);
        let bottomHtml='';
        if(isLoggedIn&&!forExport){
          const imgList=_bimgs.map((src,i)=>`<div style="display:inline-flex;flex-direction:column;gap:3px;margin-right:6px;vertical-align:top">
            <img src="${src}" class="brd-bottom-section-img" style="max-width:130px;max-height:110px;object-fit:contain;border-radius:8px;display:block" onerror="this.style.display='none'">
            <button onclick="event.stopPropagation();removeBoardNoteImg('${_uname}',${i})" style="font-size:10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:5px;padding:2px 6px;color:#dc2626;cursor:pointer">🗑️ 삭제</button>
          </div>`).join('');
          bottomHtml=`<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(0,0,0,.08);display:flex;flex-direction:column;gap:5px">
            ${imgList?`<div style="display:flex;flex-wrap:wrap;gap:4px">${imgList}</div>`:''}
            <textarea placeholder="📋 하단 메모 입력..." rows="2" style="width:100%;box-sizing:border-box;border:1px solid rgba(0,0,0,.12);border-radius:7px;padding:5px 8px;font-size:11px;background:rgba(255,255,255,.55);resize:none;outline:none;font-family:inherit;color:#222" oninput="event.stopPropagation();setBoardNote('${_uname}',this.value)" onclick="event.stopPropagation()">${_bnote}</textarea>
            <div style="display:flex;gap:5px;align-items:center">
              <label style="display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;font-weight:700;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.12);border-radius:6px;padding:3px 8px" onclick="event.stopPropagation()" title="파일 업로드">🖼️ 업로드<input type="file" accept="image/*" style="display:none" onchange="event.stopPropagation();(function(f,n){if(!f)return;const r=new FileReader();r.onload=function(e){addBoardNoteImg(n,e.target.result);};r.readAsDataURL(f);})(this.files[0],'${_uname}')"></label>
              <button onclick="event.stopPropagation();promptBoardNoteImgUrl('${_uname}')" style="display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;font-weight:700;background:rgba(255,255,255,.7);border:1px solid rgba(0,0,0,.12);border-radius:6px;padding:3px 8px" title="이미지 URL 링크">🔗 링크</button>
            </div>
          </div>`;
        } else if(_bnote||_bimgs.length){
          const imgList=_bimgs.map(src=>`<img src="${src}" class="brd-bottom-section-img" style="max-width:130px;max-height:110px;object-fit:contain;border-radius:8px;display:block" onerror="this.style.display='none'">`).join('');
          bottomHtml=`<div style="margin-top:8px;padding:8px;border-radius:8px;background:rgba(255,255,255,.35)">${imgList?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:${_bnote?'6px':'0'}">${imgList}</div>`:''}${_bnote?`<div style="font-size:12px;color:#333;white-space:pre-wrap;line-height:1.6">${_bnote}</div>`:''}</div>`;
        }
        const mainLayout=`<div style="overflow:hidden">${sidePanelHtml}${roleSection}${tierRows}</div>`;
        return `<div style="position:relative;z-index:1">${mainLayout}${bottomHtml}</div>`;
      })()}</div>
    </div>`;
  };

  // 항상 칩 레이아웃 사용 (무소속은 wide)
  return buildChipLayout(u.name==='무소속');
}

function _brdToast(msg, duration=2800){
  const existing = document.getElementById('brd-toast');
  if(existing) existing.remove();
  const el = document.createElement('div');
  el.id = 'brd-toast';
  el.textContent = msg;
  el.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#1e293b;color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,.3);opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;font-family:\'Noto Sans KR\',sans-serif;';
  document.body.appendChild(el);
  requestAnimationFrame(()=>{
    el.style.opacity='1'; el.style.transform='translateX(-50%) translateY(0)';
  });
  setTimeout(()=>{
    el.style.opacity='0'; el.style.transform='translateX(-50%) translateY(10px)';
    setTimeout(()=>el.remove(), 300);
  }, duration);
}

/* ── 선수 이동 팝업 ── */
let _brdPopup = null;
let _brdPopupListenerAdded = false;
function _closeBrdPopup(e){
  if(!_brdPopup) return;
  if(!_brdPopup.contains(e.target)){
    _brdClose();
  }
}
// 중앙화된 팝업 닫기 - 딤 오버레이 포함 항상 정리
function _brdClose(){
  if(_brdPopup){ _brdPopup.remove(); _brdPopup=null; }
  const dim=document.getElementById('brd-popup-dim');
  if(dim) dim.remove();
}

// 칩 전용 팝업 (무소속 등 칩 레이아웃) - 위/아래 이동 대신 대학이동 위주
function openBrdPlayerPopupFromChip(e, playerName, univName, idx, total){
  if(!isLoggedIn){ openPlayerModal(playerName); return; }
  e.stopPropagation();
  _brdClose();
  const allUnivs = _getBoardUnivs();
  const p = players.find(x=>x.name===playerName);
  if(!p) return;

  const popup = document.createElement('div');
  popup.className = 'brd-move-popup';
  _brdPopup = popup;

  const otherUnivs = allUnivs.filter(u=>u.name!==univName&&!u.dissolved);
  const univOpts = otherUnivs.map(u=>`<option value="${u.name}">${u.name}</option>`).join('');
  const _pnSafeChip = playerName.replace(/[^a-zA-Z0-9가-힣]/g,'');

  popup.innerHTML = `
    <div class="brd-move-popup-title">👤 ${playerName} <span style="font-size:10px;font-weight:400">(${univName})</span></div>
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px;font-size:11px;font-weight:700;color:var(--text3)">🏷️ 직책 수정</div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;padding:0 6px 4px">
      ${['이사장','총장','부총장','총괄','교수','코치'].map(r=>`<button class="btn btn-xs ${p.role===r?'btn-b':'btn-w'}" onclick="setBrdRole('${playerName}','${r}')" style="font-size:10px">${r}</button>`).join('')}
      <button class="btn btn-xs btn-w" onclick="setBrdRole('${playerName}','')" style="font-size:10px;color:#dc2626">해제</button>
    </div>
    <div style="display:flex;gap:4px;padding:0 6px 4px;align-items:center">
      <input id="brd-role-chip-${_pnSafeChip}" type="text" placeholder="직접 입력..." style="flex:1;padding:4px 7px;border-radius:6px;border:1px solid var(--border2);font-size:11px">
      <button class="btn btn-b btn-xs" onclick="(function(){const inp=document.getElementById('brd-role-chip-${_pnSafeChip}');if(inp&&inp.value.trim())setBrdRole('${playerName}',inp.value.trim())})()">설정</button>
    </div>
    ${univName!=='무소속'?`<button onclick="const p=players.find(x=>x.name==='${playerName}');if(p){const from=p.univ;p.univ='무소속';if(boardPlayerOrder[from])boardPlayerOrder[from]=boardPlayerOrder[from].filter(n=>n!=='${playerName}');save();_brdClose();_refreshBoardCard(from);_refreshBoardCard('무소속');_brdToast('🚶 무소속으로 이동 완료');}" style="width:calc(100% - 12px);margin:0 6px 6px;padding:5px;border-radius:6px;border:1.5px solid #cbd5e1;background:#f8fafc;font-size:11px;font-weight:700;cursor:pointer;color:#475569">🚶 무소속으로 이동</button>`:``}
    <div class="brd-move-popup-sep"></div>
    <div style="padding:4px 6px 6px;font-size:11px;font-weight:700;color:var(--text3)">🏫 다른 대학으로 이동</div>
    <div style="display:flex;gap:6px;padding:0 6px 6px">
      <select id="brd-chip-univ-target" style="flex:1;padding:5px 8px;border-radius:7px;border:1px solid var(--border2);font-size:12px;background:var(--white)">${univOpts||'<option disabled>대학 없음</option>'}</select>
      <button class="btn btn-b btn-xs" onclick="boardTransferPlayerFromChip('${playerName}','${univName}')">이동</button>
    </div>
    <div class="brd-move-popup-sep"></div>
    <button class="brd-move-popup-btn" onclick="_brdClose();openPlayerModal('${playerName}')">📋 스트리머 상세 보기</button>
  `;

  document.body.appendChild(popup);
  const isMobChip = window.innerWidth <= 768;
  if(isMobChip){
    const dim = document.createElement('div');
    dim.id = 'brd-popup-dim';
    dim.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:4999;backdrop-filter:blur(2px)';
    dim.onclick = () => { dim.remove(); _brdClose(); };
    document.body.insertBefore(dim, popup);
    popup.style.zIndex = '5000';
  } else {
  const targetEl = e.target.closest('.brd-chip');
  const rect = targetEl?.getBoundingClientRect() || {left:e.clientX, top:e.clientY, width:0, height:0};
  let left = rect.right + 6;
  let top = rect.top;
  const pw=240, ph=300;
  if(left + pw > window.innerWidth) left = rect.left - pw - 6;
  if(top + ph > window.innerHeight) top = window.innerHeight - ph - 10;
  if(top < 8) top = 8;
  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
  }
}

function boardTransferPlayerFromChip(playerName, fromUniv){
  if(!isLoggedIn){ alert('관리자만 이동할 수 있습니다.'); return; }
  const sel = document.getElementById('brd-chip-univ-target');
  const toUniv = sel?.value;
  if(!toUniv || toUniv===fromUniv){ alert('이동할 대학을 선택하세요.'); return; }
  _brdClose();
  const p = players.find(x=>x.name===playerName);
  if(!p) return;
  if(!confirm(`"${playerName}"을(를) "${fromUniv}" → "${toUniv}"로 이동하시겠습니까?`)) return;
  p.univ = toUniv;
  if(boardPlayerOrder[fromUniv]){
    boardPlayerOrder[fromUniv] = boardPlayerOrder[fromUniv].filter(n=>n!==playerName);
  }
  save(); saveBoardPlayerOrder();
  _refreshBoardCard(fromUniv);
  _refreshBoardCard(toUniv);
  _brdToast(`✅ "${playerName}" → "${toUniv}" 이동 완료`);
}

function openBrdPlayerPopup(e, playerName, univName, idx, total){
  // 비관리자는 팝업 없이 스트리머 상세 바로 열기
  if(!isLoggedIn){ openPlayerModal(playerName); return; }

  e.stopPropagation();
  _brdClose();
  const allUnivs = _getBoardUnivs();
  const p = players.find(x=>x.name===playerName);
  if(!p) return;

  const popup = document.createElement('div');
  popup.className = 'brd-move-popup';
  _brdPopup = popup;

  const otherUnivs = allUnivs.filter(u=>u.name!==univName&&!u.dissolved);
  const univOpts = otherUnivs.map(u=>`<option value="${u.name}">${u.name}</option>`).join('');

  const _pnSafe = playerName.replace(/[^a-zA-Z0-9가-힣]/g,'');
  const _curIcon = getStatusIcon(playerName);
  popup.innerHTML = `
    <div style="padding:8px 10px 6px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:6px">
      <div style="font-size:12px;font-weight:800;color:var(--text)">👤 ${playerName} <span style="font-size:10px;font-weight:500;color:var(--text3)">(${univName})</span></div>
      <button onclick="_brdClose()" style="background:none;border:none;color:var(--gray-l);font-size:14px;cursor:pointer;padding:0 2px;line-height:1">✕</button>
    </div>
    <div style="display:flex;gap:4px;padding:6px 8px;border-bottom:1px solid var(--border)">
      <button onclick="boardMovePlayer('${playerName}','${univName}','top')" title="맨 위로" ${idx===0?'disabled':''} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx===0?'.3':'1'}">⬆️</button>
      <button onclick="boardMovePlayer('${playerName}','${univName}','up')" title="위로" ${idx===0?'disabled':''} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx===0?'.3':'1'}">🔼</button>
      <button onclick="boardMovePlayer('${playerName}','${univName}','down')" title="아래로" ${idx>=total-1?'disabled':''} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx>=total-1?'.3':'1'}">🔽</button>
      <button onclick="boardMovePlayer('${playerName}','${univName}','bottom')" title="맨 아래로" ${idx>=total-1?'disabled':''} style="flex:1;padding:4px;border-radius:6px;border:1px solid var(--border2);background:var(--surface);font-size:16px;cursor:pointer;opacity:${idx>=total-1?'.3':'1'}">⬇️</button>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🏷️ 직책</div>
      <div style="display:flex;gap:3px;flex-wrap:wrap">
        ${['이사장','총장','총괄','교수','코치'].map(r=>`<button class="btn btn-xs ${p.role===r?'btn-b':'btn-w'}" onclick="setBrdRole('${playerName}','${r}')" style="font-size:10px;padding:2px 7px">${r}</button>`).join('')}
        <button class="btn btn-xs btn-w" onclick="setBrdRole('${playerName}','')" style="font-size:10px;padding:2px 7px;color:#dc2626">해제</button>
      </div>
      <div style="display:flex;gap:4px;margin-top:4px">
        <input id="brd-role-custom-${_pnSafe}" type="text" placeholder="직접 입력..." style="flex:1;padding:3px 7px;border-radius:6px;border:1px solid var(--border2);font-size:11px">
        <button class="btn btn-b btn-xs" onclick="(function(){const inp=document.getElementById('brd-role-custom-${_pnSafe}');if(inp&&inp.value.trim())setBrdRole('${playerName}',inp.value.trim())})()" style="font-size:11px">설정</button>
      </div>
      ${univName!=='무소속'?`<button onclick="const p=players.find(x=>x.name==='${playerName}');if(p){const from=p.univ;p.univ='무소속';if(boardPlayerOrder[from])boardPlayerOrder[from]=boardPlayerOrder[from].filter(n=>n!=='${playerName}');save();_brdClose();_refreshBoardCard(from);_refreshBoardCard('무소속');_brdToast('🚶 무소속으로 이동 완료');}" style="width:100%;margin-top:5px;padding:4px;border-radius:6px;border:1.5px solid #cbd5e1;background:#f8fafc;font-size:11px;font-weight:700;cursor:pointer;color:#475569">🚶 무소속으로 이동</button>`:''}
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🎭 상태 아이콘</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px" id="brd-icon-grid-${_pnSafe}">
        ${Object.entries(STATUS_ICON_DEFS).map(([id,d])=>{const sel=(id==='none'&&!_curIcon)||(d.emoji&&_curIcon===d.emoji);return `<button type="button" title="${d.label}" onclick="setBrdStatusIcon(this,'${playerName}','${id}')" data-icon-id="${id}" style="padding:3px 6px;border-radius:5px;border:2px solid ${sel?'#16a34a':'var(--border)'};background:${sel?'#dcfce7':'var(--white)'};cursor:pointer;font-size:${id==='none'?'10px':'13px'};min-width:28px;transition:.1s">${d.emoji||'<span style="font-size:10px">없음</span>'}</button>`;}).join('')}
      </div>
    </div>
    <div style="padding:5px 8px;border-bottom:1px solid var(--border)">
      <div style="font-size:10px;font-weight:700;color:var(--text3);margin-bottom:4px">🏫 대학 이동</div>
      <div style="display:flex;gap:4px">
        <select id="brd-univ-target" style="flex:1;padding:4px 8px;border-radius:6px;border:1px solid var(--border2);font-size:12px;background:var(--white)">${univOpts||'<option disabled>대학 없음</option>'}</select>
        <button class="btn btn-b btn-xs" onclick="boardTransferPlayer('${playerName}','${univName}')">이동</button>
      </div>
    </div>
    <div style="display:flex;gap:4px;padding:6px 8px">
      <button style="flex:1;padding:6px;border-radius:7px;border:none;background:#2563eb;color:#fff;font-size:11px;font-weight:800;cursor:pointer;font-family:'Noto Sans KR',sans-serif" onclick="_brdClose();_refreshBoardCard('${univName}');save();_brdToast('✅ 저장 완료')">💾 저장</button>
      <button style="flex:1;padding:6px;border-radius:7px;border:1px solid var(--border2);background:var(--surface);color:var(--text);font-size:11px;font-weight:600;cursor:pointer;font-family:'Noto Sans KR',sans-serif" onclick="_brdClose();openPlayerModal('${playerName}')">📋 상세</button>
    </div>
  `;

  document.body.appendChild(popup);

  // 모바일에서는 딤 오버레이 + 하단 시트, PC에서는 기존 위치 계산
  const isMob = window.innerWidth <= 768;
  if(isMob){
    // 딤 오버레이 생성
    const dim = document.createElement('div');
    dim.id = 'brd-popup-dim';
    dim.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:4999;backdrop-filter:blur(2px)';
    dim.onclick = () => { dim.remove(); _brdClose(); };
    document.body.insertBefore(dim, popup);
    popup.style.zIndex = '5000';
  } else {
  // 위치 계산 - 클릭 대상이 brd-row 또는 brd-chip 어느 것이든 처리
  const targetEl = e.target.closest('.brd-row, .brd-chip');
  const rect = targetEl?.getBoundingClientRect() || {left:e.clientX, top:e.clientY, width:0, height:0};
  let left = rect.left + rect.width + 6;
  let top = rect.top;
  const pw=256, ph=420;
  if(left + pw > window.innerWidth) left = rect.left - pw - 6;
  if(top + ph > window.innerHeight) top = window.innerHeight - ph - 10;
  if(top < 8) top = 8;
  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
  }
}

function setBrdRole(playerName, role){
  const p=players.find(x=>x.name===playerName);
  if(!p)return;
  p.role=role||undefined;
  // 직책 변경 시 해당 대학의 수동 순서 초기화 → 직책 기준 자동 정렬
  if(boardPlayerOrder[p.univ]){
    delete boardPlayerOrder[p.univ];
    saveBoardPlayerOrder();
  }
  save();
  _brdClose();
  _refreshBoardCard(p.univ);
}
function setBrdStatusIcon(btn, playerName, iconId){
  setStatusIcon(playerName, iconId);
  const grid = btn.closest('[id^="brd-icon-grid-"]');
  if(grid){
    grid.querySelectorAll('button[data-icon-id]').forEach(b=>{
      const sel = b.dataset.iconId === iconId;
      b.style.border = '2px solid '+(sel?'#16a34a':'var(--border)');
      b.style.background = sel?'#dcfce7':'var(--white)';
    });
  }
  const p = players.find(x=>x.name===playerName);
  if(p) _refreshBoardCard(p.univ);
}

function boardMovePlayer(playerName, univName, dir){
  if(!isLoggedIn) return;
  _brdClose();
  const sorted = _getBoardPlayers(univName);
  const idx = sorted.findIndex(p=>p.name===playerName);
  if(idx < 0) return;
  const order = sorted.map(p=>p.name);
  let ni = idx;
  if(dir==='up') ni = Math.max(0, idx-1);
  else if(dir==='down') ni = Math.min(order.length-1, idx+1);
  else if(dir==='top') ni = 0;
  else if(dir==='bottom') ni = order.length-1;
  if(ni===idx) return;
  order.splice(idx,1);
  order.splice(ni,0,playerName);
  boardPlayerOrder[univName] = order;
  saveBoardPlayerOrder();
  // 해당 카드만 다시 렌더
  _refreshBoardCard(univName);
}

function boardTransferPlayer(playerName, fromUniv){
  if(!isLoggedIn){ alert('관리자만 이동할 수 있습니다.'); return; }
  const sel = document.getElementById('brd-univ-target');
  const toUniv = sel?.value;
  if(!toUniv || toUniv===fromUniv){ alert('이동할 대학을 선택하세요.'); return; }
  _brdClose();
  const p = players.find(x=>x.name===playerName);
  if(!p) return;
  if(!confirm(`"${playerName}"을(를) "${fromUniv}" → "${toUniv}"로 이동하시겠습니까?\n\n스트리머 목록·티어 순위표·스트리머 상세·대학 상세가 모두 자동 반영됩니다.`)) return;

  // 실제 데이터 변경
  p.univ = toUniv;

  // boardPlayerOrder에서 제거
  if(boardPlayerOrder[fromUniv]){
    boardPlayerOrder[fromUniv] = boardPlayerOrder[fromUniv].filter(n=>n!==playerName);
  }

  // 저장
  save();
  saveBoardPlayerOrder();

  // 현황판 두 카드 즉시 갱신
  _refreshBoardCard(fromUniv);
  _refreshBoardCard(toUniv);

  // 현재 열린 스트리머 상세 모달이 해당 선수면 갱신
  const pm = document.getElementById('playerModal');
  if(pm && pm.style.display !== 'none'){
    const nameEl = pm.querySelector('.brd-univ-name-btn, [data-player-name]');
    // 모달 타이틀에 선수 이름이 있으면 갱신
    if(pm.innerHTML && pm.innerHTML.includes(playerName)){
      openPlayerModal(playerName);
    }
  }

  // 성공 토스트
  _brdToast(`✅ "${playerName}" → "${toUniv}" 이동 완료`);
}

function _refreshBoardCard(univName){
  const wrap = document.getElementById('board-wrap');
  if(!wrap){ render(); return; }
  const u = getAllUnivs().find(x=>x.name===univName);
  const existing = wrap.querySelector(`.brd-card[data-univ="${univName}"]`);
  // 해당 대학에 선수가 없으면 카드 제거
  if(!u || !players.some(p=>p.univ===univName)){
    if(existing) existing.remove();
    return;
  }
  const newHtml = buildUnivBoardCard(u);
  if(!newHtml){
    if(existing) existing.remove();
    return;
  }
  const tmp = document.createElement('div');
  tmp.innerHTML = newHtml;
  const newCard = tmp.firstElementChild;
  if(existing) existing.replaceWith(newCard);
  else wrap.appendChild(newCard);
  injectUnivIcons(newCard);
  // 새 카드에 드래그 이벤트 재등록
  initBoardDragCard(newCard, wrap);
  // 플레이어 행 드래그 재등록 (관리자만)
  if(isLoggedIn) newCard.querySelectorAll('.brd-body').forEach(body=>initBoardPlayerDrag(body));
}

/* ── 카드 클릭 순서 이동 ── */
function boardCardMove(univName, dir){
  if(!isLoggedIn) return;
  const wrap = document.getElementById('board-wrap');
  if(!wrap) return;
  const cards = [...wrap.querySelectorAll('.brd-card')];
  const idx = cards.findIndex(c => c.dataset.univ === univName);
  if(idx < 0) return;
  let newIdx;
  if(dir === 'left')  newIdx = idx - 1;
  else                newIdx = idx + 1;
  if(newIdx < 0 || newIdx >= cards.length) return;
  const target = cards[newIdx];
  if(dir === 'left') target.before(cards[idx]);
  else               target.after(cards[idx]);
  // 순서 저장
  boardOrder = [...wrap.querySelectorAll('.brd-card')].map(c => c.dataset.univ);
  save();
  syncBoardOrderToUnivCfg();
  // 이동된 카드 잠깐 하이라이트
  cards[idx].style.outline = '3px solid rgba(255,255,255,.9)';
  setTimeout(() => { cards[idx].style.outline = ''; }, 500);
}


/* ── 카드 드래그 앤 드롭 ── */
function initBoardDrag(){
  const wrap=document.getElementById('board-wrap');
  if(!wrap)return;
  wrap.querySelectorAll('.brd-card').forEach(card=>initBoardDragCard(card, wrap));
  // 플레이어 행 드래그: 관리자만
  if(isLoggedIn) wrap.querySelectorAll('.brd-body').forEach(body=>initBoardPlayerDrag(body));
}

let _brdDragSrc = null;
let _brdRowDragSrc = null; // 플레이어 행 드래그 소스

function initBoardDragCard(card, wrap){
  // dragstart/dragend는 이제 brd-hdr 인라인 핸들러로 처리
  // dragover/drop만 카드 레벨에서 처리
  card.addEventListener('dragover',e=>{
    if(_brdRowDragSrc) return; // 플레이어 행 드래그 중이면 카드 이동 무시
    if(!_brdDragSrc) return;
    e.preventDefault();
    e.dataTransfer.dropEffect='move';
    if(_brdDragSrc!==card){
      wrap.querySelectorAll('.brd-card').forEach(c=>c.classList.remove('drag-over'));
      card.classList.add('drag-over');
    }
  });
  card.addEventListener('dragleave',e=>{
    if(!e.currentTarget.contains(e.relatedTarget)) card.classList.remove('drag-over');
  });
  card.addEventListener('drop',e=>{
    if(_brdRowDragSrc) return;
    e.preventDefault();
    if(_brdDragSrc&&_brdDragSrc!==card){
      const cards=[...wrap.querySelectorAll('.brd-card')];
      const si=cards.indexOf(_brdDragSrc), di=cards.indexOf(card);
      if(si<di) card.after(_brdDragSrc); else card.before(_brdDragSrc);
    }
    card.classList.remove('drag-over');
  });
}

/* ── 플레이어 행 드래그 앤 드롭 (스트리머 네모박스 순서 변경 + 대학 간 이동) ── */
function initBoardPlayerDrag(body){
  if(!isLoggedIn) return; // 관리자만

  const getUnivName = ()=> body.closest('.brd-card')?.dataset?.univ || '';

  // brd-body 자체에도 dragover/drop 등록 → 다른 대학 카드의 body 위로 드롭 지원
  body.addEventListener('dragover', e=>{
    if(!_brdRowDragSrc) return;
    e.preventDefault(); e.stopPropagation();
    e.dataTransfer.dropEffect='move';
    body.style.outline='2px dashed rgba(255,255,255,.6)';
  });
  body.addEventListener('dragleave', e=>{
    if(!body.contains(e.relatedTarget)) body.style.outline='';
  });
  body.addEventListener('drop', e=>{
    body.style.outline='';
    if(!_brdRowDragSrc) return;
    const targetUniv = getUnivName();
    const srcUniv = _brdRowDragSrc.dataset.univ;
    const playerName = _brdRowDragSrc.dataset.player;
    // 같은 카드 내 드롭은 row 레벨에서 처리됨 → 여기서는 다른 대학 카드로 이동만 처리
    if(targetUniv && targetUniv !== srcUniv){
      e.preventDefault(); e.stopPropagation();
      if(!confirm(`"${playerName}"을(를) "${srcUniv}" → "${targetUniv}"로 이동하시겠습니까?`)) return;
      const p = players.find(x=>x.name===playerName);
      if(!p) return;
      p.univ = targetUniv;
      if(boardPlayerOrder[srcUniv]){
        boardPlayerOrder[srcUniv] = boardPlayerOrder[srcUniv].filter(n=>n!==playerName);
      }
      save();
      saveBoardPlayerOrder();
      _refreshBoardCard(srcUniv);
      _refreshBoardCard(targetUniv);
      _brdToast(`✅ "${playerName}" → "${targetUniv}" 이동 완료`);
    }
  });

  // brd-row(일반 카드) + brd-chip(칩 레이아웃) 둘 다 드래그 등록
  body.querySelectorAll('.brd-row[data-player], .brd-chip[data-player]').forEach(row=>{
    row.addEventListener('dragstart',e=>{
      e.stopPropagation();
      _brdRowDragSrc=row;
      row.style.opacity='.45';
      e.dataTransfer.effectAllowed='move';
      e.dataTransfer.setData('text/player', row.dataset.player+'|'+row.dataset.univ);
    });
    row.addEventListener('dragend',e=>{
      row.style.opacity='';
      document.querySelectorAll('.brd-row, .brd-chip').forEach(r=>r.style.outline='');
      document.querySelectorAll('.brd-body').forEach(b=>b.style.outline='');
      _brdRowDragSrc=null;
    });
    row.addEventListener('dragover',e=>{
      if(!_brdRowDragSrc) return;
      e.preventDefault(); e.stopPropagation();
      e.dataTransfer.dropEffect='move';
      if(_brdRowDragSrc!==row){
        body.querySelectorAll('.brd-row, .brd-chip').forEach(r=>r.style.outline='');
        row.style.outline='2px solid rgba(255,255,255,.85)';
      }
    });
    row.addEventListener('dragleave',e=>{ row.style.outline=''; });
    row.addEventListener('drop',e=>{
      e.preventDefault(); e.stopPropagation();
      row.style.outline='';
      if(!_brdRowDragSrc||_brdRowDragSrc===row) return;
      const targetUniv = row.dataset.univ;
      const srcUniv = _brdRowDragSrc.dataset.univ;
      if(targetUniv !== srcUniv){
        const playerName = _brdRowDragSrc.dataset.player;
        if(!confirm(`"${playerName}"을(를) "${srcUniv}" → "${targetUniv}"로 이동하시겠습니까?`)) return;
        const p = players.find(x=>x.name===playerName);
        if(!p) return;
        p.univ = targetUniv;
        if(boardPlayerOrder[srcUniv]){
          boardPlayerOrder[srcUniv] = boardPlayerOrder[srcUniv].filter(n=>n!==playerName);
        }
        const ti2 = (boardPlayerOrder[targetUniv]||[]).indexOf(row.dataset.player);
        if(!boardPlayerOrder[targetUniv]) boardPlayerOrder[targetUniv] = _getBoardPlayers(targetUniv).map(p=>p.name);
        if(ti2>=0) boardPlayerOrder[targetUniv].splice(ti2,0,playerName);
        else boardPlayerOrder[targetUniv].push(playerName);
        save(); saveBoardPlayerOrder();
        _refreshBoardCard(srcUniv); _refreshBoardCard(targetUniv);
        _brdToast(`✅ "${playerName}" → "${targetUniv}" 이동 완료`);
        return;
      }
      // 같은 대학 내 순서 변경 (칩은 flex wrap이라 DOM 순서 변경이 시각적으로 반영됨)
      const allItems = [...body.querySelectorAll('.brd-row[data-player], .brd-chip[data-player]')];
      const si=allItems.indexOf(_brdRowDragSrc), di=allItems.indexOf(row);
      if(si>=0 && di>=0 && si!==di){
        if(si<di) row.after(_brdRowDragSrc); else row.before(_brdRowDragSrc);
        const newOrder=[...body.querySelectorAll('.brd-row[data-player], .brd-chip[data-player]')].map(r=>r.dataset.player);
        boardPlayerOrder[targetUniv]=newOrder;
        saveBoardPlayerOrder();
      }
    });
  });
}

// ── 외부 img를 data URL로 변환 (CORS 지원 이미지만, 실패/타임아웃 시 숨김) ──
async function _imgToDataUrls(container, timeoutMs=4000) {
  const imgs = [...container.querySelectorAll('img')];
  await Promise.all(imgs.map(img => new Promise(resolve => {
    const src = img.getAttribute('src') || '';
    // data URL / blob URL은 이미 안전
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) { resolve(); return; }
    const _hide = () => { img.style.display = 'none'; img.removeAttribute('src'); };
    // 전체 타임아웃: 직접+프록시 합산 timeoutMs 내에 완료 안되면 숨김 처리
    let _resolved = false;
    const _resolve = () => { if(!_resolved){ _resolved=true; resolve(); } };
    const _timer = setTimeout(() => { _hide(); _resolve(); }, timeoutMs);
    const loader = new Image();
    loader.crossOrigin = 'anonymous';
    loader.onload = () => {
      clearTimeout(_timer);
      // naturalWidth/Height이 0이면 drawImage 자체가 에러 상태 유발 → 즉시 숨김
      if (loader.naturalWidth > 0 && loader.naturalHeight > 0) {
        try {
          const cv = document.createElement('canvas');
          cv.width  = loader.naturalWidth;
          cv.height = loader.naturalHeight;
          const ctx2d = cv.getContext('2d');
          ctx2d.drawImage(loader, 0, 0);
          img.src = cv.toDataURL('image/png'); // 성공: data URL로 교체
        } catch { _hide(); }
      } else { _hide(); }
      _resolve();
    };
    loader.onerror = () => {
      // CORS 프록시로 재시도 (Discord CDN 등 CORS 미지원 이미지 대응)
      const proxy = 'https://images.weserv.nl/?url=' + encodeURIComponent(src) + '&n=-1';
      const fb = new Image();
      fb.crossOrigin = 'anonymous';
      fb.onload = () => {
        clearTimeout(_timer);
        if (fb.naturalWidth > 0 && fb.naturalHeight > 0) {
          try {
            const cv2 = document.createElement('canvas');
            cv2.width = fb.naturalWidth; cv2.height = fb.naturalHeight;
            const ctx2d2 = cv2.getContext('2d');
            ctx2d2.drawImage(fb, 0, 0);
            img.src = cv2.toDataURL('image/png');
          } catch { _hide(); }
        } else { _hide(); }
        _resolve();
      };
      fb.onerror = () => { clearTimeout(_timer); _hide(); _resolve(); };
      fb.src = proxy;
    };
    // 캐시 우회: 쿼리스트링 추가로 CORS 헤더 포함 재요청 강제
    loader.src = src + (src.includes('?') ? '&_x=' : '?_x=') + Date.now();
  })));
}

// ── canvas → PNG 다운로드 (toBlob+ObjectURL 방식: 대용량 PNG에 안정적) ──
function _dlCanvasBoard(canvas, filename) {
  if (!canvas || canvas.width === 0 || canvas.height === 0) {
    alert('이미지 생성 실패: 캔버스가 비어있습니다. 다시 시도해주세요.');
    return;
  }
  const pngName = filename.replace(/\.jpg$/i, '.png');
  canvas.toBlob(blob => {
    if (!blob) {
      // 폴백: toDataURL 방식
      try {
        const dataUrl = canvas.toDataURL('image/png');
        if (!dataUrl || dataUrl === 'data:,') { alert('이미지 저장 실패: 빈 이미지입니다.'); return; }
        const a = document.createElement('a');
        a.href = dataUrl; a.download = pngName;
        document.body.appendChild(a); a.click();
        setTimeout(() => document.body.removeChild(a), 300);
      } catch(e) { alert('이미지 저장 실패: ' + e.message); }
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = pngName;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 500);
  }, 'image/png');
}

// ── html2canvas 캡처 후 저장 ──────────────────────────────────────
async function _captureAndSave(tmpDiv, w, h, filename) {
  // 모든 외부 img를 data URL로 변환 → html2canvas canvas taint 방지
  await _imgToDataUrls(tmpDiv);

  // 다크모드 CSS(body.dark .brd-card filter 등)가 export에 적용되지 않도록 일시 해제
  const wasDark = document.body.classList.contains('dark');
  if (wasDark) document.body.classList.remove('dark');

  try {
    // 브라우저 canvas 최대 크기(~16384px) 초과 방지 → 동적 scale 계산
    const MAX_DIM = 16000;
    const safeScale = Math.max(1, Math.min(2, Math.floor(MAX_DIM / Math.max(w, h))));
    const canvas = await html2canvas(tmpDiv, {
      scale: safeScale, useCORS: false, allowTaint: false,
      backgroundColor: '#f0f2f5', logging: false,
      imageTimeout: 20000,
      width: w, height: h,
      windowWidth: w + 100, windowHeight: h + 100,
      x: 0, y: 0, scrollX: 0, scrollY: 0
    });
    if (!canvas || canvas.width === 0 || canvas.height === 0) throw new Error('캔버스 생성 실패');
    _dlCanvasBoard(canvas, filename);
  } finally {
    // 다크모드 클래스 복원
    if (wasDark) document.body.classList.add('dark');
  }
}

// 전체저장: board-wrap 클론 후 단일 캡처 (카운터 없음)
async function downloadBoardAll(){
  const btn=event?.currentTarget;
  if(btn){btn.disabled=true;btn._ot=btn.textContent;btn.textContent='⏳...';}
  const tmpDiv=document.createElement('div');
  try{
    const boardWrap=document.getElementById('board-wrap');
    if(!boardWrap||!boardWrap.children.length){alert('표시 중인 현황판이 없습니다.');return;}
    const bw=boardWrap.scrollWidth||900;
    tmpDiv.style.cssText=`position:absolute;left:-9999px;top:0;width:${bw}px;background:#f0f2f5;font-family:'Noto Sans KR',sans-serif;box-sizing:border-box;`;
    // rcont의 <style> 블록도 클론에 포함 (brd-card 등 현황판 전용 스타일)
    const rcont=document.getElementById('rcont');
    const brdStyle=rcont?rcont.querySelector('style'):null;
    tmpDiv.innerHTML=(brdStyle?brdStyle.outerHTML:'')+boardWrap.innerHTML;
    tmpDiv.querySelectorAll('.no-export,.no-export-movebtns').forEach(el=>el.remove());
    // 숨김 대학 카드 제거 (이미지 저장 시 항상 제외)
    tmpDiv.querySelectorAll('.brd-card').forEach(card=>{
      const uObj=univCfg.find(x=>x.name===card.dataset.univ);
      if(uObj&&uObj.hidden)card.remove();
    });
    document.body.appendChild(tmpDiv);
    await new Promise(r=>setTimeout(r,300));

    await _imgToDataUrls(tmpDiv,3000);
    tmpDiv.querySelectorAll('img').forEach(im=>{
      const s=im.getAttribute('src')||'';
      if(!s||(!s.startsWith('data:')&&!s.startsWith('blob:')))im.parentNode&&im.parentNode.removeChild(im);
    });

    const wasDark=document.body.classList.contains('dark');
    if(wasDark)document.body.classList.remove('dark');
    try{
      const w=tmpDiv.scrollWidth||bw;
      const h=Math.max(tmpDiv.scrollHeight,tmpDiv.offsetHeight,200);
      // 브라우저 canvas 최대 크기(~16384px) 초과 방지 → 동적 scale 계산
      const MAX_DIM=16000;
      const safeScale=Math.max(1,Math.min(2,Math.floor(MAX_DIM/Math.max(w,h))));
      const canvas=await html2canvas(tmpDiv,{
        scale:safeScale,useCORS:false,allowTaint:false,
        backgroundColor:'#f0f2f5',logging:false,imageTimeout:5000,
        width:w,height:h,windowWidth:w+200,windowHeight:h+200
      });
      if(!canvas||canvas.width===0||canvas.height===0)throw new Error('캔버스 생성 실패');
      _dlCanvasBoard(canvas,'현황판_전체저장.png');
    }finally{if(wasDark)document.body.classList.add('dark');}
  }catch(e){alert('다운로드 실패: '+e.message);}
  finally{
    if(tmpDiv.parentNode)document.body.removeChild(tmpDiv);
    if(btn){btn.disabled=false;btn.textContent=btn._ot||btn.textContent;}
  }
}

// 포인트 순 전체 랭킹 뷰
function buildBoardRankViewHTML(univs){
  // 전체 선수 포인트 순 정렬
  const univNames=new Set(univs.map(u=>u.name));
  const allPlayers=(players||[]).filter(p=>p.univ&&univNames.has(p.univ)&&(p.win||0)+(p.loss||0)>0)
    .map(p=>({...p,_univ:p.univ,_col:gc(p.univ)}));
  allPlayers.sort((a,b)=>(b.points||0)-(a.points||0));
  if(!allPlayers.length) return `<div style="padding:40px;text-align:center;color:var(--gray-l)">선수 없음</div>`;
  const TIER_ICONS={'G':'👑','K':'🌟','JA':'⚡','J':'🔥','S':'💎','0티어':'⭐','1티어':'🥇','2티어':'🥈','3티어':'🥉'};
  let h=`<div style="background:var(--white);border-radius:14px;border:1px solid var(--border);overflow:hidden">
    <div style="padding:14px 18px;font-weight:900;font-size:15px;color:var(--blue);border-bottom:2px solid var(--blue-ll)">🏅 포인트 순 전체 랭킹</div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:var(--bg2)">
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">순위</th>
        <th style="padding:8px 12px;text-align:left;font-size:12px;color:var(--text3)">선수</th>
        <th style="padding:8px 12px;text-align:left;font-size:12px;color:var(--text3)">대학</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">티어</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">승</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">패</th>
        <th style="padding:8px 12px;text-align:center;font-size:12px;color:var(--text3)">포인트</th>
      </tr></thead><tbody>`;
  allPlayers.forEach((p,i)=>{
    const tierIcon=TIER_ICONS[p.tier]||'';
    const rnk=i===0?`<span class="rk1">1</span>`:i===1?`<span class="rk2">2</span>`:i===2?`<span class="rk3">3</span>`:`<span style="font-weight:700">${i+1}</span>`;
    const pts=p.points||0;
    const ptsCol=pts>0?'#16a34a':pts<0?'#dc2626':'#64748b';
    h+=`<tr style="border-top:1px solid var(--border)">
      <td style="padding:7px 12px;text-align:center">${rnk}</td>
      <td style="padding:7px 12px;text-align:left">
        <div style="display:flex;align-items:center;gap:6px;cursor:pointer" onclick="openPlayerModal('${(p.name||'').replace(/'/g,"\\'")}')">
          ${getPlayerPhotoHTML(p.name,'24px')}
          <span style="font-weight:700;font-size:13px">${p.name||''}</span>
        </div>
      </td>
      <td style="padding:7px 12px">
        <span class="ubadge clickable-univ" style="background:${p._col};font-size:10px;padding:2px 7px" onclick="openUnivModal('${(p._univ||'').replace(/'/g,"\\'")}')">${p._univ||''}</span>
      </td>
      <td style="padding:7px 12px;text-align:center;font-size:12px">${tierIcon}${p.tier||''}</td>
      <td style="padding:7px 12px;text-align:center;color:#16a34a;font-weight:700">${p.win||0}</td>
      <td style="padding:7px 12px;text-align:center;color:#dc2626;font-weight:700">${p.loss||0}</td>
      <td style="padding:7px 12px;text-align:center;font-weight:900;font-size:14px;color:${ptsCol}">${pts>0?'+':''}${pts}</td>
    </tr>`;
  });
  h+=`</tbody></table></div>`;
  return h;
}

// 대학별 다운
async function downloadBoardSel(){
  const btn=event?.currentTarget;
  if(btn){btn.disabled=true;btn._ot=btn.textContent;btn.textContent='⏳...';}
  const tmpDiv=document.createElement('div');
  try{
    if(!boardSelUniv||boardSelUniv==='전체'){alert('대학을 선택하세요.');return;}
    const u=getAllUnivs().find(x=>x.name===boardSelUniv);
    if(!u){alert('해당 대학을 찾을 수 없습니다.');return;}
    const boardWrap=document.getElementById('board-wrap');
    if(boardWrap){
      const card=boardWrap.querySelector(`.brd-card[data-univ="${boardSelUniv}"]`);
      if(card){
        const domOrder=[...card.querySelectorAll('[data-player]')].map(el=>el.dataset.player).filter(Boolean);
        if(domOrder.length>0) boardPlayerOrder[boardSelUniv]=domOrder;
      }
    }
    tmpDiv.style.cssText='position:absolute;left:-9999px;top:0;width:900px;background:#f0f2f5;padding:12px;font-family:\'Noto Sans KR\',sans-serif;box-sizing:border-box;';
    const rcontSel=document.getElementById('rcont');
    const brdStyleSel=rcontSel?rcontSel.querySelector('style'):null;
    tmpDiv.innerHTML=(brdStyleSel?brdStyleSel.outerHTML:'')+buildUnivBoardCard(u, true);
    tmpDiv.querySelectorAll('.no-export,.no-export-movebtns').forEach(el=>el.remove());
    document.body.appendChild(tmpDiv);
    injectUnivIcons(tmpDiv);
    await new Promise(r=>setTimeout(r,400));
    void tmpDiv.getBoundingClientRect();
    const selW = tmpDiv.offsetWidth || 900;
    const selH = Math.max(tmpDiv.scrollHeight, tmpDiv.offsetHeight, 100);
    await _captureAndSave(tmpDiv, selW, selH, '현황판_'+boardSelUniv+'.png');
  }catch(e){alert('다운로드 실패: '+e.message);}
  finally{
    if(tmpDiv.parentNode) document.body.removeChild(tmpDiv);
    if(btn){btn.disabled=false;btn.textContent=btn._ot||btn.textContent;}
  }
}


async function checkFbSyncStatus(){
  const el=document.getElementById('cfg-fb-sync-result');
  if(!el)return;
  el.innerHTML='<span style="color:var(--blue)">🔄 확인 중...</span>';

  // Firebase 연결 확인
  const fbConnected=typeof window.fbSet==='function';
  const hasPw=!!localStorage.getItem('su_fb_pw');
  const lastSave=localStorage.getItem('su_last_save_time');
  const localSize=(()=>{let t=0;for(let k in localStorage){if(k.startsWith('su_'))t+=((localStorage.getItem(k)||'').length*2);}return t;})();
  const fmt=b=>b>=1024*1024?(b/1024/1024).toFixed(2)+'MB':b>=1024?(b/1024).toFixed(1)+'KB':b+'B';

  // Firebase 실제 데이터 크기 확인 (onValue로 받은 마지막 스냅샷 크기)
  const fbSize=window._lastFbDataSize||null;

  let rows=`
    <div style="display:grid;gap:8px">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${fbConnected?'#f0fdf4':'#fef2f2'};border:1px solid ${fbConnected?'#bbf7d0':'#fecaca'}">
        <span style="font-size:16px">${fbConnected?'✅':'❌'}</span>
        <div>
          <div style="font-weight:700;font-size:12px">Firebase 연결</div>
          <div style="font-size:11px;color:var(--gray-l)">${fbConnected?'정상 연결됨':'Firebase 스크립트 미로드'}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:${hasPw?'#f0fdf4':'#fffbeb'};border:1px solid ${hasPw?'#bbf7d0':'#fde68a'}">
        <span style="font-size:16px">${hasPw?'🔑':'⚠️'}</span>
        <div>
          <div style="font-weight:700;font-size:12px">쓰기 비밀번호</div>
          <div style="font-size:11px;color:var(--gray-l)">${hasPw?'설정됨 — 저장 시 Firebase에 업로드됨':'미설정 — 저장해도 Firebase 업로드 안 됨'}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:var(--surface);border:1px solid var(--border)">
        <span style="font-size:16px">💾</span>
        <div>
          <div style="font-weight:700;font-size:12px">마지막 저장</div>
          <div style="font-size:11px;color:var(--gray-l)">${lastSave?new Date(parseInt(lastSave)).toLocaleString('ko-KR'):'기록 없음'}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;background:var(--surface);border:1px solid var(--border)">
        <span style="font-size:16px">📦</span>
        <div>
          <div style="font-weight:700;font-size:12px">로컬 데이터 크기</div>
          <div style="font-size:11px;color:var(--gray-l)">${fmt(localSize)} ${fbSize?`/ Firebase: ${fmt(fbSize*2)}`:'(Firebase 크기 미확인)'}</div>
        </div>
      </div>
      ${isLoggedIn&&hasPw?`<button class="btn btn-b btn-sm" onclick="(async()=>{const b=document.querySelector('#cfg-fb-sync-result button');if(b){b.disabled=true;b.textContent='⏫ 업로드 중...';}await fbCloudSave();localStorage.setItem('su_last_save_time',Date.now());setTimeout(checkFbSyncStatus,500);})()" style="width:100%">⬆️ 지금 Firebase에 업로드</button>`:''}
    </div>`;
  el.innerHTML=rows;
}
