import { map } from './load_map.js';

export async function requestRoute(startA, endA) {
    let start = [53.59719, 9.97765 ];
    let end = [53.5511, 9.9937];

    const url = 
        'https://router.project-osrm.org/route/v1/driving/' + 
        start[1] + ',' + start[0] + ';' + end[1] + ',' + end[0] + 
        '?overview=full&geometries=geojson';

    const response = await fetch(url);
    const data = await response.json();

    console.log('Routing response:', data);
    showRouteOnMap(data);
    return data;
}

export function showRouteOnMap(routeData) {
    routeData.routes.forEach(route => {
        const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const routeLine = L.polyline(routeCoordinates, { color: 'blue' }).addTo(map);
        const routeMarkers = [
            L.marker(routeCoordinates[0]).addTo(map).bindPopup('Startpunkt'),
            L.marker(routeCoordinates[routeCoordinates.length - 1]).addTo(map).bindPopup('Endpunkt')
        ];  
        map.fitBounds(routeLine.getBounds());
    });
}