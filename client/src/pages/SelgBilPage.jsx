import { useState, useRef, useCallback } from 'react';
import PageHero from '../components/PageHero';
import TurnstileField from '../components/TurnstileField';
import FormSuccessOverlay from '../components/FormSuccessOverlay';
import { useTurnstile } from '../hooks/useTurnstile';
import {
  UTSTYR_OPTIONS,
  VehicleCard,
  SisteServiceField,
  SISTE_SERVICE_UKJENT,
  validateSisteService,
  PrisforventningField,
  validatePrisforventning,
  formatPriceForSubmit,
  formatCellValue,
  normalizeReg,
} from '../lib/vehicleOfferFormShared';
import { parseJsonResponse, trimText, validateContactFields } from '../lib/formValidation';
import { prepareUploadImages } from '../lib/imageUpload';

const TOTAL_STEPS = 4;
const STEP_TITLES = ['Bilinfo', 'Utstyr', 'Service', 'Tilbud & kontakt'];

export default function SelgBilPage() {
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
  const [sisteServiceUkjent, setSisteServiceUkjent] = useState(false);
  const [sommerdekk, setSommerdekk] = useState('');
  const [vinterdekk, setVinterdekk] = useState('');
  const [forventning, setForventning] = useState('');
  const [kommentar, setKommentar] = useState('');
  const [navn, setNavn] = useState('');
  const [mobil, setMobil] = useState('');
  const [epost, setEpost] = useState('');

  const [lookupStatus, setLookupStatus] = useState({ message: '', type: 'info', visible: false });
  const [stepAlert, setStepAlert] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const turnstile = useTurnstile({ active: currentStep === TOTAL_STEPS && !showSuccess });

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
        } else if (data.code === 'FORBIDDEN') {
          setStatus('Kjøretøyoppslag er midlertidig utilgjengelig. Kontakt oss på telefon.', 'error');
        } else if (data.code === 'MAINTENANCE') {
          setStatus('Nettsiden er i vedlikehold – kjøretøyoppslag er midlertidig utilgjengelig.', 'error');
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

  const clearAlerts = () => setStepAlert('');

  const showStepError = (message) => {
    setStepAlert(message);
    formRef.current?.querySelector('.innbytte-step-alert')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const validateRadioGroup = (value, message) => {
    if (value) return true;
    showStepError(message);
    return false;
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
        showStepError('Oppgi kilometerstand.');
        panel.querySelector('#kilometerstand')?.focus();
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
      if (!validateSisteService(sisteService, sisteServiceUkjent, showStepError)) return false;
      if (!validateRadioGroup(sommerdekk, 'Velg tilstand på sommerdekk.')) return false;
      if (!validateRadioGroup(vinterdekk, 'Velg tilstand på vinterdekk.')) return false;
      return true;
    }

    if (step === 4) {
      if (!validatePrisforventning(forventning, showStepError)) return false;
      return validateContactFields({ navn, epost, mobil }, showStepError);
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

  const scrollToForm = () => {
    document.getElementById('selg-bil-skjema')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetForm = () => {
    setRegnr('');
    setKilometerstand('');
    clearVehicleDisplay();
    setUtstyr([]);
    setServicehistorikk('');
    setSisteService('');
    setSisteServiceUkjent(false);
    setSommerdekk('');
    setVinterdekk('');
    setForventning('');
    setKommentar('');
    setNavn('');
    setMobil('');
    setEpost('');
    setSelectedFiles([]);
    turnstile.reset();
    clearAlerts();
    goToStep(1);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    resetForm();
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    for (let step = 1; step <= TOTAL_STEPS; step += 1) {
      if (!validateStep(step)) {
        goToStep(step);
        return;
      }
    }
    if (!turnstile.token) {
      showStepError('Bekreft at du ikke er en robot før du sender.');
      return;
    }

    setSubmitting(true);
    try {
      const files = await prepareUploadImages(selectedFiles);
      const res = await fetch('/api/selg-bil', {
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
          sisteService: sisteServiceUkjent ? SISTE_SERVICE_UKJENT : sisteService,
          utstyr,
          sommerdekk,
          vinterdekk,
          forventning: formatPriceForSubmit(forventning),
          kommentar,
          navn: trimText(navn),
          epost: trimText(epost),
          mobil: trimText(mobil),
          bilder: files,
          'cf-turnstile-response': turnstile.getToken(),
        }),
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.error || 'Kunne ikke sende skjemaet.');

      setShowSuccess(true);
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      showStepError(err.message || 'Kunne ikke sende skjemaet. Prøv igjen eller ring oss.');
      turnstile.reset();
    } finally {
      setSubmitting(false);
    }
  };

  const pct = Math.round((currentStep / TOTAL_STEPS) * 100);
  const isLast = currentStep === TOTAL_STEPS;

  return (
    <main>
      <PageHero
        title="Selg bilen din"
        lead="X Bilsenter AS gjør bilsalget enkelt og trygt – uten at du trenger å kjøpe ny bil hos oss."
        breadcrumb={[{ label: 'Hjem', to: '/' }, { label: 'Selg bilen din' }]}
        bgImage="/assets/hero-3.jpeg"
        variant="selg-bil"
      />

      <section className="section selg-bil-section" id="selg-bil-skjema">
        <div className="container">
          <div className="selg-bil-layout">
            <div className="selg-bil-layout__info">
              <span className="label">Selg bil</span>
              <h2 className="section-title">Klar for å selge bilen din?</h2>
              <p className="section-lead">
                At det er raskt, enkelt og trygt å selge bil til oss er blant de viktigste grunnene til å la oss kjøpe
                bilen din. Du trenger ikke kjøpe ny bil hos oss.
              </p>
              <ol className="steps selg-bil-steps">
                <li className="step">
                  <span className="step__num">01</span>
                  <div>
                    <h3>Betydelig tidsbesparelse</h3>
                    <p>
                      Å selge bil privat kan fort bli både tidkrevende og omfattende. Ved salg til oss slipper du å
                      bruke tid på å lage salgsannonse, svare på henvendelser, avtale visninger og prøvekjøringer –
                      ofte med interessenter som aldri ender opp med å kjøpe bilen.
                    </p>
                    <p>
                      Når du selger bilen til oss, slipper du også å tenke på papirarbeid, klargjøring, service og
                      andre praktiske oppgaver i forbindelse med salget.
                    </p>
                    <p>
                      Vi tar oss av hele prosessen, slik at du kan bruke tiden din på noe annet. Enkelt, effektivt og
                      uten unødvendig styr.
                    </p>
                  </div>
                </li>
                <li className="step">
                  <span className="step__num">02</span>
                  <div>
                    <h3>Du slipper reklamasjonsansvar</h3>
                    <p>
                      Du slipper reklamasjonsansvaret og risikoen som følger et privat salg. Når handelen er
                      gjennomført, overtar vi som forhandler bilen og ansvaret for den videre prosessen.
                    </p>
                    <p>
                      Vi kjøper også biler med feil og mangler – for eksempel riper, bulker, varsellamper, tekniske
                      feil eller behov for service. Du trenger ikke nødvendigvis å utbedre noe før du selger til oss.
                    </p>
                    <p>Du forteller oss om det du kjenner til – vi ordner resten.</p>
                  </div>
                </li>
                <li className="step">
                  <span className="step__num">03</span>
                  <div>
                    <h3>Raskt og trygt oppgjør</h3>
                    <p>
                      Utbetaling skjer normalt umiddelbart ved innlevering av bilen, eller første virkedag dersom
                      handelen gjennomføres i helg eller på en helligdag.
                    </p>
                    <p>
                      Har du lån eller andre heftelser på bilen, ordner vi oppgjøret direkte med banken din. Vi innfrir
                      det utestående lånet, og eventuelt overskytende beløp utbetales direkte til din konto.
                    </p>
                    <p>
                      Dersom restlånet er høyere enn kjøpesummen, må differansen innbetales av deg i forbindelse med
                      handelen. Ved behov kan vi bistå med å undersøke muligheten for finansiering av mellomlegget, for
                      eksempel gjennom et mellomfinansieringslån eller blancolån.
                    </p>
                  </div>
                </li>
              </ol>
              <button type="button" className="btn btn--brand btn--lg selg-bil-layout__cta-mobile" onClick={scrollToForm}>
                Få tilbud
              </button>
            </div>

            <aside className="selg-bil-layout__form">
              <header className="selg-bil-form-header">
                <span className="label">Oppkjøpsskjema</span>
                <h2 className="selg-bil-form-header__title">Få et uforpliktende tilbud</h2>
                <p className="selg-bil-form-header__lead">
                  Fyll ut skjemaet så gjennomgår vi bilen og kommer tilbake med et tilbud på direkte oppkjøp. Estimert
                  tid: 2 minutter.
                </p>
              </header>

              <form
                ref={formRef}
                className="form-panel form-panel-shell innbytte-form innbytte-form--pro selg-bil-form"
                id="selgBilForm"
                noValidate
                onSubmit={handleSubmit}
              >
            <div className="innbytte-progress" ref={progressRef} aria-hidden="false">
              <div className="innbytte-progress__meta">
                <p className="innbytte-step-progress" aria-live="polite">
                  Steg {currentStep} av {TOTAL_STEPS} · {STEP_TITLES[currentStep - 1]}
                </p>
                <span className="innbytte-progress__pct">{pct}%</span>
              </div>
              <div className="innbytte-progress__track" aria-hidden="true">
                <div className="innbytte-progress__fill" style={{ width: `${pct}%` }} />
              </div>
              <ol className="innbytte-steps" aria-label="Skjemasteg">
                {STEP_TITLES.map((title, i) => {
                  const step = i + 1;
                  return (
                    <li
                      key={step}
                      className={`innbytte-steps__item${step === currentStep ? ' innbytte-steps__item--active' : ''}${step < currentStep ? ' innbytte-steps__item--done' : ''}`}
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

            <div className="innbytte-step-alert" hidden={!stepAlert} role="alert">
              {stepAlert}
            </div>

            <input type="hidden" name="merke" value={hiddenFields.merke} readOnly />
            <input type="hidden" name="modell" value={hiddenFields.modell} readOnly />
            <input type="hidden" name="arsmodell" value={hiddenFields.arsmodell} readOnly />
            <input type="hidden" name="drivstoff" value={hiddenFields.drivstoff} readOnly />
            <input type="hidden" name="farge" value={hiddenFields.farge} readOnly />
            <input type="hidden" name="kjoretoyType" value={hiddenFields.kjoretoyType} readOnly />

            <div
              className={`innbytte-step-panel${currentStep === 1 ? ' is-active' : ''}`}
              data-step-panel="1"
              hidden={currentStep !== 1}
            >
              <header className="innbytte-step-head">
                <span className="innbytte-step-head__kicker">Steg 1</span>
                <h3 className="innbytte-step-head__title" tabIndex={-1}>Info om bilen</h3>
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
                    onClick={lookupVehicle}
                    disabled={lookupLoading}
                  >
                    {lookupLoading ? 'Henter...' : 'Slå opp'}
                  </button>
                </div>
                <p
                  className={`lookup-status lookup-status--${lookupStatus.type}`}
                  hidden={!lookupStatus.visible}
                  aria-live="polite"
                >
                  {lookupStatus.message}
                </p>

                <div className="vehicle-card" hidden={!vehicleData}>
                  <VehicleCard vehicle={vehicleData} />
                </div>

                <div className="field">
                  <label htmlFor="kilometerstand">Kilometerstand</label>
                  <span className="field__hint">Oppgi nåværende kilometerstand på bilen</span>
                  <input
                    type="text"
                    id="kilometerstand"
                    name="kilometerstand"
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
                <h3 className="innbytte-step-head__title" tabIndex={-1}>Utstyrsnivå</h3>
                <p className="innbytte-step-head__lead">
                  Velg alt utstyr som gjelder bilen din. Dette hjelper oss å gi et mer presist tilbud.
                </p>
              </header>
              <fieldset className="innbytte-fieldset">
                <span className="field__label">Hva utstyr har bilen?</span>
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
                <h3 className="innbytte-step-head__title" tabIndex={-1}>Servicehistorikk</h3>
                <p className="innbytte-step-head__lead">
                  Fortell oss om service og dekk. God dokumentasjon gir ofte bedre oppgjør.
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
                          checked={servicehistorikk === val}
                          onChange={() => setServicehistorikk(val)}
                        />
                        <span>{val}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <SisteServiceField
                  sisteService={sisteService}
                  setSisteService={setSisteService}
                  sisteServiceUkjent={sisteServiceUkjent}
                  setSisteServiceUkjent={setSisteServiceUkjent}
                />

                <div className="field">
                  <span className="field__label">Tilstand på sommerdekk</span>
                  <div className="radio-group radio-group--inline" role="radiogroup" aria-label="Tilstand på sommerdekk">
                    {['Bra mønster', 'Dårlig mønster/bør byttes'].map((val) => (
                      <label key={val} className="radio-card">
                        <input
                          type="radio"
                          name="sommerdekk"
                          value={val}
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
                <h3 className="innbytte-step-head__title" tabIndex={-1}>Tilbud &amp; kontakt</h3>
                <p className="innbytte-step-head__lead">
                  Oppgi forventet oppgjør, eventuelle skader og bilder – og hvordan vi kan nå deg.
                </p>
              </header>
              <fieldset className="innbytte-fieldset">
                <PrisforventningField
                  value={forventning}
                  onChange={setForventning}
                  label="Forventning til oppgjør"
                  hint="Oppgi beløp i kroner. Vi vurderer bilen og kommer tilbake med et konkret tilbud."
                />

                <div className="field">
                  <label htmlFor="kommentar">Annen kommentar</label>
                  <span className="field__hint">
                    Evt. skader, feil/mangler eller annet vi bør vite om bilen
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
                    <span>{kommentar.length}</span> tegn
                  </div>
                </div>

                <div className="field">
                  <span className="field__label">Gjerne noen bilder av bilen</span>
                  <span className="field__hint">Valgfritt, men hjelper oss med vurderingen. Maks 8 bilder — store bilder komprimeres automatisk.</span>
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
                    <ul className="file-upload__list" hidden={!selectedFiles.length}>
                      {selectedFiles.map((file, index) => (
                        <li key={`${file.name}-${index}`} className="file-upload__item">
                          <span>{file.name}</span>
                          <button
                            type="button"
                            className="file-upload__remove"
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

                <div className="field-row">
                  <div className="field">
                    <label htmlFor="navn">Fullt navn</label>
                    <input
                      type="text"
                      id="navn"
                      name="navn"
                      autoComplete="name"
                      value={navn}
                      onChange={(e) => setNavn(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="mobil">Mobilnummer</label>
                    <input
                      type="text"
                      inputMode="tel"
                      id="mobil"
                      name="mobil"
                      autoComplete="tel"
                      placeholder="920 50 990"
                      value={mobil}
                      onChange={(e) => setMobil(e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="epost">E-postadresse</label>
                  <input
                    type="text"
                    inputMode="email"
                    id="epost"
                    name="epost"
                    autoComplete="email"
                    value={epost}
                    onChange={(e) => setEpost(e.target.value)}
                  />
                </div>
              </fieldset>
            </div>

            {isLast && (
              <TurnstileField active={isLast} containerRef={turnstile.containerRef} />
            )}

            <nav className="innbytte-step-nav" aria-label="Skjemnavigasjon">
              <button
                type="button"
                className="btn btn--ghost innbytte-step-nav__btn innbytte-step-nav__btn--prev"
                hidden={currentStep === 1}
                onClick={handlePrev}
              >
                ← Forrige
              </button>
              {!isLast ? (
                <button
                  type="button"
                  className="btn btn--brand innbytte-step-nav__btn innbytte-step-nav__btn--next"
                  onClick={handleNext}
                >
                  Neste →
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn--brand btn--lg innbytte-step-nav__btn innbytte-step-nav__btn--submit"
                  disabled={submitting || showSuccess}
                >
                  {submitting ? 'Sender…' : 'Send forespørsel'}
                </button>
              )}
            </nav>

            <FormSuccessOverlay
              open={showSuccess}
              title="Forespørselen er mottatt!"
              message="Takk! Vi har mottatt opplysningene om bilen din."
              detail="Vi gjennomgår bilen og tar kontakt med deg så snart vi kan med et uforpliktende tilbud på oppkjøp."
              closeLabel="Lukk"
              onClose={handleSuccessClose}
            />
              </form>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
