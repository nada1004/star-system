/* elboard.js */
function rElboard(C,T){if(T.innerText="\u{1F9FE} \uCD5C\uADFC\uC804\uC801",!isLoggedIn){C.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;gap:16px">
      <div style="font-size:48px">\u{1F512}</div>
      <div style="font-size:var(--fs-lg);font-weight:800;color:var(--text)">\uAD00\uB9AC\uC790 \uC804\uC6A9 \uD398\uC774\uC9C0</div>
      <div style="font-size:var(--fs-base);color:var(--gray-l)">\uCD5C\uADFC\uC804\uC801 \uD0ED\uC740 \uAD00\uB9AC\uC790 \uB85C\uADF8\uC778 \uD6C4 \uC774\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</div>
      <button class="btn btn-b" onclick="om('loginModal')">\u{1F511} \uB85C\uADF8\uC778</button>
    </div>`;return}window._elSrc||(window._elSrc="all"),window._elLimit||(window._elLimit=30);const srcOpts=[{id:"all",lbl:"\uC804\uCCB4"},{id:"mini",lbl:"\u26A1 \uBBF8\uB2C8\uB300\uC804"},{id:"univm",lbl:"\u{1F3DF}\uFE0F \uB300\uD559\uB300\uC804"},{id:"ck",lbl:"\u{1F91D} \uB300\uD559CK"},{id:"pro",lbl:"\u{1F3C5} \uD504\uB85C\uB9AC\uADF8"},{id:"tt",lbl:"\u{1F3AF} \uD2F0\uC5B4\uB300\uD68C"}],gc2=univ=>{if(!univ)return"#6b7280";const cfg=(typeof univCfg!="undefined"?univCfg:[]).find(u=>u.name===univ);return(cfg==null?void 0:cfg.color)||"#6b7280"};let all=[];(typeof miniM!="undefined"?miniM:[]).forEach((m,i)=>{!m.a||!m.b||m.sa==null||m.sb==null||all.push({src:"mini",srcLabel:"\u26A1 \uBBF8\uB2C8\uB300\uC804",m,i,aLabel:m.a,bLabel:m.b,aColor:gc2(m.a),bColor:gc2(m.b)})}),(typeof univM!="undefined"?univM:[]).forEach((m,i)=>{!m.a||!m.b||m.sa==null||m.sb==null||all.push({src:"univm",srcLabel:"\u{1F3DF}\uFE0F \uB300\uD559\uB300\uC804",m,i,aLabel:m.a,bLabel:m.b,aColor:gc2(m.a),bColor:gc2(m.b)})}),(typeof ckM!="undefined"?ckM:[]).forEach((m,i)=>{!m.teamAMembers||!m.teamBMembers||m.sa==null||m.sb==null||all.push({src:"ck",srcLabel:"\u{1F91D} \uB300\uD559CK",m,i,aLabel:m.teamALabel||"A\uD300",bLabel:m.teamBLabel||"B\uD300",aColor:"#2563eb",bColor:"#dc2626"})}),(typeof proM!="undefined"?proM:[]).forEach((m,i)=>{!m.teamAMembers||!m.teamBMembers||m.sa==null||m.sb==null||all.push({src:"pro",srcLabel:"\u{1F3C5} \uD504\uB85C\uB9AC\uADF8",m,i,aLabel:m.teamALabel||"A\uD300",bLabel:m.teamBLabel||"B\uD300",aColor:"#7c3aed",bColor:"#dc2626"})}),(typeof ttM!="undefined"?ttM:[]).forEach((m,i)=>{const la=m.teamALabel||(m.teamAMembers?"A\uD300":m.a||"A"),lb=m.teamBLabel||(m.teamBMembers?"B\uD300":m.b||"B");m.sa==null||m.sb==null||all.push({src:"tt",srcLabel:"\u{1F3AF} \uD2F0\uC5B4\uB300\uD68C",m,i,aLabel:la,bLabel:lb,aColor:"#d97706",bColor:"#0891b2"})}),all.sort((a,b)=>(b.m.d||"").localeCompare(a.m.d||""));const filtered=window._elSrc==="all"?all:all.filter(x=>x.src===window._elSrc),shown=filtered.slice(0,window._elLimit);let h=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:12px">
    ${srcOpts.map(o=>`<button class="pill ${window._elSrc===o.id?"on":""}" style="flex-shrink:0;white-space:nowrap"
      onclick="window._elSrc='${o.id}';window._elLimit=30;render()">${o.lbl}</button>`).join("")}
  </div>`;if(!shown.length){h+=`<div class="empty-state"><div class="empty-state-icon">\u{1F4ED}</div>
      <div class="empty-state-title">\uCD5C\uADFC \uACBD\uAE30 \uC5C6\uC74C</div>
      <div class="empty-state-desc">\uACBD\uAE30 \uB370\uC774\uD130\uAC00 \uCD94\uAC00\uB418\uBA74 \uC5EC\uAE30\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4</div></div>`,C.innerHTML=h;return}h+='<div id="elboard-list">';let lastDate=null;if(shown.forEach(({src,srcLabel,m,i,aLabel,bLabel,aColor,bColor})=>{const date=m.d||"\uB0A0\uC9DC\uBBF8\uC815";date!==lastDate&&(lastDate!==null&&(h+='<div style="height:4px"></div>'),h+=`<div style="padding:6px 0 4px;font-size:var(--fs-sm);font-weight:800;color:var(--text3);letter-spacing:.03em">${date}</div>`,lastDate=date);const sa=Number(m.sa),sb=Number(m.sb),aWin=sa>sb,bWin=sb>sa,isCK=src==="ck"||src==="pro"||src==="tt";let membersHtml="";if(isCK&&m.teamAMembers&&m.teamBMembers){const mA=(m.teamAMembers||[]).slice(0,4).map(p=>p.name).join(", "),mB=(m.teamBMembers||[]).slice(0,4).map(p=>p.name).join(", ");membersHtml=`<div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:4px;display:flex;gap:8px;flex-wrap:wrap">
        <span><b style="color:#2563eb">A</b> ${mA}${(m.teamAMembers||[]).length>4?"\u2026":""}</span>
        <span><b style="color:#dc2626">B</b> ${mB}${(m.teamBMembers||[]).length>4?"\u2026":""}</span>
      </div>`}else if(!isCK&&m.sets&&m.sets.length){const gameCount=m.sets.reduce((s,st)=>s+(st.games?st.games.length:st.playerA?1:0),0);gameCount&&(membersHtml=`<div style="font-size:var(--fs-caption);color:var(--gray-l);margin-top:3px">${gameCount}\uAC8C\uC784</div>`)}const subLabel=m.n?`<span style="font-size:10px;padding:2px 7px;border-radius:var(--r);background:var(--surface);border:1px solid var(--border);color:var(--text3)">${m.n}</span>`:m._label?`<span style="font-size:10px;padding:2px 7px;border-radius:var(--r);background:var(--surface);border:1px solid var(--border);color:var(--text3)">${m._label}</span>`:"",_mc={mini:"#7c3aed",univm:"#16a34a",ck:"#f59e0b",pro:"#0ea5e9",tt:"#10b981",all:"#2563eb"}[src]||"#64748b";h+=`<div class="rec-summary rec-mode-${src}" data-rec-mode="${src}" style="--rec-mode-col:${_mc};--rec-mode-rgb:${(hex=>{const h2=String(hex||"").replace("#","");if(h2.length!==6)return"100,116,139";const r=parseInt(h2.slice(0,2),16),g=parseInt(h2.slice(2,4),16),b=parseInt(h2.slice(4,6),16);return`${r},${g},${b}`})(_mc)};margin-bottom:6px">
      <div class="rec-sum-header" style="flex-wrap:wrap;gap:8px">
        <span style="font-size:10px;padding:2px 8px;border-radius:var(--r);background:var(--surface);border:1px solid var(--border);color:var(--text3);white-space:nowrap">${srcLabel}</span>
        ${subLabel}
        <div class="rec-sum-vs" style="flex:1;min-width:200px">
          <span style="font-size:var(--fs-base);font-weight:900;padding:3px 10px;border-radius:8px;color:#fff;background:${aColor};opacity:${aWin?1:.65}">${aLabel}</span>
          <div style="display:flex;align-items:center;gap:4px;font-size:var(--fs-lg);font-weight:900">
            <span style="color:${aWin?"var(--win-col)":bWin?"var(--lose-col)":"var(--text3)"}">${sa}</span>
            <span style="color:var(--gray-l);font-size:var(--fs-base)">:</span>
            <span style="color:${bWin?"var(--win-col)":aWin?"var(--lose-col)":"var(--text3)"}">${sb}</span>
          </div>
          <span style="font-size:var(--fs-base);font-weight:900;padding:3px 10px;border-radius:8px;color:#fff;background:${bColor};opacity:${bWin?1:.65}">${bLabel}</span>
          <span style="font-size:var(--fs-caption);font-weight:700;color:${aWin||bWin?"var(--win-col)":"#6b7280"}">
            ${aWin?"\u25B6 "+aLabel+" \uC2B9":bWin?"\u25B6 "+bLabel+" \uC2B9":"\u{1F91D} \uBB34\uC2B9\uBD80"}
          </span>
        </div>
      </div>
      ${membersHtml}
    </div>`}),h+="</div>",filtered.length>window._elLimit){const remain=filtered.length-window._elLimit;h+=`<div style="text-align:center;padding:12px">
      <button class="btn btn-w" onclick="window._elLimit+=${Math.min(remain,30)};render()">
        \u25BC ${remain}\uAC74 \uB354 \uBCF4\uAE30
      </button>
    </div>`}h+=`<div style="text-align:center;padding-top:4px;font-size:var(--fs-caption);color:var(--gray-l)">
    \uCD1D ${filtered.length}\uAC74 \xB7 \uC804\uCCB4 ${all.length}\uAC74
  </div>`,C.innerHTML=h}
