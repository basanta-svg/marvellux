/**
 * Multi-step "Custom tour / Get a free quote" form on /contact.html.
 * Steps are visual grouping (fieldsets), not gated: every field is always in
 * the DOM and the live "Your request" summary card updates as the user interacts.
 *
 * NOTE: like the original site, submit is front-end only (validates, shows the
 * confirmation state). There is no backend endpoint yet.
 */
const form = document.getElementById('quote-form') as HTMLFormElement | null;

if (form) {
  const PRESET_TILES: Record<string, string[]> = {
    'guide-only': [],
    'guide-driver': ['transport'],
    'full-service': ['transport', 'visa', 'hotels', 'meals', 'fees'],
    undecided: [],
  };
  const WHEN_LABEL: Record<string, string> = { exact: 'Exact dates', flexible: 'A month or two', unsure: 'Not sure yet' };

  const $ = <T extends Element>(sel: string) => form.querySelector<T>(sel);
  const $$ = <T extends Element>(sel: string) => Array.from(form.querySelectorAll<T>(sel));
  const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;

  const presetBtns = $$<HTMLElement>('.quote-pill');
  const tiles = $$<HTMLElement>('.quote-tile[data-tile]');
  let applyingPreset = false;

  const setTileChecked = (tile: HTMLElement, checked: boolean) => {
    tile.querySelector('input')!.checked = checked;
    tile.classList.toggle('is-checked', checked);
  };

  $('.quote-tile.is-locked')?.classList.add('is-checked');

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      presetBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      const wanted = PRESET_TILES[btn.dataset.preset ?? ''] ?? [];
      applyingPreset = true;
      tiles.forEach((tile) => setTileChecked(tile, wanted.includes(tile.dataset.tile ?? '')));
      applyingPreset = false;
      updateSummary();
    });
  });

  tiles.forEach((tile) => {
    const input = tile.querySelector('input')!;
    input.addEventListener('change', () => {
      tile.classList.toggle('is-checked', input.checked);
      if (!applyingPreset) presetBtns.forEach((b) => b.classList.remove('is-active'));
      updateSummary();
    });
  });

  // Step 2 — when / segmented control
  const segmentBtns = $$<HTMLElement>('.quote-segment');
  const whenPanels = $$<HTMLElement>('[data-panel]');
  segmentBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      segmentBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
      whenPanels.forEach((p) => (p.hidden = p.dataset.panel !== btn.dataset.when));
      updateSummary();
    });
  });

  const startInput = $<HTMLInputElement>('#qf-start');
  startInput?.addEventListener('change', updateSummary);

  // Trip length
  const lengthInput = $<HTMLInputElement>('#qf-length');
  const lengthHelper = $<HTMLElement>('.quote-length-helper');
  const days = () => Math.max(1, parseInt(lengthInput?.value ?? '', 10) || 1);
  lengthInput?.addEventListener('input', () => {
    if (lengthHelper) lengthHelper.textContent = `${plural(days(), 'day')} usually means ${plural(days() - 1, 'night')}.`;
    updateSummary();
  });

  // Step 3 — traveller counters
  $$<HTMLElement>('.quote-counter').forEach((counter) => {
    const min = parseInt(counter.dataset.min ?? '', 10) || 0;
    const max = parseInt(counter.dataset.max ?? '', 10) || 20;
    const valueEl = counter.querySelector<HTMLElement>('.quote-counter-value')!;
    const decBtn = counter.querySelector<HTMLButtonElement>('[data-action="dec"]')!;
    const incBtn = counter.querySelector<HTMLButtonElement>('[data-action="inc"]')!;
    const value = () => parseInt(valueEl.textContent ?? '', 10) || 0;
    const render = () => {
      decBtn.disabled = value() <= min;
      incBtn.disabled = value() >= max;
    };
    decBtn.addEventListener('click', () => {
      valueEl.textContent = String(Math.max(min, value() - 1));
      render();
      updateSummary();
    });
    incBtn.addEventListener('click', () => {
      valueEl.textContent = String(Math.min(max, value() + 1));
      render();
      updateSummary();
    });
    render();
  });

  // Optional accordion
  const accordionToggle = $<HTMLElement>('.quote-accordion-toggle');
  const accordionBody = $<HTMLElement>('#quote-more-details');
  accordionToggle?.addEventListener('click', () => {
    if (!accordionBody) return;
    const open = accordionToggle.getAttribute('aria-expanded') === 'true';
    accordionToggle.setAttribute('aria-expanded', String(!open));
    accordionBody.hidden = open;
  });

  // Interest chips (visual toggle only — not part of the summary)
  $$<HTMLElement>('.quote-chip').forEach((chip) => chip.addEventListener('click', () => chip.classList.toggle('is-active')));

  const hotelSelect = $<HTMLSelectElement>('#qf-hotel-level');
  hotelSelect?.addEventListener('change', updateSummary);

  // Live summary
  const summary = (key: string) => $<HTMLElement>(`[data-summary="${key}"]`);
  const counterValue = (key: string) =>
    parseInt($<HTMLElement>(`[data-counter="${key}"] .quote-counter-value`)?.textContent ?? '', 10) || 0;

  function formatDate(value: string) {
    if (!value) return 'Not set';
    const d = new Date(value + 'T00:00:00');
    return isNaN(d.getTime()) ? 'Not set' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function updateSummary() {
    const set = (key: string, text: string) => {
      const el = summary(key);
      if (el) el.textContent = text;
    };
    set('start', formatDate(startInput?.value ?? ''));
    set('when', WHEN_LABEL[$<HTMLElement>('.quote-segment.is-active')?.dataset.when ?? 'exact']);
    if (lengthInput) set('length', `${plural(days(), 'day')} · ${plural(days() - 1, 'night')}`);

    const adults = counterValue('adults');
    const children = counterValue('children-older') + counterValue('children-younger');
    const parts = [plural(adults, 'adult')];
    if (children > 0) parts.push(plural(children, 'child', 'children'));
    set('travellers', parts.join(', '));

    set('hotels', hotelSelect?.value ? `${hotelSelect.value} hotels` : 'Level not chosen');
    set(
      'services',
      $$<HTMLInputElement>('input[data-service]:checked')
        .map((i) => i.closest('.quote-tile')?.querySelector('.quote-tile-text strong')?.textContent ?? '')
        .join(', '),
    );
  }
  updateSummary();

  // Validation + submit
  const errorFor = (input: HTMLElement) => $<HTMLElement>(`[data-error-for="${input.id}"]`);
  const showError = (input: HTMLElement, message: string) => {
    input.classList.add('has-error');
    const err = errorFor(input);
    if (err) {
      err.textContent = message;
      err.hidden = false;
    }
  };
  const clearError = (input: HTMLElement) => {
    input.classList.remove('has-error');
    const err = errorFor(input);
    if (err) err.hidden = true;
  };

  const nameInput = $<HTMLInputElement>('#qf-name');
  const emailInput = $<HTMLInputElement>('#qf-email');
  [nameInput, emailInput].forEach((input) => input?.addEventListener('input', () => clearError(input)));

  const submitBtn = $<HTMLElement>('.quote-submit-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    if (nameInput) {
      if (!nameInput.value.trim()) {
        showError(nameInput, 'Please tell us your name.');
        valid = false;
      } else clearError(nameInput);
    }
    if (emailInput) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
        showError(emailInput, 'Please enter a valid email address.');
        valid = false;
      } else clearError(emailInput);
    }

    if (!valid) {
      $<HTMLElement>('.has-error')?.focus();
      return;
    }

    submitBtn?.setAttribute('data-loading', 'true');
    setTimeout(() => {
      submitBtn?.removeAttribute('data-loading');
      form.classList.add('is-submitted');
    }, 900);
  });
}
