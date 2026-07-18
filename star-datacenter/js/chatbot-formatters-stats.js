function createWinRateChart(player) {
  if (!player.history || player.history.length === 0) return '';
  if (typeof Chart !== 'function') {
    return `<div style="margin:8px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:var(--r);padding:10px 12px;font-size:var(--fs-sm);color:#64748b;font-weight:700">차트 모듈이 로드되지 않아 그래프를 표시할 수 없습니다.</div>`;
  }
  
  const total = player.win + player.loss;
  const winRate = total > 0 ? ((player.win / total) * 100).toFixed(1) : 0;
  
  const chartId = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  setTimeout(() => {
    const ctx = document.getElementById(chartId);
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['승', '패'],
        datasets: [{
          data: [player.win, player.loss],
          backgroundColor: ['#2563eb', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
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
              color: 'rgba(0,0,0,0.05)'
            },
            ticks: {
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
    <div style="font-size:14px;font-weight:900">📊 ${safeName} 통계</div>
    <div style="font-size:var(--fs-sm);font-weight:800;opacity:.92;margin-top:4px">총 ${escapeHtml(total)}경기 · 승률 ${escapeHtml(rate)}%</div>
  </div>`;

  const info = `<div style="background:#fff;padding:10px 12px;border-bottom:1px solid #eef2f7">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;font-size:var(--fs-sm)">
      <div style="color:#64748b;font-weight:800">소속</div><div style="color:#0f172a;font-weight:900">${safeUniv}</div>
      <div style="color:#64748b;font-weight:800">티어</div><div style="color:#0f172a;font-weight:900">${safeTier}</div>
      <div style="color:#64748b;font-weight:800">종족</div><div style="color:#0f172a;font-weight:900">${safeRace}</div>
      <div style="color:#64748b;font-weight:800">ELO</div><div style="color:#0f172a;font-weight:900">${safeElo}</div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
      <div style="flex:1;min-width:160px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:var(--r);padding:10px 12px">
        <div style="font-size:var(--fs-caption);color:#94a3b8;font-weight:800">전적</div>
        <div style="font-size:var(--fs-base);color:#0f172a;font-weight:900;margin-top:3px">${escapeHtml(player.win)}승 ${escapeHtml(player.loss)}패</div>
      </div>
      <div style="flex:1;min-width:160px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:var(--r);padding:10px 12px">
        <div style="font-size:var(--fs-caption);color:#94a3b8;font-weight:800">승률</div>
        <div style="font-size:var(--fs-base);color:#0f172a;font-weight:900;margin-top:3px">${escapeHtml(rate)}%</div>
      </div>
    </div>
  </div>`;

  const charts = `<div style="background:#fff;padding:8px 12px">${createWinRateChart(player) || ''}${createTrendChart(player) || ''}</div>`;

  let footer = '';
  if (player.history && player.history.length > 0) {
    const recentMatches = player.history.slice(-10);
    const recentWins = recentMatches.filter(h => h.result === '승').length;
    const recentRate = recentMatches.length > 0 ? ((recentWins / recentMatches.length) * 100).toFixed(1) : 0;
    footer = `<div style="background:#f8fafc;padding:10px 12px;border-top:1px solid #eef2f7;font-size:var(--fs-sm);color:#475569;font-weight:800">🕐 최근 10경기 승률: <span style="color:#2563eb">${escapeHtml(recentRate)}%</span> (${escapeHtml(recentWins)}승 ${escapeHtml(recentMatches.length - recentWins)}패)</div>`;
  }

  return `<div style="border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.09)">${header}${info}${charts}${footer}</div>`;
}

try{
  window.formatPlayerStats = formatPlayerStats;
}catch(e){}
