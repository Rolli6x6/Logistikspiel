// company_window.js
// Fenster für Unternehmensinformationen und -aktionen.

import { gameData } from './player_data.js';
import { showToast } from './UI.js';

function renderGarageLocations() {
}

function renderWarehouseLocations() {
}

function renderFinancesOverview() {
    const content = document.getElementById('financesContent');
    content.innerHTML = `
        <div class="finance-list">
            <table class="finance-table">
                <thead>
                    <tr class="finance-title">
                        <th colspan="4">Einnahmen</th>
                    </tr>
                    <tr class="finance-header">
                        <th width="40%">Beschreibung</th>
                        <th width="20%">Datum</th>
                        <th width="20%">Uhrzeit</th>
                        <th width="20%">Wert</th>
                    </tr>
                </thead>
                <tbody>
                    ${gameData.income.length ? gameData.income.map(income => `
                            <tr class="finance-entry">
                                <td>${income.beschreibung}</td>
                                <td>${income.datum}</td>
                                <td>${income.uhrzeit}</td>
                                <td>${income.wert.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                            </tr>
                        `).join('') : '<tr><td colspan="4">Keine Einnahmen bisher.</td></tr>'
                    }
                    <tr class="finance-summary">
                        <td colspan="3">Summe Einnahmen:</td>
                        <td>${gameData.income.reduce((sum, entry) => sum + entry.wert, 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                    </tr>
                </tbody>

                <thead>
                    <tr class="finance-title">
                        <th colspan="4">Ausgaben</th>
                    </tr>
                    <tr class="finance-header">
                        <th width="40%">Beschreibung</th>
                        <th width="20%">Datum</th>
                        <th width="20%">Uhrzeit</th>
                        <th width="20%">Wert</th>
                    </tr>
                </thead>
                <tbody>
                    ${gameData.expenses.length ? gameData.expenses.map(expense => `
                            <tr class="finance-entry">
                                <td>${expense.beschreibung}</td>
                                <td>${expense.datum}</td>
                                <td>${expense.uhrzeit}</td>
                                <td>${expense.wert.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                            </tr>
                        `).join('') : '<tr><td colspan="4">Keine Ausgaben bisher.</td></tr>'
                    }
                    <tr class="finance-summary">
                        <td colspan="3">Summe Ausgaben:</td>
                        <td>${gameData.expenses.reduce((sum, entry) => sum + entry.wert, 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

function renderFinancesBank() {
    const content = document.getElementById('financesContent');
    content.innerHTML = `
        <div class="bank-info">
            <h1>Willkommen bei der Bank</h1>
            <p>Hier können Sie Kredite aufnehmen, zurückzahlen und Ihre Kontoinformationen verwalten.</p>
            <p><strong>Kontostand:</strong> ${gameData.money.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
        </div>
    `;
}

export function attachCompanyWindow(modal) {
    const body = modal.querySelector('.modal-body');
    if (!body) return;

    body.innerHTML = `
        <div class="window-controls">
            <button id="cwLocations" class="tab-controls cw-btn active">Standorte</button>
            <button id="cwFinances" class="tab-controls cw-btn">Finanzen</button>
        </div>
        <div id="cwContent" class="window-content"></div>
    `;

    const btnLocations = modal.querySelector('#cwLocations');
    const btnFinances = modal.querySelector('#cwFinances');
    const content = modal.querySelector('#cwContent'); 

    function setActiveTab(button, selector) {
		modal.querySelectorAll(selector).forEach((btn) => btn.classList.remove('active'));
		if (button) {
            button.classList.add('active');
        }
	}

    function switchCompanyTab(container, buttonClass, tabMap) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest(buttonClass);
            if (!btn) return;
            setActiveTab(btn, buttonClass);
            tabMap[btn.dataset.tab]?.();
        });
    }

    function renderLocations() {
        content.innerHTML = `
            <div class="location-controls">
                <button data-tab="garageOwned" class="category-btn location-btn active">Eigene Garagen</button>
                <button data-tab="warehouseOwned" class="category-btn location-btn">Eigene Lager</button>
            </div>
            <div id="locationContent"></div>
        `;

        switchCompanyTab(content, '.location-btn', {
            garageOwned: renderGarageLocations,
            warehouseOwned: renderWarehouseLocations
        });
    }

    function renderFinances() {
        content.innerHTML = `
            <div class="finances-controls">
                <button data-tab="financesOverview" class="category-btn finances-btn active">Übersicht</button>
                <button data-tab="financesBank" class="category-btn finances-btn">Bank</button>
            </div>
            <div id="financesContent"></div>
        `;

        switchCompanyTab(content, '.finances-btn', {
            financesOverview: renderFinancesOverview,
            financesBank: renderFinancesBank
        });
    }

    btnLocations.addEventListener('click', () => {
        setActiveTab(btnLocations, '.cw-btn');
        renderLocations();
    });

    btnFinances.addEventListener('click', () => {
        setActiveTab(btnFinances, '.cw-btn');
        renderFinances();
    });
}