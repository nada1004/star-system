/* ══════════════════════════════════════════════════════════════
   통계 - 이달의 선수 & 기록실 (stats-overview-elo.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function statsAwardHTML(){
  const _players = Array.isArray(players) ? players : [];
  const monthsF=_statsLatestActiveMonths('F');
  const monthsM=_statsLatestActiveMonths('M');
  const monthsAll=_statsLatestActiveMonths('');
  try{
    if(!window._statsAwardRankGender){
      window._statsAwardRankGender = localStorage.getItem('su_stats_award_rank_gender') || 'F';
    }
  }catch(e){
    window._statsAwardRankGender = window._statsAwardRankGender || 'F';
  }

  // ✅ 전역 필터(올해/이번달/최근3개월/최소경기 등)도 "이달의 스트리머"에서 동작하게:
  // - 날짜 From/To가 설정되어 있으면 해당 기간으로 집계
  // - 없으면 월(YYYY-MM)로 집계
  const _toIso = (v)=> (typeof window._toIsoDateStr==='function') ? window._toIsoDateStr(v) : String(v||'').trim();
  const _gfFrom = String(_statsDateFrom||'').trim();
  const _gfTo = String(_statsDateTo||'').trim();
  const _rangeFrom = _gfFrom ? _toIso(_gfFrom) : (_gfTo ? _toIso(_gfTo) : '');
  const _rangeTo = _gfTo ? _toIso(_gfTo) : (_gfFrom ? _toIso(_gfFrom) : '');
  const _useRange = !!(_rangeFrom || _rangeTo);
  const _rangeLabel = _useRange ? `${_rangeFrom||'-'} ~ ${_rangeTo||'-'}` : '';

  const _rankGender = ['F','M','ALL'].includes(String(window._statsAwardRankGender||'').toUpperCase())
    ? String(window._statsAwardRankGender||'').toUpperCase()
    : 'F';
  let ym=(_rankGender==='F' ? monthsF[0] : _rankGender==='M' ? monthsM[0] : monthsAll[0]) || (()=>{const now=new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;})();
  if(_useRange){
    const _ym = String((_rangeFrom || _rangeTo || '')).slice(0,7);
    if(/^\d{4}-\d{2}$/.test(_ym)) ym = _ym;
  }
  let _isFullMonth = false;
  if(_rangeFrom && _rangeTo && _rangeFrom === ym + '-01'){
    const [yy,mm]=String(ym).split('-').map(Number);
    if(yy && mm){
      const last = new Date(yy, mm, 0).getDate();
      const toFull = ym + '-' + String(last).padStart(2,'0');
      if(_rangeTo === toFull) _isFullMonth = true;
    }
  }
  const _awardUseRange = _useRange && !_isFullMonth;
  const prevYm=(function(cur){ const [yy,mm]=String(cur).split('-').map(Number); if(!yy||!mm) return ''; return mm===1?`${yy-1}-12`:`${yy}-${String(mm-1).padStart(2,'0')}`; })(ym);

  function calcMonth(ym2, gender){
    const g=_statsNormGender(gender);
    return _players.map(p=>{
      if(g && _statsNormGender(p.gender)!==g) return null;
      const mh=statsNonProHist(p).filter(h=>_statsYmFromDateStr(h&&h.date)===ym2);
      const w=mh.filter(h=>h.result==='승').length;
      const l=mh.filter(h=>h.result==='패').length;
      const tot=w+l;
      return{...p,mw:w,ml:l,mt:tot,mrate:tot?Math.round(w/tot*100):0};
    })
    .filter(Boolean)
    .filter(p=>p.mt>=Math.max(1, Number(_statsMinGames||0)||0))
    .sort((a,b)=>b.mw-a.mw||b.mrate-a.mrate);
  }
  function calcRange(fromIso, toIso, gender){
    const g=_statsNormGender(gender);
    const from = String(fromIso||'').trim();
    const to = String(toIso||'').trim();
    return _players.map(p=>{
      if(g && _statsNormGender(p.gender)!==g) return null;
      const mh=statsNonProHist(p).filter(h=>{
        const d = _toIso(h && h.date);
        if(!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
        if(from && d < from) return false;
        if(to && d > to) return false;
        return true;
      });
      const w=mh.filter(h=>h.result==='승').length;
      const l=mh.filter(h=>h.result==='패').length;
      const tot=w+l;
      return{...p,mw:w,ml:l,mt:tot,mrate:tot?Math.round(w/tot*100):0};
    })
    .filter(Boolean)
    .filter(p=>p.mt>=Math.max(1, Number(_statsMinGames||0)||0))
    .sort((a,b)=>b.mw-a.mw||b.mrate-a.mrate);
  }
  const curListF=_awardUseRange ? calcRange(_rangeFrom,_rangeTo,'F') : calcMonth(ym,'F');
  const curListM=_awardUseRange ? calcRange(_rangeFrom,_rangeTo,'M') : calcMonth(ym,'M');
  const prevListF=calcMonth(prevYm,'F');
  const prevListM=calcMonth(prevYm,'M');
  const curList=[...(curListF||[]), ...(curListM||[])];
  const curRankList = _rankGender==='F' ? curListF : _rankGender==='M' ? curListM : curList;
  const [y,m]=ym.split('-');
  const [py,pm]=prevYm.split('-');
  function awardCard(title,p,extra='',color='#2563eb'){
    if(!p)return`<div class="stats-award-card is-empty"><div style="font-size:28px;margin-bottom:8px">🏆</div><div style="color:var(--gray-l)">기록 없음</div></div>`;
    const univColor=gc(p.univ);
    const _univIcons = (typeof UNIV_ICONS!=='undefined' && UNIV_ICONS) ? UNIV_ICONS : (window.UNIV_ICONS||{});
    const _univCfg = (typeof univCfg!=='undefined' && Array.isArray(univCfg)) ? univCfg : [];
    const _gUI = (typeof gUI === 'function') ? gUI : (()=>'');
    // 대학 아이콘 (gUI 사용 - UNIV_ICONS 또는 univCfg.icon 우선)
    const univIconUrl=(_univIcons && _univIcons[p.univ])||((_univCfg.find(x=>x.name===p.univ)||{}).icon)||'';
    const univIconUrlAttr = (typeof escAttr==='function') ? escAttr(univIconUrl) : escHTML(univIconUrl);
    // 아이콘: URL 있으면 이미지, 없으면 대학명 첫 글자 표시
    const univIconInner=univIconUrl
      ? `<img src="${univIconUrlAttr}" style="width:32px;height:32px;object-fit:contain" onerror="this.outerHTML='<span style=font-size:16px;font-weight:900;color:white>${escHTML(p.univ[0]||'?')}</span>'">`
      : `<span style="font-size:18px;font-weight:900;color:#fff;font-family:Noto Sans KR,sans-serif">${escHTML(p.univ[0]||'?')}</span>`;
    return`<div class="stats-award-card" style="background:linear-gradient(135deg,${color}18,${color}08);border:2px solid ${color}44" onclick="openPlayerModal('${escJS(p.name)}')">
      <div class="stats-award-head" style="color:${color}">${title}</div>
      <div class="stats-award-body">
        ${p.photo?(()=>{
          const _2nd=(typeof _phSwap2ndHTML==='function')?_phSwap2ndHTML(p.secondProfileFile,{style:'border-radius:inherit'}):'';
          return `<span class="stats-award-avatar${_2nd?' ph-swap':''}" style="position:relative;overflow:hidden;display:flex"><img src="${toHttpsUrl(p.photo)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border:2px solid ${univColor};box-shadow:0 2px 8px ${univColor}55" onerror="this.style.display='none'">${_2nd}</span>`;
        })():`<div class="stats-award-avatar" style="background:${univColor};box-shadow:0 2px 8px ${univColor}55">${univIconInner}</div>`}
        <div style="min-width:0">
          <div class="stats-award-name">${escHTML(p.name)}</div>
          <div class="stats-award-meta">
            <span style="display:inline-flex;align-items:center;gap:3px;background:${univColor};color:#fff;font-size:10px;padding:2px 7px;border-radius:4px;font-weight:700">${_gUI(p.univ,'0.85em')}${escHTML(p.univ)}</span>
            <span style="font-size:10px;color:var(--gray-l)">${getTierLabel(p.tier||'-')}</span>
          </div>
        </div>
      </div>
      <div class="stats-award-stats">
        <span class="stats-award-stat" style="background:var(--red)">${p.mw}승</span>
        <span class="stats-award-stat" style="background:var(--blue)">${p.ml}패</span>
        <span class="stats-award-stat" style="background:${color}">${p.mrate}%</span>
      </div>
      ${extra?`<div style="margin-top:8px;font-size:11px;color:${color};font-weight:600">${extra}</div>`:''}
    </div>`;
  }
  function pickAwards(list){
    const top3=[...(list||[])].sort((a,b)=>b.mw-a.mw||b.mrate-a.mrate||b.mt-a.mt).slice(0,3);
    return { top3 };
  }
  const aF=pickAwards(curListF);
  const aM=pickAwards(curListM);
  const pF=pickAwards(prevListF);
  const pM=pickAwards(prevListM);
  // 전월 대비(표시용)는 남녀 합산(전체 기준)으로 계산
  const prevMap=Object.fromEntries([...(prevListF||[]), ...(prevListM||[])].map(p=>[p.name,p]));
  function trendBadge(p){
    const pp=prevMap[p.name];
    if(!pp)return`<span style="font-size:10px;color:var(--gray-l)">신규</span>`;
    const dw=p.mw-pp.mw,dr=p.mrate-pp.mrate;
    const wStr=dw>0?`<span style="color:#16a34a">▲${dw}승</span>`:dw<0?`<span style="color:#dc2626">▼${Math.abs(dw)}승</span>`:`<span style="color:var(--gray-l)">-</span>`;
    const rStr=dr>0?`<span style="color:#16a34a;font-size:9px">+${dr}%</span>`:dr<0?`<span style="color:#dc2626;font-size:9px">${dr}%</span>`:'';
    return`${wStr}${rStr?` ${rStr}`:''}`;
  }
  return`<div style="display:flex;flex-direction:column;gap:20px">
  <div class="ssec" id="stats-award-sec">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <h4 style="margin:0">🏆 이달의 스트리머 ${
          _awardUseRange
            ? `<span style="font-size:12px;color:var(--gray-l);font-weight:400">${_rangeLabel}</span>`
            : `<span style="font-size:12px;color:var(--gray-l);font-weight:400">${y}년 ${m}월</span>`
        } <span style="font-size:11px;color:var(--gray-l);font-weight:400">(프로리그 제외)</span></h4>
      </div>
      <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-award-sec','award')">📷 이미지 저장</button>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin:-6px 0 10px;line-height:1.5">
      ${_awardUseRange
        ? `※ 현재는 전역 필터(올해/최근3개월/기간 From~To)로 집계 중입니다. <b>최소경기</b>도 반영됩니다.`
        : `※ 기본은 <b>월 단위</b> 자동 집계이며, 전역 필터(올해/최근3개월/월 입력/기간)를 사용하면 해당 기간 집계로 자동 전환됩니다.`
      }
    </div>
    <div class="stats-award-label" style="color:#db2777">👩 여자</div>
    <div class="stats-award-grid">
      ${awardCard('🥇 1위',aF.top3[0]||null,'이번달 승수 1위','#db2777')}
      ${awardCard('🥈 2위',aF.top3[1]||null,'이번달 승수 2위','#db2777')}
      ${awardCard('🥉 3위',aF.top3[2]||null,'이번달 승수 3위','#db2777')}
    </div>
    <div class="stats-award-label" style="color:#2563eb;margin-top:14px">👨 남자</div>
    <div class="stats-award-grid">
      ${awardCard('🥇 1위',aM.top3[0]||null,'이번달 승수 1위','#2563eb')}
      ${awardCard('🥈 2위',aM.top3[1]||null,'이번달 승수 2위','#2563eb')}
      ${awardCard('🥉 3위',aM.top3[2]||null,'이번달 승수 3위','#2563eb')}
    </div>
  </div>
  <div class="ssec">
    <h4 style="margin-bottom:14px">📅 지난달 TOP <span style="font-size:12px;color:var(--gray-l);font-weight:400">${py}년 ${pm}월</span></h4>
    <div class="stats-award-label" style="color:#db2777">👩 여자</div>
    <div class="stats-award-grid">
      ${awardCard('🥇 1위',pF.top3[0]||null,'','#db2777')}
      ${awardCard('🥈 2위',pF.top3[1]||null,'','#db2777')}
      ${awardCard('🥉 3위',pF.top3[2]||null,'','#db2777')}
    </div>
    <div class="stats-award-label" style="color:#2563eb;margin-top:14px">👨 남자</div>
    <div class="stats-award-grid">
      ${awardCard('🥇 1위',pM.top3[0]||null,'','#2563eb')}
      ${awardCard('🥈 2위',pM.top3[1]||null,'','#2563eb')}
      ${awardCard('🥉 3위',pM.top3[2]||null,'','#2563eb')}
    </div>
  </div>
  <div class="ssec">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px">
      <h4 style="margin:0">📋 이달 전체 순위 ${
        _awardUseRange
          ? `<span style="font-size:12px;color:var(--gray-l);font-weight:400">${_rangeLabel}</span>`
          : `<span style="font-size:12px;color:var(--gray-l);font-weight:400">${y}년 ${m}월</span>`
      }</h4>
      <div class="stats-award-toggle no-export">
        <button class="female ${_rankGender==='F'?'on':''}" onclick="window._statsAwardRankGender='F';try{localStorage.setItem('su_stats_award_rank_gender','F')}catch(e){};render()">👩 여자</button>
        <button class="male ${_rankGender==='M'?'on':''}" onclick="window._statsAwardRankGender='M';try{localStorage.setItem('su_stats_award_rank_gender','M')}catch(e){};render()">👨 남자</button>
        <button class="${_rankGender==='ALL'?'on':''}" onclick="window._statsAwardRankGender='ALL';try{localStorage.setItem('su_stats_award_rank_gender','ALL')}catch(e){};render()">🌐 전체</button>
      </div>
    </div>
    <div style="font-size:11px;color:var(--gray-l);margin:-2px 0 10px;line-height:1.5">현재는 <b>${_rankGender==='F'?'여자':'M'===_rankGender?'남자':'전체'}</b> 기준 순위만 표시됩니다.</div>
    ${curRankList.length===0?'<p style="color:var(--gray-l)">선택한 조건의 경기 기록이 없습니다.</p>':`
    <table class="stats-rank-table"><thead><tr><th>순위</th><th>선수</th><th>대학</th><th>티어</th><th>승</th><th>패</th><th>승률</th><th>경기수</th><th title="전월 대비">전월비</th></tr></thead><tbody>
    ${[...curRankList].sort((a,b)=>b.mw-a.mw||b.mrate-a.mrate).map((p,i)=>`<tr class="${i<3?'stats-rank-top':''}">
      <td>${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1+'위'}</td>
      <td class="stats-rank-player" onclick="openPlayerModal('${escJS(p.name)}')">${escHTML(p.name)}</td>
      <td><span class="ubadge" style="background:${gc(p.univ)}">${escHTML(p.univ)}</span></td>
      <td>${p.tier||'-'}</td>
      <td class="wt">${p.mw}</td><td class="lt">${p.ml}</td>
      <td style="font-weight:700;color:${p.mrate>=50?'var(--red)':'var(--blue)'}">${p.mrate}%</td>
      <td>${p.mt}</td>
      <td style="font-size:11px;white-space:nowrap">${trendBadge(p)}</td>
    </tr>`).join('')}
    </tbody></table>`}
  </div></div>`;
}

/* ══════════════════════════════════════
   5. 최다 기록 보유자
══════════════════════════════════════ */
function statsRecordsHTML(){
  const _players = Array.isArray(players) ? players : [];
  if(!_players.length)return`<div class="ssec"><p style="color:var(--gray-l)">스트리머 데이터가 없습니다.</p></div>`;
  const proIds=statsProMatchIds();
  const _recLastN=window._recordsLastN|0;
  const withStats=_players.map(p=>{
    let h=statsNonProHist(p);
    if(_recLastN>0) h=[...h].sort((a,b)=>(String(a.date||'')).localeCompare(String(b.date||''))).slice(-_recLastN);
    const ph=(p.history||[]).filter(x=>proIds.has(x.matchId));
    const w=h.filter(x=>x.result==='승').length;
    const l=h.filter(x=>x.result==='패').length;
    const tot=w+l;
    // 최장 연승 계산 (날짜 오름차순 정렬 후 순방향 계산)
    let maxStreak=0,cur=0,lastRes='';
    [...h].sort((a,b)=>(String(a.date||'')).localeCompare(String(b.date||''))).forEach(x=>{if(x.result===lastRes){cur++;}else{cur=1;lastRes=x.result;}if(lastRes==='승')maxStreak=Math.max(maxStreak,cur);});
    // 현재 연승 (최신→과거 내림차순 정렬 후 첫 연속 구간)
    let curStreak=0,curStreakType='';
    for(const x of [...h].sort((a,b)=>(String(b.date||'')).localeCompare(String(a.date||'')))){if(!curStreakType||x.result===curStreakType){curStreak++;curStreakType=x.result;}else break;}
    return{...p,w,l,tot,rate:tot?Math.round(w/tot*100):0,maxStreak,
      curStreak,curStreakType,elo:p.elo||ELO_DEFAULT,proGames:ph.length,points:p.points||0};
  }).filter(p=>p.tot>0||p.proGames>0);
  if(!withStats.length)return`<div class="ssec"><p style="color:var(--gray-l)">기록이 없습니다.</p></div>`;
  const cats=[
    {title:'🏆 역대 최다승',icon:'🏆',sort:(a,b)=>b.w-a.w,val:p=>`${p.w}승`,sub:p=>`총 ${p.tot}경기`},
    {title:'📊 역대 최고 승률',icon:'📊',sort:(a,b)=>b.rate-a.rate||b.tot-a.tot,val:p=>`${p.rate}%`,sub:p=>`${p.w}승${p.l}패`,filter:p=>p.tot>=_statsMinGames},
    {title:'⚡ 역대 최다 경기',icon:'⚡',sort:(a,b)=>b.tot-a.tot,val:p=>`${p.tot}경기`,sub:p=>`${p.w}승${p.l}패`},
    {title:'🔥 최장 연승 기록',icon:'🔥',sort:(a,b)=>b.maxStreak-a.maxStreak,val:p=>`${p.maxStreak}연승`,sub:p=>`총 ${p.w}승`},
    {title:'💎 최고 ELO',icon:'💎',sort:(a,b)=>b.elo-a.elo,val:p=>`${p.elo}`,sub:p=>`${p.w}승${p.l}패`},
    {title:'🎯 현재 연승중',icon:'🎯',sort:(a,b)=>b.curStreak-a.curStreak,val:p=>`${p.curStreak}연${p.curStreakType==='승'?'승':'패'}`,sub:p=>`현재 진행중`,filter:p=>p.curStreakType==='승'&&p.curStreak>=2},
  ];
  function recordCard(cat){
    const list=(cat.filter?withStats.filter(cat.filter):withStats).sort(cat.sort).slice(0,5);
    return`<div class="ssec" style="flex:1;min-width:280px">
      <h4 style="margin-bottom:12px">${cat.title}</h4>
      ${list.length===0?`<p style="color:var(--gray-l);font-size:12px">기록 없음</p>`:`
      <div class="stats-list-stack">
        ${list.map((p,i)=>{
          const badge=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
          return`<div class="stats-record-item ${i===0?'top':''}" style="${i===0?'border-color:'+gc(p.univ)+';box-shadow:0 10px 24px '+gc(p.univ)+'33':''}" onclick="openPlayerModal('${escJS(p.name)}')">
            <span style="font-size:16px;min-width:24px">${badge}</span>
            ${getPlayerPhotoHTML(p.name,'30px')}
            <div style="flex:1;min-width:0">
              <div style="font-weight:800;font-size:13px">${escHTML(p.name)}${getStatusIconHTML(p.name)} <span style="font-size:10px;color:${gc(p.univ)};font-weight:600">${escHTML(p.univ)}</span></div>
              <div style="font-size:10px;color:var(--gray-l)">${cat.sub(p)}</div>
            </div>
            <span style="font-weight:900;font-size:16px;color:${i===0?gc(p.univ):'var(--text2)'};font-family:'Noto Sans KR',sans-serif">${cat.val(p)}</span>
          </div>`;
        }).join('')}
      </div>`}
    </div>`;
  }
  return`<div id="stats-records-sec"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
    <span style="font-size:12px;color:var(--gray-l);font-weight:700">(프로리그 제외)</span>
    <button class="btn-capture btn-xs no-export" onclick="captureSection('stats-records-sec','records')">📷 이미지 저장</button>
  </div>
  <div class="stats-records-grid">${cats.map(recordCard).join('')}</div></div>`;
}

/* ══════════════════════════════════════
   6. 대학별 성적 레이더 차트
══════════════════════════════════════ */
var _radarSelUniv='';
var _radarSort='winrate';
var _radarCompareUnivs=[];
