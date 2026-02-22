(() => {
  const wizard = document.querySelector('[data-wizard]');
  if (!wizard) return;

  const steps = Array.from(wizard.querySelectorAll('.wizard-step'));
  const stepLabel = wizard.querySelector('[data-step-label]');
  const stepTotal = wizard.querySelector('[data-step-total]');
  const progressBar = wizard.querySelector('[data-progress-bar]');
  const summaryEl = wizard.querySelector('[data-summary]');
  const summaryInput = wizard.querySelector('#rfq-summary');
  const nextBtn = wizard.querySelector('[data-next]');
  const backBtn = wizard.querySelector('[data-back]');
  const submitBtn = wizard.querySelector('[data-submit]');

  let currentStepIndex = 0;

  const isRfq = () => {
    const selected = wizard.querySelector('input[name="request_type"]:checked');
    return !selected || selected.value === 'RFQ';
  };

  const getActiveStepIndexes = () => (isRfq() ? [0, 1, 2, 3] : [0, 3]);

  const updateButtons = (activeSteps, activePosition) => {
    if (backBtn) backBtn.style.visibility = activePosition === 0 ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.style.display = activePosition === activeSteps.length - 1 ? 'none' : 'inline-flex';
    if (submitBtn) submitBtn.style.display = activePosition === activeSteps.length - 1 ? 'inline-flex' : 'none';
  };

  const updateProgress = (activeSteps, activePosition) => {
    const stepNumber = activePosition + 1;
    if (stepLabel) stepLabel.textContent = String(stepNumber);
    if (stepTotal) stepTotal.textContent = String(activeSteps.length);
    if (progressBar) {
      const percent = Math.round((stepNumber / activeSteps.length) * 100);
      progressBar.style.width = `${percent}%`;
    }
  };

  const updateSteps = () => {
    const activeSteps = getActiveStepIndexes();
    if (!activeSteps.includes(currentStepIndex)) {
      currentStepIndex = activeSteps[0];
    }
    const activePosition = activeSteps.indexOf(currentStepIndex);

    steps.forEach((step, index) => {
      const isActive = activeSteps.includes(index);
      step.hidden = index !== currentStepIndex;
      const fields = step.querySelectorAll('input, select, textarea');
      fields.forEach((field) => {
        if (!isActive) {
          field.setAttribute('disabled', 'disabled');
        } else {
          field.removeAttribute('disabled');
        }
      });
    });

    updateButtons(activeSteps, activePosition);
    updateProgress(activeSteps, activePosition);
  };

  const validateStep = () => {
    const fields = Array.from(steps[currentStepIndex].querySelectorAll('input, select, textarea'));
    for (const field of fields) {
      if (field.required && !field.reportValidity()) {
        return false;
      }
    }
    return true;
  };

  const buildSummary = () => {
    if (!summaryEl) return;
    const fields = Array.from(wizard.querySelectorAll('[data-field]')).filter((field) => !field.disabled);
    const lines = [];

    fields.forEach((field) => {
      if (field.type === 'radio' && !field.checked) return;
      const label = field.getAttribute('data-label') || field.name || 'Field';
      const value = String(field.value || '').trim();
      if (value) lines.push(`${label}: ${value}`);
    });

    const summary = lines.length ? lines.join('\n') : 'Complete the fields to preview your pilot request.';
    summaryEl.textContent = summary;
    if (summaryInput) summaryInput.value = summary;
  };

  wizard.addEventListener('click', (event) => {
    const next = event.target.closest('[data-next]');
    const back = event.target.closest('[data-back]');

    if (next) {
      event.preventDefault();
      if (!validateStep()) return;
      const activeSteps = getActiveStepIndexes();
      const activePosition = activeSteps.indexOf(currentStepIndex);
      const nextIndex = activeSteps[Math.min(activePosition + 1, activeSteps.length - 1)];
      currentStepIndex = nextIndex;
      updateSteps();
      if (currentStepIndex === activeSteps[activeSteps.length - 1]) buildSummary();
      return;
    }

    if (back) {
      event.preventDefault();
      const activeSteps = getActiveStepIndexes();
      const activePosition = activeSteps.indexOf(currentStepIndex);
      const prevIndex = activeSteps[Math.max(activePosition - 1, 0)];
      currentStepIndex = prevIndex;
      updateSteps();
    }
  });

  wizard.addEventListener('input', buildSummary);
  wizard.addEventListener('change', buildSummary);
  wizard.addEventListener('change', updateSteps);

  updateSteps();
  buildSummary();
})();
