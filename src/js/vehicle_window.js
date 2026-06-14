// vehicle_window.js
// Fahrzeugfenster: Tabs für Garage und Händler und klare Trennung von Logik, Rendering und Aktionen.

import { gameData } from './player_data.js';
import { findMarketVehicle, Kategorien, listMarketByCategory, vehicleDataConfig } from './vehicle_data.js';
import { updateMoneyDisplay, showToast } from './UI.js';

const categoryOrder = new Map(Kategorien.map((category, index) => [category, index]));

function buildVehicleSpecGroups(vehicle) {
    const groups = {};

    for (const [key, config] of Object.entries(vehicleDataConfig)) {

        const value = vehicle[key];

        if (value === undefined)
            continue;

        if (!groups[config.group])
            groups[config.group] = [];

        groups[config.group].push(
            config.unit
                ? `${config.label}: ${value} ${config.unit}`
                : `${config.label}: ${value}`
        );
    }

    return Object.entries(groups).map(([title, items]) => ({
        title,
        items
    }));
}

function renderSpecGroups(vehicle) {
	const groups = buildVehicleSpecGroups(vehicle);
	if (!groups.length) return '';

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
				${renderSpecGroups(vehicle)}
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
				${renderSpecGroups(vehicle)}
			</div>
			<div>
				<button class="buy-btn" data-id="${vehicle.id}">Kaufen</button>
			</div>
		</div>`;
	return item;
}

function sellOwnedVehicle(vehicle, btnGarage) {
	gameData.money += vehicle.preis;
	gameData.ownedVehicles = gameData.ownedVehicles.filter((v) => v.ownedID !== vehicle.ownedID);

	updateMoneyDisplay();
	showToast(`Du hast ${vehicle.name} verkauft.`, 'success');
	btnGarage.click();
}

function purchaseMarketVehicle(vehicle, btnGarage) {
	if (gameData.money < vehicle.preis) {
		showToast('Nicht genug Geld', 'error');
		return;
	}

	gameData.money -= vehicle.preis;
	if (!gameData.ownedVehicles) gameData.ownedVehicles = [];
	gameData.ownedVehicles.push(createOwnedVehicle(vehicle));

	updateMoneyDisplay();
	gameData.expenses.push({ 
		wert: vehicle.preis, 
		beschreibung: `Kauf: ${vehicle.name}`,
		datum: dateValue.textContent || '',
		uhrzeit: timeValue.textContent || ''
	});
	showToast(`Du hast ${vehicle.name} gekauft.`, 'success');
    console.log(gameData.expenses);
	btnGarage.click();
}

function createOwnedVehicle(vehicle) {
    return {
        ownedID: crypto.randomUUID(),
        ...vehicle,
        kilometerstand: 0,
        kaufdatum: dateValue.textContent || ''
    };
}

function findOwnedVehicle(ownedID) {
	return (gameData.ownedVehicles || []).find(v => v.ownedID === ownedID) || null;
}

export function attachVehicleWindow(modal) {
	const body = modal.querySelector('.modal-body');
	if (!body) return;

	body.innerHTML = `
		<div class="vehicle-window-controls">
			<button id="vwGarage" class="vw-btn active">Garage</button>
			<button id="vwDealer" class="vw-btn">Händler</button>
		</div>
		<div id="vwContent" class="vw-content"></div>
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
				<h4>Garage</h4>
				<p>Du besitzt noch keine Fahrzeuge.</p>
			`;
			return;
		}

		content.innerHTML = `
			<h4>Garage</h4>
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
			<h4>Händler</h4>
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
