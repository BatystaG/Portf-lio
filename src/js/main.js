/**
 * Portfolio  -  main entry point
 */
import { initCursor }        from './cursor.js';
import { initTheme }         from './theme.js';
import { initScroll }        from './scroll.js';
import { initTypewriter }    from './typewriter.js';
import { initGamification }  from './gamification.js';
import { animateHero }       from './hero.js';

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initTheme();
  initScroll();
  animateHero();

  initTypewriter('.typed-text', [
    'QA Engineer',
    'Quality Assurance',
    'Quality Engineering',
  ]);

  initGamification();
});
