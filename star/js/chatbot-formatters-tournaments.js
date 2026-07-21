try{
  if (!window.tournaments) {
    window.tournaments = [
      {
        name: '2024 스타대학 리그',
        date: '2024-03-15',
        status: '진행중',
        teams: ['츠캄몬스타즈', '케이대', '포스텍', '서울대'],
        bracket: [
          { round: '8강', match1: { team1: '츠캄몬스타즈', team2: '케이대', result: '2-1' }, match2: { team1: '포스텍', team2: '서울대', result: '1-2' } },
          { round: '4강', match1: { team1: '츠캄몬스타즈', team2: '서울대', result: '2-0' } }
        ]
      },
      {
        name: '2024 스타대학 컵',
        date: '2024-06-20',
        status: '예정',
        teams: ['연세대', '고려대', '성균관대', '한양대'],
        bracket: []
      }
    ];
  }
  if (!window.tournamentMatches) {
    window.tournamentMatches = [
      { tournament: '2024 스타대학 리그', date: '2024-03-15', team1: '츠캄몬스타즈', team2: '케이대', result: '2-1', map: 'Cactus Valley' },
      { tournament: '2024 스타대학 리그', date: '2024-03-15', team1: '포스텍', team2: '서울대', result: '1-2', map: 'Terraform' },
      { tournament: '2024 스타대학 리그', date: '2024-03-20', team1: '츠캄몬스타즈', team2: '서울대', result: '2-0', map: 'Neon Violet Square' }
    ];
  }
}catch(e){}

const tournaments = (typeof window !== 'undefined' && window.tournaments) ? window.tournaments : [];
const tournamentMatches = (typeof window !== 'undefined' && window.tournamentMatches) ? window.tournamentMatches : [];

function formatTournamentSchedule() {
  if (tournaments.length === 0) return '❌ 대회 정보가 없습니다.';
  
  let result = `🏆 대회 일정 및 브라켓\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  tournaments.forEach(t => {
    result += `📅 ${t.date} | ${t.name} (${t.status})\n`;
    result += `참가 팀: ${t.teams.join(', ')}\n\n`;
    
    if (t.bracket.length > 0) {
      result += `브라켓:\n`;
      t.bracket.forEach(b => {
        result += `  ${b.round}:\n`;
        Object.keys(b).forEach(key => {
          if (key.startsWith('match')) {
            const m = b[key];
            result += `    ${m.team1} vs ${m.team2} (${m.result})\n`;
          }
        });
      });
      result += '\n';
    }
  });
  
  return result;
}

function formatTournamentList() {
  if (tournaments.length === 0) return '❌ 대회 정보가 없습니다.';
  
  let result = `🏆 대회 목록\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  tournaments.forEach((t, index) => {
    result += `${index + 1}. ${t.name}\n`;
    result += `   📅 ${t.date} | 상태: ${t.status}\n`;
    result += `   참가 팀: ${t.teams.join(', ')}\n\n`;
  });
  
  return result;
}

function formatTournamentInfo(tournamentName) {
  const tournament = tournaments.find(t => t.name.includes(tournamentName) || tournamentName.includes(t.name));
  
  if (!tournament) return `❌ '${tournamentName}' 대회를 찾을 수 없습니다.`;
  
  let result = `🏆 ${tournament.name}\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  result += `📅 일자: ${tournament.date}\n`;
  result += `상태: ${tournament.status}\n`;
  result += `참가 팀: ${tournament.teams.join(', ')}\n\n`;
  
  if (tournament.bracket.length > 0) {
    result += `브라켓:\n`;
    tournament.bracket.forEach(b => {
      result += `  ${b.round}:\n`;
      Object.keys(b).forEach(key => {
        if (key.startsWith('match')) {
          const m = b[key];
          result += `    ${m.team1} vs ${m.team2} (${m.result})\n`;
        }
      });
    });
  }
  
  return result;
}

function formatTeamTournamentRecord(teamName) {
  const teamMatches = tournamentMatches.filter(m => m.team1 === teamName || m.team2 === teamName);
  
  if (teamMatches.length === 0) return `❌ '${teamName}'의 대회 기록이 없습니다.`;
  
  let result = `🏆 ${teamName} 대회 기록\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  
  teamMatches.forEach(m => {
    const opponent = m.team1 === teamName ? m.team2 : m.team1;
    result += `📅 ${m.date} | ${m.tournament}\n`;
    result += `   ${teamName} vs ${opponent} (${m.result}) | ${m.map}\n`;
  });
  
  return result;
}

function formatTournamentStats(tournamentName) {
  const tournament = tournaments.find(t => t.name.includes(tournamentName) || tournamentName.includes(t.name));
  
  if (!tournament) return `❌ '${tournamentName}' 대회를 찾을 수 없습니다.`;
  
  const matches = tournamentMatches.filter(m => m.tournament === tournament.name);
  
  if (matches.length === 0) return `❌ '${tournamentName}' 경기 기록이 없습니다.`;
  
  let result = `📊 ${tournament.name} 통계\n\n`;
  result += `━━━━━━━━━━━━━━━━━━\n`;
  result += `총 경기 수: ${matches.length}경기\n\n`;
  
  const teamStats = {};
  matches.forEach(m => {
    if (!teamStats[m.team1]) teamStats[m.team1] = { wins: 0, losses: 0 };
    if (!teamStats[m.team2]) teamStats[m.team2] = { wins: 0, losses: 0 };
    
    const score1 = parseInt(m.result.split('-')[0]);
    const score2 = parseInt(m.result.split('-')[1]);
    
    if (score1 > score2) {
      teamStats[m.team1].wins++;
      teamStats[m.team2].losses++;
    } else {
      teamStats[m.team1].losses++;
      teamStats[m.team2].wins++;
    }
  });
  
  result += `팀별 승률:\n`;
  Object.keys(teamStats).forEach(team => {
    const total = teamStats[team].wins + teamStats[team].losses;
    const rate = total > 0 ? ((teamStats[team].wins / total) * 100).toFixed(1) : 0;
    result += `  ${team}: ${teamStats[team].wins}승 ${teamStats[team].losses}패 (${rate}%)\n`;
  });
  
  return result;
}

try{
  window.formatTournamentSchedule = formatTournamentSchedule;
  window.formatTournamentList = formatTournamentList;
  window.formatTournamentInfo = formatTournamentInfo;
  window.formatTeamTournamentRecord = formatTeamTournamentRecord;
  window.formatTournamentStats = formatTournamentStats;
}catch(e){}
