(function () {
  'use strict';

  var header = document.getElementById('siteHeader');
  var menuBtn = document.getElementById('menuBtn');
  var siteNav = document.getElementById('siteNav');
  var heroTrack = document.getElementById('heroTrack');
  var heroPrev = document.getElementById('heroPrev');
  var heroNext = document.getElementById('heroNext');
  var heroDots = document.getElementById('heroDots');
  var contactForm = document.getElementById('contactForm');
  var formMsg = document.getElementById('formMsg');
  var backToTop = document.getElementById('backToTop');

  if (header && document.body.getAttribute('data-page') === 'home') {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  var revealEls = document.querySelectorAll('.home-reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          animateCounters(entry.target);
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObs.observe(el); });
  }

  initHomePage();

  function initHomePage() {
    if (document.body.getAttribute('data-page') !== 'home') return;

    initHeroRotator();
    initHeroSlides();
    initReviewSlider();
    initHeroParallax();
  }

  function animateCounters(scope) {
    var els = scope.querySelectorAll('[data-count]');
    els.forEach(function (el) {
      if (el.dataset.animated) return;
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (!target) return;
      el.dataset.animated = 'true';
      var start = 0;
      var duration = 1400;
      var startTime = null;

      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(start + (target - start) * eased));
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  }

  function initHeroRotator() {
    var el = document.getElementById('heroRotator');
    if (!el) return;
    var words = ['finansiering', 'forsikring', 'garantier', 'innbytte'];
    var idx = 0;

    setInterval(function () {
      el.classList.add('is-changing');
      setTimeout(function () {
        idx = (idx + 1) % words.length;
        el.textContent = words[idx];
        el.classList.remove('is-changing');
      }, 350);
    }, 3200);
  }

  function initHeroSlides() {
    var slides = document.querySelectorAll('.home-hero__slide');
    var thumbs = document.querySelectorAll('.home-hero__thumb');
    if (!slides.length) return;

    var current = 0;
    var timer = null;

    function goTo(i) {
      slides[current].classList.remove('is-active');
      if (thumbs[current]) thumbs[current].classList.remove('is-active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      if (thumbs[current]) thumbs[current].classList.add('is-active');
    }

    function play() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { goTo(current + 1); }, 5500);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        goTo(parseInt(thumb.getAttribute('data-slide'), 10));
        play();
      });
    });

    play();
  }

  function initReviewSlider() {
    var track = document.querySelector('.home-reviews__track');
    var reviews = track ? track.querySelectorAll('.home-review') : [];
    var prev = document.getElementById('reviewPrev');
    var next = document.getElementById('reviewNext');
    var dotsEl = document.getElementById('reviewDots');
    if (!reviews.length || !dotsEl) return;

    var idx = 0;

    reviews.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'home-reviews__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Anmeldelse ' + (i + 1));
      dot.addEventListener('click', function () { show(i); });
      dotsEl.appendChild(dot);
    });

    var dots = dotsEl.querySelectorAll('.home-reviews__dot');

    function show(i) {
      reviews[idx].classList.remove('is-active');
      if (dots[idx]) dots[idx].classList.remove('is-active');
      idx = (i + reviews.length) % reviews.length;
      reviews[idx].classList.add('is-active');
      if (dots[idx]) dots[idx].classList.add('is-active');
    }

    if (prev) prev.addEventListener('click', function () { show(idx - 1); });
    if (next) next.addEventListener('click', function () { show(idx + 1); });

    setInterval(function () { show(idx + 1); }, 8000);
  }

  function initHeroParallax() {
    var visual = document.getElementById('heroVisual');
    if (!visual || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (y > 600) return;
      visual.style.transform = 'translateY(' + (y * 0.12) + 'px)';
    }, { passive: true });
  }


  if (menuBtn && siteNav) {
    menuBtn.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      menuBtn.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    siteNav.querySelectorAll('.site-nav__link').forEach(function (a) {
      a.addEventListener('click', function () {
        siteNav.classList.remove('is-open');
        menuBtn.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  if (heroTrack && heroDots && heroPrev && heroNext) {
    var slides = heroTrack.querySelectorAll('.hero__slide');
    var idx = 0;
    var timer = null;
    var DELAY = 7000;

    function show(i) {
      slides[idx].classList.remove('is-active');
      if (heroDots.children[idx]) heroDots.children[idx].classList.remove('is-active');
      idx = (i + slides.length) % slides.length;
      slides[idx].classList.add('is-active');
      if (heroDots.children[idx]) heroDots.children[idx].classList.add('is-active');
    }

    function play() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { show(idx + 1); }, DELAY);
    }

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'hero__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', function () { show(i); play(); });
      heroDots.appendChild(dot);
    });

    heroPrev.addEventListener('click', function () { show(idx - 1); play(); });
    heroNext.addEventListener('click', function () { show(idx + 1); play(); });
    heroTrack.addEventListener('mouseenter', function () { if (timer) clearInterval(timer); });
    heroTrack.addEventListener('mouseleave', play);
    play();
  }

  if (contactForm && formMsg) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name');
      var email = document.getElementById('email');
      var phone = document.getElementById('phone');
      var subject = document.getElementById('subject');
      var message = document.getElementById('message');
      if (!name || !email || !subject) return;
      if (!name.value.trim() || !email.value.trim() || !subject.value) return;

      var btn = contactForm.querySelector('button[type="submit"]');
      btn.textContent = 'Sender...';
      btn.disabled = true;

      fetch('/api/kontakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          navn: name.value.trim(),
          epost: email.value.trim(),
          telefon: phone ? phone.value.trim() : '',
          emne: subject.value,
          melding: message ? message.value.trim() : ''
        })
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (!result.ok) throw new Error(result.data.error || 'Kunne ikke sende meldingen.');
          contactForm.reset();
          formMsg.hidden = false;
          setTimeout(function () { formMsg.hidden = true; }, 5000);
        })
        .catch(function () {
          alert('Kunne ikke sende meldingen. Prøv igjen eller ring oss.');
        })
        .finally(function () {
          btn.textContent = 'Send melding';
          btn.disabled = false;
        });
    });
  }

  if (backToTop) {
    backToTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
