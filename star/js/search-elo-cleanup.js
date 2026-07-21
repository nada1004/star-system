function cleanupIndGjDuplicates(){
  if(!confirm('4월 1일부터 현재까지의 개인전/끝장전/프로리그 끝장전 중복 데이터를 제거하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) return;
  
  const _normMap = s => resolveMapName((s||'').trim()) || (s||'').trim();
  const startDate = '2024-04-01';
  const today = new Date().toISOString().slice(0, 10);
  
  let indRemoved = 0;
  let gjRemoved = 0;
  
  // indM 중복 제거 (맵+날짜+선수쌍 비교, 4월1일부터만)
  if(typeof indM!=='undefined' && indM.length){
    const seen = new Set();
    const uniqueInd = [];
    indM.forEach(m => {
      if(!m.wName || !m.lName) return;
      if(m.d < startDate || m.d > today) return; // 날짜 범위 필터
      const key = `${m.d||''}|${_normMap(m.map)}|[${[m.wName,m.lName].sort().join('|')}]`;
      if(seen.has(key)){
        indRemoved++;
      } else {
        seen.add(key);
        uniqueInd.push(m);
      }
    });
    // 전체 배열에서 중복 제거
    const seenAll = new Set();
    const finalInd = [];
    indM.forEach(m => {
      if(!m.wName || !m.lName) {
        finalInd.push(m);
        return;
      }
      const key = `${m.d||''}|${_normMap(m.map)}|[${[m.wName,m.lName].sort().join('|')}]`;
      if(seenAll.has(key)){
        indRemoved++;
      } else {
        seenAll.add(key);
        finalInd.push(m);
      }
    });
    indM.length = 0;
    indM.push(...finalInd);
  }
  
  // gjM 중복 제거 (맵+날짜+선수쌍 비교, 4월1일부터만, 프로리그 끝장전 포함)
  if(typeof gjM!=='undefined' && gjM.length){
    const seenAll = new Set();
    const finalGj = [];
    gjM.forEach(m => {
      if(!m.wName || !m.lName) {
        finalGj.push(m);
        return;
      }
      if(m.d < startDate || m.d > today) return; // 날짜 범위 필터
      const key = `${m.d||''}|${_normMap(m.map)}|[${[m.wName,m.lName].sort().join('|')}]`;
      if(seenAll.has(key)){
        gjRemoved++;
      } else {
        seenAll.add(key);
        finalGj.push(m);
      }
    });
    gjM.length = 0;
    gjM.push(...finalGj);
  }
  
  save();
  render();
  alert(`✅ 중복 제거 완료 (4월 1일 ~ ${today})\n개인전: ${indRemoved}건 제거\n끝장전: ${gjRemoved}건 제거`);
}

function clearAllIndRecords(){
  if(!confirm('개인전 기록 전체를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.\n관련 선수들의 개인 전적 히스토리도 함께 정리됩니다.')) return;

  let indRemoved = 0;

  // indM 전체 삭제
  if(typeof indM!=='undefined' && indM.length){
    indRemoved = indM.length;
    indM.length = 0;
  }

  // 선수들의 개인전 관련 히스토리 정리
  if(typeof players!=='undefined' && players.length){
    players.forEach(p => {
      if(p.history && p.history.length){
        p.history = p.history.filter(h => h.mode !== '개인전');
      }
    });
  }

  save();
  render();
  alert(`✅ 개인전 기록 ${indRemoved}건 삭제 완료`);
}

function recalculateAllELO(){
  if(!confirm('모든 선수의 ELO를 처음부터 다시 계산하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.\n- 모든 ELO가 기본값으로 초기화됩니다\n- 승/패/포인트가 재계산됩니다\n- 모든 기록이 날짜순으로 다시 적용됩니다')) return;

  // 기존 기록 백업
  const backupHistory = {};
  if(typeof players!=='undefined' && players.length){
    players.forEach(p => {
      if(p.history && p.history.length){
        backupHistory[p.name] = [...p.history];
      }
    });
  }

  // 모든 선수 초기화
  if(typeof players!=='undefined' && players.length){
    players.forEach(p => {
      p.elo = ELO_DEFAULT;
      p.win = 0;
      p.loss = 0;
      p.points = 0;
      p.history = [];
    });
  }

  // 모든 경기 기록 수집
  const allGames = [];
  const _splitTeamMembers = (side) => {
    if (Array.isArray(side)) {
      return side.map(x => {
        if (x && typeof x === 'object') {
          const name = String(x.name || '').trim();
          if (!name) return null;
          return { name, univ: String(x.univ || '').trim() };
        }
        const name = String(x || '').trim();
        return name ? { name, univ: '' } : null;
      }).filter(Boolean);
    }
    return String(side || '')
      .split(/[,+，]/)
      .map(x => String(x || '').trim())
      .filter(Boolean)
      .map(name => ({ name, univ: '' }));
  };
  const _buildTeamMembers = (game, side, roster) => {
    const raw = side === 'A'
      ? ((Array.isArray(game?.teamA) && game.teamA.length) ? game.teamA : ((game?.a1 || game?.a2) ? [game.a1, game.a2] : game?.playerA))
      : ((Array.isArray(game?.teamB) && game.teamB.length) ? game.teamB : ((game?.b1 || game?.b2) ? [game.b1, game.b2] : game?.playerB));
    const parsed = _splitTeamMembers(raw);
    if (!parsed.length) return [];
    const rosterMap = new Map((Array.isArray(roster) ? roster : []).map(x => {
      const name = String(x?.name || '').trim();
      return name ? [name, { name, univ: String(x?.univ || '').trim() }] : null;
    }).filter(Boolean));
    return parsed.map(x => rosterMap.get(x.name) || x).filter(x => x && x.name);
  };

  // miniM (미니대전)
  if(typeof miniM!=='undefined' && miniM.length){
    miniM.forEach(m => {
      if(m.a && m.b && m.winner){
        const wName = m.winner === 'A' ? m.a : m.b;
        const lName = m.winner === 'A' ? m.b : m.a;
        allGames.push({wName, lName, date: m.d || '', map: m.map || '-', mode: m.type === 'civil' ? '시빌워' : '미니대전'});
      }
    });
  }

  // univM (대학대전)
  if(typeof univM!=='undefined' && univM.length){
    univM.forEach(m => {
      if(m.a && m.b && m.winner){
        const wName = m.winner === 'A' ? m.a : m.b;
        const lName = m.winner === 'A' ? m.b : m.a;
        allGames.push({wName, lName, date: m.d || '', map: m.map || '-', mode: '대학대전'});
      }
    });
  }

  // ckM (대학CK)
  if(typeof ckM!=='undefined' && ckM.length){
    ckM.forEach(m => {
      if(m.a && m.b && m.winner){
        const wName = m.winner === 'A' ? m.a : m.b;
        const lName = m.winner === 'A' ? m.b : m.a;
        allGames.push({wName, lName, date: m.d || '', map: m.map || '-', mode: '대학CK'});
      }
    });
  }

  // proM (프로리그)
  if(typeof proM!=='undefined' && proM.length){
    proM.forEach(m => {
      (m.sets||[]).forEach((s, si) => {
        (s.games||[]).forEach((g, gi) => {
          const gameId = g._id || `${m._id || 'pro'}_s${si}_g${gi}`;
          if(g._isTeam){
            const teamA = _buildTeamMembers(g, 'A', m.teamAMembers);
            const teamB = _buildTeamMembers(g, 'B', m.teamBMembers);
            if(teamA.length >= 2 && teamB.length >= 2 && g.winner){
              allGames.push({_isTeam:true, teamA, teamB, winner:g.winner, date:m.d || '', map:g.map || '-', mode:'프로리그', matchId:gameId});
            }
          }else if(g.playerA && g.playerB && g.winner){
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            allGames.push({wName, lName, date: m.d || '', map: g.map || '-', mode: '프로리그', matchId: gameId});
          }
        });
      });
    });
  }

  // indM (개인전)
  if(typeof indM!=='undefined' && indM.length){
    indM.forEach(m => {
      if(m.wName && m.lName){
        allGames.push({wName: m.wName, lName: m.lName, date: m.d || '', map: m.map || '-', mode: m._proLabel ? '프로리그' : '개인전'});
      }
    });
  }

  // gjM (끝장전)
  if(typeof gjM!=='undefined' && gjM.length){
    gjM.forEach(m => {
      if(m.wName && m.lName){
        allGames.push({wName: m.wName, lName: m.lName, date: m.d || '', map: m.map || '-', mode: m._proLabel ? '프로리그끝장전' : '끝장전'});
      }
    });
  }

  // ttM (티어대회)
  if(typeof ttM!=='undefined' && ttM.length){
    ttM.forEach(m => {
      (m.sets||[]).forEach((s, si) => {
        (s.games||[]).forEach((g, gi) => {
          const gameId = g._id || `${m._id || 'tt'}_s${si}_g${gi}`;
          if(g._isTeam){
            const teamA = _buildTeamMembers(g, 'A', m.teamAMembers);
            const teamB = _buildTeamMembers(g, 'B', m.teamBMembers);
            if(teamA.length >= 2 && teamB.length >= 2 && g.winner){
              allGames.push({_isTeam:true, teamA, teamB, winner:g.winner, date:m.d || '', map:g.map || '-', mode:'티어대회', matchId:gameId});
            }
          }else if(g.playerA && g.playerB && g.winner){
            const wName = g.winner === 'A' ? g.playerA : g.playerB;
            const lName = g.winner === 'A' ? g.playerB : g.playerA;
            allGames.push({wName, lName, date: m.d || '', map: g.map || '-', mode: '티어대회', matchId: gameId});
          }
        });
      });
    });
  }

  // tourneys (대회)
  if(typeof tourneys!=='undefined' && tourneys.length){
    tourneys.forEach(tn => {
      (tn.groups||[]).forEach(grp => {
        (grp.matches||[]).forEach(m => {
          // 개별 게임이 있는 경우
          let hasGames = false;
          (m.sets||[]).forEach((s, si) => {
            (s.games||[]).forEach((g, gi) => {
              const gameId = g._id || `${m._id || 'grp'}_s${si}_g${gi}`;
              if(g._isTeam){
                const teamA = _buildTeamMembers(g, 'A');
                const teamB = _buildTeamMembers(g, 'B');
                const date = m.d || tn.start || new Date().toISOString().slice(0, 10);
                if(teamA.length >= 2 && teamB.length >= 2 && g.winner){
                  allGames.push({_isTeam:true, teamA, teamB, winner:g.winner, date: date, map: g.map || '-', mode: tn.type === 'tier' ? '티어대회' : '조별리그', matchId: gameId});
                  hasGames = true;
                }
              }else if(g.playerA && g.playerB && g.winner){
                const wName = g.winner === 'A' ? g.playerA : g.playerB;
                const lName = g.winner === 'A' ? g.playerB : g.playerA;
                const date = m.d || tn.start || new Date().toISOString().slice(0, 10);
                // 원본 matchId 보존
                allGames.push({wName, lName, date: date, map: g.map || '-', mode: tn.type === 'tier' ? '티어대회' : '조별리그', matchId: gameId});
                hasGames = true;
              }
            });
          });
          // 개별 게임이 없고 점수만 있는 경우 (팀 단위 결과)
          if(!hasGames && m.sa != null && m.sb != null && m.a && m.b){
            const teamAPlayers = players.filter(p => p.univ === m.a);
            const teamBPlayers = players.filter(p => p.univ === m.b);
            // 각 팀의 랜덤 선수 1명씩 대전으로 처리 (단순화)
            if(teamAPlayers.length > 0 && teamBPlayers.length > 0){
              const wName = m.sa > m.sb ? teamAPlayers[0].name : teamBPlayers[0].name;
              const lName = m.sa > m.sb ? teamBPlayers[0].name : teamAPlayers[0].name;
              const date = m.d || tn.start || new Date().toISOString().slice(0, 10);
              allGames.push({wName, lName, date: date, map: '-', mode: tn.type === 'tier' ? '티어대회' : '조별리그', matchId: m._id || ''});
            }
          }
        });
      });
      Object.values((tn.bracket||{}).matchDetails||{}).forEach(m => {
        let hasGames = false;
        (m.sets||[]).forEach((s, si) => {
          (s.games||[]).forEach((g, gi) => {
            const gameId = g._id || `${m._id || 'bkt'}_s${si}_g${gi}`;
            if(g._isTeam){
              const teamA = _buildTeamMembers(g, 'A');
              const teamB = _buildTeamMembers(g, 'B');
              const date = m.d || tn.start || new Date().toISOString().slice(0, 10);
              if(teamA.length >= 2 && teamB.length >= 2 && g.winner){
                allGames.push({_isTeam:true, teamA, teamB, winner:g.winner, date: date, map: g.map || '-', mode: '토너먼트', matchId: gameId});
                hasGames = true;
              }
            }else if(g.playerA && g.playerB && g.winner){
              const wName = g.winner === 'A' ? g.playerA : g.playerB;
              const lName = g.winner === 'A' ? g.playerB : g.playerA;
              const date = m.d || tn.start || new Date().toISOString().slice(0, 10);
              allGames.push({wName, lName, date: date, map: g.map || '-', mode: '토너먼트', matchId: gameId});
              hasGames = true;
            }
          });
        });
        if(!hasGames && m.sa != null && m.sb != null && m.a && m.b){
          const teamAPlayers = players.filter(p => p.univ === m.a);
          const teamBPlayers = players.filter(p => p.univ === m.b);
          if(teamAPlayers.length > 0 && teamBPlayers.length > 0){
            const wName = m.sa > m.sb ? teamAPlayers[0].name : teamBPlayers[0].name;
            const lName = m.sa > m.sb ? teamBPlayers[0].name : teamAPlayers[0].name;
            const date = m.d || tn.start || new Date().toISOString().slice(0, 10);
            allGames.push({wName, lName, date: date, map: '-', mode: '토너먼트', matchId: m._id || ''});
          }
        }
      });
    });
  }

  // 날짜순 정렬 (오래된 순서)
  allGames.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // applyGameResult로 다시 적용 (중복 제거 안함)
  let appliedCount = 0;
  allGames.forEach(g => {
    if (g._isTeam) {
      if (typeof applyTeamGameResult !== 'function') return;
      const teamA = Array.isArray(g.teamA) ? g.teamA : [];
      const teamB = Array.isArray(g.teamB) ? g.teamB : [];
      if (teamA.length < 2 || teamB.length < 2 || !g.winner) return;
      applyTeamGameResult(teamA, teamB, g.winner, g.date, g.map, g.matchId || '', g.mode);
      appliedCount++;
      return;
    }
    // 팀전(2:2)처럼 "이름1,이름2" 형태는 개별 전적에 반영하지 않음
    const wp = (typeof players!=='undefined' && players) ? players.find(x => x.name === g.wName) : null;
    const lp = (typeof players!=='undefined' && players) ? players.find(x => x.name === g.lName) : null;
    if (!wp || !lp) return;
    applyGameResult(g.wName, g.lName, g.date, g.map, g.matchId || '', '', '', g.mode);
    appliedCount++;
  });

  // 백업에서 처리되지 않은 기록 복구
  let restoredCount = 0;
  Object.entries(backupHistory).forEach(([playerName, history]) => {
    const p = players.find(x => x.name === playerName);
    if(!p) return;
    history.forEach(h => {
      const key = `${h.opp === p.name ? h.opp : p.name}|${h.opp === p.name ? p.name : h.opp}|${h.date}|${h.map}`;
      if(!processedKeys.has(key)){
        // 백업된 기록을 그대로 복구 (ELO는 재계산되지 않음)
        p.history.push(h);
        restoredCount++;
      }
    });
  });

  save();
  render();
  alert(`✅ ELO 재계산 완료\n총 ${appliedCount}경기 재계산\n${restoredCount}건 백업 복구`);
}

