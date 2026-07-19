import { useState, useRef, useCallback } from 'react';
import PageHero from '../components/PageHero';

const TOTAL_STEPS = 5;
const STEP_TITLES = ['Bilinfo', 'Utstyr', 'Service', 'Annet', 'Kontakt'];

const UTSTYR_OPTIONS = [
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

const INNBYTTE_VEHICLE_FIELDS = [
  ['Modell', (vehicle) => [vehicle.merke, vehicle.modell].filter(Boolean).join(' ') || vehicle.modell],
  ['Kjøretøygruppe', (vehicle) => vehicle.kjoretoyGruppe || vehicle.kjoretoyType],
  ['Drivstoff', 'drivstoff'],
  ['Girkasse', 'girkasse'],
  ['Siste EU-kontroll', 'sisteEuKontroll'],
  ['Neste EU-kontroll', 'nesteEuKontroll'],
];

function formatCellValue(value) {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) return value.filter(Boolean).join(', ');
  if (typeof value === 'object') return '';
  return String(value);
}

function normalizeReg(value) {
  return String(value || '').toUpperCase().replace(/\s/g, '');
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function VehicleCard({ vehicle }) {
  if (!vehicle) return null;

  return (
    <>
      <div className="vehicle-card__head">
        <h4>{vehicle.regNr || 'Kjøretøy funnet'}</h4>
        <span className="vehicle-card__badge">Hentet fra Kjøretøyregisteret</span>
      </div>
      <div className="vehicle-card__grid">
        {INNBYTTE_VEHICLE_FIELDS.map(([label, keyOrFn]) => {
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

export default function InnbyttePage() {
  const formRef = useRef(null);
  const progressRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [regnr, setRegnr] = useState('');
  const [kilometerstand, setKilometerstand] = useState('');
  const [vehicleData, setVehicleData] = useState(null);
  const [hiddenFields, setHiddenFields] = useState({
    merke: '',
    modell: '',
    arsmodell: '',
    drivstoff: '',
    farge: '',
    kjoretoyType: '',
  });
  const [utstyr, setUtstyr] = useState([]);
  const [servicehistorikk, setServicehistorikk] = useState('');
  const [sisteService, setSisteService] = useState('');
  const [sommerdekk, setSommerdekk] = useState('');
  const [vinterdekk, setVinterdekk] = useState('');
  const [forventning, setForventning] = useState('');
  const [kommentar, setKommentar] = useState('');
  const [finnKode, setFinnKode] = useState('');
  const [navn, setNavn] = useState('');
  const [mobil, setMobil] = useState('');
  const [epost, setEpost] = useState('');

  const [lookupStatus, setLookupStatus] = useState({ message: '', type: 'info', visible: false });
  const [stepAlert, setStepAlert] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMsgVisible, setFormMsgVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const setStatus = useCallback((message, type = 'info') => {
    setLookupStatus({ message, type, visible: !!message });
  }, []);

  const clearVehicleDisplay = useCallback(() => {
    setVehicleData(null);
    setHiddenFields({
      merke: '',
      modell: '',
      arsmodell: '',
      drivstoff: '',
      farge: '',
      kjoretoyType: '',
    });
  }, []);

  const showVehicle = useCallback(
    (vehicle) => {
      if (!vehicle || typeof vehicle !== 'object') return;
      setVehicleData(vehicle);
      setHiddenFields({
        merke: formatCellValue(vehicle.merke),
        modell: formatCellValue(vehicle.modell),
        arsmodell: formatCellValue(vehicle.arsmodell),
        drivstoff: formatCellValue(vehicle.drivstoff),
        farge: formatCellValue(vehicle.farge),
        kjoretoyType: formatCellValue(vehicle.kjoretoyType),
      });
      setStatus('Bil funnet i Kjøretøyregisteret.', 'success');
    },
    [setStatus]
  );

  const lookupVehicle = async () => {
    const normalized = normalizeReg(regnr);
    setRegnr(normalized);

    if (normalized.length < 4) {
      setStatus('Skriv inn et gyldig registreringsnummer.', 'error');
      clearVehicleDisplay();
      return;
    }

    setLookupLoading(true);
    setStatus('Slår opp i Kjøretøyregisteret...', 'info');

    try {
      const res = await fetch(`/api/kjoretoy?regnr=${encodeURIComponent(normalized)}`);
      const data = await res.json();
      if (!res.ok) {
        clearVehicleDisplay();
        if (data.code === 'MISSING_API_KEY') {
          setStatus('Kjøretøyoppslag er ikke konfigurert ennå. Kontakt oss på telefon i mellomtiden.', 'error');
        } else {
          setStatus(data.error || 'Kunne ikke hente bilinfo.', 'error');
        }
        return;
      }
      showVehicle(data.vehicle);
    } catch {
      clearVehicleDisplay();
      setStatus('Kunne ikke kontakte serveren. Sjekk at nettsiden kjører via npm start.', 'error');
    } finally {
      setLookupLoading(false);
    }
  };

  const clearAlerts = useCallback(() => {
    setStepAlert('');
    if (currentStep !== 1) setStatus('', 'info');
  }, [currentStep, setStatus]);

  const showStepError = useCallback(
    (message) => {
      if (currentStep === 1) {
        setStatus(message, 'error');
      } else {
        setStepAlert(message);
      }
    },
    [currentStep, setStatus]
  );

  const validateRadioGroup = (value, message) => {
    if (value) return true;
    showStepError(message);
    return false;
  };

  const validatePanelFields = (panel) => {
    const fields = panel.querySelectorAll('input, select, textarea');
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (field.type === 'radio' || field.type === 'checkbox') continue;
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return false;
      }
    }
    return true;
  };

  const validateStep = (step) => {
    clearAlerts();
    const panel = formRef.current?.querySelector(`[data-step-panel="${step}"]`);
    if (!panel) return false;

    if (step === 1) {
      if (!normalizeReg(regnr) || normalizeReg(regnr).length < 4) {
        showStepError('Skriv inn registreringsnummer og slå opp bilen.');
        return false;
      }
      if (!vehicleData) {
        showStepError('Slå opp bilen i Kjøretøyregisteret før du går videre.');
        return false;
      }
      if (!kilometerstand.trim()) {
        const km = panel.querySelector('#kilometerstand');
        if (km) {
          km.reportValidity();
          km.focus();
        }
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!utstyr.length) {
        showStepError('Velg minst ett utstyrspunkt som gjelder bilen din.');
        document.getElementById('utstyrGrid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!validateRadioGroup(servicehistorikk, 'Velg servicehistorikk.')) return false;
      if (!validatePanelFields(panel)) return false;
      if (!validateRadioGroup(sommerdekk, 'Velg tilstand på sommerdekk.')) return false;
      if (!validateRadioGroup(vinterdekk, 'Velg tilstand på vinterdekk.')) return false;
      return true;
    }

    if (step === 4 || step === 5) {
      return validatePanelFields(panel);
    }

    return true;
  };

  const goToStep = (step) => {
    if (step < 1 || step > TOTAL_STEPS) return;
    setCurrentStep(step);
    clearAlerts();
    progressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    goToStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  };

  const handleUtstyrChange = (value, checked) => {
    setUtstyr((prev) => (checked ? [...prev, value] : prev.filter((v) => v !== value)));
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files || []));
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRegInput = (value) => {
    setRegnr(value);
    if (vehicleData) clearVehicleDisplay();
    setStatus('', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    try {
      const files = await Promise.all(selectedFiles.map(readFileAsBase64));
      const res = await fetch('/api/innbytte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regnr,
          merke: hiddenFields.merke,
          modell: hiddenFields.modell,
          arsmodell: hiddenFields.arsmodell,
          drivstoff: hiddenFields.drivstoff,
          farge: hiddenFields.farge,
          kjoretoyType: hiddenFields.kjoretoyType,
          hjuldrift: vehicleData ? vehicleData.hjuldrift : '',
          effektHk: vehicleData ? vehicleData.effektHk : '',
          sisteEuKontroll: vehicleData ? vehicleData.sisteEuKontroll : '',
          nesteEuKontroll: vehicleData ? vehicleData.nesteEuKontroll : '',
          kilometerstand,
          servicehistorikk,
          sisteService,
          utstyr,
          sommerdekk,
          vinterdekk,
          forventning,
          kommentar,
          finnKode,
          navn,
          epost,
          mobil,
          bilder: files,
        }),
      });
      await res.json();

      setRegnr('');
      setKilometerstand('');
      clearVehicleDisplay();
      setUtstyr([]);
      setServicehistorikk('');
      setSisteService('');
      setSommerdekk('');
      setVinterdekk('');
      setForventning('');
      setKommentar('');
      setFinnKode('');
      setNavn('');
      setMobil('');
      setEpost('');
      setSelectedFiles([]);
      setFormMsgVisible(true);
      clearAlerts();
      goToStep(1);
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => setFormMsgVisible(false), 8000);
    } catch {
      showStepError('Kunne ikke sende skjemaet. Prøv igjen eller ring oss.');
    } finally {
      setSubmitting(false);
    }
  };

  const pct = Math.round((currentStep / TOTAL_STEPS) * 100);
  const isLast = currentStep === TOTAL_STEPS;

  return (
    <main>
        <PageHero
          title="Innbytte"
          breadcrumb={[{ label: 'Hjem', to: '/' }, { label: 'Innbytte' }]}
          compact
          bgImage="/assets/about-car.jpeg"
        />

        <section className="section innbytte-section">
          <div className="container container--form">
            <header className="innbytte-form-header">
              <span className="label">Innbytteskjema</span>
              <h2 className="innbytte-form-header__title">Få et uforpliktende tilbud på innbytte</h2>
              <p className="innbytte-form-header__lead">
                Når du har innsendt skjemaet gjennomgår vi det fortløpende og sender deg et uforpliktende tilbud på vår bil
                med din bil i innbytte. Estimert tid: 2 minutter.
              </p>
            </header>

            <form
              ref={formRef}
              className="form-panel innbytte-form innbytte-form--pro"
              id="innbytteForm"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="innbytte-progress" ref={progressRef} aria-hidden="false">
                <div className="innbytte-progress__meta">
                  <p className="innbytte-step-progress" id="stepProgress" aria-live="polite">
                    Steg {currentStep} av {TOTAL_STEPS} · {STEP_TITLES[currentStep - 1]}
                  </p>
                  <span className="innbytte-progress__pct" id="stepProgressPct">
                    {pct}%
                  </span>
                </div>
                <div className="innbytte-progress__track" aria-hidden="true">
                  <div className="innbytte-progress__fill" id="stepProgressFill" style={{ width: `${pct}%` }} />
                </div>
                <ol className="innbytte-steps" id="innbytteSteps" aria-label="Skjemasteg">
                  {STEP_TITLES.map((title, i) => {
                    const step = i + 1;
                    return (
                      <li
                        key={step}
                        className={`innbytte-steps__item${step === currentStep ? ' innbytte-steps__item--active' : ''}${step < currentStep ? ' innbytte-steps__item--done' : ''}`}
                        data-step={step}
                      >
                        <span className="innbytte-steps__marker">
                          <span className="innbytte-steps__number">{step}</span>
                        </span>
                        <span className="innbytte-steps__label">{title}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="innbytte-step-alert" id="stepAlert" hidden={!stepAlert} role="alert">
                {stepAlert}
              </div>

              <input type="hidden" id="merke" name="merke" value={hiddenFields.merke} readOnly />
              <input type="hidden" id="modell" name="modell" value={hiddenFields.modell} readOnly />
              <input type="hidden" id="arsmodell" name="arsmodell" value={hiddenFields.arsmodell} readOnly />
              <input type="hidden" id="drivstoff" name="drivstoff" value={hiddenFields.drivstoff} readOnly />
              <input type="hidden" id="farge" name="farge" value={hiddenFields.farge} readOnly />
              <input type="hidden" id="kjoretoyType" name="kjoretoyType" value={hiddenFields.kjoretoyType} readOnly />

              <div
                className={`innbytte-step-panel${currentStep === 1 ? ' is-active' : ''}`}
                data-step-panel="1"
                hidden={currentStep !== 1}
              >
                <header className="innbytte-step-head">
                  <span className="innbytte-step-head__kicker">Steg 1</span>
                  <h3 className="innbytte-step-head__title" tabIndex={-1}>
                    Info om innbyttebil
                  </h3>
                  <p className="innbytte-step-head__lead">
                    Oppgi registreringsnummer og kilometerstand. Vi henter bilinfo automatisk fra Kjøretøyregisteret.
                  </p>
                </header>
                <fieldset className="innbytte-fieldset">
                  <div className="field lookup-row">
                    <div className="lookup-row__input">
                      <label htmlFor="regnr">Reg.nr.</label>
                      <input
                        type="text"
                        id="regnr"
                        name="regnr"
                        autoComplete="off"
                        maxLength={7}
                        required
                        placeholder="AB 12345"
                        value={regnr}
                        onChange={(e) => handleRegInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            lookupVehicle();
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn--brand lookup-row__btn"
                      id="lookupBtn"
                      onClick={lookupVehicle}
                      disabled={lookupLoading}
                    >
                      {lookupLoading ? 'Henter...' : 'Slå opp'}
                    </button>
                  </div>
                  <p
                    className={`lookup-status lookup-status--${lookupStatus.type}`}
                    id="lookupStatus"
                    hidden={!lookupStatus.visible}
                    aria-live="polite"
                  >
                    {lookupStatus.message}
                  </p>

                  <div className="vehicle-card" id="vehicleCard" hidden={!vehicleData}>
                    <div id="vehicleDetails">
                      <VehicleCard vehicle={vehicleData} />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="kilometerstand">Kilometerstand</label>
                    <span className="field__hint">Oppgi nåværende kilometerstand på bilen</span>
                    <input
                      type="text"
                      id="kilometerstand"
                      name="kilometerstand"
                      required
                      inputMode="numeric"
                      placeholder="f.eks. 85 000"
                      value={kilometerstand}
                      onChange={(e) => setKilometerstand(e.target.value)}
                    />
                  </div>
                </fieldset>
              </div>

              <div
                className={`innbytte-step-panel${currentStep === 2 ? ' is-active' : ''}`}
                data-step-panel="2"
                hidden={currentStep !== 2}
              >
                <header className="innbytte-step-head">
                  <span className="innbytte-step-head__kicker">Steg 2</span>
                  <h3 className="innbytte-step-head__title" tabIndex={-1}>
                    Utstyrsnivå
                  </h3>
                  <p className="innbytte-step-head__lead">
                    Velg alt utstyr som gjelder bilen din. Dette hjelper oss å gi et mer presist tilbud.
                  </p>
                </header>
                <fieldset className="innbytte-fieldset">
                  <span className="field__label">Hva utstyr har din bil?</span>
                  <div className="checkbox-grid" id="utstyrGrid">
                    {UTSTYR_OPTIONS.map((option) => (
                      <label key={option} className="checkbox-card">
                        <input
                          type="checkbox"
                          name="utstyr"
                          value={option}
                          checked={utstyr.includes(option)}
                          onChange={(e) => handleUtstyrChange(option, e.target.checked)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div
                className={`innbytte-step-panel${currentStep === 3 ? ' is-active' : ''}`}
                data-step-panel="3"
                hidden={currentStep !== 3}
              >
                <header className="innbytte-step-head">
                  <span className="innbytte-step-head__kicker">Steg 3</span>
                  <h3 className="innbytte-step-head__title" tabIndex={-1}>
                    Servicehistorikk
                  </h3>
                  <p className="innbytte-step-head__lead">
                    Fortell oss om service og dekk. God dokumentasjon gir ofte bedre innbytteverdi.
                  </p>
                </header>
                <fieldset className="innbytte-fieldset">
                  <div className="field">
                    <span className="field__label">Servicehistorikk</span>
                    <div className="radio-group" role="radiogroup" aria-label="Servicehistorikk">
                      {['Komplett servicehistorikk', 'Delvis servicehistorikk', 'Mangler servicehistorikk'].map((val) => (
                        <label key={val} className="radio-card">
                          <input
                            type="radio"
                            name="servicehistorikk"
                            value={val}
                            required
                            checked={servicehistorikk === val}
                            onChange={() => setServicehistorikk(val)}
                          />
                          <span>{val}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="sisteService">Når er siste service utført?</label>
                    <span className="field__hint">Vennligst velg dato</span>
                    <input
                      type="date"
                      id="sisteService"
                      name="sisteService"
                      required
                      value={sisteService}
                      onChange={(e) => setSisteService(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <span className="field__label">Tilstand på sommerdekk</span>
                    <div className="radio-group radio-group--inline" role="radiogroup" aria-label="Tilstand på sommerdekk">
                      {['Bra mønster', 'Dårlig mønster/bør byttes'].map((val) => (
                        <label key={val} className="radio-card">
                          <input
                            type="radio"
                            name="sommerdekk"
                            value={val}
                            required
                            checked={sommerdekk === val}
                            onChange={() => setSommerdekk(val)}
                          />
                          <span>{val}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <span className="field__label">Tilstand på vinterdekk</span>
                    <div className="radio-group radio-group--inline" role="radiogroup" aria-label="Tilstand på vinterdekk">
                      {['Bra mønster', 'Dårlig mønster/bør byttes'].map((val) => (
                        <label key={val} className="radio-card">
                          <input
                            type="radio"
                            name="vinterdekk"
                            value={val}
                            required
                            checked={vinterdekk === val}
                            onChange={() => setVinterdekk(val)}
                          />
                          <span>{val}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </fieldset>
              </div>

              <div
                className={`innbytte-step-panel${currentStep === 4 ? ' is-active' : ''}`}
                data-step-panel="4"
                hidden={currentStep !== 4}
              >
                <header className="innbytte-step-head">
                  <span className="innbytte-step-head__kicker">Steg 4</span>
                  <h3 className="innbytte-step-head__title" tabIndex={-1}>
                    Verdi &amp; tilstand
                  </h3>
                  <p className="innbytte-step-head__lead">
                    Del forventninger, eventuelle skader og bilder slik at vi kan vurdere bilen best mulig.
                  </p>
                </header>
                <fieldset className="innbytte-fieldset">
                  <div className="field">
                    <label htmlFor="forventning">Forventning til innbytteverdi</label>
                    <span className="field__hint">
                      Husk at det koster oss en del å ta bil i innbytte: kostnader ifm. lagring av bil, klargjøring,
                      annonsering, foto osv.
                    </span>
                    <input
                      type="text"
                      id="forventning"
                      name="forventning"
                      required
                      placeholder="f.eks. 150 000 kr"
                      value={forventning}
                      onChange={(e) => setForventning(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="kommentar">Annen kommentar</label>
                    <span className="field__hint">
                      Evt. skader (inkl. tidligere skader), feil/mangler ved bilen eller annet av betydning som du ønsker å
                      beskrive
                    </span>
                    <textarea
                      id="kommentar"
                      name="kommentar"
                      rows={5}
                      placeholder="Beskriv eventuelle skader, feil eller annet vi bør vite…"
                      value={kommentar}
                      onChange={(e) => setKommentar(e.target.value)}
                    />
                    <div className="char-counter" aria-live="polite">
                      <span id="charCount">{kommentar.length}</span> tegn
                    </div>
                  </div>

                  <div className="field">
                    <span className="field__label">Gjerne noen bilder av bilen</span>
                    <span className="field__hint">
                      Hvis du har dette tilgjengelig — valgfritt, men hjelper oss med vurderingen
                    </span>
                    <div className="file-upload">
                      <label className="file-upload__btn" htmlFor="bilder">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Last opp bilder
                      </label>
                      <input
                        type="file"
                        id="bilder"
                        name="bilder"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handleFileChange}
                      />
                      <ul className="file-upload__list" id="fileList" hidden={!selectedFiles.length}>
                        {selectedFiles.map((file, index) => (
                          <li key={`${file.name}-${index}`} className="file-upload__item">
                            <span>{file.name}</span>
                            <button
                              type="button"
                              className="file-upload__remove"
                              data-index={index}
                              aria-label={`Fjern ${file.name}`}
                              onClick={() => removeFile(index)}
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </fieldset>
              </div>

              <div
                className={`innbytte-step-panel${currentStep === 5 ? ' is-active' : ''}`}
                data-step-panel="5"
                hidden={currentStep !== 5}
              >
                <header className="innbytte-step-head">
                  <span className="innbytte-step-head__kicker">Steg 5</span>
                  <h3 className="innbytte-step-head__title" tabIndex={-1}>
                    Info om deg
                  </h3>
                  <p className="innbytte-step-head__lead">
                    Siste steg — oppgi kontaktinfo og hvilken bil hos oss du ønsker å innbytte med.
                  </p>
                </header>
                <fieldset className="innbytte-fieldset">
                  <div className="field">
                    <label htmlFor="finnKode">Hvilken bil vil du innbytte med hos oss?</label>
                    <span className="field__hint">Vennligst skriv FINN-kode / lenke til annonse</span>
                    <input
                      type="text"
                      id="finnKode"
                      name="finnKode"
                      required
                      placeholder="f.eks. FINN-kode eller lenke"
                      value={finnKode}
                      onChange={(e) => setFinnKode(e.target.value)}
                    />
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="navn">Fullt navn</label>
                      <input
                        type="text"
                        id="navn"
                        name="navn"
                        required
                        autoComplete="name"
                        value={navn}
                        onChange={(e) => setNavn(e.target.value)}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="mobil">Mobilnummer</label>
                      <input
                        type="tel"
                        id="mobil"
                        name="mobil"
                        required
                        autoComplete="tel"
                        placeholder="+47"
                        value={mobil}
                        onChange={(e) => setMobil(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="epost">E-postadresse</label>
                    <input
                      type="email"
                      id="epost"
                      name="epost"
                      required
                      autoComplete="email"
                      value={epost}
                      onChange={(e) => setEpost(e.target.value)}
                    />
                  </div>
                </fieldset>
              </div>

              <nav className="innbytte-step-nav" aria-label="Skjemnavigasjon">
                <button
                  type="button"
                  className="btn btn--ghost innbytte-step-nav__btn innbytte-step-nav__btn--prev"
                  id="stepPrev"
                  disabled={currentStep === 1}
                  aria-disabled={currentStep === 1}
                  onClick={handlePrev}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Forrige
                </button>
                <button
                  type="button"
                  className="btn btn--brand innbytte-step-nav__btn innbytte-step-nav__btn--next"
                  id="stepNext"
                  hidden={isLast}
                  onClick={handleNext}
                >
                  Neste
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
                <button
                  type="submit"
                  className="btn btn--brand btn--lg innbytte-step-nav__btn innbytte-step-nav__btn--submit"
                  id="submitBtn"
                  hidden={!isLast}
                  disabled={submitting}
                >
                  {submitting ? 'Sender...' : 'Send inn skjema'}
                </button>
              </nav>

              <p className="form-msg form-msg--success" id="innbytteMsg" hidden={!formMsgVisible}>
                Takk! Vi har mottatt skjemaet ditt og tar kontakt snart.
              </p>
            </form>
          </div>
        </section>
    </main>
  );
}
