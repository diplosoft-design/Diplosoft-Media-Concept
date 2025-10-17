document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        links && links.classList.remove('open');
      }
    });
  });

  // Simple Carousel
  document.querySelectorAll('[data-carousel]')?.forEach((carousel) => {
    const track = carousel.querySelector('[data-carousel-track]');
    const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    const dotsWrap = carousel.querySelector('[data-carousel-dots]');
    let index = 0;
    let timer;

    function update(active) {
      index = (active + slides.length) % slides.length;
      const offset = -index * 100;
      track.style.transform = `translateX(${offset}%)`;
      if (dotsWrap) {
        dotsWrap.querySelectorAll('button').forEach((d, i) => {
          d.classList.toggle('active', i === index);
        });
      }
    }

    function next() { update(index + 1); }
    function prev() { update(index - 1); }

    function startAuto() {
      stopAuto();
      timer = setInterval(next, 5000);
    }
    function stopAuto() { if (timer) clearInterval(timer); }

    nextBtn?.addEventListener('click', () => { next(); startAuto(); });
    prevBtn?.addEventListener('click', () => { prev(); startAuto(); });

    // Build dots
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Go to slide ${i + 1}`);
        b.addEventListener('click', () => { update(i); startAuto(); });
        dotsWrap.appendChild(b);
      });
    }

    // Swipe support
    let startX = null;
    track.addEventListener('pointerdown', (e) => { startX = e.clientX; stopAuto(); track.setPointerCapture(e.pointerId); });
    track.addEventListener('pointerup', (e) => {
      if (startX == null) return; const dx = e.clientX - startX; startX = null; startAuto();
      if (dx > 40) prev(); else if (dx < -40) next();
    });

    update(0);
    startAuto();
  });
});
