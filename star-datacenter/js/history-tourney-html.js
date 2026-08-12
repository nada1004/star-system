/* ══════════════════════════════════════════════════════════════
   대전기록 - 대회 탭 HTML (history-render-tabs.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

/* (요청, 2026-08-12) 대회 탭 하위 구분: 일반(tour_normal/comps) / 조별리그(tour) / 토너먼트(tour_bracket/tour_manual)
   stage: undefined 또는 'all'이면 전체, 'gen'|'league'|'bkt'로 필터링 */
function _histTourneyStageFilter(m, stage){
  if(!stage || stage==='all') return true;
  const src=m&&m._src||'';
  if(stage==='gen') return src==='tour_normal'||src==='comps';
  if(stage==='league') return src==='tour';
  if(stage==='bkt') return src==='tour_bracket'||src==='tour_manual';
  return true;
}

function histTourneyHTML(context, stage){
  const tourItems=(typeof getTourneyMatches==='function') ? getTourneyMatches() : [];
  const nmItems=(typeof getNormalMatchesForHistory==='function') ? getNormalMatchesForHistory() : [];
  const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
  const _sortDir = (typeof recSortDir!=='undefined' && (recSortDir==='asc' || recSortDir==='desc')) ? recSortDir : ((window.recSortDir==='asc'||window.recSortDir==='desc') ? window.recSortDir : 'desc');
  const compItems=[..._comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx,a:(m.a||m.u||''),b:(m.b||'')}));
  const allItems=[...tourItems,...nmItems,...compItems].filter(m=>{
    if(!m.a||!m.b) return false;
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return false;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return false;
    if(!_histTourneyStageFilter(m,stage)) return false;
    return typeof passDateFilter!=='function'||passDateFilter(m.d||'');
  });
  allItems.sort((a,b)=>_sortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const sortBar=``;
  if(!allItems.length){
    const _emptyMsg=stage==='gen'?'일반 기록이 없습니다':stage==='league'?'조별리그 기록이 없습니다':stage==='bkt'?'토너먼트 기록이 없습니다':'대회 기록이 없습니다';
    const _emptyIco=stage==='gen'?'📝':stage==='league'?'📅':stage==='bkt'?'🏆':'🎖️';
    return sortBar+`<div class="empty-state"><div class="empty-state-icon">${_emptyIco}</div><div class="empty-state-title">${_emptyMsg}</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  }
  // (요청, 2026-08-12) 티어대회 탭(일반 20개 단위 페이지네이션)과 동일하게,
  // 대회 탭도 하위탭별로 "더보기" 누적 로드형 페이지네이션을 적용
  const _pageKey = (stage && stage!=='all') ? `tourney-${stage}` : 'tourney';
  if(typeof histPage!=='undefined' && histPage[_pageKey]===undefined) histPage[_pageKey]=0;
  const _page = (typeof histPage!=='undefined' && histPage[_pageKey]) || 0;
  const _pageSize = (typeof getHistPageSize==='function') ? getHistPageSize() : 20;
  const _cap = (_page+1)*_pageSize;
  const _visibleItems = allItems.slice(0,_cap).map((m,idx)=>({m,idx}));
  const _hasMore = allItems.length>_cap;
  const groups={};
  _visibleItems.forEach(({m,idx})=>{
    const compName=m.n||m.compName||'기타 대회';
    if(!groups[compName]) groups[compName]=[];
    groups[compName].push({m,idx});
  });

  let h=sortBar;
  Object.entries(groups).forEach(([compName,items])=>{
    const startDate=items[items.length-1]?.m?.d||'';
    const endDate=items[0]?.m?.d||'';
    const dateRange=startDate===endDate?startDate:(startDate&&endDate?`${startDate} ~ ${endDate}`:'');
    h+=`<div style="background:linear-gradient(135deg,var(--blue-l) 0%,var(--white) 100%);border:1.5px solid var(--blue-ll);border-left:4px solid var(--blue);border-radius:12px;padding:12px 16px;margin:14px 0 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <span style="font-size:16px">🎖️</span>
      <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-md);color:var(--blue)">${compName}</span>
      ${dateRange?`<span style="font-size:var(--fs-caption);color:var(--gray-l)">${dateRange}</span>`:''}
      <span style="font-size:var(--fs-caption);font-weight:700;color:var(--blue);background:var(--blue-ll);border-radius:20px;padding:2px 10px;margin-left:auto">${items.length}경기</span>
    </div>`;

    const byDate={};
    items.forEach(({m,idx})=>{
      const k=m.d||'날짜 미정';
      if(!byDate[k]) byDate[k]=[];
      byDate[k].push({m,idx});
    });
    const days=['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
    Object.keys(byDate).sort((a,b)=>recSortDir==='asc'?a.localeCompare(b):b.localeCompare(a)).forEach(date=>{
      let dateLabel=date;
      if(date!=='날짜 미정'){
        const dt=new Date(date+'T00:00:00');
        dateLabel=`${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 ${days[dt.getDay()]}`;
      }
      h+=`<div style="margin-bottom:22px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:var(--fs-base);color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">📅 ${dateLabel}</div>
        </div>`;

      byDate[date].forEach(({m,idx})=>{
        const a=m.a||'',b=m.b||'';
        const ca=gc(a),cb=gc(b);
        const isDone=(m.sa!=null&&m.sb!=null);
        const aWin=isDone&&m.sa>m.sb;
        const bWin=isDone&&m.sb>m.sa;
        const key=`${context}-tourney-${idx}`;
        const rIdx=(m._src==='comps')?m._origIdx:-1;

        const grpBadge=m._src==='tour'
          ?`<span class="grp-meta-group" style="background:linear-gradient(135deg,${m.grpColor||'#2563eb'},${m.grpColor||'#2563eb'}cc);color:#fff;font-size:10px;font-weight:900;padding:2px 8px;border-radius:99px;letter-spacing:.5px;box-shadow:0 2px 6px ${m.grpColor||'#2563eb'}44">GROUP ${m.grpLetter||''}</span>`
          :m._src==='tour_normal'
          ?`<span style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:10px;font-weight:900;padding:2px 8px;border-radius:99px;letter-spacing:.5px">🎮 일반경기</span>`
          :'';
        const _rndBadge=m.rndLabel?`<span style="background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;font-size:10px;font-weight:900;padding:2px 10px;border-radius:99px;letter-spacing:.5px;box-shadow:0 2px 6px rgba(37,99,235,.30)">${m.rndLabel}</span>`:'';

        const _ab = (typeof _collectMatchTeamMembersAB === 'function') ? _collectMatchTeamMembersAB(m) : {a:[], b:[]};
        const aMembers=_ab.a||[];
        const bMembers=_ab.b||[];
        const aMemJson=JSON.stringify(aMembers).replace(/"/g,"'");
        const bMemJson=JSON.stringify(bMembers).replace(/"/g,"'");

        const _sideAB={a:aMembers,b:bMembers};
        const _sideM={...m,a,b,teamAMembers:aMembers,teamBMembers:bMembers};
        const _sidePanel=(typeof window._buildRecSideProfilePanel==='function')
          ? window._buildRecSideProfilePanel(_sideM, _sideAB, aWin, bWin, ca, cb)
          : {left:'', right:''};
        const _hasSide=!!((_sidePanel.left||'')||(_sidePanel.right||''));

        const _menuActions=[
          isLoggedIn&&m._src==='tour'?{t:'✏️ 수정',d:'경기 수정',kind:'normal',on:()=>leagueEditMatch(m._tnId,m._gi,m._mi)}:null,
          isLoggedIn&&m._src==='tour_bracket'?{t:'✏️ 결과 입력',d:'대진표 경기 결과 입력',kind:'normal',on:()=>{const _bk=m._bktKey||'';const _bkp=_bk.split('-');const _r=parseInt(_bkp[0]);const _bmi=parseInt(_bkp[1]);if(typeof openBracketMatchModal==='function')openBracketMatchModal(m._tnId,_r,_bmi,m.a,m.b);}}:null,
          isLoggedIn&&m._src==='tour_manual'?{t:'✏️ 결과 입력',d:'수동 경기 결과 입력',kind:'normal',on:()=>{if(typeof openBracketMatchModal==='function')openBracketMatchModal(m._tnId,-1,m._manualIdx,m.a,m.b);}}:null,
          isLoggedIn&&m._src==='tour_normal'?{t:'✏️ 수정',d:'경기 수정',kind:'normal',on:()=>{if(typeof nmStartEdit==='function')nmStartEdit(m._tnId,m._nmi);}}:null,
          {t:'🎴 공유카드',d:'공유용 카드 생성',kind:'accent',on:()=>window._openShareMatchObjCard&&window._openShareMatchObjCard(_getHistTourneyMatchObj(idx,context,stage))},
          isLoggedIn&&m._src==='tour'&&!isSubAdmin?{t:'🗑️ 삭제',d:'경기 삭제',kind:'danger',on:()=>typeof grpDelMatch==='function'&&grpDelMatch(m._tnId,m._gi,m._mi)}:null,
          isLoggedIn&&m._src==='tour_bracket'&&!isSubAdmin?{t:'🗑️ 결과 삭제',d:'대진표 결과 초기화',kind:'danger',on:()=>{const _bk=m._bktKey||'';const _bkp=_bk.split('-');const _r=parseInt(_bkp[0]);const _bmi=parseInt(_bkp[1]);if(typeof bktClearMatchResult==='function')bktClearMatchResult(m._tnId,_r,_bmi);}}:null,
          isLoggedIn&&m._src==='tour_manual'&&!isSubAdmin?{t:'🗑️ 삭제',d:'수동 경기 삭제',kind:'danger',on:()=>{if(typeof bktDelManualMatch==='function')bktDelManualMatch(m._tnId,m._manualIdx);}}:null,
          isLoggedIn&&m._src==='tour_normal'&&!isSubAdmin?{t:'🗑️ 삭제',d:'경기 삭제',kind:'danger',on:()=>{if(typeof nmDelMatch==='function')nmDelMatch(m._tnId,m._nmi);}}:null,
          isLoggedIn&&rIdx>=0&&!isSubAdmin&&(m._src==='comps'||!m._src)?{t:'🗑️ 삭제',d:'경기 삭제',kind:'danger',on:()=>null}:null
        ].filter(Boolean);
        const _menuBtn=(_menuActions.length&&typeof _compActionMenuHTML==='function')?_compActionMenuHTML(_menuActions):'';

        const _hexRgb=(h)=>{const s=String(h||'').replace('#','');if(s.length===6){const r=parseInt(s.slice(0,2),16),g=parseInt(s.slice(2,4),16),b=parseInt(s.slice(4,6),16);if(![r,g,b].some(isNaN))return r+','+g+','+b;}return'100,116,139';};
        const _sideRgbVars=`--rec-side-left-rgb:${_hexRgb(ca||'#3b82f6')};--rec-side-right-rgb:${_hexRgb(cb||'#ef4444')};`;
        const _winCol=(aWin||bWin)?(aWin?ca:cb):'#64748b';
        const _winRgb=_hexRgb(_winCol);
        const _fxCfg=(typeof _getRecSideFxCfg==='function')?_getRecSideFxCfg():{on:true,mode:'soft',intensity:68,length:25};
        const _fxOn=!!_fxCfg.on;
        const _fxMetrics=(typeof _buildRecSideFxMetrics==='function')?_buildRecSideFxMetrics(_fxCfg):null;
        const _fxMode=_fxMetrics?_fxMetrics.mode:'soft';
        const _fxVars=(_fxOn&&typeof _recSideFxVarStyle==='function')?_recSideFxVarStyle(ca||'#3b82f6',cb||'#ef4444',_fxCfg):'';

        h+=`<div class="grp-match-wrap">
          <div class="grp-card-meta-bar no-export" style="display:flex;align-items:center;gap:6px;margin-bottom:4px;flex-wrap:wrap">
            ${grpBadge}
            ${_rndBadge}
            <span class="grp-meta-spacer" style="flex:1"></span>
            ${_menuBtn?`<span class="grp-meta-menu">${_menuBtn}</span>`:''}
          </div>
          <div class="grp-match-card match-card-v3 tc-card${_fxOn?' grp-sidefx grp-sidefx--'+_fxMode:''}${_hasSide?' has-side-panels':''}" style="--tc-win-rgb:${_winRgb};${_sideRgbVars}${_fxVars}background:var(--white);border:1px solid var(--border);border-left:4px solid ${ca||'var(--blue)'};border-right:4px solid ${cb||'var(--blue)'};border-radius:22px;box-shadow:0 14px 32px rgba(15,23,42,.06);cursor:pointer" onclick="toggleDetail('${key}')">
            ${_sidePanel.left||''}
            <div class="grp-match-main" style="flex:1;display:flex;align-items:center;gap:var(--tc-vs-gap,12px);justify-content:center;flex-wrap:wrap">
              <div class="grp-team-col" style="display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;min-width:100px">
                <div class="grp-team-chip" style="--chip-col:${ca||'#888'};display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,color-mix(in srgb, var(--chip-col) 92%, #ffffff 8%),color-mix(in srgb, var(--chip-col) 78%, #000000 22%));padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.26);cursor:pointer" onclick="event.stopPropagation();openUnivModal('${a}')">
                  <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${a||'—'}</span>
                  ${(()=>{const url=(typeof UNIV_ICONS!=='undefined'&&UNIV_ICONS[a])||((typeof univCfg!=='undefined'&&Array.isArray(univCfg))?((univCfg.find(x=>x.name===a)||{}).icon||''):'');return url?`<img class="tc-uicon" src="${typeof toHttpsUrl==='function'?toHttpsUrl(url):url}" style="width:var(--tc-uicon);height:var(--tc-uicon);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px);clip-path:var(--su_tc_uicon_clip,none);flex-shrink:0" onerror="this.style.display='none'">`:'';})()}
                </div>
                ${aMembers.length?`<button class="grp-mem-btn" style="--mem-col:${(isDone&&bWin)?'#94a3b8':(ca||'#3b82f6')};${(isDone&&bWin)?'opacity:.45;filter:grayscale(1);':''}" onclick="event.stopPropagation();openProMembersPopup('${a.replace(/'/g,"\\'")}','${ca}',${aMemJson})"><span class="mem-ico">👥</span><span>${aMembers.length}명</span></button>`:''}
              </div>
              <div class="grp-score-col" style="display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;min-width:80px">
                <div class="grp-match-score score-click"><span class="">${m.sa||0}</span><span class="score-sep" style="color:var(--text2);font-size:0.72em;font-weight:900;margin:0 5px;opacity:0.8">:</span><span class="">${m.sb||0}</span></div>
              </div>
              <div class="grp-team-col" style="display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;min-width:100px">
                <div class="grp-team-chip" style="--chip-col:${cb||'#888'};display:flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,color-mix(in srgb, var(--chip-col) 92%, #ffffff 8%),color-mix(in srgb, var(--chip-col) 78%, #000000 22%));padding:10px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.26);cursor:pointer" onclick="event.stopPropagation();openUnivModal('${b}')">
                  ${(()=>{const url=(typeof UNIV_ICONS!=='undefined'&&UNIV_ICONS[b])||((typeof univCfg!=='undefined'&&Array.isArray(univCfg))?((univCfg.find(x=>x.name===b)||{}).icon||''):'');return url?`<img class="tc-uicon" src="${typeof toHttpsUrl==='function'?toHttpsUrl(url):url}" style="width:var(--tc-uicon);height:var(--tc-uicon);object-fit:contain;border-radius:var(--su_univ_logo_radius,10px);clip-path:var(--su_tc_uicon_clip,none);flex-shrink:0" onerror="this.style.display='none'">`:'';})()}
                  <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:14px;color:#fff">${b||'—'}</span>
                </div>
                ${bMembers.length?`<button class="grp-mem-btn" style="--mem-col:${(isDone&&aWin)?'#94a3b8':(cb||'#ef4444')};${(isDone&&aWin)?'opacity:.45;filter:grayscale(1);':''}" onclick="event.stopPropagation();openProMembersPopup('${b.replace(/'/g,"\\'")}','${cb}',${bMemJson})"><span class="mem-ico">👥</span><span>${bMembers.length}명</span></button>`:''}
              </div>
            </div>
            ${_sidePanel.right||''}
          </div>
          <div id="det-${key}" class="rec-detail-area">
            ${_regDet(key,{...m,_editRef:rIdx>=0?'comp:'+rIdx:''},  'comp',a,b,ca,cb,aWin,bWin, rIdx)}
            ${(()=>{const _memo=(rIdx>=0&&isLoggedIn)?`<input type="text" id="memo-${key}" placeholder="경기 메모..." value="${m.memo||''}" style="flex:1;font-size:var(--fs-sm)"><button class="btn btn-w btn-xs" onclick="saveMemo('comp',${rIdx},'memo-${key}')">💾 메모</button>${m.memo?`<button class="btn btn-r btn-xs" onclick="saveMemo('comp',${rIdx},null)">🗑️ 삭제</button>`:''}`:''; const _note=m.memo?`<div style="font-size:var(--fs-sm);color:var(--text2);background:var(--gold-bg);border:1px solid var(--gold-b);border-radius:6px;padding:6px 10px;margin-bottom:6px">📝 ${m.memo}</div>`:''; return (_memo||_note)?`<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)" class="no-export">${_note}<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">${_memo}</div></div>`:'';})()}
          </div>
        </div>`;
      });

      h+=`</div>`;
    });
  });
  // (요청, 2026-08-12) 티어대회 탭과 동일한 "더보기" 누적 로드형 페이지네이션 푸터
  if(allItems.length>_pageSize){
    h+=`<div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:14px;flex-wrap:wrap">
      <span style="font-size:var(--fs-sm);color:var(--gray-l)">${_visibleItems.length} / ${allItems.length}건 표시 중</span>
      ${_hasMore?`<button class="btn btn-sm" onclick="if(typeof histPage!=='undefined'){histPage['${_pageKey}']=${_page+1};}render()">더 보기 ↓</button>`:''}
      ${_page>0?`<button class="btn btn-sm btn-w" onclick="if(typeof histPage!=='undefined'){histPage['${_pageKey}']=0;}render()">처음으로</button>`:''}
    </div>`;
  }
  return h;
}

// 대회 탭 공유카드용 헬퍼
function _getHistTourneyMatchObj(idx, context, stage){
  const tourItems=(typeof getTourneyMatches==='function') ? getTourneyMatches() : [];
  const nmItems=(typeof getNormalMatchesForHistory==='function')?getNormalMatchesForHistory():[];
  const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
  const _sortDir = (typeof recSortDir!=='undefined' && (recSortDir==='asc' || recSortDir==='desc')) ? recSortDir : ((window.recSortDir==='asc'||window.recSortDir==='desc') ? window.recSortDir : 'desc');
  const compItems=[..._comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx}));
  const all=[...tourItems,...nmItems,...compItems].filter(m=>{
    if(!m.a||!m.b) return false;
    if(m.sa==null||m.sb==null) return false;
    if(!_histTourneyStageFilter(m,stage)) return false;
    return typeof passDateFilter!=='function'||passDateFilter(m.d||'');
  });
  all.sort((a,b)=>_sortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  const m = all[idx]||null;
  if(!m) return null;
  const _stage = m._src==='tour_normal'?'league':(m.stage||'league');
  const _grpName = m._src==='tour_normal'?'일반경기':(m.grpName||'');
  return {...m,_matchType:'comp',compName:m.compName||m.n||'',teamALabel:m.teamALabel||m.a||'',teamBLabel:m.teamBLabel||m.b||'',stage:_stage,grpName:_grpName};
}




/* (요청, 2026-08-10) 대전기록 > 대회 탭 보기모드(그리드/컴팩트 테이블형)용
   경기 목록 — histTourneyHTML과 동일한 소스/필터/정렬을 사용한다. */
function histTourneyAltMatches(stage){
  const tourItems=(typeof getTourneyMatches==='function') ? getTourneyMatches() : [];
  const nmItems=(typeof getNormalMatchesForHistory==='function') ? getNormalMatchesForHistory() : [];
  const _comps = (typeof comps!=='undefined' && Array.isArray(comps)) ? comps : [];
  const _sortDir = (typeof recSortDir!=='undefined' && (recSortDir==='asc' || recSortDir==='desc')) ? recSortDir : 'desc';
  const compItems=[..._comps].map((m,origIdx)=>({...m,_src:'comps',_origIdx:origIdx,a:(m.a||m.u||''),b:(m.b||'')}));
  const all=[...tourItems,...nmItems,...compItems].filter(m=>{
    if(!m.a||!m.b) return false;
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return false;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return false;
    if(!_histTourneyStageFilter(m,stage)) return false;
    return typeof passDateFilter!=='function'||passDateFilter(m.d||'');
  });
  all.sort((a,b)=>_sortDir==='asc'?(a.d||'').localeCompare(b.d||''):(b.d||'').localeCompare(a.d||''));
  return all;
}
if(typeof window!=='undefined') window.histTourneyAltMatches=histTourneyAltMatches;
