import { useState } from 'react';
import PageHero from '../components/PageHero';
import TurnstileField from '../components/TurnstileField';
import FormSuccessOverlay from '../components/FormSuccessOverlay';
import { useTurnstile } from '../hooks/useTurnstile';
import { parseJsonResponse, trimText, validateKontaktFields } from '../lib/formValidation';

const OPENING_HOURS = [
  { day: 'Mandag – fredag', hours: '09:00 – 17:00' },
  { day: 'Lørdag', hours: '10:00 – 15:00' },
  { day: 'Søndag', hours: 'Stengt / etter avtale', closed: true },
];

function ContactForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const turnstile = useTurnstile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const form = e.target;
    const name = trimText(form.name.value);
    const email = trimText(form.email.value);
    const phone = trimText(form.phone.value);
    const subject = trimText(form.subject.value);
    const message = trimText(form.message.value);

    if (!validateKontaktFields({ name, email, subject }, (msg) => setFormError(msg))) return;
    if (!turnstile.token) {
      setFormError('Bekreft at du ikke er en robot før du sender.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          navn: name,
          epost: email,
          telefon: phone,
          emne: subject,
          melding: message,
          'cf-turnstile-response': turnstile.getToken(),
        }),
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) throw new Error(data.error || 'Kunne ikke sende meldingen.');
      form.reset();
      turnstile.reset();
      setShowSuccess(true);
    } catch (err) {
      setFormError(err.message || 'Kunne ikke sende meldingen. Prøv igjen eller ring oss.');
      turnstile.reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-panel form-panel-shell" id="contactForm" noValidate onSubmit={handleSubmit}>
      <h3>Send oss en melding</h3>
      {formError ? (
        <p className="form-panel__error" role="alert">{formError}</p>
      ) : null}
      <div className="field">
        <label htmlFor="name">Navn</label>
        <input type="text" id="name" name="name" autoComplete="name" />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="email">E-post</label>
          <input type="text" inputMode="email" id="email" name="email" autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="phone">Telefon</label>
          <input type="text" inputMode="tel" id="phone" name="phone" autoComplete="tel" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="subject">Emne</label>
        <select id="subject" name="subject" defaultValue="">
          <option value="" disabled>
            Velg emne
          </option>
          <option value="kjop">Kjøp bil</option>
          <option value="salg">Selg bil</option>
          <option value="innbytte">Innbytte</option>
          <option value="finansiering">Finansiering</option>
          <option value="annet">Annet</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="message">Melding</label>
        <textarea id="message" name="message" rows="4" />
      </div>
      <TurnstileField active containerRef={turnstile.containerRef} />
      <button
        type="submit"
        className="btn btn--brand btn--full"
        disabled={submitting || showSuccess}
      >
        {submitting ? 'Sender...' : 'Send melding'}
      </button>
      <FormSuccessOverlay
        open={showSuccess}
        title="Meldingen er sendt!"
        message="Takk for henvendelsen. Vi har mottatt meldingen din."
        closeLabel="Lukk"
        onClose={() => setShowSuccess(false)}
      />
    </form>
  );
}

export default function KontaktPage() {
  return (
    <main>
        <PageHero
          title="Kontakt oss"
          lead="Noe du lurer på? Tvil ikke, vi elsker spørsmål!"
          breadcrumb={[{ label: 'Hjem', to: '/' }, { label: 'Kontakt' }]}
          bgImage="/assets/kontakt-hero-q7.jpg?v=2141"
          bgImageSrcSet="/assets/kontakt-hero-q7-1920.jpg?v=2141 1920w, /assets/kontakt-hero-q7.jpg?v=2141 4032w"
          variant="kontakt"
        />

        <section className="section">
          <div className="container">
            <div className="contact-layout">
              <div className="contact-grid">
                <div className="contact-grid__intro">
                  <span className="label">Kontaktinformasjon</span>
                  <h2 className="section-title">Ta gjerne kontakt</h2>
                  <p className="section-lead">
                    Vi er også tilgjengelige på telefon for både spørsmål og en hyggelig bilprat.
                  </p>
                </div>

                <div className="contact-boxes">
                  <div className="info-cards">
                    <a href="tel:+4792050990" className="info-card">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <div>
                        <strong>Telefon</strong>
                        <span>(+47) 920 50 990</span>
                      </div>
                    </a>
                    <a href="mailto:post@xbilsenter.no" className="info-card">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <path d="m22 6-10 7L2 6" />
                      </svg>
                      <div>
                        <strong>E-post</strong>
                        <span>post@xbilsenter.no</span>
                      </div>
                    </a>
                    <a
                      href="https://goo.gl/maps/h5HdUQAphUpHR1GdA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="info-card"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <div>
                        <strong>Besøksadresse</strong>
                        <span>Rovenveien 125, 1900 Fetsund</span>
                      </div>
                    </a>
                    <div className="info-card info-card--static">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <path d="M22 6 12 13 2 6" />
                      </svg>
                      <div>
                        <strong>Postadresse</strong>
                        <span>Postboks 1730 Vika, 0121 Oslo</span>
                      </div>
                    </div>
                    </div>

                    <div className="contact-hours">
                      <div className="contact-hours__head">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        <strong>Åpningstider</strong>
                      </div>
                      <ul className="contact-hours__list">
                        {OPENING_HOURS.map(({ day, hours, closed }) => (
                          <li
                            key={day}
                            className={'contact-hours__row' + (closed ? ' contact-hours__row--closed' : '')}
                          >
                            <span className="contact-hours__day">{day}</span>
                            <span className="contact-hours__time">{hours}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                </div>

                <div className="contact-grid__form">
                  <ContactForm />
                </div>
              </div>

              <div className="map contact-map">
                <iframe
                  src="https://maps.google.com/maps?q=Rovenveien+125,+1900+Fetsund&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Kart til X Bilsenter AS"
                />
              </div>
            </div>
          </div>
        </section>
    </main>
  );
}
