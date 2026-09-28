/**
 * Campus by AI — Core Engine
 * Dynamic Headline Typewriter, Shutter Window & n8n RAG Webhook Connection
 */

const WEBHOOK_URL = (typeof window.CAMPUS_CONFIG !== 'undefined' && window.CAMPUS_CONFIG.WEBHOOK_URL)
  ? window.CAMPUS_CONFIG.WEBHOOK_URL
  : "YOUR_N8N_WEBHOOK_URL_HERE";
let SESSION_ID = "rag-" + Math.random().toString(36).slice(2, 10);
let lastUserMessage = "";

// Dynamic Second Headline Phrases (Modeled after "The Intel|" in reference)
const dynamicPhrases = [
  "The Admission Desk",
  "The Merit Calculator",
  "The Fee Navigator",
  "The Scholarship Guide"
];

// Quick Inquiry Chips (Redesigned & Professional)
const sampleQueries = [
  "UET Lahore Merit Formula & ECAT weightage",
  "NUST NET Registration & Fee structure",
  "FAST-NUCES BS CS eligibility & campuses",
  "HEC National Fee Refund Policy timeline",
  "Undergraduate Need-Based Scholarships"
];

document.addEventListener('DOMContentLoaded', () => {
  initDynamicHeadline();
  initShutterEvents();
  initComposerEvents();
});

// ==========================================================================
// 1. Dynamic Headline Typewriter ("The Intel|" style)
// ==========================================================================
function initDynamicHeadline() {
  const el = document.getElementById('dynamicHeadline');
  if (!el) return;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typeSpeed = 50;
  const deleteSpeed = 26;
  const holdDuration = 2000;
  const betweenPause = 350;

  function tick() {
    const currentPhrase = dynamicPhrases[phraseIndex];

    if (!isDeleting) {
      charIndex++;
      el.textContent = currentPhrase.substring(0, charIndex);

      if (charIndex === currentPhrase.length) {
        isDeleting = true;
        setTimeout(tick, holdDuration);
        return;
      }
      setTimeout(tick, typeSpeed);
    } else {
      charIndex--;
      el.textContent = currentPhrase.substring(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % dynamicPhrases.length;
        setTimeout(tick, betweenPause);
        return;
      }
      setTimeout(tick, deleteSpeed);
    }
  }

  tick();
}

// ==========================================================================
// 2. Shutter Window Overlay Management
// ==========================================================================
function initShutterEvents() {
  const overlay = document.getElementById('chatShutterOverlay');
  const closeBtn = document.getElementById('closeShutterBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeChatShutter);
  }

  // Backdrop click closes shutter
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeChatShutter();
      }
    });
  }

  // ESC key closes shutter
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
      closeChatShutter();
    }
  });

  // Render quick chips
  const chipsWrap = document.getElementById('shutterChips');
  if (chipsWrap) {
    chipsWrap.innerHTML = '';
    sampleQueries.forEach(query => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip-btn';
      chip.innerHTML = `<i class="ph ph-arrow-bend-down-right"></i> ${query}`;
      chip.onclick = () => {
        const input = document.getElementById('chatInput');
        if (input) {
          input.value = query;
          handleChatSubmit();
        }
      };
      chipsWrap.appendChild(chip);
    });
  }
}

function openChatShutter(query = '') {
  const overlay = document.getElementById('chatShutterOverlay');
  const input = document.getElementById('chatInput');
  if (!overlay) return;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    if (input) {
      input.focus();
      if (query) {
        input.value = query;
        handleChatSubmit();
      }
    }
  }, 150);
}

function closeChatShutter() {
  const overlay = document.getElementById('chatShutterOverlay');
  if (!overlay) return;

  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ==========================================================================
// 3. n8n RAG Webhook Chat Operations
// ==========================================================================
function initComposerEvents() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendChatBtn');

  if (!input || !sendBtn) return;

  // Auto-resize textarea
  input.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    if (this.value === '') this.style.height = 'auto';
  });

  // Enter to send (Shift+Enter for newline)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  });

  sendBtn.addEventListener('click', handleChatSubmit);
}

function handleChatSubmit() {
  const input = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendChatBtn');
  if (!input || !sendBtn) return;

  const text = input.value.trim();
  if (!text) return;

  lastUserMessage = text;
  appendMessage(text, 'user');

  input.value = '';
  input.style.height = 'auto';
  sendBtn.disabled = true;

  showTyping();
  callWebhook(text);
}

async function callWebhook(userText) {
  const sendBtn = document.getElementById('sendChatBtn');
  const input = document.getElementById('chatInput');

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatInput: userText, sessionId: SESSION_ID })
    });

    removeTyping();

    if (!res.ok) throw new Error('Network error from n8n webhook');

    const reply = await res.text();
    if (!reply.trim()) throw new Error('Empty response received');

    appendMessage(reply, 'bot');

  } catch (err) {
    removeTyping();
    appendMessage("Maazrat, webhook response mein masla aa gaya hai. Barah-e-karam dobara koshish karein.", 'bot');
    console.error('Webhook error:', err);
  } finally {
    if (sendBtn) sendBtn.disabled = false;
    if (input) input.focus();
  }
}

function appendMessage(text, role) {
  const stream = document.getElementById('shutterStream');
  const welcome = document.getElementById('shutterWelcome');

  if (welcome && welcome.style.display !== 'none') {
    welcome.style.display = 'none';
  }

  const bubble = document.createElement('div');
  bubble.className = `bubble ${role}`;

  if (role === 'bot') {
    let clean = text;
    if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
      clean = DOMPurify.sanitize(marked.parse(text));
    }
    bubble.innerHTML = clean;

    // Action buttons (Copy & Regenerate)
    const actions = document.createElement('div');
    actions.className = 'bubble-actions';
    actions.innerHTML = `
      <button type="button" class="b-action-btn" onclick="copyBubbleText(this)" data-content="${encodeURIComponent(text)}">
        <i class="ph ph-copy"></i> Copy
      </button>
      <button type="button" class="b-action-btn" onclick="regenerateLast()">
        <i class="ph ph-arrow-counter-clockwise"></i> Regenerate
      </button>
    `;
    bubble.appendChild(actions);
  } else {
    bubble.textContent = text;
  }

  stream.appendChild(bubble);
  scrollStreamToBottom();
}

function showTyping() {
  const stream = document.getElementById('shutterStream');
  if (!stream) return;

  const typing = document.createElement('div');
  typing.className = 'shutter-typing';
  typing.id = 'shutterTyping';
  typing.innerHTML = `
    <span>Querying admission knowledge base</span>
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  stream.appendChild(typing);
  scrollStreamToBottom();
}

function removeTyping() {
  const t = document.getElementById('shutterTyping');
  if (t) t.remove();
}

function scrollStreamToBottom() {
  const stream = document.getElementById('shutterStream');
  if (stream) {
    stream.scrollTo({ top: stream.scrollHeight, behavior: 'smooth' });
  }
}

function copyBubbleText(btn) {
  const raw = btn.getAttribute('data-content');
  const decoded = decodeURIComponent(raw);
  navigator.clipboard.writeText(decoded).then(() => {
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-check"></i> Copied';
    setTimeout(() => { btn.innerHTML = orig; }, 1800);
  });
}

function regenerateLast() {
  if (!lastUserMessage) return;
  const stream = document.getElementById('shutterStream');
  const botBubbles = stream.querySelectorAll('.bubble.bot');
  if (botBubbles.length > 0) {
    botBubbles[botBubbles.length - 1].remove();
  }
  showTyping();
  callWebhook(lastUserMessage);
}

function clearShutterChat() {
  if (confirm("Kya aap conversation clear karna chahte hain?")) {
    const stream = document.getElementById('shutterStream');
    const welcome = document.getElementById('shutterWelcome');
    if (!stream) return;

    stream.innerHTML = '';
    if (welcome) {
      stream.appendChild(welcome);
      welcome.style.display = 'block';
    }
    SESSION_ID = "rag-" + Math.random().toString(36).slice(2, 10);
    lastUserMessage = "";
  }
}
