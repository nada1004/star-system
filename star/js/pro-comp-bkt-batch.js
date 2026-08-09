/* ══════════════════════════════════════════════════════════════
   프로리그 - 대진표 결과 일괄입력 모달 (pro-comp-edit-paste.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function proCompOpenBktBatchModal(tnId) {
  const tn = _findTourneyById(tnId);
  if (!tn || !tn.bracket || !tn.bracket.length) return;
  
  const modal = document.createElement('div');
  modal.id = '_bktBatchModal';
  modal.style.cssText = 'position:fixed;inset:0;background:#0008;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  modal.innerHTML = `
    <div style="background:var(--white);border-radius:var(--r2);padding:24px;width:400px;max-width:100%;box-shadow:0 8px 40px rgba(0,0,0,.3)">
      <div style="font-weight:900;font-size:16px;margin-bottom:8px">📋 대진표 결과 일괄 입력</div>
      <div style="font-size:var(--fs-sm);color:var(--gray-l);margin-bottom:16px;line-height:1.5">
        한 줄에 한 경기씩 입력하세요.<br>
        형식: <b>승자이름 패자이름 [맵이름]</b><br>
        <span style="color:var(--blue)">예) 홍길동 임꺽정 투혼</span>
      </div>
      <textarea id="_bktBatchText" style="width:100%;height:200px;padding:12px;border-radius:var(--r);border:1.5px solid var(--border);font-size:var(--fs-base);margin-bottom:16px;box-sizing:border-box;resize:none" placeholder="여기에 복사해서 붙여넣으세요..."></textarea>
      <div style="display:flex;gap:10px">
        <button class="btn btn-b" style="flex:1" onclick="proCompSaveBktBatch('${tnId}')">적용하기</button>
        <button class="btn btn-w" style="flex:1" onclick="document.getElementById('_bktBatchModal').remove()">취소</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function proCompSaveBktBatch(tnId) {
  const text = document.getElementById('_bktBatchText').value.trim();
  if (!text) return;
  const tn = _findTourneyById(tnId);
  if (!tn || !tn.bracket) return;

  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
  let applied = 0;

  lines.forEach(line => {
    const parts = line.split(/[\s\t]+/);
    if (parts.length < 2) return;
    const p1 = parts[0], p2 = parts[1], map = parts[2] || '';

    // 대진표 전체를 돌며 매칭되는 경기 찾기
    let found = false;
    for (let ri=0; ri<tn.bracket.length; ri++) {
      for (let mi=0; mi<tn.bracket[ri].length; mi++) {
        const m = tn.bracket[ri][mi];
        if (!m.a || !m.b || m.a==='TBD' || m.b==='TBD') continue;

        let winner = '';
        if (m.a===p1 && m.b===p2) winner = 'A';
        else if (m.a===p2 && m.b===p1) winner = 'B';
        if (!winner) {
          const pa = players.find(x=>x.name===m.a)||null;
          const pb = players.find(x=>x.name===m.b)||null;
          if (pa && pb) {
            if (pa.univ===p1 && pb.univ===p2) winner = 'A';
            else if (pa.univ===p2 && pb.univ===p1) winner = 'B';
          }
        }

        if (winner) {
          const prevWinner = m.winner;
          const bktMatchId = `pbn_${tnId}_${ri}_${mi}`;
          
          if (prevWinner) _revertProMatch(bktMatchId);
          
          m.winner = winner;
          if (map) m.map = map;
          _syncBktMatchToHistory(tn, m, bktMatchId, ri, mi);
          applied++;
          found = true;
          break;
        }
      }
      if (found) break;
    }
    
    // 3위전도 확인
    if (!found && tn.thirdPlace) {
      const tp = tn.thirdPlace;
      if (tp.a && tp.b && tp.a!=='TBD' && tp.b!=='TBD') {
        let winner = '';
        if (tp.a===p1 && tp.b===p2) winner = 'A';
        else if (tp.a===p2 && tp.b===p1) winner = 'B';
        if (!winner) {
          const pa = players.find(x=>x.name===tp.a)||null;
          const pb = players.find(x=>x.name===tp.b)||null;
          if (pa && pb) {
            if (pa.univ===p1 && pb.univ===p2) winner = 'A';
            else if (pa.univ===p2 && pb.univ===p1) winner = 'B';
          }
        }

        if (winner) {
          const bktMatchId = `pbn_${tnId}_3rd`;
          if (tp.winner) _revertProMatch(bktMatchId);
          tp.winner = winner;
          if (map) tp.map = map;
          _syncBktMatchToHistory(tn, tp, bktMatchId, '3rd', 0);
          applied++;
        }
      }
    }
  });

  document.getElementById('_bktBatchModal').remove();
  save(); render();
  if (applied > 0) alert(`${applied}경기의 결과가 반영되었습니다.`);
  else alert('일치하는 경기를 찾지 못했습니다. 이름을 확인해주세요.');
}
