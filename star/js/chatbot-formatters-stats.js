function createWinRateChart(player) {
  if (!player.history || player.history.length === 0) return '';
  if (typeof Chart !== 'function') {
    return `<div style="margin:8px 0;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;font-size:var(--fs-sm);color:var(--text3);font-weight:700">차트 모듈이 로드되지 않아 그래프를 표시할 수 없습니다.</div>`;
  }
  
  const total = player.win + player.loss;
  const winRate = total > 0 ? ((player.win / total) * 100).toFixed(1) : 0;
  
  const chartId = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  setTimeout(() => {
    const ctx = document.getElementById(chartId);
    if (!ctx) return;

    const isDark = document.body.classList.contains('dark');
    const legendColor = isDark ? '#cbd5e1' : '#374151';

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['승', '패'],
        datasets: [{
          data: [player.win, player.loss],
          backgroundColor: ['#2563eb', '#ef4444'],
          borderWidth: 2,
          borderColor: isDark ? '#1e293b' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: legendColor,
              font: { size: 11, weight: '600' },
              padding: 8,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }, 100);
  
  return `<div style="margin:8px 0">
    <canvas id="${chartId}" style="max-height:180px"></canvas>
  </div>`;
}

function createTrendChart(player) {
  if (!player.history || player.history.length === 0) return '';
  if (typeof Chart !== 'function') return '';
  
  const chartId = `trend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const dateStats = {};
  player.history.forEach(h => {
    if (!dateStats[h.date]) {
      dateStats[h.date] = { wins: 0, losses: 0 };
    }
    if (h.result === '승') {
      dateStats[h.date].wins++;
    } else {
      dateStats[h.date].losses++;
    }
  });
  
  const sortedDates = Object.keys(dateStats).sort().slice(-10);
  const winRates = sortedDates.map(date => {
    const stats = dateStats[date];
    const total = stats.wins + stats.losses;
    return total > 0 ? ((stats.wins / total) * 100).toFixed(1) : 0;
  });
  
  setTimeout(() => {
    const ctx = document.getElementById(chartId);
    if (!ctx) return;

    const isDark = document.body.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
    const tickColor = isDark ? '#94a3b8' : '#64748b';

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: sortedDates,
        datasets: [{
          label: '승률 (%)',
          data: winRates,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: gridColor
            },
            ticks: {
              color: tickColor,
              font: { size: 10 },
              callback: function(value) {
                return value + '%';
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: tickColor,
              font: { size: 9 }
            }
          }
        }
      }
    });
  }, 100);
  
  return `<div style="margin:8px 0">
    <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text);margin-bottom:4px">📈 최근 승률 추세</div>
    <canvas id="${chartId}" style="max-height:160px"></canvas>
  </div>`;
}

function formatPlayerStats(player) {
  const total = player.win + player.loss;
  const rate = total > 0 ? ((player.win / total) * 100).toFixed(1) : 0;

  const safeName = escapeHtml(player.name);
  const safeUniv = escapeHtml(player.univ);
  const safeTier = escapeHtml(player.tier);
  const safeRace = escapeHtml(player.race);
  const safeElo = escapeHtml(player.elo);

  const header = `<div style="background:linear-gradient(135deg,#0f172a,#334155);color:#fff;padding:12px 14px">
    <div style="font-size:var(--fs-md);font-weight:900">📊 ${safeName} 통계</div>
    <div style="font-size:var(--fs-sm);font-weight:800;opacity:.92;margin-top:4px">총 ${escapeHtml(total)}경기 · 승률 ${escapeHtml(rate)}%</div>
  </div>`;

  const info = `<div style="background:var(--white);padding:10px 12px;border-bottom:1px solid var(--border)">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;font-size:var(--fs-sm)">
      <div style="color:var(--text3);font-weight:800">소속</div><div style="color:var(--text);font-weight:900">${safeUniv}</div>
      <div style="color:var(--text3);font-weight:800">티어</div><div style="color:var(--text);font-weight:900">${safeTier}</div>
      <div style="color:var(--text3);font-weight:800">종족</div><div style="color:var(--text);font-weight:900">${safeRace}</div>
      <div style="color:var(--text3);font-weight:800">ELO</div><div style="color:var(--text);font-weight:900">${safeElo}</div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
      <div style="flex:1;min-width:160px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">전적</div>
        <div style="font-size:var(--fs-base);font-weight:900;margin-top:3px"><span style="color:#dc2626">${escapeHtml(player.win)}승</span> <span style="color:#2563eb">${escapeHtml(player.loss)}패</span></div>
      </div>
      <div style="flex:1;min-width:160px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px">
        <div style="font-size:var(--fs-caption);color:var(--text3);font-weight:800">승률</div>
        <div style="font-size:var(--fs-base);color:var(--text);font-weight:900;margin-top:3px">${escapeHtml(rate)}%</div>
      </div>
    </div>
  </div>`;

  const charts = `<div style="background:var(--white);padding:8px 12px">${createWinRateChart(player) || ''}${createTrendChart(player) || ''}</div>`;

  let footer = '';
  if (player.history && player.history.length > 0) {
    const recentMatches = player.history.slice(-10);
    const recentWins = recentMatches.filter(h => h.result === '승').length;
    const recentRate = recentMatches.length > 0 ? ((recentWins / recentMatches.length) * 100).toFixed(1) : 0;
    footer = `<div style="background:var(--surface);padding:10px 12px;border-top:1px solid var(--border);font-size:var(--fs-sm);color:var(--text2);font-weight:800">🕐 최근 10경기 승률: <span style="color:#2563eb">${escapeHtml(recentRate)}%</span> (${escapeHtml(recentWins)}승 ${escapeHtml(recentMatches.length - recentWins)}패)</div>`;
  }

  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}${info}${charts}${footer}</div>`;
}

try{
  window.formatPlayerStats = formatPlayerStats;
}catch(e){}

/* ─────────────────────────────────────────────
   🤖 AI 분석 코멘트 (규칙 기반, 외부 API 미사용)
   통계탭 > 스트리머 리포트의 코멘트 로직과 동일한 방식으로
   승률/상대종족/최근 폼 조건에 따라 문장을 조합해 생성.
───────────────────────────────────────────── */
function _cbAiOppRace(h){
  if(h.oppRace) return h.oppRace;
  const op = (typeof players !== 'undefined') ? players.find(x=>x && x.name===h.opp) : null;
  return op ? op.race : '';
}
function _cbAiGatherHistory(player){
  const _existIds = new Set((player.history||[]).map(h=>h.matchId).filter(Boolean));
  const _tourExtra = [];
  (typeof tourneys !== 'undefined' ? tourneys : []).forEach(tn => {
    (tn.groups||[]).forEach(grp => {
      (grp.matches||[]).forEach(m => {
        if(!m._id||_existIds.has(m._id)) return;
        (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
          if(!g.playerA||!g.playerB||!g.winner) return;
          const wn=g.winner==='A'?g.playerA:g.playerB;
          const ln=g.winner==='A'?g.playerB:g.playerA;
          if(wn!==player.name&&ln!==player.name) return;
          _tourExtra.push({date:m.d||'',result:wn===player.name?'승':'패',opp:wn===player.name?ln:wn,mode:tn.type==='tier'?'티어대회':'조별리그'});
        });});
      });
    });
    Object.values((tn.bracket||{}).matchDetails||{}).forEach(m=>{
      if(!m._id||_existIds.has(m._id)) return;
      (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
        if(!g.playerA||!g.playerB||!g.winner) return;
        const wn=g.winner==='A'?g.playerA:g.playerB;
        const ln=g.winner==='A'?g.playerB:g.playerA;
        if(wn!==player.name&&ln!==player.name) return;
        _tourExtra.push({date:m.d||'',result:wn===player.name?'승':'패',opp:wn===player.name?ln:wn,mode:'대회'});
      });});
    });
  });
  return [...(player.history||[]), ..._tourExtra];
}
function formatPlayerAiAnalysis(player) {
  const now = new Date();
  const from90 = new Date(now); from90.setDate(from90.getDate()-90);
  const fromStr = from90.toISOString().slice(0,10);

  const allHistory = _cbAiGatherHistory(player);
  const recent90 = allHistory.filter(h => String(h.date||'') >= fromStr);
  const useSet = recent90.length ? recent90 : allHistory; // 최근 90일 기록이 없으면 전체 기록으로 대체
  const periodLabel = recent90.length ? '최근 90일' : '전체 기간';

  const safeName = escapeHtml(player.name);
  const header = `<div style="background:linear-gradient(135deg,#4338ca,#7c3aed);color:#fff;padding:12px 14px">
    <div style="font-size:var(--fs-md);font-weight:900">🤖 ${safeName} AI 분석 코멘트</div>
    <div style="font-size:var(--fs-sm);font-weight:800;opacity:.92;margin-top:4px">${escapeHtml(periodLabel)} 기록 기반 · 규칙 기반 자동 코멘트</div>
  </div>`;

  if (!useSet.length) {
    return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}<div style="background:var(--white);padding:16px;text-align:center;color:var(--text3);font-size:var(--fs-base)">📭 분석할 경기 기록이 없습니다.</div></div>`;
  }

  const w = useSet.filter(h=>h.result==='승').length;
  const l = useSet.filter(h=>h.result==='패').length;
  const tot = w + l;
  const wr = tot ? Math.round(w/tot*100) : 0;

  const rv = { T:{w:0,l:0}, Z:{w:0,l:0}, P:{w:0,l:0} };
  useSet.forEach(h=>{
    const r = _cbAiOppRace(h);
    if(!rv[r]) return;
    if(h.result==='승') rv[r].w++;
    else if(h.result==='패') rv[r].l++;
  });

  const sentences = [];
  if (wr>=65) sentences.push(`${periodLabel} 승률 ${wr}%(${w}승 ${l}패)로 컨디션이 매우 좋습니다.`);
  else if (wr>=50) sentences.push(`${periodLabel} 승률 ${wr}%(${w}승 ${l}패)로 평균 이상의 흐름을 보이고 있습니다.`);
  else if (wr>=35) sentences.push(`${periodLabel} 승률 ${wr}%(${w}승 ${l}패)로 다소 아쉬운 성적입니다.`);
  else sentences.push(`${periodLabel} 승률 ${wr}%(${w}승 ${l}패)로 최근 고전하고 있습니다.`);

  const RACE_KO = { T:'테란', Z:'저그', P:'프로토스' };
  const raceEntries = ['T','Z','P'].map(r=>{
    const e=rv[r]; const t=e.w+e.l;
    return { r, w:e.w, l:e.l, tot:t, wr: t? Math.round(e.w/t*100):null };
  }).filter(e=>e.tot>=2);
  if (raceEntries.length) {
    const best = raceEntries.slice().sort((a,b)=>b.wr-a.wr)[0];
    const worst = raceEntries.slice().sort((a,b)=>a.wr-b.wr)[0];
    if (best && best.wr>=60) sentences.push(`${RACE_KO[best.r]}전에서 ${best.wr}%(${best.w}승 ${best.l}패)로 강한 모습을 보였습니다.`);
    if (worst && (!best || worst.r!==best.r) && worst.wr<=40) sentences.push(`반면 ${RACE_KO[worst.r]}전은 ${worst.wr}%(${worst.w}승 ${worst.l}패)로 약점으로 보입니다.`);
  }

  const sorted = useSet.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  let streak=0, streakType='';
  for (const h of sorted) {
    if (h.result!=='승' && h.result!=='패') continue;
    if (!streakType) { streakType=h.result; streak=1; continue; }
    if (h.result===streakType) streak++;
    else break;
  }
  if (streak>=3) {
    sentences.push(streakType==='승' ? `최근 ${streak}연승 중으로 상승세를 타고 있습니다.` : `최근 ${streak}연패 중으로 반등이 필요한 시점입니다.`);
  }

  const body = `<div style="background:var(--white);padding:16px 14px;display:flex;gap:10px;align-items:flex-start">
    <div style="font-size:20px;flex-shrink:0">💬</div>
    <div style="font-size:var(--fs-base);line-height:1.75;color:var(--text2);font-weight:600">${escapeHtml(sentences.join(' '))}</div>
  </div>`;

  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}${body}</div>`;
}

try{
  window.formatPlayerAiAnalysis = formatPlayerAiAnalysis;
}catch(e){}
