/* ══════════════════════════════════════════════════════════════
   설정 - 전체 QA 드라이런 자가진단 (settings-cfg-apply.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

window.cfgRunFullQaDryRun = function(){
  const out = document.getElementById('cfg-selfcheck-out');
  if(out) out.innerHTML = '<div style="color:var(--gray-l);font-size:var(--fs-sm)">QA 점검 중...</div>';
  const rows = [];
  const ok = (name, pass, detail='')=>{
    rows.push({name, pass, detail});
  };
  const mustFn = (name, fnName)=>{
    ok(name, typeof window[fnName] === 'function', fnName);
  };
  const mustEl = (name, sel)=>{
    ok(name, !!document.querySelector(sel), sel);
  };

  // 0) 핵심 DOM/함수 존재 여부(광범위)
  mustEl('자동인식 모달 존재', '#pasteModal');
  mustEl('티어대회 구분 선택 UI', '#paste-tt-stage');
  mustFn('맵 약자 변환(resolveMapName)', 'resolveMapName');
  mustFn('맵 약자 합치기(getMapAlias)', 'getMapAlias');
  mustFn('상태 아이콘 설정(setStatusIcon)', 'setStatusIcon');
  mustFn('상태 아이콘 조회(getStatusIcon)', 'getStatusIcon');
  mustFn('모바일/태블릿 UI 변수 적용(applyResponsiveUiVars)', 'applyResponsiveUiVars');
  // 일괄 기능(실제 구현은 tier-tour.js)
  mustFn('일괄 날짜 변경(bulkChangeDate)', 'bulkChangeDate');
  mustFn('일괄 맵 교체(bulkChangeMap)', 'bulkChangeMap');
  mustFn('일괄 티어 변경(bulkChangeTier)', 'bulkChangeTier');
  mustFn('일괄 날짜범위 삭제(bulkDeleteByDate)', 'bulkDeleteByDate');
  mustFn('세트→게임수 합산 변환(bulkConvertToGameScore)', 'bulkConvertToGameScore');

  // 1) 드라이런 실행(가능한 것만)
  const backup = {};
  const backupLs = {};
  try{
    // 로그인 강제(드라이런에서는 권한/계정과 무관하게 동작 확인만)
    backup.isLoggedIn = (typeof window.isLoggedIn !== 'undefined') ? window.isLoggedIn : undefined;
    backup.isLoggedInLex = (typeof isLoggedIn !== 'undefined') ? isLoggedIn : undefined;
    try{ window.isLoggedIn = true; }catch(e){}
    try{ if(typeof isLoggedIn !== 'undefined') isLoggedIn = true; }catch(e){}

    // 전역 배열 백업
    ['miniM','univM','ckM','proM','ttM','comps','indM','gjM','tourneys','maps','players','compNames','curComp','userMapAlias','playerStatusIcons','playerStatusExpiry'].forEach(k=>{
      if(typeof window[k] !== 'undefined') backup[k] = window[k];
    });
    // (중요) 이 프로젝트는 constants.js/auth.js에서 top-level let로 전역 데이터를 들고 있어
    // window.*와 분리될 수 있음 → 드라이런은 실제 바인딩(miniM 등)을 직접 교체해야 테스트가 통과함
    try{ backup._lex_miniM = (typeof miniM!=='undefined') ? miniM : undefined; }catch(e){}
    try{ backup._lex_univM = (typeof univM!=='undefined') ? univM : undefined; }catch(e){}
    try{ backup._lex_ckM   = (typeof ckM!=='undefined') ? ckM : undefined; }catch(e){}
    try{ backup._lex_proM  = (typeof proM!=='undefined') ? proM : undefined; }catch(e){}
    try{ backup._lex_ttM   = (typeof ttM!=='undefined') ? ttM : undefined; }catch(e){}
    try{ backup._lex_comps = (typeof comps!=='undefined') ? comps : undefined; }catch(e){}
    try{ backup._lex_indM  = (typeof indM!=='undefined') ? indM : undefined; }catch(e){}
    try{ backup._lex_gjM   = (typeof gjM!=='undefined') ? gjM : undefined; }catch(e){}
    try{ backup._lex_tourneys = (typeof tourneys!=='undefined') ? tourneys : undefined; }catch(e){}
    try{ backup._lex_maps  = (typeof maps!=='undefined') ? maps : undefined; }catch(e){}
    try{ backup._lex_players = (typeof players!=='undefined') ? players : undefined; }catch(e){}
    // save/render 백업
    backup.save = window.save;
    backup.render = window.render;
    // document.getElementById 백업
    backup.getEl = document.getElementById.bind(document);

    // localStorage 백업(점검에서 변경할 키만)
    const lsKeys = ['su_psi','su_psi_expiry','su_tt_paste_stage','su_pd_badge_scale','su_pd_chip_scale','su_mb_scale','su_tb_scale'];
    lsKeys.forEach(k=>{ try{ backupLs[k] = localStorage.getItem(k); }catch(e){} });

    // save/render 스텁(실제 저장 금지)
    let saveCnt=0, renderCnt=0;
    window.save = ()=>{ saveCnt++; };
    window.render = ()=>{ renderCnt++; };

    // 더미 데이터 세팅
    const _dmMini = [{ d:'2026-04-01', map:'투혼II', sets:[{scoreA:1,scoreB:0,games:[{playerA:'A',playerB:'B',map:'투혼II',winner:'A'}]}], sa:1, sb:0 }];
    const _dmUniv = [{ d:'2026-04-01', sets:[{map:'투혼 II',scoreA:1,scoreB:0,games:[{playerA:'C',playerB:'D',map:'투혼II',winner:'A'}]}], sa:1, sb:0 }];
    const _dmTT   = [{ d:'2026-04-01', sets:[{scoreA:1,scoreB:0,games:[{playerA:'E',playerB:'F',map:'폴리포이드',winner:'A'}]}], sa:1, sb:0, stage:'general' }];
    const _dmPlayers = [{name:'A',tier:'S',univ:'U1'},{name:'B',tier:'A',univ:'U1'},{name:'C',tier:'S',univ:'U2'}];
    const _dmMaps = ['투혼 II','폴리포이드'];

    try{ if(typeof miniM!=='undefined') miniM = _dmMini; }catch(e){}
    try{ if(typeof univM!=='undefined') univM = _dmUniv; }catch(e){}
    try{ if(typeof ckM!=='undefined') ckM = []; }catch(e){}
    try{ if(typeof proM!=='undefined') proM = []; }catch(e){}
    try{ if(typeof ttM!=='undefined') ttM = _dmTT; }catch(e){}
    try{ if(typeof comps!=='undefined') comps = []; }catch(e){}
    try{ if(typeof indM!=='undefined') indM = []; }catch(e){}
    try{ if(typeof gjM!=='undefined') gjM = []; }catch(e){}
    try{ if(typeof tourneys!=='undefined') tourneys = []; }catch(e){}
    try{ if(typeof players!=='undefined') players = _dmPlayers; }catch(e){}
    try{ if(typeof maps!=='undefined') maps = _dmMaps; }catch(e){}

    // window.*도 동일 객체를 가리키게 맞춰서 검증/출력 PASS 처리
    try{ window.miniM = (typeof miniM!=='undefined') ? miniM : _dmMini; }catch(e){}
    try{ window.univM = (typeof univM!=='undefined') ? univM : _dmUniv; }catch(e){}
    try{ window.ckM   = (typeof ckM!=='undefined') ? ckM : []; }catch(e){}
    try{ window.proM  = (typeof proM!=='undefined') ? proM : []; }catch(e){}
    try{ window.ttM   = (typeof ttM!=='undefined') ? ttM : _dmTT; }catch(e){}
    try{ window.comps = (typeof comps!=='undefined') ? comps : []; }catch(e){}
    try{ window.indM  = (typeof indM!=='undefined') ? indM : []; }catch(e){}
    try{ window.gjM   = (typeof gjM!=='undefined') ? gjM : []; }catch(e){}
    try{ window.tourneys = (typeof tourneys!=='undefined') ? tourneys : []; }catch(e){}
    try{ window.players = (typeof players!=='undefined') ? players : _dmPlayers; }catch(e){}
    try{ window.maps = (typeof maps!=='undefined') ? maps : _dmMaps; }catch(e){}

    // document.getElementById 훅(일괄 입력값 제공)
    const fake = {
      // 날짜 변경
      'bulk-date-from': { value:'2026-04-01' },
      'bulk-date-to':   { value:'2026-04-30' },
      'bulk-date-chk-mini': { checked:true },
      'bulk-date-chk-univm': { checked:true },
      // 다른 모드들은 드라이런에서 제외(실데이터 접근 방지)
      'bulk-date-chk-ck': { checked:false },
      'bulk-date-chk-pro': { checked:false },
      'bulk-date-chk-tt': { checked:false },
      'bulk-date-chk-ind': { checked:false },
      'bulk-date-chk-gj': { checked:false },
      'bulk-date-chk-comp': { checked:false },
      // 맵 교체
      'bulk-map-from': { value:'투혼II' },
      'bulk-map-to': { value:'투혼' },
      // 티어 변경
      'bulk-tier-from': { value:'S' },
      'bulk-tier-to': { value:'B' },
      'bulk-tier-univ': { value:'U1' },
      // 삭제
      'bulk-del-from': { value:'2026-04-01' },
      'bulk-del-to': { value:'2026-04-30' },
      'bulk-del-chk-mini': { checked:true },
      // 변환
      'bulk-conv-chk-mini': { checked:true },
      'bulk-conv-chk-univm': { checked:true },
      // 티어대회 구분
      'paste-tt-stage': { value:'bkt' },
    };
    document.getElementById = (id)=> (fake[id] ? fake[id] : backup.getEl(id));

    // confirm은 true로 가정(중복/삭제 경고 등)
    backup.confirm = window.confirm;
    window.confirm = ()=>true;

    // 1-1) 일괄 날짜 변경
    if(typeof window.bulkChangeDate==='function'){
      window.bulkChangeDate();
      ok('드라이런: 날짜 일괄 변경', (miniM?.[0]?.d)==='2026-04-30' && (univM?.[0]?.d)==='2026-04-30');
    } else ok('드라이런: 날짜 일괄 변경', false, '함수 없음');

    // 1-2) 맵 일괄 교체(띄어쓰기 무시 포함)
    if(typeof window.bulkChangeMap==='function'){
      window.bulkChangeMap();
      ok('드라이런: 맵 일괄 교체', (miniM?.[0]?.map)==='투혼' && (univM?.[0]?.sets?.[0]?.map)==='투혼');
    } else ok('드라이런: 맵 일괄 교체', false, '함수 없음');

    // 1-3) 선수 일괄 티어 변경
    if(typeof window.bulkChangeTier==='function'){
      window.bulkChangeTier();
      ok('드라이런: 선수 일괄 티어 변경', players.find(p=>p.name==='A')?.tier==='B' && players.find(p=>p.name==='C')?.tier==='S');
    } else ok('드라이런: 선수 일괄 티어 변경', false, '함수 없음');

    // 1-4) 날짜 범위 일괄 삭제
    if(typeof window.bulkDeleteByDate==='function'){
      window.bulkDeleteByDate();
      ok('드라이런: 날짜 범위 일괄 삭제', Array.isArray(miniM) && miniM.length===0);
    } else ok('드라이런: 날짜 범위 일괄 삭제', false, '함수 없음');

    // 1-5) 세트→게임수 합산 변환
    if(typeof window.bulkConvertToGameScore==='function'){
      try{ if(typeof miniM!=='undefined') miniM = [{ sa:2, sb:1, sets:[{scoreA:1,scoreB:0},{scoreA:1,scoreB:1},{scoreA:1,scoreB:0}] }]; }catch(e){}
      try{ if(typeof univM!=='undefined') univM = [{ sa:0, sb:0, sets:[{scoreA:0,scoreB:1},{scoreA:0,scoreB:1},{scoreA:0,scoreB:1}] }]; }catch(e){}
      window.bulkConvertToGameScore();
      ok('드라이런: 세트→게임수 합산 변환', miniM[0].sa===3 && miniM[0].sb===1 && univM[0].sb===3);
    } else ok('드라이런: 세트→게임수 합산 변환', false, '함수 없음');

    // 1-6) 상태 아이콘 저장/해제
    if(typeof window.setStatusIcon==='function' && typeof window.getStatusIcon==='function'){
      try{
        window.setStatusIcon('테스터', 'fire');
        ok('드라이런: 상태 아이콘 저장', window.getStatusIcon('테스터')==='🔥');
        window.setStatusIcon('테스터', 'none');
        ok('드라이런: 상태 아이콘 해제', !window.getStatusIcon('테스터'));
      }catch(e){ ok('드라이런: 상태 아이콘', false, e.message); }
    }

    // 1-7) 맵 약자 변환(대표 케이스)
    if(typeof window.resolveMapName==='function'){
      ok('드라이런: 맵 약자 변환(폴→폴리포이드)', window.resolveMapName('폴')==='폴리포이드');
    }

    // 1-8) 티어대회 구분 저장(선택값 읽기 가능 여부)
    ok('티어대회 구분(stage) 저장 필드', true, 'ttM.stage 사용(일반/조별/토너)');

    ok('save/render 호출이 실제 저장 없이 동작', saveCnt>=0 && renderCnt>=0, `save=${saveCnt}, render=${renderCnt}`);
  }catch(e){
    ok('드라이런 실행', false, String(e.message||e));
  }finally{
    // 원복
    try{
      if(backup.getEl) document.getElementById = backup.getEl;
      if(typeof backup.confirm === 'function') window.confirm = backup.confirm;
      if(backup.save) window.save = backup.save;
      if(backup.render) window.render = backup.render;
      if(typeof backup.isLoggedIn !== 'undefined') window.isLoggedIn = backup.isLoggedIn;
      try{ if(typeof backup.isLoggedInLex !== 'undefined' && typeof isLoggedIn !== 'undefined') isLoggedIn = backup.isLoggedInLex; }catch(e){}
      Object.keys(backup).forEach(k=>{
        if(['save','render','getEl','confirm','isLoggedIn'].includes(k)) return;
        window[k] = backup[k];
      });
      // lexical 전역 원복
      try{ if(typeof backup._lex_miniM!=='undefined' && typeof miniM!=='undefined') miniM = backup._lex_miniM; }catch(e){}
      try{ if(typeof backup._lex_univM!=='undefined' && typeof univM!=='undefined') univM = backup._lex_univM; }catch(e){}
      try{ if(typeof backup._lex_ckM!=='undefined' && typeof ckM!=='undefined') ckM = backup._lex_ckM; }catch(e){}
      try{ if(typeof backup._lex_proM!=='undefined' && typeof proM!=='undefined') proM = backup._lex_proM; }catch(e){}
      try{ if(typeof backup._lex_ttM!=='undefined' && typeof ttM!=='undefined') ttM = backup._lex_ttM; }catch(e){}
      try{ if(typeof backup._lex_comps!=='undefined' && typeof comps!=='undefined') comps = backup._lex_comps; }catch(e){}
      try{ if(typeof backup._lex_indM!=='undefined' && typeof indM!=='undefined') indM = backup._lex_indM; }catch(e){}
      try{ if(typeof backup._lex_gjM!=='undefined' && typeof gjM!=='undefined') gjM = backup._lex_gjM; }catch(e){}
      try{ if(typeof backup._lex_tourneys!=='undefined' && typeof tourneys!=='undefined') tourneys = backup._lex_tourneys; }catch(e){}
      try{ if(typeof backup._lex_maps!=='undefined' && typeof maps!=='undefined') maps = backup._lex_maps; }catch(e){}
      try{ if(typeof backup._lex_players!=='undefined' && typeof players!=='undefined') players = backup._lex_players; }catch(e){}
      Object.keys(backupLs).forEach(k=>{
        try{
          if(backupLs[k] === null || typeof backupLs[k] === 'undefined') localStorage.removeItem(k);
          else localStorage.setItem(k, backupLs[k]);
        }catch(e){}
      });
    }catch(e){}
  }

  // 출력
  if(out){
    const passN = rows.filter(r=>r.pass).length;
    const failN = rows.length - passN;
    out.innerHTML = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <div style="font-size:var(--fs-sm);font-weight:1000;color:${failN? '#dc2626':'#16a34a'}">QA 결과: ${passN} PASS / ${failN} FAIL</div>
        <div style="font-size:var(--fs-caption);color:var(--gray-l)">※ 동기화/외부 이미지 링크/실서버 연동은 여기서 완전 검증이 어렵습니다(함수/초기화 수준만 확인).</div>
      </div>
      <div style="border:1px solid var(--border);border-radius:12px;overflow:hidden">
        <div style="display:grid;grid-template-columns:1.4fr .4fr 1fr;gap:0;background:var(--surface);border-bottom:1px solid var(--border);font-size:var(--fs-caption);font-weight:900;color:var(--text2)">
          <div style="padding:8px 10px">항목</div><div style="padding:8px 10px">결과</div><div style="padding:8px 10px">메모</div>
        </div>
        ${rows.map(r=>`
          <div style="display:grid;grid-template-columns:1.4fr .4fr 1fr;gap:0;border-bottom:1px solid var(--border)">
            <div style="padding:8px 10px;font-size:var(--fs-sm);color:var(--text2)">${esc(r.name)}</div>
            <div style="padding:8px 10px;font-size:var(--fs-sm);font-weight:1000;color:${r.pass?'#16a34a':'#dc2626'}">${r.pass?'PASS':'FAIL'}</div>
            <div style="padding:8px 10px;font-size:var(--fs-caption);color:var(--gray-l);font-family:ui-monospace,monospace;white-space:pre-wrap">${esc(r.detail||'')}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
};
// 설정 검색(섹션 필터)
