/* elboard.js */
function rElboard(b,M){if(M.innerText="\u{1F9FE} \uCD5C\uADFC\uC804\uC801",!isLoggedIn){b.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center;gap:16px">
      <div style="font-size:48px">\u{1F512}</div>
      <div style="font-size:18px;font-weight:800;color:var(--text)">\uAD00\uB9AC\uC790 \uC804\uC6A9 \uD398\uC774\uC9C0</div>
      <div style="font-size:13px;color:var(--gray-l)">\uCD5C\uADFC\uC804\uC801 \uD0ED\uC740 \uAD00\uB9AC\uC790 \uB85C\uADF8\uC778 \uD6C4 \uC774\uC6A9\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.</div>
      <button class="btn btn-b" onclick="om('loginModal')">\u{1F511} \uB85C\uADF8\uC778</button>
    </div>`;return}window._elSrc||(window._elSrc="all"),window._elLimit||(window._elLimit=30);const _=[{id:"all",lbl:"\uC804\uCCB4"},{id:"mini",lbl:"\u26A1 \uBBF8\uB2C8\uB300\uC804"},{id:"univm",lbl:"\u{1F3DF}\uFE0F \uB300\uD559\uB300\uC804"},{id:"ck",lbl:"\u{1F91D} \uB300\uD559CK"},{id:"pro",lbl:"\u{1F3C5} \uD504\uB85C\uB9AC\uADF8"},{id:"tt",lbl:"\u{1F3AF} \uD2F0\uC5B4\uB300\uD68C"}],p=e=>{if(!e)return"#6b7280";const a=(typeof univCfg!="undefined"?univCfg:[]).find(t=>t.name===e);return(a==null?void 0:a.color)||"#6b7280"};let n=[];(typeof miniM!="undefined"?miniM:[]).forEach((e,a)=>{!e.a||!e.b||e.sa==null||e.sb==null||n.push({src:"mini",srcLabel:"\u26A1 \uBBF8\uB2C8\uB300\uC804",m:e,i:a,aLabel:e.a,bLabel:e.b,aColor:p(e.a),bColor:p(e.b)})}),(typeof univM!="undefined"?univM:[]).forEach((e,a)=>{!e.a||!e.b||e.sa==null||e.sb==null||n.push({src:"univm",srcLabel:"\u{1F3DF}\uFE0F \uB300\uD559\uB300\uC804",m:e,i:a,aLabel:e.a,bLabel:e.b,aColor:p(e.a),bColor:p(e.b)})}),(typeof ckM!="undefined"?ckM:[]).forEach((e,a)=>{!e.teamAMembers||!e.teamBMembers||e.sa==null||e.sb==null||n.push({src:"ck",srcLabel:"\u{1F91D} \uB300\uD559CK",m:e,i:a,aLabel:e.teamALabel||"A\uD300",bLabel:e.teamBLabel||"B\uD300",aColor:"#2563eb",bColor:"#dc2626"})}),(typeof proM!="undefined"?proM:[]).forEach((e,a)=>{!e.teamAMembers||!e.teamBMembers||e.sa==null||e.sb==null||n.push({src:"pro",srcLabel:"\u{1F3C5} \uD504\uB85C\uB9AC\uADF8",m:e,i:a,aLabel:e.teamALabel||"A\uD300",bLabel:e.teamBLabel||"B\uD300",aColor:"#7c3aed",bColor:"#dc2626"})}),(typeof ttM!="undefined"?ttM:[]).forEach((e,a)=>{const t=e.teamALabel||(e.teamAMembers?"A\uD300":e.a||"A"),w=e.teamBLabel||(e.teamBMembers?"B\uD300":e.b||"B");e.sa==null||e.sb==null||n.push({src:"tt",srcLabel:"\u{1F3AF} \uD2F0\uC5B4\uB300\uD68C",m:e,i:a,aLabel:t,bLabel:w,aColor:"#d97706",bColor:"#0891b2"})}),n.sort((e,a)=>(a.m.d||"").localeCompare(e.m.d||""));const c=window._elSrc==="all"?n:n.filter(e=>e.src===window._elSrc),y=c.slice(0,window._elLimit);let l=`<div class="fbar no-export" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;gap:4px;margin-bottom:12px">
    ${_.map(e=>`<button class="pill ${window._elSrc===e.id?"on":""}" style="flex-shrink:0;white-space:nowrap"
      onclick="window._elSrc='${e.id}';window._elLimit=30;render()">${e.lbl}</button>`).join("")}
  </div>`;if(!y.length){l+=`<div class="empty-state"><div class="empty-state-icon">\u{1F4ED}</div>
      <div class="empty-state-title">\uCD5C\uADFC \uACBD\uAE30 \uC5C6\uC74C</div>
      <div class="empty-state-desc">\uACBD\uAE30 \uB370\uC774\uD130\uAC00 \uCD94\uAC00\uB418\uBA74 \uC5EC\uAE30\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4</div></div>`,b.innerHTML=l;return}l+='<div id="elboard-list">';let f=null;if(y.forEach(({src:e,srcLabel:a,m:t,i:w,aLabel:h,bLabel:m,aColor:C,bColor:k})=>{const u=t.d||"\uB0A0\uC9DC\uBBF8\uC815";u!==f&&(f!==null&&(l+='<div style="height:4px"></div>'),l+=`<div style="padding:6px 0 4px;font-size:12px;font-weight:800;color:var(--text3);letter-spacing:.03em">${u}</div>`,f=u);const x=Number(t.sa),v=Number(t.sb),s=x>v,d=v>x,$=e==="ck"||e==="pro"||e==="tt";let g="";if($&&t.teamAMembers&&t.teamBMembers){const o=(t.teamAMembers||[]).slice(0,4).map(i=>i.name).join(", "),r=(t.teamBMembers||[]).slice(0,4).map(i=>i.name).join(", ");g=`<div style="font-size:11px;color:var(--gray-l);margin-top:4px;display:flex;gap:8px;flex-wrap:wrap">
        <span><b style="color:#2563eb">A</b> ${o}${(t.teamAMembers||[]).length>4?"\u2026":""}</span>
        <span><b style="color:#dc2626">B</b> ${r}${(t.teamBMembers||[]).length>4?"\u2026":""}</span>
      </div>`}else if(!$&&t.sets&&t.sets.length){const o=t.sets.reduce((r,i)=>r+(i.games?i.games.length:i.playerA?1:0),0);o&&(g=`<div style="font-size:11px;color:var(--gray-l);margin-top:3px">${o}\uAC8C\uC784</div>`)}const A=t.n?`<span style="font-size:10px;padding:2px 7px;border-radius:10px;background:var(--surface);border:1px solid var(--border);color:var(--text3)">${t.n}</span>`:t._label?`<span style="font-size:10px;padding:2px 7px;border-radius:10px;background:var(--surface);border:1px solid var(--border);color:var(--text3)">${t._label}</span>`:"",L={mini:"#7c3aed",univm:"#16a34a",ck:"#f59e0b",pro:"#0ea5e9",tt:"#10b981",all:"#2563eb"}[e]||"#64748b";l+=`<div class="rec-summary rec-mode-${e}" data-rec-mode="${e}" style="--rec-mode-col:${L};--rec-mode-rgb:${(o=>{const r=String(o||"").replace("#","");if(r.length!==6)return"100,116,139";const i=parseInt(r.slice(0,2),16),z=parseInt(r.slice(2,4),16),B=parseInt(r.slice(4,6),16);return`${i},${z},${B}`})(L)};margin-bottom:6px">
      <div class="rec-sum-header" style="flex-wrap:wrap;gap:8px">
        <span style="font-size:10px;padding:2px 8px;border-radius:10px;background:var(--surface);border:1px solid var(--border);color:var(--text3);white-space:nowrap">${a}</span>
        ${A}
        <div class="rec-sum-vs" style="flex:1;min-width:200px">
          <span style="font-size:13px;font-weight:900;padding:3px 10px;border-radius:8px;color:#fff;background:${C};opacity:${s?1:.65}">${h}</span>
          <div style="display:flex;align-items:center;gap:4px;font-size:18px;font-weight:900">
            <span style="color:${s?"#16a34a":d?"#dc2626":"var(--text3)"}">${x}</span>
            <span style="color:var(--gray-l);font-size:13px">:</span>
            <span style="color:${d?"#16a34a":s?"#dc2626":"var(--text3)"}">${v}</span>
          </div>
          <span style="font-size:13px;font-weight:900;padding:3px 10px;border-radius:8px;color:#fff;background:${k};opacity:${d?1:.65}">${m}</span>
          <span style="font-size:11px;font-weight:700;color:${s||d?"#16a34a":"#6b7280"}">
            ${s?"\u25B6 "+h+" \uC2B9":d?"\u25B6 "+m+" \uC2B9":"\u{1F91D} \uBB34\uC2B9\uBD80"}
          </span>
        </div>
      </div>
      ${g}
    </div>`}),l+="</div>",c.length>window._elLimit){const e=c.length-window._elLimit;l+=`<div style="text-align:center;padding:12px">
      <button class="btn btn-w" onclick="window._elLimit+=${Math.min(e,30)};render()">
        \u25BC ${e}\uAC74 \uB354 \uBCF4\uAE30
      </button>
    </div>`}l+=`<div style="text-align:center;padding-top:4px;font-size:11px;color:var(--gray-l)">
    \uCD1D ${c.length}\uAC74 \xB7 \uC804\uCCB4 ${n.length}\uAC74
  </div>`,b.innerHTML=l}
