export default function FormSuccessOverlay({
  open,
  title,
  message,
  detail,
  onClose,
  closeLabel = 'Lukk',
}) {
  if (!open) return null;

  return (
    <div
      className="form-success-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-success-title"
      aria-describedby="form-success-message"
    >
      <div className="form-success-overlay__card">
        <div className="form-success-overlay__icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="form-success-overlay__title" id="form-success-title">
          {title}
        </h3>
        <p className="form-success-overlay__message" id="form-success-message">
          {message}
        </p>
        {detail ? (
          <p className="form-success-overlay__detail">{detail}</p>
        ) : null}
        <button type="button" className="btn btn--brand btn--lg form-success-overlay__btn" onClick={onClose}>
          {closeLabel}
        </button>
      </div>
    </div>
  );
}
