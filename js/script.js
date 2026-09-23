// ===== Loader =====
(() => {
  const loader = document.getElementById('loader');
  const hide = () => setTimeout(() => loader.classList.add('hide'), 500);
  if (document.readyState === 'complete') hide();
  else window.addEventListener('load', hide);
})();

// ===== Header scroll state =====
const header = document.getElementById('header');
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 40);
  backToTop.classList.toggle('show', y > 500);
});

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const icon = navToggle.querySelector('i');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-xmark');
});
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// ===== Active link on scroll =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 160;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
});

// ===== Cursor glow =====
const glow = document.getElementById('cursor-glow');
window.addEventListener('mousemove', (e) => {
  glow.style.opacity = 1;
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});
window.addEventListener('mouseleave', () => glow.style.opacity = 0);

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// ===== Counter animation =====
const counters = document.querySelectorAll('.impact-num');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10);
      let count = 0;
      const step = Math.max(1, Math.ceil(target / 60));
      const tick = () => {
        count += step;
        if (count >= target) { el.textContent = target; return; }
        el.textContent = count;
        requestAnimationFrame(tick);
      };
      tick();
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach(el => counterObserver.observe(el));
