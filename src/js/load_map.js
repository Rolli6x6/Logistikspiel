import { initializeRoute } from './routing alt.js';
import { gameData } from './player_data.js';

export let map; 
export function initializeMap() {
  map = L.map('map', {
    zoomControl: false,
  }).setView([53.5511, 9.9937], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> Contributors',
    maxZoom: 19,
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  const randomRouteBtn = document.getElementById('randomRouteBtn');
  const routeInfo = document.getElementById('routeInfo');

  initializeRoute(map, randomRouteBtn, routeInfo);

  console.log('OpenStreetMap geladen.');
}

export function setGarageMarker(lat, lng) {
  gameData.ownedGarages.forEach(garage => {
    L.marker([garage.lat, garage.lng]).addTo(map);
  });
}