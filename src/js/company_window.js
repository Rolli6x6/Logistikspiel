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
            <h5>Einnahmen</h5>
            <h5>Ausgaben</h5>
                <div class="finance-expenses">
                    ${gameData.expenses.length ? gameData.expenses.map(expense => `
                        <div class="finance-entry">
                            <div>${expense.beschreibung}</div>
                            <div>€ ${expense.wert.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div>${expense.datum}</div>
                            <div>${expense.uhrzeit}</div>
                        </div>
                    `).join('') : '<div>Keine Ausgaben bisher.</div>'
                    }
                </div>
        </div>
    `;
}

function renderFinancesBank() {
}

export function attachCompanyWindow(modal) {
    const body = modal.querySelector('.modal-body');
    if (!body) return;

    body.innerHTML = `
        <div class="company-window-controls">
            <button id="cwLocations" class="cw-btn active">Standorte</button>
            <button id="cwFinances" class="cw-btn">Finanzen</button>
        </div>
        <div id="cwContent" class="cw-content"></div>
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
            <h4>Standorte</h4>
            <div class="location-controls">
                <button data-tab="garageOwned" class="location-btn active">Eigene Garagen</button>
                <button data-tab="warehouseOwned" class="location-btn">Eigene Lager</button>
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
            <h4>Finanzen</h4>
            <div class="finances-controls">
                <button data-tab="financesOverview" class="finances-btn active">Übersicht</button>
                <button data-tab="financesBank" class="finances-btn">Bank</button>
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