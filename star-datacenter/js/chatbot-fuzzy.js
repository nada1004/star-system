function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }
  
  return dp[m][n];
}

function _getChatbotIndex() {
  try{
    const w = window;
    if (!w._chatbotIndex) w._chatbotIndex = {};
    const idx = w._chatbotIndex;
    const list = (typeof players !== 'undefined') ? players : null;
    if (!list) return idx;
    if (idx._playersRef !== list || idx._playersLen !== list.length) {
      const byName = new Map();
      const byLower = new Map();
      list.forEach(p => {
        if (!p || !p.name) return;
        byName.set(p.name, p);
        const ln = String(p.name).toLowerCase();
        if (!byLower.has(ln)) byLower.set(ln, p);
      });
      idx._playersRef = list;
      idx._playersLen = list.length;
      idx.playersByName = byName;
      idx.playersByLowerName = byLower;
      idx._universities = null;
      idx._universitiesKey = null;
    }
    return idx;
  }catch(e){}
  return {};
}

function _getPlayerByName(name) {
  try{
    const idx = _getChatbotIndex();
    if (idx.playersByName && idx.playersByName.get) {
      return idx.playersByName.get(name) || null;
    }
  }catch(e){}
  if (typeof players === 'undefined') return null;
  return players.find(p => p.name === name) || null;
}

function _getUniversities() {
  try{
    const idx = _getChatbotIndex();
    const pLen = (typeof players !== 'undefined' && players) ? players.length : 0;
    const cLen = (typeof univCfg !== 'undefined' && univCfg) ? univCfg.length : 0;
    const key = `${pLen}|${cLen}`;
    if (idx._universities && idx._universitiesKey === key) return idx._universities;
    const playerUnivs = typeof players !== 'undefined' ? players.map(p => p.univ).filter(Boolean) : [];
    const cfgUnivs = typeof univCfg !== 'undefined' ? univCfg.map(u => u && u.name).filter(Boolean) : [];
    idx._universities = [...new Set([...playerUnivs, ...cfgUnivs])];
    idx._universitiesKey = key;
    return idx._universities;
  }catch(e){}
  return [];
}

function findSimilarPlayer(name) {
  if (typeof players === 'undefined') return null;
  
  const lowerName = name.toLowerCase();
  const idx = _getChatbotIndex();
  if (idx.playersByLowerName && idx.playersByLowerName.get) {
    const exact = idx.playersByLowerName.get(lowerName);
    if (exact) return exact;
  }
  let bestMatch = null;
  let bestScore = 0;
  
  players.forEach(player => {
    const lowerPlayerName = player.name.toLowerCase();
    if (lowerPlayerName === lowerName) {
      bestMatch = player;
      bestScore = 100;
      return;
    }
    
    if (lowerPlayerName.includes(lowerName) || lowerName.includes(lowerPlayerName)) {
      if (bestScore < 80) {
        bestMatch = player;
        bestScore = 80;
      }
      return;
    }
    
    const distance = levenshteinDistance(lowerName, lowerPlayerName);
    const maxLen = Math.max(lowerName.length, lowerPlayerName.length);
    const similarity = ((maxLen - distance) / maxLen) * 100;
    
    if (similarity > 60 && similarity > bestScore) {
      bestMatch = player;
      bestScore = similarity;
    }
  });
  
  return bestScore >= 70 ? bestMatch : null;
}

function findSimilarUniversity(input, universities) {
  const inputLower = input.toLowerCase().trim();
  if (!inputLower) return null;

  const _builtinAlias = {
    '흑카': '흑카데미', '흑까': '흑카데미', '흑': '흑카데미',
    '늪': '늪지대', '늪지': '늪지대',
    '무소속': '무소속', '무': '무소속',
    '츠캄': '츠캄몬스타즈', '몬스타즈': '츠캄몬스타즈',
    'jsa': 'JSA',
  };
  const _cfgAliasMap = {};
  try{
    (typeof univCfg !== 'undefined' ? univCfg : []).forEach(function(u){
      if(!u || !u.name) return;
      if(Array.isArray(u.alias)){
        u.alias.forEach(function(a){ _cfgAliasMap[String(a).toLowerCase()] = u.name; });
      }
    });
  }catch(e){}
  const _aliasMap = Object.assign({}, _builtinAlias, _cfgAliasMap);
  if (_aliasMap[inputLower]) return _aliasMap[inputLower];

  if (universities.includes(input)) return input;
  const exactCI = universities.find(u => u.toLowerCase() === inputLower);
  if (exactCI) return exactCI;

  const partialMatch = universities.find(u => u.toLowerCase().includes(inputLower));
  if (partialMatch) return partialMatch;

  const reverseMatch = universities.find(u => inputLower.includes(u.toLowerCase()));
  if (reverseMatch) return reverseMatch;

  const _CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  function _extractCho(str){
    return str.split('').map(function(c){
      const code = c.charCodeAt(0) - 0xAC00;
      if(code < 0 || code > 11171) return c;
      return _CHO[Math.floor(code / 28 / 21)];
    }).join('');
  }
  const inputCho = _extractCho(input);
  const isChoInput = /^[ㄱ-ㅎ]{2,}$/.test(inputCho) && inputCho === input;
  if (isChoInput) {
    const choMatch = universities.find(u => _extractCho(u).startsWith(inputCho));
    if (choMatch) return choMatch;
  }

  let bestMatch = null;
  let bestScore = Infinity;
  universities.forEach(function(u) {
    const score = levenshteinDistance(inputLower, u.toLowerCase());
    // 짧은 입력일수록 허용 오차를 줄여, "hm" 같은 무관한 문자열이
    // 엉뚱한 대학명과 우연히 편집거리 이내로 묶이는 것을 방지
    const maxLen = Math.max(inputLower.length, u.length);
    const allowed = Math.min(3, Math.floor(maxLen * 0.34));
    if (score < bestScore && score <= allowed) {
      bestScore = score;
      bestMatch = u;
    }
  });

  return bestMatch;
}

try{
  window.levenshteinDistance = window.levenshteinDistance || levenshteinDistance;
  window.findSimilarPlayer = window.findSimilarPlayer || findSimilarPlayer;
  window.findSimilarUniversity = window.findSimilarUniversity || findSimilarUniversity;
  window._chatbotGetPlayerByName = window._chatbotGetPlayerByName || _getPlayerByName;
  window._chatbotGetUniversities = window._chatbotGetUniversities || _getUniversities;
}catch(e){}
