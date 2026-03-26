/**
 * Hero section entrance animations (CSS transitions, no GSAP dependency)
 */
export function animateHero() {
  const sequence = [
    { selector: '.hero__eyebrow', delay: 300  },
    { selector: '.hero__name',    delay: 500  },
    { selector: '.hero__role',    delay: 700  },
    { selector: '.hero__desc',    delay: 900  },
    { selector: '.hero__cta',     delay: 1100 },
    { selector: '.hero__stats',   delay: 1300 },
  ];

  sequence.forEach(({ selector, delay }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    setTimeout(() => {
      el.style.transition = 'opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, delay);
  });
}
