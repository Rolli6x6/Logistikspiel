// main.js
// Haupteinstiegspunkt: orchestriert alle Modulinitialisierungen.

import { initializeMap } from './load_map.js';
import { initializeUI } from './UI.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeUI();
  initializeMap();
});
