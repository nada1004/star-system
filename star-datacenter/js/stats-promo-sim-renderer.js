(function(){
  const PROMO_SIM_WINDOW_MONTHS = 3;
  const PROMO_SIM_ADJ_WR_STRENGTH = 18; // 보정 승률(베이지안 스무딩) 가중치
  const PROMO_SIM_STABLE_GAMES = 10; // 이 경기 수 이상부터 비교적 안정적인 표본으로 간주
  const PROMO_SIM_LOW_SAMPLE_GAMES = 12; // 이 경기 수 미만은 점수/확률에 별도 패널티
  const PROMO_SIM_DORMANT_MIN_GAMES = 5; // 최근 기간 경기 수가 이 값 미만이면 휴면으로 표시
  const PROMO_SIM_DORMANT_MAX_GAP_DAYS = 45; // 마지막 경기로부터 이 일수 초과면 휴면으로 표시
  const PROMO_SIM_SERIES_TRIALS = 1800; // 승급 확률 몬테카를로 시뮬 횟수
  const PROMO_SIM_SERIES_WINS = 3; // (가정) 승급전: 5판 3선승
  const PROMO_SIM_SERIES_MAX_GAMES = 5;

  const _psEsc = (typeof window.escHTML==='function') ? window.escHTML : (s)=>String(s??'');
  const _psEscJS = (typeof escJS==='function') ? escJS : (s)=>String(s||'').replace(/'/g,"\\'");
  const _psPhoto = (name,size,extraStyle)=> (typeof getPlayerPhotoHTML==='function') ? getPlayerPhotoHTML(name,size,extraStyle) : '';
  const _psUnivColor = (u)=> (typeof window.gc==='function') ? window.gc(u) : '#94a3b8';

  function _psIsoDate(v){
    try{
      if(typeof window._toIsoDateStr==='function'){
        const iso = String(window._toIsoDateStr(v)||'').trim();
        if(iso) return iso.slice(0,10);
      }
    }catch(e){}
    return String(v||'').slice(0,10);
  }

  function _psDaysBetween(aIso, bIso){
    try{
      const a = new Date(String(aIso||'').slice(0,10));
      const b = new Date(String(bIso||'').slice(0,10));
      const ms = Math.abs(b - a);
      return Math.floor(ms / (24*60*60*1000));
    }catch(e){
      return 9999;
    }
  }

  function _psWindowLabel(){
    return `최근 ${PROMO_SIM_WINDOW_MONTHS}개월`;
  }

  function _psGetRecentMatches(hist){
    const now = new Date();
    const cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth()-PROMO_SIM_WINDOW_MONTHS);
    const cutoffStr = cutoff.toISOString().slice(0,10);
    const out = [];
    (hist||[]).forEach(h=>{
      if(!h) return;
      const r = h.result;
      if(r!=='승' && r!=='패') return;
      // (요청) 끝장전(및 프로리그끝장전 등 변형)은 승급 시뮬레이션 집계에서 제외
      const mode = String(h.mode || h.type || '');
      if(mode.includes('끝장전')) return;
      const d=_psIsoDate(h.date);
      if(d && d>=cutoffStr){
        out.push(h);
      }
    });
    // 최신순
    out.sort((a,b)=>String(_psIsoDate(b?.date)).localeCompare(String(_psIsoDate(a?.date))));
    return out;
  }

  function _psRecentStats(hist){
    let w=0,l=0;
    let last='';
    const matches = _psGetRecentMatches(hist);
    matches.forEach(h=>{
      if(h.result==='승') w++; else l++;
      const d=_psIsoDate(h.date);
      if(d && (!last || d>last)) last=d;
    });
    const tot=w+l;
    const wr = tot?Math.round(w/tot*100):0;
    // 보정 승률: prior 50%를 PROMO_SIM_ADJ_WR_STRENGTH 경기만큼 더한 효과
    const adj = tot
      ? Math.round(((w + 0.5*PROMO_SIM_ADJ_WR_STRENGTH) / (tot + PROMO_SIM_ADJ_WR_STRENGTH)) * 1000) / 10
      : 50.0;
    return {w,l,tot,wr,adjWr: adj, lastDate: last, matches};
  }

  function _psPlayerElo(p){
    return (p && typeof p.elo==='number') ? p.elo : (typeof ELO_DEFAULT!=='undefined'?ELO_DEFAULT:1200);
  }

  function _psIsDormant(rs){
    try{
      if(!rs) return true;
      if((rs.tot||0) < PROMO_SIM_DORMANT_MIN_GAMES) return true;
      const today = new Date().toISOString().slice(0,10);
      if(!rs.lastDate) return true;
      const gap = _psDaysBetween(rs.lastDate, today);
      if(gap > PROMO_SIM_DORMANT_MAX_GAP_DAYS) return true;
      return false;
    }catch(e){
      return false;
    }
  }

  function _psIsRankEligible(rs){
    try{
      if(!rs) return false;
      if(_psIsDormant(rs)) return false;
      if((rs.tot||0) < PROMO_SIM_STABLE_GAMES) return false; // 활동 거의 없음
      return true;
    }catch(e){
      return false;
    }
  }

  function _psScore(elo, rs){
    const adj = (rs && typeof rs.adjWr==='number') ? rs.adjWr : 50;
    const games = (rs && typeof rs.tot==='number') ? rs.tot : 0;
    const dormant = _psIsDormant(rs);
    const reliability = games > 0 ? (games / (games + 18)) : 0; // 저경기수일수록 50% 쪽으로 강하게 수렴
    const stableAdj = 50 + (adj - 50) * reliability;
    const wrBonus = (stableAdj - 50) * 3.2;
    const actBonus = Math.min(42, games * 1.4);
    const lowSamplePenalty = games < PROMO_SIM_LOW_SAMPLE_GAMES ? (PROMO_SIM_LOW_SAMPLE_GAMES - games) * 7 : 0;
    const dormPenalty = dormant ? 60 : 0;
    return Math.round((elo||0) + wrBonus + actBonus - lowSamplePenalty - dormPenalty);
  }

  function _psEloWinProb(aElo, bElo){
    const diff = (Number(aElo)||0) - (Number(bElo)||0);
    return 1 / (1 + Math.pow(10, (-diff / 400)));
  }

  function _psRandn(){
    // Box–Muller
    let u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function _psSampleElo(rawElo, games){
    const base = (typeof ELO_DEFAULT!=='undefined') ? ELO_DEFAULT : 1200;
    const g = Math.max(0, Number(games)||0);
    // 표본 적으면 ELO를 기본값 쪽으로 수렴(회귀) + 분산 크게
    const k = 20;
    const mu = base + (Number(rawElo||base) - base) * (g/(g+k));
    const sd = 120 * Math.sqrt(k/(g+k)); // g가 작을수록 sd↑
    return mu + _psRandn()*sd;
  }

  function _psPromotionProbabilitySeries(selfElo, selfRs, oppPool){
    try{
      if(!_psIsRankEligible(selfRs)) return 1;
      const pool = (oppPool||[]).filter(Boolean);
      if(pool.length < 3) return 50; // 비교군이 너무 적으면 중립값
      let ok = 0;
      for(let t=0; t<PROMO_SIM_SERIES_TRIALS; t++){
        let w=0, l=0, g=0;
        while(g < PROMO_SIM_SERIES_MAX_GAMES && w < PROMO_SIM_SERIES_WINS && l < PROMO_SIM_SERIES_WINS){
          const opp = pool[Math.floor(Math.random()*pool.length)];
          const myE = _psSampleElo(selfElo, selfRs?.tot||0);
          const opE = _psSampleElo(opp.elo, opp.rs?.tot||0);
          const p = _psEloWinProb(myE, opE);
          if(Math.random() < p) w++; else l++;
          g++;
        }
        if(w >= PROMO_SIM_SERIES_WINS) ok++;
      }
      const prob = Math.round((ok / PROMO_SIM_SERIES_TRIALS) * 100);
      return Math.max(1, Math.min(99, prob));
    }catch(e){
      return 50;
    }
  }

  // (요청) 몬테카를로 결과가 렌더할 때마다 미세하게 흔들리지 않도록 입력값 기준으로 캐싱
  window._psProbCache = window._psProbCache || {};
  function _psPromotionProbabilitySeriesCached(cacheKey, selfElo, selfRs, oppPool){
    try{
      const poolSig = (oppPool||[]).filter(Boolean)
        .map(o=>`${o.name}:${Math.round(o.elo)}:${o.rs?.tot||0}:${o.rs?.adjWr||0}`)
        .sort().join('|');
      const sig = `${Math.round(selfElo)}|${selfRs?.tot||0}|${selfRs?.adjWr||0}|${poolSig}`;
      const cached = window._psProbCache[cacheKey];
      if(cached && cached.sig === sig) return cached.val;
      const val = _psPromotionProbabilitySeries(selfElo, selfRs, oppPool);
      window._psProbCache[cacheKey] = {sig, val};
      return val;
    }catch(e){
      return _psPromotionProbabilitySeries(selfElo, selfRs, oppPool);
    }
  }

  function _psTierIndex(t){
    const tiers = (typeof TIERS!=='undefined') ? TIERS : [];
    const i = tiers.indexOf(t||'미정');
    return i<0 ? tiers.length : i;
  }

  function _psOpponentName(h){
    try{
      return String(h?.opp || h?.opponent || h?.vs || h?.enemy || h?.target || h?.name2 || '').trim();
    }catch(e){
      return '';
    }
  }

  function _psMatchLineHTML(h){
    const d = _psIsoDate(h?.date);
    const r = String(h?.result||'');
    const opp = _psOpponentName(h);
    const extra = (()=> {
      const a = [];
      if(h?.mode) a.push(String(h.mode));
      if(h?.type) a.push(String(h.type));
      if(h?.map) a.push(String(h.map));
      return a.join(' · ');
    })();
    return `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${_psEsc(d)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid var(--border);font-weight:900;color:${r==='승'?'#16a34a':'#dc2626'}">${_psEsc(r)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid var(--border)">${_psEsc(opp||'-')}</td>
      <td style="padding:8px 10px;border-bottom:1px solid var(--border);color:var(--gray-l);font-size:12px">${_psEsc(extra)}</td>
    </tr>`;
  }

  // 모달 유틸(사이트 UI 느낌으로 최대한 맞춤)
  window._psModal = window._psModal || {open:false, title:'', body:''};
  window._psOpenModal = window._psOpenModal || function(title, bodyHTML){
    try{
      window._psModal = {open:true, title:String(title||''), body:String(bodyHTML||'')};
      const ov = document.getElementById('ps-modal-overlay');
      if(ov){
        ov.style.display='block';
        document.body.classList.add('modal-open');
        const t = document.getElementById('ps-modal-title');
        const b = document.getElementById('ps-modal-body');
        if(t) t.textContent = window._psModal.title;
        if(b) b.innerHTML = window._psModal.body;
      }
    }catch(e){}
  };
  window._psCloseModal = window._psCloseModal || function(){
    try{
      const ov = document.getElementById('ps-modal-overlay');
      if(ov) ov.style.display='none';
      document.body.classList.remove('modal-open');
    }catch(e){}
  };

  function statsPromoSimHTML(){
    const q = String(window._psQuery||'').trim();
    const tiers = (typeof TIERS!=='undefined') ? TIERS : [];
    const allPlayers = (window.players||[]);
    // (요청) 끝장전만 있는 선수는 승급 시뮬 집계상 0경기이므로 검색 목록에서도 제외해 정합성 유지
    const namedPlayers = allPlayers.filter(p=>p && p.name && (p.history||[]).some(h=>h && !String(h.mode||h.type||'').includes('끝장전')));

    let resultHTML;
    if(!q){
      resultHTML = `<div class="ssec"><p style="color:var(--gray-l);padding:30px;text-align:center">승급 시켜보고 싶은 선수의 이름을 검색해 주세요.</p></div>`;
    }else{
      const target = allPlayers.find(p=>p && p.name===q);
      if(!target){
        resultHTML = `<div class="ssec"><p style="color:var(--gray-l);padding:30px;text-align:center">'${_psEsc(q)}' 선수를 찾을 수 없습니다.</p></div>`;
      }else{
        const curIdx = _psTierIndex(target.tier);
        if(!target.tier || target.tier==='미정'){
          resultHTML = `<div class="ssec"><p style="color:var(--gray-l);padding:30px;text-align:center">티어 정보가 없어 승급 대상을 계산할 수 없습니다.</p></div>`;
        }else if(curIdx<=0){
          resultHTML = `<div class="ssec"><p style="color:var(--gray-l);padding:30px;text-align:center">${_psEsc(target.name)} 님은 이미 최고 티어(${_psEsc(target.tier||'')})입니다.</p></div>`;
        }else{
          const targetTier = tiers[curIdx-1];
          const targetElo = _psPlayerElo(target);
          const targetRecent = _psRecentStats(target.history);
          const poolRows = allPlayers
            .filter(p=>p && p.name!==target.name && p.tier===targetTier)
            .map(p=>{
              const rs=_psRecentStats(p.history||[]);
              const elo=_psPlayerElo(p);
              return {
                name:p.name, univ:p.univ||'', elo,
                rs,
                eligible:_psIsRankEligible(rs),
              };
            })
            .filter(r=>r.eligible); // (요청) 활동 거의 없거나 휴면이면 승급 비교군에서 제외
          const selfRow = (()=>{
            const score=_psScore(targetElo, targetRecent);
            const dormant=_psIsDormant(targetRecent);
            return {
              name:target.name, univ:target.univ||'', elo:targetElo, score,
              w:targetRecent.w, l:targetRecent.l, tot:targetRecent.tot, wr:targetRecent.wr, adjWr:targetRecent.adjWr, lastDate:targetRecent.lastDate,
              dormant, self:true,
            };
          })();
          const promoProb = _psPromotionProbabilitySeriesCached(target.name, targetElo, targetRecent, poolRows);
          // 승급 확률 설명용(상위 %): 현재 티어에서의 위치로만 계산 (표기용)
          const topPct = 0; // 제거된 "현재 상위 X%" 문구에 사용하지 않음

          // 현재 티어 내 순위/표시용 데이터
          const targetEligible = _psIsRankEligible(targetRecent);
          const curAllRows = allPlayers
            .filter(p=>p && p.tier===target.tier)
            .map(p=>{
              const rs=_psRecentStats(p.history||[]);
              const elo=_psPlayerElo(p);
              const score=_psScore(elo, rs);
              const dormant=_psIsDormant(rs);
              return {
                name:p.name, univ:p.univ||'', elo, score,
                w:rs.w, l:rs.l, tot:rs.tot, wr:rs.wr, adjWr:rs.adjWr, lastDate:rs.lastDate,
                dormant, self:p.name===target.name,
                eligible:_psIsRankEligible(rs),
              };
            })
            .sort((a,b)=>(b.score-a.score)||(b.elo-a.elo)||(b.adjWr-a.adjWr)||(b.tot-a.tot));
          const curTableRows = curAllRows.filter(r=>r.eligible); // (요청) 활동 거의 없거나 휴면이면 현재 티어 순위표에서 제외
          const curTotal = curTableRows.length || 1;
          const _curIdx = curTableRows.findIndex(x=>x.name===target.name);
          const curRank = (targetEligible && _curIdx>=0) ? (_curIdx+1) : 0;

          resultHTML = `<div class="ssec">
            <style>
              /* 승급 시뮬 전용 스타일(사이트 느낌 최대한 유사) */
              .ps-summary{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;font-size:18px;font-weight:900;margin:8px 0 14px}
              .ps-summary .cur{color:#3366CC}
              .ps-summary .fin{color:#D32F2F}
              .ps-summary .arr{color:var(--gray-l);font-weight:800}
              .ps-note{background:var(--surface);border:1px solid var(--border);border-left:5px solid #5c67e3;border-radius:10px;padding:12px 14px;color:var(--gray-l);line-height:1.6;margin:10px 0 14px}
              .ps-table{width:100%;border-collapse:collapse}
              .ps-table thead tr{background:linear-gradient(135deg,#5c67e3 0%,#a252e8 100%);color:#fff}
              .ps-table th,.ps-table td{padding:10px 10px;text-align:center;vertical-align:middle}
              .ps-table tbody tr:nth-child(even){background:rgba(148,163,184,.08)}
              .ps-table tbody tr:hover{background:rgba(148,163,184,.16)}
              .ps-table .ps-self{background:rgba(37,99,235,.10)!important;font-weight:900}
              .ps-table .ps-dormant{opacity:.68}
              .ps-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.25);color:#2563eb;font-weight:800;font-size:11px;padding:3px 8px;border-radius:999px}
              .ps-badge.ps-badge--warn{background:rgba(245,158,11,.14);border-color:rgba(245,158,11,.35);color:#b45309}
              .ps-modal-overlay{display:none;position:fixed;z-index:2000;left:0;top:0;width:100%;height:100%;overflow:auto;background:rgba(0,0,0,.60)}
              .ps-modal{background:var(--panel,#fff);margin:8% auto;padding:18px;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.25);max-width:720px;width:min(92vw,720px);position:relative}
              .ps-modal h2{margin:0 0 10px;font-size:18px}
              .ps-modal .ps-modal-desc{margin:0 0 10px;color:var(--gray-l);font-size:12px;line-height:1.6}
              .ps-modal-close{position:absolute;right:14px;top:10px;font-size:26px;font-weight:900;color:rgba(100,116,139,.9);cursor:pointer}
              .ps-modal-close:hover{color:rgba(15,23,42,.95)}
              @media (max-width: 780px){
                .ps-table thead{display:none}
                .ps-table tbody{display:flex;flex-direction:column;gap:10px}
                .ps-table tr{display:flex;flex-direction:column;border:1px solid var(--border);border-radius:12px;background:var(--panel);padding:10px}
                .ps-table td{display:flex;justify-content:space-between;align-items:center;text-align:right!important;border-bottom:1px solid rgba(148,163,184,.22)}
                .ps-table td:last-child{border-bottom:none}
                .ps-table td::before{content:attr(data-label);font-weight:900;color:var(--text);text-align:left}
              }
            </style>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px">
              ${_psPhoto(target.name,'44px','flex-shrink:0;border-radius:50%;')}
              <div>
                <div style="font-size:16px;font-weight:900">${_psEsc(target.name)} <span style="font-size:11px;font-weight:700;color:var(--gray-l)">${_psEsc(target.univ||'')} · 현재 ${_psEsc(target.tier||'미정')}</span></div>
                <div style="font-size:12px;color:var(--gray-l);margin-top:2px">
                  ELO ${targetElo} · ${_psWindowLabel()} · ${targetRecent.tot}경기 ${targetRecent.w}승 ${targetRecent.l}패 · 승률 ${targetRecent.wr}% · 보정 승률 ${targetRecent.adjWr}%
                  ${_psIsDormant(targetRecent)?` <span class="ps-badge ps-badge--warn">휴면</span>`:''}
                  ${targetRecent.tot < PROMO_SIM_STABLE_GAMES ?` <span class="ps-badge ps-badge--warn">표본 적음</span>`:''}
                </div>
              </div>
            </div>
            <div class="ps-summary">
              <span class="cur">현재 ${_psEsc(target.tier)} ${targetEligible ? `${curRank} / ${curTotal}` : '집계 제외'}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">
              <div style="flex:1;min-width:100px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:20px;font-weight:900;color:var(--blue)">${targetEligible ? `${curRank} / ${curTotal}` : '-'}</div>
                <div style="font-size:10px;color:var(--gray-l);font-weight:700">현재 티어 순위</div>
              </div>
              <div style="flex:1;min-width:100px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:20px;font-weight:900">${_psEsc(targetTier)}</div>
                <div style="font-size:10px;color:var(--gray-l);font-weight:700">승급 목표 티어</div>
              </div>
              <div style="flex:1;min-width:100px;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:20px;font-weight:900;color:var(--green,#16a34a)">${promoProb}%</div>
                <div style="font-size:10px;color:var(--gray-l);font-weight:700">승급 확률</div>
              </div>
            </div>
            <div class="ps-note">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
                <div><b>종합 점수</b>는 ELO + 보정 승률 + 활동량을 반영한 추정치이며, 경기 수가 적으면 강한 보정을 걸어 과대평가를 줄입니다. <b>승급 확률</b>은 (가정) 승급전 5판 3선승을 ELO 기반으로 시뮬레이션한 참고용 확률입니다. (분석 기간: ${_psWindowLabel()}, <b>10경기 이상만 출력</b>)</div>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                  <button class="pill" onclick="window._psOpenModal('산정 기준', window._psCriteriaHTML||'')">기준 보기</button>
                  <button class="pill" onclick="window._psOpenModal('상세 분석 기록', window._psBuildLogHTML && window._psBuildLogHTML('${_psEscJS(target.name)}') || '')">상세 기록</button>
                </div>
              </div>
              ${targetEligible ? '' : `<div style="margin-top:8px;color:#b45309;font-weight:800">활동이 거의 없거나 휴면으로 판단되어, 현재 티어 순위표(랭킹) 집계에서 제외됩니다.</div>`}
            </div>
            <h4 style="margin:0 0 10px">🏆 ${_psEsc(target.tier)} 티어 현재 순위표</h4>
            ${curTableRows.length===0 ? '<p style="color:var(--gray-l)">비교할 현재 티어 스트리머가 없습니다.</p>' : `
            <div style="overflow-x:auto"><table class="ps-table">
              <thead><tr><th>순위</th><th>스트리머</th><th>대학</th><th>종합 점수</th><th>ELO</th><th>보정 승률</th><th>${_psWindowLabel()}</th></tr></thead>
              <tbody>
                ${curTableRows.map((r,i)=>{
                  const rk = (i===0?'🥇 1위':i===1?'🥈 2위':i===2?'🥉 3위':`${i+1}위`);
                  const trCls = `${r.self?'ps-self':''} ${r.dormant?'ps-dormant':''}`.trim();
                  const click = r.self ? '' : ` onclick="openPlayerModal('${_psEscJS(r.name)}')"`;
                  const photo = (typeof getPlayerPhotoHTML==='function')
                    ? getPlayerPhotoHTML(r.name,'24px','margin-left:8px;border:1.5px solid rgba(148,163,184,.25);', {lazy:true, priority:'auto'})
                    : '';
                  return `<tr class="${trCls}" style="${r.self?'cursor:default':'cursor:pointer'}"${click}>
                    <td data-label="순위">${_psEsc(r.dormant?'휴면':rk)}</td>
                    <td data-label="스트리머" style="font-weight:900;color:${r.self?'var(--blue)':'var(--text)'}">
                      <span style="display:inline-flex;align-items:center;gap:8px;width:100%">
                        <span style="flex-shrink:0">${photo}</span>
                        <span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_psEsc(r.name)}</span>
                      </span>
                    </td>
                    <td data-label="대학"><span class="ubadge" style="background:${_psUnivColor(r.univ)}">${_psEsc(r.univ)}</span></td>
                    <td data-label="종합 점수" style="font-weight:900;color:${r.self?'#b45309':'#d32f2f'}">${r.score}</td>
                    <td data-label="ELO" style="font-weight:800">${r.elo}</td>
                    <td data-label="보정 승률">${r.adjWr}%</td>
                    <td data-label="${_psWindowLabel()}">${r.tot}경기 (${r.w}승 ${r.l}패)</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table></div>`}
          </div>`;

          // 모달(기준/기록) HTML 생성기를 전역에 주입
          window._psCriteriaHTML = `
            <div class="ps-modal-desc">
              <div style="font-weight:900;margin-bottom:6px">이 페이지는 참고 사이트 UI를 기준으로, 현재 앱 데이터로 “유사한 형태”의 승급 시뮬을 제공합니다.</div>
              <div>분석 기간: ${_psWindowLabel()}</div>
            </div>
            <div style="line-height:1.7;color:var(--text);font-size:13px">
              <div style="margin-bottom:10px">
                <div style="font-weight:900">보정 승률</div>
                <div style="color:var(--gray-l)">표본 수가 적을 때 과도하게 튀는 승률을 줄이기 위해 50%를 ${PROMO_SIM_ADJ_WR_STRENGTH}경기만큼 섞고, 경기 수가 적을수록 승률 가산이 약하게 반영되도록 신뢰도 보정을 추가했습니다.</div>
                <div style="font-family:ui-monospace,monospace;font-size:12px;background:rgba(148,163,184,.12);border:1px solid rgba(148,163,184,.25);padding:10px;border-radius:10px;margin-top:6px">
                  adjWinRate = (wins + 0.5 * ${PROMO_SIM_ADJ_WR_STRENGTH}) / (games + ${PROMO_SIM_ADJ_WR_STRENGTH})
                </div>
              </div>
              <div style="margin-bottom:10px">
                <div style="font-weight:900">종합 점수(추정)</div>
                <div style="color:var(--gray-l)">ELO를 기반으로, 보정 승률과 최근 활동량을 반영하되 경기 수가 적으면 강한 패널티를 주어 저표본 선수가 1등으로 튀는 문제를 줄입니다.</div>
                <div style="font-family:ui-monospace,monospace;font-size:12px;background:rgba(148,163,184,.12);border:1px solid rgba(148,163,184,.25);padding:10px;border-radius:10px;margin-top:6px">
                  score = ELO + 승률가산(신뢰도 보정) + 활동량가산 - 저표본패널티 - 휴면패널티
                </div>
              </div>
              <div style="margin-bottom:10px">
                <div style="font-weight:900">집계 대상 경기</div>
                <div style="color:var(--gray-l)">끝장전(프로리그끝장전 등 포함)은 정식 티어 전적으로 보지 않아 승급 시뮬레이션 집계에서 제외합니다.</div>
              </div>
              <div>
                <div style="font-weight:900">휴면 판정</div>
                <div style="color:var(--gray-l)">${_psWindowLabel()} 경기 수가 ${PROMO_SIM_DORMANT_MIN_GAMES} 미만이거나, 마지막 경기로부터 ${PROMO_SIM_DORMANT_MAX_GAP_DAYS}일을 초과하면 휴면으로 표시합니다.</div>
              </div>
              <div style="margin-top:10px">
                <div style="font-weight:900">순위표 제외</div>
                <div style="color:var(--gray-l)">활동이 거의 없거나(경기 수 ${PROMO_SIM_STABLE_GAMES} 미만) 휴면인 선수는 순위표에 표시하지 않습니다.</div>
              </div>
              <div style="margin-top:10px">
                <div style="font-weight:900">승급 확률(추정)</div>
                <div style="color:var(--gray-l)">승급 목표 티어의 “활동 중인 선수들”을 상대로, (가정) 5판 3선승 승급전을 ELO 기반으로 몬테카를로 시뮬레이션합니다. 표본이 적으면 ELO를 기본값 쪽으로 회귀시키고 변동성을 크게 잡아 확률이 보수적으로 나옵니다.</div>
              </div>
            </div>
          `;
          window._psBuildLogHTML = function(playerName){
            try{
              const p = (window.players||[]).find(pp=>pp && pp.name===playerName);
              const rs = _psRecentStats(p?.history||[]);
              const lines = (rs.matches||[]).slice(0,120).map(_psMatchLineHTML).join('');
              return `
                <div class="ps-modal-desc">${_psWindowLabel()} 경기 기록 (${rs.tot}경기 ${rs.w}승 ${rs.l}패 · 보정 승률 ${rs.adjWr}%)</div>
                <div style="overflow:auto;border:1px solid var(--border);border-radius:12px">
                  <table style="width:100%;border-collapse:collapse;font-size:13px">
                    <thead>
                      <tr style="background:rgba(148,163,184,.14)">
                        <th style="text-align:left;padding:8px 10px;border-bottom:1px solid var(--border)">날짜</th>
                        <th style="text-align:left;padding:8px 10px;border-bottom:1px solid var(--border)">결과</th>
                        <th style="text-align:left;padding:8px 10px;border-bottom:1px solid var(--border)">상대</th>
                        <th style="text-align:left;padding:8px 10px;border-bottom:1px solid var(--border)">비고</th>
                      </tr>
                    </thead>
                    <tbody>${lines || `<tr><td colspan="4" style="padding:12px;color:var(--gray-l)">${_psWindowLabel()} 경기 기록이 없습니다.</td></tr>`}</tbody>
                  </table>
                </div>
              `;
            }catch(e){
              return `<div style="color:#dc2626;font-weight:900">기록을 불러오지 못했습니다.</div><pre style="white-space:pre-wrap;color:var(--gray-l)">${_psEsc(String(e&&e.stack||e))}</pre>`;
            }
          };
        }
      }
    }

    return `<div style="display:flex;flex-direction:column;gap:14px">
      <div class="ssec">
        <h4 style="margin:0 0 4px">🔮 승급 시뮬레이션</h4>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <input id="ps-search-input" list="ps-name-list" placeholder="선수 이름 검색" value="${_psEsc(q)}" style="flex:1;min-width:160px;padding:8px 10px;border:1px solid var(--border2);border-radius:8px" onkeydown="if(event.key==='Enter'){window._psQuery=this.value.trim();render();}">
          <datalist id="ps-name-list">${namedPlayers.map(p=>`<option value="${_psEsc(p.name)}">`).join('')}</datalist>
          <button class="btn btn-b" onclick="window._psQuery=(document.getElementById('ps-search-input')||{}).value.trim();render()">분석하기</button>
        </div>
      </div>
      ${resultHTML}
      <div id="ps-modal-overlay" class="ps-modal-overlay" style="display:none" onclick="if(event.target===this)window._psCloseModal()">
        <div class="ps-modal">
          <div class="ps-modal-close" onclick="window._psCloseModal()">×</div>
          <h2 id="ps-modal-title">상세 분석</h2>
          <div id="ps-modal-body"></div>
        </div>
      </div>
    </div>`;
  }

  window.statsPromoSimHTML = statsPromoSimHTML;
})();
