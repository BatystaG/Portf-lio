/**
 * Custom cursor — dot + ring with hover-state morphing
 */
export function initCursor() {
  // Skip on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  // Hide default cursor
  document.body.style.cursor = 'none';

  let ringX = 0, ringY = 0;
  let dotX  = 0, dotY  = 0;
  let raf;

  document.addEventListener('mousemove', (e) => {
    dotX = e.clientX;
    dotY = e.clientY;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    // Dot follows instantly
    dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;

    // Ring lags behind
    ringX = lerp(ringX, dotX, 0.15);
    ringY = lerp(ringY, dotY, 0.15);
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);

  // Hover states
  document.querySelectorAll('a, button, [data-cursor="hover"]').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  // Cleanup on unload
  window.addEventListener('unload', () => cancelAnimationFrame(raf));
}
