function recSummaryListHTMLFiltered(arr,mode,ctxPrefix,filterUniv,pageOpts){
  if(!arr.length)return`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  const isCKmode=(mode==='ck'||mode==='pro'||mode==='tt');
  const _editMode = (mode==='civil') ? 'mini' : mode;
  // (정렬 보강) 티어대회 등 filtered 목록도 "입력 순서"가 아니라 날짜 기준으로 정렬
  // - 사용자가 과거 날짜 경기를 나중에 저장하면 unshift 때문에 최신순이 깨질 수 있음
  const _normDateSort = (d)=>{
    const s = String(d||'').trim();
    if(!s) return '';
    const m = s.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if(m){
      const y=m[1];
      const mo=String(parseInt(m[2],10)).padStart(2,'0');
      const da=String(parseInt(m[3],10)).padStart(2,'0');
      return `${y}-${mo}-${da}`;
    }
    return s;
  };
  let h='';
  let _filtered=false;
  // 유효 경기만 모아 렌더(그룹 요약 제거 요청)
  const list=[];
  arr.forEach((m, _origIdx)=>{
    if(isCKmode){if(mode!=='tt'&&(!m.teamAMembers||!m.teamBMembers)) return;}
    else{if(!m.a||!m.b) return;}
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return;
    if(typeof passDateFilter==='function' && !passDateFilter(m.d||'', mode))return;
    _filtered=true;
    list.push({m, _origIdx});
  });

  function _renderItem(m){
    const srcArr=mode==='mini'?miniM:mode==='univm'?univM:mode==='pro'?proM:mode==='tt'?ttM:ckM;
    const i=srcArr.indexOf(m);
    const isCK=isCKmode;
    const _sideCols = mode==='ck' ? getFixedSideColors('ck') : mode==='pro' ? getFixedSideColors('pro') : getFixedSideColors('tt');
    const ca=isCK?_sideCols.a:gc(m.a);const cb=isCK?_sideCols.b:gc(m.b);
    const rawLA2=(m.teamALabel||'').replace(/^\$\{.*\}$/,'');
    const rawLB2=(m.teamBLabel||'').replace(/^\$\{.*\}$/,'');
    const labelA=isCK?(rawLA2||'A팀'):m.a;const labelB=isCK?(rawLB2||'B팀'):m.b;
    const aWin=(m.sa>m.sb),bWin=(m.sb>m.sa);
    const col=gc(filterUniv);
    const isA=(!isCK&&m.a===filterUniv)||(isCK&&(m.teamAMembers||[]).some(x=>x.univ===filterUniv));
    const isB=(!isCK&&m.b===filterUniv)||(isCK&&(m.teamBMembers||[]).some(x=>x.univ===filterUniv));
    const myWin=(isA&&aWin)||(isB&&bWin);
    const key=`${ctxPrefix}-${mode}-${i}`;
    const MODE_COL = {
      ind:'#2563eb', gj:'#dc2626', progj:'#b91c1c',
      mini:'#7c3aed', civil:'#a855f7',
      univm:'#16a34a', ck:'#f59e0b', pro:'#0ea5e9',
      tt:'#10b981', comp:'#3b82f6', tourney:'#7c3aed',
      procomp:'#2563eb', procomptn:'#7c3aed'
    };
    const _mc = MODE_COL[mode] || '#64748b';
    const _rgb = (hex)=>{const h=String(hex||'').replace('#',''); if(h.length!==6) return '100,116,139'; const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return `${r},${g},${b}`;};
    const _pms=_collectMatchParticipantsAny(m);
    const _pmJson=JSON.stringify(_pms).replace(/"/g,"'");
    const _pmCol=(aWin?ca:bWin?cb:(ca||cb||'#64748b'));
    const _ab=_collectMatchTeamMembersAB(m);
    const _aMemJson=JSON.stringify(_ab.a||[]).replace(/"/g,"'");
    const _bMemJson=JSON.stringify(_ab.b||[]).replace(/"/g,"'");
    // ── 양쪽 끝 참여자 프로필 패널 ──
    const _sidePanelHTML = (typeof window._buildRecSideProfilePanel === 'function')
      ? window._buildRecSideProfilePanel(m, _ab, aWin, bWin, ca, cb)
      : {left:'', right:''};
    h+=`<div class="rec-summary rec-mode-${mode}${_recSideFxClass(mode)}" data-rec-mode="${mode}" style="--rec-mode-col:${_mc};--rec-mode-rgb:${_rgb(_mc)};${_recSideFxStyle(mode,ca,cb)}">
      <div class="rec-sum-header rec-sum-header--stack" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleDetail('${key}');}" onclick="(function(e){if(e.target.closest('button,a,[data-player-link],[onclick]:not(.rec-sum-header)'))return;toggleDetail('${key}');})(event)">
        <div class="rec-topline">
          <div class="rec-meta-row">
            ${m.t?`<span class="rec-meta-chip">${m.t}</span>`:''}
            ${(m.n&&mode!=='comp')?`<span class="rec-meta-chip rec-meta-chip--note">${m.n}</span>`:''}
            ${m.caster?`<span class="rec-meta-chip" style="background:#fef3c7;color:#92400e;border:1px solid #f59e0b55">🎙️ ${m.caster}</span>`:''}
          </div>
          <div class="rec-actions rec-actions--inline no-export">
            ${(_pms.length && mode!=='tt')?`<button class="btn btn-w btn-xs rc-mem-btn" onclick="event.stopPropagation();openProMembersPopup('참여자', '${_pmCol}', ${_pmJson})">👥 ${_pms.length}</button>`:''}
            <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
              onclick="openRecActionMenu(event,{
                _btnEl:this,
                mid:'${String(m._id||m.sid||'').replace(/'/g,"\\'")}',
                a:'${(m.a||'').replace(/'/g,"\\'")}',
                sa:${m.sa||0},
                b:'${(m.b||'').replace(/'/g,"\\'")}',
                sb:${m.sb||0},
                d:'${m.d||''}',
                mode:'${mode}',
                idx:${i},
                key:'${key}',
                canShare:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?'true':'false';})()},
                canEdit:${(isLoggedIn && !isSubAdmin)?'true':'false'},
                canDel:${(isLoggedIn && !isSubAdmin)?'true':'false'},
                canMove:${['mini','univm','comp','tt','ck','pro'].includes(String(mode||''))?'true':'false'}
              })">⋯</button>
          </div>
        </div>
        <div class="rec-sum-vs-outer">
          ${_sidePanelHTML.left}
          <div class="rec-sum-vs">
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
              <span class="ubadge${aWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${ca};display:inline-flex;align-items:center;gap:4px" onclick="openUnivModal('${isCK?'':m.a}')">${(()=>{const n=isCK?'':m.a;const url=UNIV_ICONS[n]||(univCfg.find(x=>x.name===n)||{}).icon||'';return url?`<img src="${toHttpsUrl(url)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`:''})()}<span class="rec-team-name">${labelA}</span></span>
              ${(_ab.a||[]).length?`<button class="btn btn-xs rc-mem-btn" style="background:${ca}12;border:1px solid ${ca}40;color:${ca};font-weight:800" onclick="event.stopPropagation();openProMembersPopup('${labelA.replace(/'/g,"\\'")}', '${ca}', ${_aMemJson})">👥 ${(_ab.a||[]).length}명</button>`:''}
            </div>
            <div class="rec-sum-score score-click" onclick="toggleDetail('${key}')"><span class="${aWin?'wt':bWin?'lt':'pt-z'}">${m.sa}</span><span class="score-sep" style="color:var(--text2);font-size:0.72em;font-weight:900;margin:0 4px;opacity:0.8">:</span><span class="${bWin?'wt':aWin?'lt':'pt-z'}">${m.sb}</span></div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
              <span class="ubadge${bWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${cb};display:inline-flex;align-items:center;gap:4px" onclick="openUnivModal('${isCK?'':m.b}')">${(()=>{const n=isCK?'':m.b;const url=UNIV_ICONS[n]||(univCfg.find(x=>x.name===n)||{}).icon||'';return url?`<img src="${toHttpsUrl(url)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`:''})()}<span class="rec-team-name">${labelB}</span></span>
              ${(_ab.b||[]).length?`<button class="btn btn-xs rc-mem-btn" style="background:${cb}12;border:1px solid ${cb}40;color:${cb};font-weight:800" onclick="event.stopPropagation();openProMembersPopup('${labelB.replace(/'/g,"\\'")}', '${cb}', ${_bMemJson})">👥 ${(_ab.b||[]).length}명</button>`:''}
            </div>

          </div>
          ${_sidePanelHTML.right}
        </div>
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,{...m,_editRef:`${_editMode}:${i}`},mode,labelA,labelB,ca,cb,aWin,bWin, i)}
      </div>
    </div>`;
  }

  // 날짜 정렬(기본: 최신순). 같은 날짜면 원래 배열 순서를 유지
  try{
    const dir = (typeof recSortDir!=='undefined' && recSortDir==='asc') ? 'asc' : 'desc';
    list.sort((x,y)=>{
      const dx=_normDateSort(x.m?.d||''), dy=_normDateSort(y.m?.d||'');
      const cmp = dir==='asc' ? dx.localeCompare(dy) : dy.localeCompare(dx);
      if(cmp!==0) return cmp;
      return (x._origIdx||0) - (y._origIdx||0);
    });
  }catch(e){}
  // 페이지네이션 설정
  const _pgSize = (pageOpts && pageOpts.pageSize) ? pageOpts.pageSize : 0; // 0=비활성
  const _pgKey  = (pageOpts && pageOpts.pageKey)  ? pageOpts.pageKey  : null;

  // 날짜별 그룹화 렌더
  const _daysF=['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
  const _byDateF={};
  list.forEach(x=>{const k=_normDateSort(x.m?.d||'')||'날짜 미정';if(!_byDateF[k])_byDateF[k]=[];_byDateF[k].push(x.m);});
  const _dateKeysF=Object.keys(_byDateF).sort((a,b)=>{
    const dir=(typeof recSortDir!=='undefined'&&recSortDir==='asc')?'asc':'desc';
    return dir==='asc'?a.localeCompare(b):b.localeCompare(a);
  });

  if(_pgSize > 0 && _pgKey) {
    // ── 페이지네이션 모드 ──
    // list(평탄화된 경기 배열)를 페이지 단위로 자르고, 날짜 헤더를 붙여 렌더
    const _curPage = (window._ttPageMap && window._ttPageMap[_pgKey] != null) ? window._ttPageMap[_pgKey] : 0;
    const _totalItems = list.length;
    const _totalPages = Math.ceil(_totalItems / _pgSize);
    const _safePage = Math.min(_curPage, Math.max(0, _totalPages - 1));
    const _sliced = list.slice(_safePage * _pgSize, (_safePage + 1) * _pgSize);

    // 슬라이스된 항목을 날짜 기준으로 재그룹화
    const _byDatePage = {};
    _sliced.forEach(x => {
      const k = _normDateSort(x.m?.d || '') || '날짜 미정';
      if (!_byDatePage[k]) _byDatePage[k] = [];
      _byDatePage[k].push(x.m);
    });
    const _dkPage = Object.keys(_byDatePage).sort((a, b) => {
      const dir = (typeof recSortDir !== 'undefined' && recSortDir === 'asc') ? 'asc' : 'desc';
      return dir === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
    });
    _dkPage.forEach(dk => {
      let _dkLabel = dk;
      if (dk !== '날짜 미정' && dk.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const dt = new Date(dk + 'T00:00:00');
        _dkLabel = `${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 ${_daysF[dt.getDay()]}`;
      }
      h += `<div style="margin-bottom:22px"><div class="rec-date-header" style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">📅 ${_dkLabel}</div></div>`;
      _byDatePage[dk].forEach(m => _renderItem(m));
      h += `</div>`;
    });

    // 페이지네이션 UI
    if (_totalPages > 1) {
      const _pgStart = _safePage * _pgSize + 1;
      const _pgEnd   = Math.min((_safePage + 1) * _pgSize, _totalItems);
      const _btnBase = `style="display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 10px;border-radius:8px;border:1.5px solid;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s"`;
      const _btnOn   = `background:linear-gradient(135deg,#064e3b,#10b981);border-color:#10b981;color:#fff;box-shadow:0 4px 12px rgba(16,185,129,.30)`;
      const _btnOff  = `background:var(--card,#fff);border-color:var(--border,#e2e8f0);color:var(--text,#334155)`;
      const _btnDis  = `background:var(--card,#fff);border-color:var(--border,#e2e8f0);color:var(--gray-l,#94a3b8);cursor:not-allowed;opacity:0.5`;

      let _pgBtns = '';
      // 이전 버튼
      _pgBtns += `<button ${_btnBase} style="${_safePage===0?_btnDis:_btnOff}" onclick="if(${_safePage}>0){window._ttPageMap=window._ttPageMap||{};window._ttPageMap['${_pgKey}']=${_safePage}-1;render()}" ${_safePage===0?'disabled':''}>◀</button>`;
      // 페이지 번호 버튼 (최대 5개 슬라이딩 윈도우)
      const _winSize = 5;
      let _pgFrom = Math.max(0, _safePage - Math.floor(_winSize/2));
      let _pgTo   = Math.min(_totalPages - 1, _pgFrom + _winSize - 1);
      if (_pgTo - _pgFrom < _winSize - 1) _pgFrom = Math.max(0, _pgTo - _winSize + 1);
      if (_pgFrom > 0) _pgBtns += `<button ${_btnBase} style="${_btnOff}" onclick="window._ttPageMap=window._ttPageMap||{};window._ttPageMap['${_pgKey}']=0;render()">1</button><span style="color:var(--gray-l,#94a3b8);padding:0 2px">…</span>`;
      for (let _pi = _pgFrom; _pi <= _pgTo; _pi++) {
        const _isOn = _pi === _safePage;
        _pgBtns += `<button ${_btnBase} style="${_isOn?_btnOn:_btnOff}" onclick="window._ttPageMap=window._ttPageMap||{};window._ttPageMap['${_pgKey}']=${_pi};render()">${_pi+1}</button>`;
      }
      if (_pgTo < _totalPages - 1) _pgBtns += `<span style="color:var(--gray-l,#94a3b8);padding:0 2px">…</span><button ${_btnBase} style="${_btnOff}" onclick="window._ttPageMap=window._ttPageMap||{};window._ttPageMap['${_pgKey}']=${_totalPages-1};render()">${_totalPages}</button>`;
      // 다음 버튼
      _pgBtns += `<button ${_btnBase} style="${_safePage===_totalPages-1?_btnDis:_btnOff}" onclick="if(${_safePage}<${_totalPages-1}){window._ttPageMap=window._ttPageMap||{};window._ttPageMap['${_pgKey}']=${_safePage}+1;render()}" ${_safePage===_totalPages-1?'disabled':''}>▶</button>`;

      h += `<div class="no-export" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:18px 0 24px">
        <div style="font-size:12px;color:var(--text2,#64748b);font-weight:600">${_totalItems}개 중 ${_pgStart}–${_pgEnd}번째 · 총 ${_totalPages}페이지</div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center">${_pgBtns}</div>
      </div>`;
    }
  } else {
    // ── 기존 전체 표시 모드 ──
    _dateKeysF.forEach(dk=>{
      let _dkLabel=dk;
      if(dk!=='날짜 미정'&&dk.match(/^\d{4}-\d{2}-\d{2}$/)){const dt=new Date(dk+'T00:00:00');_dkLabel=`${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 ${_daysF[dt.getDay()]}`;}
      h+=`<div style="margin-bottom:22px"><div class="rec-date-header" style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">📅 ${_dkLabel}</div></div>`;
      _byDateF[dk].forEach(m=>_renderItem(m));
      h+=`</div>`;
    });
  }

  if(!_filtered) return `<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  return h;
}

function recSummaryListHTML(arr, mode, context, extraFilter){
  const isCKmode=(mode==='ck'||mode==='pro'||mode==='tt');
  // civil 모드는 mini 배열을 공유하므로 editRef/저장 시 'mini' 키 사용
  const _editMode = (mode==='civil') ? 'mini' : mode;
  // 날짜 정규화(정렬용): 2026-4-2 같이 0이 빠진 날짜가 있으면 문자열 정렬이 깨질 수 있음
  const _normDateSort = (d)=>{
    const s = String(d||'').trim();
    if(!s) return '';
    // yyyy-mm-dd / yyyy.m.d / yyyy/m/d
    const m = s.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
    if(m){
      const y=m[1];
      const mo=String(parseInt(m[2],10)).padStart(2,'0');
      const da=String(parseInt(m[3],10)).padStart(2,'0');
      return `${y}-${mo}-${da}`;
    }
    return s;
  };
  // 기록 카드 스타일 설정 (localStorage 기반)
  function _rcGet(k, d){ try{ const v=localStorage.getItem(k); return v==null?d:v; }catch(e){ return d; } }
  const _rcThemeOn = _rcGet('su_rc_theme_on','1')==='1';
  const _rcAccent  = (_rcGet('su_rc_accent_mode','none')||'none').trim();
  const _rcMemoOn  = _rcGet('su_rc_memo_on','0')==='1';
  // (요청사항) 기록 카드 대학 로고를 더 크게 (스코어 영역과 밸런스)
  const _uiconPx   = Math.max(14, Math.min(34, parseInt(_rcGet('su_rc_uicon','24'),10)||24));
  function _hexToRgbStr(hex){
    const h=String(hex||'').replace('#','').trim();
    if(h.length===3){
      const r=parseInt(h[0]+h[0],16), g=parseInt(h[1]+h[1],16), b=parseInt(h[2]+h[2],16);
      if([r,g,b].some(x=>isNaN(x))) return '100,116,139';
      return `${r},${g},${b}`;
    }
    if(h.length>=6){
      const r=parseInt(h.slice(0,2),16), g=parseInt(h.slice(2,4),16), b=parseInt(h.slice(4,6),16);
      if([r,g,b].some(x=>isNaN(x))) return '100,116,139';
      return `${r},${g},${b}`;
    }
    return '100,116,139';
  }
  if(!window._recQ)window._recQ={};
  if(!arr.length){
    const emptyBar=``;
    return emptyBar+`<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc">기록이 추가되면 여기에 표시됩니다</div></div>`;
  }
  // 날짜 필터만 적용 (검색어 필터는 DOM에서 실시간 처리)
  // 필터된 부분 배열이 넘어올 수 있으므로 원본 배열에서 실제 인덱스를 구함
  // (filter()는 같은 객체 참조를 반환하므로 indexOf로 정확한 원본 인덱스 확인 가능)
  const _srcArr=(()=>{
    if(mode==='mini') return miniM;
    if(mode==='civil') return miniM; // 시빌워는 miniM 배열 공유
    if(mode==='univm') return univM;
    if(mode==='ck') return ckM;
    if(mode==='pro') return proM;
    if(mode==='tt') return ttM;
    if(mode==='comp') return comps;
    return arr;
  })();
  const _srcIdxById = new Map();
  try{
    if(Array.isArray(_srcArr)){
      _srcArr.forEach((x, idx)=>{
        const id = x && (x._id || x.sid || x.matchId);
        if(id!=null && String(id).trim()) _srcIdxById.set(String(id), idx);
      });
    }
  }catch(e){}
  let filtered=arr.map((m,i)=>{
    let srcIdx = (_srcArr!==arr) ? _srcArr.indexOf(m) : i;
    if(_srcArr!==arr && srcIdx < 0){
      const id = m && (m._id || m.sid || m.matchId);
      const k = (id!=null) ? String(id) : '';
      if(k && _srcIdxById.has(k)) srcIdx = _srcIdxById.get(k);
    }
    if(!Number.isFinite(srcIdx) || srcIdx < 0) srcIdx = i;
    return {m, i: srcIdx};
  }).filter(({m})=>{
    if(extraFilter&&!extraFilter(m)) return false;
    if(isCKmode){
      if(mode!=='tt'&&(!m.teamAMembers||!m.teamBMembers)) return false;
    } else {
      if(!m.a||!m.b) return false;
    }
    if(m.sa==null||m.sa===''||m.sb==null||m.sb==='') return false;
    if(isNaN(Number(m.sa))||isNaN(Number(m.sb))) return false;
    if(typeof passDateFilter==='function'&&!passDateFilter(m.d||'', mode)) return false;
    return true;
  });
  // 동일 날짜 내 정렬 보조키(최신이 위): 시간/생성시각 기반
  // - time: 숫자(ms) 또는 문자열
  // - t: 'HH:MM' 형태(존재할 경우)
  // - _id/sid: genId() = (Date.now base36 + random4) → 앞부분으로 생성시각 추정
  const _getMatchTs = (m, idx) => {
    try{
      // 1) time 필드
      if (m && typeof m.time === 'number') return m.time;
      if (m && typeof m.time === 'string' && m.time.trim()) {
        const n = Number(m.time);
        if (!isNaN(n) && isFinite(n)) return n;
      }
      // 2) t (HH:MM 또는 HH:MM:SS) → 날짜 없는 경우도 있어 보조키로만 사용
      if (m && typeof m.t === 'string' && m.t.includes(':')) {
        const parts = m.t.split(':').map(x=>Number(x));
        if (parts.length >= 2 && parts.every(x=>!isNaN(x))) {
          const hh = parts[0]||0, mm = parts[1]||0, ss = parts[2]||0;
          return hh*3600 + mm*60 + ss;
        }
      }
      // 3) genId 기반(_id/sid)
      const id = (m && (m._id || m.sid)) ? String(m._id || m.sid) : '';
      if (id && id.length > 4) {
        const prefix = id.slice(0, -4); // Date.now().toString(36)
        const t36 = parseInt(prefix, 36);
        if (!isNaN(t36) && isFinite(t36)) return t36;
      }
    }catch(e){}
    // 4) 최후: 배열 인덱스(대부분 unshift로 최신이 0번) → desc에서는 -idx가 최신 우선
    return -idx;
  };
  filtered.sort((a,b)=>{
    const da=_normDateSort(a.m.d||''), db=_normDateSort(b.m.d||'');
    const cmp=recSortDir==='asc'?da.localeCompare(db):db.localeCompare(da);
    if(cmp!==0) return cmp;
    // 동일 날짜일 때: (1) 시간/생성시각 (2) 원본 인덱스
    const ta=_getMatchTs(a.m, a.i);
    const tb=_getMatchTs(b.m, b.i);
    const cmp2 = recSortDir==='asc' ? (ta - tb) : (tb - ta);
    if (cmp2 !== 0) return cmp2;
    // asc(오래된→최신): unshift 기준이라 i가 클수록 오래됨
    return recSortDir==='asc' ? (b.i - a.i) : (a.i - b.i);
  });

  // ── 날짜(일자) 빠른 선택: ASL 스타일 날짜 메뉴(설정: su_date_menu_style) ──
  // 컨텍스트별로 날짜 선택값을 저장하여(예: hist / tiertour) 서로 간섭하지 않게 함
  const _dateMenuStyle = (localStorage.getItem('su_date_menu_style') || 'pill');
  const _datePickKey = `su_rec_date_pick_${context||'x'}_${mode}`;
  const _pickedDate = (localStorage.getItem(_datePickKey) || '').trim();
  const _baseFiltered = filtered.slice(); // 메뉴/카운트는 원본(일자 선택 전) 기준
  const _allDates = Array.from(new Set(_baseFiltered.map(x=>_normDateSort(x.m.d||'')).filter(Boolean))).sort((a,b)=>recSortDir==='asc'?a.localeCompare(b):b.localeCompare(a));
  if(_pickedDate && _allDates.includes(_pickedDate)){
    filtered = filtered.filter(x => _normDateSort(x.m.d||'') === _pickedDate);
  }
  const _dateMenuHTML = (()=>{
    if(_dateMenuStyle!=='asl' || !_allDates.length) return '';
    const daysS=['일','월','화','수','목','금','토'];
    // 모드별 날짜 버튼 색상 (시빌워는 시빌워 색상 사용)
    const _DATE_BTN_COL = {
      civil:'#b91c1c', progj:'#b91c1c',
      mini:'#7c3aed', univm:'#16a34a', ck:'#f59e0b', pro:'#0ea5e9',
      tt:'#10b981', comp:'#3b82f6', tourney:'#2563eb',
      ind:'#2563eb', gj:'#d97706',
      procomp:'#0891b2'
    };
    const _dateBtnCol = _DATE_BTN_COL[mode] || 'var(--blue)';
    const _dateBtnBg  = (()=>{
      // 각 모드 색상의 연한 배경
      const _colBgMap = {
        civil:'#fff1f2', progj:'#fff1f2',
        mini:'#f5f3ff', univm:'#f0fdf4', ck:'#fffbeb', pro:'#e0f2fe',
        tt:'#ecfdf5', comp:'#eff6ff', tourney:'#eff6ff',
        ind:'#eff6ff', gj:'#fffbeb',
        procomp:'#ecfeff'
      };
      return _colBgMap[mode] || '#eff6ff';
    })();
    const _mini = (m)=>{
      const isCK=(mode==='ck'||mode==='pro'||mode==='tt');
      const a=isCK?(String(m.teamALabel||'A팀').replace(/^\$\{.*\}$/,'')||'A팀'):(m.a||'');
      const b=isCK?(String(m.teamBLabel||'B팀').replace(/^\$\{.*\}$/,'')||'B팀'):(m.b||'');
      const ca=gc(a)||'#64748b', cb=gc(b)||'#64748b';
      const icon = (u, col)=>{
        const url=UNIV_ICONS[u]||(univCfg.find(x=>x.name===u)||{}).icon||'';
        if(url) return `<img src="${toHttpsUrl(url)}" style="width:14px;height:14px;object-fit:contain;border-radius:3px;flex-shrink:0" onerror="this.style.display='none'">`;
        return `<span style="width:10px;height:10px;border-radius:3px;background:${col};display:inline-block;flex-shrink:0"></span>`;
      };
      return `<div style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--text2);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
        <span style="display:inline-flex;align-items:center;gap:4px;min-width:0;flex:1">${icon(a,ca)}<span style="overflow:hidden;text-overflow:ellipsis">${a||'—'}</span></span>
        <span style="color:var(--gray-l);font-weight:900;flex-shrink:0">vs</span>
        <span style="display:inline-flex;align-items:center;gap:4px;min-width:0;flex:1;justify-content:flex-end">${icon(b,cb)}<span style="overflow:hidden;text-overflow:ellipsis">${b||'—'}</span></span>
      </div>`;
    };
    let h=`<div class="no-export" style="margin-bottom:10px;padding-bottom:10px;border-bottom:2px solid var(--border)">
      <div style="display:flex;gap:8px;overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none">`;
    const _onAll = !_pickedDate;
    h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','');histPage['${mode}']=0;render()" style="flex-shrink:0;min-width:92px;padding:10px 12px;border-radius:12px;border:1px solid ${_onAll?_dateBtnCol:'var(--border)'};background:${_onAll?_dateBtnBg:'var(--surface)'};cursor:pointer;text-align:left">
        <div style="font-weight:1000;font-size:12px;color:${_onAll?_dateBtnCol:'var(--text2)'}">전체</div>
        <div style="margin-top:6px;font-size:10px;color:var(--gray-l)">날짜 필터 해제</div>
      </button>`;
    _allDates.forEach(d0=>{
      const dt=new Date(d0+'T00:00:00');
      const label=`${daysS[dt.getDay()]} ${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}`;
      const ms=_baseFiltered
        .filter(x=>String(x.m.d||'').trim()===d0)
        .slice(0,2)
        .map(x=>_mini(x.m)).join('');
      const prev=ms?`<div style="margin-top:6px;display:flex;flex-direction:column;gap:4px">${ms}</div>`:'';
      const on=(_pickedDate===d0);
      const cnt=_baseFiltered.filter(x=>String(x.m.d||'').trim()===d0).length;
      h+=`<button type="button" onclick="localStorage.setItem('${_datePickKey}','${d0}');histPage['${mode}']=0;render()" style="flex-shrink:0;text-align:left;min-width:150px;max-width:240px;padding:10px 12px;border-radius:12px;border:1px solid ${on?_dateBtnCol:'var(--border)'};background:${on?_dateBtnBg:'var(--surface)'};cursor:pointer">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:1000;font-size:12px;color:${on?_dateBtnCol:'var(--text2)'}">${label}</span>
          <span style="margin-left:auto;font-size:10px;color:var(--gray-l);font-weight:900">${cnt?`기록 ${cnt}`:''}</span>
        </div>
        ${prev}
      </button>`;
    });
    h+=`</div></div>`;
    return h;
  })();

  // ── 페이지네이션 계산 ──
  const totalItems=filtered.length;
  const pageSize=getHistPageSize();
  const pageKey=mode;
  if(histPage[pageKey]===undefined) histPage[pageKey]=0;
  const totalPages=Math.ceil(totalItems/pageSize)||1;
  if(histPage[pageKey]>=totalPages) histPage[pageKey]=Math.max(0,totalPages-1);
  const curPage=histPage[pageKey];
  const paged=totalItems>pageSize?filtered.slice(curPage*pageSize,(curPage+1)*pageSize):filtered;
  // 일괄 이동 컨텍스트
  const _canBulk=isLoggedIn;
  const _bulkKey=(mode==='mini'&&histSub==='civil')?'civil':mode;
  const _bulkOn=_canBulk&&!!_bulkModes[_bulkKey];
  const _bulkDests=_bulkKey==='mini'?[{l:'⚔️ 시빌워',d:'civil'},{l:'🏟️ 대학대전',d:'univm'}]
    :_bulkKey==='civil'?[{l:'⚡ 미니대전',d:'mini'},{l:'🏟️ 대학대전',d:'univm'}]
    :_bulkKey==='univm'?[{l:'⚡ 미니대전',d:'mini'},{l:'⚔️ 시빌워',d:'civil'}]:[];
  const sortBar=`${_bulkOn?`<div class="no-export" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:7px 10px;background:#eff6ff;border:1.5px solid var(--blue);border-radius:8px;margin-bottom:6px">
    <label style="display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;cursor:pointer;color:var(--blue)">
      <input type="checkbox" id="bulk-all-${_bulkKey}" onchange="bulkToggleAll('${_bulkKey}',this.checked)" style="width:14px;height:14px;cursor:pointer"> 전체
    </label>
    <span id="bulk-cnt-${_bulkKey}" style="font-size:11px;color:var(--blue);font-weight:700;min-width:64px">0개 선택됨</span>
    <span style="color:var(--border2)">│</span>
    ${_bulkDests.map(bd=>`<button onclick="bulkMoveTeam('${_bulkKey}','${bd.d}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid var(--blue);background:var(--blue);color:#fff;font-size:11px;font-weight:700;cursor:pointer">${bd.l}로 이동</button>`).join('')}
    <button onclick="bulkDeleteRecs('${_bulkKey}')" style="padding:3px 12px;border-radius:12px;border:1.5px solid #dc2626;background:#dc2626;color:#fff;font-size:11px;font-weight:700;cursor:pointer">🗑️ 선택 삭제</button>
  </div>`:''}`;

  if(!totalItems){
    return sortBar+_dateMenuHTML+`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc"></div></div>`;
  }

  // 기존 렌더 블록을 함수로 감싸서 그룹 출력에 재사용
  function _recItemHTML(m,i){
    const isCK=(mode==='ck'||mode==='pro'||mode==='tt');
    const isCivil=(mode==='civil'||(m.type==='civil'));
    const _sideCols = mode==='ck' ? getFixedSideColors('ck') : mode==='pro' ? getFixedSideColors('pro') : getFixedSideColors('tt');
    // 시빌워: 같은 소속팀끼리 경기 → A팀/B팀 모두 같은 대학명 사용
    const _civilUniv=isCivil?(m.a||m.hostUniv||m.teamA||''):'';
    const ca=isCK?_sideCols.a:isCivil?gc(_civilUniv):gc(m.a);
    const cb=isCK?_sideCols.b:isCivil?gc(_civilUniv):gc(m.b);
    // teamALabel/B 필드 정리: 잘못된 값({...} 포함) 필터링
    const rawLA=(m.teamALabel||'').replace(/^\$\{.*\}$/,'');
    const rawLB=(m.teamBLabel||'').replace(/^\$\{.*\}$/,'');
    // 시빌워: A/B 라벨 모두 같은 대학으로, 또는 A팀/B팀 구분
    const labelA=isCK?(rawLA||'A팀'):isCivil?(_civilUniv||m.a||'A팀'):m.a;
    const labelB=isCK?(rawLB||'B팀'):isCivil?(_civilUniv||m.a||'B팀'):m.b;
    const aWin=(m.sa>m.sb);const bWin=(m.sb>m.sa);
    const midRaw = (m && (m._id || m.sid || m.matchId)) ? String(m._id || m.sid || m.matchId) : '';
    const mid = midRaw ? midRaw.replace(/[^a-zA-Z0-9:_-]/g,'_') : '';
    const key = mid ? `${context}-${mode}-mid:${mid}` : `${context}-${mode}-${i}`;
    // 검색용 hay 데이터
    // 대학 아이콘 (대학끼리 경기: mini/univm/comp/tour 는 상대 대학 아이콘, CK/pro/tt는 소속 대학 아이콘, 시빌워는 같은 대학)
    const _iconUnivA=isCivil?_civilUniv:(isCK?'':m.a);
    const _iconUnivB=isCivil?_civilUniv:(isCK?'':m.b);
    const iconA=(()=>{const n=_iconUnivA;const u=univCfg.find(x=>x.name===n)||{};const url=UNIV_ICONS[n]||u.icon||'';return url?`<img src="${toHttpsUrl(url)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0;vertical-align:middle" onerror="this.style.display='none'">`:''})();
    const iconB=(()=>{const n=_iconUnivB;const u=univCfg.find(x=>x.name===n)||{};const url=UNIV_ICONS[n]||u.icon||'';return url?`<img src="${toHttpsUrl(url)}" style="width:18px;height:18px;object-fit:contain;border-radius:3px;flex-shrink:0;vertical-align:middle" onerror="this.style.display='none'">`:''})();
    const _themeCls = '';
    const _themeStyle = '';

    const MODE_COL = {
      ind:'#2563eb', gj:'#d97706', progj:'#b91c1c',
      mini:'#7c3aed', civil:'#b91c1c',
      univm:'#16a34a', ck:'#f59e0b', pro:'#0ea5e9', tt:'#10b981',
      comp:'#3b82f6', tourney:'#2563eb', procomp:'#0891b2', procomptn:'#0891b2', procompteam:'#0891b2', procompgj:'#b91c1c'
    };
    const _mc = MODE_COL[mode] || '#64748b';
    const _rgbM = _hexToRgbStr(_mc);
    return `<div class="rec-summary rec-mode-${mode}${_themeCls}${_recSideFxClass(mode)}" data-rec-mode="${mode}" style="--rec-mode-col:${_mc};--rec-mode-rgb:${_rgbM};${_themeStyle}${_recSideFxStyle(mode,ca,cb)}">
      <div class="rec-sum-header rec-sum-header--stack">
        <div class="rec-topline">
          <div class="rec-meta-row">
            ${_bulkOn?`<input type="checkbox" class="bulk-cb no-export" data-bkey="${_bulkKey}" data-bidx="${i}" data-bmid="${String(m._id||m.sid||'')}" onchange="_bulkCountUpdate('${_bulkKey}')" onclick="event.stopPropagation()" style="width:15px;height:15px;cursor:pointer;flex-shrink:0;accent-color:var(--blue)">`:''}
            ${m.fmt>0?`<span class="rec-meta-chip rec-meta-chip--note">${m.fmt}:${m.fmt}</span>`:''}

          </div>
          <div class="rec-actions no-export rec-actions--inline">
          <button class="btn btn-w btn-xs rec-morebtn" style="padding:3px 10px;font-size:14px" title="메뉴"
            onclick="openRecActionMenu(event,{
              _btnEl:this,
              mid:'${String(m._id||m.sid||'').replace(/'/g,"\\'")}',
              a:'${(m.a||'').replace(/'/g,"\\'")}',
              sa:${m.sa||0},
              b:'${(m.b||'').replace(/'/g,"\\'")}',
              sb:${m.sb||0},
              d:'${m.d||''}',
              mode:'${mode}',
              idx:${i},
              key:'${key}',
              canShare:${(()=>{const _adm=(localStorage.getItem('su_share_admin_only')||'0')==='1';return(!_adm||isLoggedIn)?'true':'false';})()},
              canEdit:${(isLoggedIn && !isSubAdmin)?'true':'false'},
              canDel:${(isLoggedIn && !isSubAdmin)?'true':'false'},
              canMove:${(isLoggedIn && (mode==='mini'||mode==='civil'||mode==='univm'))?'true':'false'}
            })">⋯</button>
          </div>
        </div>
        ${(() => {
          // 팀 멤버 추출: teamAMembers/teamBMembers 있으면 사용, 없으면 sets에서 추출 (미니/대학)
          let aMembers = m.teamAMembers || [];
          let bMembers = m.teamBMembers || [];
          if (!aMembers.length && !bMembers.length && m.sets) {
            const aSet = new Set(), bSet = new Set();
            m.sets.forEach(s => {
              (s.games || []).forEach(g => {
                if (g.playerA) aSet.add(g.playerA);
                if (g.winner === 'A' && g.lName) bSet.add(g.lName);
                else if (g.winner === 'B' && g.wName) bSet.add(g.wName);
                if (g.playerB) bSet.add(g.playerB);
                if (g.winner === 'B' && g.lName) aSet.add(g.lName);
                else if (g.winner === 'A' && g.wName) aSet.add(g.wName);
              });
            });
            aMembers = Array.from(aSet).map(n => ({ name: n }));
            bMembers = Array.from(bSet).map(n => ({ name: n }));
          }
          const aMemJson = JSON.stringify(aMembers).replace(/"/g, "'");
          const bMemJson = JSON.stringify(bMembers).replace(/"/g, "'");
          const aBtnColor = ca || '#3b82f6';
          const bBtnColor = cb || '#ef4444';
          const _ab2 = {a: aMembers, b: bMembers};
          const _sp2 = (typeof window._buildRecSideProfilePanel==='function')
            ? window._buildRecSideProfilePanel(m, _ab2, aWin, bWin, ca, cb)
            : {left:'', right:''};
          return `
        <div class="rec-sum-vs-outer">
          ${_sp2.left}
          <div class="rec-sum-vs" style="flex-wrap:wrap;align-items:center">
            <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
              <span class="ubadge${aWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${ca};display:inline-flex;align-items:center;gap:4px" onclick="${!isCK?`openUnivModal('${m.a||''}')`:''}">${iconA?iconA.replace('width:18px;height:18px',`width:${_uiconPx}px;height:${_uiconPx}px`).replace('<img ','<img class="rec-uicon" '):''}${labelA}</span>
              ${aMembers.length ? `<button class="btn btn-xs rc-mem-btn" style="background:linear-gradient(135deg,${aBtnColor}15,${aBtnColor}08);border:1.5px solid ${aBtnColor}40;color:${aBtnColor};font-weight:700;box-shadow:0 2px 8px ${aBtnColor}20,0 1px 3px rgba(0,0,0,0.08);transition:all 0.2s" onclick="event.stopPropagation();openProMembersPopup('${labelA.replace(/'/g,"\\'")}', '${ca}', ${aMemJson})">
                <span class="mem-ico">👥</span><span>${aMembers.length}명</span>
              </button>` : ''}
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
              <div class="rec-sum-score score-click" onclick="toggleDetail('${key}')" title="클릭하여 상세 보기/닫기">
                <span style="color:${aWin?'var(--win-col)':bWin?'var(--lose-col)':'var(--text)'}">${m.sa}</span>
                <span style="color:var(--gray-l);font-size:12px;font-weight:400">:</span>
                <span style="color:${bWin?'var(--win-col)':aWin?'var(--lose-col)':'var(--text)'}">${m.sb}</span>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:5px">
              <span class="ubadge${bWin?'':' loser'} clickable-univ" data-icon-done="1" style="background:${cb};display:inline-flex;align-items:center;gap:4px" onclick="${!isCK?`openUnivModal('${m.b||''}')`:''}">${iconB?iconB.replace('width:18px;height:18px',`width:${_uiconPx}px;height:${_uiconPx}px`).replace('<img ','<img class="rec-uicon" '):''}${labelB}</span>
              ${bMembers.length ? `<button class="btn btn-xs rc-mem-btn" style="background:linear-gradient(135deg,${bBtnColor}15,${bBtnColor}08);border:1.5px solid ${bBtnColor}40;color:${bBtnColor};font-weight:700;box-shadow:0 2px 8px ${bBtnColor}20,0 1px 3px rgba(0,0,0,0.08);transition:all 0.2s" onclick="event.stopPropagation();openProMembersPopup('${labelB.replace(/'/g,"\\'")}', '${cb}', ${bMemJson})">
                <span class="mem-ico">👥</span><span>${bMembers.length}명</span>
              </button>` : ''}
            </div>
          </div>
          ${_sp2.right}
        </div>`;
        })()}
      </div>
      <div id="det-${key}" class="rec-detail-area">
        ${_regDet(key,{...m,_editRef:`${_editMode}:${i}`}, mode, labelA, labelB, ca, cb, aWin, bWin, i)}
        ${(()=>{const _note=m.memo?`<div class="rec-note-box">📝 ${m.memo}</div>`:''; const _memo=isLoggedIn&&_rcMemoOn?`<div class="fbar merged-subbar no-export rec-detail-footer__actions" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><input type="text" id="memo-${key}" placeholder="경기 메모 입력..." value="${m.memo||''}" style="flex:1;font-size:12px"><button class="btn btn-w btn-xs" onclick="saveMemo('${mode}',${i},'memo-${key}')">💾 메모</button>${m.memo?`<button class="btn btn-r btn-xs" onclick="saveMemo('${mode}',${i},null)">🗑️ 삭제</button>`:''}</div>`:''; return (_note||_memo)?`<div class="rec-detail-footer">${_note}${_memo}</div>`:'';})()}
      </div>
    </div>`;
  }

  // 날짜별 그룹화 렌더
  const _days=['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
  const _byDate={};
  paged.forEach(({m,i})=>{const k=_normDateSort(m.d||'')||'날짜 미정';if(!_byDate[k])_byDate[k]=[];_byDate[k].push({m,i});});
  const _dateKeys=Object.keys(_byDate).sort((a,b)=>recSortDir==='asc'?a.localeCompare(b):b.localeCompare(a));
  let h=sortBar+`<div id="rec-list-${mode}">`;
  _dateKeys.forEach(dk=>{
    let _dkLabel=dk;
    if(dk!=='날짜 미정'&&dk.match(/^\d{4}-\d{2}-\d{2}$/)){const dt=new Date(dk+'T00:00:00');_dkLabel=`${dt.getFullYear()}년 ${dt.getMonth()+1}월 ${dt.getDate()}일 ${_days[dt.getDay()]}`;}
    h+=`<div style="margin-bottom:22px"><div class="rec-date-header" style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><div style="flex:1;font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:13px;color:#1e3a8a;padding:8px 16px;background:linear-gradient(90deg,#1e3a8a10,transparent);border-left:4px solid #2563eb;border-radius:0 8px 8px 0">📅 ${_dkLabel}</div></div>`;
    _byDate[dk].forEach(({m,i})=>{ h+=_recItemHTML(m,i); });
    h+=`</div>`;
  });

  // ── 페이지 컨트롤 ──
  if(totalItems>getHistPageSize()){
    const pages=totalPages;
    let pager=`<div class="no-export" style="display:flex;align-items:center;justify-content:center;gap:6px;padding:16px 0;flex-wrap:wrap">`;
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=0;render()" ${curPage===0?'disabled':''}>«</button>`;
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=Math.max(0,${curPage}-1);render()" ${curPage===0?'disabled':''}>‹</button>`;
    // PC: 페이지 번호 버튼 (최대 7개) - rec-pager-full
    pager+=`<span class="rec-pager-full" style="display:contents">`;
    let startP=Math.max(0,curPage-3);let endP=Math.min(pages-1,startP+6);
    if(endP-startP<6)startP=Math.max(0,endP-6);
    for(let p=startP;p<=endP;p++){
      pager+=`<button class="btn ${p===curPage?'btn-b':'btn-w'} btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=${p};render()">${p+1}</button>`;
    }
    pager+=`</span>`;
    // 모바일: 현재 페이지/전체페이지 표시
    pager+=`<span class="rec-pager-simple" style="font-size:13px;font-weight:500;color:var(--text);min-width:60px;text-align:center">${curPage+1} / ${pages}</span>`;
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=Math.min(${pages-1},${curPage}+1);render()" ${curPage===pages-1?'disabled':''}>›</button>`;
    pager+=`<button class="btn btn-w btn-xs" style="min-width:32px" onclick="histPage['${pageKey}']=${pages-1};render()" ${curPage===pages-1?'disabled':''}>»</button>`;
    pager+=`<span style="font-size:11px;color:var(--text3);margin-left:6px">${curPage+1} / ${pages}</span>`;
    pager+=`</div>`;
    h+=pager;
  }

  return h||`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-title">기록이 없습니다</div><div class="empty-state-desc"></div></div>`;
}

/* 모바일 시트용 레지스트리 */
window._detReg = window._detReg || {};
function _regDet(key, m, mode, lA, lB, ca, cb, aW, bW, idx){
  window._detReg[key] = {m, mode, lA, lB, ca, cb, aW, bW, idx};
  return buildDetailHTML(m, mode, lA, lB, ca, cb, aW, bW);
}
window._openShareFromDetReg = window._openShareFromDetReg || function(key){
  try{
    const reg = (window._detReg||{})[key];
    if(!reg || !reg.m || typeof window._openShareMatchObjCard!=='function') return false;
    const mode = reg.mode || '';
    const src = reg.m || {};
    const A = reg.lA || src.a || src.wName || 'A';
    const B = reg.lB || src.b || src.lName || 'B';
    let payload = {...src, a:A, b:B, _matchType:mode};
    if((mode==='ind' || mode==='gj' || mode==='progj') && (!(payload.sa!=null && payload.sb!=null))){
      if(Array.isArray(src.games) && src.games.length){
        const games = src.games.map(g=>{
          const w = g.wName || (g.winner==='A'?A:(g.winner==='B'?B:''));
          return {
            playerA: A,
            playerB: B,
            winner: w===A ? 'A' : (w===B ? 'B' : ''),
            map: g.map||''
          };
        });
        const sa = games.filter(g=>g.winner==='A').length;
        const sb = games.filter(g=>g.winner==='B').length;
        payload = {...payload, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games}]};
      }else if(src.wName || src.lName){
        const w = src.wName||'';
        const sa = w===A ? 1 : 0;
        const sb = w===B ? 1 : 0;
        payload = {...payload, sa, sb, sets:[{scoreA:sa, scoreB:sb, winner:sa>sb?'A':sb>sa?'B':'', games:[{playerA:A, playerB:B, winner:sa>sb?'A':sb>sa?'B':'', map:src.map||''}]}]};
      }
      payload._usePlayerPhoto = true;
      if(mode==='ind' && payload._subLabel==null) payload._subLabel='개인전';
      if(mode==='gj' && payload._subLabel==null) payload._subLabel='끝장전';
      if(mode==='progj' && payload._subLabel==null) payload._subLabel='프로리그 끝장전';
    }
    try{
      const _personal = ['ind','gj','progj'].includes(String(mode||''));
      window._sharePopupContext = {
        source:'history-detail',
        key,
        mode,
        idx:reg.idx,
        canEdit:_personal && !!(isLoggedIn && !isSubAdmin),
        canDel:_personal && !!(isLoggedIn && !isSubAdmin),
        editFn:()=>openRE(mode, reg.idx),
        delFn:()=>delRec(mode, reg.idx)
      };
    }catch(e){}
    window._openShareMatchObjCard(payload);
    return true;
  }catch(e){
    return false;
  }
};

// ── (요청사항) 경기기록 점수 방식(세트제/경기제) 전환 ──
function _calcScoreFromSets(sets, scoreMode){
  let sa=0, sb=0;
  (sets||[]).forEach(s=>{
    if(!s) return;
    const games = Array.isArray(s.games) ? s.games : [];
    const scoreA = (s.scoreA!=null) ? Number(s.scoreA) : games.filter(g=>g && g.winner==='A').length;
    const scoreB = (s.scoreB!=null) ? Number(s.scoreB) : games.filter(g=>g && g.winner==='B').length;
    let w = s.winner;
    if(!w){
      w = scoreA>scoreB ? 'A' : scoreB>scoreA ? 'B' : '';
    }
    if(scoreMode==='set'){
      if(w==='A') sa += 1;
      else if(w==='B') sb += 1;
    }else{
      sa += (isNaN(scoreA)?0:scoreA);
      sb += (isNaN(scoreB)?0:scoreB);
    }
  });
  return {sa, sb};
}
function setRecScoreMode(mode, idx, scoreMode){
  try{
    const mkey = (mode==='mini'&&typeof histSub!=='undefined'&&histSub==='civil') ? 'civil' : mode;
    const arr = mkey==='mini'?miniM:mkey==='civil'?miniM:mkey==='univm'?univM:mkey==='ck'?ckM:mkey==='pro'?proM:mkey==='tt'?ttM:mkey==='comp'?comps:null;
    if(!arr || !arr[idx]) return;
    const m = arr[idx];
    if(!m.sets || !Array.isArray(m.sets) || !m.sets.length) return alert('세트 정보가 없어 전환할 수 없습니다.');
    const sm = (scoreMode==='set') ? 'set' : 'game';
    const sc = _calcScoreFromSets(m.sets, sm);
    m.sa = sc.sa;
    m.sb = sc.sb;
    m.scoreMode = sm;
    save();
    render();
  }catch(e){
    console.error('[setRecScoreMode] fail', e);
  }
}

// ─────────────────────────────────────────────────────────────
// 경기 상세 역추적 인덱스 (스트리머 history → 원본 경기 데이터)
// - 탭은 원본 배열을 직접 렌더하지만, 스트리머 상세는 history로부터 역추적이 필요함
// - matchId / _id / sid / 내부 _id 등이 섞여 있어 전역 인덱스를 생성해 해결
// ─────────────────────────────────────────────────────────────
window._matchIndex = window._matchIndex || null; // { idMap:Map, sigMap:Map, builtAt:number, sizes:{} }
function _buildMatchIndex(){
  const idMap = new Map();   // id -> [entry]
  const sigMap = new Map();  // sig -> [entry]
  const normDate = (s) => {
    const t = String(s||'').trim();
    if(!t) return '';
    // 허용: YYYY-MM-DD, YYYY-M-D, YYYY.MM.DD, YYYY/MM/DD, YYYYMMDD
    const m = t.match(/(20\\d{2})\\D?(\\d{1,2})\\D?(\\d{1,2})/);
    if(!m) return t;
    const y = m[1];
    const mo = String(m[2]).padStart(2,'0');
    const da = String(m[3]).padStart(2,'0');
    return `${y}-${mo}-${da}`;
  };

  const addId = (id, entry) => {
    const k = String(id||'').trim();
    if(!k) return;
    const arr = idMap.get(k) || [];
    arr.push(entry);
    idMap.set(k, arr);
  };

  const addSig = (date, a, b, map, entry) => {
    const d = normDate(date);
    const A = String(a||'').trim();
    const B = String(b||'').trim();
    if(!d || !A || !B) return;
    const pair = [A,B].sort().join('||');
    const m = (map && map !== '-') ? String(map).trim() : '';
    const sig = [d, pair, m].join('|');
    const arr = sigMap.get(sig) || [];
    arr.push(entry);
    sigMap.set(sig, arr);
    // 맵이 비었을 때도 찾을 수 있도록 map 없는 sig도 같이 기록
    if(m){
      const sig2 = [d, pair, ''].join('|');
      const arr2 = sigMap.get(sig2) || [];
      arr2.push(entry);
      sigMap.set(sig2, arr2);
    }
  };

  const indexSets = (matchObj, modeKey) => {
    if(!matchObj || !matchObj.sets) return;
    const date = normDate(matchObj.d || matchObj.date || '');
    const A = matchObj.a || matchObj.teamALabel || '';
    const B = matchObj.b || matchObj.teamBLabel || '';
    (matchObj.sets||[]).forEach(set=>{
      (set.games||[]).forEach(g=>{
        if(!g) return;
        // gameId → parent match
        if(g._id) addId(g._id, {refType:'game', modeKey, parent:matchObj, game:g});
        // signature (날짜+선수쌍+맵) → parent match
        if(date && g.playerA && g.playerB) addSig(date, g.playerA, g.playerB, g.map||'', {refType:'game', modeKey, parent:matchObj, game:g});
      });
    });
  };

  // 재귀적으로 _id를 가진 객체를 찾아 index (대회/프로리그대회 중첩 구조 대응)
  const walk = (node, modeKey, depth, seen) => {
    if(!node || depth>12) return;
    if(typeof node !== 'object') return;
    try{ if(seen.has(node)) return; seen.add(node); }catch(_){}

    // match-like object
    const id = node._id || node.id || node.matchId || node.sid || '';
    if(id){
      addId(id, {refType:'obj', modeKey, obj:node});
    }
    // 가능한 경우 signature도 등록
    const d = normDate(node.d || node.date || '');
    if(d){
      // 1) a/b 형태(단일 경기)
      if(node.a && node.b){
        addSig(d, node.a, node.b, node.map||'', {refType:'obj', modeKey, obj:node});
      }
      // 2) wName/lName 형태(단일 경기)
      if(node.wName && node.lName){
        addSig(d, node.wName, node.lName, node.map||'', {refType:'obj', modeKey, obj:node});
      }
    }
    // sets 포함 시 gameId도 등록
    if(node.sets && Array.isArray(node.sets)) indexSets(node, modeKey);
    // 프로리그대회 끝장전 세션(gjMatches): {a,b,games:[{winner,map}]}
    if(node.games && Array.isArray(node.games) && node.a && node.b && !node.sets){
      // 세트형으로 만들 수 있는 세션 → signature는 a/b로 등록
      if(d) addSig(d, node.a, node.b, '', {refType:'pcgj', modeKey, obj:node});
    }

    // traverse children
    if(Array.isArray(node)){
      node.forEach(it=>walk(it, modeKey, depth+1, seen));
    } else {
      Object.keys(node).forEach(k=>walk(node[k], modeKey, depth+1, seen));
    }
  };

  // ── top-level sources ──
  const seen = new WeakSet();
  const top = [
    {arr:(typeof miniM!=='undefined'?miniM:[]), modeKey:'mini'},
    {arr:(typeof univM!=='undefined'?univM:[]), modeKey:'univm'},
    {arr:(typeof ckM!=='undefined'?ckM:[]), modeKey:'ck'},
    {arr:(typeof proM!=='undefined'?proM:[]), modeKey:'pro'},
    {arr:(typeof ttM!=='undefined'?ttM:[]), modeKey:'tt'},
    {arr:(typeof comps!=='undefined'?comps:[]), modeKey:'comp'},
    {arr:(typeof tourneys!=='undefined'?tourneys:[]), modeKey:'tourney'},
    {arr:(typeof proTourneys!=='undefined'?proTourneys:[]), modeKey:'procomp'},
    {arr:(typeof indM!=='undefined'?indM:[]), modeKey:'ind'},
    {arr:(typeof gjM!=='undefined'?gjM:[]), modeKey:'gj'}
  ];
  top.forEach(({arr, modeKey})=>{
    try{
      // ind/gj는 game 객체지만 _id/sid를 모두 인덱싱
      if(modeKey==='ind' || modeKey==='gj'){
        (arr||[]).forEach(g=>{
          if(!g) return;
          if(g._id) addId(g._id, {refType:'obj', modeKey, obj:g});
          if(g.sid) addId(g.sid, {refType:'sid', modeKey, sid:g.sid});
          if(g.matchId) addId(g.matchId, {refType:'sid', modeKey, sid:g.matchId});
          if(g.d && g.wName && g.lName) addSig(g.d, g.wName, g.lName, g.map||'', {refType:'obj', modeKey, obj:g});
        });
        return;
      }
      (arr||[]).forEach(m=>{
        if(!m) return;
        // main id
        if(m._id) addId(m._id, {refType:'obj', modeKey, obj:m});
        if(m.id) addId(m.id, {refType:'obj', modeKey, obj:m});
        if(m.matchId) addId(m.matchId, {refType:'obj', modeKey, obj:m});
        // signature for match-level
        if(m.d && (m.a||m.teamALabel) && (m.b||m.teamBLabel)) addSig(m.d, (m.a||m.teamALabel), (m.b||m.teamBLabel), '', {refType:'obj', modeKey, obj:m});
        // sets games
        indexSets(m, modeKey);
        // deep scan nested (대회/프로리그대회)
        walk(m, modeKey, 0, seen);
      });
    }catch(_){}
  });

  const sizes = {
    mini: (typeof miniM!=='undefined' && miniM ? miniM.length : 0),
    univm: (typeof univM!=='undefined' && univM ? univM.length : 0),
    ck: (typeof ckM!=='undefined' && ckM ? ckM.length : 0),
    pro: (typeof proM!=='undefined' && proM ? proM.length : 0),
    tt: (typeof ttM!=='undefined' && ttM ? ttM.length : 0),
    comp: (typeof comps!=='undefined' && comps ? comps.length : 0),
    tourney: (typeof tourneys!=='undefined' && tourneys ? tourneys.length : 0),
    procomp: (typeof proTourneys!=='undefined' && proTourneys ? proTourneys.length : 0),
    ind: (typeof indM!=='undefined' && indM ? indM.length : 0),
    gj: (typeof gjM!=='undefined' && gjM ? gjM.length : 0)
  };
  window._matchIndex = {idMap, sigMap, builtAt:Date.now(), sizes};
  return window._matchIndex;
}
