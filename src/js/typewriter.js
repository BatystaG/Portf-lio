/**
 * Typewriter effect for hero role text
 */
export function initTypewriter(selector, words, { speed = 80, deleteSpeed = 40, pause = 2000 } = {}) {
  const el = document.querySelector(selector);
  if (!el) return;

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const current = words[wordIndex % words.length];

    if (!isDeleting) {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(type, pause);
        return;
      }
    } else {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        wordIndex++;
      }
    }

    setTimeout(type, isDeleting ? deleteSpeed : speed);
  }

  type();
}
