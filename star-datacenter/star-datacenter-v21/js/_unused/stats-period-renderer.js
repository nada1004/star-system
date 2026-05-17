(function(){
  function statsPeriodAnalysisHTML(){
    const week = window._statsAnalyzePeriod('이번 주', ...Object.values(window._statsCurrentWeekRange()));
    const month = window._statsAnalyzePeriod('이번 달', ...Object.values(window._statsCurrentMonthRange()));
    function metricCard(label, value, sub, color){
      return `<div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:11px;color:var(--gray-l);font-weight:800">${label}</div>
        <div style="font-size:24px;font-weight:1000;color:${color||'var(--text)'};margin-top:4px">${value}</div>
        <div style="font-size:11px;color:var(--gray-l);margin-top:3px">${sub||''}</div>
      </div>`;
    }
    function rankList(title, arr, row){
      return `<div style="padding:12px;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <div style="font-size:13px;font-weight:900;color:var(--text2);margin-bottom:8px">${title}</div>
        ${arr.length?`<div style="display:flex;flex-direction:column;gap:6px">${arr.map(row).join('')}</div>`:`<div style="font-size:12px;color:var(--gray-l)">기록 없음</div>`}
      </div>`;
    }
    function periodSection(data, accent){
      const avgGames = data.activeDays ? (data.totalMatches / data.activeDays).toFixed(1) : '0.0';
      return `<div class="ssec">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:12px">
          <div>
            <div style="font-size:18px;font-weight:1000;color:${accent}">${data.label} 경기 분석</div>
            <div style="font-size:11px;color:var(--gray-l)">${data.from} ~ ${data.to}</div>
          </div>
          <div style="font-size:11px;color:var(--gray-l)">저장 구조는 월단위 유지, 분석만 기간별 계산</div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:12px">
          ${metricCard('총 경기 수', data.totalMatches+'경기', `활동일 ${data.activeDays}일`, accent)}
          ${metricCard('총 세트/게임 수', data.totalGames+'개', `활동일 평균 ${avgGames}경기`, '#7c3aed')}
          ${metricCard('팀전', data.teamMatches+'경기', `개인전 ${data.soloMatches}경기`, 'var(--green)')}
          ${metricCard('최다 유형', data.bySource[0]?data.bySource[0].label:'-', data.bySource[0]?`${data.bySource[0].count}경기 · ${data.bySource[0].pct}%`:'기록 없음', '#ea580c')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px">
          ${rankList('유형별 경기 수', data.bySource, (it,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--border);border-radius:10px;background:var(--surface)">
            <span style="min-width:20px;font-size:11px;color:var(--gray-l);font-weight:900">${i+1}</span>
            <span style="flex:1;font-size:12px;font-weight:800">${it.label}</span>
            <span style="font-size:12px;font-weight:1000;color:${accent}">${it.count}경기</span>
            <span style="font-size:11px;color:var(--gray-l)">${it.pct}%</span>
          </div>`)}
          ${rankList('다승 TOP 5', data.topWinners, (it,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--border);border-radius:10px;background:var(--surface)">
            <span style="min-width:20px;font-size:11px;color:var(--gray-l);font-weight:900">${i+1}</span>
            <span style="flex:1;font-size:12px;font-weight:900;cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${window.escJS(it.name)}')">${window.escHTML(it.name)}</span>
            <span style="font-size:11px;color:${window.gc(it.univ)};font-weight:800">${window.escHTML(it.univ||'')}</span>
            <span style="font-size:12px;font-weight:1000;color:var(--green)">${it.wins}승</span>
          </div>`)}
          ${rankList('최다 출전 TOP 5', data.topPlayers, (it,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--border);border-radius:10px;background:var(--surface)">
            <span style="min-width:20px;font-size:11px;color:var(--gray-l);font-weight:900">${i+1}</span>
            <span style="flex:1;font-size:12px;font-weight:900;cursor:pointer;color:var(--blue)" onclick="openPlayerModal('${window.escJS(it.name)}')">${window.escHTML(it.name)}</span>
            <span style="font-size:12px;font-weight:1000;color:${accent}">${it.total}경기</span>
            <span style="font-size:11px;color:var(--gray-l)">${it.wins}승 ${it.losses}패</span>
          </div>`)}
          ${rankList('팀전 다승 팀/대학 TOP 5', data.topTeams, (it,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--border);border-radius:10px;background:var(--surface)">
            <span style="min-width:20px;font-size:11px;color:var(--gray-l);font-weight:900">${i+1}</span>
            <span style="flex:1;font-size:12px;font-weight:900;color:${window.gc(it.name)}">${window.escHTML(it.name)}</span>
            <span style="font-size:12px;font-weight:1000;color:${accent}">${it.wins}승</span>
          </div>`)}
        </div>
      </div>`;
    }
    return `<div style="display:flex;flex-direction:column;gap:18px">
      <div class="ssec">
        <div style="font-size:13px;font-weight:900;color:var(--text2);margin-bottom:6px">🗓️ 주간/월간 경기 분석</div>
        <div style="font-size:12px;color:var(--gray-l);line-height:1.6">데이터 저장은 월단위 그대로 유지하고, 통계탭에서만 <b>이번 주</b>와 <b>이번 달</b> 기준으로 다시 계산합니다. 그래서 주단위 파일로 쪼개지 않아도 다른 기기 동기화 문제 없이 주간 분석을 볼 수 있습니다.</div>
      </div>
      ${periodSection(week, '#2563eb')}
      ${periodSection(month, '#7c3aed')}
    </div>`;
  }

  window.statsPeriodAnalysisHTML = statsPeriodAnalysisHTML;
})();
