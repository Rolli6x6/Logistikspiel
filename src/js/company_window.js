// company_window.js
// Fenster für Unternehmensinformationen und -aktionen.

import { gameData } from './player_data.js';
import { calculateLoan, calculateRestLoan } from './finance_calculation.js';
import { map, setGarageMarker } from './load_map.js';
import { showToast, updateMoneyDisplay } from './UI.js'

function selectLocation () {
    let selectedLocation = null;
    const changeUi = {};
    changeUi.window = document.querySelector('.app-modal');
    changeUi.uipanel = document.querySelector('.ui-panel');
    changeUi.window.classList.add('hidden');
    changeUi.uipanel.classList.add('hidden');

    showToast('Bitte wählen Sie einen Standort auf der Karte aus, um die Garage zu platzieren.', 'info');

    changeUi.cancelBtn = document.createElement('button');
    changeUi.cancelBtn.textContent = 'Garagenkauf abbrechen';
    changeUi.cancelBtn.className = 'cancel-btn';
    changeUi.cancelBtn.addEventListener('click', () => {
        changeUi.window.classList.remove('hidden');
        changeUi.uipanel.classList.remove('hidden');
        changeUi.cancelBtn.remove();
        map.off('click');
        let garageNameInput = document.getElementById('garageNameInputId')
        if (garageNameInput) {
            garageNameInput.remove();
        }
    });
    document.body.appendChild(changeUi.cancelBtn);

    map.on('click', (e) => {
        selectedLocation = e.latlng;
        selectLocationWindow(selectedLocation, changeUi);
    })
}

function selectLocationWindow(selectedLocation, changeUi) {
    const garageNameInput = document.createElement('div');
    garageNameInput.className = 'app-modal';
    garageNameInput.id = 'garageNameInputId';
    garageNameInput.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-window">
            <header>
                <h3>Garage kaufen</h3>
                <button class="modal-close" aria-label="Schließen">&times;</button>
            </header>
            <div class="modal-body">
                <input type="text" id="garageNameInputText" placeholder="Name der Garage">
                <button id="confirmGarageNameBtn" class="category-btn">Bestätigen</button>
            </div>
        </div>
    `;
    document.body.appendChild(garageNameInput);

    garageNameInput.querySelector('.modal-close').addEventListener('click', () => {
        garageNameInput.remove();
        selectedLocation = null;
    });

    document.getElementById('confirmGarageNameBtn').addEventListener('click', () => {
        const garageName = document.getElementById('garageNameInputText').value.trim();
        if (!garageName) {
            showToast('Bitte geben Sie einen Namen für die Garage ein.', 'error');
            return;
        }
        map.off('click');

        gameData.ownedGarages.push({
            id: crypto.randomUUID(),
            name: garageName,
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
            date: dateValue.textContent || '',
            size: 1
        });
        showToast('Garage erfolgreich gekauft und Standort gesetzt!', 'success');
        updateMoneyDisplay();
        renderGarageLocations();
        setGarageMarker(selectedLocation.lat, selectedLocation.lng);
        console.log(gameData.ownedGarages);
        changeUi.cancelBtn.remove();
        garageNameInput.remove();
        changeUi.window.classList.remove('hidden');
        changeUi.uipanel.classList.remove('hidden');
    })
}

function renderGarageLocations() {
    const content = document.getElementById('locationContent');
    content.innerHTML = `
        <div class="garage-info">
            <h1>Eigene Garagen</h1>
            <p>Hier können Sie Ihre Garagenstandorte verwalten und neue Garagen kaufen.</p>
        </div>
        <button id="setGarageLocationBtn" class="category-btn">Garagenstandort setzen</button>
    `;

    document.getElementById('setGarageLocationBtn').addEventListener('click', () => {
        selectLocation();
    });
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
                        <th colspan="6"><h2>Kredite</h2></th>
                    </tr>
                    <tr class="loan-header">
                        <th width="10%">Datum</th>
                        <th width="20%">Summe</th>
                        <th width="20%">Restschuld</th>
                        <th width="20%">monatliche Rate</th>
                        <th width="20%">Raten gezahlt</th>
                        <th width="10%">Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    ${gameData.loans.length ? gameData.loans.map(loan => `
                            <tr class="loan-entry">
                                <td>${loan.date}</td>
                                <td>${loan.loanAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                                <td>${loan.restloan.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                                <td>${loan.monthlyPayment.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                                <td>${loan.ratesPaid} von ${loan.loanDuration}</td>
                                <td><button class="repay-loan-btn" data-loan-id="${loan.Id}">Rückzahlung</button></td>
                            </tr>
                        `).join('') : '<tr><td colspan="6">Keine Kredite vorhanden.</td></tr>'
                    }
                </tbody>
            </table>
        </div>
        <div class="loan-actions">
            <h2>Kredit aufnehmen</h2>
            <p>Sie können einen neuen Kredit aufnehmen, um Ihr Unternehmen zu finanzieren. Bitte beachten Sie die Rückzahlungsbedingungen.</p>
            <p>Kreditbetrag in €: <input type="number" id="loanAmount" min="1000" step="1000" placeholder="Betrag in €"></p>
            <p>Laufzeit in Monaten: <input type="number" id="loanDuration" min="1" step="1" placeholder="Laufzeit in Monaten"></p>
            <button id="calculateLoanBtn" class="category-btn">Kredit berechnen</button>
            <div id="loanCalculationDetails"></div>
        </div>
    `;

    const repayButtons = document.querySelector('.loan-table');
    let loanCalculationResult = null;
    let restLoanCalculationResult = new Map();
    let restLoanCalculationSum = null;
    let totalPaymentSum = null;

    repayButtons.addEventListener('click', (event) => {
        const btn = event.target.closest('.repay-loan-btn');
        if (btn) {
            const loanId = btn.dataset.loanId;
            const loan = gameData.loans.find(l => l.Id === loanId);
            if (!loan) {
                showToast('Kredit nicht gefunden', 'error');
                return;
            }

            const row = btn.closest('tr');
        
            if (row.nextElementSibling && row.nextElementSibling.classList.contains('loan-payment-row')) {
                return;
            }

            const paymentRow = document.createElement('tr');
            paymentRow.className = 'loan-payment-row';
            paymentRow.innerHTML = `
                <td colspan="6">
                    <p>Rückzahlungsbetrag in €: <input id="repaymentAmount-${loan.Id}" type="number" class="repayment-amount" min="1000" max="${loan.restloan}" step="1000" placeholder="Betrag in €"></p>
                    <button class="confirm-repayment-btn category-btn" data-loan-id="${loan.Id}">Rückzahlung berechnen</button>
                    <div id="repaymentCalculationDetails-${loan.Id}"></div>
                </td>
            `;
            row.parentNode.insertBefore(paymentRow, row.nextSibling);
            return;
        };

        const confirmBtn = event.target.closest('.confirm-repayment-btn');
        if (confirmBtn) {
            const loanId = confirmBtn.dataset.loanId;
            const loan = gameData.loans.find(l => l.Id === loanId);
            const paymentSum = parseFloat(document.getElementById(`repaymentAmount-${loan.Id}`).value);
            if (isNaN(paymentSum) || paymentSum <= 0 || paymentSum > loan.restloan) {
                showToast('Bitte geben Sie einen gültigen Rückzahlungsbetrag ein.', 'error');
                return;
            }
            else if (paymentSum > gameData.money) {
                showToast('Sie haben nicht genügend Geld, um diese Rückzahlung vorzunehmen.', 'error');
                return;
            }
            else {
                restLoanCalculationSum = loan.restloan - paymentSum;
                restLoanCalculationResult.set(loan.Id, {
                    sum: restLoanCalculationSum,
                    newLoanDuration: calculateRestLoan(loan.interestRate, restLoanCalculationSum, loan.monthlyPayment),
                    totalPaymentSum: paymentSum + paymentSum * (loan.interestRate - 1) / 100
                });

                console.log(restLoanCalculationResult);

                const repaymentRow = document.getElementById(`repaymentCalculationDetails-${loan.Id}`);
                repaymentRow.innerHTML = `
                    <p>Neue Restschuld: ${restLoanCalculationResult.get(loan.Id).sum.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
                    <p>Neue Laufzeit: ${restLoanCalculationResult.get(loan.Id).newLoanDuration} Monate</p>
                    <p>Gesamtbetrag der Rückzahlung: ${restLoanCalculationResult.get(loan.Id).totalPaymentSum.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</p>
                    <button class="finalize-repayment-btn category-btn" data-loan-id="${loan.Id}">Rückzahlung durchführen</button>
                `;
            };
        }

        const finalizeBtn = event.target.closest('.finalize-repayment-btn');
        if (finalizeBtn) {
            const loanId = finalizeBtn.dataset.loanId;
            const loan = gameData.loans.find(l => l.Id === loanId);
            gameData.money -= restLoanCalculationResult.get(loan.Id).totalPaymentSum;
            loan.restloan = restLoanCalculationResult.get(loan.Id).sum;
            loan.loanDuration = restLoanCalculationResult.get(loan.Id).newLoanDuration;
            loan.ratesPaid = 0;
            updateMoneyDisplay();
            showToast(`Rückzahlung von ${restLoanCalculationResult.get(loan.Id).totalPaymentSum.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € erfolgreich durchgeführt!`);
            renderFinancesBank();
            restLoanCalculationResult.delete(loan.Id);
        }
    });

    const loanCalculation = document.getElementById('loanCalculationDetails');
    let interestRate = 5;
    

    document.getElementById('calculateLoanBtn').addEventListener('click', () => {
        const loanAmount = parseFloat(document.getElementById('loanAmount').value);
        const loanDuration = parseInt(document.getElementById('loanDuration').value);
        if (isNaN(loanAmount) || isNaN(loanDuration) || loanAmount <= 0 || loanDuration <= 0) {
            showToast('Bitte geben Sie gültige Werte für Kreditbetrag und Laufzeit ein.', 'error');
            return;
        }
        loanCalculationResult = calculateLoan(interestRate, loanAmount, loanDuration);
        renderLoanCalculation();
    });

    function renderLoanCalculation() {
        
        loanCalculation.innerHTML = `
            <h3>Kreditberechnung</h3>
            <p>Basierend auf den eingegebenen Daten macht die Bank folgendes Angebot:</p>
            <table class="loan-calculation-table">
                <tr>
                    <td>Beantragter Kredit:</td>
                    <td>${loanCalculationResult.loanAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                </tr>
                <tr>
                    <td>Laufzeit:</td>
                    <td>${loanCalculationResult.loanDuration} Monate</td>
                </tr>
                <tr>
                    <td>Zinssatz:</td>
                    <td>${loanCalculationResult.interestRate}% p.a.</td>
                </tr>
                <tr>
                    <td>Monatliche Rate:</td>
                    <td>${loanCalculationResult.monthlyPayment.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                </tr>
                <tr>
                    <td>Gesamtkosten:</td>
                    <td>${loanCalculationResult.totalPayment.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                </tr>
                <tr>
                    <td>Gesamtzins:</td>
                    <td>${loanCalculationResult.totalInterest.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>
                </tr>
            </table>
            <button id="takeLoanBtn" class="category-btn">Kredit aufnehmen</button>
        `;

        document.getElementById('takeLoanBtn').addEventListener('click', () => {
            if (loanCalculationResult) {
                gameData.loans.push({
                    Id: crypto.randomUUID(),
                    ...loanCalculationResult,
                    date: dateValue.textContent || '',
                    restloan: loanCalculationResult.loanAmount,
                    ratesPaid: 0
                });
                gameData.money += loanCalculationResult.loanAmount;
                updateMoneyDisplay();
                showToast(`Kredit über ${loanCalculationResult.loanAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € aufgenommen!`);
                loanCalculationResult = null;
                renderFinancesBank();
            }
        });
    }
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

        renderGarageLocations();
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

        renderFinancesOverview();
    }

    btnLocations.addEventListener('click', () => {
        setActiveTab(btnLocations, '.cw-btn');
        renderLocations();
    });

    btnFinances.addEventListener('click', () => {
        setActiveTab(btnFinances, '.cw-btn');
        renderFinances();
    });

    renderLocations();
}