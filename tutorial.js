/**
 * Oliva — Interactive Onboarding & Mini Tutorial
 */
import { isOnboardingCompleted, setOnboardingCompleted } from './storage.js';
import { renderIcons } from './icons.js';

const SLIDES = [
  {
    icon: 'sparkles',
    title: 'Effortless Quick Add',
    description: 'Type natural grocery notes like <strong>"2 Milk lt"</strong> or <strong>"Apples 1.5kg"</strong>. Our smart parser auto-detects quantity, unit, and supermarket aisle instantly.',
    tip: 'No tedious multi-field forms required!'
  },
  {
    icon: 'check-circle-2',
    title: 'One-Tap In-Store Shopping',
    description: 'When walking down the aisles with your cart, simply <strong>tap anywhere on an item</strong> to mark it as collected. Watch your real-time progress bar fill up!',
    tip: 'Designed for quick, comfortable one-hand use.'
  },
  {
    icon: 'layers',
    title: 'Organized by Supermarket Aisle',
    description: 'Group items by department — <em>Produce, Dairy, Bakery, Pantry</em> — so you never backtrack between store sections. When done, submit your purchase with one click.',
    tip: 'Save time on every supermarket visit.'
  }
];

let currentSlide = 0;
let modalEl = null;

export function initTutorial(forceOpen = false) {
  createTutorialModal();

  if (forceOpen || !isOnboardingCompleted()) {
    openTutorial();
  }

  // Bind any [data-open-tutorial] buttons
  document.querySelectorAll('[data-open-tutorial]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openTutorial();
    });
  });
}

function createTutorialModal() {
  if (document.getElementById('tutorialModal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'tutorialModal';
  overlay.className = 'tutorial-overlay';
  overlay.innerHTML = `
    <div class="tutorial-card">
      <div class="tutorial-top-bar">
        <span class="tutorial-step-tag" id="tutorialStepTag">Step 1 of 3</span>
        <button type="button" class="tutorial-skip-btn" id="tutorialSkipBtn">Skip</button>
      </div>

      <div class="tutorial-body" id="tutorialBody">
        <!-- Rendered dynamically -->
      </div>

      <div class="tutorial-footer">
        <div class="tutorial-dots" id="tutorialDots">
          <span class="tutorial-dot active"></span>
          <span class="tutorial-dot"></span>
          <span class="tutorial-dot"></span>
        </div>
        <div class="tutorial-actions">
          <button type="button" class="btn btn-ghost" id="tutorialPrevBtn" style="display:none; padding:8px 14px;">Back</button>
          <button type="button" class="btn btn-primary" id="tutorialNextBtn" style="padding:8px 18px;">Next</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  modalEl = overlay;

  document.getElementById('tutorialSkipBtn').addEventListener('click', closeTutorial);
  document.getElementById('tutorialPrevBtn').addEventListener('click', () => changeSlide(-1));
  document.getElementById('tutorialNextBtn').addEventListener('click', () => {
    if (currentSlide === SLIDES.length - 1) {
      closeTutorial();
    } else {
      changeSlide(1);
    }
  });
}

function renderSlide(index) {
  const slide = SLIDES[index];
  const body = document.getElementById('tutorialBody');
  const stepTag = document.getElementById('tutorialStepTag');
  const prevBtn = document.getElementById('tutorialPrevBtn');
  const nextBtn = document.getElementById('tutorialNextBtn');
  const dots = document.getElementById('tutorialDots');

  stepTag.textContent = `Tip ${index + 1} of ${SLIDES.length}`;

  body.innerHTML = `
    <div class="tutorial-icon-wrap">
      <i data-lucide="${slide.icon}" style="width:26px;height:26px;"></i>
    </div>
    <h3 class="tutorial-headline">${slide.title}</h3>
    <p class="tutorial-copy">${slide.description}</p>
    <div class="tutorial-callout">
      <i data-lucide="info" style="width:13px;height:13px;"></i>
      <span>${slide.tip}</span>
    </div>
  `;

  if (dots) {
    dots.querySelectorAll('.tutorial-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  prevBtn.style.display = index > 0 ? 'inline-flex' : 'none';
  if (index === SLIDES.length - 1) {
    nextBtn.innerHTML = '<span>Got it, let\'s shop!</span> <i data-lucide="arrow-right" style="width:15px;height:15px;"></i>';
  } else {
    nextBtn.innerHTML = '<span>Next</span> <i data-lucide="arrow-right" style="width:15px;height:15px;"></i>';
  }

  renderIcons(body);
  renderIcons(nextBtn);
}

function changeSlide(direction) {
  currentSlide = Math.max(0, Math.min(SLIDES.length - 1, currentSlide + direction));
  renderSlide(currentSlide);
}

export function openTutorial() {
  currentSlide = 0;
  if (!modalEl) createTutorialModal();
  renderSlide(0);
  modalEl.classList.add('show');
}

export function closeTutorial() {
  if (modalEl) {
    modalEl.classList.remove('show');
  }
  setOnboardingCompleted();
}
