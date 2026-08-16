/* ══════════════════════════════════════════════════════════════
   프로리그 대회 - 조별리그 / 대진표 기록 / 팀전 / 중장전 탭 보기모드 확장
   (신규기능, 2026-08-10, histviewmodes11)
   "프로리그 끝장전" 탭에 이미 적용된 4종 보기모드
   (기본 / 미니 기본 / 그리드 / 컴팩트 테이블형)를
   프로리그 대회 서브탭에도 동일하게 제공한다.
   기존 화면(카드/필터/입력 UI)은 '기본' 모드로 그대로 유지된다.
   ══════════════════════════════════════════════════════════════ */

// 보기모드 상태는 history-tab-alt-views.js의 get/setHistTabViewMode를 그대로 재사용
// (localStorage 키: su_hist_tab_view_mode_<tabId>)
const PC_ALT_TAB_IDS = ['pcleague', 'pctourmatch', 'pcteam', 'pcgj'];

const _PC_ALT_TYPE_INFO = {
  pcleague:    { lbl: '조별리그',    col: '#2563eb' },
  pctourmatch: { lbl: '대진표 기록', col: '#7c3aed' },
  pcteam:      { lbl: '팀전',        col: '#0891b2' },
  pcgj:        { lbl: '중장전',      col: '#16a34a' },
  // 개인전 형태(승자/패자)로 그리는 항목들
  procomp:     { lbl: '조별리그',    col: '#2563eb' },
  procompbkt:  { lbl: '대진표 기록', col: '#7c3aed' },
  procompteam: { lbl: '팀전',        col: '#0891b2' },
  procompgj:   { lbl: '중장전',      col: '#16a34a' },
};

// 보기모드 버튼줄 (bare=true면 기존 버튼줄 안에 이어붙일 수 있게 버튼만 반환)
function pcAltViewModeBarHTML(tabId, bare){
  if(typeof histTabViewModeBarHTML !== 'function') return '';
  return histTabViewModeBarHTML(tabId, bare);
}
function pcAltViewMode(tabId){
  return (typeof getHistTabViewMode === 'function') ? getHistTabViewMode(tabId) : 'basic';
}

// 각 탭 데이터를 종합탭 렌더러가 쓰는 {type,d,m,idx} 형태로 정규화
function _pcAltItems(tabId, tn){
  const items = [];
  if(!tn) return items;

  if(tabId === 'pcleague'){
    (tn.groups||[]).forEach((grp, gi)=>{
      if(!grp) return;
      (grp.matches||[]).forEach((m, mi)=>{
        if(!m || !m.a || !m.b) return;
        if(m._stageRecId || (grp._recTarget||'') === 'stage') return;
        if(!m.winner) return;
        const wName = m.winner === 'A' ? m.a : m.b;
        const lName = m.winner === 'A' ? m.b : m.a;
        items.push({ type:'procomp', d:m.d||'', idx:mi, m:{ wName, lName, d:m.d||'', map:m.map||'' } });
      });
    });
  } else if(tabId === 'pctourmatch'){
    // 대진표(브라켓) + 라운드별 입력기록(stageRecords) 통합
    const pushInd = (a, b, winner, d, map)=>{
      if(!a || !b || !winner) return;
      const wName = winner === 'A' ? a : winner === 'B' ? b : winner;
      const lName = (wName === a) ? b : a;
      items.push({ type:'procompbkt', d:d||'', idx:items.length, m:{ wName, lName, d:d||'', map:map||'' } });
    };
    const round = String(window._pcStageRecRound||'').trim();
    const roundOK = (lbl)=> (!round || round === 'ALL') ? true : (String(lbl||'') === round);
    try{
      if(Array.isArray(tn.bracket)){
        const total = tn.bracket.length;
        tn.bracket.forEach((rnd, ri)=>{
          let lbl = '';
          if(total){
            if(ri === total-1) lbl = '결승';
            else if(ri === total-2) lbl = '4강';
            else if(ri === total-3) lbl = '8강';
            else lbl = `${Math.pow(2, total-ri)}강`;
          }
          if(!roundOK(lbl)) return;
          (rnd||[]).forEach((m)=>{
            if(!m || !m.a || !m.b) return;
            const games = (Array.isArray(m._games) && m._games.length)
              ? m._games.filter(g=>g && g.winner)
              : (m.winner ? [{winner:m.winner, map:m.map||''}] : []);
            if(!games.length) return;
            const sa = games.filter(g=>g.winner==='A').length;
            const sb = games.filter(g=>g.winner==='B').length;
            const w = sa>sb ? 'A' : sb>sa ? 'B' : (m.winner||'');
            pushInd(m.a, m.b, w, m.d||'', games.length===1 ? (games[0].map||m.map||'') : '');
          });
        });
      }
    }catch(e){}
    Object.keys(tn.stageRecords||{}).forEach(rndKey=>{
      if(!roundOK(rndKey)) return;
      (tn.stageRecords[rndKey]||[]).forEach(m=>{
        if(!m || !m.a || !m.b) return;
        pushInd(m.a, m.b, m.winner, m.d||'', m.map||'');
      });
    });
  } else if(tabId === 'pcteam'){
    (tn.teamMatches||[]).forEach((tm, i)=>{
      if(!tm) return;
      items.push({ type:'procompteam', d:tm.d||'', idx:i, m:{
        a: tm.teamAName||'A팀', b: tm.teamBName||'B팀',
        sa: tm.sa!=null?tm.sa:'', sb: tm.sb!=null?tm.sb:'', d: tm.d||'', map:''
      }});
    });
  } else if(tabId === 'pcgj'){
    (tn.gjMatches||[]).forEach((sess, i)=>{
      if(!sess || !sess.a || !sess.b) return;
      const p1w = (sess.games||[]).filter(g=>g.winner===sess.a).length;
      const p2w = (sess.games||[]).filter(g=>g.winner===sess.b).length;
      items.push({ type:'procompgj', d:sess.d||'', idx:i, m:{
        a: sess.a, b: sess.b, sa: p1w, sb: p2w, d: sess.d||'', map:''
      }});
    });
  }

  const _asc = (typeof recSortDir !== 'undefined') && recSortDir === 'asc';
  items.sort((a,b)=>_asc?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  return items;
}

// 보기모드가 '기본'이 아닐 때 대신 렌더할 HTML (없으면 '' 반환 → 기본 화면 유지)
function pcAltRecordsHTML(tabId, tn){
  const mode = pcAltViewMode(tabId);
  if(mode === 'basic') return '';
  const items = _pcAltItems(tabId, tn);
  if(!items.length){
    return `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  }
  if(mode === 'broadcast' && typeof histBroadcastModeHTML === 'function') return histBroadcastModeHTML(items, _PC_ALT_TYPE_INFO);
  if(mode === 'grid' && typeof histAllGridModeHTML === 'function') return histAllGridModeHTML(items, _PC_ALT_TYPE_INFO);
  if(mode === 'compact' && typeof histAllCompactTableModeHTML === 'function') return histAllCompactTableModeHTML(items, _PC_ALT_TYPE_INFO);
  if(typeof _histCardGridWithDayHeaders === 'function') return _histCardGridWithDayHeaders(items, _PC_ALT_TYPE_INFO);
  return '';
}

if(typeof window !== 'undefined'){
  window.pcAltViewModeBarHTML = pcAltViewModeBarHTML;
  window.pcAltViewMode = pcAltViewMode;
  window.pcAltRecordsHTML = pcAltRecordsHTML;
}
