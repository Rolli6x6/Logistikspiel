import { initializeRoute } from './routing.js';

export function initializeMap() {
  const map = L.map('map', {
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
