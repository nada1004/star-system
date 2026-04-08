// Game type handler for streamer registration
function toggleGameFields() {
  const gameType = document.getElementById('p-game-type').value;
  const raceField = document.getElementById('p-race');
  const tierField = document.getElementById('p-tier');
  const raceLabel = raceField.previousElementSibling;
  const tierLabel = tierField.previousElementSibling;
  
  if (gameType === 'general') {
    // Hide race and tier fields for general streamers
    raceField.style.display = 'none';
    tierField.style.display = 'none';
    if (raceLabel && raceLabel.tagName === 'SPAN') raceLabel.style.display = 'none';
    if (tierLabel && tierLabel.tagName === 'SPAN') tierLabel.style.display = 'none';
  } else {
    // Show race and tier fields for StarCraft streamers
    raceField.style.display = '';
    tierField.style.display = '';
    if (raceLabel && raceLabel.tagName === 'SPAN') raceLabel.style.display = '';
    if (tierLabel && tierLabel.tagName === 'SPAN') tierLabel.style.display = '';
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  toggleGameFields();
});
