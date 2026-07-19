'use strict';

(function () {
  var form = document.getElementById('innbytteForm');
  if (!form) return;

  var TOTAL_STEPS = 5;
  var STEP_TITLES = ['Bilinfo', 'Utstyr', 'Service', 'Annet', 'Kontakt'];
  var currentStep = 1;

  var regInput = document.getElementById('regnr');
  var lookupBtn = document.getElementById('lookupBtn');
  var lookupStatus = document.getElementById('lookupStatus');
  var vehicleCard = document.getElementById('vehicleCard');
  var vehicleDetails = document.getElementById('vehicleDetails');
  var formMsg = document.getElementById('innbytteMsg');
  var stepAlert = document.getElementById('stepAlert');
  var kommentar = document.getElementById('kommentar');
  var charCount = document.getElementById('charCount');
  var fileInput = document.getElementById('bilder');
  var fileList = document.getElementById('fileList');
  var submitBtn = document.getElementById('submitBtn');
  var stepPrev = document.getElementById('stepPrev');
  var stepNext = document.getElementById('stepNext');
  var stepProgress = document.getElementById('stepProgress');
  var stepProgressFill = document.getElementById('stepProgressFill');
  var stepProgressPct = document.getElementById('stepProgressPct');
  var stepIndicators = document.querySelectorAll('.innbytte-steps__item');
  var stepPanels = document.querySelectorAll('.innbytte-step-panel');

  var vehicleData = null;
  var selectedFiles = [];

  var hiddenFields = {
    merke: document.getElementById('merke'),
    modell: document.getElementById('modell'),
    arsmodell: document.getElementById('arsmodell'),
    drivstoff: document.getElementById('drivstoff'),
    farge: document.getElementById('farge'),
    kjoretoyType: document.getElementById('kjoretoyType')
  };

  function setStatus(message, type) {
    lookupStatus.textContent = message;
    lookupStatus.className = 'lookup-status lookup-status--' + (type || 'info');
    lookupStatus.hidden = !message;
  }

  function setStepAlert(message) {
    if (!stepAlert) return;
    stepAlert.textContent = message || '';
    stepAlert.hidden = !message;
  }

  function clearAlerts() {
    setStepAlert('');
    if (currentStep !== 1) setStatus('', 'info');
  }

  function showStepError(message) {
    if (currentStep === 1) {
      setStatus(message, 'error');
    } else {
      setStepAlert(message);
    }
  }

  function normalizeReg(value) {
    return String(value || '').toUpperCase().replace(/\s/g, '');
  }

  var INNBYTTE_VEHICLE_FIELDS = [
    ['Modell', function (vehicle) {
      return [vehicle.merke, vehicle.modell].filter(Boolean).join(' ') || vehicle.modell;
    }],
    ['Kjøretøygruppe', function (vehicle) {
      return vehicle.kjoretoyGruppe || vehicle.kjoretoyType;
    }],
    ['Drivstoff', 'drivstoff'],
    ['Girkasse', 'girkasse'],
    ['Siste EU-kontroll', 'sisteEuKontroll'],
    ['Neste EU-kontroll', 'nesteEuKontroll']
  ];

  function formatCellValue(value) {
    if (value === null || value === undefined || value === '') return '';
    if (Array.isArray(value)) return value.filter(Boolean).join(', ');
    if (typeof value === 'object') return '';
    return String(value);
  }

  function formatSpec(label, value) {
    var text = formatCellValue(value);
    if (!text) return '';
    return (
      '<div class="vehicle-card__item">' +
      '<span class="vehicle-card__label">' + label + '</span>' +
      '<span class="vehicle-card__value">' + text + '</span>' +
      '</div>'
    );
  }

  function showVehicle(vehicle) {
    if (!vehicle || typeof vehicle !== 'object') return;

    vehicleData = vehicle;
    vehicleCard.hidden = false;
    vehicleCard.removeAttribute('hidden');

    Object.keys(hiddenFields).forEach(function (key) {
      if (hiddenFields[key]) hiddenFields[key].value = formatCellValue(vehicle[key]);
    });

    var gridHtml = INNBYTTE_VEHICLE_FIELDS.map(function (field) {
      var label = field[0];
      var value = typeof field[1] === 'function'
        ? field[1](vehicle)
        : vehicle[field[1]];
      return formatSpec(label, value);
    }).join('');

    vehicleDetails.innerHTML =
      '<div class="vehicle-card__head">' +
      '<h4>' + (vehicle.regNr || 'Kjøretøy funnet') + '</h4>' +
      '<span class="vehicle-card__badge">Hentet fra Kjøretøyregisteret</span>' +
      '</div>' +
      '<div class="vehicle-card__grid">' +
      gridHtml +
      '</div>';

    setStatus('Bil funnet i Kjøretøyregisteret.', 'success');
  }

  function clearVehicleDisplay() {
    vehicleData = null;
    vehicleCard.hidden = true;
    vehicleDetails.innerHTML = '';
    Object.keys(hiddenFields).forEach(function (key) {
      if (hiddenFields[key]) hiddenFields[key].value = '';
    });
  }

  function lookupVehicle() {
    var regnr = normalizeReg(regInput.value);
    regInput.value = regnr;

    if (regnr.length < 4) {
      setStatus('Skriv inn et gyldig registreringsnummer.', 'error');
      clearVehicleDisplay();
      return;
    }

    lookupBtn.disabled = true;
    lookupBtn.textContent = 'Henter...';
    setStatus('Slår opp i Kjøretøyregisteret...', 'info');

    fetch('/api/kjoretoy?regnr=' + encodeURIComponent(regnr))
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          clearVehicleDisplay();
          if (result.data.code === 'MISSING_API_KEY') {
            setStatus('Kjøretøyoppslag er ikke konfigurert ennå. Kontakt oss på telefon i mellomtiden.', 'error');
          } else {
            setStatus(result.data.error || 'Kunne ikke hente bilinfo.', 'error');
          }
          return;
        }
        showVehicle(result.data.vehicle);
      })
      .catch(function () {
        clearVehicleDisplay();
        setStatus('Kunne ikke kontakte serveren. Sjekk at nettsiden kjører via npm start.', 'error');
      })
      .finally(function () {
        lookupBtn.disabled = false;
        lookupBtn.textContent = 'Slå opp';
      });
  }

  function getPanel(step) {
    return form.querySelector('[data-step-panel="' + step + '"]');
  }

  function getCheckedValues(name) {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(function (el) { return el.value; });
  }

  function getRadioValue(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : '';
  }

  function validatePanelFields(panel) {
    var fields = panel.querySelectorAll('input, select, textarea');
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.type === 'radio' || field.type === 'checkbox') continue;
      if (!field.checkValidity()) {
        field.reportValidity();
        field.focus();
        return false;
      }
    }
    return true;
  }

  function validateRadioGroup(name, message) {
    if (getRadioValue(name)) return true;
    showStepError(message);
    var first = form.querySelector('input[name="' + name + '"]');
    if (first) {
      var group = first.closest('.field') || first.closest('.radio-group');
      if (group) group.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return false;
  }

  function validateStep(step) {
    clearAlerts();
    var panel = getPanel(step);
    if (!panel) return false;

    if (step === 1) {
      if (!normalizeReg(regInput.value) || normalizeReg(regInput.value).length < 4) {
        showStepError('Skriv inn registreringsnummer og slå opp bilen.');
        regInput.focus();
        return false;
      }
      if (!vehicleData) {
        showStepError('Slå opp bilen i Kjøretøyregisteret før du går videre.');
        lookupBtn.focus();
        return false;
      }
      var km = document.getElementById('kilometerstand');
      if (!km.value.trim()) {
        km.reportValidity();
        km.focus();
        return false;
      }
      return true;
    }

    if (step === 2) {
      var utstyr = getCheckedValues('utstyr');
      if (!utstyr.length) {
        showStepError('Velg minst ett utstyrspunkt som gjelder bilen din.');
        document.getElementById('utstyrGrid').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!validateRadioGroup('servicehistorikk', 'Velg servicehistorikk.')) return false;
      if (!validatePanelFields(panel)) return false;
      if (!validateRadioGroup('sommerdekk', 'Velg tilstand på sommerdekk.')) return false;
      if (!validateRadioGroup('vinterdekk', 'Velg tilstand på vinterdekk.')) return false;
      return true;
    }

    if (step === 4) {
      return validatePanelFields(panel);
    }

    if (step === 5) {
      return validatePanelFields(panel);
    }

    return true;
  }

  function updateStepUI() {
    stepPanels.forEach(function (panel) {
      var step = parseInt(panel.getAttribute('data-step-panel'), 10);
      var active = step === currentStep;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });

    stepIndicators.forEach(function (item) {
      var step = parseInt(item.getAttribute('data-step'), 10);
      item.classList.toggle('innbytte-steps__item--active', step === currentStep);
      item.classList.toggle('innbytte-steps__item--done', step < currentStep);
    });

    var title = STEP_TITLES[currentStep - 1] || '';
    var pct = Math.round((currentStep / TOTAL_STEPS) * 100);

    if (stepProgress) {
      stepProgress.textContent = 'Steg ' + currentStep + ' av ' + TOTAL_STEPS + ' · ' + title;
    }

    if (stepProgressPct) {
      stepProgressPct.textContent = pct + '%';
    }

    if (stepProgressFill) {
      stepProgressFill.style.width = pct + '%';
    }

    stepPrev.disabled = currentStep === 1;
    stepPrev.setAttribute('aria-disabled', currentStep === 1 ? 'true' : 'false');

    var isLast = currentStep === TOTAL_STEPS;
    stepNext.hidden = isLast;
    submitBtn.hidden = !isLast;

    clearAlerts();

    var panel = getPanel(currentStep);
    if (panel) {
      var heading = panel.querySelector('.innbytte-step-head__title');
      if (heading) heading.focus({ preventScroll: true });
    }
  }

  function goToStep(step) {
    if (step < 1 || step > TOTAL_STEPS) return;
    currentStep = step;
    updateStepUI();
    var progress = form.querySelector('.innbytte-progress');
    if (progress) {
      progress.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve({ name: file.name, type: file.type, data: reader.result }); };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderFileList() {
    if (!selectedFiles.length) {
      fileList.hidden = true;
      fileList.innerHTML = '';
      return;
    }

    fileList.hidden = false;
    fileList.innerHTML = selectedFiles.map(function (file, index) {
      return (
        '<li class="file-upload__item">' +
        '<span>' + file.name + '</span>' +
        '<button type="button" class="file-upload__remove" data-index="' + index + '" aria-label="Fjern ' + file.name + '">×</button>' +
        '</li>'
      );
    }).join('');
  }

  lookupBtn.addEventListener('click', lookupVehicle);

  regInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      lookupVehicle();
    }
  });

  regInput.addEventListener('input', function () {
    if (vehicleData) clearVehicleDisplay();
    setStatus('', 'info');
  });

  if (kommentar && charCount) {
    kommentar.addEventListener('input', function () {
      charCount.textContent = String(kommentar.value.length);
    });
  }

  fileInput.addEventListener('change', function () {
    selectedFiles = Array.prototype.slice.call(fileInput.files || []);
    renderFileList();
  });

  fileList.addEventListener('click', function (e) {
    var btn = e.target.closest('.file-upload__remove');
    if (!btn) return;
    var index = parseInt(btn.getAttribute('data-index'), 10);
    selectedFiles.splice(index, 1);
    renderFileList();
  });

  stepNext.addEventListener('click', function () {
    if (!validateStep(currentStep)) return;
    goToStep(currentStep + 1);
  });

  stepPrev.addEventListener('click', function () {
    if (currentStep > 1) goToStep(currentStep - 1);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sender...';

    var filePromises = selectedFiles.map(readFileAsBase64);

    Promise.all(filePromises)
      .then(function (files) {
        return fetch('/api/innbytte', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            regnr: regInput.value,
            merke: hiddenFields.merke ? hiddenFields.merke.value : '',
            modell: hiddenFields.modell ? hiddenFields.modell.value : '',
            arsmodell: hiddenFields.arsmodell ? hiddenFields.arsmodell.value : '',
            drivstoff: hiddenFields.drivstoff ? hiddenFields.drivstoff.value : '',
            farge: hiddenFields.farge ? hiddenFields.farge.value : '',
            kjoretoyType: hiddenFields.kjoretoyType ? hiddenFields.kjoretoyType.value : '',
            hjuldrift: vehicleData ? vehicleData.hjuldrift : '',
            effektHk: vehicleData ? vehicleData.effektHk : '',
            sisteEuKontroll: vehicleData ? vehicleData.sisteEuKontroll : '',
            nesteEuKontroll: vehicleData ? vehicleData.nesteEuKontroll : '',
            kilometerstand: document.getElementById('kilometerstand').value,
            servicehistorikk: getRadioValue('servicehistorikk'),
            sisteService: document.getElementById('sisteService').value,
            utstyr: getCheckedValues('utstyr'),
            sommerdekk: getRadioValue('sommerdekk'),
            vinterdekk: getRadioValue('vinterdekk'),
            forventning: document.getElementById('forventning').value,
            kommentar: kommentar ? kommentar.value : '',
            finnKode: document.getElementById('finnKode').value,
            navn: document.getElementById('navn').value,
            epost: document.getElementById('epost').value,
            mobil: document.getElementById('mobil').value,
            bilder: files
          })
        });
      })
      .then(function (res) { return res.json(); })
      .then(function () {
        form.reset();
        clearVehicleDisplay();
        selectedFiles = [];
        renderFileList();
        if (charCount) charCount.textContent = '0';
        formMsg.hidden = false;
        clearAlerts();
        goToStep(1);
        window.scrollTo({ top: form.offsetTop - 100, behavior: 'smooth' });
        setTimeout(function () { formMsg.hidden = true; }, 8000);
      })
      .catch(function () {
        showStepError('Kunne ikke sende skjemaet. Prøv igjen eller ring oss.');
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send inn skjema';
      });
  });

  updateStepUI();
})();
