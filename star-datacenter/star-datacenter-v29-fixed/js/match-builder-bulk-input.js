/* ══════════════════════════════════════
   Match Builder Bulk Input
══════════════════════════════════════ */

window._indBulkRows = window._indBulkRows || null;

function _indBulkDefaultRow(){
  const today = new Date().toISOString().slice(0,10);
  return {date:(_indInput?.date||today), winner:'', loser:'', map:'', memo:''};
}

function openIndBulkModal(){
  if(!isLoggedIn) return alert('로그인이 필요합니다.');
  if(!window._indBulkRows || !Array.isArray(window._indBulkRows) || window._indBulkRows.length===0){
    window._indBulkRows = [_indBulkDefaultRow()];
  }
  _renderIndBulkModal();
}

function closeIndBulkModal(){
  const el=document.getElementById('_indBulkModal');
  if(el) el.remove();
}

function indBulkAddRow(){
  window._indBulkRows = window._indBulkRows || [];
  window._indBulkRows.push(_indBulkDefaultRow());
  _renderIndBulkModal(true);
}

function indBulkDelRow(i){
  window._indBulkRows = window._indBulkRows || [];
  window._indBulkRows.splice(i,1);
  if(window._indBulkRows.length===0) window._indBulkRows=[_indBulkDefaultRow()];
  _renderIndBulkModal(true);
}

function indBulkSet(i, field, val){
  window._indBulkRows = window._indBulkRows || [];
  if(!window._indBulkRows[i]) window._indBulkRows[i]=_indBulkDefaultRow();
  window._indBulkRows[i][field]=val;
}

function indBulkApply(){
  const rows = (window._indBulkRows||[]).map(r=>({
    date:String(r.date||'').trim(),
    winner:String(r.winner||'').trim(),
    loser:String(r.loser||'').trim(),
    map:String(r.map||'').trim(),
    memo:String(r.memo||'').trim(),
  })).filter(r=>r.winner||r.loser||r.map||r.memo||r.date);
  if(!rows.length) return alert('입력된 행이 없습니다.');
  const bad = rows.find(r=>!r.date||!r.winner||!r.loser||r.winner===r.loser);
  if(bad) return alert('날짜/승자/패자를 확인해주세요. (승자와 패자는 달라야 함)');
  if(!confirm(`총 ${rows.length}경기를 개인전에 추가할까요?`)) return;
  const newGames=[];
  rows.forEach(r=>{
    const id=genId();
    const sid=genId();
    const m={_id:id,sid,d:r.date,wName:r.winner,lName:r.loser,map:r.map||''};
    if(r.memo) m.memo = r.memo;
    try{ applyGameResult(m.wName,m.lName,r.date,'',m._id,'','','개인전'); }catch(e){}
    newGames.push(m);
  });
  indM.unshift(...newGames);
  save();
  window._indBulkRows = [_indBulkDefaultRow()];
  closeIndBulkModal();
  indSub='records';
  render();
}

function _renderIndBulkModal(keepScroll){
  let el=document.getElementById('_indBulkModal');
  const rows = window._indBulkRows || [];
  if(!el){
    el=document.createElement('div');
    el.id='_indBulkModal';
    el.className='modal no-export';
    el.style.cssText='display:flex;z-index:9999';
    el.onclick=(e)=>{ if(e.target===el) closeIndBulkModal(); };
    document.body.appendChild(el);
  }
  const listId='ind-bulk-player-list';
  const dl = (typeof players!=='undefined' ? players.map(p=>`<option value="${(p.name||'').replace(/"/g,'&quot;')}">`).join('') : '');
  const body = `
    <div class="mbox" style="width:min(760px,96vw);max-height:88vh;overflow:auto">
      <div class="mtitle">➕ 개인전 여러 경기 입력</div>
      <div style="font-size:11px;color:var(--gray-l);margin-bottom:10px">한 번에 여러 경기(1:1)를 추가합니다.</div>
      <datalist id="${listId}">${dl}</datalist>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">
        <button class="btn btn-w btn-sm" onclick="indBulkAddRow()">+ 행 추가</button>
        <button class="btn btn-b btn-sm" onclick="indBulkApply()">저장</button>
        <button class="btn btn-w btn-sm" onclick="closeIndBulkModal()">닫기</button>
      </div>
      <div style="overflow:auto;border:1px solid var(--border);border-radius:12px;background:var(--white)">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:var(--surface);color:var(--text3);font-weight:900">
              <th style="padding:10px;text-align:left;white-space:nowrap;width:34px">#</th>
              <th style="padding:10px;text-align:left;white-space:nowrap">날짜</th>
              <th style="padding:10px;text-align:left;white-space:nowrap">승자</th>
              <th style="padding:10px;text-align:left;white-space:nowrap">패자</th>
              <th style="padding:10px;text-align:left;white-space:nowrap">맵</th>
              <th style="padding:10px;text-align:left;white-space:nowrap">메모</th>
              <th style="padding:10px;text-align:right;white-space:nowrap">삭제</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r,i)=>`
              <tr style="border-top:1px solid var(--border)">
                <td style="padding:8px 10px;color:var(--gray-l);font-weight:900">${i+1}</td>
                <td style="padding:8px 10px"><input type="date" value="${(r.date||'').replace(/"/g,'&quot;')}" onchange="indBulkSet(${i},'date',this.value)" style="padding:6px 8px;border:1px solid var(--border2);border-radius:8px"></td>
                <td style="padding:8px 10px"><input list="${listId}" value="${(r.winner||'').replace(/"/g,'&quot;')}" onchange="indBulkSet(${i},'winner',this.value)" placeholder="승자" style="width:140px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px"></td>
                <td style="padding:8px 10px"><input list="${listId}" value="${(r.loser||'').replace(/"/g,'&quot;')}" onchange="indBulkSet(${i},'loser',this.value)" placeholder="패자" style="width:140px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px"></td>
                <td style="padding:8px 10px"><input value="${(r.map||'').replace(/"/g,'&quot;')}" onchange="indBulkSet(${i},'map',this.value)" placeholder="맵" style="width:120px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px"></td>
                <td style="padding:8px 10px"><input value="${(r.memo||'').replace(/"/g,'&quot;')}" onchange="indBulkSet(${i},'memo',this.value)" placeholder="" style="width:220px;padding:6px 8px;border:1px solid var(--border2);border-radius:8px"></td>
                <td style="padding:8px 10px;text-align:right"><button class="btn btn-w btn-xs" onclick="indBulkDelRow(${i})">🗑</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
  const prevScroll = keepScroll ? el.querySelector('.mbox')?.scrollTop : 0;
  el.innerHTML = body;
  if(keepScroll){
    try{ el.querySelector('.mbox').scrollTop = prevScroll; }catch(e){}
  }
}
