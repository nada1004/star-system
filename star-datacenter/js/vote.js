/* ══════════════════════════════════════
   🎯 승부예측 시스템
══════════════════════════════════════ */
function saveVotes(){
  localStorage.setItem('su_votes', JSON.stringify(voteData));
  // 집계 데이터(_my 제외)만 Firebase에 동기화
  if(typeof save === 'function') save();
}

function rVote(C,T){
  T.textContent='🎯 승부예측';

  // 예정/진행중 경기 수집 (전체 종류)
  const _isUnresolved = m => m.sa==null || m.sa==='';
  const _isResolved   = m => m.sa!=null && m.sa!=='';

  // 팀전 전체 합산
  const _allTeamM = [
    ...miniM.map(m=>({...m,_mode:'⚡ 미니대전'})),
    ...univM.map(m=>({...m,_mode:'🏟️ 대학대전'})),
    ...ckM.map(m=>({...m,_mode:'🤝 대학CK'})),
    ...proM.map(m=>({...m,_mode:'🏅 프로리그'})),
    ...(typeof ttM!=='undefined'?ttM:[]).map(m=>({...m,_mode:'🎯 티어대회'})),
  ];
  const upcoming = _allTeamM.filter(_isUnresolved);
  const finished = _allTeamM.filter(_isResolved);

  function getVoteKey(m){ return m._id||`${m.wName||m.a}_${m.lName||m.b}_${m.d}`; }

  function voteBar(key, side){
    const v = voteData[key]||{a:0,b:0};
    const total = v.a+v.b;
    const myVote = voteData[key+'_my'];
    const pctA = total===0?50:Math.round(v.a/total*100);
    const pctB = 100-pctA;
    const _vm=_allTeamM.find(m=>getVoteKey(m)===key)||{};
    const aCol = gc(_vm.a||'');
    const bCol = gc(_vm.b||'');
    return `
      <div style="margin-top:10px">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray-l);margin-bottom:4px">
          <span>🗳️ 총 ${total}표</span>
          ${myVote?`<span style="color:var(--blue);font-weight:700">✅ 내 예측: ${myVote==='a'?_vm.a||'A':_vm.b||'B'}</span>`:''}
        </div>
        <div style="display:flex;height:22px;border-radius:20px;overflow:hidden;background:#f1f5f9">
          <div style="width:${pctA}%;background:${aCol||'var(--blue)'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;transition:.4s">${pctA}%</div>
          <div style="width:${pctB}%;background:${bCol||'var(--red)'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700;transition:.4s">${pctB}%</div>
        </div>
      </div>`;
  }

  C.innerHTML=`
  <div style="display:flex;flex-direction:column;gap:16px">

    <!-- 예측 가능한 경기 -->
    <div class="ssec">
      <h4>🎯 승부예측</h4>
      ${upcoming.length===0
        ? '<p style="color:var(--gray-l);font-size:13px">예측 가능한 경기가 없습니다.<br><span style="font-size:11px">미니대전에서 결과 미입력 경기가 여기에 표시됩니다.</span></p>'
        : upcoming.map(m=>{
            const key=getVoteKey(m);
            const v=voteData[key]||{a:0,b:0};
            const myVote=voteData[key+'_my'];
            const isCKorPro=(ckM.includes(m)||proM.includes(m)||(typeof ttM!=='undefined'&&ttM.includes(m)));
            const tA=isCKorPro?(m.teamALabel||'A팀'):(m.a||'팀A');
            const tB=isCKorPro?(m.teamBLabel||'B팀'):(m.b||'팀B');
            const aCol=isCKorPro?'#2563eb':gc(m.a||'');
            const bCol=isCKorPro?'#dc2626':gc(m.b||'');
            return `<div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
                <span style="font-size:10px;background:#e0e7ff;color:#3730a3;padding:1px 7px;border-radius:20px;font-weight:700">${m._mode||'⚡ 미니대전'}</span>
                <span style="font-size:11px;color:var(--gray-l)">📅 ${m.d||'날짜 미정'}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
                <div style="flex:1;text-align:center;padding:10px;background:${aCol}22;border-radius:8px;border:2px solid ${myVote==='a'?aCol:'transparent'}">
                  <div style="font-weight:800;color:${aCol}">${tA}</div>
                </div>
                <div style="font-weight:900;color:var(--gray-l);font-size:18px">VS</div>
                <div style="flex:1;text-align:center;padding:10px;background:${bCol}22;border-radius:8px;border:2px solid ${myVote==='b'?bCol:'transparent'}">
                  <div style="font-weight:800;color:${bCol}">${tB}</div>
                </div>
              </div>
              ${voteBar(key)}
              ${myVote
                ? `<button class="btn btn-w btn-sm" style="width:100%;margin-top:10px" onclick="cancelVote('${key}')">🔄 예측 취소</button>`
                : `<div style="display:flex;gap:8px;margin-top:10px">
                    <button class="btn btn-sm" style="flex:1;background:${aCol};color:#fff;border-color:${aCol}" onclick="doVote('${key}','a')">${tA} 승리</button>
                    <button class="btn btn-sm" style="flex:1;background:${bCol};color:#fff;border-color:${bCol}" onclick="doVote('${key}','b')">${tB} 승리</button>
                  </div>`
              }
            </div>`;
          }).join('')
      }
    </div>

    <!-- 예측 결과 확인 -->
    <div class="ssec">
      <h4>🏆 예측 결과</h4>
      ${finished.length===0
        ? '<p style="color:var(--gray-l);font-size:13px">결과가 나온 경기가 없습니다.</p>'
        : finished.map(m=>{
            const key=getVoteKey(m);
            const v=voteData[key]||{a:0,b:0};
            const myVote=voteData[key+'_my'];
            const winner=m.sa>m.sb?'a':'b';
            const correct=myVote&&myVote===winner;
            const voted=!!myVote;
            const isCKorProF=(ckM.includes(m)||proM.includes(m)||(typeof ttM!=='undefined'&&ttM.includes(m)));
            const tAF=isCKorProF?(m.teamALabel||'A팀'):(m.a||'팀A');
            const tBF=isCKorProF?(m.teamBLabel||'B팀'):(m.b||'팀B');
            const aCol=isCKorProF?'#2563eb':gc(m.a||'');
            const bCol=isCKorProF?'#dc2626':gc(m.b||'');
            const total=v.a+v.b;
            const pctA=total===0?50:Math.round(v.a/total*100);
            return `<div style="background:var(--white);border:1px solid ${voted?(correct?'var(--green)':'var(--red)'):'var(--border)'};border-radius:12px;padding:14px;margin-bottom:8px;opacity:${voted?1:0.7}">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                <span style="font-size:11px;color:var(--gray-l)">📅 ${m.d||''}</span>
                ${voted?`<span style="font-size:12px;font-weight:700;color:${correct?'var(--green)':'var(--red)'}">${correct?'✅ 예측 성공!':'❌ 예측 실패'}</span>`:'<span style="font-size:11px;color:var(--gray-l)">예측 안함</span>'}
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <div style="flex:1;text-align:center;font-weight:${m.sa>m.sb?'900':'400'};color:${m.sa>m.sb?aCol:'var(--gray-l)'}">
                  ${m.sa>m.sb?'🏆 ':''} ${tAF}
                </div>
                <div style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:20px">${m.sa} : ${m.sb}</div>
                <div style="flex:1;text-align:center;font-weight:${m.sb>m.sa?'900':'400'};color:${m.sb>m.sa?bCol:'var(--gray-l)'}">
                  ${m.sb>m.sa?'🏆 ':''} ${tBF}
                </div>
              </div>
              <div style="margin-top:8px">
                <div style="display:flex;height:18px;border-radius:20px;overflow:hidden;background:#f1f5f9">
                  <div style="width:${pctA}%;background:${aCol};transition:.4s"></div>
                  <div style="width:${100-pctA}%;background:${bCol};transition:.4s"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray-l);margin-top:3px">
                  <span>${pctA}% (${v.a}표)</span><span>${100-pctA}% (${v.b}표)</span>
                </div>
              </div>
            </div>`;
          }).join('')
      }
    </div>

  </div>`;
}

function doVote(key, side){
  if(voteData[key+'_my']){ alert('이미 예측했습니다!'); return; }
  if(!voteData[key]) voteData[key]={a:0,b:0};
  voteData[key][side]++;
  voteData[key+'_my']=side;
  saveVotes();
  render();
}

function cancelVote(key){
  const side=voteData[key+'_my'];
  if(!side)return;
  if(!confirm('예측을 취소하시겠습니까?'))return;
  if(voteData[key]) voteData[key][side]=Math.max(0,voteData[key][side]-1);
  delete voteData[key+'_my'];
  saveVotes();
  render();
}

function sf(u,t){fUniv=u;fTier=t;render();}
function fsearch(type){
  const id=type==='w'?'ws':'ls';const lid=type==='w'?'wl':'ll';
  const inp=document.getElementById(id);const d=document.getElementById(lid);
  if(!inp||!d)return;
  const v=inp.value.toLowerCase();
  const f=players.filter(p=>p.name.toLowerCase().includes(v));
  if(v&&f.length){d.innerHTML=f.map(p=>`<div class="sitem" onclick="selP('${type}','${p.name}')">${p.name} <span style="color:var(--gray-l);font-size:11px">(${p.univ})</span></div>`).join('');d.style.display='block';}
  else d.style.display='none';
}
function selP(type,name){
  const inp=document.getElementById(type==='w'?'ws':'ls');
  const d=document.getElementById(type==='w'?'wl':'ll');
  if(inp) inp.value=name;
  if(d) d.style.display='none';
}
function upTour(i,v){tourD[i]=v;save();render();}
function om(id){const el=document.getElementById(id);if(el)el.style.display='block';}
function cm(id){
  const el=document.getElementById(id);
  if(el)el.style.display='none';
}
window.addEventListener('click',e=>{
  if(e.target.classList.contains('modal') && !e.target.dataset.noClose){
    e.target.style.display='none';
  }
  if(!e.target.closest('.swrap'))document.querySelectorAll('.sdrop').forEach(d=>d.style.display='none');
});

async function doJpg(){
  const actionBar=document.getElementById('actionBar');
  const bottomNav=document.getElementById('bottomNav');
  const fstrip=document.getElementById('fstrip');
  const mobileActionBar=document.getElementById('mobileActionBar');
  const abOrig=actionBar?actionBar.style.display:'';
  const bnOrig=bottomNav?bottomNav.style.display:'';
  const fsOrig=fstrip?fstrip.style.display:'';
  const maOrig=mobileActionBar?mobileActionBar.style.display:'';
  // no-export 요소들의 원래 style.display 저장 (복원 시 정확히 되돌리기 위해)
  const noExportSaved=[...document.querySelectorAll('.no-export')].map(e=>({e,d:e.style.display}));
  function restoreAll(){
    noExportSaved.forEach(({e,d})=>e.style.display=d);
    if(actionBar)actionBar.style.display=abOrig;
    if(bottomNav)bottomNav.style.display=bnOrig;
    if(fstrip)fstrip.style.display=fsOrig;
    if(mobileActionBar)mobileActionBar.style.display=maOrig;
  }
  try{
    document.querySelectorAll('.no-export').forEach(e=>e.style.display='none');
    if(actionBar)actionBar.style.display='none';
    if(bottomNav)bottomNav.style.display='none';
    if(fstrip)fstrip.style.display='none';
    if(mobileActionBar)mobileActionBar.style.display='none';
    const cap=document.getElementById('cap');
    const origStyle=cap.getAttribute('style')||'';
    cap.style.maxWidth='900px';cap.style.margin='0 auto';cap.style.padding='24px';
    // 외부 이미지 CORS 우회: img src를 canvas data URL로 교체 후 캡처
    const capImgs = [...cap.querySelectorAll('img[src]')];
    const origSrcs = capImgs.map(img => img.getAttribute('src'));
    await Promise.allSettled(capImgs.map(img => new Promise(resolve => {
      const src = img.getAttribute('src');
      if(!src || src.startsWith('data:') || src.startsWith('blob:')) { resolve(); return; }
      const c = document.createElement('canvas');
      const nw = img.naturalWidth || img.width || 64;
      const nh = img.naturalHeight || img.height || 64;
      c.width = nw || 64; c.height = nh || 64;
      const ctx2 = c.getContext('2d');
      const tmp = new Image();
      tmp.crossOrigin = 'anonymous';
      tmp.onload = () => {
        try { ctx2.drawImage(tmp, 0, 0, c.width, c.height); img.src = c.toDataURL('image/png'); } catch(e){}
        resolve();
      };
      tmp.onerror = () => resolve();
      tmp.src = src + (src.includes('?') ? '&' : '?') + '_nc=' + Date.now();
    })));
    const canvas=await html2canvas(cap,{backgroundColor:'#fff',useCORS:true,allowTaint:true,scale:2,logging:false,imageTimeout:10000});
    // 원본 src 복원
    capImgs.forEach((img, idx) => { try { img.setAttribute('src', origSrcs[idx]); } catch(e){} });
    cap.setAttribute('style',origStyle);
    restoreAll();
    // 캔버스를 가운데 여백 추가해서 새 캔버스에 그리기
    const pad=40;
    const out=document.createElement('canvas');
    out.width=canvas.width+pad*2;out.height=canvas.height+pad*2;
    const ctx=out.getContext('2d');
    ctx.fillStyle='#f1f5f9';ctx.fillRect(0,0,out.width,out.height);
    ctx.drawImage(canvas,pad,pad);
    const tabNames={total:'스트리머',tier:'티어순위',mini:'미니대전',univm:'대학대전',univck:'대학CK',comp:'대회',pro:'프로리그',hist:'대전기록',stats:'통계',cal:'캘린더'};
    const fname=`스타대학_${tabNames[curTab]||curTab}_${new Date().toISOString().slice(0,10)}.png`;
    await _saveCanvasImage(out,fname,'png');
  }catch(e){
    restoreAll();
    alert('이미지 저장 오류: '+e.message);
  }
}


