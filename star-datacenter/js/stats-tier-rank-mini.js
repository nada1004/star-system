/* ══════════════════════════════════════════════════════════════
   통계 - 티어 랭킹 미니뷰 (stats-core.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function statsTierRankHTML(){
  const tier = (window._statsRankTier || '4티어');
  const _tiers = (typeof TIERS!=='undefined' && Array.isArray(TIERS)) ? TIERS : (Array.isArray(window.TIERS) ? window.TIERS : []);
  const tierBtns = _tiers.filter(t=>t && t!=='미정');

  // 선수 리스트(티어)
  const _players = Array.isArray(players) ? players : [];
  const tierPlayers = _players.filter(p=>(p.tier||'미정')===tier);
  if(!tierPlayers.length){
    return `<div class="ssec"><h3 style="margin:0 0 10px">🚀 티어 랭킹</h3>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${tierBtns.map(t=>`<button class="pill ${t===tier?'on':''}" onclick="statsSetRankTier('${escJS(t)}')">${t}</button>`).join('')}</div>
      <div style="color:var(--gray-l);font-size:var(--fs-base)">선택한 티어(${tier})에 선수가 없습니다.</div>
    </div>`;
  }

  // 동일 티어 상대전만 추출
  const rows = tierPlayers.map(p=>{
    const all = statsNonProHist(p)
      .filter(h=>{
        if(!h||!h.opp) return false;
        const opp=statsP(h.opp);
        return opp && (opp.tier||'미정')===tier;
      })
      .sort((a,b)=>(String(b.date||'')).localeCompare(String(a.date||'')));

    const practice = [];
    const important = [];
    all.forEach(h=>{ (_srIsImportant(h.mode) ? important : practice).push(h); });

    // practice: 시간가중치 + 승패
    let pW=0, pL=0, pWW=0, pWL=0;
    practice.forEach(h=>{
      const w=_srTimeW(h.date||'');
      if(h.result==='승'){ pW++; pWW+=w; }
      else if(h.result==='패'){ pL++; pWL+=w; }
    });
    const pTot=pW+pL, pWTot=pWW+pWL;
    const pWR = pWTot>0 ? (pWW/pWTot) : 0;

    // important: (초기) 가중치 없이 raw 승률
    let iW=0, iL=0;
    important.forEach(h=>{ if(h.result==='승') iW++; else if(h.result==='패') iL++; });
    const iTot=iW+iL;
    const iWR=iTot>0 ? (iW/iTot) : 0;

    // 경험치(경기 수): 너무 과하게 튀지 않게 log
    const exp = Math.min(12, Math.log10(Math.max(1,pTot)) * 8);
    const practiceScore = (pWR*70) + exp;                 // 0~82 정도
    const importantScore = (iWR*30) * Math.min(1, iTot/6); // 0~30
    const bonus = (iTot>=3 && iWR>pWR) ? Math.min(25, (iWR-pWR)*200*(Math.min(1,iTot/8))) : 0;
    const total = practiceScore + importantScore + bonus;

    // 활동 여부(최근 30일 내 동일티어 경기)
    const lastDate = (all[0]?.date||'');
    const dormant = lastDate ? (_srDaysAgo(lastDate) > 30) : true;

    return {
      p,
      total:+total.toFixed(1),
      practiceScore:+practiceScore.toFixed(1),
      importantScore:+importantScore.toFixed(1),
      bonus:+bonus.toFixed(1),
      pW,pL,pWR,
      iW,iL,iWR,
      practice, important,
      lastDate,
      dormant,
      safeId:_srSafeId(p.name),
    };
  })
  .filter(r=> (r.pW+r.pL+r.iW+r.iL) >= _statsMinGames)
  .sort((a,b)=> b.total-a.total || (b.iW+b.iL)-(a.iW+a.iL) || (b.pW+b.pL)-(a.pW+a.pL));

  const css = `
    <style>
      .sr-table{width:100%;border-collapse:separate;border-spacing:0;border:1px solid rgba(148,163,184,.18);border-radius:18px;overflow:hidden;box-shadow:0 14px 28px rgba(15,23,42,.05)}
      .sr-table th,.sr-table td{padding:11px 10px;text-align:center;border-bottom:1px solid rgba(148,163,184,.12);vertical-align:middle}
      .sr-table thead th{background:linear-gradient(135deg,#0f172a,#4338ca 52%,#7c3aed);color:#fff;font-weight:900;border-bottom:none}
      .sr-row{background:rgba(255,255,255,.96)}
      .sr-row:nth-child(even){background:#fbfdff}
      .sr-row:hover{background:#eef6ff}
      .sr-player{display:flex;gap:8px;align-items:center;justify-content:flex-start}
      .sr-name{font-weight:1000;color:var(--text2);cursor:pointer}
      .sr-univ{font-size:var(--fs-caption);font-weight:900;opacity:.85}
      .sr-score{font-weight:1000;color:#7c3aed}
      .sr-mini{font-size:var(--fs-caption);color:var(--gray-l);line-height:1.45}
      .sr-tag{display:inline-flex;align-items:center;gap:4px;font-size:var(--fs-caption);font-weight:1000;padding:3px 8px;border-radius:999px;border:1px solid rgba(0,0,0,.10);background:rgba(255,255,255,.88)}
      .sr-tag.p{border-color:rgba(37,99,235,.25);color:#1d4ed8}
      .sr-tag.i{border-color:rgba(22,163,74,.25);color:#15803d}
      .sr-tag.b{border-color:rgba(245,158,11,.25);color:#b45309}
      .sr-det{display:none}
      .sr-det.open{display:table-row}
      .sr-det td{padding:14px 12px;background:linear-gradient(175deg,#f8fbff,#eef4fb)}
      .sr-box{background:#fff;border:1px solid rgba(148,163,184,.18);border-radius:var(--r2);padding:14px;box-shadow:inset 0 1px 0 rgba(255,255,255,.85)}
      .sr-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      @media(max-width:820px){.sr-grid{grid-template-columns:1fr}}
      .sr-log{max-height:200px;overflow:auto;border:1px solid rgba(148,163,184,.18);border-radius:12px;background:rgba(255,255,255,.82)}
      .sr-log table{width:100%;border-collapse:collapse;font-size:var(--fs-sm)}
      .sr-log th,.sr-log td{padding:6px 8px;border-bottom:1px solid rgba(148,163,184,.12);text-align:center}
      .sr-muted{opacity:.65}
      body.dark .sr-table{border-color:#334155;box-shadow:0 14px 28px rgba(0,0,0,.22)}
      body.dark .sr-table thead th{background:linear-gradient(135deg,#0f172a,#312e81 52%,#6d28d9)}
      body.dark .sr-row{background:#0f172a}
      body.dark .sr-row:nth-child(even){background:#132033}
      body.dark .sr-row:hover{background:#17263c}
      body.dark .sr-table td{border-color:#233247;color:#e2e8f0}
      body.dark .sr-box,body.dark .sr-log{background:#132033;border-color:#334155}
      body.dark .sr-det td{background:linear-gradient(175deg,#0f172a,#162235)}
    </style>`;

  const header = `<div class="ssec">
    ${css}
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:10px;flex-wrap:wrap">
      <div>
        <h3 style="margin:0">🚀 티어 랭킹 (동일 티어 기준)</h3>
        <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-top:4px">일반(시간가중치) + 중요(대회/프로/끝장전/CK) + 실전보너스</div>
      </div>
      <div style="font-size:var(--fs-sm);color:var(--gray-l)">최소경기: ${_statsMinGames}</div>
    </div>
    <div class="fbar no-export" style="gap:6px;flex-wrap:wrap;margin:10px 0">
      ${tierBtns.map(t=>`<button class="pill ${t===tier?'on':''}" onclick="statsSetRankTier('${escJS(t)}')">${t}</button>`).join('')}
    </div>
  </div>`;

  const table = `<div class="ssec" style="padding:0;overflow:hidden">
    <table class="sr-table">
      <thead><tr>
        <th style="width:70px">순위</th>
        <th style="text-align:left">선수</th>
        <th style="width:150px">종합 점수</th>
        <th style="width:260px">요약</th>
      </tr></thead>
      <tbody>
      ${rows.map((r,idx)=>{
        const p=r.p;
        const race=(p.race||'');
        const safe=r.safeId;
        const dormClass=r.dormant?'sr-muted':'';
        const pWR=(r.pWR*100)||0, iWR=(r.iWR*100)||0;
        return `
          <tr class="sr-row ${dormClass}" onclick="statsRankToggle('${safe}')">
            <td><div class="sr-score" style="color:${idx<3?'#111827':'#4f46e5'}">${idx+1}</div></td>
            <td style="text-align:left">
              <div class="sr-player">
                ${getPlayerPhotoHTML(p.name,'34px')}
                <div style="min-width:0">
                  <div class="sr-name" onclick="event.stopPropagation();openPlayerModal('${escJS(p.name)}')">${escHTML(p.name)}${race?`<span style="font-size:var(--fs-sm);color:var(--gray-l);font-weight:900;margin-left:6px">(${escHTML(race)})</span>`:''}</div>
                  <div class="sr-univ" style="color:${gc(p.univ)}">${escHTML(p.univ||'-')} · 최근 ${escHTML(r.lastDate||'-')}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="sr-score">${r.total}</div>
              <div class="sr-mini">
                <span class="sr-tag p" title="일반 점수">일반 ${r.practiceScore}</span>
                <span class="sr-tag i" title="중요 점수">중요 ${r.importantScore}</span>
                ${r.bonus>0?`<span class="sr-tag b" title="실전 보너스">보너스 +${r.bonus}</span>`:''}
              </div>
            </td>
            <td>
              <div class="sr-mini" style="display:flex;flex-direction:column;gap:2px">
                <div><b>동일티어</b> ${r.pW}승 ${r.pL}패 · 일반(보정) <b>${pWR.toFixed(1)}%</b></div>
                <div><b>중요경기</b> ${r.iW}승 ${r.iL}패 · 중요 <b>${iWR.toFixed(1)}%</b></div>
                <div style="margin-top:3px"><button id="sr-btn-${safe}" class="btn btn-w btn-xs" style="border-radius:999px" onclick="event.stopPropagation();statsRankToggle('${safe}')">🔽 상세보기</button></div>
              </div>
            </td>
          </tr>
          <tr class="sr-det" id="sr-det-${safe}">
            <td colspan="4">
              <div class="sr-box">
                <div class="sr-grid">
                  <div>
                    <div style="font-weight:1000;margin-bottom:6px;color:var(--text2);display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                      1) 일반(스폰) — 시간가중치
                      <span title="최근 경기일수에 따라 승/패에 가중치를 곱해 ‘최근 경기’를 더 반영합니다.\n\n가중치 범위: ×1.00(최신) ~ ×0.70(오래됨)\n계산: w = max(0.70, 1 - (daysAgo × 0.0035))\n예: 30일 전≈×0.90, 60일 전≈×0.79" style="font-size:var(--fs-caption);color:var(--gray-l);font-weight:900;cursor:help;border:1px solid var(--border2);padding:0 6px;border-radius:999px;background:var(--surface)">?</span>
                    </div>
                    <div class="sr-mini" style="margin-bottom:8px">Raw ${r.pW}승 ${r.pL}패 · 보정승 ${r.practiceScore.toFixed(1)}점</div>
                    <div class="sr-log">
                      <table>
                        <thead><tr><th>날짜</th><th>상대</th><th>결과</th><th>가중치</th><th>모드</th></tr></thead>
                        <tbody>
                          ${r.practice.slice(0,25).map(h=>{
                            const w=_srTimeW(h.date||'');
                            const res=h.result==='승'?'<span style="color:#dc2626;font-weight:1000">승</span>':'<span style="color:#2563eb;font-weight:1000">패</span>';
                            return `<tr><td>${(h.date||'').slice(5).replace('-','/')}</td><td>${escHTML(h.opp||'')}</td><td>${res}</td><td style="color:#b45309;font-weight:900">×${w.toFixed(2)}</td><td style="color:var(--gray-l)">${escHTML(h.mode||'')}</td></tr>`;
                          }).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <div style="font-weight:1000;margin-bottom:6px;color:var(--text2)">2) 중요 경기</div>
                    <div class="sr-mini" style="margin-bottom:8px">Raw ${r.iW}승 ${r.iL}패 · 중요점수 ${r.importantScore.toFixed(1)}점</div>
                    <div class="sr-log">
                      <table>
                        <thead><tr><th>날짜</th><th>상대</th><th>결과</th><th>모드</th><th>맵</th></tr></thead>
                        <tbody>
                          ${(r.important.slice(0,25)).map(h=>{
                            const res=h.result==='승'?'<span style="color:#dc2626;font-weight:1000">승</span>':'<span style="color:#2563eb;font-weight:1000">패</span>';
                            return `<tr><td>${(h.date||'').slice(5).replace('-','/')}</td><td>${escHTML(h.opp||'')}${h.oppRace?`(${escHTML(h.oppRace)})`:''}</td><td>${res}</td><td style="color:var(--gray-l)">${escHTML(h.mode||'')}</td><td style="color:var(--gray-l)">${escHTML((h.map&&h.map!=='-')?h.map:'')}</td></tr>`;
                          }).join('') || `<tr><td colspan="5" style="color:var(--gray-l)">중요 경기 기록이 없습니다.</td></tr>`}
                        </tbody>
                      </table>
                    </div>
                    <div style="margin-top:10px">
                      <div style="font-weight:1000;margin-bottom:6px;color:var(--text2)">🏆 실전 보너스</div>
                      <div class="sr-mini">
                        ${((r.iW+r.iL)>=3)
                          ? (r.bonus>0
                              ? `✅ 적용됨: 중요 승률(${iWR.toFixed(1)}%)이 일반 승률(${pWR.toFixed(1)}%)보다 높아 +${r.bonus}점`
                              : `❌ 미적용: 중요 승률(${iWR.toFixed(1)}%) ≤ 일반 승률(${pWR.toFixed(1)}%)`)
                          : `❌ 미적용: 중요 경기 판수 부족(최소 3경기)`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        `;
      }).join('')}
      </tbody>
    </table>
  </div>`;

  return header + table;
}

/* ══════════════════════════════════════
   ⭐ Project Star System (통계 탭 UI)
   - (요청) 기존 데이터(p.history) 기반으로 계산 (서버/크롤러 없이도 가능)
   - "사용 시작"을 눌러야 계산 결과가 표시됨
══════════════════════════════════════ */
