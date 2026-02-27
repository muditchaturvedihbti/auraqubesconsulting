const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const themeToggle = document.querySelector('.theme-toggle');
const themeLabel = document.querySelector('.toggle-label');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const applyTheme = (mode) => {
  const isDark = mode === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  if (themeToggle) {
    themeToggle.classList.toggle('is-dark', isDark);
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  if (themeLabel) {
    themeLabel.textContent = isDark ? 'Dark' : 'Light';
  }
};

const storedTheme = localStorage.getItem('site-theme');
applyTheme(storedTheme === 'dark' ? 'dark' : 'light');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('site-theme', next);
  });
}

const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

const pageContexts = {
  'index.html': {
    intent: 'Salesforce Implementation',
    intro: 'You are on the home page, so I can quickly build a Salesforce implementation + AI discovery case.'
  },
  'services.html': {
    intent: 'Salesforce Implementation',
    intro: 'From services, I can capture scope and implementation timeline requirements.'
  },
  'ai-initiatives.html': {
    intent: 'AI Workflow',
    intro: 'From Salesforce AI, I can capture your AI use case and expected business impact.'
  },
  'clients.html': {
    intent: 'Integration',
    intro: 'From client outcomes, I can capture integration and transformation goals for your team.'
  },
  'about.html': {
    intent: 'Salesforce Implementation',
    intro: 'From about page, I can help route your implementation request to the co-founders.'
  },
  'contact.html': {
    intent: 'Salesforce Implementation',
    intro: 'I can help you submit a complete Salesforce case faster than filling every field manually.'
  },
  default: {
    intent: 'Salesforce Implementation',
    intro: 'I can help you create a complete Salesforce case in less than a minute.'
  }
};

const pageContext = pageContexts[currentPage] || pageContexts.default;

const ensureSkipLink = () => {
  if (document.querySelector('.skip-link')) return;
  const main = document.querySelector('main');
  if (!main) return;
  if (!main.id) main.id = 'main-content';
  const skipLink = document.createElement('a');
  skipLink.className = 'skip-link';
  skipLink.href = `#${main.id}`;
  skipLink.textContent = 'Skip to main content';
  document.body.insertBefore(skipLink, document.body.firstChild);
};
ensureSkipLink();

const applyActiveNavState = () => {
  const navLinks = document.querySelectorAll('.nav a[href]');
  if (!navLinks.length) return;
  navLinks.forEach((link) => {
    const href = (link.getAttribute('href') || '').trim().toLowerCase();
    const isCurrent = href && href === currentPage;
    link.classList.toggle('active', isCurrent);
    if (isCurrent) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};
applyActiveNavState();

const applyImageOptimization = () => {
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.hasAttribute('decoding')) img.decoding = 'async';
    if (index > 1 && !img.hasAttribute('loading')) img.loading = 'lazy';
    if (!img.hasAttribute('fetchpriority') && index === 0) img.setAttribute('fetchpriority', 'high');
  });
};
applyImageOptimization();

const ensureScrollProgress = () => {
  let progressEl = document.querySelector('.scroll-progress');
  if (!progressEl) {
    progressEl = document.createElement('div');
    progressEl.className = 'scroll-progress';
    progressEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progressEl);
  }
  return progressEl;
};

const bindScrollProgress = () => {
  const progressEl = ensureScrollProgress();
  const update = () => {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop || 0;
    const scrollable = Math.max(doc.scrollHeight - doc.clientHeight, 0);
    const percent = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
    progressEl.style.width = `${Math.min(Math.max(percent, 0), 100)}%`;
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
};
bindScrollProgress();

const bindCursorGlow = () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (prefersReduced || isCoarsePointer) return;

  let rafId = null;
  let nextX = window.innerWidth * 0.5;
  let nextY = window.innerHeight * 0.24;

  const paint = () => {
    document.body.style.setProperty('--cursor-x', `${nextX}px`);
    document.body.style.setProperty('--cursor-y', `${nextY}px`);
    rafId = null;
  };

  window.addEventListener('pointermove', (event) => {
    nextX = event.clientX;
    nextY = event.clientY;
    if (!rafId) rafId = window.requestAnimationFrame(paint);
  }, { passive: true });
};
bindCursorGlow();

const copyButtons = document.querySelectorAll('[data-copy-text]');

const fallbackCopyText = (text) => {
  const temp = document.createElement('textarea');
  temp.value = text;
  temp.setAttribute('readonly', '');
  temp.style.position = 'absolute';
  temp.style.left = '-9999px';
  document.body.appendChild(temp);
  temp.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(temp);
  return copied;
};

copyButtons.forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = btn.getAttribute('data-copy-text') || '';
    const defaultLabel = btn.getAttribute('data-default-label') || 'Copy';
    const isIconOnly = btn.classList.contains('icon-only');
    if (!text) return;

    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      } else {
        ok = fallbackCopyText(text);
      }
    } catch {
      ok = fallbackCopyText(text);
    }

    btn.classList.remove('copied');
    if (ok) {
      if (!isIconOnly) btn.textContent = 'Copied';
      btn.setAttribute('aria-label', 'Copied');
      btn.setAttribute('title', 'Copied');
      btn.classList.add('copied');
    } else {
      if (!isIconOnly) btn.textContent = 'Copy Failed';
      btn.setAttribute('aria-label', 'Copy failed');
      btn.setAttribute('title', 'Copy failed');
    }

    setTimeout(() => {
      if (!isIconOnly) btn.textContent = defaultLabel;
      btn.setAttribute('aria-label', defaultLabel);
      btn.setAttribute('title', defaultLabel);
      btn.classList.remove('copied');
    }, 1600);
  });
});

const SALESFORCE_WEB_TO_CASE_URL = 'https://webto.salesforce.com/servlet/servlet.WebToCase?encoding=UTF-8&orgId=00DgL00000MPwfJ';
const SALESFORCE_ORG_ID = '00DgL00000MPwfJ';
const SALESFORCE_RET_URL = 'https://auraqubesconsulting.com/';

const ensureAuraVoiceWidget = () => {
  let toggle = document.querySelector('#auraVoiceToggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.id = 'auraVoiceToggle';
    toggle.className = 'auravoice-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', 'caseBot');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = `
      <span class="auravoice-toggle-dot" aria-hidden="true"></span>
      <span class="auravoice-toggle-label">AuraVoice AI</span>
    `;
    document.body.appendChild(toggle);
  }

  let widget = document.querySelector('#caseBot');
  if (!widget) {
    widget = document.createElement('div');
    widget.id = 'caseBot';
    widget.className = 'case-bot-card auravoice-widget';
    widget.hidden = true;
    widget.innerHTML = `
      <div class="case-bot-head">
        <div>
          <h3>AuraVoice Assistant</h3>
          <p>Guided Salesforce case concierge with smart prompts.</p>
        </div>
        <span id="caseBotStatus" class="case-bot-status">Idle</span>
      </div>
      <div class="case-bot-progress-wrap" aria-hidden="true">
        <div id="caseBotProgressBar" class="case-bot-progress-bar"></div>
      </div>
      <p id="caseBotProgressText" class="case-bot-progress-text">Step 0 of 6</p>
      <div id="caseBotQuickActions" class="case-bot-quick-actions"></div>
      <div id="caseBotMessages" class="case-bot-messages" aria-live="polite"></div>
      <form id="caseBotInputForm" class="case-bot-input-wrap">
        <input
          id="caseBotInput"
          class="case-bot-input"
          type="text"
          placeholder="Type your reply, or use quick choices..."
          autocomplete="off"
        />
        <button class="btn btn-secondary" type="submit">Send</button>
      </form>
      <div class="case-bot-actions">
        <button id="caseBotBackBtn" class="btn btn-secondary" type="button">Back</button>
        <button id="caseBotCreateBtn" class="btn btn-primary" type="button" disabled>Create Case in Salesforce</button>
        <button id="caseBotResetBtn" class="btn btn-secondary" type="button">Restart</button>
      </div>
    `;
    document.body.appendChild(widget);
  }

  const head = widget.querySelector('.case-bot-head');
  if (head && !head.querySelector('.case-bot-close')) {
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'case-bot-close';
    closeBtn.id = 'caseBotCloseBtn';
    closeBtn.setAttribute('aria-label', 'Close AuraVoice');
    closeBtn.title = 'Close';
    closeBtn.textContent = 'x';
    head.appendChild(closeBtn);
  }

  return { toggle, widget };
};

const ensureGlobalWebToCaseForm = () => {
  const contactForm = document.querySelector('#webToCaseForm');
  if (contactForm) return contactForm;

  let globalForm = document.querySelector('#globalWebToCaseForm');
  if (!globalForm) {
    globalForm = document.createElement('form');
    globalForm.id = 'globalWebToCaseForm';
    globalForm.action = SALESFORCE_WEB_TO_CASE_URL;
    globalForm.method = 'POST';
    globalForm.hidden = true;
    globalForm.setAttribute('aria-hidden', 'true');
    globalForm.innerHTML = `
      <input type="hidden" name="orgid" value="${SALESFORCE_ORG_ID}" />
      <input type="hidden" name="retURL" value="${SALESFORCE_RET_URL}" />
      <input type="hidden" name="name" value="" />
      <input type="hidden" name="email" value="" />
      <input type="hidden" name="phone" value="" />
      <input type="hidden" name="subject" value="" />
      <textarea name="description" hidden></textarea>
    `;
    document.body.appendChild(globalForm);
  }
  return globalForm;
};

const contactWebToCaseForm = document.querySelector('#webToCaseForm');
const webToCaseForm = ensureGlobalWebToCaseForm();
const { toggle: auraVoiceToggle, widget: caseBot } = ensureAuraVoiceWidget();

// Salesforce Web-to-Case integration (Contact page).
if (contactWebToCaseForm) {
  const orgIdInput = contactWebToCaseForm.querySelector('input[name="orgid"]');
  const webToCaseStatus = document.querySelector('#webToCaseStatus');

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('case') === 'created' && webToCaseStatus) {
    webToCaseStatus.className = 'form-status ok';
    webToCaseStatus.textContent = 'Case submitted successfully. Our team will review and follow up shortly.';
  }

  contactWebToCaseForm.addEventListener('submit', (event) => {
    const orgId = orgIdInput ? orgIdInput.value.trim() : '';
    if (!orgId) {
      event.preventDefault();
      if (webToCaseStatus) {
        webToCaseStatus.className = 'form-status error';
        webToCaseStatus.textContent = 'Salesforce Web-to-Case Org ID is missing.';
      }
    }
  });
}

// Contact Case Bot: advanced guided assistant that submits Web-to-Case.
if (caseBot && webToCaseForm) {
  const botMessages = document.querySelector('#caseBotMessages');
  const botForm = document.querySelector('#caseBotInputForm');
  const botInput = document.querySelector('#caseBotInput');
  const botCreateBtn = document.querySelector('#caseBotCreateBtn');
  const botResetBtn = document.querySelector('#caseBotResetBtn');
  const botBackBtn = document.querySelector('#caseBotBackBtn');
  const botCloseBtn = document.querySelector('#caseBotCloseBtn');
  const botQuickActions = document.querySelector('#caseBotQuickActions');
  const botStatus = document.querySelector('#caseBotStatus');
  const botProgressBar = document.querySelector('#caseBotProgressBar');
  const botProgressText = document.querySelector('#caseBotProgressText');
  const botDraftKey = 'auravoice-case-draft-v2';
  const pageDefaultIntent = pageContext.intent;

  const intentChoices = [
    { label: 'Salesforce Implementation', value: 'Salesforce Implementation' },
    { label: 'Support Issue', value: 'Support Issue' },
    { label: 'AI Workflow', value: 'AI Workflow' },
    { label: 'Integration', value: 'Integration' },
    { label: 'Other', value: 'Other' }
  ];

  const subjectPresets = {
    'Salesforce Implementation': [
      'Salesforce implementation roadmap discussion',
      'New Salesforce org setup planning',
      'Salesforce cloud rollout support'
    ],
    'Support Issue': [
      'Production support issue in Salesforce',
      'Critical bug triage request',
      'User adoption and support assistance'
    ],
    'AI Workflow': [
      'AI workflow enablement in Salesforce',
      'Einstein automation use case discussion',
      'AI-led process optimization request'
    ],
    Integration: [
      'Salesforce integration architecture support',
      'Data migration and sync planning',
      'API and middleware integration request'
    ],
    Other: [
      'Salesforce consulting request',
      'Business process transformation support',
      'General discussion with AuraQubes'
    ]
  };

  const steps = [
    {
      key: 'intent',
      label: 'service focus',
      prompt: `What do you need help with today? ${pageContext.intro}`,
      placeholder: 'Choose a focus area or type custom...',
      choices: () => {
        const choices = [...intentChoices];
        if (pageDefaultIntent) {
          return [{ label: `Use ${pageDefaultIntent}`, value: '__use_page_context__' }, ...choices];
        }
        return choices;
      },
      normalize: (v) => {
        const raw = v.trim();
        const lower = raw.toLowerCase();
        if (lower.includes('implement')) return 'Salesforce Implementation';
        if (lower.includes('support') || lower.includes('issue') || lower.includes('bug')) return 'Support Issue';
        if (lower.includes('ai') || lower.includes('einstein') || lower.includes('agent')) return 'AI Workflow';
        if (lower.includes('integrat') || lower.includes('migrat') || lower.includes('api')) return 'Integration';
        return raw || 'Other';
      },
      validate: (v) => v.length >= 3 || 'Please select one focus area so I can tailor your case details.'
    },
    {
      key: 'name',
      label: 'contact name',
      prompt: 'Great. What is your full name?',
      placeholder: 'Enter your full name...',
      validate: (v) => v.length >= 2 || 'Please enter a valid name.'
    },
    {
      key: 'email',
      label: 'email',
      prompt: 'What is your work email address?',
      placeholder: 'name@company.com',
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email address.'
    },
    {
      key: 'phone',
      label: 'phone',
      prompt: 'What is your phone number? You can also choose "Skip Phone".',
      placeholder: 'Phone number or type skip',
      choices: () => [{ label: 'Skip Phone', value: '__skip_phone__' }],
      normalize: (v) => (v.toLowerCase() === 'skip' ? '' : v),
      validate: (v) => v === '' || /^[+()\-.\s0-9]{7,}$/.test(v) || 'Use a valid phone number, or type "skip".'
    },
    {
      key: 'subject',
      label: 'case subject',
      prompt: (a) => `What should be the case subject for "${a.intent || 'this request'}"?`,
      placeholder: 'Add a short case subject...',
      choices: (a) => (subjectPresets[a.intent] || subjectPresets.Other).map((item) => ({ label: item, value: item })),
      validate: (v) => (v.length >= 4 && v.length <= 80) || 'Subject should be between 4 and 80 characters.'
    },
    {
      key: 'description',
      label: 'case description',
      prompt: 'Describe the requirement in detail. Include business impact and expected timeline if possible.',
      placeholder: 'Describe your requirement...',
      validate: (v) => v.length >= 12 || 'Please add more detail so we can prioritize your case correctly.'
    }
  ];

  const formFields = {
    name: webToCaseForm.querySelector('input[name="name"]'),
    email: webToCaseForm.querySelector('input[name="email"]'),
    phone: webToCaseForm.querySelector('input[name="phone"]'),
    subject: webToCaseForm.querySelector('input[name="subject"]'),
    description: webToCaseForm.querySelector('textarea[name="description"]')
  };

  let stepIndex = 0;
  let answers = {};
  let readyToSubmit = false;
  let processing = false;
  let typingEl = null;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const hasSessionStorage = (() => {
    try {
      return typeof sessionStorage !== 'undefined';
    } catch {
      return false;
    }
  })();

  const currentStep = () => steps[stepIndex] || null;

  const suggestedSubject = () => {
    const intent = answers.intent || 'Other';
    const presets = subjectPresets[intent] || subjectPresets.Other;
    return presets[0];
  };

  const persistDraft = () => {
    if (!hasSessionStorage) return;
    try {
      const payload = {
        stepIndex,
        answers,
        readyToSubmit,
        page: currentPage,
        ts: Date.now()
      };
      sessionStorage.setItem(botDraftKey, JSON.stringify(payload));
    } catch {
      // Ignore draft persistence errors.
    }
  };

  const clearDraft = () => {
    if (!hasSessionStorage) return;
    try {
      sessionStorage.removeItem(botDraftKey);
    } catch {
      // Ignore draft clear errors.
    }
  };

  const buildSummary = () => (
    [
      `Service Focus: ${answers.intent || '-'}`,
      `Contact: ${answers.name || '-'} | ${answers.email || '-'}${answers.phone ? ` | ${answers.phone}` : ''}`,
      `Subject: ${answers.subject || '-'}`,
      `Description: ${answers.description || '-'}`
    ].join('\n')
  );

  const setStatus = (text) => {
    if (!botStatus) return;
    botStatus.textContent = text;
  };

  const updateProgress = () => {
    const total = steps.length;
    const completed = readyToSubmit ? total : Math.min(stepIndex, total);
    const percent = Math.round((completed / total) * 100);
    if (botProgressBar) botProgressBar.style.width = `${percent}%`;

    if (botProgressText) {
      botProgressText.textContent = readyToSubmit
        ? `All ${total} steps complete`
        : `Step ${Math.min(stepIndex + 1, total)} of ${total}`;
    }
  };

  const setInputPlaceholder = (text) => {
    if (botInput) botInput.placeholder = text || 'Type your reply...';
  };

  const setQuickActions = (choices = []) => {
    if (!botQuickActions) return;
    botQuickActions.innerHTML = '';

    if (!choices.length) {
      botQuickActions.hidden = true;
      return;
    }

    botQuickActions.hidden = false;
    choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'case-bot-chip';
      btn.textContent = choice.label;
      btn.addEventListener('click', () => {
        submitReply(choice.value, choice.label);
      });
      botQuickActions.appendChild(btn);
    });
  };

  const addBotMessage = (text, role = 'bot', options = {}) => {
    if (!botMessages) return;
    const msg = document.createElement('div');
    msg.className = `case-bot-msg ${role}${options.summary ? ' summary' : ''}`;
    msg.textContent = text;
    botMessages.appendChild(msg);
    botMessages.scrollTop = botMessages.scrollHeight;
  };

  const showTyping = () => {
    if (!botMessages || typingEl) return;
    typingEl = document.createElement('div');
    typingEl.className = 'case-bot-msg bot typing';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    botMessages.appendChild(typingEl);
    botMessages.scrollTop = botMessages.scrollHeight;
  };

  const hideTyping = () => {
    if (!typingEl) return;
    typingEl.remove();
    typingEl = null;
  };

  const botSpeak = async (text, choices = [], options = {}) => {
    showTyping();
    await wait(360);
    hideTyping();
    addBotMessage(text, 'bot', options);
    setQuickActions(choices);
  };

  const fillFormFromAnswers = () => {
    if (!formFields.name || !formFields.email || !formFields.phone || !formFields.subject || !formFields.description) return;

    const hasSignal = Boolean(
      answers.name || answers.email || answers.phone || answers.intent || answers.subject || answers.description
    );

    formFields.name.value = answers.name || '';
    formFields.email.value = answers.email || '';
    formFields.phone.value = answers.phone || '';
    formFields.subject.value = answers.subject || (answers.intent ? suggestedSubject() : '');

    if (!hasSignal) {
      formFields.description.value = '';
      return;
    }

    const descParts = [];
    if (answers.description) descParts.push(answers.description);
    if (answers.intent) descParts.push(`Service Focus: ${answers.intent}`);
    if (descParts.length) descParts.push('Source: AuraVoice Assistant');
    formFields.description.value = descParts.join('\n\n');
    persistDraft();
  };

  const updateControls = () => {
    if (botCreateBtn) botCreateBtn.disabled = !readyToSubmit;
    if (botBackBtn) botBackBtn.disabled = !readyToSubmit && stepIndex === 0;
    setStatus(readyToSubmit ? 'Ready' : 'Collecting');
    updateProgress();
  };

  const askCurrentStep = async () => {
    const step = currentStep();
    if (!step) return;
    setInputPlaceholder(step.placeholder || '');
    const prompt = typeof step.prompt === 'function' ? step.prompt(answers) : step.prompt;
    const choices = typeof step.choices === 'function' ? step.choices(answers) : [];
    await botSpeak(prompt, choices);

    if (step.key === 'subject' && botInput && !botInput.value.trim()) {
      botInput.value = suggestedSubject();
      botInput.select();
    }
  };

  const submitCase = () => {
    if (!readyToSubmit) return;
    clearDraft();
    addBotMessage('Submitting your case to Salesforce...', 'bot');
    if (typeof webToCaseForm.requestSubmit === 'function') {
      webToCaseForm.requestSubmit();
    } else {
      webToCaseForm.submit();
    }
  };

  const goBack = async () => {
    if (readyToSubmit) {
      readyToSubmit = false;
      stepIndex = steps.length - 1;
      delete answers.description;
      fillFormFromAnswers();
      updateControls();
      persistDraft();
      await botSpeak('Let’s refine the case description before submission.');
      await askCurrentStep();
      return;
    }

    if (stepIndex === 0) {
      await botSpeak('You are already at the first step.', intentChoices);
      return;
    }

    stepIndex -= 1;
    const step = currentStep();
    if (step) delete answers[step.key];
    fillFormFromAnswers();
    updateControls();
    persistDraft();
    await botSpeak(`Going back. Let’s update ${step ? step.label : 'details'}.`);
    await askCurrentStep();
  };

  const handleSpecialInput = async (raw, displayLabel) => {
    const lower = raw.toLowerCase();

    if (lower === '__submit_case__') {
      addBotMessage(displayLabel || 'Create Case Now', 'user');
      submitCase();
      return true;
    }

    if (lower === '__use_page_context__') {
      const step = currentStep();
      if (step && step.key === 'intent' && pageDefaultIntent) {
        addBotMessage(displayLabel || `Use ${pageDefaultIntent}`, 'user');
        answers.intent = pageDefaultIntent;
        stepIndex += 1;
        fillFormFromAnswers();
        updateControls();
        persistDraft();
        await askCurrentStep();
      }
      return true;
    }

    if (lower === '__skip_phone__') {
      const step = currentStep();
      if (step && step.key === 'phone') {
        addBotMessage(displayLabel || 'Skip Phone', 'user');
        answers.phone = '';
        stepIndex += 1;
        fillFormFromAnswers();
        updateControls();
        persistDraft();
        await askCurrentStep();
      }
      return true;
    }

    if (lower === 'back') {
      addBotMessage('Back', 'user');
      await goBack();
      return true;
    }

    if (lower === 'restart' || lower === 'reset') {
      addBotMessage('Restart', 'user');
      await resetBot();
      return true;
    }

    return false;
  };

  const submitReply = async (raw, displayLabel = '') => {
    if (processing) return;
    const text = (raw || '').trim();
    if (!text) return;

    processing = true;
    try {
      const handled = await handleSpecialInput(text, displayLabel);
      if (handled) return;

      if (readyToSubmit) {
        addBotMessage(displayLabel || text, 'user');
        await botSpeak('Case is ready. Click "Create Case in Salesforce", or use "Back" to edit.');
        return;
      }

      const step = currentStep();
      if (!step) return;

      addBotMessage(displayLabel || text, 'user');
      const normalized = step.normalize ? step.normalize(text, answers) : text;
      const valid = step.validate(normalized, answers);
      if (valid !== true) {
        const choices = typeof step.choices === 'function' ? step.choices(answers) : [];
        await botSpeak(valid, choices);
        return;
      }

      answers[step.key] = normalized;
      stepIndex += 1;
      if (botInput) botInput.value = '';
      fillFormFromAnswers();
      persistDraft();

      if (stepIndex < steps.length) {
        updateControls();
        await askCurrentStep();
        return;
      }

      readyToSubmit = true;
      updateControls();
      persistDraft();

      await botSpeak(
        'Perfect. I have prepared your Salesforce case summary. You can submit now or go back to refine details.',
        [
          { label: 'Create Case Now', value: '__submit_case__' },
          { label: 'Refine Description', value: 'back' }
        ]
      );
      addBotMessage(buildSummary(), 'bot', { summary: true });
    } finally {
      processing = false;
    }
  };

  const setAuraVoiceOpen = (isOpen) => {
    caseBot.hidden = !isOpen;
    if (auraVoiceToggle) {
      auraVoiceToggle.setAttribute('aria-expanded', String(isOpen));
      auraVoiceToggle.classList.toggle('open', isOpen);
    }

    if (isOpen) {
      setStatus(readyToSubmit ? 'Ready' : 'Collecting');
      if (botInput) botInput.focus();
    } else {
      setStatus('Idle');
    }
  };

  const resetBot = async () => {
    stepIndex = 0;
    answers = {};
    readyToSubmit = false;
    if (botMessages) botMessages.innerHTML = '';
    if (botInput) botInput.value = '';
    setQuickActions([]);
    clearDraft();
    fillFormFromAnswers();
    updateControls();
    await botSpeak(`Hi, I am AuraVoice. ${pageContext.intro}`);
    await askCurrentStep();
  };

  const tryRestoreDraft = async () => {
    if (!hasSessionStorage) return false;
    try {
      const raw = sessionStorage.getItem(botDraftKey);
      if (!raw) return false;
      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== 'object') return false;
      const ageMs = Date.now() - Number(draft.ts || 0);
      if (!Number.isFinite(ageMs) || ageMs > 24 * 60 * 60 * 1000) {
        clearDraft();
        return false;
      }

      const nextStep = Number.isInteger(draft.stepIndex) ? draft.stepIndex : 0;
      answers = draft.answers && typeof draft.answers === 'object' ? draft.answers : {};
      readyToSubmit = Boolean(draft.readyToSubmit);
      stepIndex = readyToSubmit
        ? steps.length
        : Math.max(0, Math.min(nextStep, steps.length - 1));

      if (botMessages) botMessages.innerHTML = '';
      fillFormFromAnswers();
      updateControls();
      await botSpeak('I restored your previous AuraVoice draft so you can continue.');

      if (readyToSubmit) {
        await botSpeak(
          'Your case draft is ready for submission.',
          [
            { label: 'Create Case Now', value: '__submit_case__' },
            { label: 'Refine Description', value: 'back' }
          ]
        );
        addBotMessage(buildSummary(), 'bot', { summary: true });
      } else {
        await askCurrentStep();
      }
      return true;
    } catch {
      clearDraft();
      return false;
    }
  };

  if (botForm && botInput) {
    botForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const raw = botInput.value.trim();
      if (!raw) return;
      await submitReply(raw);
    });
  }

  if (botCreateBtn) {
    botCreateBtn.addEventListener('click', submitCase);
  }

  if (botBackBtn) {
    botBackBtn.addEventListener('click', async () => {
      await goBack();
    });
  }

  if (botResetBtn) {
    botResetBtn.addEventListener('click', async () => {
      await resetBot();
    });
  }

  const initializeBot = async () => {
    const restored = await tryRestoreDraft();
    if (!restored) {
      await resetBot();
    }
    setAuraVoiceOpen(false);
  };
  initializeBot();

  if (auraVoiceToggle) {
    auraVoiceToggle.addEventListener('click', () => {
      setAuraVoiceOpen(caseBot.hidden);
    });
  }

  if (botCloseBtn) {
    botCloseBtn.addEventListener('click', () => {
      setAuraVoiceOpen(false);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !caseBot.hidden) setAuraVoiceOpen(false);
  });
}

// Reveal sections/cards on scroll for a more dynamic feel.
const revealTargets = document.querySelectorAll(
  '.section, .card, .kpi, .timeline-item, .founder-card, .contact-box, .client-chip, .hero-card, .hero-banner, .ai-image, .home-service-card, .proof-card, .home-kpi, .hero-mini-card, .hero-visual-frame, .home-cta-band, .home-video-card, .home-video-aside, .home-video-point'
);
revealTargets.forEach((el) => el.classList.add('reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealTargets.forEach((el) => observer.observe(el));

// Animate KPI/stat numbers when visible.
const counterEls = document.querySelectorAll('.hero-stat strong, .kpi strong, .home-kpi strong, .proof-card strong');

const animateCounter = (el) => {
  const raw = el.textContent.trim();
  if (/[^0-9+%.$,\s]/.test(raw)) return;
  const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
  if (!num) return;

  const prefix = raw.startsWith('$') ? '$' : '';
  const hasPlus = raw.includes('+');
  const hasPercent = raw.includes('%');

  const duration = 1200;
  const start = performance.now();

  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const value = Math.max(0, num * eased);

    let display;
    if (num >= 100 || Number.isInteger(num)) {
      display = Math.round(value).toString();
    } else {
      display = value.toFixed(1);
    }

    el.textContent = `${prefix}${display}${hasPercent ? '%' : ''}${hasPlus ? '+' : ''}`;
    if (p < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

counterEls.forEach((el) => counterObserver.observe(el));

// Hover tilt interaction for cards.
const tiltTargets = document.querySelectorAll(
  '.card, .hero-card, .contact-box, .home-service-card, .proof-card, .home-kpi, .hero-mini-card, .home-video-card, .home-video-aside'
);

tiltTargets.forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    const rotateX = ((0.5 - (y / rect.height)) * 8);
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});
