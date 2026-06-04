// player_data.js
// Verwaltung der Spielerdaten wie Geld und Datum.

export const gameData = {
  money: 50000,
  date: new Date(2024, 0, 1),
};

export function updateMoneyDisplay(moneyElement) {
  moneyElement.textContent = `€ ${gameData.money.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function updateDateDisplay(dateElement) {
  const day = String(gameData.date.getDate()).padStart(2, '0');
  const month = String(gameData.date.getMonth() + 1).padStart(2, '0');
  const year = gameData.date.getFullYear();
  dateElement.textContent = `${day}.${month}.${year}`;
}

export function initializePlayerData(moneyElement, dateElement) {
  updateMoneyDisplay(moneyElement);
  updateDateDisplay(dateElement);
}

export function addMoney(amount) {
  gameData.money += amount;
  const moneyElement = document.getElementById('moneyValue');
  if (moneyElement) updateMoneyDisplay(moneyElement);
}

export function subtractMoney(amount) {
  gameData.money -= amount;
  const moneyElement = document.getElementById('moneyValue');
  if (moneyElement) updateMoneyDisplay(moneyElement);
}

export function advanceDay(days = 1) {
  gameData.date.setDate(gameData.date.getDate() + days);
  const dateElement = document.getElementById('dateValue');
  if (dateElement) updateDateDisplay(dateElement);
}
