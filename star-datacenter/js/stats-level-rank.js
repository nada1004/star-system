/* ══════════════════════════════════════════════════════════════
   통계 - 레벨/등급 순위표 (승수 기반 레벨 시스템, stats-player-level.js 사용)
   통계 탭 > 🏆 개인 > 🎮 레벨/등급 순위표
   - "레벨순" 보기: 정확한 레벨 숫자 기준 1등~꼴등 일렬 순위표
   - "등급별" 보기: 등급(Z~A, SS~SSS+) 구간별로 묶어서 보여주는 그룹 보기
   ══════════════════════════════════════════════════════════════ */

const RACE_KO_LVL = {T:'테란', Z:'저그', P:'프로토스'};

function _lvlRowHTML(r){
  const p = r.p;
  const rank = r.rank;
  const medal = rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':rank;
  return `<tr>
      <td class="lvl-rank-rankcell">${medal}</td>
      <td><div class="lvl-rank-namecell">
        ${getPlayerPhotoHTML(p.name,'32px')}
        <span class="lvl-rank-name" onclick="openPlayerModal('${escJS(p.name)}')">${escHTML(p.name)}</span>
        <span class="rbadge r${p.race||''}" style="font-size:10px">${RACE_KO_LVL[p.race]||p.race||''}</span>
      </div></td>
      <td class="lvl-rank-univ">${escHTML(p.univ||'-')}</td>
      <td>${(typeof _prLevelBadgeHTML==='function') ? _prLevelBadgeHTML(p) : ''}</td>
      <td class="lvl-rank-wins" style="text-align:right">${Number(p.win)||0}승</td>
    </tr>`;
}

function _lvlTableHTML(rows){
  return `<div class="lvl-rank-table-wrap"><table class="lvl-rank-table">
    <thead><tr>
      <th>순위</th><th>선수</th><th>대학</th><th>등급/레벨</th><th style="text-align:right">누적 승수</th>
    </tr></thead><tbody>${rows.map(_lvlRowHTML).join('')}</tbody></table></div>`;
}

function statsLevelRankHTML(){
  if(window._lvlGenderFilter===undefined) window._lvlGenderFilter = '전체'; // 전체 | M | F
  if(window._lvlRaceFilter===undefined)   window._lvlRaceFilter   = '전체'; // 전체 | T | Z | P
  if(window._lvlViewMode===undefined)     window._lvlViewMode     = 'level'; // level | grade

  const _players = Array.isArray(players) ? players : [];
  const _hasLevelFn = typeof _prPlayerLevelBadgeInfo === 'function';

  const css = `<style>
    .lvl-rank-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}
    .lvl-rank-title{font-size:15px;font-weight:900;color:var(--text1);display:flex;align-items:center;gap:6px}
    .lvl-rank-count{font-size:11.5px;font-weight:700;color:var(--text2)}
    .lvl-rank-viewseg{display:inline-flex;gap:4px;padding:3px;border-radius:999px;background:var(--surface);border:1px solid var(--border2);margin-bottom:12px}
    .lvl-rank-viewseg button{border:none;background:transparent;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:800;color:var(--text2);cursor:pointer}
    .lvl-rank-viewseg button.on{background:var(--blue);color:#fff}
    .lvl-rank-filters{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:12px}
    .lvl-rank-filters .fbar-divider{width:1px;align-self:stretch;background:var(--border2);margin:0 2px}
    .lvl-rank-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
    .lvl-rank-table{width:100%;min-width:560px;border-collapse:separate;border-spacing:0;border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:var(--sh)}
    .lvl-rank-table thead th{background:var(--surface);color:var(--text2);font-size:11px;font-weight:800;padding:10px 12px;text-align:left;border-bottom:1px solid var(--border)}
    .lvl-rank-table tbody td{padding:9px 12px;border-bottom:1px solid var(--border);font-size:12.5px;vertical-align:middle}
    .lvl-rank-table tbody tr:last-child td{border-bottom:none}
    .lvl-rank-table tbody tr:hover{background:var(--surface)}
    .lvl-rank-rankcell{font-weight:900;color:var(--text2);width:42px;text-align:center}
    .lvl-rank-namecell{display:flex;align-items:center;gap:8px;min-width:150px}
    .lvl-rank-name{font-weight:800;color:var(--text1);cursor:pointer}
    .lvl-rank-name:hover{color:var(--blue)}
    .lvl-rank-univ{color:var(--text2);font-size:11.5px}
    .lvl-rank-wins{font-weight:800;color:var(--text1)}
    .lvl-rank-empty{padding:40px 20px;text-align:center;color:var(--text2);font-size:12.5px}
    .lvl-grade-group{margin-bottom:16px}
    .lvl-grade-group-head{display:flex;align-items:center;gap:8px;padding:8px 4px;margin-bottom:6px}
    .lvl-grade-group-badge{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;padding:0 8px;border-radius:999px;color:#fff;font-size:12px;font-weight:900;flex-shrink:0;box-shadow:0 1px 3px rgba(15,23,42,.22)}
    .lvl-grade-group-title{font-size:13px;font-weight:900;color:var(--text1)}
    .lvl-grade-group-count{font-size:11px;font-weight:700;color:var(--text2);margin-left:auto}
  </style>`;

  if(!_hasLevelFn){
    return `${css}<div class="ssec"><h4 style="margin:0 0 10px">🎮 레벨/등급 순위표</h4>
      <div class="lvl-rank-empty">레벨 시스템 모듈을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.</div>
    </div>`;
  }

  let rows = _players
    .filter(p => p && !p.hideFromBoard)
    .map(p => {
      let info;
      try{ info = _prPlayerLevelBadgeInfo(p); }catch(e){ info = null; }
      return info ? { p, info } : null;
    })
    .filter(Boolean);

  if(window._lvlGenderFilter !== '전체') rows = rows.filter(r => r.p.gender === window._lvlGenderFilter);
  if(window._lvlRaceFilter   !== '전체') rows = rows.filter(r => r.p.race   === window._lvlRaceFilter);

  rows.sort((a,b) =>
    b.info.level - a.info.level ||
    (b.info.extraWins||0) - (a.info.extraWins||0) ||
    (Number(b.p.win)||0) - (Number(a.p.win)||0)
  );
  // 전체 필터 기준 순위(rank)는 두 보기(레벨순/등급별) 모두에서 동일하게 유지
  rows.forEach((r, idx) => { r.rank = idx + 1; });

  const _genderBtn = (val, lbl) => {
    const on = (window._lvlGenderFilter||'전체') === val;
    return `<button class="pill ${on?'on':''}" onclick="window._lvlGenderFilter='${val}';render()">${lbl}</button>`;
  };
  const _raceBtn = (val, lbl) => {
    const on = (window._lvlRaceFilter||'전체') === val;
    return `<button class="pill ${on?'on':''}" onclick="window._lvlRaceFilter='${val}';render()">${lbl}</button>`;
  };

  let h = `${css}<div class="ssec">`;
  h += `<div class="lvl-rank-head">
    <div class="lvl-rank-title">🎮 레벨/등급 순위표</div>
    <div class="lvl-rank-count">누적 승수 기반 · 총 ${rows.length}명</div>
  </div>`;
  h += `<div class="lvl-rank-viewseg">
    <button class="${window._lvlViewMode==='level'?'on':''}" onclick="window._lvlViewMode='level';render()">📈 레벨순</button>
    <button class="${window._lvlViewMode==='grade'?'on':''}" onclick="window._lvlViewMode='grade';render()">🏅 등급별</button>
  </div>`;
  h += `<div class="lvl-rank-filters">
    ${_genderBtn('전체','전체')}${_genderBtn('M','남자')}${_genderBtn('F','여자')}
    <span class="fbar-divider"></span>
    ${_raceBtn('전체','전체 종족')}${['T','Z','P'].map(r=>_raceBtn(r,RACE_KO_LVL[r])).join('')}
  </div>`;

  if(!rows.length){
    h += `<div class="lvl-rank-empty">조건에 맞는 선수가 없습니다.</div></div>`;
    return h;
  }

  if(window._lvlViewMode === 'grade'){
    // 등급 순서: 프레스티지(SSS+ → SS) 먼저, 그 다음 일반 등급(A → Z)
    const gradeOrder = [
      ...((typeof PR_PRESTIGE_TIERS!=='undefined' && Array.isArray(PR_PRESTIGE_TIERS)) ? PR_PRESTIGE_TIERS.map(t=>t.label) : []),
      ...((typeof PR_LETTER_GRADES!=='undefined' && Array.isArray(PR_LETTER_GRADES)) ? [...PR_LETTER_GRADES].reverse() : []),
    ];
    const byGrade = {};
    rows.forEach(r => {
      const g = r.info.gradeLabel;
      if(!byGrade[g]) byGrade[g] = [];
      byGrade[g].push(r);
    });
    gradeOrder.forEach(g => {
      const grp = byGrade[g];
      if(!grp || !grp.length) return;
      const color = grp[0].info.color;
      h += `<div class="lvl-grade-group">
        <div class="lvl-grade-group-head">
          <span class="lvl-grade-group-badge" style="background:${color}">${escHTML(g)}</span>
          <span class="lvl-grade-group-title">${escHTML(g)} 등급</span>
          <span class="lvl-grade-group-count">${grp.length}명</span>
        </div>
        ${_lvlTableHTML(grp)}
      </div>`;
    });
  } else {
    h += _lvlTableHTML(rows);
  }

  h += `</div>`;
  return h;
}
