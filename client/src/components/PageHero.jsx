import { Link } from 'react-router-dom';
import { Fragment } from 'react';

export default function PageHero({
  title,
  lead,
  breadcrumb = [],
  compact = false,
  bgImage,
  bgImageSrcSet,
  darkOverlay = false,
  variant,
}) {
  const classes = ['page-hero', compact && 'page-hero--compact', variant && `page-hero--${variant}`]
    .filter(Boolean)
    .join(' ');
  const useTextPanel = variant === 'innbytte' || variant === 'kontakt' || variant === 'biler' || variant === 'tjenester' || variant === 'selg-bil';

  const heroText = (
    <>
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
    </>
  );

  const heroStyle =
    variant === 'innbytte' && bgImage
      ? { '--innbytte-hero-image': `url("${bgImage}")` }
      : undefined;

  return (
    <section className={classes} style={heroStyle}>
      {bgImage && (
        <div className="page-hero__bg">
          <img
            src={bgImage}
            srcSet={bgImageSrcSet}
            sizes="100vw"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
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
        {useTextPanel ? <div className="page-hero__text-panel">{heroText}</div> : heroText}
      </div>
    </section>
  );
}
