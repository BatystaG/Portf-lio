/**
 * Scroll utilities:
 *  - Progress bar
 *  - Nav scrolled state
 *  - Intersection Observer reveal
 */
export function initScroll() {
  const progressBar = document.querySelector('.scroll-progress');
  const nav         = document.querySelector('.nav');

  // --- Scroll progress bar ---
  function updateProgress() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? scrollTop / docHeight : 0;
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    if (nav) nav.classList.toggle('scrolled', scrollTop > 60);
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // --- Reveal on scroll (IntersectionObserver) ---
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Unobserve after reveal for performance
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  document.querySelectorAll('.reveal, .stagger').forEach(el => observer.observe(el));

  // Nav active section highlight
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__link[href^="#"]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => sectionObserver.observe(s));
}
