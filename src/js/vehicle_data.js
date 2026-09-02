// Daten für Fahrzeuge. Keine Kauf-Logik hier.


export const Kategorien = [
  'Transporter',
  'Autoanhänger',
  'Sattelzugmaschine',
  'Auflieger',
];

export const marketVehicles = [
  {
    id: 'MB Sprinter', 
    name: 'Mercedes-Benz Sprinter',
    marke: 'Mercedes-Benz',
    modell: 'Sprinter',
    kategorie: 'Transporter',
    kompatibel: 'Autoanhänger',
    parkplatz: 'klein',
    baujahr: 2024,
    basispreis: 35000,
    tank: 75,
    motor: [
      {
        id: 'x11 CDI', 
        name: '11 CDI', 
        zylinder: 4,
        hubraum_ccm: 1950,
        leistung_kw: 84,
        drehmoment_nm: 300,
        preis: 0
      },
      {
        id: 'x15 CDI', 
        name: '15 CDI', 
        zylinder: 4,
        hubraum_ccm: 1950,
        leistung_kw: 110,
        drehmoment_nm: 340,
        preis: 1000
      },
      {
        id: 'x17 CDI', 
        name: '17 CDI', 
        zylinder: 4,
        hubraum_ccm: 1950,
        leistung_kw: 125,
        drehmoment_nm: 380,
        preis: 2000
      },
      {
        id: 'x19 CDI', 
        name: '19 CDI', 
        zylinder: 4,
        hubraum_ccm: 1950,
        leistung_kw: 140,
        drehmoment_nm: 450,
        preis: 3000
      }
    ],
    karosserie: [
      {
        id: 'L1H1',
        name: 'Standard Standarddach',
        ladevolumen: 7.8,
        ldm: 7.2,
        maxGewicht: 3000,
        preis: 0
      },
      {
        id: 'L2H2',
        name: 'Lang Hochdach',
        ladevolumen: 11,
        ldm: 9.6,
        maxGewicht: 3500,
        preis: 3000
      },
      {
        id: 'L3H2',
        name: 'Extralang Hochdach',
        ladevolumen: 14,
        ldm: 12.6,
        maxGewicht: 4100,
        preis: 6000
      }
    ]
  },
  {
    id: 'Scania S',
    name: 'Scania S-Serie',
    marke: 'Scania',
    modell: 'S-Serie',
    kategorie: 'Sattelzugmaschine',
    kompatibel: 'Auflieger',
    parkplatz: 'groß',
    baujahr: 2016,
    basispreis: 120000,
    motor: [
      {
        id: 'V8 590',
        name: 'V8 590',
        zylinder: 8,
        hubraum_ccm: 16500,
        leistung_kw: 434,
        drehmoment_nm: 3050,
        verbrauch_l_per_100km: 25,
        preis: 0
      },
      {
        id: 'V8 660',
        name: 'V8 660',
        zylinder: 8,
        hubraum_ccm: 16500,
        leistung_kw: 485,
        drehmoment_nm: 3300,
        verbrauch_l_per_100km: 28,
        preis: 0
      },
      {
        id: 'V8 770',
        name: 'V8 770',
        zylinder: 8,
        hubraum_ccm: 16500,
        leistung_kw: 567,
        drehmoment_nm: 3700,
        verbrauch_l_per_100km: 30,
        preis: 0
      },
    ],
    achskonfiguration: [
      {
        id: '4x2',
        name: '4x2',
        anzahl_achsen: 2,
        angetriebene_achsen: 1,
      }, 
      {
        id: '6x2',
        name: '6x2',
        anzahl_achsen: 3,
        angetriebene_achsen: 1,
      },
    ]
  },
];

export const vehicleDataConfig = {
    marke: { label: 'Marke', group: 'Basisdaten' },
    modell: { label: 'Modell', group: 'Basisdaten' },
    basispreis: { label: 'Grundpreis', unit: '€', group: 'Basisdaten' },
    preis: { label: 'Aufpreis', unit: '€' },
    kaufpreis: { label: 'Kaufpreis', unit: '€', group: 'Basisdaten' },
    art: { label: 'Art', group: 'Basisdaten' },
    baujahr: { label: 'Modelljahr', group: 'Basisdaten' },
    vmax_kmh: { label: 'Geschwindigkeit', unit: 'km/h', group: 'Basisdaten' },
    kompatibel: { label: 'Kompatibel mit', group: 'Basisdaten' },
    parkplatz: { label: 'benötigter Parkplatz', group: 'Basisdaten' },
    motor: { label: 'Motor', group: 'Technische Daten', selectable: true },
    zylinder: { label: 'Zylinder', unit: '', group: 'Technische Daten', source: 'motor' },
    hubraum_ccm: { label: 'Hubraum', unit: 'ccm', group: 'Technische Daten', source: 'motor' },
    leistung_kw: { label: 'Leistung', unit: 'kW', group: 'Technische Daten', source: 'motor' },
    drehmoment_nm: { label: 'Drehmoment', unit: 'Nm', group: 'Technische Daten', source: 'motor' },
    verbrauch_l_per_100km: { label: 'Verbrauch', unit: 'l/100km', group: 'Technische Daten' },
    tank: { label: 'Tankkapazität', unit: 'l', group: 'Technische Daten' },
    karosserie: { label: 'Karosserie', group: 'Lademöglichkeiten', selectable: true },
    achskonfiguration: { label: 'Achskonfiguration', group: 'Lademöglichkeiten', selectable: true },
    ldm: { label: 'Lademeter', unit: 'm', group: 'Lademöglichkeiten', source: 'karosserie' },
    ladevolumen: { label: 'Ladevolum', unit: 'm³', group: 'Lademöglichkeiten', source: 'karosserie' },
    gewicht_kg: { label: 'Gewicht', unit: 'kg', group: 'Lademöglichkeiten' },
    anzahl_achsen: { label: 'Anzahl Achsen', unit: '', group: 'Lademöglichkeiten', source: 'achskonfiguration' },
    angetriebene_achsen: { label: 'Angetriebene Achsen', unit: '', group: 'Lademöglichkeiten', source: 'achskonfiguration' },
    maxZuladung: { label: 'max. Zuladung', unit: 'kg', group: 'Lademöglichkeiten' },
    maxGewicht: { label: 'max. Gewicht', unit: 'kg', group: 'Lademöglichkeiten', source: 'karosserie' },
    kilometerstand: { label: 'Kilometerstand', unit: 'km', group: 'Status' },
    kaufdatum: { label: 'Kaufdatum', unit: '', group: 'Status' },
};

export const vehicleDataSources = Object.entries(vehicleDataConfig)
  .filter(([, config]) => config.selectable)
  .map(([key]) => key);

vehicleDataConfig.preis.source = vehicleDataSources;

export function findMarketVehicle(id) {
  return marketVehicles.find(v => v.id === id) || null;
}

export function listMarketByCategory(category) {
  if (!category) return marketVehicles.slice();
  return marketVehicles.filter(v => v.kategorie === category);
}
