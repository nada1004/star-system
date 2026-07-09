function _pasteResolvePlayer(name) {
  const raw = String(name || '').trim();
  if (!raw) return { name: '', player: null, candidates: [], similar: [] };
  try {
    if (typeof window.resolvePlayerName === 'function') {
      const info = window.resolvePlayerName(raw);
      if (info && info.player) {
        return {
          name: info.player.name,
          player: info.player,
          candidates: Array.isArray(info.candidates) && info.candidates.length ? info.candidates : [info.player],
          similar: []
        };
      }
      if (info && Array.isArray(info.candidates) && info.candidates.length) {
        return { name: raw, player: null, candidates: info.candidates, similar: [] };
      }
    }
  } catch (e) {}
  const match = (typeof findPlayerByPartialName === 'function')
    ? findPlayerByPartialName(raw)
    : { player: null, candidates: [], similar: [] };
  return {
    name: match && match.player ? match.player.name : raw,
    player: match ? match.player : null,
    candidates: match && Array.isArray(match.candidates) ? match.candidates : [],
    similar: match && Array.isArray(match.similar) ? match.similar : []
  };
}

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
        errors.push({ lineNum: idx + 1, rawLine: trimmed, reason: '스코어만 입력(예: 2:2)은 대회/세트 붙여넣기에서만 지원됩니다.' });
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

    // ── [N세트] 팀A(score) : 팀B(score) 헤더 처리 ──
    const _setHeaderM = trimmed.match(/^\[(\d+)\s*(?:세트|셋)\]\s*(.+?)\s*[：:]\s*(.+)$/);
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
            errors.push({ lineNum: idx + 1, rawLine: trimmed, reason: '스코어만 입력(예: 2:2)은 대회/세트 붙여넣기에서만 지원됩니다.' });
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

function renderPastePreview(results, errors) {
  const previewEl = document.getElementById('paste-preview');
  const applyBtn  = document.getElementById('paste-apply-btn');
  const badge     = document.getElementById('paste-summary-badge');
  const pendWarn  = document.getElementById('paste-pending-warn');
  if (!previewEl) return;

  const savable  = (results || []).filter(r => (r.wPlayer && r.lPlayer) || r._scoreOnly);
  const ambig    = (results || []).filter(r => !r._scoreOnly).filter(r => (!r.wPlayer && r.wCandidates?.length > 1) || (!r.lPlayer && r.lCandidates?.length > 1));
  const hasSimilar = (r) => (!r.wPlayer && !r.wCandidates?.length && r.wSimilar?.length) || (!r.lPlayer && !r.lCandidates?.length && r.lSimilar?.length);
  const similarRows = (results || []).filter(r => !r._scoreOnly).filter(r => !r.wPlayer || !r.lPlayer).filter(r => hasSimilar(r) && !ambig.includes(r));
  const missing  = (results || []).filter(r => !r._scoreOnly).filter(r => (!r.wPlayer && !r.wCandidates?.length && !r.wSimilar?.length) || (!r.lPlayer && !r.lCandidates?.length && !r.lSimilar?.length));

  // 상단 뱃지
  if (badge) {
    if (results && results.length > 0) {
      badge.style.display = 'inline-block';
      badge.textContent = `✅ ${savable.length}건 저장 가능`;
      if (ambig.length) badge.textContent += ` · ⚠️ ${ambig.length}건 선택 필요`;
      if (similarRows.length) badge.textContent += ` · 🔍 ${similarRows.length}건 유사이름`;
      if (missing.length) badge.textContent += ` · ❌ ${missing.length}건 미등록`;
      badge.style.background = savable.length === results.length ? '#dcfce7' : '#fef9c3';
      badge.style.color      = savable.length === results.length ? '#16a34a' : '#b45309';
      badge.style.border     = `1px solid ${savable.length === results.length ? '#bbf7d0' : '#fcd34d'}`;
    } else {
      badge.style.display = 'none';
    }
  }

  // 하단 경고
  if (pendWarn) pendWarn.style.display = ambig.length ? 'inline' : 'none';

  let html = '';
  let teamAPreview = window._pasteForceTeamA || 'A팀';
  let teamBPreview = window._pasteForceTeamB || 'B팀';

  if (results && results.length > 0) {
    // 맵 목록 (드롭다운용) — 설정 맵 + 약자 전체값 + 이번 파싱에서 인식된 맵 포함
    const parsedMaps = results.map(r => r.map).filter(m => m && m !== '-');
    const allMaps = [...new Set([...maps.filter(m=>m&&m!=='-'), ...parsedMaps])].filter(Boolean).sort();

    // 최대 세트번호 계산 (세트 드롭다운용)
    const maxSet = Math.max(...results.map(r => r.setNum || 1), 3);
    const _matchModePreview = window._pasteMatchMode || 'game';
    // (요청사항) Nada Dark 전용: A/B 카드 UI + 반응형
    const _useCardUI = document.body.classList.contains('design-v2') && document.body.classList.contains('designv2-nada');

    // ── 팀 인식: leftName(A칸)/rightName(B칸) 기준으로 소속 대학 빈도 계산 ──
    const _savableForTeam = results.filter(r => r.wPlayer && r.lPlayer);
    const _univA2 = {}, _univB2 = {};
    _savableForTeam.forEach(r => {
      // A칸=좌측선수, B칸=우측선수 → 좌측이 승자면 ap=wPlayer, 패자면 ap=lPlayer
      const _leftIsWinT = (typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName);
      const ap = _leftIsWinT ? r.wPlayer : r.lPlayer;
      const bp = _leftIsWinT ? r.lPlayer : r.wPlayer;
      const ua = ap?.univ||''; const ub = bp?.univ||'';
      if(ua && ua!=='무소속') _univA2[ua] = (_univA2[ua]||0)+1;
      if(ub && ub!=='무소속') _univB2[ub] = (_univB2[ub]||0)+1;
    });
    const _rA2 = Object.entries(_univA2).sort((a,b)=>b[1]-a[1]);
    const _rB2 = Object.entries(_univB2).sort((a,b)=>b[1]-a[1]);
    let _autoTeamA = _rA2[0]?.[0] || '';
    let _autoTeamB = _rB2[0]?.[0] || '';
    // A팀과 B팀이 같으면 B팀을 다른 대학으로 교정
    if (_autoTeamA && _autoTeamA === _autoTeamB) {
      _autoTeamB = _rB2.find(([u])=>u!==_autoTeamA)?.[0] || _rA2.find(([u])=>u!==_autoTeamA)?.[0] || '';
    }
    const _isCKMode = !!(window._forcedPasteMode === 'ck' || document.getElementById('paste-mode')?.value === 'ck');
    teamAPreview = _isCKMode ? 'A조' : (window._pasteForceTeamA || _autoTeamA || 'A팀');
    teamBPreview = _isCKMode ? 'B조' : (window._pasteForceTeamB || _autoTeamB || 'B팀');
    const _teamALabel = '🔵 ' + teamAPreview;
    const _teamBLabel = '🔴 ' + teamBPreview;

    const _colLabel = _matchModePreview==='set' ? '세트/경기' : '경기';
    if(_useCardUI){
      html += `<div class="pv-wrap">
        <div class="pv-head">
          <div class="pv-head-col pv-meta">${_colLabel}</div>
          <div class="pv-head-col pv-map">맵/메모</div>
          <div class="pv-head-col pv-team pv-a">${_teamALabel}</div>
          <div class="pv-head-col pv-team pv-b">${_teamBLabel}</div>
        </div>
        <div class="pv-cards">`;
    }else{
      html += `<div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:10px">`;
      html += `<table style="margin:0;width:100%;font-size:12px"><thead><tr>
        <th style="text-align:left;padding:6px 8px;font-size:11px;width:86px">${_colLabel}</th>
        <th style="text-align:left;padding:6px 8px;font-size:11px;width:90px">맵</th>
        <th style="text-align:left;padding:6px 8px;font-size:11px">${_teamALabel}</th>
        <th style="text-align:left;padding:6px 8px;font-size:11px">${_teamBLabel}</th>
        <th style="text-align:left;padding:6px 8px;font-size:11px;width:70px">상태</th>
        <th style="text-align:center;padding:6px 8px;font-size:11px;width:52px">관리</th>
      </tr></thead><tbody>`;
    }

    // 날짜 구분선 표시: ind/gj 모드에서 _lineDate가 있는 경우 날짜별 구분선 추가
    const _pasteMode = window._forcedPasteMode || document.getElementById('paste-mode')?.value || '';
    const _showDateSep = ['ind','gj'].includes(_pasteMode) && results.some(r => r._lineDate);
    let _prevRowDate = null;

    results.forEach((r, i) => {
      // 스코어만 입력 (예: 2:2)
      if (r._scoreOnly) {
        const sA = r._scoreA ?? 0;
        const sB = r._scoreB ?? 0;
        if(_useCardUI){
          html += `<div class="pv-card pv-score">
            <div class="pv-top">
              <div class="pv-meta"><span class="pv-game">${_matchModePreview==='set' ? `${r.setNum||1}세트` : '스코어'}</span></div>
              <div class="pv-map"><span class="pv-map-txt">스코어</span></div>
              <div class="pv-status"><span class="pv-ok">✅</span></div>
            </div>
            <div class="pv-sides">
              <div class="pv-side pv-a"><span class="pv-score-a">${sA}</span></div>
              <div class="pv-side pv-b"><span class="pv-score-b">${sB}</span></div>
            </div>
          </div>`;
        }else{
          html += `<tr style="border-top:1px solid var(--border);background:#f8fafc">
            <td style="padding:8px 8px;font-weight:900;white-space:nowrap">${_matchModePreview==='set' ? `${r.setNum||1}세트` : '스코어'}</td>
            <td style="padding:8px 8px;color:var(--gray-l);white-space:nowrap">스코어</td>
            <td style="padding:8px 8px;font-weight:1000;color:#2563eb">${sA}</td>
            <td style="padding:8px 8px;font-weight:1000;color:#dc2626">${sB}</td>
            <td style="padding:8px 8px;white-space:nowrap"><span style="font-weight:900;color:#16a34a">✅</span></td>
            <td style="padding:8px 8px;text-align:center;color:var(--gray-l)">-</td>
          </tr>`;
        }
        return;
      }
      const wOk    = !!r.wPlayer;
      const lOk    = !!r.lPlayer;
      const wAmbig = !wOk && r.wCandidates?.length > 1;
      const lAmbig = !lOk && r.lCandidates?.length > 1;
      const ok     = wOk && lOk;

      const wDisplayName = r.winName;
      const lDisplayName = r.loseName;

      // ── 선수 셀 빌더 ──
      const buildCell = (isWin, displayName, displayRace, resolved, isAmbig, candidates, similar, role) => {
        const style = resolved ? (isWin ? 'color:#ea580c;font-weight:700' : 'color:#dc2626;font-weight:700') : 'color:#b45309;font-weight:700';
        const raceHtml = displayRace ? `<span style="font-size:10px;color:var(--gray-l);font-weight:800;margin-left:3px">(${displayRace})</span>` : '';
        let cell = `<span style="${style}">${displayName}${raceHtml}</span>`;
        if (resolved) {
          const p = isWin ? r.wPlayer : r.lPlayer;
          // 실제 선수 이름과 입력 이름이 다를 때 실제 선수 이름 표시
          if (p?.name && p.name !== displayName) {
            cell += ` <span style="font-size:10px;color:#16a34a;font-weight:600;margin-left:4px">→ ${p.name}</span>`;
          }
          if (p?.univ) cell += `<span style="font-size:10px;color:var(--gray-l);margin-left:4px">(${p.univ})</span>`;
        } else if (isAmbig) {
          cell += `<div style="margin-top:3px;display:flex;flex-wrap:wrap;gap:3px;align-items:center">
            <span style="font-size:10px;color:#b45309;font-weight:600">선택:</span>` +
            candidates.map(c =>
              `<button class="paste-pick-btn" data-idx="${i}" data-role="${role}" data-name="${c.name.replace(/"/g,'&quot;')}"
                style="padding:3px 9px;border-radius:5px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;font-size:11px;font-weight:700;cursor:pointer;transition:.12s"
                onmouseover="this.style.background='#fef3c7'" onmouseout="this.style.background='#fffbeb'">
                ${c.name}${c.univ?`<span style="font-size:9px;opacity:.7;margin-left:2px">(${c.univ})</span>`:''}</button>`
            ).join('') + `</div>`;
        } else {
          // 미등록: 유사 이름 제안 + +등록 버튼
          const safeName = displayName.replace(/"/g,'&quot;');
          // 유사 이름 후보가 있으면 제안 버튼 표시
          if (similar && similar.length > 0) {
            cell += `<div style="margin-top:3px;display:flex;flex-wrap:wrap;gap:3px;align-items:center">
              <span style="font-size:10px;color:#7c3aed;font-weight:700">혹시:</span>` +
              similar.map(c =>
                `<button class="paste-pick-btn" data-idx="${i}" data-role="${role}" data-name="${c.name.replace(/"/g,'&quot;')}"
                  style="padding:3px 9px;border-radius:5px;border:1.5px solid #c4b5fd;background:#faf5ff;color:#6d28d9;font-size:11px;font-weight:700;cursor:pointer;transition:.12s"
                  onmouseover="this.style.background='#ede9fe'" onmouseout="this.style.background='#faf5ff'"
                  title="${c.univ||''}">
                  ${c.name}${c.univ?`<span style="font-size:9px;opacity:.7;margin-left:2px">(${c.univ})</span>`:''}</button>`
              ).join('') +
              `<button class="paste-reg-btn" data-idx="${i}" data-role="${role}" data-name="${safeName}"
                style="padding:2px 7px;border-radius:4px;border:1px solid #86efac;background:#f0fdf4;color:#16a34a;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;transition:.12s"
                onmouseover="this.style.background='#dcfce7'" onmouseout="this.style.background='#f0fdf4'">+등록</button>
              </div>`;
          } else {
            cell += `<button class="paste-reg-btn" data-idx="${i}" data-role="${role}" data-name="${safeName}"
              style="margin-left:5px;padding:2px 7px;border-radius:4px;border:1px solid #86efac;background:#f0fdf4;color:#16a34a;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;transition:.12s"
              onmouseover="this.style.background='#dcfce7'" onmouseout="this.style.background='#f0fdf4'">+등록</button>`;
          }
        }
        return cell;
      };

      // A칸/B칸 배정: 로스터 있으면 로스터 소속 기반, 없으면 leftName 텍스트 위치 기반
      const _rosterA = window._pasteRosterA;
      const _rosterB = window._pasteRosterB;
      const _isRosterMode = !!(_rosterA && _rosterB);
      const _inRA = (nm) => _rosterA?.members.some(m => m===nm || (nm&&nm.includes(m)) || (m&&m.includes(nm)));
      const _inRB = (nm) => _rosterB?.members.some(m => m===nm || (nm&&nm.includes(m)) || (m&&m.includes(nm)));
      const _isCKPreview = _isCKMode;
      let aPlayer, bPlayer, aIsWin;
      let aOk, aName, aAmbig, aCands, aSim, aRole;
      let bOk, bName, bAmbig, bCands, bSim, bRole;
      if (_isRosterMode && !_isCKPreview) {
        // 승자(winName)가 rosterA 소속이면 A칸=승자, rosterB면 A칸=패자
        const _wInA = _inRA(r.winName), _wInB = _inRB(r.winName);
        aIsWin  = _wInA ? true : _wInB ? false : ((typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName));
        aPlayer = aIsWin ? r.wPlayer : r.lPlayer;
        bPlayer = aIsWin ? r.lPlayer : r.wPlayer;
        aOk     = !!aPlayer;
        bOk     = !!bPlayer;
        aName   = aPlayer ? aPlayer.name : (aIsWin ? r.winName : r.loseName);
        bName   = bPlayer ? bPlayer.name : (aIsWin ? r.loseName : r.winName);
        aAmbig  = !aOk && (aIsWin ? wAmbig : lAmbig);
        bAmbig  = !bOk && (aIsWin ? lAmbig : wAmbig);
        aCands  = aIsWin ? (r.wCandidates||[]) : (r.lCandidates||[]);
        bCands  = aIsWin ? (r.lCandidates||[]) : (r.wCandidates||[]);
        aSim    = aIsWin ? (r.wSimilar||[]) : (r.lSimilar||[]);
        bSim    = aIsWin ? (r.lSimilar||[]) : (r.wSimilar||[]);
        aRole   = aIsWin ? 'w' : 'l';
        bRole   = aIsWin ? 'l' : 'w';
      } else {
        // 기존 방식: leftName(텍스트 왼쪽)=A칸, rightName(텍스트 오른쪽)=B칸
        // wPlayer=항상승자, lPlayer=항상패자 → _leftIsWin에 따라 직접 배정
        const _leftRaw  = r.leftName  || r.winName  || '';
        const _rightRaw = r.rightName || r.loseName || '';
        const _leftIsWin = (typeof r._leftIsWin === 'boolean') ? r._leftIsWin : (_leftRaw === r.winName);
        // 선수 DB 소속으로 A/B 배정 우선 시도 (자동 팀 인식된 경우, CK 모드 제외)
        let _univBased = false;
        if (!_isCKPreview && r.wPlayer?.univ && r.wPlayer.univ !== '무소속' &&
            r.lPlayer?.univ && r.lPlayer.univ !== '무소속' &&
            teamAPreview && teamAPreview !== 'A팀' && teamAPreview !== 'A조' &&
            teamBPreview && teamBPreview !== 'B팀' && teamBPreview !== 'B조') {
          const _wInA = r.wPlayer.univ === teamAPreview;
          const _lInA = r.lPlayer.univ === teamAPreview;
          if (_wInA || _lInA) { aIsWin = _wInA; _univBased = true; }
        }
        if (!_univBased) aIsWin = _leftIsWin;
        aPlayer = aIsWin ? (wOk ? r.wPlayer : null) : (lOk ? r.lPlayer : null);
        bPlayer = aIsWin ? (lOk ? r.lPlayer : null) : (wOk ? r.wPlayer : null);
        aOk     = aIsWin ? wOk : lOk;
        bOk     = aIsWin ? lOk : wOk;
        aName   = aPlayer ? aPlayer.name : (aIsWin ? r.winName : r.loseName);
        bName   = bPlayer ? bPlayer.name : (aIsWin ? r.loseName : r.winName);
        aAmbig  = !aOk && (aIsWin ? wAmbig : lAmbig);
        bAmbig  = !bOk && (!aIsWin ? wAmbig : lAmbig);
        aCands  = aIsWin ? (r.wCandidates||[]) : (r.lCandidates||[]);
        bCands  = !aIsWin ? (r.wCandidates||[]) : (r.lCandidates||[]);
        aSim    = aIsWin ? (r.wSimilar||[]) : (r.lSimilar||[]);
        bSim    = !aIsWin ? (r.wSimilar||[]) : (r.lSimilar||[]);
        aRole   = aIsWin ? 'w' : 'l';
        bRole   = aIsWin ? 'l' : 'w';
      }
      const bIsWin = !aIsWin;
      const aWon   = aIsWin;
      const _eqNS = (x,y)=>String(x||'').replace(/\s+/g,'')===String(y||'').replace(/\s+/g,'');
      const _aRace = _eqNS(aName, r.leftName) ? (r.leftRace||'') : _eqNS(aName, r.rightName) ? (r.rightRace||'') : '';
      const _bRace = _eqNS(bName, r.rightName) ? (r.rightRace||'') : _eqNS(bName, r.leftName) ? (r.leftRace||'') : '';
      const aCell  = buildCell(aIsWin, aName, _aRace, aOk, aAmbig, aCands, aSim, aRole);
      const bCell  = buildCell(bIsWin, bName, _bRace, bOk, bAmbig, bCands, bSim, bRole);
      // A팀/B팀 결과 뱃지 (클릭으로 승패 반전, 선수 위치는 고정)
      const _winBadge  = (idx) => `<button class="paste-flip-btn" data-idx="${idx}" style="background:#2563eb;color:#fff;font-size:9px;font-weight:900;padding:1px 6px;border-radius:4px;margin-left:4px;vertical-align:middle;border:none;cursor:pointer">이겼다</button>`;
      const _loseBadge = (idx) => `<button class="paste-flip-btn" data-idx="${idx}" style="background:#dc2626;color:#fff;font-size:9px;font-weight:900;padding:1px 6px;border-radius:4px;margin-left:4px;vertical-align:middle;border:none;cursor:pointer">졌다</button>`;
      const aResultBadge = ok ? (aWon ? _winBadge(i) : _loseBadge(i)) : '';
      const bResultBadge = ok ? (!aWon ? _winBadge(i) : _loseBadge(i)) : '';
      const wSim = !wOk && !wAmbig && (r.wSimilar||[]).length > 0;
      const lSim = !lOk && !lAmbig && (r.lSimilar||[]).length > 0;
      const statusBadge = ok
        ? `<span style="background:#dcfce7;color:#16a34a;border:1px solid #bbf7d0;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;white-space:nowrap">저장가능</span>`
        : (wAmbig || lAmbig)
          ? `<span style="background:#fef9c3;color:#b45309;border:1px solid #fcd34d;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;white-space:nowrap">선택필요</span>`
          : (wSim || lSim)
            ? `<span style="background:#faf5ff;color:#6d28d9;border:1px solid #c4b5fd;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;white-space:nowrap">유사이름</span>`
            : `<span style="background:#fee2e2;color:#dc2626;border:1px solid #fecaca;font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;white-space:nowrap">미등록</span>`;

      // ── 경기/세트 표시 ──
      const gn = r.gameNum || r.game || r.gameNo || null;
      const gameTag = `<span style="font-size:11px;font-weight:900;color:var(--text3);white-space:nowrap">${(gn|| (i+1))}경기</span>`;
      let setCell = '';
      if(_matchModePreview==='set'){
        // 세트 드롭다운 + 경기번호
        const setOpts = Array.from({length: Math.max(maxSet, r.setNum||1)}, (_,k) => k+1)
          .map(n => `<option value="${n}" ${(r.setNum||1)===n?'selected':''}>${n}세트</option>`).join('');
        const setSel = `<select class="paste-set-sel" data-idx="${i}"
          style="font-size:11px;font-weight:700;border:1px solid var(--border2);border-radius:5px;padding:2px 4px;color:${(r.setNum||1)>=3?'#7c3aed':'var(--blue)'};background:var(--white);cursor:pointer;max-width:72px"
          onchange="pasteChangeSet(${i},parseInt(this.value))">${setOpts}</select>`;
        setCell = `<div style="display:flex;flex-direction:column;gap:2px">${setSel}<span style="font-size:10px;color:var(--gray-l);font-weight:800">${(gn|| (i+1))}경기</span></div>`;
      } else {
        // 경기 방식: 경기번호만 표시
        setCell = gameTag;
      }

      // ── 맵 드롭다운 ──
      const mapVal = r.map && r.map !== '-' ? r.map : '';
      const mapOpts = `<option value="">-</option>` +
        allMaps.map(m => `<option value="${m}" ${mapVal===m?'selected':''}>${m}</option>`).join('');
      const mapCell = `<select class="paste-map-sel" data-idx="${i}"
        style="font-size:11px;border:1px solid ${mapVal?'#7dd3fc':'var(--border2)'};border-radius:5px;padding:2px 4px;background:${mapVal?'#e0f2fe':'var(--white)'};color:${mapVal?'#0369a1':'var(--gray-l)'};cursor:pointer;max-width:88px"
        onchange="pasteChangeMap(${i},this.value)">${mapOpts}</select>`;


      // ── 행 삭제 버튼 ──
      const delBtn = `<button class="paste-del-btn" data-idx="${i}" title="이 행 삭제"
        style="padding:2px 6px;border-radius:4px;border:1px solid #fecaca;background:#fff5f5;font-size:12px;cursor:pointer;transition:.12s;line-height:1.4"
        onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='#fff5f5'">🗑</button>`;

      const _hasSim = wSim||lSim;
      // 날짜 구분선
      if (_showDateSep) {
        const _rowDate = r._lineDate || null;
        if (_rowDate !== _prevRowDate) {
          _prevRowDate = _rowDate;
          if (_rowDate) {
            if(_useCardUI){
              html += `<div class="pv-date">📅 ${_rowDate} <span class="pv-date-sub">이후 경기 날짜</span></div>`;
            }else{
              html += `<tr><td colspan="6" style="padding:4px 8px;background:#eff6ff;border-top:2px solid #bfdbfe;border-bottom:1px solid #bfdbfe">
                <span style="font-size:11px;font-weight:700;color:#1d4ed8">📅 ${_rowDate}</span>
                <span style="font-size:10px;color:#6b7280;margin-left:6px">이후 경기 날짜</span>
              </td></tr>`;
            }
          }
        }
      }
      const _memoTag = r._lineMemo ? `<div style="font-size:10px;color:#6b7280;margin-top:2px">📝 ${r._lineMemo.replace(/</g,'&lt;')}</div>` : '';
      const _normTag = (() => {
        try{
          if(!r.leftName || !r.rightName || !r.map || r.map==='-') return '';
          const lr = r.leftRace ? `(${r.leftRace})` : '';
          const rr = r.rightRace ? `(${r.rightRace})` : '';
          const lm = r.leftMark || '';
          const rm = r.rightMark || '';
          // 요청 포맷: 요시(P) ⬜ 🆚️ ✅ 김세주(T) [폴리포이드]
          const s = `${r.leftName}${lr} ${lm} 🆚️ ${rm} ${r.rightName}${rr} [${r.map}]`.trim();
          return `<div style="font-size:10px;color:var(--text3);margin-top:3px;line-height:1.25">인식: ${s}</div>`;
        }catch(e){ return ''; }
      })();
      const _typeBadge = r._lineType ? ({
        mini: '<span style="background:#f5f3ff;color:#7c3aed;border:1px solid #ddd6fe;font-size:10px;font-weight:700;padding:1px 5px;border-radius:8px;margin-left:4px">미니</span>',
        gj:   '<span style="background:#fff7ed;color:#ea580c;border:1px solid #fed7aa;font-size:10px;font-weight:700;padding:1px 5px;border-radius:8px;margin-left:4px">끝장전</span>',
        ind:  '<span style="background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;font-size:10px;font-weight:700;padding:1px 5px;border-radius:8px;margin-left:4px">개인전</span>',
      }[r._lineType] || '') : '';
      if(_useCardUI){
        const bg = ok ? 'ok' : (wAmbig||lAmbig) ? 'ambig' : _hasSim ? 'sim' : 'bad';
        html += `<div class="pv-card pv-${bg}">
          <div class="pv-top">
            <div class="pv-meta">${setCell}${_typeBadge}</div>
            <div class="pv-map">${mapCell}${_memoTag}${_normTag}</div>
            <div class="pv-status">${statusBadge}${delBtn}</div>
          </div>
          <div class="pv-sides">
            <div class="pv-side pv-a">${aCell}${aResultBadge}</div>
            <div class="pv-side pv-b">${bCell}${bResultBadge}</div>
          </div>
        </div>`;
      }else{
        html += `<tr style="background:${ok ? '' : wAmbig||lAmbig ? '#fffbeb' : _hasSim ? '#fdf4ff' : '#fff5f5'}">
          <td style="padding:4px 6px">${setCell}${_typeBadge}</td>
          <td style="padding:4px 6px">${mapCell}${_memoTag}${_normTag}</td>
          <td style="padding:4px 8px">${aCell}${aResultBadge}</td>
          <td style="padding:4px 8px">${bCell}${bResultBadge}</td>
          <td style="padding:4px 6px">${statusBadge}</td>
          <td style="padding:4px 6px;text-align:center">${delBtn}</td>
        </tr>`;
      }
    });
    html += _useCardUI ? `</div></div>` : `</tbody></table></div>`;

    // ── 세트 결과 요약 미리보기 ──
    // 로스터 기반이면 소속으로, 없으면 leftName 기준으로 A/B 판단
    const _sprRA = window._pasteRosterA, _sprRB = window._pasteRosterB;
    const _sprInA = (nm) => _sprRA?.members.some(m => m===nm || (nm&&nm.includes(m)) || (m&&m.includes(nm)));
    const _sprInB = (nm) => _sprRB?.members.some(m => m===nm || (nm&&nm.includes(m)) || (m&&m.includes(nm)));
    const setPreviewMap = {};
    savable.forEach(r => {
      const sn = r.setNum || 1;
      if(!setPreviewMap[sn]) setPreviewMap[sn] = {A:0, B:0};
      let aWins;
      if (_isCKMode) {
        aWins = ((typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName));
      } else if (_sprRA && _sprRB) {
        aWins = !!_sprInA(r.winName);
        if (!aWins && !_sprInB(r.winName)) aWins = ((typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName));
      } else if (!_isCKMode && r.wPlayer?.univ && r.wPlayer.univ !== '무소속' &&
                 r.lPlayer?.univ && r.lPlayer.univ !== '무소속' &&
                 teamAPreview && teamAPreview !== 'A팀' && teamAPreview !== 'A조' &&
                 teamBPreview && teamBPreview !== 'B팀' && teamBPreview !== 'B조' &&
                 (r.wPlayer.univ === teamAPreview || r.wPlayer.univ === teamBPreview) &&
                 (r.lPlayer.univ === teamAPreview || r.lPlayer.univ === teamBPreview) &&
                 r.wPlayer.univ !== r.lPlayer.univ) {
        // 승자/패자 소속이 정확히 A팀/B팀 둘 중 하나씩일 때만 소속 기준으로 판단
        // (소속이 A/B 어느쪽과도 다른 제3의 소속이면 오분류 방지 → 좌우 위치 기준으로 폴백)
        aWins = r.wPlayer.univ === teamAPreview;
      } else {
        aWins = ((typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName));
      }
      setPreviewMap[sn][aWins ? 'A' : 'B']++;
    });
    const multiSetPreview = Object.keys(setPreviewMap).length > 1;
    let setScoreA = 0, setScoreB = 0;
    const setRows = Object.keys(setPreviewMap).sort((a,b)=>a-b).map(sn => {
      const s = setPreviewMap[sn];
      const sw = s.A > s.B ? 'A' : s.B > s.A ? 'B' : '';
      if(sw === 'A') setScoreA++; else if(sw === 'B') setScoreB++;
      const acol = sw==='A' ? '#16a34a' : s.A>0 ? '#64748b' : '#9ca3af';
      const bcol = sw==='B' ? '#16a34a' : s.B>0 ? '#64748b' : '#9ca3af';
      return `<span style="display:inline-flex;align-items:center;gap:4px;background:${sw?'#f0fdf4':'#f8fafc'};border:1px solid ${sw?'#86efac':'#e2e8f0'};border-radius:8px;padding:3px 10px;font-size:12px">
        <span style="font-size:10px;color:var(--gray-l);font-weight:600">${sn}세트</span>
        <span style="font-weight:800;color:${acol}">${s.A}</span>
        <span style="color:var(--gray-l)">:</span>
        <span style="font-weight:800;color:${bcol}">${s.B}</span>
        ${sw?`<span style="font-size:10px;font-weight:700;color:#16a34a">${sw==='A'?'A팀':'B팀'} ✓</span>`:''}
      </span>`;
    }).join('');

    if(savable.length > 0) {
      const _useSetScore = _matchModePreview === 'set' || multiSetPreview;
      // A/B팀 게임 승리 수
      let teamAWins = 0, teamBWins = 0;
      savable.forEach(r => {
        let aW;
        if (_isCKMode) {
          aW = ((typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName));
        } else if (_sprRA && _sprRB) {
          aW = !!_sprInA(r.winName);
          if (!aW && !_sprInB(r.winName)) aW = ((typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName));
        } else if (r.wPlayer?.univ && r.wPlayer.univ !== '무소속' &&
                   r.lPlayer?.univ && r.lPlayer.univ !== '무소속' &&
                   teamAPreview && teamAPreview !== 'A팀' && teamAPreview !== 'A조' &&
                   teamBPreview && teamBPreview !== 'B팀' && teamBPreview !== 'B조' &&
                   (r.wPlayer.univ === teamAPreview || r.wPlayer.univ === teamBPreview) &&
                   (r.lPlayer.univ === teamAPreview || r.lPlayer.univ === teamBPreview) &&
                   r.wPlayer.univ !== r.lPlayer.univ) {
          // 승자/패자 소속이 정확히 A팀/B팀 둘 중 하나씩일 때만 소속 기준으로 판단
          // (소속이 A/B 어느쪽과도 다른 제3의 소속이면 오분류 방지 → 좌우 위치 기준으로 폴백)
          aW = r.wPlayer.univ === teamAPreview;
        } else {
          aW = ((typeof r._leftIsWin==='boolean' ? r._leftIsWin : (r.leftName||r.winName) === r.winName));
        }
        aW ? teamAWins++ : teamBWins++;
      });
      const totalA = _useSetScore ? setScoreA : teamAWins;
      const totalB = _useSetScore ? setScoreB : teamBWins;
      const _dA='A팀';
      const _dB='B팀';
      const winner = totalA > totalB ? _dA : totalB > totalA ? _dB : '무승부';
      html += `<div style="margin-top:8px;padding:10px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px">
        <div style="font-size:11px;font-weight:700;color:var(--text3);margin-bottom:6px">📊 현재 결과 미리보기 ${multiSetPreview?'(세트제)':'(개인전)'}</div>
        ${multiSetPreview ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">${setRows}</div>` : ''}
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-weight:800;font-size:14px;color:${totalA>totalB?'#2563eb':'#64748b'}">${_dA}</span>
          <span style="font-family:'Noto Sans KR',sans-serif;font-weight:900;font-size:20px">
            <span style="color:${totalA>totalB?'#16a34a':'#dc2626'}">${totalA}</span>
            <span style="color:var(--gray-l);font-size:14px"> : </span>
            <span style="color:${totalB>totalA?'#16a34a':'#dc2626'}">${totalB}</span>
          </span>
          <span style="font-weight:800;font-size:14px;color:${totalB>totalA?'#dc2626':'#64748b'}">${_dB}</span>
          <span style="font-size:12px;font-weight:700;padding:2px 10px;border-radius:12px;background:${winner==='무승부'?'#f1f5f9':'#dcfce7'};color:${winner==='무승부'?'#64748b':'#15803d'}">
            ${winner==='무승부'?'🤝 무승부':'🏆 '+winner+' 승'}
          </span>
        </div>
      </div>`;
    }
  }

  if (errors && errors.length > 0) {
    html += `<div style="background:#fff5f5;border:1.5px solid #fca5a5;border-radius:8px;padding:10px 12px;margin-top:6px">
      <div style="font-size:12px;font-weight:700;color:#dc2626;margin-bottom:6px">⛔ 인식 실패 ${errors.length}줄 — 저장되지 않습니다</div>
      ${errors.map(e => `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span style="flex-shrink:0;font-size:10px;font-weight:700;background:#fecaca;color:#dc2626;padding:1px 6px;border-radius:4px">${e.line}행</span>
        <code style="font-size:10px;color:#991b1b;background:#fff1f2;padding:2px 7px;border-radius:4px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${e.raw.replace(/"/g,'&quot;')}">${e.raw.slice(0,90)}${e.raw.length>90?'…':''}</code>
      </div>`).join('')}
    </div>`;
  }

  if (applyBtn) {
    applyBtn.style.display = results && results.length > 0 ? 'inline-flex' : 'none';
    applyBtn.textContent = `✅ ${savable.length}건 저장하기`;
  }

  // 팀 스왑 UI 업데이트 (이미 위에서 계산한 teamAPreview/teamBPreview 재사용)
  const swapRow = document.getElementById('paste-team-swap-row');
  const teamALbl = document.getElementById('paste-team-a-label');
  const teamBLbl = document.getElementById('paste-team-b-label');
  if(swapRow && teamALbl && teamBLbl && savable.length > 0) {
    teamALbl.textContent = teamAPreview && teamAPreview !== 'A팀' ? '🔵 ' + teamAPreview : '🔵 A팀';
    teamBLbl.textContent = teamBPreview && teamBPreview !== 'B팀' ? '🔴 ' + teamBPreview : '🔴 B팀';
    swapRow.style.display = 'flex';
    window._previewTeamA = teamAPreview;
    window._previewTeamB = teamBPreview;
  } else if(swapRow) {
    swapRow.style.display = 'none';
  }

  previewEl.innerHTML = html;

  // ── 이벤트 등록 ──

  // 중복 선택 버튼
  previewEl.querySelectorAll('.paste-pick-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      pasteSelectPlayer(parseInt(this.dataset.idx), this.dataset.role, this.dataset.name);
    });
  });

  // 미등록 선수 +등록 버튼
  previewEl.querySelectorAll('.paste-reg-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      pasteQuickRegister(parseInt(this.dataset.idx), this.dataset.role, this.dataset.name);
    });
  });

  // 승패 반전 버튼
  previewEl.querySelectorAll('.paste-flip-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      pasteFlipResult(parseInt(this.dataset.idx));
    });
  });

  // 행 삭제 버튼
  previewEl.querySelectorAll('.paste-del-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      pasteDeleteRow(parseInt(this.dataset.idx));
    });
  });

}

// ── 승패 반전 ──
