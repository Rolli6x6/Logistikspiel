// time.js
// Verwalten der Spielzeit: 1 reale Sekunde = 1 Spielminute

import { gameData } from './player_data.js';

let timerId = null;
let speed = 0; // Minuten pro Sekunde, 0 = Pause
let dateEl = null;
let timeEl = null;
let callbacks = {};

export function initTime(dateElement, timeElement, displayCallbacks) {
  dateEl = dateElement;
  timeEl = timeElement;
  callbacks = displayCallbacks || {};
  // Initial display
  if (callbacks.updateDateDisplay && dateEl) callbacks.updateDateDisplay(dateEl);
  if (callbacks.updateTimeDisplay && timeEl) callbacks.updateTimeDisplay(timeEl);
}

function tick() {
  if (!speed || speed <= 0) return;
  // Add `speed` minutes per tick (tick = 1 real second)
  gameData.dateTime.setMinutes(gameData.dateTime.getMinutes() + speed);
  // Update display
  if (callbacks.updateDateDisplay && dateEl) callbacks.updateDateDisplay(dateEl);
  if (callbacks.updateTimeDisplay && timeEl) callbacks.updateTimeDisplay(timeEl);
}

export function setSpeed(newSpeed) {
  speed = Number(newSpeed) || 0;
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  if (speed > 0) {
    timerId = setInterval(tick, 1000);
  }
}

export function pause() {
  setSpeed(0);
}

export function getSpeed() {
  return speed;
}

export function isRunning() {
  return !!(timerId && speed > 0);
}
