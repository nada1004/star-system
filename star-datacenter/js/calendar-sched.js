// calendar.js에서 분리됨 (캘린더탭 - 일정CRUD/일별상세/ICS내보내기)

let _calActiveDay='';
let _calDetailState={};

function calDeleteSched(id){
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  if(!_li) return;
  if(typeof calScheduled==='undefined' || !Array.isArray(calScheduled)) window.calScheduled=[];
  _calConfirmDel(function(){
    const idx=calScheduled.findIndex(x=>x._id===id);
    if(idx>=0){ calScheduled.splice(idx,1); window._calScheduled=calScheduled; }
    window._calMatchCache=null;
    render();
    if(typeof save==='function'){
      Promise.resolve(save()).catch(function(e){
        _calSaveToast('⚠️ 로컬 저장됨 — 네트워크 오류로 원격 저장 실패');
        console.warn('[calDeleteSched] save error', e);
      });
    }
  });
}

// [개선] 예정 경기 → ICS 파일로 내보내기 (외부 캘린더 앱에 추가)
function calExportSchedIcs(id){
  const list=(typeof calScheduled!=='undefined' && Array.isArray(calScheduled)) ? calScheduled : (window._calScheduled||[]);
  const m=list.find(x=>x._id===id);
  if(!m){ alert('예정 경기를 찾을 수 없습니다.'); return; }
  const d=(m.d||'').replace(/-/g,'');
  if(!d){ alert('날짜 정보가 없습니다.'); return; }
  let startStr, endStr, allDay=false;
  if(m.time && /^\d{1,2}:\d{2}$/.test(m.time)){
    const [hh,mm]=m.time.split(':').map(n=>String(n).padStart(2,'0'));
    startStr=`${d}T${hh}${mm}00`;
    const endDate=new Date(`${m.d}T${hh}:${mm}:00`);
    endDate.setHours(endDate.getHours()+1);
    const pad=n=>String(n).padStart(2,'0');
    endStr=`${endDate.getFullYear()}${pad(endDate.getMonth()+1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
  } else {
    allDay=true;
    const nd=new Date(m.d); nd.setDate(nd.getDate()+1);
    const pad=n=>String(n).padStart(2,'0');
    startStr=d;
    endStr=`${nd.getFullYear()}${pad(nd.getMonth()+1)}${pad(nd.getDate())}`;
  }
  const escIcs=(s)=>String(s||'').replace(/[\\,;]/g,m2=>'\\'+m2).replace(/\n/g,'\\n');
  const now=new Date();
  const pad2=n=>String(n).padStart(2,'0');
  const dtstamp=`${now.getUTCFullYear()}${pad2(now.getUTCMonth()+1)}${pad2(now.getUTCDate())}T${pad2(now.getUTCHours())}${pad2(now.getUTCMinutes())}${pad2(now.getUTCSeconds())}Z`;
  const ics=[
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//STAR Datacenter//Calendar//KO',
    'BEGIN:VEVENT',
    `UID:${escIcs(id)}@star-datacenter`,
    `DTSTAMP:${dtstamp}`,
    allDay?`DTSTART;VALUE=DATE:${startStr}`:`DTSTART:${startStr}`,
    allDay?`DTEND;VALUE=DATE:${endStr}`:`DTEND:${endStr}`,
    `SUMMARY:${escIcs(m.note||'예정 경기')}`,
    'END:VEVENT','END:VCALENDAR'
  ].join('\r\n');
  const blob=new Blob([ics],{type:'text/calendar;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`${(m.note||'경기일정').replace(/[\\/:*?"<>|]/g,'_')}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

// Feature 1+3: 예정 경기 등록 모달
function openCalSchedModal(prefillDate){
  const today=new Date();
  const pad=n=>String(n).padStart(2,'0');
  const todayStr=`${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
  const dateEl=document.getElementById('cal-sched-date');
  const timeEl=document.getElementById('cal-sched-time');
  const noteEl=document.getElementById('cal-sched-note');
  if(dateEl) dateEl.value=prefillDate||(typeof calDayDate!=='undefined'?calDayDate:'')||todayStr;
  if(timeEl) timeEl.value='';
  if(noteEl) noteEl.value='';
  om('calSchedModal');
  setTimeout(()=>{ if(noteEl) noteEl.focus(); },300);
}

function saveCalSched(){
  const d=(document.getElementById('cal-sched-date')||{}).value||'';
  const t=(document.getElementById('cal-sched-time')||{}).value||'';
  const n=((document.getElementById('cal-sched-note')||{}).value||'').trim();
  if(!d){ alert('날짜를 입력하세요.'); return; }
  if(!n){ alert('메모를 입력하세요.'); return; }
  const newSched={d, note:n, _id:'s'+Date.now()};
  if(t) newSched.time=t;
  if(typeof calScheduled==='undefined') window.calScheduled=[];
  calScheduled.push(newSched);
  window._calScheduled=calScheduled;
  window._calMatchCache=null;
  cm('calSchedModal');
  render();
  if(typeof save==='function'){
    Promise.resolve(save()).catch(function(e){
      _calSaveToast('⚠️ 로컬 저장됨 — 네트워크 오류로 원격 저장 실패');
      console.warn('[saveCalSched] save error', e);
    });
  }
}

function calToggleDetail(key){
  const area=document.getElementById('det-'+key);
  const btn=document.getElementById('detbtn-'+key);
  if(!area)return;
  _calDetailState[key]=!_calDetailState[key];
  const isOpen=!!_calDetailState[key];
  area.style.display=isOpen?'block':'none';
  if(btn){btn.classList.toggle('open',isOpen);btn.textContent=isOpen?'🔼 닫기':'📂 상세';}
}

function calShowDay(ds){
  const el=document.getElementById('calDayDetail');
  if(!el)return;
  const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
  const _scheduled = (typeof calScheduled!=='undefined' && Array.isArray(calScheduled)) ? calScheduled : [];
  if(_calActiveDay===ds){
    _calActiveDay='';
    _calDetailState={};
    el.innerHTML='';
    render();
    return;
  }
  _calActiveDay=ds;
  _calDetailState={};
  document.querySelectorAll('.cal-board-month .cal-cell.active, .cal-week-list .cal-week-card.active').forEach(td=>td.classList.remove('active'));
  const _newActiveTd=document.querySelector('.cal-board-month .cal-cell[data-ds="'+ds+'"], .cal-week-list .cal-week-card[data-ds="'+ds+'"]');
  if(_newActiveTd) _newActiveTd.classList.add('active');
  const matches=((window._calRawDateMatchMap&&window._calRawDateMatchMap[ds])?window._calRawDateMatchMap[ds]:[]).slice();
  const schedMatches=_scheduled.filter(m=>m.d===ds);
  if(!window._calDayCache) window._calDayCache={};
  window._calDayCache[ds]=matches;

  function buildMatchRow(m,mi){
    const _type=(m && m.__calType) || 'comp';
    const _isInd=_type==='ind';
    const _isGj=_type==='gj';
    const _isIG=_isInd||_isGj;
    // ind/gj: 별도 처리 (sa/sb 없음)
    if(_isIG){
      const typeBg=_isInd?'#8b5cf6':'#db2777';
      const typeLabel=_isInd?'🎮 개인전':'⚔️ 끝장전';
      const detKey='caldm-'+ds+'-'+mi;
      const wH=_calEscHTML(m.wName||'');
      const lH=_calEscHTML(m.lName||'');
      const mapH=_calEscHTML(m.map||'');
      const detHTML=buildDetailHTML(m,_isInd?'ind':'gj',m.wName||'',m.lName||'',typeBg,'#64748b',true,false);
      const modeKey=_isInd?'ind':'gj';
      const MODE_COL = {ind:'#2563eb',gj:'#dc2626'};
      const _mc = MODE_COL[modeKey] || '#64748b';
      const _rgb = (hex)=>{const h=String(hex||'').replace('#',''); if(h.length!==6) return '100,116,139'; const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return `${r},${g},${b}`;};
      return '<div class="rec-summary cal-match-card rec-mode-'+modeKey+'" data-rec-mode="'+modeKey+'" style="--rec-mode-col:'+_mc+';--rec-mode-rgb:'+_rgb(_mc)+'">'
        +'<div class="rec-sum-header" style="cursor:pointer" onclick="calToggleDetail(\''+detKey+'\')">'
        +'<span class="cal-match-badge" style="background:'+typeBg+'">'+typeLabel+'</span>'
        +'<div class="rec-sum-vs cal-match-meta" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'
        +'<span style="font-weight:700;color:'+typeBg+'">'+wH+'</span>'
        +'<span style="color:var(--gray-l);font-size:var(--fs-sm)">vs</span>'
        +'<span style="font-weight:600;opacity:.7">'+lH+'</span>'
        +(m.map?'<span style="font-size:var(--fs-caption);color:var(--text3)">📍'+mapH+'</span>':'')
        +'<span class="cal-match-result is-win">▶ '+wH+' 승</span>'
        +'</div>'
        +'<div class="cal-match-actions no-export">'
        +'<button id="detbtn-'+detKey+'" class="btn-detail" onclick="event.stopPropagation();calToggleDetail(\''+detKey+'\')">📂 상세</button>'
        +'</div>'
        +'</div>'
        +'<div id="det-'+detKey+'" style="display:none;padding:10px 14px;background:var(--surface);border-top:1px solid var(--border)">'
        +detHTML
        +'</div>'
        +'</div>';
    }
    if(m.sa==null||m.sa==='') return '';
    const isCKorPro=_type==='ck'||_type==='pro';
    const tA=isCKorPro?((m.teamALabel||'').replace(/^\$\{.*\}$/,'')||'A팀'):(m.a||'');
    const tB=isCKorPro?((m.teamBLabel||'').replace(/^\$\{.*\}$/,'')||'B팀'):(m.b||'');
    const tAH=_calEscHTML(tA);
    const tBH=_calEscHTML(tB);
    const ca=isCKorPro?'#2563eb':gc(m.a||'');
    const cb=isCKorPro?'#dc2626':gc(m.b||'');
    const aWin=(m.sa??-1)>(m.sb??-1), bWin=(m.sb??-1)>(m.sa??-1);
    const typeBg=_type==='mini'?'#2563eb':_type==='univm'?'#7c3aed':_type==='ck'?'#d97706':_type==='pro'?'#7c3aed':'#16a34a';
    const typeLabel=_type==='mini'?'⚡ 미니대전':_type==='univm'?'🏟️ 대학대전':_type==='ck'?'🤝 대학CK':_type==='pro'?'🏅 프로리그':'🎖️ 대회';
    const detKey='caldm-'+ds+'-'+mi;
    const modeKey=(m && m.__calMode) || _type || 'comp';
    const detHTML=buildDetailHTML(m,modeKey,tA,tB,ca,cb,aWin,bWin);
    const winLabel=aWin?'▶ '+tAH+' 승':bWin?'▶ '+tBH+' 승':'무승부';
    const winColor=aWin?ca:bWin?cb:'#888';
    const MODE_COL = {mini:'#7c3aed',univm:'#16a34a',ck:'#f59e0b',pro:'#0ea5e9',comp:'#3b82f6'};
    const _mc = MODE_COL[modeKey] || '#64748b';
    const _rgb = (hex)=>{const h=String(hex||'').replace('#',''); if(h.length!==6) return '100,116,139'; const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return `${r},${g},${b}`;};
    return '<div class="rec-summary cal-match-card rec-mode-'+modeKey+'" data-rec-mode="'+modeKey+'" style="--rec-mode-col:'+_mc+';--rec-mode-rgb:'+_rgb(_mc)+'">'
      +'<div class="rec-sum-header" style="cursor:pointer" onclick="calToggleDetail(\''+detKey+'\')">'
      +'<span class="cal-match-badge" style="background:'+typeBg+'">'+typeLabel+'</span>'
      +'<div class="rec-sum-vs cal-match-meta">'
      +'<span class="ubadge'+(aWin?'':' loser')+'" style="background:'+ca+'">'+tAH+'</span>'
      +'<div class="rec-sum-score score-click" onclick="event.stopPropagation();calToggleDetail(\''+detKey+'\')">'
      +'<span class="'+(aWin?'wt':bWin?'lt':'pt-z')+'">'+m.sa+'</span>'
      +'<span style="color:var(--gray-l);font-size:14px"> : </span>'
      +'<span class="'+(bWin?'wt':aWin?'lt':'pt-z')+'">'+m.sb+'</span>'
      +'</div>'
      +'<span class="ubadge'+(bWin?'':' loser')+'" style="background:'+cb+'">'+tBH+'</span>'
      +'<span class="cal-match-result is-win" style="color:'+winColor+'">'+winLabel+'</span>'
      +'</div>'
      +'<div class="cal-match-actions no-export">'
      +'<button id="detbtn-'+detKey+'" class="btn-detail" onclick="event.stopPropagation();calToggleDetail(\''+detKey+'\')">📂 상세</button>'
      +'</div>'
      +'</div>'
      +'<div id="det-'+detKey+'" style="display:none;padding:10px 14px;background:var(--surface);border-top:1px solid var(--border)">'
      +detHTML
      +'<div class="cal-share-row">'
      +'<button class="btn btn-p btn-xs no-export" style="margin-left:auto;min-width:98px;display:inline-flex;align-items:center;justify-content:center" onclick="openCalMatchShareCardByCache(\''+_calEscJS(ds)+'\','+mi+');event.stopPropagation()">🎴 공유 카드</button>'
      +'</div>'
      +'</div>'
      +'</div>';
  }

  el.style.animation='fadeIn .2s';
  el.innerHTML='<div class="cal-soft-card" style="animation:fadeIn .2s">'
    +'<div class="cal-day-summary">'
    +'<div>'
    +'<div class="cal-day-summary-title">📅 '+_calEscHTML(ds)+' 경기 목록</div>'
    +'<div class="cal-day-summary-sub">총 '+matches.length+'경기 · 선택한 날짜의 기록과 예정 경기를 빠르게 확인합니다.</div>'
    +'</div>'
    +'<div class="cal-day-summary-actions">'
    +'<button class="btn btn-b btn-sm" onclick="calDayDate=\''+_calEscJS(ds)+'\';calView=\'day\';render()">📋 일간 상세보기</button>'
    +'<button class="btn btn-w btn-sm" onclick="_calActiveDay=\'\';document.getElementById(\'calDayDetail\').innerHTML=\'\'">✕ 닫기</button>'
    +'</div></div>'
    +matches.map(buildMatchRow).join('')
    +(schedMatches.length?'<div class="cal-sched-card" style="margin-top:10px">'
      +'<div style="font-size:var(--fs-sm);font-weight:700;color:#92400e;margin-bottom:8px">📌 예정 경기</div>'
      +schedMatches.map(m=>'<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #fde68a20">'
        +'<span style="font-size:var(--fs-sm);flex:1">'+_calEscHTML(m.note||'예정')+(m.time?' 🕐'+_calEscHTML(m.time):'')+'</span>'
        +'<button class="btn btn-w btn-xs" onclick="calExportSchedIcs(\''+_calEscJS(m._id||'')+'\')">📤</button>'
        +(_li?'<button class="btn btn-r btn-xs" onclick="calDeleteSched(\''+_calEscJS(m._id||'')+'\')">🗑️</button>':'')
        +'</div>'
      ).join('')
      +'</div>':'')
    +'</div>';
}

function swNav(t,el){
  // [BUG-FIX #2,#5] 실제 swNav 로드 완료 → window.swNav를 이 함수로 교체
  window.swNav = swNav;

  // [BUG-FIX #5] _syncBnav 헬퍼가 있으면 매핑 기반 동기화,
  // 없으면 el 기반 폴백 (gj/tiertour/civil 서브탭 불일치 해결)
  if(typeof window._syncBnav === 'function'){
    window._syncBnav(t);
    // el이 bnav-item인 경우 직접 on 보정 (명시적 클릭 시 우선)
    if(el && el.classList && el.classList.contains('bnav-item')){
      document.querySelectorAll('.bnav-item').forEach(b=>{
        b.classList.remove('on');
        b.setAttribute('aria-selected','false');/* [A11Y] */
      });
      el.classList.add('on');
      el.setAttribute('aria-selected','true');/* [A11Y] */
    }
  } else {
    document.querySelectorAll('.bnav-item').forEach(b=>{
      b.classList.remove('on');
      b.setAttribute('aria-selected','false');/* [A11Y] */
    });
    if(el){
      el.classList.add('on');
      el.setAttribute('aria-selected','true');/* [A11Y] */
    }
  }
  // 탭 상태 초기화는 sw() 내부에서 처리하므로 여기서는 중복 정의하지 않음
  let found=false;
  document.querySelectorAll('.tab').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    if(oc.includes("'"+t+"'")){sw(t,b);found=true;}
  });
  if(!found){
    curTab=t;openDetails={};
    // 바텀 네비 동기화 (sw()를 통하지 않는 경로)
    if(typeof window._syncBnav === 'function'){
      window._syncBnav(t);
    } else {
      document.querySelectorAll('.bnav-item').forEach(b=>{
        const oc=b.getAttribute('onclick')||'';
        const _isOn=oc.includes("'"+t+"'");
        b.classList.toggle('on',_isOn);
        b.setAttribute('aria-selected',_isOn?'true':'false');/* [A11Y] */
      });
    }
    const fstrip=document.getElementById('fstrip');
    const _li = (typeof isLoggedIn!=='undefined' ? !!isLoggedIn : false) || !!window.isLoggedIn;
    if(fstrip) fstrip.style.display=(t==='total'&&_li&&!(typeof isSubAdmin!=='undefined'&&isSubAdmin))?'block':'none';
    const C=document.getElementById('rcont');
    if(C) C.innerHTML='';
    render();
  }
}

/* ── 캘린더 헬퍼 ─────────────────────────────────────── */

// 예정 경기 삭제 확인 모달
function _calConfirmDel(onConfirm){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:var(--z-modal-5);display:flex;align-items:center;justify-content:center;padding:16px';
  ov.innerHTML=`
    <div style="background:var(--white);border-radius:14px;padding:22px 20px 16px;max-width:300px;width:100%;box-shadow:0 10px 40px rgba(0,0,0,.3)">
      <div style="font-size:var(--fs-md);font-weight:800;color:var(--text);margin-bottom:10px">🗓️ 예정 경기 삭제</div>
      <div style="font-size:var(--fs-base);color:var(--text2);line-height:1.6;margin-bottom:18px">이 예정 경기를 삭제하시겠습니까?</div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button id="_calDelCancel" style="padding:7px 16px;border-radius:8px;border:1px solid var(--border2);background:var(--surface);font-size:var(--fs-base);font-weight:700;cursor:pointer;color:var(--text2)">취소</button>
        <button id="_calDelOk" style="padding:7px 16px;border-radius:8px;border:none;background:#EF4444;color:#fff;font-size:var(--fs-base);font-weight:700;cursor:pointer">삭제</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  const close=()=>{ try{ ov.remove(); }catch(e){} };
  ov.querySelector('#_calDelCancel').addEventListener('click', close);
  ov.querySelector('#_calDelOk').addEventListener('click', function(){ close(); onConfirm(); });
  ov.addEventListener('click', function(e){ if(e.target===ov) close(); });
}

// 저장 결과 토스트 (오프라인/에러 안내용)
function _calSaveToast(msg){
  try{
    const t=document.createElement('div');
    t.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1e293b;color:#fff;padding:10px 20px;border-radius:20px;font-size:var(--fs-base);font-weight:700;z-index:var(--z-top);pointer-events:none;box-shadow:0 4px 20px rgba(0,0,0,.3);white-space:nowrap';
    t.textContent=msg;
    document.body.appendChild(t);
    setTimeout(()=>{ try{ t.remove(); }catch(e){} }, 4000);
  }catch(e){}
}

/* ── 하단 네비 더보기 드로어 ────────────────────────────── */
(function(){
  window._bnavMoreToggle = function(btn){
    const d=document.getElementById('bnavMoreDrawer');
    if(!d) return;
    if(d.style.display!=='none'){ _bnavMoreClose(); return; }
    d.style.display='block';
    btn.classList.add('on');
  };
  window._bnavMoreClose = function(){
    const d=document.getElementById('bnavMoreDrawer');
    if(d) d.style.display='none';
    const btn=document.getElementById('bn5');
    if(btn) btn.classList.remove('on');
  };
  window._bnavMoreNav = function(tab){
    _bnavMoreClose();
    if(typeof swNav==='function') swNav(tab, null);
    document.querySelectorAll('.bnav-item').forEach(function(b){
      b.classList.remove('on'); b.setAttribute('aria-selected','false');
    });
    const moreBtn=document.getElementById('bn5');
    if(moreBtn) moreBtn.classList.add('on');
  };

  // 더보기 버튼 스타일 (style.css 이관 전 인젝션)
  const s=document.createElement('style');
  s.textContent=
    '.bnav-more-btn{display:flex;flex-direction:column;align-items:center;gap:4px;' +
    'padding:10px 4px 8px;border:none;background:var(--surface);border-radius:12px;' +
    'cursor:pointer;font-family:"Noto Sans KR",sans-serif;font-size:var(--fs-caption);font-weight:700;' +
    'color:var(--text2);transition:background .15s,transform .1s;width:100%}' +
    '.bnav-more-btn:active{transform:scale(.92);background:var(--border2)}' +
    'body.dark .bnav-more-btn{background:var(--surface);color:var(--text2)}';
  if(document.head) document.head.appendChild(s);
})();
