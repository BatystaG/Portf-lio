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
  { id: 'first_scroll',   icon: 'search',         title: 'E lá vamos nós...',           desc: 'Desceu a página sem abrir chamado',                 xp: 10 },
  { id: 'projects_seen',  icon: 'bug',            title: 'Detetive de bug',             desc: 'Inspecionou a seção inteira. Suspeito',            xp: 30 },
  { id: 'contact_open',   icon: 'mail',           title: 'Tem vaga ou é só formulário?', desc: 'Chegou no contato. Agora falta a vaga',             xp: 20 },
  { id: 'theme_toggle',   icon: 'moon',           title: 'Meus Olhos Queimam',          desc: 'Alternou o tema. Seus olhos que aguentem',        xp: 15 },
  { id: 'all_sections',   icon: 'list-checks',    title: 'Leu até o fim. Preocupante.', desc: 'Nenhuma seção escapou da inspeção',                xp: 50 },
  { id: 'idle_5s',        icon: 'timer',          title: 'Timeout de atenção',         desc: 'Cinco segundos parado. Incidente ou café?',        xp: 5  },
  { id: 'coffee_break',   icon: 'coffee-steam',   title: 'Pausa para o cafezinho',     desc: 'Xícara quente em mãos. O bug pode esperar.',       xp: 0  },
  { id: 'github_click',   icon: 'search-code',    title: 'Fiscal do GitHub',            desc: 'Abriu meu perfil para investigar',                xp: 25 },
  { id: 'focused_30s',    icon: 'target',         title: 'Cadê o bug?',                 desc: 'Trinta segundos sem abrir outra aba',              xp: 20 },
  { id: 'stack_analyzed', icon: 'wrench',         title: 'Stack sob interrogatório',   desc: 'Nenhuma tecnologia saiu ilesa',                    xp: 25 },
  { id: 'java_cert',      icon: 'wrench',         title: 'Java me ensinou humildade',  desc: 'Certificado concluído. O código funciona, a sanidade quase não.', xp: 35 },
  { id: 'early_bird',     icon: 'clock',          title: 'QA de madrugada',            desc: 'Rodou o teste antes do café. Audacioso',           xp: 30 },
  { id: 'form_started',   icon: 'pen-line',       title: 'Escreveu, apagou, repetiu',  desc: 'Requisito indefinido? Compreensível',             xp: 15 },
  { id: 'back_to_top',    icon: 'arrow-up',       title: 'Reproduziu o caminho todo',  desc: 'Voltou ao topo. Teste de regressão?',             xp: 10 },
  { id: 'linkedin_click', icon: 'user-round-plus', title: 'Networking sem evidência',   desc: 'Abriu o LinkedIn. Agora mande o convite',          xp: 20 },
  { id: 'theme_maniac',   icon: 'repeat-2',       title: 'Regressão cromática',        desc: 'O tema mudou três vezes. Mudou o requisito?',      xp: 15 },
  { id: 'avatar_hover',   icon: 'scan-face',      title: 'Auditoria de pixel',         desc: 'Inspecionou a foto em busca de defeito',           xp: 10 },
];

const state = {
  xp:            parseInt(sessionStorage.getItem('xp') || '0'),
  level:         1,
  unlocked:      JSON.parse(sessionStorage.getItem('unlocked') || '[]'),
  visited:       new Set(),
  themeToggleCount: parseInt(sessionStorage.getItem('themeCount') || '0'),
  hoveredTags:   new Set(JSON.parse(sessionStorage.getItem('hoveredTags') || '[]')),
};

function save() {
  sessionStorage.setItem('xp',          state.xp);
  sessionStorage.setItem('unlocked',    JSON.stringify(state.unlocked));
  sessionStorage.setItem('themeCount',  state.themeToggleCount);
  sessionStorage.setItem('hoveredTags', JSON.stringify([...state.hoveredTags]));
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

  if (after.level > before.level) {
    showToast({
      icon: 'arrow-up',
      title: `Nível ${after.level}  -  ${after.name}!`,
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
  if (achievement.xp > 0) addXP(achievement.xp);

  showToast({
    icon: achievement.icon,
    title: `Conquista: ${achievement.title}`,
    desc:  achievement.xp > 0 ? `+${achievement.xp} XP  -  ${achievement.desc}` : achievement.desc,
    type:  'achievement',
  });

  // Update skills section badge
  document.querySelector(`[data-achievement="${achievementId}"]`)?.classList.add('unlocked');
  // Update floating HUD badge
  const hudBadge = document.querySelector(`[data-hud-achievement="${achievementId}"]`);
  if (hudBadge) {
    hudBadge.classList.add('unlocked');
    hudBadge.animate([
      { transform: 'scale(1)',    filter: 'brightness(1)' },
      { transform: 'scale(1.35)', filter: 'brightness(1.6)' },
      { transform: 'scale(1)',    filter: 'brightness(1)' },
    ], { duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
  }
}

function updateXPBar() {
  const { current, next } = getLevelData(state.xp);
  const pct = next
    ? ((state.xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100
    : 100;
  const pctClamped = Math.min(pct, 100);

  // -- Skills section XP panel --
  const xpEl     = document.querySelector('.nav__xp-value');
  const barFill  = document.querySelector('.xp-bar__fill');
  const levelEl  = document.querySelector('.xp-panel__level');
  const pointsEl = document.querySelector('.xp-panel__points');

  if (xpEl)     xpEl.textContent     = `${state.xp} XP`;
  if (levelEl)  levelEl.textContent  = `LVL ${current.level}  -  ${current.name}`;
  if (barFill)  barFill.style.width  = `${pctClamped}%`;
  if (pointsEl) pointsEl.textContent = next
    ? `${state.xp} / ${next.xpRequired} XP → LVL ${next.level}`
    : `NÍVEL MÁXIMO  -  ${state.xp} XP`;

  // -- Floating HUD --
  const hudLevel   = document.querySelector('.hud__panel-level');
  const hudPts     = document.querySelector('.hud__panel-pts');
  const hudBarFill = document.querySelector('.hud__bar-fill');
  const hudBadge   = document.querySelector('.hud__level-badge');
  const hudMiniBar = document.querySelector('.hud__mini-bar-fill');
  const hudXpText  = document.querySelector('.hud__xp-text');
  const hudCount   = document.querySelector('.hud-unlocked-count');

  if (hudLevel)   hudLevel.textContent  = `LVL ${current.level}  -  ${current.name}`;
  if (hudPts)     hudPts.textContent    = next
    ? `${state.xp} / ${next.xpRequired} XP`
    : `${state.xp} XP  -  MAX`;
  if (hudBarFill) hudBarFill.style.width  = `${pctClamped}%`;
  if (hudBadge)   hudBadge.textContent    = `LVL ${current.level}`;
  if (hudMiniBar) hudMiniBar.style.width  = `${pctClamped}%`;
  if (hudXpText)  hudXpText.textContent   = `${state.xp} XP`;
  if (hudCount)   hudCount.textContent    = state.unlocked.length;
}

const toastQueue = [];
let toastActive = false;

function showToast(notification) {
  toastQueue.push(notification);
  showNextToast();
}

function showNextToast() {
  const container = document.querySelector('.toast-container');
  if (!container || toastActive || toastQueue.length === 0) return;

  const { icon, title, desc, type = 'achievement' } = toastQueue.shift();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon"><svg aria-hidden="true"><use href="assets/icons.svg#${icon}"></use></svg></span>
    <div>
      <div class="toast__title">${title}</div>
      <div class="toast__desc">${desc}</div>
    </div>
  `;

  toastActive = true;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
    toastActive = false;
    showNextToast();
  }, 3600);
}

export function initGamification() {
  updateXPBar();

  // Restore already unlocked badges (skills panel + HUD)
  state.unlocked.forEach(id => {
    document.querySelector(`[data-achievement="${id}"]`)?.classList.add('unlocked');
    document.querySelector(`[data-hud-achievement="${id}"]`)?.classList.add('unlocked');
  });

  // -- HUD toggle --------------------------------------------
  const hud    = document.getElementById('hud');
  const toggle = hud?.querySelector('.hud__toggle');

  toggle?.addEventListener('click', () => {
    const isOpen = hud.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close HUD when clicking outside
  document.addEventListener('click', (e) => {
    if (hud && !hud.contains(e.target)) {
      hud.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
  });

  // -- Achievement tooltips (panel-based, works on desktop + mobile) --
  const hudTooltip      = document.getElementById('hud-tooltip');
  const hudTooltipTitle = hudTooltip?.querySelector('.hud__tooltip-title');
  const hudTooltipHint  = hudTooltip?.querySelector('.hud__tooltip-hint');
  let tooltipTimer;
  const isTouch = window.matchMedia('(hover: none)').matches;

  const showTooltip = (el) => {
    if (!hudTooltip) return;
    clearTimeout(tooltipTimer);
    hudTooltipTitle.textContent = el.dataset.title || '';
    hudTooltipHint.textContent  = el.dataset.hint  || '';
    hudTooltip.classList.add('visible');
    hudTooltip.setAttribute('aria-hidden', 'false');
  };
  const hideTooltip = () => {
    tooltipTimer = setTimeout(() => {
      hudTooltip?.classList.remove('visible');
      hudTooltip?.setAttribute('aria-hidden', 'true');
    }, 200);
  };

  document.querySelectorAll('.hud__achievement').forEach(el => {
    if (isTouch) {
      // Touch: tap always shows; tapping same one again hides
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (hudTooltip?.classList.contains('visible') &&
            hudTooltipTitle?.textContent === el.dataset.title) {
          hudTooltip.classList.remove('visible');
        } else {
          showTooltip(el);
        }
      });
    } else {
      el.addEventListener('mouseenter', () => showTooltip(el));
      el.addEventListener('mouseleave', hideTooltip);
    }
  });

  // -- First scroll ------------------------------------------
  window.addEventListener('scroll', () => unlock('first_scroll'), { passive: true, once: true });

  // -- Theme toggle ------------------------------------------
  document.querySelector('.nav__theme-btn')?.addEventListener('click', () => {
    unlock('theme_toggle');
    state.themeToggleCount++;
    save();
    if (state.themeToggleCount >= 3) unlock('theme_maniac');
  });

  // -- Logo → back to top ------------------------------------
  document.querySelector('.nav__logo')?.addEventListener('click', () => unlock('back_to_top'));

  // -- GitHub click ------------------------------------------
  document.querySelectorAll('a[href*="github.com"]').forEach(el =>
    el.addEventListener('click', () => unlock('github_click'), { once: true })
  );

  // -- LinkedIn click ----------------------------------------
  document.querySelectorAll('a[href*="linkedin.com"]').forEach(el =>
    el.addEventListener('click', () => unlock('linkedin_click'), { once: true })
  );

  // -- Avatar hover ------------------------------------------
  document.querySelector('.about__avatar-inner')?.addEventListener('mouseenter', () => {
    unlock('avatar_hover');
  }, { once: true });

  // -- Form started ------------------------------------------
  document.querySelectorAll('#contact-form input, #contact-form textarea').forEach(el =>
    el.addEventListener('input', () => unlock('form_started'), { once: true })
  );

  // -- Contact form ------------------------------------------
  const contactModal = document.querySelector('#contact-modal');
  contactModal?.querySelector('[data-contact-modal-close]')?.addEventListener('click', () => {
    contactModal.close();
  });

  document.querySelector('#contact-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.reportValidity()) return;

    contactModal?.showModal();
  });

  // -- Early bird (00h-06h) ----------------------------------
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) unlock('early_bird');

  // -- Coffee break -----------------------------------------
  document.querySelectorAll('[data-coffee-cup]').forEach(button =>
    button.addEventListener('click', () => unlock('coffee_break'))
  );

  // -- Stack analyzed  -  hover all skill tags -----------------
  const allTags = document.querySelectorAll('.skills-grid .tag');
  const totalTags = allTags.length;

  allTags.forEach(tag => {
    tag.addEventListener('mouseenter', () => {
      state.hoveredTags.add(tag.textContent.trim());
      save();
      if (state.hoveredTags.size >= totalTags) unlock('stack_analyzed');
    });
  });

  // -- Section visits + Full tour + Focused 30s -------------
  const sectionMap = {
    projects: 'projects_seen',
    contact:  'contact_open',
  };

  const sectionTimers = {};

  const visitObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;

      if (entry.isIntersecting) {
        // Unlock section-specific achievement
        if (sectionMap[id]) unlock(sectionMap[id]);
        state.visited.add(id);

        // Full tour
        const required = ['hero', 'about', 'education', 'skills', 'projects', 'contact'];
        if (required.every(s => state.visited.has(s))) unlock('all_sections');

        // Focused 30s  -  start timer
        sectionTimers[id] = setTimeout(() => unlock('focused_30s'), 30000);
      } else {
        // Left section  -  cancel timer
        clearTimeout(sectionTimers[id]);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('section[id]').forEach(s => visitObserver.observe(s));

  // -- Idle 5s -----------------------------------------------
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
