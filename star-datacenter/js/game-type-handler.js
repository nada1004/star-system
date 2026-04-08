// Game type handler for streamer registration
function toggleGameFields() {
  const gameType = document.getElementById('p-game-type').value;
  const raceField = document.getElementById('p-race');
  const tierField = document.getElementById('p-tier');
  const crewField = document.getElementById('p-crew');
  const univField = document.getElementById('p-univ');
  const raceLabel = raceField.previousElementSibling;
  const tierLabel = tierField.previousElementSibling;
  const crewLabel = crewField.previousElementSibling;
  const univLabel = univField.previousElementSibling;
  
  // Hide all fields first
  raceField.style.display = 'none';
  tierField.style.display = 'none';
  crewField.style.display = 'none';
  univField.style.display = 'none';
  if (raceLabel && raceLabel.tagName === 'SPAN') raceLabel.style.display = 'none';
  if (tierLabel && tierLabel.tagName === 'SPAN') tierLabel.style.display = 'none';
  if (crewLabel && crewLabel.tagName === 'SPAN') crewLabel.style.display = 'none';
  if (univLabel && univLabel.tagName === 'SPAN') univLabel.style.display = 'none';
  
  if (gameType === 'starcraft') {
    // Show race and tier fields for StarCraft streamers
    raceField.style.display = '';
    tierField.style.display = '';
    univField.style.display = '';
    if (raceLabel && raceLabel.tagName === 'SPAN') raceLabel.style.display = '';
    if (tierLabel && tierLabel.tagName === 'SPAN') tierLabel.style.display = '';
    if (univLabel && univLabel.tagName === 'SPAN') univLabel.style.display = '';
  } else if (gameType === 'general') {
    // Show crew field and hide university field for general streamers
    crewField.style.display = '';
    if (crewLabel && crewLabel.tagName === 'SPAN') crewLabel.style.display = '';
    // Populate crew options
    populateCrewOptions();
  } else if (gameType === '스타크루') {
    // Show crew field for 스타크루
    crewField.style.display = '';
    if (crewLabel && crewLabel.tagName === 'SPAN') crewLabel.style.display = '';
    // Filter crew options to show only 스타크루 crews
    populateCrewOptions('스타크루');
  } else if (gameType === '종합게임') {
    // Show crew field for 종합게임
    crewField.style.display = '';
    if (crewLabel && crewLabel.tagName === 'SPAN') crewLabel.style.display = '';
    // Filter crew options to show only 종합게임 crews
    populateCrewOptions('종합게임');
  } else if (gameType === '일반') {
    // Hide all specific fields for 일반
    // 일반 streamers don't belong to any specific category
    // No fields to show
  }
}

function populateCrewOptions(filterType) {
  const crewSelect = document.getElementById('p-crew');
  if (!crewSelect) return;

  // Get crew configurations
  const crewCfg = typeof window.crewCfg !== 'undefined' ? window.crewCfg : [];

  // Clear existing options
  crewSelect.innerHTML = '<option value="">Select Crew</option>';

  // Filter crews based on type
  let filteredCrews = crewCfg;
  if (filterType === '스타크루' || filterType === '보라크루') {
    // 스타크루/보라크루: 보라크루 타입 또는 타입 없음 (하위 호환)
    filteredCrews = crewCfg.filter(crew => !crew.type || crew.type === '보라크루');
  } else if (filterType === '종합게임') {
    // 종합게임: general 타입 크루만
    filteredCrews = crewCfg.filter(crew => crew.type === 'general');
  }

  // Add crew options
  filteredCrews.forEach(crew => {
    const option = document.createElement('option');
    option.value = crew.name;
    option.textContent = crew.name;
    crewSelect.appendChild(option);
  });

  // Add "No Crew" option
  const noCrewOption = document.createElement('option');
  noCrewOption.value = '';
  noCrewOption.textContent = 'No Crew';
  crewSelect.appendChild(noCrewOption);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  toggleGameFields();
});
