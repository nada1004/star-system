/* vote.js */
var __defProp=Object.defineProperty,__defProps=Object.defineProperties;var __getOwnPropDescs=Object.getOwnPropertyDescriptors;var __getOwnPropSymbols=Object.getOwnPropertySymbols;var __hasOwnProp=Object.prototype.hasOwnProperty,__propIsEnum=Object.prototype.propertyIsEnumerable;var __defNormalProp=(obj,key,value)=>key in obj?__defProp(obj,key,{enumerable:!0,configurable:!0,writable:!0,value}):obj[key]=value,__spreadValues=(a,b)=>{for(var prop in b||(b={}))__hasOwnProp.call(b,prop)&&__defNormalProp(a,prop,b[prop]);if(__getOwnPropSymbols)for(var prop of __getOwnPropSymbols(b))__propIsEnum.call(b,prop)&&__defNormalProp(a,prop,b[prop]);return a},__spreadProps=(a,b)=>__defProps(a,__getOwnPropDescs(b));function saveVotes(){localStorage.setItem("su_votes",JSON.stringify(voteData)),typeof save=="function"&&save()}function rVote(C,T){T.textContent="\u{1F3AF} \uC2B9\uBD80\uC608\uCE21";const _isUnresolved=m=>m.sa==null||m.sa==="",_isResolved=m=>m.sa!=null&&m.sa!=="",_allTeamM=[...miniM.map(m=>__spreadProps(__spreadValues({},m),{_mode:"\u26A1 \uBBF8\uB2C8\uB300\uC804"})),...univM.map(m=>__spreadProps(__spreadValues({},m),{_mode:"\u{1F3DF}\uFE0F \uB300\uD559\uB300\uC804"})),...ckM.map(m=>__spreadProps(__spreadValues({},m),{_mode:"\u{1F91D} \uB300\uD559CK"})),...proM.map(m=>__spreadProps(__spreadValues({},m),{_mode:"\u{1F3C5} \uD504\uB85C\uB9AC\uADF8"})),...(typeof ttM!="undefined"?ttM:[]).map(m=>__spreadProps(__spreadValues({},m),{_mode:"\u{1F3AF} \uD2F0\uC5B4\uB300\uD68C"}))],upcoming=_allTeamM.filter(_isUnresolved),finished=_allTeamM.filter(_isResolved);function getVoteKey(m){return m._id||`${m.wName||m.a}_${m.lName||m.b}_${m.d}`}function voteBar(key,side){const v=voteData[key]||{a:0,b:0},total=v.a+v.b,myVote=voteData[key+"_my"],pctA=total===0?50:Math.round(v.a/total*100),pctB=100-pctA,_vm=_allTeamM.find(m=>getVoteKey(m)===key)||{},aCol=gc(_vm.a||""),bCol=gc(_vm.b||"");return`
      <div style="margin-top:10px">
        <div style="display:flex;justify-content:space-between;font-size:var(--fs-caption);color:var(--gray-l);margin-bottom:4px">
          <span>\u{1F5F3}\uFE0F \uCD1D ${total}\uD45C</span>
          ${myVote?`<span style="color:var(--blue);font-weight:700">\u2705 \uB0B4 \uC608\uCE21: ${myVote==="a"?_vm.a||"A":_vm.b||"B"}</span>`:""}
        </div>
        <div style="display:flex;height:22px;border-radius:20px;overflow:hidden;background:#f1f5f9">
          <div style="width:${pctA}%;background:${aCol||"var(--blue)"};display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;transition:.4s">${pctA}%</div>
          <div style="width:${pctB}%;background:${bCol||"var(--red)"};display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;transition:.4s">${pctB}%</div>
        </div>
      </div>`}C.innerHTML=`
  <div style="display:flex;flex-direction:column;gap:16px">

    <!-- \uC608\uCE21 \uAC00\uB2A5\uD55C \uACBD\uAE30 -->
    <div class="ssec">
      <h4>\u{1F3AF} \uC2B9\uBD80\uC608\uCE21</h4>
      ${upcoming.length===0?'<p style="color:var(--gray-l);font-size:var(--fs-base)">\uC608\uCE21 \uAC00\uB2A5\uD55C \uACBD\uAE30\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.<br><span style="font-size:var(--fs-caption)">\uBBF8\uB2C8\uB300\uC804\uC5D0\uC11C \uACB0\uACFC \uBBF8\uC785\uB825 \uACBD\uAE30\uAC00 \uC5EC\uAE30\uC5D0 \uD45C\uC2DC\uB429\uB2C8\uB2E4.</span></p>':upcoming.map(m=>{const key=getVoteKey(m),v=voteData[key]||{a:0,b:0},myVote=voteData[key+"_my"],isCKorPro=ckM.includes(m)||proM.includes(m)||typeof ttM!="undefined"&&ttM.includes(m),tA=isCKorPro?m.teamALabel||"A\uD300":m.a||"\uD300A",tB=isCKorPro?m.teamBLabel||"B\uD300":m.b||"\uD300B",aCol=isCKorPro?"#2563eb":gc(m.a||""),bCol=isCKorPro?"#dc2626":gc(m.b||"");return`<div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
                <span style="font-size:10px;background:#e0e7ff;color:#3730a3;padding:1px 7px;border-radius:20px;font-weight:700">${m._mode||"\u26A1 \uBBF8\uB2C8\uB300\uC804"}</span>
                <span style="font-size:var(--fs-caption);color:var(--gray-l)">\u{1F4C5} ${m.d||"\uB0A0\uC9DC \uBBF8\uC815"}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
                <div style="flex:1;text-align:center;padding:10px;background:${aCol}22;border-radius:8px;border:2px solid ${myVote==="a"?aCol:"transparent"}">
                  <div style="font-weight:800;color:${aCol}">${tA}</div>
                </div>
                <div style="font-weight:900;color:var(--gray-l);font-size:var(--fs-lg)">VS</div>
                <div style="flex:1;text-align:center;padding:10px;background:${bCol}22;border-radius:8px;border:2px solid ${myVote==="b"?bCol:"transparent"}">
                  <div style="font-weight:800;color:${bCol}">${tB}</div>
                </div>
              </div>
              ${voteBar(key)}
              ${myVote?`<button class="btn btn-w btn-sm" style="width:100%;margin-top:10px" onclick="cancelVote('${key}')">\u{1F504} \uC608\uCE21 \uCDE8\uC18C</button>`:`<div style="display:flex;gap:8px;margin-top:10px">
                    <button class="btn btn-sm" style="flex:1;background:${aCol};color:#fff;border-color:${aCol}" onclick="doVote('${key}','a')">${tA} \uC2B9\uB9AC</button>
                    <button class="btn btn-sm" style="flex:1;background:${bCol};color:#fff;border-color:${bCol}" onclick="doVote('${key}','b')">${tB} \uC2B9\uB9AC</button>
                  </div>`}
            </div>`}).join("")}
    </div>

    <!-- \uC608\uCE21 \uACB0\uACFC \uD655\uC778 -->
    <div class="ssec">
      <h4>\u{1F3C6} \uC608\uCE21 \uACB0\uACFC</h4>
      ${finished.length===0?'<p style="color:var(--gray-l);font-size:var(--fs-base)">\uACB0\uACFC\uAC00 \uB098\uC628 \uACBD\uAE30\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.</p>':finished.map(m=>{const key=getVoteKey(m),v=voteData[key]||{a:0,b:0},myVote=voteData[key+"_my"],winner=m.sa>m.sb?"a":"b",correct=myVote&&myVote===winner,voted=!!myVote,isCKorProF=ckM.includes(m)||proM.includes(m)||typeof ttM!="undefined"&&ttM.includes(m),tAF=isCKorProF?m.teamALabel||"A\uD300":m.a||"\uD300A",tBF=isCKorProF?m.teamBLabel||"B\uD300":m.b||"\uD300B",aCol=isCKorProF?"#2563eb":gc(m.a||""),bCol=isCKorProF?"#dc2626":gc(m.b||""),total=v.a+v.b,pctA=total===0?50:Math.round(v.a/total*100);return`<div style="background:var(--white);border:1px solid ${voted?correct?"var(--green)":"var(--red)":"var(--border)"};border-radius:12px;padding:14px;margin-bottom:8px;opacity:${voted?1:.7}">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                <span style="font-size:var(--fs-caption);color:var(--gray-l)">\u{1F4C5} ${m.d||""}</span>
                ${voted?`<span style="font-size:var(--fs-sm);font-weight:700;color:${correct?"var(--green)":"var(--red)"}">${correct?"\u2705 \uC608\uCE21 \uC131\uACF5!":"\u274C \uC608\uCE21 \uC2E4\uD328"}</span>`:'<span style="font-size:var(--fs-caption);color:var(--gray-l)">\uC608\uCE21 \uC548\uD568</span>'}
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="flex:1;text-align:center;font-weight:${m.sa>m.sb?"900":"400"};color:${m.sa>m.sb?aCol:"var(--gray-l)"}">
                  ${m.sa>m.sb?"\u{1F3C6} ":""} ${tAF}
                </div>
                <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:20px">${m.sa} : ${m.sb}</div>
                <div style="flex:1;text-align:center;font-weight:${m.sb>m.sa?"900":"400"};color:${m.sb>m.sa?bCol:"var(--gray-l)"}">
                  ${m.sb>m.sa?"\u{1F3C6} ":""} ${tBF}
                </div>
              </div>
              <div style="margin-top:8px">
                <div style="display:flex;height:18px;border-radius:20px;overflow:hidden;background:#f1f5f9">
                  <div style="width:${pctA}%;background:${aCol};transition:.4s"></div>
                  <div style="width:${100-pctA}%;background:${bCol};transition:.4s"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:3px">
                  <span>${pctA}% (${v.a}\uD45C)</span><span>${100-pctA}% (${v.b}\uD45C)</span>
                </div>
              </div>
            </div>`}).join("")}
    </div>

  </div>`}function doVote(key,side){if(voteData[key+"_my"]){alert("\uC774\uBBF8 \uC608\uCE21\uD588\uC2B5\uB2C8\uB2E4!");return}voteData[key]||(voteData[key]={a:0,b:0}),voteData[key][side]++,voteData[key+"_my"]=side,saveVotes(),render()}function cancelVote(key){const side=voteData[key+"_my"];side&&confirm("\uC608\uCE21\uC744 \uCDE8\uC18C\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?")&&(voteData[key]&&(voteData[key][side]=Math.max(0,voteData[key][side]-1),(voteData[key].a||0)===0&&(voteData[key].b||0)===0&&delete voteData[key]),delete voteData[key+"_my"],saveVotes(),render())}function sf(u,t){fUniv=u,fTier=t,render()}function fsearch(type){const id=type==="w"?"ws":"ls",lid=type==="w"?"wl":"ll",inp=document.getElementById(id),d=document.getElementById(lid);if(!inp||!d)return;const v=inp.value.toLowerCase(),f=players.filter(p=>p.name.toLowerCase().includes(v));v&&f.length?(d.innerHTML=f.map(p=>`<div class="sitem" onclick="selP('${type}','${p.name}')">${p.name} <span style="color:var(--gray-l);font-size:var(--fs-caption)">(${p.univ})</span></div>`).join(""),d.style.display="block"):d.style.display="none"}function selP(type,name){const inp=document.getElementById(type==="w"?"ws":"ls"),d=document.getElementById(type==="w"?"wl":"ll");inp&&(inp.value=name),d&&(d.style.display="none")}function upTour(i,v){tourD[i]=v,save(),render()}window.addEventListener("click",e=>{e.target.classList.contains("modal")&&!e.target.dataset.noClose&&(e.target.style.display="none"),e.target.closest(".swrap")||document.querySelectorAll(".sdrop").forEach(d=>d.style.display="none")}),document.addEventListener("keydown",function(e){if(e.key!=="Escape")return;const open=[...document.querySelectorAll(".modal")].filter(m=>m.style.display&&m.style.display!=="none");if(!open.length)return;const top=open[open.length-1];top.dataset.noClose||(top.style.display="none")});async function doJpg(){const actionBar=document.getElementById("actionBar"),bottomNav=document.getElementById("bottomNav"),fstrip=document.getElementById("fstrip"),mobileActionBar=document.getElementById("mobileActionBar"),abOrig=actionBar?actionBar.style.display:"",bnOrig=bottomNav?bottomNav.style.display:"",fsOrig=fstrip?fstrip.style.display:"",maOrig=mobileActionBar?mobileActionBar.style.display:"",noExportSaved=[...document.querySelectorAll(".no-export")].map(e=>({e,d:e.style.display}));function restoreAll(){noExportSaved.forEach(({e,d})=>e.style.display=d),actionBar&&(actionBar.style.display=abOrig),bottomNav&&(bottomNav.style.display=bnOrig),fstrip&&(fstrip.style.display=fsOrig),mobileActionBar&&(mobileActionBar.style.display=maOrig)}try{document.querySelectorAll(".no-export").forEach(e=>e.style.display="none"),actionBar&&(actionBar.style.display="none"),bottomNav&&(bottomNav.style.display="none"),fstrip&&(fstrip.style.display="none"),mobileActionBar&&(mobileActionBar.style.display="none");const cap=document.getElementById("cap"),origStyle=cap.getAttribute("style")||"";cap.style.maxWidth="900px",cap.style.margin="0 auto",cap.style.padding="24px";const capImgs=[...cap.querySelectorAll("img[src]")],origSrcs=capImgs.map(img=>img.getAttribute("src"));await Promise.allSettled(capImgs.map(img=>new Promise(resolve=>{const src=img.getAttribute("src");if(!src||src.startsWith("data:")||src.startsWith("blob:")){resolve();return}const c=document.createElement("canvas"),nw=img.naturalWidth||img.width||64,nh=img.naturalHeight||img.height||64;c.width=nw||64,c.height=nh||64;const ctx2=c.getContext("2d"),tmp=new Image;tmp.crossOrigin="anonymous",tmp.onload=()=>{try{ctx2.drawImage(tmp,0,0,c.width,c.height),img.src=c.toDataURL("image/png")}catch(e){}resolve()},tmp.onerror=()=>resolve(),tmp.src=src+(src.includes("?")?"&":"?")+"_nc="+Date.now()})));const canvas=await html2canvas(cap,{backgroundColor:"#fff",useCORS:!0,allowTaint:!0,scale:2,logging:!1,imageTimeout:1e4});capImgs.forEach((img,idx)=>{try{img.setAttribute("src",origSrcs[idx])}catch(e){}}),cap.setAttribute("style",origStyle),restoreAll();const pad=40,out=document.createElement("canvas");out.width=canvas.width+pad*2,out.height=canvas.height+pad*2;const ctx=out.getContext("2d");ctx.fillStyle="#f1f5f9",ctx.fillRect(0,0,out.width,out.height),ctx.drawImage(canvas,pad,pad);const fname=`\uC2A4\uD0C0\uB300\uD559_${{total:"\uC2A4\uD2B8\uB9AC\uBA38",tier:"\uD2F0\uC5B4\uC21C\uC704",mini:"\uBBF8\uB2C8\uB300\uC804",univm:"\uB300\uD559\uB300\uC804",univck:"\uB300\uD559CK",comp:"\uB300\uD68C",pro:"\uD504\uB85C\uB9AC\uADF8",hist:"\uB300\uC804\uAE30\uB85D",stats:"\uD1B5\uACC4",cal:"\uCE98\uB9B0\uB354"}[curTab]||curTab}_${new Date().toISOString().slice(0,10)}.png`;await _saveCanvasImage(out,fname,"png")}catch(e){restoreAll(),alert("\uC774\uBBF8\uC9C0 \uC800\uC7A5 \uC624\uB958: "+e.message)}}
