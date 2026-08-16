/* ══════════════════════════════════════════════════════════════
   검색 - 붙여넣기 미리보기 생성 (search-preview.js 에서 분리, 2026-07-30)
   ══════════════════════════════════════════════════════════════ */

function pastePreview() {
  const raw = (document.getElementById('paste-input')?.value || '').trim();
  const previewEl = document.getElementById('paste-preview');
  const applyBtn = document.getElementById('paste-apply-btn');
  if (!previewEl) return;
  if (!raw) { previewEl.innerHTML = ''; if(applyBtn) applyBtn.style.display='none'; return; }

  // ── 형식 D 우선 감지: 패배!/승리! 형식 (N경기 - N티어\n패배!\n이름\nVS\n이름\n승리!\n맵: ...) ──
  if (raw.includes('패배!') || raw.includes('승리!')) {
    const dResults = parseFormatD_blocks(raw);
    if (dResults.length > 0) {
      const results = dResults.map((r, i) => {
        const wMatch = _pasteResolvePlayer(r.winName);
        const lMatch = _pasteResolvePlayer(r.loseName);
        return {
          winName: wMatch.name || r.winName, loseName: lMatch.name || r.loseName, map: r.map,
          setNum: r.setNum || 1,
          wPlayer: wMatch.player, lPlayer: lMatch.player,
          wCandidates: wMatch.candidates, lCandidates: lMatch.candidates,
          wSimilar: wMatch.similar||[], lSimilar: lMatch.similar||[],
          lineNum: i + 1, rawLine: r.winName + ' vs ' + r.loseName
        };
      });
      window._pasteResults = results;
      window._pasteErrors = [];
      renderPastePreview(results, []);
      return;
    }
  }

  const lines = splitPasteLines(raw); // 한줄 붙은 복수경기 자동 분리
  const results = [];
  const errors = [];
  let currentSet = 1;
  let currentLineDate = null; // "일자: YYYY-MM-DD" 줄로 설정되는 현재 날짜
  let currentRoundLabel = null; // "64강/32강/16강/8강/4강/준결승/결승" 헤더 감지
  let formatCScore = null;   // 형식 C 누적 스코어 상태 { a, b }
  let isFormatC    = false;  // 이번 블록이 형식 C인지

  // 팀 로스터 초기화 (라인 "팀명 : 멤버1 멤버2..." 감지)
  window._pasteRosterA = null;
  window._pasteRosterB = null;
  // 이미 수동으로 설정된 팀명이 없으면 초기화
  if (!window._pasteForceTeamA) window._pasteForceTeamA = null;
  if (!window._pasteForceTeamB) window._pasteForceTeamB = null;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // ── (요청사항) 세트 스코어만 입력 허용 ──
    // 예) "2:2", "1:!" (!는 0으로 처리 → 1:0)
    // 주로 대회/티어대회/프로리그 세트 입력(조별/토너)에서 사용
    const _scoreOnlyM = trimmed.match(/^(\d+)\s*[：:]\s*([0-9!]+)\s*$/);
    if (_scoreOnlyM) {
      const a = parseInt(_scoreOnlyM[1], 10) || 0;
      const bRaw = String(_scoreOnlyM[2] || '').trim();
      const b = parseInt(bRaw.replace(/!/g, '0'), 10) || 0;
      // score-only는 세트/대회 붙여넣기에서만 의미가 있어 _grpPasteMode일 때만 결과로 포함
      if (window._grpPasteMode) {
        results.push({
          _scoreOnly: true,
          _scoreA: a,
          _scoreB: b,
          setNum: currentSet,
          lineNum: idx + 1,
          rawLine: trimmed,
          ...(currentLineDate ? { _lineDate: currentLineDate } : {}),
          ...(currentRoundLabel ? { _rndLabel: currentRoundLabel } : {})
        });
      } else {
        errors.push({ line: idx + 1, raw: trimmed, reason: '스코어만 입력(예: 2:2)은 대회/세트 붙여넣기에서만 지원됩니다.' });
      }
      return;
    }

    // ── (요청사항) "이름 2:2 이름" 형태도 스코어 전용으로 허용 ──
    // 예) "뽀누나 2:2 뚜비" / "박상현Z 3:3 윤수철P"
    // ※ 대회/세트 붙여넣기(= _grpPasteMode)에서만 의미가 있으므로 그때만 결과로 포함
    const _scoreOnlyNameM = trimmed.match(/^(.+?)\s+(\d+)\s*[：:]\s*(\d+)\s+(.+?)\s*$/);
    if (_scoreOnlyNameM && window._grpPasteMode) {
      const a = parseInt(_scoreOnlyNameM[2], 10) || 0;
      const b = parseInt(_scoreOnlyNameM[3], 10) || 0;
      results.push({
        _scoreOnly: true,
        _scoreA: a,
        _scoreB: b,
        setNum: currentSet,
        lineNum: idx + 1,
        rawLine: trimmed,
        ...(currentLineDate ? { _lineDate: currentLineDate } : {}),
        ...(currentRoundLabel ? { _rndLabel: currentRoundLabel } : {})
      });
      return;
    }

    // ── 토너먼트 라운드 헤더 감지 ──
    // 예) "64강", "32강", "16강", "8강", "4강", "준결승", "결승"
    const _rnd = trimmed.replace(/\s+/g,'');
    if (/^(?:64강|32강|16강|8강|4강|준결승|결승)$/.test(_rnd)) {
      currentRoundLabel = _rnd;
      return;
    }

    // ── 무시할 라인 패턴 ──
    // 팀 스코어: "(승) 수술대 3:1 늪지대 (패)" / "팀명 (승/패) N:M (승/패) 팀명" 등
    if (/\((?:승|패)\)\s*\d+\s*[：:]\s*\d+\s*\((?:승|패)\)/.test(trimmed)) return;
    if (/^\((?:승|패)\)/.test(trimmed) && /\d+\s*[：:]\s*\d+/.test(trimmed) && /\((?:승|패)\)\s*$/.test(trimmed)) return;
    // [승]/[패] 세트 결과 요약 라인: "[승] 수술대 3:1 늪지대" 등
    if (/^\[(?:승|패)\]/.test(trimmed)) return;
    // [ 0 : 3 팀명 승 ] 형태 인라인 스코어 (▶Nset 헤더 안에 포함된 경우 별도 줄로 올 수도 있음)
    if (/^\[\s*\d+\s*[：:]\s*\d+\s+\S+\s+(?:승|패)\s*\]$/.test(trimmed)) return;
    // 메타 정보: "[nSET - ...]", "[슈 에] - ...", "밴" 등 대괄호 제목/주석 라인
    if (/^\[.*\]\s*[-–—]/.test(trimmed)) return;
    // 밴/엔트리 정보: "다린,애공 밴" 등 (승/패/🆚 없고, 쉼표+한글+밴으로 끝나는 라인)
    if (/[,，]\s*\S+\s+밴\s*$/.test(trimmed) && !trimmed.includes('🆚') && !trimmed.includes('vs')) return;

    // 무승부 라인: 🐱🆚🐱 → 무승부로 스킵
    if (/🐱[^🆚]*🆚[^🐱]*🐱/.test(trimmed) || (trimmed.includes('🆚') && (trimmed.match(/🐱/g)||[]).length>=2 && !trimmed.includes('✅') && !trimmed.includes('❌'))) return;

    // ── 날짜 줄 감지: "일자: YYYY-MM-DD" or "날짜: YYYY-MM-DD" or "YYYY년 MM월 DD일 ..." or "YYYY-MM-DD ..." ──
    // "YYYY-MM-DD" 단독 줄 or "YYYY-MM-DD " + 게임줄 형식 처리
    const _isoDateM = trimmed.match(/^(\d{4}-\d{2}-\d{2})(\s+(.+))?$/);
    if (_isoDateM && /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/.test(_isoDateM[1])) {
      const _id = _isoDateM[1];
      currentLineDate = _id;
      const _dateInput = document.getElementById('paste-date');
      if (_dateInput) _dateInput.value = _id;
      const _restLine = (_isoDateM[3] || '').trim();
      if (_restLine) {
        // 탭 구분 TSV 형식: 날짜가 이미 추출됐으므로 나머지 컬럼만 파싱
        if (_restLine.includes('\t')) {
          const _tc = _restLine.split('\t');
          const _tEx = s => {
            const t = (s||'').trim();
            // "이광용(P)" 형태
            let m = t.match(/^(.+?)\s*\([TZPRN]\)\s*$/i);
            if(m) return m[1].trim();
            // "이광용P" 형태 (끝 1글자 종족)
            m = t.match(/^(.+?)([TZPRN])$/i);
            if(m && m[1] && m[1].trim().length>=2 && !m[1].includes(' ')) return m[1].trim();
            return t;
          };

          // ── 1인칭 TSV: 기준 선수 설정 시 ──
          // 형식: 상대(종족)\t맵\t±점수\t...\t스코어
          // 예)  유민.(P)\t써킷\t+14.0\t\t3/2
          const _refPlayer = document.getElementById('paste-ref-player')?.value?.trim();
          if (_refPlayer && _tc.length >= 3) {
            const _scoreStr = (_tc[2] || '').trim();
            if (/^[+\-][\d.]+$/.test(_scoreStr)) {
              const _isWin = _scoreStr.startsWith('+');
              const _oppName = _tEx(_tc[0]);
              const _tMap = _tc[1] ? resolveMapName(_tc[1].trim()) : '-';
              const winName = _isWin ? _refPlayer : _oppName;
              const loseName = _isWin ? _oppName : _refPlayer;
              const _wM = _pasteResolvePlayer(winName), _lM = _pasteResolvePlayer(loseName);
              results.push({ winName: _wM.name || winName, loseName: _lM.name || loseName, map: _tMap, _rawMapStr: _tc[1]||'', setNum: currentSet,
                wPlayer: _wM.player, lPlayer: _lM.player,
                wCandidates: _wM.candidates, lCandidates: _lM.candidates,
                wSimilar: _wM.similar||[], lSimilar: _lM.similar||[],
                lineNum: idx+1, rawLine: trimmed, _lineDate: _id });
              return;
            }
          }

          // ── 2인칭 TSV: 선수1(종족)\t선수2(종족)\t맵\t승/패(ELO)\t[타입] ──
          const _tRes = (_tc[3] || '').trim();
          const _tIsW = _tRes.startsWith('승'), _tIsL = _tRes.startsWith('패');
          if (_tc.length >= 4 && (_tIsW || _tIsL) && _tc[0] && _tc[1]) {
            const _tP1 = _tEx(_tc[0]), _tP2 = _tEx(_tc[1]);
            const _tMap = _tc[2] ? resolveMapName(_tc[2].trim()) : '-';
            const winName = _tIsW ? _tP1 : _tP2, loseName = _tIsW ? _tP2 : _tP1;
            const _wM = _pasteResolvePlayer(winName), _lM = _pasteResolvePlayer(loseName);
            // 5번째 열: 저장 경로 타입 (mini·gj·ind 등)
            const _lineType = _parseTsvType(_tc[4]);
            // 6번째 이후: 메모(외부탭 등에서 넘어오는 비고)
            const _memo = (_tc.slice(5).join(' ') || '').trim();
            results.push({ winName: _wM.name || winName, loseName: _lM.name || loseName, map: _tMap, _rawMapStr: _tc[2]||'', setNum: currentSet,
              wPlayer: _wM.player, lPlayer: _lM.player,
              wCandidates: _wM.candidates, lCandidates: _lM.candidates,
              wSimilar: _wM.similar||[], lSimilar: _lM.similar||[],
              lineNum: idx+1, rawLine: trimmed, _lineDate: _id,
              ...(_lineType ? { _lineType } : {}),
              ...(_memo ? { _lineMemo:_memo } : {}) });
            return;
          }

          // ── (요청사항) 대회 토너먼트 TSV: 선수1(종족)\t선수2(종족)\t맵\tELO변동\t단판/3판... \t메모... ──
          // 예) 2026-04-17\t이광용P\t김성민P\t네오 실피드\t16.7\t단판\tE-SCORE...
          // 규칙: ELO가 +면 선수1 승, -면 선수2 승 (숫자 없으면 선수1 승으로 가정)
          if (_tc.length >= 4 && _tc[0] && _tc[1] && _tc[2]) {
            const p1 = _tEx(_tc[0]);
            const p2 = _tEx(_tc[1]);
            const mp = _tc[2] ? resolveMapName(_tc[2].trim()) : '-';
            const eloStr = (_tc[3] || '').trim();
            const eloNum = parseFloat(eloStr.replace(/[^\d\.\-+]/g,''));
            const p1Win = isNaN(eloNum) ? true : (eloNum >= 0);
            const winName = p1Win ? p1 : p2;
            const loseName = p1Win ? p2 : p1;
            const _wM = _pasteResolvePlayer(winName), _lM = _pasteResolvePlayer(loseName);
            const _memo = (_tc.slice(5).join(' ') || '').trim();
            results.push({ winName: _wM.name || winName, loseName: _lM.name || loseName, map: mp, _rawMapStr: _tc[2]||'', setNum: currentSet,
              wPlayer: _wM.player, lPlayer: _lM.player,
              wCandidates: _wM.candidates, lCandidates: _lM.candidates,
              wSimilar: _wM.similar||[], lSimilar: _lM.similar||[],
              lineNum: idx+1, rawLine: trimmed, _lineDate: _id,
              ...(currentRoundLabel?{_rndLabel:currentRoundLabel}:{ }),
              ...(_memo?{_lineMemo:_memo}:{}) });
            return;
          }
        }
        const _rp = parsePasteLine(_restLine);
        if (_rp) {
          const _wM = _pasteResolvePlayer(_rp.winName);
          const _lM = _pasteResolvePlayer(_rp.loseName);
          results.push({ ..._rp, winName: _wM.name || _rp.winName, loseName: _lM.name || _rp.loseName, _rawMapStr: _rp._rawMapStr||'', setNum: currentSet,
            wPlayer: _wM.player, lPlayer: _lM.player,
            wCandidates: _wM.candidates, lCandidates: _lM.candidates,
            wSimilar: _wM.similar||[], lSimilar: _lM.similar||[],
            _leftIsWin: (_rp.leftName === _rp.winName),
            lineNum: idx+1, rawLine: trimmed, _lineDate: _id, _rndLabel: currentRoundLabel });
        }
      }
      return;
    }
    // "YYYY년 MM월 DD일" 형식 — 단독 줄 or 게임 줄 앞에 붙은 경우 모두 처리
    const _korDateM = trimmed.match(/^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일(?:\s+|$)/);
    if (_korDateM) {
      const _kd = `${_korDateM[1]}-${String(_korDateM[2]).padStart(2,'0')}-${String(_korDateM[3]).padStart(2,'0')}`;
      currentLineDate = _kd;
      const _dateInput = document.getElementById('paste-date');
      if (_dateInput) _dateInput.value = _kd; // 항상 덮어씀 (한국식 날짜가 명시된 경우 우선)
      // 날짜 부분 제거 후 나머지를 게임 줄로 재처리
      const _restLine = trimmed.slice(_korDateM[0].length).trim();
      if (_restLine) {
        const _rp = parsePasteLine(_restLine);
        if (_rp) {
          const _wM = _pasteResolvePlayer(_rp.winName);
          const _lM = _pasteResolvePlayer(_rp.loseName);
          results.push({ ..._rp, winName: _wM.name || _rp.winName, loseName: _lM.name || _rp.loseName, _rawMapStr: _rp._rawMapStr||'', setNum: currentSet,
            wPlayer: _wM.player, lPlayer: _lM.player,
            wCandidates: _wM.candidates, lCandidates: _lM.candidates,
            wSimilar: _wM.similar||[], lSimilar: _lM.similar||[],
            _leftIsWin: (_rp.leftName === _rp.winName),
            lineNum: idx+1, rawLine: trimmed, _lineDate: _kd, _rndLabel: currentRoundLabel });
        }
      }
      return;
    }
    // 직전 결과에 날짜+메모 적용 (경기 다음 줄 포맷). 결과 없으면 currentLineDate로 이후 적용.
    // 어느 모드든 paste-date 입력 필드도 자동으로 채움.
    const _dateLineM = trimmed.match(/^(?:일자|날짜)\s*[:：]\s*(\d{4}-\d{2}-\d{2})(?:.*?[|｜]\s*메모\s*[:：]\s*(.+))?/);
    if (_dateLineM) {
      const _dl = _dateLineM[1];
      const _dm = (_dateLineM[2] || '').trim();
      // 날짜 입력 필드 자동 채움
      const _dateInput = document.getElementById('paste-date');
      if (_dateInput && !_dateInput.value) _dateInput.value = _dl;
      if (results.length > 0) {
        results[results.length - 1]._lineDate = _dl;
        if (_dm) results[results.length - 1]._lineMemo = _dm;
      } else {
        currentLineDate = _dl;
      }
      return;
    }

    // ── 팀명 직접 지정: "팀A: 공주대" / "A팀: 공주대" → _pasteForceTeamA 강제 설정 ──
    // 형식: "팀A:", "A팀:", "팀B:", "B팀:" 뒤에 오는 대학/팀명을 A팀/B팀으로 고정
    const _teamForceM = trimmed.match(/^(?:(팀\s*A|A\s*팀)|(팀\s*B|B\s*팀))\s*[：:]\s*(.+)$/);
    if (_teamForceM) {
      const _tfName = _teamForceM[3].trim();
      if (_teamForceM[1]) window._pasteForceTeamA = _tfName;
      else                window._pasteForceTeamB = _tfName;
      return;
    }

    // ── [N세트/N SET] (팀A 승 X : Y 패 팀B) 헤더 처리 ──
    // 예: "[1SET] (수술대 승 3 : 1 패 신세계)", "[2세트] (수술대 승 3 : 0 패 신세계)"
    const _setHeaderM2 = trimmed.match(/^\[?\s*(\d+)\s*(?:세트|셋|set)\s*\]?\s*\(?\s*(.+?)\s*승\s*\d+\s*[：:]\s*\d+\s*패\s*(.+?)\s*\)?\s*$/i);
    if (_setHeaderM2) {
      currentSet = parseInt(_setHeaderM2[1]);
      const _hWin = _setHeaderM2[2].trim();
      const _hLose = _setHeaderM2[3].trim();
      if (_hWin && !window._pasteForceTeamA) window._pasteForceTeamA = _hWin;
      if (_hLose && !window._pasteForceTeamB) window._pasteForceTeamB = _hLose;
      return;
    }

    // ── [N세트] 팀A(score) : 팀B(score) 헤더 처리 ──
    const _setHeaderM = trimmed.match(/^\[(\d+)\s*(?:세트|셋|set)\]\s*(.+?)\s*[：:]\s*(.+)$/i);
    if (_setHeaderM) {
      currentSet = parseInt(_setHeaderM[1]);
      const _hTeamA = _setHeaderM[2].replace(/\s*\(\d+\)\s*$/, '').trim();
      const _hTeamB = _setHeaderM[3].replace(/\s*\(\d+\)\s*$/, '').trim();
      if (_hTeamA && !window._pasteForceTeamA) window._pasteForceTeamA = _hTeamA;
      if (_hTeamB && !window._pasteForceTeamB) window._pasteForceTeamB = _hTeamB;
      return;
    }

    // ── 팀 로스터 라인 감지: "팀명 : 멤버1 멤버2 멤버3 ..." (CK 모드 제외) ──
    const _curMode = window._forcedPasteMode || document.getElementById('paste-mode')?.value || '';
    if (_curMode !== 'ck' &&
        !trimmed.includes('🆚') && !trimmed.includes('✅') && !trimmed.includes('❌') && !trimmed.includes('⬜') &&
        !/^[▶►▸]/.test(trimmed) &&
        !/^\d+\s*(?:세트|셋)\s/.test(trimmed)) {
      const rosterM = trimmed.match(/^([^\s:：][^:：]{0,20}?)\s*[：:]\s*(\S+(?:\s+\S+){1,})$/);
      if (rosterM) {
        const tName = rosterM[1].trim();
        const mems = rosterM[2].trim().split(/\s+/).filter(n => n.length > 0 && n.length <= 8);
        if (mems.length >= 2) {
          if (!window._pasteRosterA) {
            window._pasteRosterA = { teamName: tName, members: mems };
            if (!window._pasteForceTeamA) window._pasteForceTeamA = tName;
          } else if (!window._pasteRosterB) {
            window._pasteRosterB = { teamName: tName, members: mems };
            if (!window._pasteForceTeamB) window._pasteForceTeamB = tName;
          }
          return;
        }
      }
    }

    // ── 형식 C 우선 시도: N세트 맵 선수A 누적A:누적B 선수B ──
    const cParsed = parseFormatC(trimmed, formatCScore);
    if (cParsed) {
      // 형식 C 세트 번호 추출 (줄 앞 "N세트/N셋")
      const setNumM = trimmed.match(/^(\d+)\s*(?:세트|셋)/);
      if (setNumM) currentSet = parseInt(setNumM[1]);
      formatCScore = cParsed.nextScore;
      isFormatC = true;
      const wMatch = _pasteResolvePlayer(cParsed.winName);
      const lMatch = _pasteResolvePlayer(cParsed.loseName);
      results.push({
        winName: wMatch.name || cParsed.winName, loseName: lMatch.name || cParsed.loseName, map: cParsed.map,
        setNum: currentSet,
        wPlayer: wMatch.player, lPlayer: lMatch.player,
        wCandidates: wMatch.candidates, lCandidates: lMatch.candidates,
        wSimilar: wMatch.similar||[], lSimilar: lMatch.similar||[],
        lineNum: idx + 1, rawLine: trimmed,
        ...(currentLineDate ? { _lineDate: currentLineDate } : {})
      });
      return;
    }

    // 형식 C 블록이 끝나면 스코어 초기화
    if (isFormatC) { formatCScore = null; isFormatC = false; }

    // 세트 구분선 처리
    const sepResult = parseSetSeparator(trimmed);
    if (sepResult !== null) {
      if (sepResult === 0) currentSet++;
      else currentSet = sepResult;
      // 같은 줄에 경기 결과가 있을 수 있음 (예: "1set ⭕선수A vs 선수B❌")
      const setRem = trimmed.replace(/^\d+\s*(?:세트|셋|set)\s*/i, '').trim();
      if (setRem && setRem !== trimmed) {
        // "1세트 2:2" 같은 형태 지원
        const _m2 = setRem.match(/^(\d+)\s*[：:]\s*([0-9!]+)\s*$/);
        if (_m2) {
          const a = parseInt(_m2[1], 10) || 0;
          const b = parseInt(String(_m2[2] || '').replace(/!/g, '0'), 10) || 0;
          if (window._grpPasteMode) {
            results.push({
              _scoreOnly: true,
              _scoreA: a,
              _scoreB: b,
              setNum: currentSet,
              lineNum: idx + 1,
              rawLine: trimmed,
              ...(currentLineDate ? { _lineDate: currentLineDate } : {}),
              ...(currentRoundLabel ? { _rndLabel: currentRoundLabel } : {})
            });
          } else {
            errors.push({ line: idx + 1, raw: trimmed, reason: '스코어만 입력(예: 2:2)은 대회/세트 붙여넣기에서만 지원됩니다.' });
          }
          return;
        }
        const r2 = parsePasteLine(setRem);
        if (r2) {
          const wM2 = _pasteResolvePlayer(r2.winName);
          const lM2 = _pasteResolvePlayer(r2.loseName);
          results.push({ ...r2, winName: wM2.name || r2.winName, loseName: lM2.name || r2.loseName, _rawMapStr: r2._rawMapStr||'', setNum: currentSet,
            wPlayer: wM2.player, lPlayer: lM2.player,
            wCandidates: wM2.candidates, lCandidates: lM2.candidates,
            wSimilar: wM2.similar||[], lSimilar: lM2.similar||[],
            _leftIsWin: (r2.leftName === r2.winName),
            lineNum: idx+1, rawLine: trimmed,
            ...(currentLineDate ? { _lineDate: currentLineDate } : {}) });
        }
      }
      return;
    }

    // ── 형식 G: 탭 구분 ELO 형식 ──
    // 날짜\t선수1(종족)\t선수2(종족)\t맵\t승(+N)/패(-N)\t유형\t...
    if (trimmed.includes('\t')) {
      const cols = trimmed.split('\t');
      const _tsvDate = cols[0] && /^\d{4}-\d{2}-\d{2}$/.test(cols[0].trim()) ? cols[0].trim() : null;
      const _tsvResult = cols[4] ? cols[4].trim() : '';
      const _tsvIsWin  = _tsvResult.startsWith('승');
      const _tsvIsLose = _tsvResult.startsWith('패');
      if (_tsvDate && cols.length >= 5 && (_tsvIsWin || _tsvIsLose) && cols[1] && cols[2]) {
        // 선수명 추출: "디임(P)" → 디임 / "디임" → 디임
        const _tsvExtract = s => { const m = s.trim().match(/^(.+?)\s*\([TZPN]\)\s*$/i); return m ? m[1].trim() : s.trim(); };
        const _tsvP1 = _tsvExtract(cols[1]);
        const _tsvP2 = _tsvExtract(cols[2]);
        const _tsvMap = cols[3] ? resolveMapName(cols[3].trim()) : '-';
        const winName  = _tsvIsWin  ? _tsvP1 : _tsvP2;
        const loseName = _tsvIsWin  ? _tsvP2 : _tsvP1;
        currentLineDate = _tsvDate;
        const _dateInput = document.getElementById('paste-date');
        if (_dateInput) _dateInput.value = _tsvDate;
        const wM = _pasteResolvePlayer(winName);
        const lM = _pasteResolvePlayer(loseName);
        results.push({ winName: wM.name || winName, loseName: lM.name || loseName, map: _tsvMap, _rawMapStr: cols[3]||'',
          setNum: currentSet,
          wPlayer: wM.player, lPlayer: lM.player,
          wCandidates: wM.candidates, lCandidates: lM.candidates,
          wSimilar: wM.similar||[], lSimilar: lM.similar||[],
          lineNum: idx+1, rawLine: trimmed, _lineDate: _tsvDate });
        return;
      }
    }

    const parsed = parsePasteLine(line);
    if (!parsed) {
      errors.push({ line: idx + 1, raw: trimmed });
      return;
    }
    // ── (추가) 팀전 자동인식 (2:2 / 3:3 / 4:4) ──
    // - 입력 예시: "✅ 영희+철수 vs ❌ 민수+영지수 [폴]" (2v2), "영희+철수+지수 vs 민수+영지+수빈" (3v3)
    // - su_teamMatchSize 설정값 기반으로 팀 규모 자동 인식 (기본값: 1v1이면 2인 팀 이상 모두 허용)
    // - 팀전은 개별 전적/ELO에 반영하지 않고, 해당 매치의 games 표기용으로만 저장
    const _splitTeam = (s) => String(s||'').split(/[,+，]/).map(x=>x.trim()).filter(Boolean);
    const _curPasteMode = window._forcedPasteMode || document.getElementById('paste-mode')?.value || '';
    const _mayTeam =
      ['ck','pro','tt','univm','comp'].includes(_curPasteMode) ||
      // 혼합 모드(규칙 기반 자동 분리)에서도 팀전 라인이 나올 수 있어 허용
      (!!window._pasteForceTeamA || !!window._pasteForceTeamB);
    // su_teamMatchSize 설정에서 팀 인원 수 결정
    // '1v1' → 2인 이상 팀이면 팀전으로 인식(기본), '2v2'→2, '3v3'→3, '4v4'→4
    const _tmSizeSetting = (()=>{ try{ return localStorage.getItem('su_teamMatchSize')||'1v1'; }catch(e){ return '1v1'; } })();
    const _tmSizeNum = _tmSizeSetting === '1v1' ? 0 : parseInt(_tmSizeSetting[0], 10) || 2;
    // _tmSizeNum===0 이면 2~4인 팀 모두 허용, 아니면 정확한 인원 수만 허용

    let _teamLeft = null, _teamRight = null, _teamWin = null, _teamLose = null;
    let _teamOk = false;
    // (버그수정) 좌/우 원본 텍스트 기준으로 승/패 판정을 먼저 고정해둔다.
    // - 이름 축약 입력(예: "소이" → "정소이")이 아래에서 winName이 정식 이름으로
    //   치환되면, leftName(원문 "소이")과 winName(치환된 "정소이")이 달라져
    //   좌측=승 인데도 우측(B팀) 승으로 잘못 인식되는 문제가 있었음.
    let _origLeftIsWin = (parsed.leftName === parsed.winName);
    const _oLeft = parsed.leftName || '';
    const _oRight = parsed.rightName || '';
    const _lParts = _splitTeam(_oLeft);
    const _rParts = _splitTeam(_oRight);
    const _teamSizeMatch = _tmSizeNum === 0
      ? (_lParts.length >= 2 && _lParts.length <= 4 && _lParts.length === _rParts.length)
      : (_lParts.length === _tmSizeNum && _rParts.length === _tmSizeNum);
    if (_mayTeam && _teamSizeMatch) {
      const lMetas = _lParts.map(n => _pasteResolvePlayer(n));
      const rMetas = _rParts.map(n => _pasteResolvePlayer(n));
      const lPlayers = lMetas.map(m => m.player);
      const rPlayers = rMetas.map(m => m.player);
      if (lPlayers.every(Boolean) && rPlayers.every(Boolean)) {
        _teamOk = true;
        _teamLeft  = lPlayers.map(p => p.name);
        _teamRight = rPlayers.map(p => p.name);
        const leftDisp  = _teamLeft.join(',');
        const rightDisp = _teamRight.join(',');
        // win/lose를 left/right 기준으로 다시 구성 (원본 parsed.winName/loseName은 마크 기반)
        const leftIsWin = (parsed.winName === _oLeft) || (parsed.leftName === parsed.winName);
        _origLeftIsWin = leftIsWin;
        _teamWin  = leftIsWin ? _teamLeft  : _teamRight;
        _teamLose = leftIsWin ? _teamRight : _teamLeft;
        parsed.leftName = leftDisp;
        parsed.rightName = rightDisp;
        parsed.winName  = (leftIsWin ? leftDisp : rightDisp);
        parsed.loseName = (leftIsWin ? rightDisp : leftDisp);
        parsed._isTeam = true;
      }
    }
    const wMatch = _teamOk ? { name: parsed.winName, player: { name: parsed.winName }, candidates: [], similar: [] } : _pasteResolvePlayer(parsed.winName);
    const lMatch = _teamOk ? { name: parsed.loseName, player: { name: parsed.loseName }, candidates: [], similar: [] } : _pasteResolvePlayer(parsed.loseName);
    results.push({
      ...parsed,
      winName: wMatch.name || parsed.winName,
      loseName: lMatch.name || parsed.loseName,
      _rawMapStr: parsed._rawMapStr || '',
      setNum: currentSet,
      wPlayer: wMatch.player,
      lPlayer: lMatch.player,
      wCandidates: wMatch.candidates,
      lCandidates: lMatch.candidates,
      wSimilar: wMatch.similar||[],
      lSimilar: lMatch.similar||[],
      _leftIsWin: _origLeftIsWin,
      ...( _teamOk ? { _teamLeft, _teamRight, _teamWin, _teamLose } : {} ),
      lineNum: idx + 1, rawLine: trimmed,
      ...(currentLineDate ? { _lineDate: currentLineDate } : {})
    });
  });

  // 파싱 결과 저장 (기존에 사용자가 선택한 선수 유지)
  if (window._pasteResults) {
    results.forEach((r, i) => {
      const prev = window._pasteResults[i];
      if (!prev) return;
      // 같은 경기인지 확인 (인덱스 오정렬 방지)
      if (prev.winName !== r.winName || prev.loseName !== r.loseName) return;
      // 이미 단일 선수로 확정된 경우(중복 해소됨) → 유지
      // winName/loseName은 덮어쓰지 않음 (leftName 비교에 사용되므로)
      if (prev.wPlayer && prev.wCandidates.length === 1) {
        r.wPlayer     = prev.wPlayer;
        r.wCandidates = [prev.wPlayer];
        r.wSimilar    = [];
      }
      if (prev.lPlayer && prev.lCandidates.length === 1) {
        r.lPlayer     = prev.lPlayer;
        r.lCandidates = [prev.lPlayer];
        r.lSimilar    = [];
      }
    });
  }
  // 파싱 결과가 비었는데 textarea에 내용이 있고 이전 결과가 있으면 인식창 유지
  // (입력 수정 중 인식창이 사라지는 현상 방지)
  if (results.length === 0 && raw.trim()) {
    const prev = window._pasteResults;
    if (prev && prev.length > 0) return; // 이전 결과 그대로 유지 (덮어쓰지 않음)
  }

  window._pasteResults = results;
  window._pasteErrors  = errors;

  renderPastePreview(results, errors);

  // (요청사항) 입력 영역 실시간 하이라이트 (파싱 성공/실패 시각적 피드백)
  try{
    const ta = document.getElementById('paste-input');
    if(ta){
      const savable = (results || []).filter(r => (r.wPlayer && r.lPlayer) || r._scoreOnly);
      const hasAny = (results || []).length > 0;
      const allOk = hasAny && savable.length === (results || []).length;
      const hasErr = (errors || []).length > 0;
      ta.style.transition = 'border-color .18s, box-shadow .18s';
      if(!raw.trim()){
        ta.style.borderColor = 'var(--border2)';
        ta.style.boxShadow = 'none';
      }else if(hasErr || (hasAny && !allOk)){
        ta.style.borderColor = '#ef4444';
        ta.style.boxShadow = '0 0 0 3px rgba(239,68,68,.18)';
      }else if(allOk){
        ta.style.borderColor = '#22c55e';
        ta.style.boxShadow = '0 0 0 3px rgba(34,197,94,.18)';
      }else{
        ta.style.borderColor = 'var(--border2)';
        ta.style.boxShadow = 'none';
      }
    }
  }catch(e){}
}

