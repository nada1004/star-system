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
  
  if (gameType === 'general') {
    // Hide race and tier fields for general streamers
    raceField.style.display = 'none';
    tierField.style.display = 'none';
    if (raceLabel && raceLabel.tagName === 'SPAN') raceLabel.style.display = 'none';
    if (tierLabel && tierLabel.tagName === 'SPAN') tierLabel.style.display = 'none';
    
    // Show crew field and hide university field for general streamers
    crewField.style.display = '';
    univField.style.display = 'none';
    if (univLabel && univLabel.tagName === 'SPAN') univLabel.style.display = 'none';
    
    // Populate crew options
    populateCrewOptions();
  } else {
    // Show race and tier fields for StarCraft streamers
    raceField.style.display = '';
    tierField.style.display = '';
    if (raceLabel && raceLabel.tagName === 'SPAN') raceLabel.style.display = '';
    if (tierLabel && tierLabel.tagName === 'SPAN') tierLabel.style.display = '';
    
    // Hide crew field and show university field for StarCraft streamers
    crewField.style.display = 'none';
    univField.style.display = '';
    if (univLabel && univLabel.tagName === 'SPAN') univLabel.style.display = '';
  }
}

function populateCrewOptions() {
  const crewSelect = document.getElementById('p-crew');
  if (!crewSelect) return;
  
  // Get crew configurations
  const crewCfg = typeof window.crewCfg !== 'undefined' ? window.crewCfg : [];
  
  // Clear existing options
  crewSelect.innerHTML = '<option value="">Select Crew</option>';
  
  // Add crew options including Bora Crew and general game crews
  crewCfg.forEach(crew => {
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
