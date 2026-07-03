// company_window.js
// Fenster für Unternehmensinformationen und -aktionen.

import { gameData } from './player_data.js';
import { calculateLoan } from './finance_calculation.js';
import { showToast } from './UI.js'

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
        <div class="bank-loans">
            <table class="loan-table">
                <thead>
                    <tr class="loan-title">
                        <th colspan="5"><h2>Kredite</h2></th>
                    </tr>
                    <tr class="loan-header">
                        <th width="20%">Datum</th>
                        <th width="20%">Summe</th>
                        <th width="20%">Restschuld</th>
                        <th width="20%">monatliche Rate</th>
                        <th width="20%">Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    ${gameData.loans.length ? gameData.loans.map(loan => `
                            <tr class="loan-entry">
                                <td>${loan.datum}</td>
                                <td>${loan.summe.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                                <td>${loan.restschuld.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                                <td>${loan.monatlicheRate.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                                <td><button class="repay-loan-btn" data-loan-id="${loan.id}">Rückzahlung</button></td>
                            </tr>
                        `).join('') : '<tr><td colspan="5">Keine Kredite vorhanden.</td></tr>'
                    }
                </tbody>
            </table>
        </div>
        <div class="loan-actions">
            <h2>Kredit aufnehmen</h2>
            <p>Sie können einen neuen Kredit aufnehmen, um Ihr Unternehmen zu finanzieren. Bitte beachten Sie die Rückzahlungsbedingungen.</p>
            <p>Kreditbetrag: <input type="number" id="loanAmount" min="1000" step="1000" placeholder="Betrag in €"></p>
            <p>Laufzeit: <input type="number" id="loanDuration" min="1" max="120" step="1" placeholder="Laufzeit in Monaten"></p>
            <button id="calculateLoanBtn" class="category-btn">Kredit berechnen</button>
            <div id="loanCalculationResult"></div>
        </div>
    `;

    const loanCalculation = document.getElementById('loanCalculationResult');
    let interestRate = 5;
    let loanCalculationResult = null;

    document.getElementById('calculateLoanBtn').addEventListener('click', () => {
        const loanAmount = parseFloat(document.getElementById('loanAmount').value);
        const loanDuration = parseInt(document.getElementById('loanDuration').value);
        loanCalculationResult = calculateLoan(interestRate, loanAmount, loanDuration);
        renderLoanCalculation();
        console.log(loanCalculationResult);
    });

    function renderLoanCalculation() {
        
        loanCalculation.innerHTML = `
            Beantragter Kredit: ${loanCalculationResult.loanAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € <br>
            Laufzeit: ${loanCalculationResult.loanDuration} Monate <br>
            Zinssatz: ${loanCalculationResult.interestRate}% <br>
            Monatliche Rate: ${loanCalculationResult.monthlyPayment.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € <br>
            Gesamtkosten: ${loanCalculationResult.totalPayment.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € <br>
            Gesamtzins: ${loanCalculationResult.totalInterest.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
        `;
    };
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