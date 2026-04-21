// ===== CONFIG =====
const TELEGRAM_BOT_TOKEN = "8620469682:AAHYAjwYF8la--xvbFh_T0eyVynDO3CCKuc";
const TELEGRAM_CHAT_ID = "7740020918";

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

hamburger?.addEventListener('click', () => {
  navLinks?.classList.toggle('open');
});

// Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks?.classList.remove('open'));
});

// ===== REVEAL ON SCROLL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-count'));
  const duration = 1500;
  const start = performance.now();
  const isDecimal = target === 4; // 4.8

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = ease * target;
    el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

// ===== CHAT MODAL =====
let chatStep = 1;

function openChat() {
  document.getElementById('chatOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  chatStep = 1;
  // Reset
  ['chatStep1','chatStep2Form','chatStep3Form','chatDone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', id !== 'chatStep1');
  });
  // Clear body except welcome bubble
  const body = document.getElementById('chatBody');
  body.innerHTML = '<div class="chat-bubble agent">👋 Hi! Welcome to Revnexa. To get started, please share your details and we\'ll connect you with a strategist.</div>';
  document.getElementById('chatName').value = '';
  if (document.getElementById('chatEmail')) document.getElementById('chatEmail').value = '';
  setTimeout(() => document.getElementById('chatName')?.focus(), 300);
}

function closeChat(e) {
  if (e && e.target !== document.getElementById('chatOverlay')) return;
  document.getElementById('chatOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function addBubble(text, type = 'agent') {
  const body = document.getElementById('chatBody');
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${type}`;
  bubble.textContent = text;
  body.appendChild(bubble);
  body.scrollTop = body.scrollHeight;
}

function chatStep2() {
  const name = document.getElementById('chatName').value.trim();
  if (!name) { document.getElementById('chatName').focus(); return; }
  addBubble(name, 'user');
  setTimeout(() => {
    addBubble(`Nice to meet you, ${name}! What's your email address?`);
    document.getElementById('chatStep1').classList.add('hidden');
    document.getElementById('chatStep2Form').classList.remove('hidden');
    setTimeout(() => document.getElementById('chatEmail')?.focus(), 100);
  }, 400);
}

function chatStep3() {
  const email = document.getElementById('chatEmail').value.trim();
  if (!email || !/\S+@\S+\.\S+/.test(email)) { document.getElementById('chatEmail').focus(); return; }
  addBubble(email, 'user');
  setTimeout(() => {
    addBubble('Great! Feel free to edit your message below, then hit Send 💬');
    document.getElementById('chatStep2Form').classList.add('hidden');
    document.getElementById('chatStep3Form').classList.remove('hidden');
    setTimeout(() => document.getElementById('chatMsg')?.focus(), 100);
  }, 400);
}

async function sendChat() {
  const name = document.getElementById('chatName').value.trim();
  const email = document.getElementById('chatEmail').value.trim();
  const msg = document.getElementById('chatMsg').value.trim();
  if (!msg) return;

  const btn = document.getElementById('chatSendBtn');
  document.getElementById('chatSendText').classList.add('hidden');
  document.getElementById('chatSendSpinner').classList.remove('hidden');
  btn.disabled = true;

  addBubble(msg, 'user');

  const messageData = { name, email, message: msg, source: 'live_chat', timestamp: new Date().toISOString() };

  await Promise.allSettled([
    saveToFirestore('messages', messageData),
    sendToTelegram(`🔔 *New Chat Message — Revnexa*\n\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n💬 *Message:* ${msg}`)
  ]);

  document.getElementById('chatStep3Form').classList.add('hidden');
  document.getElementById('chatDone').classList.remove('hidden');
}

// ===== CONTACT FORM =====
async function submitContact(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const spinner = document.getElementById('submitSpinner');
  const success = document.getElementById('formSuccess');
  const error = document.getElementById('formError');

  submitText.classList.add('hidden');
  spinner.classList.remove('hidden');
  btn.disabled = true;
  success.classList.add('hidden');
  error.classList.add('hidden');

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const message = document.getElementById('message').value.trim();

  const messageData = { name, email, subject, message, source: 'contact_form', timestamp: new Date().toISOString() };

  const tgText = `📩 *New Contact Form — Revnexa*\n\n👤 *Name:* ${name}\n📧 *Email:* ${email}\n📌 *Subject:* ${subject}\n💬 *Message:* ${message}`;

  const results = await Promise.allSettled([
    saveToFirestore('messages', messageData),
    sendToTelegram(tgText)
  ]);

  const anySuccess = results.some(r => r.status === 'fulfilled');

  submitText.classList.remove('hidden');
  spinner.classList.add('hidden');
  btn.disabled = false;

  if (anySuccess) {
    success.classList.remove('hidden');
    document.getElementById('contactForm').reset();
  } else {
    error.classList.remove('hidden');
  }
}

// ===== FIREBASE =====
async function saveToFirestore(col, data) {
  if (!window._db) return;
  try {
    await window._addDoc(window._collection(window._db, col), {
      ...data,
      createdAt: window._serverTimestamp()
    });
    return true;
  } catch (err) {
    console.warn('Firestore error:', err);
    return false;
  }
}

// ===== TELEGRAM =====
async function sendToTelegram(text) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'Markdown'
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('Telegram error:', err);
    return false;
  }
}

// ===== LOAD MORE BLOGS =====
const extraBlogs = [
  {
    cat: 'ASO Strategy',
    title: 'App Store vs Google Play: Key Differences in Review Policies You Must Know',
    excerpt: 'Developers often treat both stores the same — but Apple and Google have very different rules around reviews. Here\'s a complete breakdown.',
    date: 'January 2025',
    time: '5 min read'
  },
  {
    cat: 'Growth Strategy',
    title: 'How to Turn Negative Reviews into Your Biggest Competitive Advantage',
    excerpt: 'Negative reviews hurt — but only if you ignore them. Discover the framework our clients use to flip bad reviews into trust signals.',
    date: 'December 2024',
    time: '9 min read'
  },
  {
    cat: 'User Research',
    title: 'Why 1,000 Real Beta Testers Are Worth More Than 10,000 Paid Downloads',
    excerpt: 'Quality feedback before launch changes everything. We break down exactly how structured beta programs improve long-term retention.',
    date: 'November 2024',
    time: '7 min read'
  }
];

let moreLoaded = false;

function loadMoreBlogs() {
  if (moreLoaded) return;
  moreLoaded = true;
  const grid = document.getElementById('blogGrid');
  extraBlogs.forEach((post, i) => {
    const article = document.createElement('article');
    article.className = 'blog-card reveal';
    article.style.setProperty('--d', `${i * 100}ms`);
    article.innerHTML = `
      <div class="blog-cat">${post.cat}</div>
      <h3><a href="#blog">${post.title}</a></h3>
      <p>${post.excerpt}</p>
      <div class="blog-meta">
        <span>📅 ${post.date}</span>
        <span>⏱ ${post.time}</span>
      </div>
    `;
    grid.appendChild(article);
    revealObserver.observe(article);
  });

  const btn = event.target;
  btn.textContent = 'Visit Our Blog →';
  btn.disabled = true;
  btn.style.opacity = '.6';
}

// ===== SMOOTH ANCHOR SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== ENTER KEY SUPPORT IN CHAT =====
document.getElementById('chatName')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') chatStep2();
});
document.getElementById('chatEmail')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') chatStep3();
});
