/* ══════════════════════════════════════════════════════════════
   통계 - 대학 비교 (stats-overview-elo.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function statsUnivCompareHTML() {
  const _dissSet = new Set((typeof univCfg !== 'undefined' ? univCfg : []).filter(u=>u.dissolved||u.hidden).map(u=>String(u.name||'').trim()));
  const _players = Array.isArray(players) ? players : [];
  const univList = (typeof getAllUnivs==='function'?getAllUnivs():[]).filter(u=>u.name && u.name!=='무소속' && !_dissSet.has(String(u.name||'').trim()) && _players.some(p=>p.univ===u.name));
  if (!_statsCompareA && univList.length>0) _statsCompareA = univList[0]?.name||'';
  if (!_statsCompareB && univList.length>1) _statsCompareB = univList.find(u=>u.name!==_statsCompareA)?.name||'';

  const getStats = (name) => {
    const members = _players.filter(p=>String(p?.univ||'').trim()===name&&!p.hidden&&!p.retired&&!p.hideFromBoard&&!_dissSet.has(name));
    const tiered  = members.filter(p=>!_statsCvHasRole(p));
    const roled   = members.filter(p=>_statsCvHasRole(p));
    const races={P:0,T:0,Z:0,N:0};
    members.forEach(p=>{
      const r=String(p.race||'').trim().toUpperCase();
      if(r==='P'||r==='T'||r==='Z') races[r]++;
      else races.N++;
    });
    const tiers={};
    tiered.forEach(p=>{const t=p.tier||'미정';tiers[t]=(tiers[t]||0)+1;});
    const topTier = tiered.length>0?(tiered.slice().sort((a,b)=>{
      const ti=typeof TIERS!=='undefined'?TIERS:[];
      const ia=ti.indexOf(a.tier||''),ib=ti.indexOf(b.tier||'');
      return (ia>=0?ia:999)-(ib>=0?ib:999);
    })[0]?.tier||'없음'):'없음';

    // 실전 승률 계산 — 마이페이지(선수 상세)와 동일하게 p.win/p.loss 합산 기준 사용
    let tw=0,tl=0;
    tiered.forEach(p=>{
      tw += Number(p.win||0);
      tl += Number(p.loss||0);
    });
    const tg=tw+tl;
    const wr=tg>0?Math.round(tw/tg*100):null;

    return {members,tiered,roled,races,tiers,topTier,total:members.length,tw,tl,tg,wr};
  };

  // 직접 맞대결: A 선수들 history 중 oppUniv === B (또는 opp가 B 소속 선수)
  const getHeadToHead = (nameA, nameB) => {
    const aPlayers = new Set(_players.filter(p=>String(p?.univ||'').trim()===nameA&&!p.hidden&&!p.retired).map(p=>p.name));
    const bPlayers = new Set(_players.filter(p=>String(p?.univ||'').trim()===nameB).map(p=>p.name));
    let aw=0,al=0;
    // p.history 기반
    _players.filter(p=>aPlayers.has(p.name)).forEach(p=>{
      (Array.isArray(p.history)?p.history:[]).forEach(h=>{
        const oppU = String(h.oppUniv||h.univ||'').trim();
        const oppN = String(h.opp||'').trim();
        if (oppU===nameB || bPlayers.has(oppN)) {
          if(h.result==='승')aw++; else if(h.result==='패')al++;
        }
      });
    });
    // indM (개인전)
    try { (typeof indM!=='undefined'&&Array.isArray(indM)?indM:[]).forEach(m=>{
      if(!m||!m.wName||!m.lName) return;
      if(aPlayers.has(m.wName)&&bPlayers.has(m.lName)) aw++;
      else if(aPlayers.has(m.lName)&&bPlayers.has(m.wName)) al++;
    }); } catch(e){}
    // gjM (끝장전)
    try { (typeof gjM!=='undefined'&&Array.isArray(gjM)?gjM:[]).forEach(m=>{
      if(!m||!m.wName||!m.lName||m._proLabel) return;
      if(aPlayers.has(m.wName)&&bPlayers.has(m.lName)) aw++;
      else if(aPlayers.has(m.lName)&&bPlayers.has(m.wName)) al++;
    }); } catch(e){}
    // ttM (티어대회) 게임 단위
    try { (typeof ttM!=='undefined'&&Array.isArray(ttM)?ttM:[]).forEach(m=>{
      (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
        if(!g||!g.winner) return;
        const gA=g.playerA||g.a1||'', gB=g.playerB||g.b1||'';
        if(!gA||!gB) return;
        const wA=g.winner==='A'; const wB=g.winner==='B';
        if(aPlayers.has(gA)&&bPlayers.has(gB)){if(wA)aw++;else if(wB)al++;}
        else if(aPlayers.has(gB)&&bPlayers.has(gA)){if(wB)aw++;else if(wA)al++;}
      });});
    }); } catch(e){}
    // 팀전 (miniM/univM/ckM) 게임 단위
    try { [
      typeof miniM!=='undefined'?miniM:[],
      typeof univM!=='undefined'?univM:[],
      typeof ckM!=='undefined'?ckM:[]
    ].forEach(arr=>{ (Array.isArray(arr)?arr:[]).forEach(m=>{
      (m.sets||[]).forEach(s=>{(s.games||[]).forEach(g=>{
        if(!g||!g.winner) return;
        const gA=g.playerA||g.a1||'', gB=g.playerB||g.b1||'';
        if(!gA||!gB) return;
        const wA=g.winner==='A'; const wB=g.winner==='B';
        if(aPlayers.has(gA)&&bPlayers.has(gB)){if(wA)aw++;else if(wB)al++;}
        else if(aPlayers.has(gB)&&bPlayers.has(gA)){if(wB)aw++;else if(wA)al++;}
      });});
    }); }); } catch(e){}
    return {aw,al,ag:aw+al};
  };

  const colA = _statsCompareA?gc(_statsCompareA)||'#64748b':'#64748b';
  const colB = _statsCompareB?gc(_statsCompareB)||'#64748b':'#64748b';
  const stA  = _statsCompareA?getStats(_statsCompareA):null;
  const stB  = _statsCompareB?getStats(_statsCompareB):null;
  const h2h  = (_statsCompareA&&_statsCompareB)?getHeadToHead(_statsCompareA,_statsCompareB):{aw:0,al:0,ag:0};
  const h2hB = (_statsCompareA&&_statsCompareB)?getHeadToHead(_statsCompareB,_statsCompareA):{aw:0,al:0,ag:0};

  const univOptA = univList.map(u=>{const _n=(typeof escAttr==='function'?escAttr(u.name):String(u.name||''));const _nh=(typeof escHTML==='function'?escHTML(u.name):String(u.name||''));return `<option value="${_n}"${_statsCompareA===u.name?' selected':''}>${_nh}</option>`;}).join('');
  const univOptB = univList.map(u=>{const _n=(typeof escAttr==='function'?escAttr(u.name):String(u.name||''));const _nh=(typeof escHTML==='function'?escHTML(u.name):String(u.name||''));return `<option value="${_n}"${_statsCompareB===u.name?' selected':''}>${_nh}</option>`;}).join('');

  const compareRow = (label,valA,valB) => {
    const numA=typeof valA==='number'?valA:null;
    const numB=typeof valB==='number'?valB:null;
    const winA=numA!==null&&numB!==null&&numA>numB;
    const winB=numA!==null&&numB!==null&&numB>numA;
    const tot=numA!==null&&numB!==null?(numA+numB):0;
    const pctA=tot>0?Math.round(numA/tot*100):50;
    const pctB=tot>0?Math.round(numB/tot*100):50;
    const showBar=numA!==null&&numB!==null&&tot>0;
    return `<div style="padding:7px 0;border-bottom:1px solid var(--border2)">
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-bottom:${showBar?'5px':'0'}">
        <div style="text-align:right;font-size:var(--fs-base);font-weight:${winA?'900':'600'};color:${winA?colA:'var(--text2)'}">
          ${winA?'▲ ':''}${valA}
        </div>
        <div style="font-size:10px;color:var(--text3);font-weight:700;text-align:center;white-space:nowrap;min-width:58px">${label}</div>
        <div style="text-align:left;font-size:var(--fs-base);font-weight:${winB?'900':'600'};color:${winB?colB:'var(--text2)'}">
          ${valB}${winB?' ▲':''}
        </div>
      </div>
      ${showBar?`<div style="display:flex;height:5px;border-radius:3px;overflow:hidden;background:var(--border2)">
        <div style="width:${pctA}%;background:${winA?colA:colA+'88'};transition:width .5s ease"></div>
        <div style="width:${pctB}%;background:${winB?colB:colB+'88'};transition:width .5s ease"></div>
      </div>`:''}
    </div>`;
  };

  // 레이더 차트 SVG
  const radarChart = (stA, stB) => {
    if (!stA || !stB) return '';
    const TIERS_LOCAL = typeof TIERS!=='undefined'?TIERS:[];
    const tierScore = t => { const i=TIERS_LOCAL.indexOf(t); return i<0?0:Math.max(0,(TIERS_LOCAL.length-i)*10); };

    const normalize = (val,max) => Math.min(1, max>0?val/max:0);
    const powerScore = st => st.tiered.reduce((s,p)=>s+tierScore(p.tier||''),0) + st.total*5;
    const powA = powerScore(stA), powB = powerScore(stB);
    const axes = [
      { label:'전력',   vA: normalize(powA, Math.max(powA,powB,1)), vB: normalize(powB, Math.max(powA,powB,1)) },
      { label:'승률',  vA: stA.wr!==null?stA.wr/100:0, vB: stB.wr!==null?stB.wr/100:0 },
      { label:'경기수', vA: normalize(stA.tg, Math.max(stA.tg,stB.tg,1)), vB: normalize(stB.tg, Math.max(stA.tg,stB.tg,1)) },
      { label:'프로토스', vA: normalize(stA.races.P, Math.max(stA.races.P,stB.races.P,1)), vB: normalize(stB.races.P, Math.max(stA.races.P,stB.races.P,1)) },
      { label:'테란',   vA: normalize(stA.races.T, Math.max(stA.races.T,stB.races.T,1)), vB: normalize(stB.races.T, Math.max(stA.races.T,stB.races.T,1)) },
      { label:'저그',   vA: normalize(stA.races.Z, Math.max(stA.races.Z,stB.races.Z,1)), vB: normalize(stB.races.Z, Math.max(stA.races.Z,stB.races.Z,1)) },
    ];
    const N = axes.length;
    const cx=120,cy=120,R=90;
    const angleOf = i => (Math.PI*2/N)*i - Math.PI/2;
    const pt = (val,i) => {
      const a=angleOf(i); const r=val*R;
      return `${(cx+Math.cos(a)*r).toFixed(1)},${(cy+Math.sin(a)*r).toFixed(1)}`;
    };
    const webPts = (vFn) => axes.map((_,i)=>pt(vFn(i),i)).join(' ');

    let grid='';
    [0.25,0.5,0.75,1].forEach(s=>{
      const pts=axes.map((_,i)=>{const a=angleOf(i);return `${(cx+Math.cos(a)*R*s).toFixed(1)},${(cy+Math.sin(a)*R*s).toFixed(1)}`;}).join(' ');
      grid+=`<polygon points="${pts}" fill="none" stroke="var(--border2)" stroke-width="1"/>`;
    });
    const axisLines=axes.map((_,i)=>{const a=angleOf(i);return `<line x1="${cx}" y1="${cy}" x2="${(cx+Math.cos(a)*R).toFixed(1)}" y2="${(cy+Math.sin(a)*R).toFixed(1)}" stroke="var(--border2)" stroke-width="1"/>`;}).join('');
    const labels=axes.map((ax,i)=>{
      const a=angleOf(i);const lx=(cx+Math.cos(a)*(R+18)).toFixed(1);const ly=(cy+Math.sin(a)*(R+18)).toFixed(1);
      return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" fill="var(--text3)">${ax.label}</text>`;
    }).join('');

    return `<div style="display:flex;justify-content:center;margin:8px 0 4px">
      <svg width="240" height="240" viewBox="0 0 240 240" style="overflow:visible">
        ${grid}${axisLines}
        <polygon points="${webPts(i=>axes[i].vA)}" fill="${colA}" fill-opacity="0.18" stroke="${colA}" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="${webPts(i=>axes[i].vB)}" fill="${colB}" fill-opacity="0.18" stroke="${colB}" stroke-width="2" stroke-linejoin="round" stroke-dasharray="5 3"/>
        ${labels}
      </svg>
    </div>
    <div style="display:flex;justify-content:center;gap:16px;font-size:var(--fs-caption);font-weight:700">
      <span style="color:${colA}">━ ${escHTML(_statsCompareA)}</span>
      <span style="color:${colB}">╌ ${escHTML(_statsCompareB)}</span>
    </div>`;
  };

  let h = `<style>
    .svc-wrap { max-width:800px;margin:0 auto }
    .svc-sel { display:grid;grid-template-columns:1fr 40px 1fr;gap:12px;align-items:center;margin-bottom:16px }
    .svc-header { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px }
    .svc-col { border-radius:12px;padding:14px;text-align:center }
    .svc-h2h { padding:12px 16px;background:var(--surface);border:1px solid var(--border2);border-radius:14px;margin-bottom:12px;text-align:center }
    @media(max-width:540px){ .svc-sel{grid-template-columns:1fr} .svc-header{grid-template-columns:1fr 1fr;gap:6px} }
  </style>
  <div class="ssec">
  <h4 style="margin-bottom:10px">⚔️ 대학비교</h4>
  <div class="svc-wrap">
    <div class="svc-sel">
      <div>
        <select onchange="if(this.value===_statsCompareB){this.value=_statsCompareA;return;}; _statsCompareA=this.value;render()"
          style="width:100%;padding:8px 12px;border-radius:var(--r);border:2px solid ${colA};font-size:var(--fs-base);font-weight:700;background:var(--white);color:${colA};cursor:pointer">
          ${univOptA}
        </select>
      </div>
      <div style="text-align:center;font-size:var(--fs-lg);font-weight:900;color:var(--text3)">VS</div>
      <div>
        <select onchange="if(this.value===_statsCompareA){this.value=_statsCompareB;return;}; _statsCompareB=this.value;render()"
          style="width:100%;padding:8px 12px;border-radius:var(--r);border:2px solid ${colB};font-size:var(--fs-base);font-weight:700;background:var(--white);color:${colB};cursor:pointer">
          ${univOptB}
        </select>
      </div>
    </div>
    ${_statsCompareA === _statsCompareB ? `<div style="text-align:center;padding:10px;color:#b45309;font-size:var(--fs-sm);font-weight:700;background:#fef9c3;border-radius:var(--r);margin-bottom:8px">⚠️ 같은 대학을 선택하면 비교가 의미 없습니다. 다른 대학을 선택해 주세요.</div>` : ''}`;

  if (stA && stB) {
    h += `<div class="svc-header">
      <div class="svc-col" style="background:${colA}15;border:2px solid ${colA}44">
        <div style="font-size:22px;font-weight:900;color:${colA}">${stA.total}</div>
        <div style="font-size:var(--fs-sm);color:var(--text3)">총 인원</div>
        ${stA.wr!==null?`<div style="font-size:14px;font-weight:900;color:${stA.wr>=50?'#10b981':'#ef4444'};margin-top:4px">${stA.wr}% 승률</div>`:''}
      </div>
      <div class="svc-col" style="background:${colB}15;border:2px solid ${colB}44">
        <div style="font-size:22px;font-weight:900;color:${colB}">${stB.total}</div>
        <div style="font-size:var(--fs-sm);color:var(--text3)">총 인원</div>
        ${stB.wr!==null?`<div style="font-size:14px;font-weight:900;color:${stB.wr>=50?'#10b981':'#ef4444'};margin-top:4px">${stB.wr}% 승률</div>`:''}
      </div>
    </div>`;

    {
      const totalAg = h2h.aw + h2hB.aw;
      const aWpct = totalAg>0?Math.round(h2h.aw/totalAg*100):50;
      const aWr = totalAg>0?Math.round(h2h.aw/totalAg*100):null;
      const bWr = totalAg>0?Math.round(h2hB.aw/totalAg*100):null;
      if (totalAg > 0) {
        h += `<div class="svc-h2h">
          <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text3);margin-bottom:8px">⚔️ 직접 맞대결 전적 <span style="font-size:10px;font-weight:600;color:var(--text3)">(총 ${totalAg}전)</span></div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <div style="text-align:right;min-width:70px">
              <div style="font-size:16px;font-weight:900;color:${colA}">${h2h.aw}승 ${h2h.al}패</div>
              ${aWr!==null?`<div style="font-size:var(--fs-caption);font-weight:800;color:${aWr>=50?colA:'var(--text3)'}">${aWr}%</div>`:''}
            </div>
            <div style="flex:1;height:14px;border-radius:7px;overflow:hidden;background:var(--border2);display:flex">
              <div style="width:${aWpct}%;background:${colA};height:100%;transition:width .6s ease"></div>
              <div style="width:${100-aWpct}%;background:${colB};height:100%;transition:width .6s ease"></div>
            </div>
            <div style="text-align:left;min-width:70px">
              <div style="font-size:16px;font-weight:900;color:${colB}">${h2hB.aw}승 ${h2hB.al}패</div>
              ${bWr!==null?`<div style="font-size:var(--fs-caption);font-weight:800;color:${bWr>=50?colB:'var(--text3)'}">${bWr}%</div>`:''}
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--fs-caption)">
            <span style="color:${colA};font-weight:800">${escHTML(_statsCompareA)}</span>
            <span style="color:var(--text3)">${aWpct>50?_statsCompareA+'이 우세':aWpct<50?_statsCompareB+'이 우세':'균형'}</span>
            <span style="color:${colB};font-weight:800">${escHTML(_statsCompareB)}</span>
          </div>
        </div>`;
      } else {
        h += `<div class="svc-h2h" style="color:var(--text3);font-size:var(--fs-sm)">
          ⚔️ 직접 맞대결 기록 없음 <span style="font-size:var(--fs-caption)">(경기 데이터 누적 시 표시)</span>
        </div>`;
      }
    }

    h += `<div class="svc-col" style="background:var(--surface);border:1px solid var(--border2);border-radius:14px;margin-bottom:12px;padding:14px">
      <div style="font-size:var(--fs-sm);font-weight:800;color:var(--text3);margin-bottom:4px;text-align:center">📡 다차원 비교</div>
      ${radarChart(stA, stB)}
    </div>`;

    h += `<div style="display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;padding:8px 0;border-bottom:2px solid var(--border2);margin-bottom:4px">
      <div style="text-align:right;font-size:14px;font-weight:900;color:${colA}">${escHTML(_statsCompareA)}</div>
      <div style="width:60px;text-align:center"></div>
      <div style="text-align:left;font-size:14px;font-weight:900;color:${colB}">${escHTML(_statsCompareB)}</div>
    </div>`;
    h += compareRow('선수 수', stA.tiered.length, stB.tiered.length);
    h += compareRow('직책자', stA.roled.length, stB.roled.length);
    h += compareRow('통산 경기', stA.tg, stB.tg);
    h += compareRow('통산 승', stA.tw, stB.tw);
    h += compareRow(stA.wr!==null?`승률 (${stA.wr}%)`:'승률', stA.wr??0, stB.wr??0);
    h += `<div style="text-align:center;font-size:10px;color:var(--text3);font-weight:700;margin:6px 0 2px">🎮 종족 분포 (전체 ${stA.total}명 / ${stB.total}명 기준)</div>`;
    h += compareRow('🔮 프로토스', stA.races.P, stB.races.P);
    h += compareRow('⚔️ 테란', stA.races.T, stB.races.T);
    h += compareRow('🦎 저그', stA.races.Z, stB.races.Z);
    if (stA.races.N>0 || stB.races.N>0) h += compareRow('❔ 종족 미정', stA.races.N, stB.races.N);
    h += compareRow('최상위 티어', stA.topTier, stB.topTier);

    const allTiers=[...new Set([...Object.keys(stA.tiers),...Object.keys(stB.tiers)])];
    const sortedTiers=(typeof TIERS!=='undefined'?TIERS.filter(t=>allTiers.includes(t)):[]).concat(allTiers.filter(t=>typeof TIERS==='undefined'||!TIERS.includes(t)));
    if (sortedTiers.length) {
      h+=`<div style="margin-top:12px;font-size:var(--fs-sm);font-weight:700;color:var(--text3);text-align:center;margin-bottom:8px">티어별 비교</div>`;
      sortedTiers.forEach(t=>{
        const nA=stA.tiers[t]||0,nB=stB.tiers[t]||0;
        const col=typeof getTierBtnColor==='function'?getTierBtnColor(t):'#64748b';
        const tcol=typeof getTierBtnTextColor==='function'?(getTierBtnTextColor(t)||'#fff'):'#fff';
        const maxN=Math.max(nA,nB,1);
        h+=`<div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:6px;align-items:center;margin-bottom:6px">
          <div style="display:flex;justify-content:flex-end">
            <div style="height:10px;width:${Math.round(nA/maxN*100)}%;max-width:100%;background:${nA>nB?colA:colA+'88'};border-radius:5px 0 0 5px;min-width:${nA?'8px':'0'}"></div>
          </div>
          <div style="text-align:center;font-size:var(--fs-caption);font-weight:800;padding:2px 6px;border-radius:8px;background:${col};color:${tcol}">${escHTML(t)}</div>
          <div>
            <div style="height:10px;width:${Math.round(nB/maxN*100)}%;max-width:100%;background:${nB>nA?colB:colB+'88'};border-radius:0 5px 5px 0;min-width:${nB?'8px':'0'}"></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 52px 1fr;gap:6px;margin-bottom:4px">
          <div style="text-align:right;font-size:var(--fs-caption);color:${nA>nB?colA:'var(--text3)'};font-weight:${nA>nB?'800':'400'}">${nA?nA+'명':''}</div>
          <div></div>
          <div style="font-size:var(--fs-caption);color:${nB>nA?colB:'var(--text3)'};font-weight:${nB>nA?'800':'400'}">${nB?nB+'명':''}</div>
        </div>`;
      });
    }

    const _sortPlayers = arr => arr.slice().sort((a,b)=>{
      const ti=typeof TIERS!=='undefined'?TIERS:[];
      const ia=ti.indexOf(a.tier||''),ib=ti.indexOf(b.tier||'');
      return (ia>=0?ia:999)-(ib>=0?ib:999)||(a.name||'').localeCompare(b.name||'','ko',{sensitivity:'base'});
    });
    const _makePlayerList = (st, col) => {
      const tieredHtml = _sortPlayers(st.tiered).map(p=>_statsCvNameTag(p,col,true)).join('');
      const roledHtml = st.roled.length ? `<div style="margin-top:6px;padding-top:6px;border-top:1px dashed var(--border2)">${st.roled.map(p=>_statsCvNameTag(p,col,false)).join('')}</div>` : '';
      return tieredHtml + roledHtml;
    };
    h+=`<div style="background:var(--surface);border:1px solid var(--border2);border-radius:14px;padding:12px;margin-top:14px">
      <div style="font-size:var(--fs-caption);font-weight:800;color:var(--text3);margin-bottom:10px;text-align:center">👥 선수 명단 (클릭하여 상세 보기)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <div style="font-size:var(--fs-sm);font-weight:900;color:${colA};margin-bottom:6px;text-align:center;padding:4px 8px;background:${colA}14;border-radius:8px">${escHTML(_statsCompareA)} · ${stA.tiered.length}명</div>
          <div style="display:flex;flex-wrap:wrap;gap:2px">${_makePlayerList(stA, colA)}</div>
        </div>
        <div>
          <div style="font-size:var(--fs-sm);font-weight:900;color:${colB};margin-bottom:6px;text-align:center;padding:4px 8px;background:${colB}14;border-radius:8px">${escHTML(_statsCompareB)} · ${stB.tiered.length}명</div>
          <div style="display:flex;flex-wrap:wrap;gap:2px">${_makePlayerList(stB, colB)}</div>
        </div>
      </div>
    </div>`;
  }

  h += `</div></div>`;
  return h;
}

/* ══════════════════════════════════════
   7. 미스매치 감지
══════════════════════════════════════ */
