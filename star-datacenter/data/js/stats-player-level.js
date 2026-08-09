/* ══════════════════════════════════════════════════════════════
   선수 리포트 - 승수 기반 레벨/등급 시스템 (2026-08-02)
   - 레벨 0~1000, 레벨당 10점 고정, 구간별 승당 점수가 10→1점으로 점점 감소
     (1~100:10점 / 101~200:9점 / 201~300:8점 / 301~400:7점 / 401~500:6점
      501~600:5점 / 601~700:4점 / 701~800:3점 / 801~900:2점 / 901~1000:1점)
   - 등급: 레벨 0~1000을 Z~A 26단계로 균등 분할
   - 레벨 1000(A) 달성 이후: SS → SSS → SSS+ 프레스티지 등급
     (만렙 이후 추가 승수 누적으로 승급, 정규 레벨 공식과 별개)
   ══════════════════════════════════════════════════════════════ */

/* ─── 배지 스타일 자체 주입 (1회) — 이 파일이 코어 번들(스트리머 상세 팝업 등)에서도
   단독으로 쓰이므로, 통계탭 리포트 CSS(stats-player-report-data.js)와 별개로 자체 보유 ─── */
try{
  if(typeof document !== 'undefined' && !document.getElementById('pr-level-badge-style')){
    var _prLvlStyleEl = document.createElement('style');
    _prLvlStyleEl.id = 'pr-level-badge-style';
    _prLvlStyleEl.textContent = [
      '.pr-level-badge{display:inline-flex;align-items:center;gap:7px;padding:5px 12px 5px 6px;border-radius:999px;border:1.5px solid;line-height:1}',
      '.pr-level-grade{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 6px;border-radius:999px;font-size:11.5px;font-weight:900;letter-spacing:-.01em;color:#fff;flex-shrink:0;box-shadow:0 1px 3px rgba(15,23,42,.22)}',
      '.pr-level-num{font-size:11px;font-weight:800;color:var(--text2)}',
      '.pr-level-bar{width:34px;height:5px;border-radius:999px;background:var(--border2);overflow:hidden;display:inline-block}',
      '.pr-level-bar-fill{display:block;height:100%;border-radius:999px}',
    ].join('\n');
    document.head.appendChild(_prLvlStyleEl);
  }
}catch(e){}

var PR_LEVEL_MAX = 1000;
var PR_LEVEL_PTS_PER_LEVEL = 10;
var PR_LEVEL_BRACKETS = [
  { toLevel: 100,  ptsPerWin: 10 },
  { toLevel: 200,  ptsPerWin: 9  },
  { toLevel: 300,  ptsPerWin: 8  },
  { toLevel: 400,  ptsPerWin: 7  },
  { toLevel: 500,  ptsPerWin: 6  },
  { toLevel: 600,  ptsPerWin: 5  },
  { toLevel: 700,  ptsPerWin: 4  },
  { toLevel: 800,  ptsPerWin: 3  },
  { toLevel: 900,  ptsPerWin: 2  },
  { toLevel: 1000, ptsPerWin: 1  },
];

/* Z(최하) → A(최고) 26단계 색상 보간용 순서 (구간 폭은 아래 PR_GRADE_BOUNDS 참고) */
var PR_LETTER_GRADES = ['Z','Y','X','W','V','U','T','S','R','Q','P','O','N','M','L','K','J','I','H','G','F','E','D','C','B','A'];

/* 레벨 0~1000을 26등급으로 나누되, 뒤로 갈수록(Z→A) 구간 폭이 점점 넓어짐(=점점 어려워짐)
   가중치 1,2,3...26(Z가 가장 가볍고 A가 가장 무거움) 비율로 분배 */
var PR_GRADE_BOUNDS = [
  ['Z',0,3],    ['Y',3,9],    ['X',9,17],   ['W',17,28],  ['V',28,43],
  ['U',43,60],  ['T',60,80],  ['S',80,103], ['R',103,128],['Q',128,157],
  ['P',157,188],['O',188,222],['N',222,259],['M',259,299],['L',299,342],
  ['K',342,387],['J',387,436],['I',436,487],['H',487,541],['G',541,598],
  ['F',598,658],['E',658,721],['D',721,786],['C',786,855],['B',855,926],
  ['A',926,1000],
];

/* 만렙(A) 이후 프레스티지 등급 — 추가 승수 기준 (높은 순으로 정렬) */
var PR_PRESTIGE_TIERS = [
  { extraWins: 1000, label: 'SSS+', color: '#be123c' },
  { extraWins: 500,  label: 'SSS',  color: '#c026d3' },
  { extraWins: 0,    label: 'SS',   color: '#7c3aed' },
];

/* 레벨 1000 도달에 필요한 총 승수 (브래킷 전부 완주 시) — 1회 계산해 캐시 */
var PR_TOTAL_WINS_FOR_MAX_LEVEL = (function(){
  var total = 0, prevLevel = 0;
  PR_LEVEL_BRACKETS.forEach(function(b){
    var levels = b.toLevel - prevLevel;
    total += (levels * PR_LEVEL_PTS_PER_LEVEL) / b.ptsPerWin;
    prevLevel = b.toLevel;
  });
  return total;
})();

/* 누적 승수 → { level, bracketPtsPerWin, winsIntoLevel, winsForNextLevel, progressPct } */
function _prLevelInfoFromWins(wins){
  var w = Math.max(0, Number(wins) || 0);
  var remaining = w;
  var level = 0, prevLevel = 0;
  var curPtsPerWin = PR_LEVEL_BRACKETS[0].ptsPerWin;
  var extraWins = 0;

  for (var i = 0; i < PR_LEVEL_BRACKETS.length; i++) {
    var b = PR_LEVEL_BRACKETS[i];
    var levelsInBracket = b.toLevel - prevLevel;
    var winsToCompleteBracket = (levelsInBracket * PR_LEVEL_PTS_PER_LEVEL) / b.ptsPerWin;
    curPtsPerWin = b.ptsPerWin;
    if (remaining >= winsToCompleteBracket) {
      level = b.toLevel;
      remaining -= winsToCompleteBracket;
      prevLevel = b.toLevel;
    } else {
      var gained = Math.floor(remaining * b.ptsPerWin / PR_LEVEL_PTS_PER_LEVEL);
      level = prevLevel + gained;
      remaining -= (gained * PR_LEVEL_PTS_PER_LEVEL / b.ptsPerWin);
      break;
    }
  }

  level = Math.min(level, PR_LEVEL_MAX);

  if (level >= PR_LEVEL_MAX) {
    extraWins = Math.max(0, w - PR_TOTAL_WINS_FOR_MAX_LEVEL);
  }

  // 진행률(다음 레벨까지) — 표시용
  var winsForNextLevel = PR_LEVEL_PTS_PER_LEVEL / curPtsPerWin;
  var progressPct = level >= PR_LEVEL_MAX ? 100 : Math.max(0, Math.min(100, Math.round((remaining / winsForNextLevel) * 100)));

  return {
    wins: w,
    level: level,
    extraWins: extraWins,
    progressPct: progressPct,
    winsIntoLevel: remaining,
    winsForNextLevel: winsForNextLevel,
  };
}

/* 레벨(+만렙 이후 추가승수) → 등급 라벨/색상 */
function _prGradeFromLevel(level, extraWins){
  if (level >= PR_LEVEL_MAX) {
    for (var i = 0; i < PR_PRESTIGE_TIERS.length; i++) {
      if ((extraWins || 0) >= PR_PRESTIGE_TIERS[i].extraWins) return PR_PRESTIGE_TIERS[i];
    }
  }
  for (var j = 0; j < PR_GRADE_BOUNDS.length; j++) {
    var g = PR_GRADE_BOUNDS[j];
    if (level < g[2] || j === PR_GRADE_BOUNDS.length - 1) return { label: g[0], color: null };
  }
}

/* 등급 라벨별 컬러(문자 등급용) — 26등급을 5개 계급군(밴드)으로 나누고
   밴드마다 서로 뚜렷이 다른 색상을 쓰되, 밴드 내에서는 옅음→짙음으로 살짝 그라데이션.
   (기존엔 슬레이트→인디고→앰버 한 줄 보간이라 인접 등급끼리 색이 거의 안 구분됐음) */
var PR_GRADE_BANDS = [
  { letters: ['Z','Y','X','W','V'],         from: '#94a3b8', to: '#475569' }, // 그레이 (입문)
  { letters: ['U','T','S','R','Q'],         from: '#d97706', to: '#92400e' }, // 브론즈
  { letters: ['P','O','N','M','L'],         from: '#38bdf8', to: '#0369a1' }, // 실버(스틸블루)
  { letters: ['K','J','I','H','G'],         from: '#fbbf24', to: '#b45309' }, // 골드
  { letters: ['F','E','D','C','B','A'],     from: '#34d399', to: '#7c3aed' }, // 에메랄드→퍼플(SS로 자연스럽게 이어짐)
];
function _prLetterGradeColor(label){
  for (var i = 0; i < PR_GRADE_BANDS.length; i++) {
    var band = PR_GRADE_BANDS[i];
    var idx = band.letters.indexOf(label);
    if (idx < 0) continue;
    var t = band.letters.length > 1 ? idx / (band.letters.length - 1) : 0;
    return _prLerpHexColor(band.from, band.to, t);
  }
  return '#64748b';
}
function _prLerpHexColor(a, b, t){
  function hex2rgb(h){ h = h.replace('#',''); return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; }
  var ca = hex2rgb(a), cb = hex2rgb(b);
  var rc = ca.map(function(c,i){ return Math.round(c + (cb[i]-c) * t); });
  return 'rgb(' + rc.join(',') + ')';
}

/* 색상 문자열("#rrggbb" 또는 "rgb(r,g,b)") → [r,g,b] 튜플
   (이전 코드가 rgb(...) 문자열 뒤에 16진수 알파 접미사('45','16')를 그대로 이어붙여
    "rgb(99,102,241)45" 같은 잘못된 CSS 값을 만들던 버그를 근본적으로 없애기 위한 유틸) */
function _prColorRgb(c){
  c = String(c || '').trim();
  var m = c.match(/^rgba?\(([^)]+)\)$/i);
  if(m){
    var parts = m[1].split(',').map(function(x){ return parseFloat(x) || 0; });
    return [parts[0]||0, parts[1]||0, parts[2]||0];
  }
  if(c[0] === '#'){
    var h = c.slice(1);
    if(h.length === 3) h = h.split('').map(function(ch){ return ch+ch; }).join('');
    return [parseInt(h.slice(0,2),16)||0, parseInt(h.slice(2,4),16)||0, parseInt(h.slice(4,6),16)||0];
  }
  return [100,116,139]; // fallback: slate
}

/* 선수 객체 p (p.win 사용) → 히어로 배지에 쓸 최종 정보 */
function _prPlayerLevelBadgeInfo(p){
  var info = _prLevelInfoFromWins(p && p.win);
  var grade = _prGradeFromLevel(info.level, info.extraWins);
  var color = grade.color || _prLetterGradeColor(grade.label);
  return {
    level: info.level,
    progressPct: info.progressPct,
    isMaxed: info.level >= PR_LEVEL_MAX,
    gradeLabel: grade.label,
    color: color,
  };
}

/* 히어로 영역에 삽입할 레벨 배지 HTML */
function _prLevelBadgeHTML(p){
  var b = _prPlayerLevelBadgeInfo(p);
  var lvlTxt = b.isMaxed ? 'MAX' : ('Lv.' + b.level);
  var rgb = _prColorRgb(b.color).join(',');
  return '<span class="pr-level-badge" style="border-color:rgba(' + rgb + ',.25);background:rgba(' + rgb + ',.06)" title="누적 ' + (Number(p && p.win) || 0) + '승 기준">'
       + '<span class="pr-level-grade" style="background:' + b.color + '">' + escHTML(b.gradeLabel) + '</span>'
       + '<span class="pr-level-num">' + lvlTxt + '</span>'
       + '<span class="pr-level-bar"><span class="pr-level-bar-fill" style="width:' + b.progressPct + '%;background:' + b.color + '"></span></span>'
       + '</span>';
}
