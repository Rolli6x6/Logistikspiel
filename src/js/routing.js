// routing.js
// Basisdatei für Routendaten und Routenkalkulationen im Logistikspiel.

export function createRoute(start, end, waypoints = []) {
  return {
    start,
    end,
    waypoints,
    createdAt: new Date(),
  };
}

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function randomHamburgPoint() {
  return [
    randomInRange(53.47, 53.63),
    randomInRange(9.85, 10.15),
  ];
}

const HAMBURG_BBOX = [53.47, 9.85, 53.63, 10.15];
let buildingPoints = null;

function formatDistanceMeters(meters) {
  return (meters / 1000).toFixed(2);
}

let routeLayer = null;
let routeMarkers = [];

function clearRoute(map) {
  if (routeLayer) {
    map.removeLayer(routeLayer);
    routeLayer = null;
  }
  routeMarkers.forEach(marker => map.removeLayer(marker));
  routeMarkers = [];
}

async function fetchOsrmRoute(start, end) {
  const coordinates = `${start[1]},${start[0]};${end[1]},${end[0]}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Routing fehlgeschlagen: ${response.status}`);
  }
  const data = await response.json();
  if (!data.routes || data.routes.length === 0) {
    throw new Error('Keine Route gefunden.');
  }
  return data.routes[0];
}

async function fetchBuildingPoints() {
  if (buildingPoints) {
    return buildingPoints;
  }

  const [s, w, n, e] = HAMBURG_BBOX;
  const query = `[out:json][timeout:25];
    (
      node["building"~"commercial|industrial"](${s},${w},${n},${e});
      way["building"~"commercial|industrial"](${s},${w},${n},${e});
      relation["building"~"commercial|industrial"](${s},${w},${n},${e});
      node["landuse"~"commercial|industrial"](${s},${w},${n},${e});
      way["landuse"~"commercial|industrial"](${s},${w},${n},${e});
      relation["landuse"~"commercial|industrial"](${s},${w},${n},${e});
    );
    out center;`;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Overpass-Abfrage fehlgeschlagen: ${response.status}`);
  }

  const data = await response.json();
  const points = data.elements
    .map(element => {
      if (element.type === 'node') {
        return { lat: element.lat, lon: element.lon, tags: element.tags || {} };
      }
      if (element.center) {
        return { lat: element.center.lat, lon: element.center.lon, tags: element.tags || {} };
      }
      return null;
    })
    .filter(Boolean);

  buildingPoints = points;
  return buildingPoints;
}

function selectBuildingPoint(points) {
  if (!points || points.length === 0) {
    return null;
  }
  return points[Math.floor(Math.random() * points.length)];
}

export function initializeRoute(map, buttonElement, infoElement) {
  buttonElement.addEventListener('click', async () => {
    let start = null;
    let end = null;

    try {
      const points = await fetchBuildingPoints();
      if (points.length >= 2) {
        const startIndex = Math.floor(Math.random() * points.length);
        let endIndex = Math.floor(Math.random() * points.length);
        while (endIndex === startIndex && points.length > 1) {
          endIndex = Math.floor(Math.random() * points.length);
        }
        start = points[startIndex];
        end = points[endIndex];
      }
    } catch (error) {
      console.warn('Gebäudedaten konnten nicht geladen werden:', error);
    }

    if (!start || !end) {
      start = { lat: randomHamburgPoint()[0], lon: randomHamburgPoint()[1], tags: {} };
      end = { lat: randomHamburgPoint()[0], lon: randomHamburgPoint()[1], tags: {} };
      infoElement.textContent = 'Fallback-Route verwendet zufällige Punkte in Hamburg.';
    }

    const route = createRoute([start.lat, start.lon], [end.lat, end.lon]);

    try {
      const osrmRoute = await fetchOsrmRoute([start.lat, start.lon], [end.lat, end.lon]);
      clearRoute(map);

      routeLayer = L.geoJSON(osrmRoute.geometry, {
        style: {
          color: '#ef4444',
          weight: 5,
          opacity: 0.9,
        },
      }).addTo(map);

      routeMarkers.push(
        L.marker([start.lat, start.lon]).addTo(map).bindPopup(`Startpunkt: ${start.tags.name || 'Kommerziell/Industrie'}`),
        L.marker([end.lat, end.lon]).addTo(map).bindPopup(`Zielpunkt: ${end.tags.name || 'Kommerziell/Industrie'}`)
      );

      const distanceKm = osrmRoute.distance ? (osrmRoute.distance / 1000).toFixed(2) : 'unbekannt';
      infoElement.textContent = `Route erstellt zwischen Gebäuden der Kategorien Kommerziell/Industrie: ${distanceKm} km.`;
    } catch (error) {
      console.error(error);
      infoElement.textContent = 'Route konnte nicht geladen werden. Bitte versuche es erneut.';
    }
  });
}

export function getRouteLength(route) {
  const points = [route.start, ...route.waypoints, route.end];
  return points.reduce((sum, current, index) => {
    if (index === 0) return 0;
    return sum + haversineDistance(points[index - 1], current);
  }, 0);
}

function haversineDistance(a, b) {
  const toRad = degrees => (degrees * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + sinLon * sinLon * Math.cos(lat1) * Math.cos(lat2);

  return 2 * R * Math.asin(Math.sqrt(h));
}
