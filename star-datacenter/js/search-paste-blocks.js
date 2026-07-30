/* ══════════════════════════════════════════════════════════════
   검색 - 붙여넣기 줄분리 & D포맷 블록 파싱 (search-parsing.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function splitPasteLines(raw) {
  if (!raw) return [];
  // 줄바꿈 1차 분리
  const lines = raw.split(/\r?\n/);
  const result = [];
  lines.forEach(line => {
    line = line.trim();
    if (!line) return;
    // 숫자+키캡이모지(\uFE0F\u20E3) 또는 ①~⑳이 index>0에서 나타나면 그 앞에서 분리
    // 예: "1️⃣...라2️⃣...실" → ["1️⃣...라", "2️⃣...실"]
    // 경계 패턴: 숫자(0x30-0x39) + \uFE0F + \u20E3  or  ①~⑳(\u2460-\u2473)
    const positions = [];
    for (let i = 0; i < line.length; i++) {
      const code = line.charCodeAt(i);
      // 숫자 문자 뒤에 \uFE0F + \u20E3 가 오면 keycap
      if (code >= 0x30 && code <= 0x39) {
        if (line.charCodeAt(i+1) === 0xFE0F && line.charCodeAt(i+2) === 0x20E3) {
          if (i > 0) positions.push(i); // index 0이면 접두어라 분리 안함
          i += 2; // FE0F, 20E3 건너뜀
          continue;
        }
      }
      // ①~⑳ (\u2460~\u2473)
      if (code >= 0x2460 && code <= 0x2473) {
        if (i > 0) positions.push(i);
      }
    }

    // (버그/개선) 일반 숫자 구분자도 분리 지원
    // - "1. xxx 2. yyy" / "1) xxx 2) yyy" / "1경기 ... 2경기 ..." 처럼 한 줄에 여러 경기 붙은 경우
    // - 날짜(2026-04-22, 4/22)나 점수(3:2)와 혼동을 줄이기 위해, 앞글자가 공백/구분자일 때만 경계로 인정
    const isSepPrev = (idx) => {
      const prev = line[idx-1] || '';
      return /\s/.test(prev) || /[|·•\-–—~]/.test(prev);
    };
    try{
      const rxNumDot = /(\d{1,2})[.)]\s+/g;         // 1. , 2) ...
      const rxGameK  = /(\d{1,2})(경기|세트)(?=\s|$)/g;   // 1경기, 2세트 ...
      let m;
      while((m = rxNumDot.exec(line))){
        const idx = m.index;
        if(idx>0 && isSepPrev(idx)) positions.push(idx);
      }
      while((m = rxGameK.exec(line))){
        const idx = m.index;
        if(idx>0 && isSepPrev(idx)) positions.push(idx);
      }
    }catch(e){}

    if (positions.length === 0) {
      result.push(line);
      return;
    }
    // 중복/정렬
    positions.sort((a,b)=>a-b);
    const uniq=[];
    positions.forEach(p=>{ if(!uniq.length || uniq[uniq.length-1]!==p) uniq.push(p); });
    let prev = 0;
    uniq.forEach(pos => {
      const seg = line.slice(prev, pos).trim();
      if (seg) result.push(seg);
      prev = pos;
    });
    const last = line.slice(prev).trim();
    if (last) result.push(last);
  });
  return result;
}

/**
 * 새 형식 (Format D) 파싱:
 * N경기 - N티어\n패배!\n이름T\nVS\n이름Z\n승리!\n맵: 맵이름\n경기일 기준...
 */
function parseFormatD_blocks(raw) {
  const results = [];
  const lines = raw.split(/\r?\n/).map(l=>l.trim());
  // 빈 줄 제외 없이 인덱스로 처리
  let i=0;
  const nonEmpty = lines.filter(l=>l); // 빈줄 제외 배열

  // 여러 줄에 걸쳐 이름+종족 수집 헬퍼
  // 종족 단독줄: T, Z, P, T선픽, P선픽, Z선픽, T후픽, 선픽, 후픽 등
  const isRaceLine = l => /^([TZPN](선픽|후픽)?|선픽|후픽)$/.test(l.trim());
  const isResultLine = l => l==='승리!'||l==='패배!';
  const isVsLine = l => /^VS$/i.test(l);
  const isMapLine = l => l.startsWith('맵:');
  const isGameHeader = l => /^\d+경기/.test(l);
  const isStatLine = l => l.includes('상대전적')||l.includes('경기일');

  // 전처리: 연속된 이름+종족줄을 합치는 로직
  // ex) ["키링P"] 또는 ["키링","P"] 또는 ["뀨알","P선픽"] → "키링P" or "뀨알P"
  function collectName(arr, startIdx) {
    // arr[startIdx]가 이름(또는 이름+종족), 다음줄이 종족 단독줄이면 합침
    let name = arr[startIdx] || '';
    let nextIdx = startIdx + 1;
    // 다음 줄이 종족/픽 단독줄이면 붙임
    if(nextIdx < arr.length && isRaceLine(arr[nextIdx]) && !isResultLine(arr[nextIdx]) && !isVsLine(arr[nextIdx]) && !isMapLine(arr[nextIdx])){
      name += arr[nextIdx];
      nextIdx++;
    }
    // 또 다음 줄이 선픽/후픽이면 붙임 (이름P\n선픽 형태)
    if(nextIdx < arr.length && /^(선픽|후픽)$/.test(arr[nextIdx])){
      name += arr[nextIdx];
      nextIdx++;
    }
    // 이름에서 종족+픽옵션 제거하여 순수 이름 추출
    const cleaned = name.replace(/[TZPN](선픽|후픽)?$/, '').replace(/(선픽|후픽)$/, '').trim();
    return { name: cleaned, consumed: nextIdx - startIdx };
  }

  let ni = 0; // nonEmpty 인덱스
  while(ni < nonEmpty.length){
    const line = nonEmpty[ni];

    // ── 패턴 A: N경기로 시작하는 헤더 방식 ──
    // 지원: 헤더→result1→name1→VS→name2→result2→맵
    //       헤더→result1→·→result2→name1→VS→name2→맵 (이미지 형태)
    if(isGameHeader(line)){
      ni++;

      let result1=null, result2=null, name1='', name2='', mapName='-';
      if(ni<nonEmpty.length && isResultLine(nonEmpty[ni])){result1=nonEmpty[ni];ni++;}
      else{ni++;continue;}

      // · 구분자 스킵
      while(ni<nonEmpty.length && /^[·•·\-–—~]+$/.test(nonEmpty[ni])) ni++;

      // result2가 바로 이어서 나오는 경우 (헤더→result1→·→result2→이름)
      if(ni<nonEmpty.length && isResultLine(nonEmpty[ni])){result2=nonEmpty[ni];ni++;}

      // name1
      if(ni<nonEmpty.length && !isVsLine(nonEmpty[ni]) && !isMapLine(nonEmpty[ni]) && !isGameHeader(nonEmpty[ni])){
        const r = collectName(nonEmpty, ni);
        name1 = r.name;
        ni += r.consumed;
      }

      // VS 줄
      if(ni<nonEmpty.length && isVsLine(nonEmpty[ni])) ni++;

      // name2
      if(ni<nonEmpty.length && !isResultLine(nonEmpty[ni]) && !isMapLine(nonEmpty[ni]) && !isGameHeader(nonEmpty[ni])){
        const r = collectName(nonEmpty, ni);
        name2 = r.name;
        ni += r.consumed;
      }

      // result2 (이름 뒤에 나오는 경우)
      if(!result2 && ni<nonEmpty.length && isResultLine(nonEmpty[ni])){result2=nonEmpty[ni];ni++;}

      // 맵 + 통계줄 스킵
      while(ni<nonEmpty.length){
        const ml=nonEmpty[ni];
        if(isMapLine(ml)){
          const rawMap=ml.replace('맵:','').trim();
          const alias=getMapAlias();
          mapName=alias[rawMap]||rawMap;
          ni++;break;
        }
        if(isGameHeader(ml)||isResultLine(ml))break;
        ni++;
      }
      // 통계줄 스킵 (최근 N일, 25년 이후, N:N, 상대전적)
      while(ni<nonEmpty.length && (/최근\s*\d+일|^\d+년|^\d+경기\s*[-—]|\d+\s*:\s*\d+/.test(nonEmpty[ni])||isStatLine(nonEmpty[ni]))){ni++;}

      if(name1&&name2&&result1&&result2){
        let winName='',loseName='';
        if(result1==='승리!'&&result2==='패배!'){winName=name1;loseName=name2;}
        else if(result1==='패배!'&&result2==='승리!'){winName=name2;loseName=name1;}
        // result2 early (result1·result2→name1→name2): result1=승리!=name1승, result2=패배!=name2패
        else if(result2&&result1==='승리!'&&result2==='패배!'){winName=name1;loseName=name2;}
        else if(result2&&result1==='패배!'&&result2==='승리!'){winName=name2;loseName=name1;}
        if(winName&&loseName) results.push({winName,loseName,map:mapName});
      }
      continue;
    }

    // ── 패턴 B: 승리!/패배! → (·구분자) → 이름 → VS → 이름 → 승리!/패배! → 맵 ──
    // 예: 승리!\n·\n패배!\n비재희\nZ\nVS\n엄보리\nP\n맵: 실피드\n최근 90일...\n6경기-2티어
    if(isResultLine(line)){
      let result1=line; ni++;
      // '·' 같은 구분자 스킵
      while(ni<nonEmpty.length && /^[·•·\-–—~]+$/.test(nonEmpty[ni])) ni++;
      // result2 (바로 이어서 나오는 승리!/패배!)
      let result2_early=null;
      if(ni<nonEmpty.length && isResultLine(nonEmpty[ni])){result2_early=nonEmpty[ni];ni++;}
      // 이름1 수집
      let name1='', name2='', mapName='-', result2=result2_early;
      if(ni<nonEmpty.length && !isResultLine(nonEmpty[ni]) && !isVsLine(nonEmpty[ni]) && !isMapLine(nonEmpty[ni])){
        const r=collectName(nonEmpty,ni); name1=r.name; ni+=r.consumed;
      }
      // VS
      if(ni<nonEmpty.length && isVsLine(nonEmpty[ni])) ni++;
      // 이름2
      if(ni<nonEmpty.length && !isResultLine(nonEmpty[ni]) && !isVsLine(nonEmpty[ni]) && !isMapLine(nonEmpty[ni])){
        const r=collectName(nonEmpty,ni); name2=r.name; ni+=r.consumed;
      }
      // result2 (이름 뒤에 나오는 경우)
      if(!result2 && ni<nonEmpty.length && isResultLine(nonEmpty[ni])){result2=nonEmpty[ni];ni++;}
      // 맵
      while(ni<nonEmpty.length){
        const ml=nonEmpty[ni];
        if(isMapLine(ml)){
          const rawMap=ml.replace('맵:','').trim();
          const alias=getMapAlias();
          mapName=alias[rawMap]||rawMap;
          ni++;break;
        }
        // 통계줄 스킵: '최근 N일', '25년 이후', 'N경기 - N티어' 형태
        if(/최근\s*\d+일|^\d+년|^\d+경기\s*[-—]|\d+\s*:\s*\d+/.test(ml)){ni++;continue;}
        if(isResultLine(ml)||isVsLine(ml)||isGameHeader(ml))break;
        ni++;
      }
      // 통계/부가정보 줄 추가 스킵
      while(ni<nonEmpty.length && (/최근\s*\d+일|^\d+년|^\d+경기\s*[-—]|\d+\s*:\s*\d+/.test(nonEmpty[ni])||isStatLine(nonEmpty[ni]))){ni++;}

      if(name1&&name2&&result1&&result2){
        let winName='',loseName='';
        if(result1==='승리!'&&result2==='패배!'){winName=name1;loseName=name2;}
        else if(result1==='패배!'&&result2==='승리!'){winName=name2;loseName=name1;}
        // result2_early: 승/패가 첫 블록에 몰린 경우 (승리!·패배! → 이름1 VS 이름2 → 맵)
        // 이 경우엔 result1=첫결과, result2=두번째결과, name1이 result1에 해당, name2가 result2에 해당
        if(!winName&&!loseName&&result2_early&&name1&&name2){
          if(result1==='승리!'&&result2_early==='패배!'){winName=name1;loseName=name2;}
          else if(result1==='패배!'&&result2_early==='승리!'){winName=name2;loseName=name1;}
        }
        if(winName&&loseName) results.push({winName,loseName,map:mapName});
      }
      continue;
    }

    ni++;
  }
  return results;
}

