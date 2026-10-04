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
        let locationConfigInput = document.getElementById('garageNameInputId')
        if (locationConfigInput) {
            locationConfigInput.remove();
        }
    });
    document.body.appendChild(changeUi.cancelBtn);

    map.on('click', async (e) => {
        selectedLocation = e.latlng;
        const locationConfigResult = await renderLocationConfigWindow();
        if (!locationConfigResult) return;
        else {
            map.off('click')
            gameData.money -= locationConfigResult.price;
            updateMoneyDisplay();
            gameData.expenses.push({
                wert: locationConfigResult.price,
                beschreibung: `Kauf der Garage "${locationConfigResult.name}"`,
                datum: dateValue.textContent || '',
			    uhrzeit: timeValue.textContent || ''
            });
            gameData.ownedLocations.push({
                id: crypto.randomUUID(),
                name: locationConfigResult.name,
                position: {
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng
                }, 
                parkingSmall: locationConfigResult.parkingSmall,
                parkingSmallUsed: 0,
                parkingMiddle: locationConfigResult.parkingMiddle,
                parkingMiddleUsed: 0,
                parkingBig: locationConfigResult.parkingBig,
                parkingBigUsed: 0
            });
            changeUi.cancelBtn.remove();
            changeUi.window.classList.remove('hidden');
            changeUi.uipanel.classList.remove('hidden');
            L.marker(selectedLocation).addTo(map);
            renderGarageLocations();
        }
    })
}

function renderLocationConfigWindow() {
    return new Promise((resolve) => {
        const locationConfigInput = document.createElement('div');
        locationConfigInput.className = 'app-modal';
        locationConfigInput.id = 'garageNameInputId';
        let locationPrice = 100000;
        locationConfigInput.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-window">
            <header>
                <h3>Standort anpassen</h3>
                <div id="locationConfigPriceDisplay"> Preis: ${locationPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} </div>
                <button class="modal-close" aria-label="Schließen">&times;</button>
            </header>
            <div class="modal-body">
                <p> Hier kannst du deinen Standort konfigurieren. Du kannst ihn später jederzeit erweitern. Grundstückspreis: 100.000€</p>
                <table>
                    <tr>
                        <td width="40%">Name: </td>
                        <td width="60%"><input type="text" id="garageNameInputText" placeholder="Name des Standorts"></td>
                    </tr>
                    <tr>
                        <td>Anzahl Parkplätze (klein): </td>
                        <td><input type="number" id="numberParkingSmall" min="0" max="100" step="1" placeholder="Parkplätze (klein)"> x10.000€</td>
                    </tr>
                    <tr>
                        <td>Anzahl Parkplätze (mittel): </td>
                        <td><input type="number" id="numberParkingMedium" min="0" max="100" step="1" placeholder="Parkplätze (mittel)"> x12.500€</td>
                    </tr>
                    <tr>
                        <td>Anzahl Parkplätze (groß): </td>
                        <td><input type="number" id="numberParkingBig" min="0" max="100" step="1" placeholder="Parkplätze (groß)"> x15.000€</td>
                    </tr>
                </table>
                <button id="confirmGarageNameBtn" class="category-btn">Bestätigen</button>
            </div>
        </div>
        `;
        document.body.appendChild(locationConfigInput);

        locationConfigInput.querySelector('.modal-close').addEventListener('click', () => {
            locationConfigInput.remove();
            resolve(null)
        });

        const parkingInputs = locationConfigInput.querySelectorAll('input[type="number"]');
        const priceDisplay = locationConfigInput.querySelector('#locationConfigPriceDisplay');
        const updateLocationPrice = () => {
            locationPrice = 100000
                + (Number(locationConfigInput.querySelector('#numberParkingSmall').value) || 0) * 10000
                + (Number(locationConfigInput.querySelector('#numberParkingMedium').value) || 0) * 12500
                + (Number(locationConfigInput.querySelector('#numberParkingBig').value) || 0) * 15000;
            priceDisplay.textContent = `Preis: ${locationPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`;
        };
        parkingInputs.forEach(input => input.addEventListener('input', updateLocationPrice));

        document.getElementById('confirmGarageNameBtn').addEventListener('click', () => {
            if (gameData.money < locationPrice) {
                showToast('Sie haben nicht genügend Geld, um diese Garage zu kaufen.', 'error');
                return;
            }
            let locationConfigResult;
            const locationName = document.getElementById('garageNameInputText').value.trim();
            if (!locationName) {
                showToast('Bitte geben Sie einen Namen für die Garage ein.', 'error');
                return;
            }

            locationConfigResult = {
                name: locationName,
                parkingSmall: Number(document.getElementById('numberParkingSmall').value) || 0,
                parkingMiddle: Number(document.getElementById('numberParkingMedium').value) || 0,
                parkingBig: Number(document.getElementById('numberParkingBig').value) || 0,
                price: locationPrice
            }

            locationConfigInput.remove();
            resolve(locationConfigResult);
        })
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
        <div class="garage-list">
            <table class="garage-table">
                <thead>
                    <tr class="garage-title">
                        <th>Garagenname</th>
                        <th>Position</th>
                        <th>Parkplätze (klein)</th>
                        <th>Parkplätze (mittel)</th>
                        <th>Parkplätze (groß)</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    ${gameData.ownedLocations.length ? gameData.ownedLocations.map(location => `
                        <tr class="garage-entry">
                            <td>${location.name}</td>
                            <td>${location.position.lat.toFixed(5)}, ${location.position.lng.toFixed(5)}</td>
                            <td>vorhandene Parkplätze: ${location.parkingSmall} <br> davon besetzt: ${location.parkingSmallUsed}</td>
                            <td>vorhandene Parkplätze: ${location.parkingMiddle} <br> davon besetzt: ${location.parkingMiddleUsed}</td>
                            <td>vorhandene Parkplätze: ${location.parkingBig} <br> davon besetzt: ${location.parkingBigUsed}</td>
                            <td><center><button class="location-action-btn" id="${location.id}">Aktion</button></center></td>
                        </tr>
                    `).join('') : '<tr><td colspan="6">Keine Garagenstandorte vorhanden. Klicken Sie auf "Garagenstandort setzen", um eine neue Garage zu kaufen.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;

    const garageActionButtons = document.querySelector('.garage-table');
    garageActionButtons.addEventListener('click', async (event) => {
        const btn = event.target.closest('.location-action-btn');
        if (!btn) return;
        const location = gameData.ownedLocations.find(l => l.id === btn.id);
        if (!location) {
            showToast('Garage nicht gefunden', 'error');
            return;
        }
        
        const garageWindow = document.querySelector('.app-modal');
        garageWindow.classList.add('hidden');

        const garageActionResult = await renderGarageActionWindow(location);

        garageWindow.classList.remove('hidden');

        if (!garageActionResult) return;

        gameData.money -= garageActionResult.price;
        updateMoneyDisplay();
        gameData.expenses.push({
            wert: garageActionResult.price,
            beschreibung: `Änderungen an der Garage "${garageActionResult.name}"`,
            datum: dateValue.textContent || '',
            uhrzeit: timeValue.textContent || ''
        });
        gameData.ownedLocations = gameData.ownedLocations.map(l => {
            if (l.id === location.id) {
                return {
                    ...l,
                    name: garageActionResult.name,
                    parkingSmall: garageActionResult.parkingSmall,
                    parkingMiddle: garageActionResult.parkingMiddle,
                    parkingBig: garageActionResult.parkingBig
                };
            }
        });
        renderGarageLocations();
        showToast(`Änderungen an der Garage "${garageActionResult.name}" erfolgreich durchgeführt!`, 'success');
    });


    document.getElementById('setGarageLocationBtn').addEventListener('click', () => {
        selectLocation();
    });
}

function renderGarageActionWindow(location) {
    return new Promise((resolve) => {
        let locationChangePrice = 0;
        const garageActionWindow = document.createElement('div');
        garageActionWindow.className = 'app-modal';
        garageActionWindow.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-window">
                <header>
                    <h3>Aktionen für Garage: ${location.name}</h3>
                    <div id="locationActionPriceDisplay"> Preis: ${locationChangePrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} </div>
                    <button class="modal-close" aria-label="Schließen">&times;</button>
                </header>
                <div class="modal-body">
                    <p> Hier kannst du deinen Standort konfigurieren. Die Abrisskosten betragen 1/2 der Baukosten.</p>
                    <table>
                        <tr>
                            <td width="40%">Name: </td>
                            <td width="60%"><input type="text" id="garageNameInputText" value="${location.name}" placeholder="Name des Standorts"></td>
                        </tr>
                        <tr>
                            <td>Anzahl Parkplätze (klein): </td>
                            <td>aktuell ${location.parkingSmallUsed} von ${location.parkingSmall} Parkplätzen belegt <br> neue Anzahl:<input type="number" id="numberParkingSmall" min="${location.parkingSmallUsed}" max="100" step="1" value="${location.parkingSmall}" placeholder="Parkplätze (klein)"> x10.000€</td>
                        </tr>
                        <tr>
                            <td>Anzahl Parkplätze (mittel): </td>
                            <td>aktuell ${location.parkingMiddleUsed} von ${location.parkingMiddle} Parkplätzen belegt <br> neue Anzahl:<input type="number" id="numberParkingMedium" min="${location.parkingMiddleUsed}" max="100" step="1" value="${location.parkingMiddle}" placeholder="Parkplätze (mittel)"> x12.500€</td>
                        </tr>
                        <tr>
                            <td>Anzahl Parkplätze (groß): </td>
                            <td>aktuell ${location.parkingBigUsed} von ${location.parkingBig} Parkplätzen belegt <br> neue Anzahl:<input type="number" id="numberParkingBig" min="${location.parkingBigUsed}" max="100" step="1" value="${location.parkingBig}" placeholder="Parkplätze (groß)"> x15.000€</td>
                        </tr>
                    </table>
                    <button id="confirmGarageActionBtn" class="category-btn">Bestätigen</button>
                </div>
            </div>
        `;
        document.body.appendChild(garageActionWindow);
    
        garageActionWindow.querySelector('.modal-close').addEventListener('click', () => {
            garageActionWindow.remove();
            resolve(null);
        });

        const parkingInputs = garageActionWindow.querySelectorAll('input[type="number"]');
        const priceDisplay = garageActionWindow.querySelector('#locationActionPriceDisplay');
        const calculateParkingPrice = (newCount, currentCount, unitPrice) => {
            const change = newCount - currentCount;
            return change >= 0 ? change * unitPrice : change * unitPrice / -2;
        };
        const updateLocationPrice = () => {
            locationChangePrice = 0
                + calculateParkingPrice(Number(garageActionWindow.querySelector('#numberParkingSmall').value) || 0, location.parkingSmall, 10000)
                + calculateParkingPrice(Number(garageActionWindow.querySelector('#numberParkingMedium').value) || 0, location.parkingMiddle, 12500)
                + calculateParkingPrice(Number(garageActionWindow.querySelector('#numberParkingBig').value) || 0, location.parkingBig, 15000);
            priceDisplay.textContent = `Preis: ${locationChangePrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`;
        };
        parkingInputs.forEach(input => input.addEventListener('input', updateLocationPrice));

        document.getElementById('confirmGarageActionBtn').addEventListener('click', () => {
            if (gameData.money < locationChangePrice) {
                showToast('Sie haben nicht genügend Geld, um diese Änderungen vorzunehmen.', 'error');
                return;
            };

            let locationName = document.getElementById('garageNameInputText').value.trim();
            if (!locationName) {
                showToast('Bitte geben Sie einen Namen für die Garage ein.', 'error');
                return;
            }

            let garageActionResult = {
                name: locationName,
                parkingSmall: Number(document.getElementById('numberParkingSmall').value) || 0,
                parkingMiddle: Number(document.getElementById('numberParkingMedium').value) || 0,
                parkingBig: Number(document.getElementById('numberParkingBig').value) || 0,
                price: locationChangePrice
            }
            garageActionWindow.remove();
            resolve(garageActionResult);
        })
    })
}

function renderWarehouseLocations() {
    const content = document.getElementById('locationContent');
    content.innerHTML = `
        <div class="warehouse-info">
            <h1>Eigene Lager</h1>
            Lager befinden sich derzeit in der Entwicklung und werden in zukünftigen Updates verfügbar sein.
        </div>
    `;
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