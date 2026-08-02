/* ══════════════════════════════════════════════════════════════
   통계 - Star System HTML (stats-core.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function statsStarSystemHTML(){
  const enabled = (localStorage.getItem('su_starSystem_enabled') ?? '0') === '1';
  const kwsRaw = (localStorage.getItem('su_starSystem_keywords') || '').trim();
  const C = window.SS_CONST;
  const spec = `프로젝트 개요
목적: 스타크래프트 스트리머의 실력을 가장 정직하게 반영하는 티어 산정 및 관리 시스템.
핵심 원칙:
1. 개인 스폰빵 배제, 공식전(대학대전, CK, 교수/코치 주관 경기)만 인정.
2. 승급은 어렵고, 강등과 복귀 검증은 엄격하게 처리.
3. 데이터의 공신력을 위해 수치 기반의 제로섬(Zero-sum) 로직 적용.

티어 유지 및 점수 로직 (제로섬 ${C.PTS_SAME}점 체제)
모든 사용자는 각 티어별 기본 ${C.START}점에서 시작하며, 경기 결과에 따라 점수를 가감한다.
[포인트 계산]
동일 티어(0): 승 +${C.PTS_SAME} / 패 -${C.PTS_SAME}
상위 티어(+1): 승 +${C.PTS_UP} / 패 -${C.PTS_UP}
하위 티어(-1): 승 +${C.PTS_DOWN} / 패 -${C.PTS_DOWN}
[승강급 기준]
승급: ${C.PROMO_THRESHOLD}점 도달 시 ‘승급 검증’
강등: ${C.DEMOTE_THRESHOLD}점 미만 시 ‘강등 위기’

활동/강등 예외
0~1티어: 강등 없음(명예) — 1년 미참여 시 비활성
2티어: 6개월~1년 미활동 시 매월 -3점
3티어 이하: 6개월 이상 공식 기록 없으면 즉시 강등 또는 티어 말소

복귀자 연쇄 검증(Recursive Validation)
6개월 이상 휴식 후 복귀:
1차 관문(필수): 동일 티어 & 동일 종족 + 교수/코치 주관 공식전
패배 페널티: 즉시 -10점, 상태 VERIFY_DOWNGRADE
한 단계 낮은 티어의 상~중위권과 다음 검증전을 배치 (승리할 때까지 하향 반복)
`;


  const css = `<style>
    .ss-tier{margin-top:10px;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--white)}
    .ss-tier-h{padding:10px 12px;background:linear-gradient(135deg,#111827,#334155);color:#fff;font-weight:1000;display:flex;align-items:center;gap:8px}
    .ss-tier-b{padding:10px 12px}
    .ss-table{width:100%;border-collapse:collapse}
    .ss-table th,.ss-table td{padding:8px 6px;border-bottom:1px solid rgba(0,0,0,.06);text-align:center;font-size:var(--fs-sm)}
    .ss-table th{text-align:center;color:var(--gray-l);font-weight:900;background:var(--surface)}
    .ss-name{font-weight:1000;color:var(--text2);text-align:left}
    .ss-pts{font-weight:1000;color:#7c3aed}
    .ss-badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:var(--fs-caption);font-weight:1000;border:1px solid rgba(0,0,0,.08);background:rgba(255,255,255,.85);max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .ss-badge.ok{color:#16a34a;border-color:rgba(22,163,74,.25)}
    .ss-badge.promo{color:#7c3aed;border-color:rgba(124,58,237,.25)}
    .ss-badge.danger{color:#dc2626;border-color:rgba(220,38,38,.25)}
  </style>`;

  const header = `<div class="ssec">
    ${css}
    <h3 style="margin:0 0 8px">⭐ Project Star System</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
      <span class="ubadge" style="background:${enabled?'#16a34a':'#6b7280'}">${enabled?'사용중':'사용중지'}</span>
      <button class="btn btn-b btn-sm" ${enabled?'disabled':''} onclick="starSystemSetEnabled(true)">✅ 사용 시작</button>
      <button class="btn btn-w btn-sm" ${!enabled?'disabled':''} onclick="starSystemSetEnabled(false)">⛔ 사용 중지</button>
      <button class="btn btn-w btn-sm" onclick="openStarSystemInfo()">📘 산정기준</button>
      <button class="btn btn-w btn-sm" onclick="openCfgTier()">🎭 티어표 관리</button>
      <span style="font-size:var(--fs-sm);color:var(--gray-l)">※ 서버 없이 “기존 기록 데이터(펨코 스타 게시판 경기결과탭에서 등록된 기록 포함)”로 점수 계산합니다.</span>
    </div>

    <div style="padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);margin-bottom:10px">
      <div style="font-size:var(--fs-sm);font-weight:1000;color:var(--text2);margin-bottom:8px">공식전 모드 키워드</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <input type="text" value="${escHTML(kwsRaw||_ssKeywords().join(','))}" oninput="starSystemSetKeywords(this.value)" placeholder="예: 대학대전,CK,교수,코치,프로리그..." style="flex:1;min-width:260px">
        <button class="btn btn-w btn-sm" onclick="starSystemSetKeywords('대학대전,대학CK,CK,교수,코치,주관,미니대전,프로리그,티어대회,대회,토너먼트')">기본값</button>
      </div>
      <div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:6px">mode(기록의 경기 구분 텍스트)에 키워드가 포함되면 공식전으로 처리합니다.</div>
    </div>

    <div style="padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r)">
      <div style="font-size:var(--fs-sm);font-weight:1000;color:var(--text2);margin-bottom:8px">사양서</div>
      <pre style="white-space:pre-wrap;line-height:1.55;font-size:var(--fs-sm);color:var(--text3);max-height:300px;overflow:auto;margin:0">${escHTML(spec)}</pre>
    </div>
  </div>`;

  if(!enabled){
    return header + `<div class="ssec" style="margin-top:10px"><div style="font-size:var(--fs-sm);color:var(--gray-l);line-height:1.6">‘사용 시작’을 누르면 아래에 티어별 점수/랭킹이 표시됩니다.</div></div>`;
  }

  const all=_ssComputeAll();
  const byTier={};
  all.forEach(r=>{ if(!byTier[r.tier]) byTier[r.tier]=[]; byTier[r.tier].push(r); });
  const tierOrder = Object.keys(byTier).sort((a,b)=> (_ssTierToNum(a)??99)-(_ssTierToNum(b)??99));
  const tiersHTML = tierOrder.map(t=>{
    const arr = byTier[t].slice().sort((a,b)=> b.points-a.points || b.games-a.games);
    const tnum=_ssTierToNum(t);
    return `<div class="ss-tier">
      <div class="ss-tier-h">🏷️ ${escHTML(t)} <span style="opacity:.8;font-size:var(--fs-sm)">(${tnum!=null?tnum:'?'})</span><span style="margin-left:auto;opacity:.85;font-size:var(--fs-sm)">인원 ${arr.length}</span></div>
      <div class="ss-tier-b">
        <table class="ss-table">
          <thead><tr><th style="width:60px">순위</th><th style="text-align:left">선수</th><th style="width:90px">점수</th><th style="width:150px">상태</th><th style="width:110px">최근 공식전</th><th style="width:70px">경기수</th></tr></thead>
          <tbody>
            ${arr.map((r,i)=>{
              const bcls = r.status==='승급 검증'?'promo':(r.status==='강등 위기'?'danger':'ok');
              return `<tr>
                <td>${i+1}</td>
                <td class="ss-name"><span class="clickable-name" onclick="openPlayerModal('${escJS(r.name)}')">${escHTML(r.name)}</span> <span style="color:${gc(r.univ)};font-size:var(--fs-caption);font-weight:900">${escHTML(r.univ||'')}</span></td>
                <td class="ss-pts">${r.points}</td>
                <td><span class="ss-badge ${bcls}">${escHTML(r.status)}${r.inactiveNote?` · ${escHTML(r.inactiveNote)}`:''}</span></td>
                <td style="color:var(--gray-l)">${escHTML(r.last||'-')}</td>
                <td>${r.games}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }).join('');

  return header + `<div class="ssec" style="margin-top:10px">
    <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:8px">※ 2026-08-02 이후 등록되는 경기부터는 "경기 당시 티어" 스냅샷을 저장해 상대 티어 차이를 정확히 계산합니다. 그 이전 기록은 스냅샷이 없어 현재 티어로 대체 계산됩니다.</div>
  </div>` + tiersHTML;
}

/* ══════════════════════════════════════
   1. 종합 (기존 내용 유지)
══════════════════════════════════════ */
