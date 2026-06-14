// UI.js
// Verwaltung des Benutzeroberflächen-Renderings.

import { gameData } from './player_data.js';
import { initTime, setSpeed } from './time.js';
import { attachCompanyWindow } from './company_window.js';
import { attachVehicleWindow } from './vehicle_window.js';

export function updateMoneyDisplay() {
  const moneyElement = document.getElementById('moneyValue');
  moneyElement.textContent = `€ ${gameData.money.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function updateDateDisplay(dateElement) {
  const day = String(gameData.dateTime.getDate()).padStart(2, '0');
  const month = String(gameData.dateTime.getMonth() + 1).padStart(2, '0');
  const year = gameData.dateTime.getFullYear();
  dateElement.textContent = `${day}.${month}.${year}`;
}

function updateTimeDisplay(timeElement) {
  const hours = String(gameData.dateTime.getHours()).padStart(2, '0');
  const minutes = String(gameData.dateTime.getMinutes()).padStart(2, '0');
  timeElement.textContent = `${hours}:${minutes}`;
}

export function initializeUI() {
  const moneyValue = document.getElementById('moneyValue');
  const dateValue = document.getElementById('dateValue');
  const timeValue = document.getElementById('timeValue');
  const navButtons = document.querySelectorAll('.nav-btn');

  // Initialize display values
  updateMoneyDisplay(moneyValue);
  updateDateDisplay(dateValue);
  updateTimeDisplay(timeValue);

  // Initialize time with display callbacks
  initTime(dateValue, timeValue, { updateDateDisplay, updateTimeDisplay });

  // Setup navigation buttons
  function closeModal() {
    const existing = document.querySelector('.app-modal');
    if (existing) existing.remove();
  }

  function openNavWindow(title) {
    closeModal();
    const modal = document.createElement('div');
    modal.className = 'app-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-window">
        <header>
          <h3>${title}</h3>
          <button class="modal-close" aria-label="Schließen">&times;</button>
        </header>
        <div class="modal-body">
          <p>${title}-Bereich kommt bald!</p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    
    if (title === 'Fahrzeuge') {
      attachVehicleWindow(modal);
    }
    if (title === 'Firma') {
      attachCompanyWindow(modal);
    }
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const label = btn.textContent;
      console.log(`Navigiert zu: ${label}`);
      openNavWindow(label);
    });
  });

  // Time control buttons (Pause, x1, x2, x5, x10)
  const btnPause = document.getElementById('timePause');
  const btn1 = document.getElementById('time1');
  const btn2 = document.getElementById('time2');
  const btn5 = document.getElementById('time5');
  const btn10 = document.getElementById('time10');

  function setActiveButton(el) {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
  }

  if (btnPause) btnPause.addEventListener('click', () => { setSpeed(0); setActiveButton(btnPause); });
  if (btn1) btn1.addEventListener('click', () => { setSpeed(1); setActiveButton(btn1); });
  if (btn2) btn2.addEventListener('click', () => { setSpeed(2); setActiveButton(btn2); });
  if (btn5) btn5.addEventListener('click', () => { setSpeed(5); setActiveButton(btn5); });
  if (btn10) btn10.addEventListener('click', () => { setSpeed(10); setActiveButton(btn10); });

  // Start paused
  setSpeed(0);
  setActiveButton(btnPause);
}

export function ensureToastContainer() {
	let container = document.getElementById('toastContainer');
	if (!container) {
		container = document.createElement('div');
		container.id = 'toastContainer';
		document.body.appendChild(container);
	}
	return container;
}

export function showToast(message, type = 'info') {
	const container = ensureToastContainer();
	const toast = document.createElement('div');
	toast.className = `toast ${type}`;
	toast.textContent = message;
	container.appendChild(toast);

	setTimeout(() => toast.classList.add('visible'), 10);
	setTimeout(() => {
		toast.classList.remove('visible');
		setTimeout(() => toast.remove(), 250);
	}, 5000);
}