export const UTSTYR_OPTIONS = [
  'Navigasjon',
  'Hengerfeste',
  'DAB-radio',
  'Bluetooth',
  'Ryggekamera',
  '360-kamera',
  'Parkeringssensor',
  'Webasto/parkeringsvarmer',
  'Adaptive Cruise Control ACC',
  'Skinnseter',
  'Delskinn',
  'Stoffseter',
  'Panorama/soltak',
  'Oppvarmet ratt',
  'Oppvarmede forseter',
  'Oppvarmede bakseter',
  'Keyless GO',
];

export const VEHICLE_LOOKUP_FIELDS = [
  ['Modell', (vehicle) => [vehicle.merke, vehicle.modell].filter(Boolean).join(' ') || vehicle.modell],
  ['Kjøretøygruppe', (vehicle) => vehicle.kjoretoyGruppe || vehicle.kjoretoyType],
  ['Drivstoff', 'drivstoff'],
  ['Girkasse', 'girkasse'],
  ['Siste EU-kontroll', 'sisteEuKontroll'],
  ['Neste EU-kontroll', 'nesteEuKontroll'],
];

export function formatCellValue(value) {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'object') return '';
  return String(value);
}

export function normalizeReg(value) {
  return String(value || '').toUpperCase().replace(/\s/g, '');
}

export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function VehicleCard({ vehicle }) {
  if (!vehicle) return null;

  return (
    <>
      <div className="vehicle-card__head">
        <h4>{vehicle.regNr || 'Kjøretøy funnet'}</h4>
        <span className="vehicle-card__badge">Hentet fra Kjøretøyregisteret</span>
      </div>
      <div className="vehicle-card__grid">
        {VEHICLE_LOOKUP_FIELDS.map(([label, keyOrFn]) => {
          const value = typeof keyOrFn === 'function' ? keyOrFn(vehicle) : vehicle[keyOrFn];
          const text = formatCellValue(value);
          if (!text) return null;
          return (
            <div key={label} className="vehicle-card__item">
              <span className="vehicle-card__label">{label}</span>
              <span className="vehicle-card__value">{text}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
