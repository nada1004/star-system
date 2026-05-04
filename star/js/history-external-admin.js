/* history-external-admin.js: extracted from history.js */
/* ══════════════════════════════════════
   대전기록 액션 메뉴(⋯)
   - (개선) 아이콘 버튼(복사/공유/상세/수정/삭제/이동)을 한 곳에 모아 UI 복잡도 감소
══════════════════════════════════════ */
// 대전기록 > 외부2 (관리자 전용, iframe)
function histExternal2HTML(){
  // 권한 재확인(수동 변경 대비)
  try{
    if(!(typeof isLoggedIn!=='undefined' && isLoggedIn) || (typeof isSubAdmin!=='undefined' && isSubAdmin)){
      return `<div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-title">관리자 전용</div><div class="empty-state-desc">관리자 로그인 시 이용 가능합니다</div></div>`;
    }
  }catch(e){}
  const url = 'https://rapid-scene-ac45.kpoppd.workers.dev/men/bbs/board.php?bo_table=search_list';
  const tSel = _histExtTargetLoad();
  return `
    <div style="border:1px solid var(--border);border-radius:12px;background:var(--white);padding:12px;margin-bottom:10px">
      <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap">
        <div style="font-weight:900">🌐 외부2 (관리자 전용)</div>
        <a class="btn btn-w btn-xs" href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">새 창으로 열기</a>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px;line-height:1.5">
        ※ 외부 사이트가 <b>X-Frame-Options / CSP</b>로 iframe을 차단하면 화면에 표시되지 않을 수 있습니다. (그 경우 ‘새 창으로 열기’만 가능)
      </div>
    </div>
    <div style="border:1px solid var(--border);border-radius:12px;background:var(--white);padding:12px;margin-bottom:10px">
      <div style="font-weight:900;margin-bottom:8px">📋 특정 경기만 복사 → 자동인식</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.55;margin-bottom:8px">
        외부2 화면이나 새 창에서 <b>원하는 경기 몇 개만 드래그 복사</b>한 뒤 여기에 붙여넣고 자동인식을 누르면 됩니다.<br>
        표 형태(날짜/승자/패자/맵)면 자동 정리해서 보내고, 아니면 원문 그대로 자동인식 모달에 넘깁니다.
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
        <select id="hist-ext2-target" style="padding:5px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="" ${!tSel?'selected':''}>(저장대상 선택)</option>
          <option value="mini" ${tSel==='mini'?'selected':''}>미니대전</option>
          <option value="ind" ${tSel==='ind'?'selected':''}>개인전</option>
          <option value="pro" ${tSel==='pro'?'selected':''}>프로리그 일반</option>
          <option value="progj" ${tSel==='progj'?'selected':''}>프로리그 끝장전</option>
          <option value="gj" ${tSel==='gj'?'selected':''}>끝장전</option>
          <option value="ck" ${tSel==='ck'?'selected':''}>대학CK</option>
          <option value="univm" ${tSel==='univm'?'selected':''}>대학대전</option>
          <option value="tt-general" ${tSel==='tt-general'?'selected':''}>티어대회 일반</option>
          <option value="tt-league" ${tSel==='tt-league'?'selected':''}>티어대회 조별리그</option>
          <option value="tt-bkt" ${tSel==='tt-bkt'?'selected':''}>티어대회 토너먼트</option>
          <option value="comp" ${tSel==='comp'?'selected':''}>대회</option>
        </select>
        <button class="btn btn-w btn-xs" onclick="histExt2PasteFromClipboard()">📋 클립보드 붙여넣기</button>
        <button class="btn btn-p btn-xs" onclick="histExt2SendRawToPasteModal()">➡️ 자동인식 열기</button>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin:-2px 0 8px 0;line-height:1.5">
        ※ 프로리그 일반/끝장전, 티어대회 일반/조별리그/토너먼트까지 선택 가능하게 연결했습니다.<br>
        ※ 프로리그대회/브라켓 전용 기록은 현재 외부2 단독 저장보다 해당 탭 내부 자동인식이 더 정확합니다.
      </div>
      <textarea id="hist-ext2-raw" style="width:100%;min-height:110px;border:1px solid var(--border2);border-radius:10px;padding:10px;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace" placeholder="예: 특정 경기 몇 개만 선택 복사한 텍스트"></textarea>
    </div>
    <div style="border:1px solid var(--border);border-radius:12px;background:var(--white);overflow:hidden">
      <iframe
        src="${url}"
        style="width:100%;height:72vh;min-height:520px;border:0;display:block;background:#fff"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  `;
}

// 대전기록 > 외부3 (관리자 전용, iframe, 페이지 이동 지원)
// - iframe은 한 번에 1페이지(page=N)만 표시 가능
// - 대신 페이지 이동(이전/다음/번호 입력) UI를 제공
const _HIST_EXT3_PAGE_KEY = 'su_hist_ext3_page';
window.histExt3SetPage = function(p){
  try{
    const n = Math.max(1, Math.min(9999, parseInt(p,10) || 1));
    localStorage.setItem(_HIST_EXT3_PAGE_KEY, String(n));
    const inp = document.getElementById('hist-ext3-page');
    if(inp) inp.value = String(n);
    const frame = document.getElementById('hist-ext3-frame');
    const base = 'https://elo-proxy1.kpoppd.workers.dev/board.php?bo_table=bj_board&page=';
    if(frame) frame.src = base + encodeURIComponent(String(n));
  }catch(e){}
};
function histExternal3HTML(){
  // 권한 재확인(수동 변경 대비)
  try{
    if(!(typeof isLoggedIn!=='undefined' && isLoggedIn) || (typeof isSubAdmin!=='undefined' && isSubAdmin)){
      return `<div class="empty-state"><div class="empty-state-icon">🔒</div><div class="empty-state-title">관리자 전용</div><div class="empty-state-desc">관리자 로그인 시 이용 가능합니다</div></div>`;
    }
  }catch(e){}
  const page = (()=>{ try{ return parseInt(localStorage.getItem(_HIST_EXT3_PAGE_KEY)||'1',10)||1; }catch(e){ return 1; } })();
  const base = 'https://elo-proxy1.kpoppd.workers.dev/board.php?bo_table=bj_board&page=';
  const url = base + encodeURIComponent(String(page));
  const tSel = _histExtTargetLoad();
  return `
    <div style="border:1px solid var(--border);border-radius:12px;background:var(--white);padding:12px;margin-bottom:10px">
      <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap">
        <div style="font-weight:900">🌐 외부3 (관리자 전용)</div>
        <a class="btn btn-w btn-xs" href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">새 창으로 열기</a>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:10px">
        <button class="btn btn-w btn-xs" onclick="histExt3SetPage((parseInt(document.getElementById('hist-ext3-page').value||'1',10)||1)-1)">◀ 이전</button>
        <div style="font-size:12px;font-weight:900;color:var(--text2)">페이지</div>
        <input id="hist-ext3-page" type="number" min="1" value="${page}" style="width:92px;padding:6px 10px;border:1px solid var(--border2);border-radius:8px;font-weight:900"
          onkeydown="if(event.key==='Enter'){histExt3SetPage(this.value)}">
        <button class="btn btn-b btn-xs" onclick="histExt3SetPage(document.getElementById('hist-ext3-page').value)">이동</button>
        <button class="btn btn-w btn-xs" onclick="histExt3SetPage((parseInt(document.getElementById('hist-ext3-page').value||'1',10)||1)+1)">다음 ▶</button>
        <span style="font-size:11px;color:var(--gray-l)">※ iframe은 1페이지만 표시됩니다(페이지 이동으로 2/3/… 확인)</span>
      </div>
      <div style="font-size:11px;color:var(--gray-l);margin-top:6px;line-height:1.5">
        ※ 외부 사이트가 <b>X-Frame-Options / CSP</b>로 iframe을 차단하면 화면에 표시되지 않을 수 있습니다.
      </div>
    </div>
    <div style="border:1px solid var(--border);border-radius:12px;background:var(--white);padding:12px;margin-bottom:10px">
      <div style="font-weight:900;margin-bottom:8px">📋 외부3 복사 → 자동인식</div>
      <div style="font-size:11px;color:var(--gray-l);line-height:1.55;margin-bottom:8px">
        외부3 화면이나 새 창에서 <b>원하는 경기만 드래그 복사</b>한 뒤 여기에 붙여넣고 자동인식을 누르면 됩니다.<br>
        표 형태면 자동 정리해서 보내고, 아니면 원문 그대로 자동인식 모달에 넘깁니다.
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px">
        <select id="hist-ext3-target" style="padding:5px 8px;border:1px solid var(--border2);border-radius:8px;font-size:12px;font-weight:900">
          <option value="" ${!tSel?'selected':''}>(저장대상 선택)</option>
          <option value="mini" ${tSel==='mini'?'selected':''}>미니대전</option>
          <option value="ind" ${tSel==='ind'?'selected':''}>개인전</option>
          <option value="gj" ${tSel==='gj'?'selected':''}>끝장전</option>
          <option value="ck" ${tSel==='ck'?'selected':''}>대학CK</option>
          <option value="univm" ${tSel==='univm'?'selected':''}>대학대전</option>
          <option value="tt-general" ${tSel==='tt-general'?'selected':''}>티어대회 일반</option>
          <option value="tt-bkt" ${tSel==='tt-bkt'?'selected':''}>티어대회 토너먼트</option>
        </select>
        <button class="btn btn-w btn-xs" onclick="histExt3PasteFromClipboard()">📋 클립보드 붙여넣기</button>
        <button class="btn btn-p btn-xs" onclick="histExt3SendRawToPasteModal()">➡️ 자동인식 열기</button>
      </div>
      <textarea id="hist-ext3-raw" style="width:100%;min-height:110px;border:1px solid var(--border2);border-radius:10px;padding:10px;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace" placeholder="예: 외부3에서 특정 경기만 선택 복사한 텍스트"></textarea>
    </div>
    <div style="border:1px solid var(--border);border-radius:12px;background:var(--white);overflow:hidden">
      <iframe
        id="hist-ext3-frame"
        src="${url}"
        style="width:100%;height:72vh;min-height:520px;border:0;display:block;background:#fff"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  `;
}
window.histExt3SendRawToPasteModal = function(){
  const raw = (document.getElementById('hist-ext3-raw')?.value || '').trim();
  if(!raw){ alert('붙여넣기 내용이 없습니다'); return; }
  const target = (document.getElementById('hist-ext3-target')?.value || '').trim();
  if(!target){ alert('저장 대상(미니/개인전 등)을 먼저 선택해주세요'); return; }
  _histExtTargetSave(target);
  try{ window._pasteFromHistExt = true; }catch(e){}
  _histOpenPasteModalByTarget(target);
  const payload = _histExtRawToPastePayload(raw, target);
  setTimeout(()=>{
    try{
      const ta = document.getElementById('paste-input');
      if(ta) ta.value = payload;
      if(typeof pastePreview==='function') pastePreview();
    }catch(e){}
  }, 60);
};
window.histExt3PasteFromClipboard = async function(){
  try{
    const t = await navigator.clipboard.readText();
    const ta = document.getElementById('hist-ext3-raw');
    if(ta) ta.value = t || '';
  }catch(e){
    alert('클립보드 읽기 실패: 브라우저 권한(HTTPS/사용자 허용) 문제일 수 있어요.');
  }
};

function buildSingleSetHTML(m, si, labelA, labelB, ca, cb){
  if(!m.sets||!m.sets[si])return`<div style="font-size:11px;color:var(--gray-l)">세트 기록 없음</div>`;
  const set=m.sets[si];
  const isAce=(si===m.sets.length-1&&m.sets.length>=3);
  const sLabel=isAce?'🎯 에이스전':`${si+1}세트`;
  const swA=set.scoreA||0,swB=set.scoreB||0;
  const setAWin=swA>swB,setBWin=swB>swA;
  let h=`<div style="font-size:11px;font-weight:700;color:${isAce?'#7c3aed':'var(--blue)'};margin-bottom:8px">${sLabel} — ${labelA} <span class="${setAWin?'wt':'lt'}">${swA}</span>:<span class="${setBWin?'wt':'lt'}">${swB}</span> ${labelB}</div>`;
  if(set.games&&set.games.length){
    set.games.forEach((g,gi)=>{
      if(!g.playerA&&!g.playerB)return;
      const pA=players.find(p=>p.name===g.playerA);
      const pB=players.find(p=>p.name===g.playerB);
      const aIsWinner=g.winner==='A';const bIsWinner=g.winner==='B';const hasWinner=!!g.winner;
      const winBgA=(typeof getMatchWinTint==='function'?getMatchWinTint(ca):(ca+'22'));
      const winBgB=(typeof getMatchWinTint==='function'?getMatchWinTint(cb):(cb+'22'));
      const winBorderA=ca+'66',winBorderB=cb+'66';
      const styleA=hasWinner?(aIsWinner?`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${winBgA};border:2px solid ${winBorderA};`:`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border);opacity:0.45;filter:grayscale(1);`):`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border);`;
      const styleB=hasWinner?(bIsWinner?`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:${winBgB};border:2px solid ${winBorderB};`:`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border);opacity:0.45;filter:grayscale(1);`):`display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:var(--surface);border:1px solid var(--border);`;
      const cA=g.playerA?`onclick="openPlayerModal('${g.playerA}')" style="cursor:pointer;text-decoration:underline dotted"`:'';
      const cB=g.playerB?`onclick="openPlayerModal('${g.playerB}')" style="cursor:pointer;text-decoration:underline dotted"`:'';
      const mapStr=g.map?`<span style="background:var(--surface);border:1px solid var(--border);padding:2px 6px;border-radius:4px;font-size:10px">${g.map}</span>`:'';
      h+=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
        <span style="color:var(--gray-l);font-size:11px;font-weight:900;min-width:54px;text-align:center">경기 ${gi+1}</span>
        <div style="${styleA}">${pA?getPlayerPhotoHTML(pA.name,'30px','margin-right:4px'):''} ${pA?`<span class="rbadge r${pA.race}" style="font-size:11px;padding:2px 6px">${pA.race}</span>`:''}<strong style="font-size:14px" ${cA}>${g.playerA||'?'}</strong>${pA?genderIcon(pA.gender):''}<span style="font-size:11px;color:${ca};font-weight:700;margin-left:2px">(${labelA})</span>${aIsWinner&&hasWinner?`<span style="background:${ca};color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:4px;margin-left:4px">WIN</span>`:''}</div>
        <span style="color:var(--gray-l);font-size:12px;font-weight:700">vs</span>
        <div style="${styleB}">${pB?getPlayerPhotoHTML(pB.name,'30px','margin-right:4px'):''} ${pB?`<span class="rbadge r${pB.race}" style="font-size:11px;padding:2px 6px">${pB.race}</span>`:''}<strong style="font-size:14px" ${cB}>${g.playerB||'?'}</strong>${pB?genderIcon(pB.gender):''}<span style="font-size:11px;color:${cb};font-weight:700;margin-left:2px">(${labelB})</span>${bIsWinner&&hasWinner?`<span style="background:${cb};color:#fff;font-size:10px;font-weight:800;padding:2px 8px;border-radius:4px;margin-left:4px">WIN</span>`:''}</div>
        ${mapStr}
      </div>`;
    });
  }
  return h;
}
