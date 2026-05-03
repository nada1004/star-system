(function(){
  function statsTierWinHTML(){
    const f=window._tierWinFilter||{race:'',univ:'',gender:''};
    const tierIdx={};
    (window.TIERS||[]).forEach((t,i)=>tierIdx[t]=i);
    const data=[];
    (window.players||[]).filter(p=>{
      if(f.race&&p.race!==f.race)return false;
      if(f.univ&&p.univ!==f.univ)return false;
      if(f.gender&&p.gender!==f.gender)return false;
      return true;
    }).forEach(p=>{
      const myIdx=tierIdx[p.tier]??99;
      let up={w:0,l:0}, same={w:0,l:0}, down={w:0,l:0};
      window.statsNonProHist(p).forEach(h=>{
        const opp=window.statsP(h.opp);
        if(!opp) return;
        const oppIdx=tierIdx[opp.tier]??99;
        const diff=myIdx-oppIdx;
        const bucket=diff<0?up:diff===0?same:down;
        if(h.result==='승') bucket.w++; else bucket.l++;
      });
      const tot=up.w+up.l+same.w+same.l+down.w+down.l;
      if(tot<1) return;
      data.push({...p,up,same,down,tot});
    });
    data.sort((a,b)=>{
      const aUp=a.up.w+a.up.l>0?a.up.w/(a.up.w+a.up.l):0;
      const bUp=b.up.w+b.up.l>0?b.up.w/(b.up.w+b.up.l):0;
      return bUp-aUp;
    });

    const univs=window.getAllUnivs();
    const bar=(w,l,color)=>{
      const t=w+l; if(!t) return '<span style="color:var(--gray-l);font-size:11px">-</span>';
      const r=Math.round(w/t*100);
      return`<div style="display:flex;flex-direction:column;align-items:center;gap:2px;min-width:52px">
        <div style="font-weight:800;font-size:12px;color:${r>=50?color:'#94a3b8'}">${r}%</div>
        <div style="width:48px;height:6px;background:var(--border2);border-radius:3px;overflow:hidden">
          <div style="width:${r}%;height:100%;background:${r>=50?color:'#e2e8f0'};border-radius:3px"></div>
        </div>
        <div style="font-size:9px;color:var(--gray-l)">${w}W${l}L</div>
      </div>`;
    };

    return`<div style="display:flex;flex-direction:column;gap:14px">
    <div class="ssec" id="stats-tierwin-sec">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
        <h4 style="margin:0">🎯 티어별 승률 분석 <span style="font-size:11px;color:var(--gray-l);font-weight:400">(프로리그·남자 포함 전체)</span></h4>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <select onchange="_tierWinFilter.race=this.value;render()" style="font-size:12px;padding:5px 8px;border:1px solid var(--border2);border-radius:7px">
          <option value="">종족 전체</option>
          <option value="T"${f.race==='T'?' selected':''}>테란</option>
          <option value="Z"${f.race==='Z'?' selected':''}>저그</option>
          <option value="P"${f.race==='P'?' selected':''}>프로토스</option>
        </select>
        <select onchange="_tierWinFilter.univ=this.value;render()" style="font-size:12px;padding:5px 8px;border:1px solid var(--border2);border-radius:7px">
          <option value="">대학 전체</option>
          ${univs.map(u=>`<option value="${u.name}"${f.univ===u.name?' selected':''}>${u.name}</option>`).join('')}
        </select>
        <select onchange="_tierWinFilter.gender=this.value;render()" style="font-size:12px;padding:5px 8px;border:1px solid var(--border2);border-radius:7px">
          <option value="">성별 전체</option>
          <option value="M"${f.gender==='M'?' selected':''}>👨 남자</option>
          <option value="F"${f.gender==='F'?' selected':''}>👩 여자</option>
        </select>
        <button class="btn btn-w btn-sm" onclick="_tierWinFilter={race:'',univ:'',gender:''};render()">🔄 초기화</button>
      </div>
      ${data.length===0?'<p style="color:var(--gray-l);padding:20px;text-align:center">조건에 맞는 데이터 없음</p>':`
      <div style="overflow-x:auto"><table>
        <thead><tr>
          <th style="min-width:30px">순위</th><th style="min-width:80px">선수</th><th>대학</th><th>티어</th>
          <th style="min-width:70px;text-align:center">⬆️ 상위킬</th>
          <th style="min-width:70px;text-align:center">↔️ 동티어</th>
          <th style="min-width:70px;text-align:center">⬇️ 하위전</th>
          <th style="min-width:50px;text-align:center">총경기</th>
        </tr></thead><tbody>
        ${data.map((p,i)=>`<tr style="cursor:pointer" onclick="openPlayerModal('${p.name}')">
          <td>${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td>
          <td style="font-weight:700;color:var(--blue)">${p.name}</td>
          <td><span class="ubadge" style="background:${window.gc(p.univ)}">${p.univ}</span></td>
          <td>${window.getTierLabel(p.tier||'-')}</td>
          <td style="text-align:center">${bar(p.up.w,p.up.l,'#7c3aed')}</td>
          <td style="text-align:center">${bar(p.same.w,p.same.l,'#2563eb')}</td>
          <td style="text-align:center">${bar(p.down.w,p.down.l,'#16a34a')}</td>
          <td style="text-align:center;color:var(--gray-l);font-size:12px">${p.tot}</td>
        </tr>`).join('')}
        </tbody>
      </table></div>`}
    </div></div>`;
  }

  window.statsTierWinHTML = statsTierWinHTML;
})();
