import { Link } from 'react-router-dom';
import { Fragment } from 'react';

export default function PageHero({ title, lead, breadcrumb = [], compact = false, bgImage, darkOverlay = false }) {
  const classes = ['page-hero', compact && 'page-hero--compact'].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      {bgImage && (
        <div className="page-hero__bg">
          <img src={bgImage} alt="" />
        </div>
      )}
      {darkOverlay && !bgImage && (
        <div
          className="page-hero__overlay"
          style={{ position: 'absolute', inset: 0, background: 'var(--bg-dark)' }}
        />
      )}
      {bgImage && <div className="page-hero__overlay" />}
      <div className="container page-hero__content">
        {breadcrumb.length > 0 && (
          <nav className="breadcrumb" aria-label="Brødsmulesti">
            {breadcrumb.map((item, i) => (
              <Fragment key={i}>
                {i > 0 && <span>/</span>}
                {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
              </Fragment>
            ))}
          </nav>
        )}
        <h1>{title}</h1>
        {lead && <p>{lead}</p>}
      </div>
    </section>
  );
}
