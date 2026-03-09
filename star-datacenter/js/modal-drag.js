/* ══ 드래그 이동 가능한 모달 (PC 전용) ══ */
(function(){
  const isMobile = () => window.innerWidth <= 768;

  document.addEventListener('mousedown', function(e){
    if(isMobile()) return; // 모바일에서는 드래그 비활성

    const title = e.target.closest('.mtitle');
    if(!title) return;
    const box = title.closest('.mbox, .umbox');
    if(!box) return;
    const modal = box.closest('.modal');
    if(!modal) return;

    // 처음 드래그 시 absolute 위치로 전환
    if(box.style.position !== 'absolute'){
      const rect = box.getBoundingClientRect();
      box.style.position = 'absolute';
      box.style.margin = '0';
      box.style.left = rect.left + 'px';
      box.style.top = rect.top + 'px';
      modal.style.alignItems = 'flex-start';
      modal.style.justifyContent = 'flex-start';
    }

    const startX = e.clientX - box.offsetLeft;
    const startY = e.clientY - box.offsetTop;
    function onMove(ev){
      const maxL = window.innerWidth - box.offsetWidth;
      const maxT = window.innerHeight - 40;
      box.style.left = Math.min(maxL, Math.max(0, ev.clientX - startX)) + 'px';
      box.style.top  = Math.min(maxT, Math.max(0, ev.clientY - startY)) + 'px';
    }
    function onUp(){
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    e.preventDefault();
  });

  // 모달 열릴 때 position 초기화
  const origOm = window.om;
  window.om = function(id){
    const el = document.getElementById(id);
    if(el){
      const box = el.querySelector('.mbox, .umbox');
      if(box){ box.style.position=''; box.style.left=''; box.style.top=''; box.style.margin=''; }
      el.style.alignItems=''; el.style.justifyContent='';
    }
    if(typeof origOm === 'function') origOm(id);
  };
})();

/* ══ 모바일 경기 상세 시트 ══ */
function openMobileMatchSheet(titleText, scoreHTML, bodyHTML, detKey, dateStr, shareFunc){
  document.getElementById('mms-title').innerHTML = titleText;
  document.getElementById('mms-score').innerHTML = scoreHTML;
  document.getElementById('mms-body').innerHTML = bodyHTML;
  // footer 버튼 설정
  window._mmsCaptureKey = detKey || null;
  window._mmsCaptureDate = dateStr || 'match';
  window._mmsShareFn = shareFunc || null;
  const footer = document.getElementById('mms-footer');
  if(footer){
    footer.style.display = (detKey || shareFunc) ? 'flex' : 'none';
    const btnShare = document.getElementById('mms-btn-share');
    if(btnShare) btnShare.style.display = shareFunc ? '' : 'none';
    const btnCap = document.getElementById('mms-btn-capture');
    if(btnCap) btnCap.style.display = detKey ? '' : 'none';
  }
  document.getElementById('mobileMatchOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileMatchOverlay(){
  document.getElementById('mobileMatchOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closeMobileMatchSheet(e){
  closeMobileMatchOverlay();
}

/* 모바일에서 상세 열기 버튼 intercept */
(function(){
  const isMobile = () => window.innerWidth <= 768;

  // toggleDetail override for mobile
  const origToggleDetail = window.toggleDetail;
  window.toggleDetail = function(key){
    if(!isMobile()){ if(typeof origToggleDetail==='function') origToggleDetail(key); return; }

    const detEl = document.getElementById('det-' + key);
    if(!detEl) { if(typeof origToggleDetail==='function') origToggleDetail(key); return; }

    // 원본 함수로 렌더링 (buildDetailHTML 실행) - openDetails[key] = true로 만듦
    const wasClosed = !openDetails[key];
    if(wasClosed){
      if(typeof origToggleDetail==='function') origToggleDetail(key);
    }

    // 렌더링 후 bottom sheet로 표시
    const sumEl = detEl.closest('.rec-summary, .rec-card');
    let titleText = '경기 상세';
    let scoreHTML = '';
    if(sumEl){
      const hdr = sumEl.querySelector('.rec-sum-header, .rec-header');
      if(hdr){
        const badges = hdr.querySelectorAll('.ubadge');
        const scoreEl = hdr.querySelector('.rec-sum-score');
        if(scoreEl) scoreHTML = buildMobileScoreHTML(badges, scoreEl);
        // 날짜 + 팀명 추출
        const spans = hdr.querySelectorAll('span');
        let dateStr='', nameStr='';
        spans.forEach(s => {
          const t=s.textContent.trim();
          if(/^\d{4}-\d{2}-\d{2}/.test(t)) dateStr=t;
          else if(t.length>1 && t.length<30 && !t.includes('▼') && !t.includes('상세') && !t.includes('닫기') && !t.includes(':')) nameStr=nameStr||t;
        });
        if(badges.length>=2){
          titleText = (dateStr?`<span style="font-size:11px;opacity:.7">${dateStr}</span><br>`:'') +
            badges[0].textContent.trim() + ' vs ' + badges[1].textContent.trim();
        } else if(nameStr){
          titleText = (dateStr?dateStr+' ':'')+nameStr;
        }
      }
    }

    // _detReg에서 match 데이터를 꺼내 강제 모바일 레이아웃으로 재생성
    let bodyHTML;
    const reg = window._detReg && window._detReg[key];
    if(reg){
      bodyHTML = buildDetailHTML(reg.m, reg.mode, reg.lA, reg.lB, reg.ca, reg.cb, reg.aW, reg.bW);
    } else {
      // fallback: det- innerHTML 복사
      bodyHTML = detEl.innerHTML || '<div style="padding:20px;text-align:center;color:var(--gray-l)">상세 기록 없음</div>';
    }
    // reg에서 날짜 및 공유 함수 구성
    let dateForCapture = '';
    let shareFunc = null;
    if(reg){
      dateForCapture = reg.m.d || 'match';
      const editRef = reg.m._editRef;
      if(editRef && typeof openShareCardFromMatch==='function'){
        const parts = editRef.split(':');
        if(parts.length===2){
          const _mode = parts[0], _idx = parseInt(parts[1]);
          if(!isNaN(_idx)) shareFunc = ()=>openShareCardFromMatch(_mode, _idx);
        }
      }
    }
    openMobileMatchSheet(titleText, scoreHTML, bodyHTML, key, dateForCapture, shareFunc);

    // inline detail은 닫힌 상태 유지 (sheet에서만 보임)
    if(openDetails[key]){
      openDetails[key] = false;
      detEl.classList.remove('open');
      const btn = document.getElementById('detbtn-' + key);
      if(btn){ btn.classList.remove('open'); btn.textContent = '📂 상세'; }
    }
  };

  function buildMobileScoreHTML(badges, scoreEl){
    const aName = badges[0]?badges[0].textContent.trim():'';
    const bName = badges[1]?badges[1].textContent.trim():'';
    const aColor = badges[0]?getComputedStyle(badges[0]).backgroundColor:'#2563eb';
    const bColor = badges[1]?getComputedStyle(badges[1]).backgroundColor:'#dc2626';
    const nums = scoreEl.querySelectorAll('span');
    let sa='?', sb='?';
    if(nums.length>=2){ sa=nums[0].textContent.trim(); sb=nums[nums.length-1].textContent.trim(); }
    const aWin = parseInt(sa)>parseInt(sb);
    const bWin = parseInt(sb)>parseInt(sa);
    return `
      <div class="mobile-match-sheet-team" style="color:${aColor}">
        <div style="font-size:11px;opacity:.7;margin-bottom:2px">${aName}</div>
        <div class="mobile-match-sheet-num" style="${aWin?'':'opacity:.45'}">${sa}</div>
      </div>
      <div class="mobile-match-sheet-sep">:</div>
      <div class="mobile-match-sheet-team" style="color:${bColor}">
        <div style="font-size:11px;opacity:.7;margin-bottom:2px">${bName}</div>
        <div class="mobile-match-sheet-num" style="${bWin?'':'opacity:.45'}">${sb}</div>
      </div>`;
  }
})();