/**
 * Gamification system
 *  - XP points for user interactions
 *  - Achievement unlocks with toast notifications
 *  - Level progression
 */

const LEVELS = [
  { level: 1, name: 'Visitante',   xpRequired: 0   },
  { level: 2, name: 'Explorador',  xpRequired: 50  },
  { level: 3, name: 'Entusiasta',  xpRequired: 150 },
  { level: 4, name: 'Fã',          xpRequired: 300 },
  { level: 5, name: 'Super Fã',    xpRequired: 500 },
];

const ACHIEVEMENTS = [
  { id: 'first_scroll',   emoji: '📜', title: 'Primeiro Scroll',      desc: 'Começou a explorar',             xp: 10  },
  { id: 'projects_seen',  emoji: '🔭', title: 'Explorador',           desc: 'Conferiu os projetos',           xp: 30  },
  { id: 'contact_open',   emoji: '📬', title: 'Entrando em Contato',  desc: 'Abriu a seção de contato',       xp: 20  },
  { id: 'theme_toggle',   emoji: '🌙', title: 'Coruja Noturna',       desc: 'Trocou o tema',                  xp: 15  },
  { id: 'all_sections',   emoji: '🗺️', title: 'Tour Completo',        desc: 'Visitou todas as seções',        xp: 50  },
  { id: 'idle_5s',        emoji: '☕', title: 'Só Olhando',           desc: 'Aproveitando o tempo...',        xp: 5   },
  { id: 'github_click',   emoji: '🐙', title: 'Curioso do Código',    desc: 'Conferiu o GitHub',              xp: 25  },
];

const state = {
  xp:           parseInt(sessionStorage.getItem('xp') || '0'),
  level:        1,
  unlocked:     JSON.parse(sessionStorage.getItem('unlocked') || '[]'),
  visited:      new Set(),
};

function save() {
  sessionStorage.setItem('xp',       state.xp);
  sessionStorage.setItem('unlocked', JSON.stringify(state.unlocked));
}

function getLevelData(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
  }
  const nextIndex = LEVELS.indexOf(current) + 1;
  const next = LEVELS[nextIndex] || null;
  return { current, next };
}

function addXP(amount) {
  const before = getLevelData(state.xp).current;
  state.xp += amount;
  save();

  const after = getLevelData(state.xp).current;

  // Level up!
  if (after.level > before.level) {
    showToast({
      emoji: '⬆️',
      title: `Nível ${after.level} — ${after.name}!`,
      desc:  `Você subiu de nível! Continue explorando.`,
      type:  'level-up',
    });
  }

  updateXPBar();
}

function unlock(achievementId) {
  if (state.unlocked.includes(achievementId)) return;
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return;

  state.unlocked.push(achievementId);
  save();
  addXP(achievement.xp);

  showToast({
    emoji: achievement.emoji,
    title: `Conquista: ${achievement.title}`,
    desc:  `+${achievement.xp} XP — ${achievement.desc}`,
    type:  'achievement',
  });

  // Update badge UI
  const badge = document.querySelector(`[data-achievement="${achievementId}"]`);
  badge?.classList.add('unlocked');
}

function updateXPBar() {
  const xpEl     = document.querySelector('.nav__xp-value');
  const barFill  = document.querySelector('.xp-bar__fill');
  const levelEl  = document.querySelector('.xp-panel__level');
  const pointsEl = document.querySelector('.xp-panel__points');

  const { current, next } = getLevelData(state.xp);

  if (xpEl)     xpEl.textContent = `${state.xp} XP`;
  if (levelEl)  levelEl.textContent = `LVL ${current.level} — ${current.name}`;

  const pct = next
    ? ((state.xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100
    : 100;

  if (barFill) barFill.style.width = `${Math.min(pct, 100)}%`;
  if (pointsEl) {
    pointsEl.textContent = next
      ? `${state.xp} / ${next.xpRequired} XP → LVL ${next.level}`
      : `NÍVEL MÁXIMO — ${state.xp} XP`;
  }
}

function showToast({ emoji, title, desc, type = 'achievement' }) {
  const container = document.querySelector('.toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${emoji}</span>
    <div>
      <div class="toast__title">${title}</div>
      <div class="toast__desc">${desc}</div>
    </div>
  `;

  container.appendChild(toast);

  // Remove after animation (toastOut is 0.4s at 3s delay)
  setTimeout(() => toast.remove(), 3600);
}

export function initGamification() {
  updateXPBar();

  // Restore already unlocked badges
  state.unlocked.forEach(id => {
    document.querySelector(`[data-achievement="${id}"]`)?.classList.add('unlocked');
  });

  // --- Triggers ---

  // First scroll
  const firstScrollHandler = () => {
    unlock('first_scroll');
    window.removeEventListener('scroll', firstScrollHandler);
  };
  window.addEventListener('scroll', firstScrollHandler, { passive: true, once: true });

  // Theme toggle
  document.querySelector('.nav__theme-btn')?.addEventListener('click', () => {
    unlock('theme_toggle');
  });

  // GitHub link click
  document.querySelectorAll('a[href*="github.com"]').forEach(el => {
    el.addEventListener('click', () => unlock('github_click'), { once: true });
  });

  // Track section visits
  const sectionMap = {
    projects: 'projects_seen',
    contact:  'contact_open',
  };

  const visitObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      if (sectionMap[id]) unlock(sectionMap[id]);
      state.visited.add(id);

      const required = ['hero', 'about', 'skills', 'projects', 'contact'];
      if (required.every(s => state.visited.has(s))) unlock('all_sections');
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('section[id]').forEach(s => visitObserver.observe(s));

  // Idle 5s
  let idleTimer;
  const resetIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => unlock('idle_5s'), 5000);
  };
  ['mousemove', 'scroll', 'keydown'].forEach(e =>
    window.addEventListener(e, resetIdle, { passive: true })
  );
  resetIdle();
}
