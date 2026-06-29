/* vote.js */
var k=Object.defineProperty,z=Object.defineProperties;var L=Object.getOwnPropertyDescriptors;var C=Object.getOwnPropertySymbols;var V=Object.prototype.hasOwnProperty,T=Object.prototype.propertyIsEnumerable;var M=(e,n,o)=>n in e?k(e,n,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[n]=o,w=(e,n)=>{for(var o in n||(n={}))V.call(n,o)&&M(e,o,n[o]);if(C)for(var o of C(n))T.call(n,o)&&M(e,o,n[o]);return e},_=(e,n)=>z(e,L(n));function saveVotes(){localStorage.setItem("su_votes",JSON.stringify(voteData)),typeof save=="function"&&save()}function rVote(e,n){n.textContent="\u{1F3AF} \uC2B9\uBD80\uC608\uCE21";const o=t=>t.sa==null||t.sa==="",i=t=>t.sa!=null&&t.sa!=="",u=[...miniM.map(t=>_(w({},t),{_mode:"\u26A1 \uBBF8\uB2C8\uB300\uC804"})),...univM.map(t=>_(w({},t),{_mode:"\u{1F3DF}\uFE0F \uB300\uD559\uB300\uC804"})),...ckM.map(t=>_(w({},t),{_mode:"\u{1F91D} \uB300\uD559CK"})),...proM.map(t=>_(w({},t),{_mode:"\u{1F3C5} \uD504\uB85C\uB9AC\uADF8"})),...(typeof ttM!="undefined"?ttM:[]).map(t=>_(w({},t),{_mode:"\u{1F3AF} \uD2F0\uC5B4\uB300\uD68C"}))],x=u.filter(o),m=u.filter(i);function y(t){return t._id||`${t.wName||t.a}_${t.lName||t.b}_${t.d}`}function D(t,a){const c=voteData[t]||{a:0,b:0},l=c.a+c.b,g=voteData[t+"_my"],d=l===0?50:Math.round(c.a/l*100),p=100-d,s=u.find(h=>y(h)===t)||{},f=gc(s.a||""),B=gc(s.b||"");return`
      <div style="margin-top:10px">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-l);margin-bottom:4px">
          <span>\u{1F5F3}\uFE0F \uCD1D ${l}\uD45C</span>
          ${g?`<span style="color:var(--blue);font-weight:700">\u2705 \uB0B4 \uC608\uCE21: ${g==="a"?s.a||"A":s.b||"B"}</span>`:""}
        </div>
        <div style="display:flex;height:22px;border-radius:20px;overflow:hidden;background:#f1f5f9">
          <div style="width:${d}%;background:${f||"var(--blue)"};display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;transition:.4s">${d}%</div>
          <div style="width:${p}%;background:${B||"var(--red)"};display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;transition:.4s">${p}%</div>
        </div>
      </div>`}e.innerHTML=`
  <div style="display:flex;flex-direction:column;gap:16px">

    <!-- \uC608\uCE21 \uAC00\uB2A5\uD55C \uACBD\uAE30 -->
    <div class="ssec">
      <h4>\u{1F3AF} \uC2B9\uBD80\uC608\uCE21</h4>
      ${x.length===0?'<p style="color:var(--gray-l);font-size:13px">\uC608\uCE21 \uAC00\uB2A5\uD55C \uACBD\uAE30\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.<br><span style="font-size:11px">\uBBF8\uB2C8\uB300\uC804\uC5D0\uC11C \uACB0\uACFC \uBBF8\uC785\uB825 \uACBD\uAE30\uAC00 \uC5EC\uAE30\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.</span></p>':x.map(t=>{const a=y(t),c=voteData[a]||{a:0,b:0},l=voteData[a+"_my"],g=ckM.includes(t)||proM.includes(t)||typeof ttM!="undefined"&&ttM.includes(t),d=g?t.teamALabel||"A\uD300":t.a||"\uD300A",p=g?t.teamBLabel||"B\uD300":t.b||"\uD300B",s=g?"#2563eb":gc(t.a||""),f=g?"#dc2626":gc(t.b||"");return`<div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
                <span style="font-size:10px;background:#e0e7ff;color:#3730a3;padding:1px 7px;border-radius:20px;font-weight:700">${t._mode||"\u26A1 \uBBF8\uB2C8\uB300\uC804"}</span>
                <span style="font-size:11px;color:var(--gray-l)">\u{1F4C5} ${t.d||"\uB0A0\uC9DC \uBBF8\uC815"}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
                <div style="flex:1;text-align:center;padding:10px;background:${s}22;border-radius:8px;border:2px solid ${l==="a"?s:"transparent"}">
                  <div style="font-weight:800;color:${s}">${d}</div>
                </div>
                <div style="font-weight:900;color:var(--gray-l);font-size:18px">VS</div>
                <div style="flex:1;text-align:center;padding:10px;background:${f}22;border-radius:8px;border:2px solid ${l==="b"?f:"transparent"}">
                  <div style="font-weight:800;color:${f}">${p}</div>
                </div>
              </div>
              ${D(a)}
              ${l?`<button class="btn btn-w btn-sm" style="width:100%;margin-top:10px" onclick="cancelVote('${a}')">\u{1F504} \uC608\uCE21 \uCDE8\uC18C</button>`:`<div style="display:flex;gap:8px;margin-top:10px">
                    <button class="btn btn-sm" style="flex:1;background:${s};color:#fff;border-color:${s}" onclick="doVote('${a}','a')">${d} \uC2B9\uB9AC</button>
                    <button class="btn btn-sm" style="flex:1;background:${f};color:#fff;border-color:${f}" onclick="doVote('${a}','b')">${p} \uC2B9\uB9AC</button>
                  </div>`}
            </div>`}).join("")}
    </div>

    <!-- \uC608\uCE21 \uACB0\uACFC \uD655\uC778 -->
    <div class="ssec">
      <h4>\u{1F3C6} \uC608\uCE21 \uACB0\uACFC</h4>
      ${m.length===0?'<p style="color:var(--gray-l);font-size:13px">\uACB0\uACFC\uAC00 \uB098\uC628 \uACBD\uAE30\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</p>':m.map(t=>{const a=y(t),c=voteData[a]||{a:0,b:0},l=voteData[a+"_my"],g=t.sa>t.sb?"a":"b",d=l&&l===g,p=!!l,s=ckM.includes(t)||proM.includes(t)||typeof ttM!="undefined"&&ttM.includes(t),f=s?t.teamALabel||"A\uD300":t.a||"\uD300A",B=s?t.teamBLabel||"B\uD300":t.b||"\uD300B",h=s?"#2563eb":gc(t.a||""),r=s?"#dc2626":gc(t.b||""),b=c.a+c.b,v=b===0?50:Math.round(c.a/b*100);return`<div style="background:var(--white);border:1px solid ${p?d?"var(--green)":"var(--red)":"var(--border)"};border-radius:12px;padding:14px;margin-bottom:8px;opacity:${p?1:.7}">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                <span style="font-size:11px;color:var(--gray-l)">\u{1F4C5} ${t.d||""}</span>
                ${p?`<span style="font-size:12px;font-weight:700;color:${d?"var(--green)":"var(--red)"}">${d?"\u2705 \uC608\uCE21 \uC131\uACF5!":"\u274C \uC608\uCE21 \uC2E4\uD328"}</span>`:'<span style="font-size:11px;color:var(--gray-l)">\uC608\uCE21 \uC548\uD568</span>'}
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="flex:1;text-align:center;font-weight:${t.sa>t.sb?"900":"400"};color:${t.sa>t.sb?h:"var(--gray-l)"}">
                  ${t.sa>t.sb?"\u{1F3C6} ":""} ${f}
                </div>
                <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:20px">${t.sa} : ${t.sb}</div>
                <div style="flex:1;text-align:center;font-weight:${t.sb>t.sa?"900":"400"};color:${t.sb>t.sa?r:"var(--gray-l)"}">
                  ${t.sb>t.sa?"\u{1F3C6} ":""} ${B}
                </div>
              </div>
              <div style="margin-top:8px">
                <div style="display:flex;height:18px;border-radius:20px;overflow:hidden;background:#f1f5f9">
                  <div style="width:${v}%;background:${h};transition:.4s"></div>
                  <div style="width:${100-v}%;background:${r};transition:.4s"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:3px">
                  <span>${v}% (${c.a}\uD45C)</span><span>${100-v}% (${c.b}\uD45C)</span>
                </div>
              </div>
            </div>`}).join("")}
    </div>

  </div>`}function doVote(e,n){if(voteData[e+"_my"]){alert("\uC774\uBBF8 \uC608\uCE21\uD588\uC2B5\uB2C8\uB2E4!");return}voteData[e]||(voteData[e]={a:0,b:0}),voteData[e][n]++,voteData[e+"_my"]=n,saveVotes(),render()}function cancelVote(e){const n=voteData[e+"_my"];n&&confirm("\uC608\uCE21\uC744 \uCDE8\uC18C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?")&&(voteData[e]&&(voteData[e][n]=Math.max(0,voteData[e][n]-1),(voteData[e].a||0)===0&&(voteData[e].b||0)===0&&delete voteData[e]),delete voteData[e+"_my"],saveVotes(),render())}function sf(e,n){fUniv=e,fTier=n,render()}function fsearch(e){const n=e==="w"?"ws":"ls",o=e==="w"?"wl":"ll",i=document.getElementById(n),u=document.getElementById(o);if(!i||!u)return;const x=i.value.toLowerCase(),m=players.filter(y=>y.name.toLowerCase().includes(x));x&&m.length?(u.innerHTML=m.map(y=>`<div class="sitem" onclick="selP('${e}','${y.name}')">${y.name} <span style="color:var(--gray-l);font-size:11px">(${y.univ})</span></div>`).join(""),u.style.display="block"):u.style.display="none"}function selP(e,n){const o=document.getElementById(e==="w"?"ws":"ls"),i=document.getElementById(e==="w"?"wl":"ll");o&&(o.value=n),i&&(i.style.display="none")}function upTour(e,n){tourD[e]=n,save(),render()}window.addEventListener("click",e=>{e.target.classList.contains("modal")&&!e.target.dataset.noClose&&(e.target.style.display="none"),e.target.closest(".swrap")||document.querySelectorAll(".sdrop").forEach(n=>n.style.display="none")}),document.addEventListener("keydown",function(e){if(e.key!=="Escape")return;const n=[...document.querySelectorAll(".modal")].filter(i=>i.style.display&&i.style.display!=="none");if(!n.length)return;const o=n[n.length-1];o.dataset.noClose||(o.style.display="none")});async function doJpg(){const e=document.getElementById("actionBar"),n=document.getElementById("bottomNav"),o=document.getElementById("fstrip"),i=document.getElementById("mobileActionBar"),u=e?e.style.display:"",x=n?n.style.display:"",m=o?o.style.display:"",y=i?i.style.display:"",D=[...document.querySelectorAll(".no-export")].map(a=>({e:a,d:a.style.display}));function t(){D.forEach(({e:a,d:c})=>a.style.display=c),e&&(e.style.display=u),n&&(n.style.display=x),o&&(o.style.display=m),i&&(i.style.display=y)}try{document.querySelectorAll(".no-export").forEach(r=>r.style.display="none"),e&&(e.style.display="none"),n&&(n.style.display="none"),o&&(o.style.display="none"),i&&(i.style.display="none");const a=document.getElementById("cap"),c=a.getAttribute("style")||"";a.style.maxWidth="900px",a.style.margin="0 auto",a.style.padding="24px";const l=[...a.querySelectorAll("img[src]")],g=l.map(r=>r.getAttribute("src"));await Promise.allSettled(l.map(r=>new Promise(b=>{const v=r.getAttribute("src");if(!v||v.startsWith("data:")||v.startsWith("blob:")){b();return}const $=document.createElement("canvas"),E=r.naturalWidth||r.width||64,S=r.naturalHeight||r.height||64;$.width=E||64,$.height=S||64;const I=$.getContext("2d"),A=new Image;A.crossOrigin="anonymous",A.onload=()=>{try{I.drawImage(A,0,0,$.width,$.height),r.src=$.toDataURL("image/png")}catch(j){}b()},A.onerror=()=>b(),A.src=v+(v.includes("?")?"&":"?")+"_nc="+Date.now()})));const d=await html2canvas(a,{backgroundColor:"#fff",useCORS:!0,allowTaint:!0,scale:2,logging:!1,imageTimeout:1e4});l.forEach((r,b)=>{try{r.setAttribute("src",g[b])}catch(v){}}),a.setAttribute("style",c),t();const p=40,s=document.createElement("canvas");s.width=d.width+p*2,s.height=d.height+p*2;const f=s.getContext("2d");f.fillStyle="#f1f5f9",f.fillRect(0,0,s.width,s.height),f.drawImage(d,p,p);const h=`\uC2A4\uD0C0\uB300\uD559_${{total:"\uC2A4\uD2B8\uB9AC\uBA38",tier:"\uD2F0\uC5B4\uC21C\uC704",mini:"\uBBF8\uB2C8\uB300\uC804",univm:"\uB300\uD559\uB300\uC804",univck:"\uB300\uD559CK",comp:"\uB300\uD68C",pro:"\uD504\uB85C\uB9AC\uADF8",hist:"\uB300\uC804\uAE30\uB85D",stats:"\uD1B5\uACC4",cal:"\uCE98\uB9B0\uB354"}[curTab]||curTab}_${new Date().toISOString().slice(0,10)}.png`;await _saveCanvasImage(s,h,"png")}catch(a){t(),alert("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC624\uB958: "+a.message)}}
