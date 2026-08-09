function isValidAppYear(year){
  return /^(19|20)\d{2}$/.test(String(year||''));
}

function extractValidYearsFromMatches(matches, dateKey='d'){
  const arr = Array.isArray(matches) ? matches : [];
  const years = new Set();
  arr.forEach(m=>{
    const y = String((m && m[dateKey]) || '').slice(0,4);
    if(isValidAppYear(y)) years.add(y);
  });
  return [...years].sort();
}

function mergeValidYearsIntoOptions(targetOptions, matches, dateKey='d'){
  const target = Array.isArray(targetOptions) ? targetOptions : [];
  extractValidYearsFromMatches(matches, dateKey).forEach(y=>{
    if(!target.includes(y)) target.push(y);
  });
  target.sort();
  return target;
}

try{
  window.isValidAppYear = isValidAppYear;
  window.extractValidYearsFromMatches = extractValidYearsFromMatches;
  window.mergeValidYearsIntoOptions = mergeValidYearsIntoOptions;
}catch(e){}
