// Daten für Fahrzeuge. Keine Kauf-Logik hier.


export const Kategorien = [
  'Transporter',
  'Autoanhänger',
  'Sattelzugmaschine',
  'Auflieger',
];

export const marketVehicles = [
  { id: 'm1', name: 'LKW Gebraucht', kategorie: 'Transporter', kompatibel: 'Autoanhänger', preis: 15000, marke: 'Mercedes', modell: 'Sprinter Kasten', zylinder: 4, hubraum_ccm: 2143, leistung_kw: 103, drehmoment_nm: 380, verbrauch_l_per_100km: 8.5, ldm: 10.5, gewicht_kg: 2500, max_gewicht_kg: 3500, max_zuladung_kg: 1200 },
  { id: 'm2', name: 'Sprinter Neu', kategorie: 'Transporter', preis: 25000, marke: 'VW', modell: 'Crafter', zylinder: 4, hubraum_ccm: 1968, leistung_kw: 122, drehmoment_nm: 430, verbrauch_l_per_100km: 7.9, ldm: 9.8, gewicht_kg: 2600, max_gewicht_kg: 3600, max_zuladung_kg: 1000 },
  { id: 'm3', name: 'Zugmaschine', kategorie: 'Sattelzugmaschine', preis: 45000, marke: 'Scania', modell: 'R450', zylinder: 6, hubraum_ccm: 12900, leistung_kw: 330, drehmoment_nm: 1500, verbrauch_l_per_100km: 24.5, gewicht_kg: 8500 },
  { id: 'm4', name: 'Autoanhänger-Standard', kategorie: 'Autoanhänger', preis: 12000, marke: 'Schmitz', modell: 'Standard', art: 'Plane', ldm: 34.0, gewicht_kg: 4100, anzahl_achsen: 2 },
  { id: 'm5', name: 'Kühlauflieger', kategorie: 'Auflieger', preis: 35000, marke: 'Krone', modell: 'Cool Liner', art: 'Kühler', ldm: 48.0, gewicht_kg: 5200, anzahl_achsen: 3 },
];

export const vehicleDataConfig = {
    kompatibel: { label: 'Kompatibel mit', group: 'Basisdaten' },
    preis: { label: 'Preis', unit: '€', group: 'Basisdaten' },
    marke: { label: 'Marke', group: 'Basisdaten' },
    modell: { label: 'Modell', group: 'Basisdaten' },
    art: { label: 'Art', group: 'Basisdaten' },
    zylinder: { label: 'Zylinder', unit: '', group: 'Technische Daten' },
    hubraum_ccm: { label: 'Hubraum', unit: 'ccm', group: 'Technische Daten' },
    leistung_kw: { label: 'Leistung', unit: 'kW', group: 'Technische Daten' },
    drehmoment_nm: { label: 'Drehmoment', unit: 'Nm', group: 'Technische Daten' },
    verbrauch_l_per_100km: { label: 'Verbrauch', unit: 'l/100km', group: 'Technische Daten' },
    ldm: { label: 'Lademeter', unit: 'm', group: 'Lademöglichkeiten' },
    gewicht_kg: { label: 'Gewicht', unit: 'kg', group: 'Lademöglichkeiten' },
    anzahl_achsen: { label: 'Anzahl Achsen', unit: '', group: 'Lademöglichkeiten' },
    max_zuladung_kg: { label: 'max. Zuladung', unit: 'kg', group: 'Lademöglichkeiten' },
    max_gewicht_kg: { label: 'max. Gewicht', unit: 'kg', group: 'Lademöglichkeiten' },
    kilometerstand: { label: 'Kilometerstand', unit: 'km', group: 'Status' },
    kaufdatum: { label: 'Kaufdatum', unit: '', group: 'Status' },
};

export function findMarketVehicle(id) {
  return marketVehicles.find(v => v.id === id) || null;
}

export function listMarketByCategory(category) {
  if (!category) return marketVehicles.slice();
  return marketVehicles.filter(v => v.kategorie === category);
}
