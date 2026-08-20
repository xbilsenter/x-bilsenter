import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useFinnCar from '../hooks/useFinnCar';
import { formatKm, formatPrice, getModelSpec } from '../hooks/useFinnInventory';
import { innbytteLink } from '../utils/innbytteLink';
import { sortCarSpecs } from '../utils/carSpecOrder';

function normalizePhotos(car) {
  if (car?.photos?.length) return car.photos;
  if (car?.images?.length) {
    return car.images.map(function (url) {
      return { full: url, preview: url, thumb: url };
    });
  }
  if (car?.image) {
    return [{ full: car.image, preview: car.image, thumb: car.image }];
  }
  return [];
}

function CarLightbox({ photos, index, onClose, onChange }) {
  useEffect(function () {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onChange((index + 1) % photos.length);
      if (event.key === 'ArrowLeft') onChange((index - 1 + photos.length) % photos.length);
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return function () {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [index, onChange, onClose, photos.length]);

  const photo = photos[index];

  return (
    <div
      className="car-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Bildegalleri"
      onClick={onClose}
    >
      <button
        type="button"
        className="car-lightbox__close"
        onClick={function (event) {
          event.stopPropagation();
          onClose();
        }}
        aria-label="Lukk bildevisning"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>
      {photos.length > 1 ? (
        <>
          <button
            type="button"
            className="car-lightbox__nav car-lightbox__nav--prev"
            onClick={function (event) {
              event.stopPropagation();
              onChange((index - 1 + photos.length) % photos.length);
            }}
            aria-label="Forrige bilde"
          >
            ‹
          </button>
          <button
            type="button"
            className="car-lightbox__nav car-lightbox__nav--next"
            onClick={function (event) {
              event.stopPropagation();
              onChange((index + 1) % photos.length);
            }}
            aria-label="Neste bilde"
          >
            ›
          </button>
        </>
      ) : null}
      <div className="car-lightbox__stage" onClick={function (event) { event.stopPropagation(); }}>
        <img src={photo.full} alt="" />
      </div>
      <p className="car-lightbox__counter">{index + 1} / {photos.length}</p>
    </div>
  );
}

function CarGallery({ photos, title }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [isThumbDragging, setIsThumbDragging] = useState(false);
  const trackRef = useRef(null);
  const thumbsRef = useRef(null);
  const thumbDragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startScrollLeft: 0,
    thumbIndex: null
  });

  const goTo = useCallback(function (index) {
    const next = (index + photos.length) % photos.length;
    setActive(next);

    const track = trackRef.current;
    const slide = track?.children[next];
    if (slide) {
      slide.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  }, [photos.length]);

  const scrollThumbIntoView = useCallback(function (index) {
    const container = thumbsRef.current;
    const thumb = container?.children[index];
    if (!container || !thumb) return;

    const targetLeft = thumb.offsetLeft - (container.clientWidth / 2) + (thumb.clientWidth / 2);
    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth'
    });
  }, []);

  useEffect(function () {
    scrollThumbIntoView(active);
  }, [active, scrollThumbIntoView]);

  useEffect(function () {
    const thumbs = thumbsRef.current;
    if (!thumbs || photos.length <= 1) return undefined;

    function onWheel(event) {
      if (thumbs.scrollWidth <= thumbs.clientWidth) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      event.preventDefault();
      thumbs.scrollLeft += event.deltaY;
    }

    thumbs.addEventListener('wheel', onWheel, { passive: false });
    return function () {
      thumbs.removeEventListener('wheel', onWheel);
    };
  }, [photos.length]);

  function onThumbsPointerDown(event) {
    const thumbs = thumbsRef.current;
    if (!thumbs) return;

    const thumbButton = event.target.closest('.car-detail__thumb');
    const thumbIndex = thumbButton
      ? Array.from(thumbs.children).indexOf(thumbButton)
      : null;

    thumbDragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startScrollLeft: thumbs.scrollLeft,
      thumbIndex: thumbIndex >= 0 ? thumbIndex : null
    };
  }

  function onThumbsPointerMove(event) {
    const drag = thumbDragRef.current;
    const thumbs = thumbsRef.current;
    if (!drag.active || !thumbs) return;

    const deltaX = event.clientX - drag.startX;
    if (Math.abs(deltaX) <= 4) return;

    if (!drag.moved) {
      drag.moved = true;
      thumbs.setPointerCapture(event.pointerId);
      setIsThumbDragging(true);
    }

    thumbs.scrollLeft = drag.startScrollLeft - deltaX;
  }

  function finishThumbDrag(event) {
    const thumbs = thumbsRef.current;
    const drag = thumbDragRef.current;

    if (!drag.active) return;

    if (!drag.moved && drag.thumbIndex !== null) {
      goTo(drag.thumbIndex);
    }

    thumbDragRef.current = {
      active: false,
      moved: false,
      startX: 0,
      startScrollLeft: 0,
      thumbIndex: null
    };
    setIsThumbDragging(false);

    if (thumbs?.hasPointerCapture(event.pointerId)) {
      thumbs.releasePointerCapture(event.pointerId);
    }
  }

  if (!photos.length) {
    return <div className="car-detail__gallery car-detail__gallery--empty" aria-hidden="true" />;
  }

  function onTrackScroll() {
    const track = trackRef.current;
    if (!track || track.children.length === 0) return;

    const slideWidth = track.clientWidth;
    if (!slideWidth) return;

    const index = Math.round(track.scrollLeft / slideWidth);
    if (index !== active && index >= 0 && index < photos.length) {
      setActive(index);
    }
  }

  return (
    <>
      <div className="car-detail__gallery">
        <div className="car-detail__hero">
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                className="car-detail__hero-nav car-detail__hero-nav--prev"
                onClick={function () { goTo(active - 1); }}
                aria-label="Forrige bilde"
              >
                ‹
              </button>
              <button
                type="button"
                className="car-detail__hero-nav car-detail__hero-nav--next"
                onClick={function () { goTo(active + 1); }}
                aria-label="Neste bilde"
              >
                ›
              </button>
              <p className="car-detail__hero-counter" aria-live="polite">
                {active + 1} / {photos.length}
              </p>
            </>
          ) : null}

          <div
            className="car-detail__hero-track"
            ref={trackRef}
            onScroll={onTrackScroll}
            aria-label="Bildebilder"
          >
            {photos.map(function (photo, index) {
              return (
                <div className="car-detail__hero-slide" key={photo.full + index}>
                  <button
                    type="button"
                    className="car-detail__hero-image"
                    onClick={function () {
                      setActive(index);
                      setLightbox(true);
                    }}
                    aria-label={`Vis bilde ${index + 1} i fullskjerm`}
                  >
                    <img
                      src={photo.preview}
                      alt={index === 0 ? title : ''}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          <span className="car-detail__zoom-hint">Klikk for større bilde</span>
        </div>

        {photos.length > 1 ? (
          <div
            className={`car-detail__thumbs${isThumbDragging ? ' is-dragging' : ''}`}
            ref={thumbsRef}
            aria-label="Miniatyrbilder"
            onPointerDown={onThumbsPointerDown}
            onPointerMove={onThumbsPointerMove}
            onPointerUp={finishThumbDrag}
            onPointerCancel={finishThumbDrag}
          >
            {photos.map(function (photo, index) {
              return (
                <button
                  key={photo.full + index}
                  type="button"
                  className={`car-detail__thumb${index === active ? ' is-active' : ''}`}
                  onKeyDown={function (event) {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      goTo(index);
                    }
                  }}
                  aria-label={`Vis bilde ${index + 1}`}
                  aria-current={index === active ? 'true' : undefined}
                >
                  <img src={photo.thumb} alt="" loading="lazy" draggable={false} />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {lightbox ? (
        <CarLightbox
          photos={photos}
          index={active}
          onClose={function () { setLightbox(false); }}
          onChange={setActive}
        />
      ) : null}
    </>
  );
}

function CarSpecs({ specs, aside = false }) {
  const ordered = sortCarSpecs(specs);
  if (!ordered.length) return null;

  return (
    <div className={`car-detail__specs${aside ? ' car-detail__specs--aside' : ''}`}>
      <h2>Spesifikasjoner</h2>
      <dl>
        {ordered.map(function (item) {
          return (
            <div key={item.key} className="car-detail__spec-row">
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function CarEquipment({ equipment, aside = false }) {
  if (!equipment?.length) return null;

  return (
    <div className={`car-detail__equipment${aside ? ' car-detail__equipment--aside' : ''}`}>
      <h2>Utstyr</h2>
      <ul className="car-detail__equipment-list">
        {equipment.map(function (item) {
          return <li key={item}>{item}</li>;
        })}
      </ul>
    </div>
  );
}

function TrustTabIcon({ type }) {
  if (type === 'service') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === 'member') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.3L12 14.8 7.2 16.8l.9-5.3L4.2 7.7l5.4-.8L12 2z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9.5 12.5l1.8 1.8 3.7-3.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3l7 3v6c0 5-3 8.5-7 9-4-.5-7-4-7-9V6l7-3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function buildWarrantyText(warranty) {
  if (!warranty?.summary) return '';
  const summary = String(warranty.summary).replace(/\.$/, '');
  return `Denne bilen selges med ${summary}.`;
}

function buildServiceText(service) {
  if (!service?.items?.length) return '';

  const hasPlan = service.items.some(function (item) {
    return /serviceplan/i.test(item.label || '') || /serviceplan/i.test(item.value || '');
  });

  if (hasPlan) {
    return 'Kjøretøyets serviceprogram er fulgt. Det er tatt servicer på kjøretøyet i henhold til fabrikkens retningslinjer.';
  }

  return service.items.map(function (item) {
    return item.value || item.label;
  }).filter(Boolean).join('. ') + '.';
}

const MEMBER_TEXT = 'X Bilsenter AS er medlem av Bruktbilgruppen og følger derfor Bruktbilgruppen sine etiske retningslinjer. Dette gir deg som kunde økt trygghet og forutsigbarhet gjennom hele prosessen.';
const MEMBER_BENEFITS_URL = 'https://www.finn.no/mobility/bruktbilgruppen';

function CarTrustMenu({ service, warranty }) {
  const tabs = useMemo(function () {
    const items = [];

    if (warranty?.summary) {
      items.push({
        id: 'garanti',
        label: 'Garanti',
        icon: 'warranty',
        text: buildWarrantyText(warranty)
      });
    }

    if (service?.items?.length) {
      items.push({
        id: 'service',
        label: 'Service',
        icon: 'service',
        text: buildServiceText(service)
      });
    }

    items.push({
      id: 'medlem',
      label: 'Medlem',
      icon: 'member',
      text: MEMBER_TEXT,
      showMemberLogo: true
    });

    return items;
  }, [service, warranty]);

  const [activeId, setActiveId] = useState('garanti');

  useEffect(function () {
    if (!tabs.some(function (tab) { return tab.id === activeId; })) {
      setActiveId(tabs[0]?.id || 'medlem');
    }
  }, [tabs, activeId]);

  if (!tabs.length) return null;

  const activeTab = tabs.find(function (tab) { return tab.id === activeId; }) || tabs[0];

  return (
    <div className="car-detail__trust">
      <div className="car-detail__trust-tabs" role="tablist" aria-label="Garanti, service og medlem">
        {tabs.map(function (tab) {
          const selected = tab.id === activeTab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`car-trust-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`car-trust-panel-${tab.id}`}
              className={`car-detail__trust-tab${selected ? ' is-active' : ''}`}
              onClick={function () { setActiveId(tab.id); }}
            >
              <span className="car-detail__trust-tab-icon">
                <TrustTabIcon type={tab.icon} />
              </span>
              <span className="car-detail__trust-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div
        className="car-detail__trust-panel"
        role="tabpanel"
        id={`car-trust-panel-${activeTab.id}`}
        aria-labelledby={`car-trust-tab-${activeTab.id}`}
      >
        <div className="car-detail__trust-point">
          <img
            src="/assets/icon-star.png"
            alt=""
            className="car-detail__trust-point__icon"
            aria-hidden="true"
          />
          <div className="car-detail__trust-point__body">
            <p>{activeTab.text}</p>
            {activeTab.showMemberLogo ? (
              <>
                <img
                  src="/assets/partners/bruktbilgruppen.svg"
                  alt="Bruktbilgruppen"
                  className="car-detail__trust-member-logo"
                />
                <a
                  href={MEMBER_BENEFITS_URL}
                  className="btn btn--ghost btn--sm btn--full car-detail__trust-benefits-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Se dine fordeler
                  <span aria-hidden="true">↗</span>
                </a>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BilDetailPage() {
  const { id } = useParams();
  const { car, loading, error } = useFinnCar(id);
  const photos = useMemo(function () { return normalizePhotos(car); }, [car]);

  const title = car?.title || 'Bil';
  const modelSpec = getModelSpec(car);
  const sold = !!car?.sold;
  const meta = car ? [
    car.year,
    formatKm(car.mileage),
    car.fuel,
    car.transmission
  ].filter(Boolean).join(' · ') : '';

  return (
    <main className="car-detail-page">
      <div className="car-detail__bar">
        <div className="container car-detail__bar-inner">
          <Link to="/biler" className="btn btn--ghost btn--sm car-detail__back">
            <span aria-hidden="true">←</span>
            Alle biler
          </Link>
          <nav className="breadcrumb car-detail__breadcrumb" aria-label="Brødsmulesti">
            <Link to="/">Hjem</Link>
            <span>/</span>
            <Link to="/biler">Biler</Link>
            <span>/</span>
            <span>{loading ? '…' : (car?.model || title)}</span>
          </nav>
        </div>
      </div>

      <section className="section car-detail">
        <div className="container">
          {loading ? (
            <div className="car-detail__loading" aria-live="polite">
              Henter bilinformasjon…
            </div>
          ) : null}

          {!loading && error ? (
            <div className="inventory-empty">
              <h3>Kunne ikke vise bilen</h3>
              <p>{error}</p>
              <div className="inventory-empty__actions">
                <Link to="/biler" className="btn btn--brand">Tilbake til biler</Link>
                <Link to="/kontakt" className="btn btn--ghost">Kontakt oss</Link>
              </div>
            </div>
          ) : null}

          {!loading && !error && car ? (
            <div className="car-detail__layout">
              <div className={`car-detail__cell car-detail__cell--gallery${sold ? ' car-detail__cell--sold' : ''}`}>
                {sold ? (
                  <span className="inventory-card__badge inventory-card__badge--sold">Solgt</span>
                ) : null}
                <CarGallery photos={photos} title={title} />
              </div>

              <div className="car-detail__col-main">
                {car.description ? (
                  <div className="car-detail__description">
                    <h2>Om bilen</h2>
                    <div
                      className="car-detail__description-body"
                      dangerouslySetInnerHTML={{ __html: car.description }}
                    />
                  </div>
                ) : null}

                <CarEquipment equipment={car.equipment} />
              </div>

              <aside className="car-detail__col-aside">
                <div className="car-detail__summary">
                  {car.make ? <p className="car-detail__eyebrow">{car.make}</p> : null}
                  <h1 className="car-detail__title">{car.model || title}</h1>
                  {modelSpec ? (
                    <p className="car-detail__variant">{modelSpec}</p>
                  ) : null}
                  {meta ? <p className="car-detail__meta">{meta}</p> : null}
                  {car.location ? <p className="car-detail__location">{car.location}</p> : null}
                  <p className={`car-detail__price${sold ? ' car-detail__price--sold' : ''}`}>
                    {formatPrice(car.price, car)}
                  </p>
                  <div className="car-detail__actions">
                    {!sold ? (
                      <>
                        <Link to="/kontakt" className="btn btn--brand btn--full">
                          Kontakt oss
                        </Link>
                        <Link to={innbytteLink(car)} className="btn btn--ghost btn--full">
                          Innbytte
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/biler" className="btn btn--brand btn--full">
                          Se biler til salgs
                        </Link>
                        <Link to="/kontakt" className="btn btn--ghost btn--full">
                          Kontakt oss
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                <CarTrustMenu service={car.service} warranty={car.warranty} />

                <CarSpecs specs={car.specs} aside />
              </aside>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
