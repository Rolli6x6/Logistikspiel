// window_vehicle.js
// Fahrzeugfenster: Tabs für Garage und Händler und klare Trennung von Logik, Rendering und Aktionen.

import { gameData } from './player_data.js';
import { findMarketVehicle, Kategorien, listMarketByCategory, marketVehicles, vehicleDataConfig } from './vehicle_data.js';
import { updateMoneyDisplay, showToast } from './UI.js';

const categoryOrder = new Map(Kategorien.map((category, index) => [category, index]));

function buildVehicleSpecGroups(vehicle, mode) {
	const groups = {};

	for (const [key, config] of Object.entries(vehicleDataConfig)) {

		const value = config.source
			? vehicle[config.source]
			: vehicle[key];

		if (value === undefined)
			continue;

		if (!groups[config.group])
			groups[config.group] = { items: []};

		if (mode === 'overview') {
			if (config.selectable === true) 
				continue; 

			if (Array.isArray(value)) {
				const range = getRange(value, config.property ?? key);

				if (range.min === range.max) {
					groups[config.group].items.push(
						`${config.label}: ${range.min} ${config.unit ? ' ' + config.unit : ''}`
					);
				}
				else {
					groups[config.group].items.push(
						`${config.label}: ${range.min} bis ${range.max}${config.unit ? ' ' + config.unit : ''}`
					);
				}
			}
			else {
				groups[config.group].items.push(
					config.unit
						? `${config.label}: ${value} ${config.unit}`
						: `${config.label}: ${value}`
				);
			}
		}
		if (mode === 'configuration') {
			if (!config.source && !config.selectable) {
				groups[config.group].items.push({
					type: 'value',
					text: config.unit
						? `${config.label}: ${value} ${config.unit}`
						: `${config.label}: ${value}`
				});
			}

			if (config.selectable === true && Array.isArray(value)) {
				const options = value.map((option) => {
					const details = [];
					for (const [property, propConfig] of Object.entries(vehicleDataConfig)) {
						const sources = Array.isArray(propConfig.source)
							? propConfig.source
							: [propConfig.source];

						if (!sources.includes(key))
							continue;

						if (option[property] === undefined)
							continue;

						details.push(
							propConfig.unit
								? `${propConfig.label}: ${option[property]} ${propConfig.unit}`
								: `${propConfig.label}: ${option[property]}`
						);
					}
					return {
						id: option.id,
						price: option.preis ?? 0,
						name: option.name ?? option.id,
						details
					};
				});
				groups[config.group].items.push({
					type: 'selection',
					label: config.label,
					key,
					options
				}
				);
			}
		}
	}

	return Object.entries(groups).map(([title, group]) => ({
		title,
		items: group.items,
	}));
}

function renderSpecGroups(vehicle, mode) {
	const groups = buildVehicleSpecGroups(vehicle, mode);
	if (!groups.length) return '';

	if (mode === 'overview') {
	return `
		<div class="specs">
			${groups
				.map(
					(group) => `
						<div class="spec-group">
							<strong>${group.title}</strong>
							${group.items.map((item) => `<div>${item}</div>`).join('')}
						</div>`,
				)
				.join('')}
		</div>`;
	}

	if (mode === 'configuration') {
		return `
			${groups.map((group) => `
			<tr> 
				<td> ${group.title} </td>
				<td> ${group.items.map((item) => {
					if (item.type === 'value') {
						return `<div>${item.text}</div>`;
					}
					if (item.type === 'selection') {
						return `
							<div>
								<strong>${item.label}</strong><br>
								${item.options.map((option) => `
									<label class="vehicle-option">
										<input type="radio" name="${item.key}" value="${option.id}" price="${option.price}">
										Variante: ${option.name}<br>
										${option.details.length
											? `${option.details.join('<br>')}`
											: ''}
									</label>
								`).join('')}
							</div>
						`;
					}
				}).join('')}</td>
			</tr>
			`
			).join('')}
		`
	}
}

function renderGarageSelection(vehicle) {
	let ownedLocations = gameData.ownedLocations || [];
	if (ownedLocations.length === 0) {
		return 'Du besitzt noch keine Garagen. Bitte kaufe zuerst eine Garage.';
	}
	if (vehicle.parkplatz === 'klein') {
		ownedLocations = ownedLocations.filter(location => location.parkingSmall > 0 && location.parkingSmallUsed < location.parkingSmall);
		if (ownedLocations.length === 0) {
			return 'Du hast keine freien kleinen Parkplätze.';
		}
		else {
			return `
				${ownedLocations.map((location) => `
					<label>
						<input type="radio" name="garageSelection" value="${location.id}">
						${location.name}: ${location.parkingSmall-location.parkingSmallUsed} von ${location.parkingSmall} kleine Parkplätze frei
					</label>
				`).join('<br>')}
			`
		}
	}
	if (vehicle.parkplatz === 'mittel') {
		ownedLocations = ownedLocations.filter(location => location.parkingMiddle > 0 && location.parkingMiddleUsed < location.parkingMiddle);
		if (ownedLocations.length === 0) {
			return 'Du hast keine freien mittleren Parkplätze.';
		}
		else {
			return `
				${ownedLocations.map((location) => `
					<label>
						<input type="radio" name="garageSelection" value="${location.id}">
						${location.name}: ${location.parkingMiddle-location.parkingMiddleUsed} von ${location.parkingMiddle} mittlere Parkplätze frei
					</label>
				`).join('<br>')}
			`
		}
	}
	if (vehicle.parkplatz === 'groß') {
		ownedLocations = ownedLocations.filter(location => location.parkingBig > 0 && location.parkingBigUsed < location.parkingBig);
		if (ownedLocations.length === 0) {
			return 'Du hast keine freien großen Parkplätze.';
		}
		else {
			return `
				${ownedLocations.map((location) => `
					<label>
						<input type="radio" name="garageSelection" value="${location.id}">
						${location.name}: ${location.parkingBig-location.parkingBigUsed} von ${location.parkingBig} große Parkplätze frei
					</label>
				`).join('<br>')}
			`
		}
	}
}

function getRange(array, property) {
	const values = array.map(item => item[property]);
	return {
		min: Math.min(...values),
		max: Math.max(...values)
	}
}

function sortMarketVehicles(list) {
	return list.slice().sort((a, b) => {
		const orderA = categoryOrder.get(a.kategorie) ?? Number.MAX_SAFE_INTEGER;
		const orderB = categoryOrder.get(b.kategorie) ?? Number.MAX_SAFE_INTEGER;
		if (orderA !== orderB) return orderA - orderB;
		return a.name.localeCompare(b.name, 'de', { sensitivity: 'base' });
	});
}

function sortByName(list) {
	return list.slice().sort((a, b) => a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }));
}

function createOwnedVehicleItem(vehicle) {
	const li = document.createElement('li');
	li.innerHTML = `
		<div class="owned-item">
			<div class="owned-info">
				<strong>${vehicle.name}</strong>
				${renderSpecGroups(vehicle, 'overview')}
			</div>
			<div>
				<button class="sell-btn" data-owned-i-d="${vehicle.ownedID}">Verkaufen</button>
			</div>
		</div>`;
	return li;
}

function createMarketItem(vehicle) {
	const item = document.createElement('div');
	item.className = 'market-item';
	item.innerHTML = `
		<div class="market-main">
			<div class="market-info">
				<strong>${vehicle.name}</strong> 
				${renderSpecGroups(vehicle, 'overview')}
			</div>
			<div>
				<button class="buy-btn" data-id="${vehicle.id}">Kaufen</button>
			</div>
		</div>`;
	return item;
}

function sellOwnedVehicle(vehicle, btnGarage) {
	gameData.money += vehicle.kaufpreis;
	gameData.ownedVehicles = gameData.ownedVehicles.filter((v) => v.ownedID !== vehicle.ownedID);
	gameData.ownedLocations.forEach(location => {
		if (location.id === vehicle.standort) {
			if (vehicle.parkplatz === 'klein') {
				location.parkingSmallUsed -= 1;
			}
			else if (vehicle.parkplatz === 'mittel') {
				location.parkingMiddleUsed -= 1;
			}
			else if (vehicle.parkplatz === 'groß') {
				location.parkingBigUsed -= 1;
			}
		}
	});

	updateMoneyDisplay();
	gameData.income.push({ 
		wert: vehicle.kaufpreis, 
		beschreibung: `Verkauf: ${vehicle.name}`,
		datum: dateValue.textContent || '',
		uhrzeit: timeValue.textContent || ''
	});
	showToast(`Du hast ${vehicle.name} verkauft.`, 'success');
	btnGarage.click();
}

async function purchaseMarketVehicle(vehicle, btnGarage) {
	const window = document.querySelector('.app-modal');
	window.classList.add('hidden');
	try {
    	const vehicleConfigResult = await renderVehicleConfigWindow(vehicle);
    	if (!vehicleConfigResult) {
      		window.classList.remove("hidden");
		    return;
    	}
    	gameData.money -= vehicleConfigResult.configPrice;
    	updateMoneyDisplay();
		gameData.expenses.push({
			wert: vehicleConfigResult.configPrice,
			beschreibung: `Kauf: ${vehicle.name}`,
			datum: dateValue.textContent || '',
			uhrzeit: timeValue.textContent || ''
		});
		showToast(`Du hast ${vehicle.name} gekauft.`, 'success');
    	gameData.ownedVehicles.push(
      		createOwnedVehicle(vehicle, vehicleConfigResult),
    	);
		console.log('Fahrzeug gekauft:', gameData.ownedVehicles);
		
		gameData.ownedLocations.forEach(location => {
			if (location.id === vehicleConfigResult.garageSelection) {
				if (vehicle.parkplatz === 'klein') {
					location.parkingSmallUsed += 1;
				}
				else if (vehicle.parkplatz === 'mittel') {
					location.parkingMiddleUsed += 1;
				}
				else if (vehicle.parkplatz === 'groß') {
					location.parkingBigUsed += 1;
				}
			}
		});

		btnGarage.click();
    	window.classList.remove("hidden");
  	} catch (error) {
    	window.classList.remove("hidden");
  	}
}

function createOwnedVehicle(vehicle, configResult) {
    const ownedVehicle = structuredClone(vehicle);

    for (const [key, config] of Object.entries(vehicleDataConfig)) {
        if (!config.selectable)
            continue;

        const options = vehicle[key];
        const selectedId = configResult[key];

        if (!Array.isArray(options) || !selectedId)
            continue;

        const selectedOption = options.find(
            option => option.id === selectedId
        );

        if (selectedOption) {
            ownedVehicle[key] = [structuredClone(selectedOption)];
        }
    }

    return {
        ...ownedVehicle,
        ownedID: crypto.randomUUID(),
        kennzeichen: configResult.kennzeichen,
		standort: configResult.garageSelection,
        kilometerstand: 0,
        kaufdatum: dateValue.textContent || '',
		kaufpreis: configResult.configPrice
    };
}

function renderVehicleConfigWindow(vehicle) {
	return new Promise((resolve, reject) => {
		const vehicleConfigInput = document.createElement('div');
		vehicleConfigInput.className = 'app-modal';
		vehicleConfigInput.innerHTML = `
			<div class="modal-overlay"></div>
        	<div class="modal-window">
            	<header>
                	<h3>Fahrzeug konfigurieren</h3>
					<div id="vehicleConfigPriceDisplay"> Preis: ${vehicle.basispreis.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} </div>
	                <button class="modal-close" aria-label="Schließen">&times;</button>
    	        </header>
            	<div class="modal-body">
					<table class="vehicleConfigTable" border="2px">
						<tr>
							<th width="20%"> Modell: </th>
							<th width="80%"> ${vehicle.name} </th>
						</tr>
						${renderSpecGroups(vehicle, 'configuration')}
						<tr>
							<td> Kennzeichen: </td>
							<td> <input type="text" id="kennzeichenInput" placeholder="Kennzeichen eingeben"> </td>
						</tr>
						<tr>
							<td> Standort: </td>
							<td> ${renderGarageSelection(vehicle)} </td>
						</tr>
					</table>
					<button class="buy-btn">Kaufen</button><br><br>
				</div>
			</div>
		`;
		document.body.appendChild(vehicleConfigInput);

		vehicleConfigInput.querySelector('.modal-close').addEventListener('click', () => {
			vehicleConfigInput.remove();
			const vehicleConfigResult = null;
			reject(vehicleConfigResult);
		});

		vehicleConfigInput.querySelectorAll('input[type="radio"]').forEach((radio) => {
			radio.addEventListener('click', () => {
				const configPrice = calculateConfigPrice(vehicle, vehicleConfigInput);
				updatevehicleConfigPriceDisplay(configPrice);
			});
		});

		vehicleConfigInput.querySelector('.buy-btn').onclick = () => {
			const radioGroups = new Set(
				[...vehicleConfigInput.querySelectorAll('input[type="radio"]')]
					.map(radio => radio.name)
			);

			for (const groupName of radioGroups) {
				const selectedRadio = vehicleConfigInput.querySelector(`input[type="radio"][name="${groupName}"]:checked`);

				if (!selectedRadio) {
					if (groupName === 'garageSelection') {
						showToast('Bitte wähle eine Garage aus, in der das Fahrzeug geparkt werden soll.', 'error');
						return;
					}
					else {
						showToast('Bitte wähle eine Variante für alle Optionen aus.', 'error');
						return;
					}
				}
			}

			if (!vehicleConfigInput.querySelector('input[type="radio"][name="garageSelection"]:checked')) {
				showToast('Bitte wähle eine Garage aus, in der das Fahrzeug geparkt werden soll.', 'error');
				return;
			}

			const selectedOptions = Object.fromEntries(
				[...vehicleConfigInput.querySelectorAll('input[type="radio"]:checked')]
					.map((radio) => [radio.name, radio.value])
			);

			const vehicleConfigResult = {
				...selectedOptions,
				kennzeichen: vehicleConfigInput.querySelector('#kennzeichenInput').value
			};
			const configPrice = calculateConfigPrice(vehicle, vehicleConfigInput);
			if (gameData.money < configPrice) {
				showToast('Du hast nicht genug Geld, um dieses Fahrzeug zu kaufen.', 'error');
				return;
			}
			vehicleConfigInput.remove();
			resolve({
				...vehicleConfigResult,
				configPrice
			});
		};
	})
}

function calculateConfigPrice(vehicle, vehicleConfigInput) {
  const selectedPrices = [...vehicleConfigInput.querySelectorAll('input[type="radio"]:checked')]
    .map(radio => Number.parseFloat(radio.getAttribute('price') ?? 0));

  const configPrice = selectedPrices.reduce((sum, price) => sum + price, 0)
    + Number(vehicle.basispreis || 0);

  return configPrice;
}

function updatevehicleConfigPriceDisplay(configPrice) {
	const priceDisplay = document.getElementById('vehicleConfigPriceDisplay');
	priceDisplay.textContent = `Preis: ${configPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}`;
}
function findOwnedVehicle(ownedID) {
	return (gameData.ownedVehicles || []).find(v => v.ownedID === ownedID) || null;
}

export function attachVehicleWindow(modal) {
	const body = modal.querySelector('.modal-body');
	if (!body) return;

	body.innerHTML = `
		<div class="window-controls">
			<button id="vwGarage" class="tab-controls vw-btn active">Garage</button>
			<button id="vwDealer" class="tab-controls vw-btn">Händler</button>
		</div>
		<div id="vwContent" class="window-content"></div>
	`;

	const btnGarage = modal.querySelector('#vwGarage');
	const btnDealer = modal.querySelector('#vwDealer');
	const content = modal.querySelector('#vwContent');

	function setActiveTab(button) {
		modal.querySelectorAll('.vw-btn').forEach((btn) => btn.classList.remove('active'));
		if (button) button.classList.add('active');
	}

	function getOwnedVehiclesByCategory(category) {
		if (!category) return (gameData.ownedVehicles || []).slice();
		return (gameData.ownedVehicles || []).filter((v) => v.kategorie === category);
	}

	function renderOwnedVehiclesList(container, category) {
		container.innerHTML = '';
		const ownedList = getOwnedVehiclesByCategory(category);
		const sorted = category ? sortByName(ownedList) : sortMarketVehicles(ownedList);

		if (sorted.length === 0) {
			container.innerHTML = '<p>Keine Fahrzeuge in dieser Kategorie.</p>';
			return;
		}

		sorted.forEach((vehicle) => 
			container.appendChild(createOwnedVehicleItem(vehicle))
	);
	}

	function renderGarage(initialCategory = null) {
		const ownedVehicles = gameData.ownedVehicles || [];

		if (ownedVehicles.length === 0) {
			content.innerHTML = `
				<p>Du besitzt noch keine Fahrzeuge.</p>
			`;
			return;
		}

		content.innerHTML = `
			<div id="categoryControls" class="category-controls"></div>
			<div id="garageList"></div>
		`;

		const categoryControls = modal.querySelector('#categoryControls');
		const garageList = modal.querySelector('#garageList');

		function handleCategorySelect(category, selectedButton) {
			categoryControls.querySelectorAll('.category-btn').forEach((btn) => btn.classList.remove('active'));
			selectedButton.classList.add('active');
			renderOwnedVehiclesList(garageList, category);
		}

		renderCategoryButtons(categoryControls, initialCategory, handleCategorySelect);
		renderOwnedVehiclesList(garageList, initialCategory);

		garageList.addEventListener('click', (event) => {
			const btn = event.target.closest('.sell-btn');
			if (!btn) return;
			const sellVehicle = findOwnedVehicle(btn.dataset.ownedID);
			if (!sellVehicle) {
				showToast('Fahrzeug nicht gefunden', 'error');
				return;
			}
			sellOwnedVehicle(sellVehicle, btnGarage);
		});
	}

	function renderCategoryButtons(container, selectedCategory, onSelect) {
		container.innerHTML = '';

		const allButton = document.createElement('button');
		allButton.className = `category-btn${selectedCategory ? '' : ' active'}`;
		allButton.textContent = 'Alle';
		allButton.dataset.cat = '';
		allButton.addEventListener('click', () => onSelect(null, allButton));
		container.appendChild(allButton);

		Kategorien.forEach((category) => {
			const button = document.createElement('button');
			button.className = `category-btn${selectedCategory === category ? ' active' : ''}`;
			button.textContent = category;
			button.dataset.cat = category;
			button.addEventListener('click', () => onSelect(category, button));
			container.appendChild(button);
		});
	}

	function renderMarketList(container, category, btnGarage) {
		container.innerHTML = '';
		const marketList = listMarketByCategory(category);
		const sorted = category ? sortByName(marketList) : sortMarketVehicles(marketList);

		if (sorted.length === 0) {
			container.innerHTML = '<p>Keine Angebote in dieser Kategorie.</p>';
			return;
		}

		sorted.forEach((vehicle) => 
			container.appendChild(createMarketItem(vehicle))
		);
	}

	function renderDealer(initialCategory = null) {
		content.innerHTML = `
			<div id="categoryControls" class="category-controls"></div>
			<div id="marketList"></div>
		`;

		const categoryControls = modal.querySelector('#categoryControls');
		const marketList = modal.querySelector('#marketList');

		function handleCategorySelect(category, selectedButton) {
			categoryControls.querySelectorAll('.category-btn').forEach((btn) => btn.classList.remove('active'));
			selectedButton.classList.add('active');
			renderMarketList(marketList, category, btnGarage);
		}

		renderCategoryButtons(categoryControls, initialCategory, handleCategorySelect);
		renderMarketList(marketList, initialCategory, btnGarage);

		marketList.addEventListener('click', (event) => {
			const btn = event.target.closest('.buy-btn');
			if (!btn) return;
			const offer = findMarketVehicle(btn.dataset.id);
			if (!offer) {
				showToast('Angebot nicht gefunden', 'error');
				return;
			}
			purchaseMarketVehicle(offer, btnGarage);
		});

	}

	btnGarage.addEventListener('click', () => {
		setActiveTab(btnGarage);
		renderGarage();
	});

	btnDealer.addEventListener('click', () => {
		setActiveTab(btnDealer);
		renderDealer();
	});

	renderGarage();
}
