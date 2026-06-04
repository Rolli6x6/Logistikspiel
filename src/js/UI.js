// UI.js
// Verwaltung des Benutzeroberflächen-Renderings.

import { initializePlayerData } from './player_data.js';

export function initializeUI() {
  const moneyValue = document.getElementById('moneyValue');
  const dateValue = document.getElementById('dateValue');
  const navButtons = document.querySelectorAll('.nav-btn');

  // Initialize player data display
  initializePlayerData(moneyValue, dateValue);

  // Setup navigation buttons
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.textContent;
      console.log(`Navigiert zu: ${label}`);
      alert(`${label}-Bereich kommt bald!`);
    });
  });
}
