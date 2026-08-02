/* ══════════════════════════════════════════════════════════════
   통계 - 포인트/레벨 순위표 (2026-08-02)
   - 포인트순 / 레벨순 정렬 + 성별(전체/남자/여자) 필터
   - 레벨/등급 계산은 stats-player-level.js 의 _prLevelInfoFromWins / _prGradeFromLevel 재사용
   ══════════════════════════════════════════════════════════════ */

if(window._plRankMode===undefined) window._plRankMode = 'points'; // points | level
if(window._plRankGender===undefined) window._plRankGender = 'all'; // all | M | F

function _plRankInjectCss(){
  if(document.getElementById('pl-rank-style')) return;
  const s=document.createElement('style');
  s.id='pl-rank-style';
  s.textContent=[
    '.pl-table{width:100%;border-collapse:separate;border-spacing:0;border:1px solid rgba(148,163,184,.18);border-radius:18px;overflow:hidden;box-shadow:0 14px 28px rgba(15,23,42,.05)}',
    '.pl-table th,.pl-table td{padding:11px 10px;text-align:center;border-bottom:1px solid rgba(148,163,184,.12);vertical-align:middle}',
    '.pl-table thead th{background:linear-gradient(135deg,#0f172a,#4338ca 52%,#7c3aed);color:#fff;font-weight:900;border-bottom:none}',
    '.pl-row{background:rgba(255,255,255,.96)}',
    '.pl-row:nth-child(even){background:#fbfdff}',
    '.pl-row:hover{background:#eef6ff}',
    '.pl-rankno{font-weight:1000;color:#4f46e5}',
    '.pl-rankno.top1{color:#d97706}.pl-rankno.top2{color:#64748b}.pl-rankno.top3{color:#b45309}',
    '.pl-player{display:flex;gap:8px;align-items:center;justify-content:flex-start}',
    '.pl-name{font-weight:1000;color:var(--text2);cursor:pointer}',
    '.pl-univ{font-size:var(--fs-caption);font-weight:900;opacity:.85}',
    '.pl-val{font-weight:1000;font-size:15px}',
    '.pl-sub{font-size:var(--fs-caption);color:var(--gray-l)}',
    '.pl-gradechip{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:22px;padding:0 6px;border-radius:8px;font-weight:950;font-size:12px;color:#fff;box-shadow:0 2px 5px rgba(0,0,0,.18)}',
    'body.dark .pl-table{border-color:#334155;box-shadow:0 14px 28px rgba(0,0,0,.22)}',
    'body.dark .pl-table thead th{background:linear-gradient(135deg,#0f172a,#312e81 52%,#6d28d9)}',
    'body.dark .pl-row{background:#0f172a}',
    'body.dark .pl-row:nth-child(even){background:#132033}',
    'body.dark .pl-row:hover{background:#17263c}',
    'body.dark .pl-table td{border-color:#233247;color:#e2e8f0}',
  ].join('');
  document.head.appendChild(s);
}

function statsPointLevelRankHTML(){
  _plRankInjectCss();
  const _players = (Array.isArray(players) ? players : []).filter(p => p && !p.hidden && !p.retired && !p.hideFromBoard);
  const g = window._plRankGender;
  const filtered = _players.filter(p => g==='all' ? true : (p.gender||'M')===g);

  const rows = filtered.map(p=>{
    const wins = Number(p.win)||0;
    const info = (typeof _prLevelInfoFromWins==='function') ? _prLevelInfoFromWins(wins) : {level:0, extraWins:0};
    const grade = (typeof _prGradeFromLevel==='function') ? _prGradeFromLevel(info.level, info.extraWins) : {label:'-', color:'#64748b'};
    const gcolor = grade.color || (typeof _prLetterGradeColor==='function' ? _prLetterGradeColor(grade.label) : '#64748b');
    return { p, points:Number(p.points||0), level:info.level, isMaxed: info.level>=1000, gradeLabel:grade.label, gcolor };
  });

  rows.sort((a,b)=>{
    if(window._plRankMode==='level') return (b.level-a.level) || (b.points-a.points);
    return (b.points-a.points) || (b.level-a.level);
  });

  const genderBtns = [
    {id:'all', lbl:'전체'},
    {id:'M', lbl:'👨 남자'},
    {id:'F', lbl:'👩 여자'},
  ];

  const header = `<div class="ssec">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:10px;flex-wrap:wrap">
      <div>
        <h3 style="margin:0">🏅 포인트/레벨 순위표</h3>
        <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-top:4px">포인트(승점) 또는 레벨 기준으로 전체 선수를 정렬해 보여줍니다.</div>
      </div>
      <div style="font-size:var(--fs-sm);color:var(--gray-l)">표시 인원: ${rows.length}명</div>
    </div>
    <div class="fbar no-export" style="gap:6px;flex-wrap:wrap;margin:10px 0">
      <button class="pill ${window._plRankMode==='points'?'on':''}" onclick="window._plRankMode='points';render()">💰 포인트순</button>
      <button class="pill ${window._plRankMode==='level'?'on':''}" onclick="window._plRankMode='level';render()">🚀 레벨순</button>
    </div>
    <div class="fbar no-export" style="gap:6px;flex-wrap:wrap;margin:0 0 4px">
      ${genderBtns.map(b=>`<button class="pill ${window._plRankGender===b.id?'on':''}" onclick="window._plRankGender='${b.id}';render()">${b.lbl}</button>`).join('')}
    </div>
  </div>`;

  const table = `<div class="ssec" style="padding:0;overflow:hidden">
    <table class="pl-table">
      <thead><tr>
        <th style="width:64px">순위</th>
        <th style="text-align:left">선수</th>
        <th style="width:140px">${window._plRankMode==='level'?'레벨':'포인트'}</th>
        <th style="width:160px">${window._plRankMode==='level'?'포인트':'레벨'}</th>
      </tr></thead>
      <tbody>
      ${rows.map((r,idx)=>{
        const p=r.p;
        const rankCls = idx===0?'top1':idx===1?'top2':idx===2?'top3':'';
        const pointsColor = r.points>0?'var(--score-win)':r.points<0?'var(--score-lose)':'var(--text2)';
        const primaryHTML = window._plRankMode==='level'
          ? `<span class="pl-gradechip" style="background:${r.gcolor}">${escHTML(r.gradeLabel)}</span> <span class="pl-val">${r.isMaxed?'MAX':('Lv.'+r.level)}</span>`
          : `<span class="pl-val" style="color:${pointsColor}">${r.points>0?'+':''}${r.points}P</span>`;
        const secondaryHTML = window._plRankMode==='level'
          ? `<span class="pl-val" style="color:${pointsColor};font-size:13px">${r.points>0?'+':''}${r.points}P</span>`
          : `<span class="pl-gradechip" style="background:${r.gcolor}">${escHTML(r.gradeLabel)}</span> <span class="pl-val" style="font-size:13px">${r.isMaxed?'MAX':('Lv.'+r.level)}</span>`;
        return `
          <tr class="pl-row" onclick="openPlayerModal('${escJS(p.name)}')">
            <td><div class="pl-rankno ${rankCls}">${idx+1}</div></td>
            <td style="text-align:left">
              <div class="pl-player">
                ${getPlayerPhotoHTML(p.name,'34px')}
                <div style="min-width:0">
                  <div class="pl-name">${escHTML(p.name)}</div>
                  <div class="pl-univ" style="color:${(typeof gc==='function')?gc(p.univ):'#6b7280'}">${escHTML(p.univ||'-')} · ${escHTML(p.tier||'-')}</div>
                </div>
              </div>
            </td>
            <td>${primaryHTML}</td>
            <td>${secondaryHTML}</td>
          </tr>
        `;
      }).join('') || `<tr><td colspan="4" style="color:var(--gray-l);padding:30px">해당 조건의 선수가 없습니다.</td></tr>`}
      </tbody>
    </table>
  </div>`;

  return header + table;
}
