export const SISTE_SERVICE_UKJENT = 'Vet ikke / husker ikke dato';

export function validateSisteService(sisteService, sisteServiceUkjent, showStepError) {
  if (sisteServiceUkjent) return true;
  if (String(sisteService || '').trim()) return true;
  showStepError('Velg dato for siste service, eller kryss av at du ikke husker datoen.');
  document.getElementById('sisteService')?.focus();
  return false;
}

export function SisteServiceField({
  sisteService,
  setSisteService,
  sisteServiceUkjent,
  setSisteServiceUkjent,
}) {
  const toggleUkjent = (checked) => {
    setSisteServiceUkjent(checked);
    if (checked) setSisteService('');
  };

  return (
    <div className="field siste-service-field">
      <label htmlFor="sisteService">Når er siste service utført?</label>
      <span className="field__hint">
        Velg dato, eller kryss av nedenfor hvis du ikke husker
      </span>
      <input
        type="date"
        id="sisteService"
        name="sisteService"
        required={!sisteServiceUkjent}
        disabled={sisteServiceUkjent}
        value={sisteService}
        onChange={(e) => setSisteService(e.target.value)}
        aria-describedby="sisteServiceSkip"
      />
      <label className="checkbox-card siste-service-field__skip" id="sisteServiceSkip">
        <input
          type="checkbox"
          name="sisteServiceUkjent"
          checked={sisteServiceUkjent}
          onChange={(e) => toggleUkjent(e.target.checked)}
        />
        <span>{SISTE_SERVICE_UKJENT}</span>
      </label>
    </div>
  );
}

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
