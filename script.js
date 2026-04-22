/* ============================================
   REVNEXA — Main JavaScript
   Firebase, Animations, Forms, Blog, Navigation
   ============================================ */

// ==========================================
// Firebase Configuration
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyA26CXX8KgaEAQAco7-CBl1UC1x7vhKe9g",
  authDomain: "revnexa-e4f12.firebaseapp.com",
  projectId: "revnexa-e4f12",
  storageBucket: "revnexa-e4f12.firebasestorage.app",
  messagingSenderId: "701095930338",
  appId: "1:701095930338:web:a3708ff316481e956c71bb",
  measurementId: "G-QHSWQN3HLS"
};

let db = null;
try {
  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  if (typeof firebase.analytics === 'function') firebase.analytics();
} catch (e) {
  console.warn('Firebase init failed:', e);
}

// Telegram config
const TELEGRAM_BOT_TOKEN = '8620469682:AAHYAjwYF8la--xvbFh_T0eyVynDO3CCKuc';
const TELEGRAM_CHAT_ID = '7740020918';

// ==========================================
// Loading Screen
// ==========================================
function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader && !loader.classList.contains('hidden')) {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }
}
// Hide on load event
window.addEventListener('load', () => setTimeout(hideLoader, 600));
// Fallback: always hide after 2.5s regardless
setTimeout(hideLoader, 2500);
// If document already loaded (script loaded late)
if (document.readyState === 'complete') setTimeout(hideLoader, 600);

// ==========================================
// Header / Navigation
// ==========================================
(function initNav() {
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const st = window.scrollY;
    if (header) {
      header.classList.toggle('scrolled', st > 50);
    }
    // Back to top button
    const btt = document.getElementById('back-to-top');
    if (btt) btt.classList.toggle('visible', st > 500);
    lastScroll = st;
  }, { passive: true });

  // Hamburger menu
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      nav.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
    // Close on link click
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Back to top
  const btt = document.getElementById('back-to-top');
  if (btt) {
    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

// ==========================================
// Scroll Reveal Animations
// ==========================================
(function initReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => observer.observe(el));
})();

// ==========================================
// Counter Animation
// ==========================================
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const isFloat = target % 1 !== 0;
    const suffix = el.textContent.replace(/[0-9.]/g, '');
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
      const current = eased * target;
      el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString()) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }
})();

// ==========================================
// Testimonials Carousel
// ==========================================
(function initTestimonials() {
  const track = document.getElementById('testimonials-track');
  const dots = document.getElementById('testimonial-dots');
  if (!track || !dots) return;

  let current = 0;
  const cards = track.children;
  const total = cards.length;

  function goTo(index) {
    current = ((index % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.querySelectorAll('.testimonial-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  dots.querySelectorAll('.testimonial-dot').forEach(dot => {
    dot.addEventListener('click', () => goTo(parseInt(dot.dataset.index)));
  });

  // Auto play
  let interval = setInterval(() => goTo(current + 1), 5000);
  track.closest('.testimonials-slider').addEventListener('mouseenter', () => clearInterval(interval));
  track.closest('.testimonials-slider').addEventListener('mouseleave', () => {
    interval = setInterval(() => goTo(current + 1), 5000);
  });
})();

// ==========================================
// FAQ Accordion
// ==========================================
document.querySelectorAll('.faq-question').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const wasActive = item.classList.contains('active');
    // Close all
    item.closest('section')?.querySelectorAll('.faq-item.active').forEach(i => i.classList.remove('active'));
    if (!wasActive) item.classList.add('active');
  });
});

// ==========================================
// Contact Form Submission
// ==========================================
async function submitMessage(formData, statusEl) {
  try {
    // Save to Firebase
    if (db) {
      await db.collection('messages').add({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'Live Chat',
        message: formData.message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        read: false,
        source: formData.source || 'website'
      });
    }

    // Send to Telegram
    const text = `📩 *New Message from Revnexa*\n\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n*Subject:* ${formData.subject || 'Live Chat'}\n*Message:* ${formData.message}`;
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'Markdown'
        })
      });
    } catch (tgErr) {
      console.warn('Telegram notification failed:', tgErr);
    }

    if (statusEl) {
      statusEl.className = 'form-status success';
      statusEl.textContent = '✓ Message sent successfully! We\'ll get back to you soon.';
      statusEl.style.display = 'block';
    }
    return true;
  } catch (err) {
    console.error('Submit error:', err);
    if (statusEl) {
      statusEl.className = 'form-status error';
      statusEl.textContent = '✕ Something went wrong. Please try again or contact us via WhatsApp.';
      statusEl.style.display = 'block';
    }
    return false;
  }
}

// Contact form
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const origText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const fd = new FormData(contactForm);
    const success = await submitMessage({
      name: fd.get('name'),
      email: fd.get('email'),
      subject: fd.get('subject'),
      message: fd.get('message'),
      source: 'contact-page'
    }, document.getElementById('contact-form-status'));

    btn.textContent = origText;
    btn.disabled = false;
    if (success) contactForm.reset();
  });
}

// Footer contact form
const footerForm = document.getElementById('footer-contact-form');
if (footerForm) {
  footerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = footerForm.querySelector('button[type="submit"]');
    const origText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const fd = new FormData(footerForm);
    const success = await submitMessage({
      name: fd.get('name'),
      email: fd.get('email'),
      subject: fd.get('subject'),
      message: fd.get('message'),
      source: 'footer-form'
    }, document.getElementById('footer-form-status'));

    btn.textContent = origText;
    btn.disabled = false;
    if (success) footerForm.reset();
  });
}

// ==========================================
// Live Chat Modal
// ==========================================
(function initChat() {
  const modal = document.getElementById('chat-modal');
  const closeBtn = document.getElementById('chat-modal-close');
  const openBtns = document.querySelectorAll('#open-livechat, [data-open-chat]');
  const chatForm = document.getElementById('chat-form');

  if (!modal) return;

  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = chatForm.querySelector('button[type="submit"]');
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const success = await submitMessage({
        name: document.getElementById('chat-name').value,
        email: document.getElementById('chat-email').value,
        message: document.getElementById('chat-message').value,
        source: 'live-chat'
      }, document.getElementById('chat-form-status'));

      btn.textContent = 'Send Message';
      btn.disabled = false;
      if (success) {
        setTimeout(closeModal, 2000);
      }
    });
  }
})();

// ==========================================
// Newsletter Form
// ==========================================
document.querySelectorAll('#newsletter-form, [id="newsletter-form"]').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    const btn = form.querySelector('button');
    const origText = btn.textContent;
    btn.textContent = 'Subscribing...';
    btn.disabled = true;

    try {
      if (db) {
        await db.collection('newsletter').add({
          email: email,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      btn.textContent = '✓ Subscribed!';
      btn.style.background = '#10b981';
      form.querySelector('input').value = '';
      setTimeout(() => { btn.textContent = origText; btn.style.background = ''; btn.disabled = false; }, 3000);
    } catch (err) {
      btn.textContent = 'Error, try again';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = origText; }, 2000);
    }
  });
});

// ==========================================
// Cookie Consent
// ==========================================
(function initCookies() {
  const banner = document.getElementById('cookie-banner');
  const accept = document.getElementById('cookie-accept');
  if (!banner || !accept) return;

  if (!localStorage.getItem('revnexa_cookies')) {
    setTimeout(() => banner.classList.add('visible'), 2000);
  }
  accept.addEventListener('click', () => {
    localStorage.setItem('revnexa_cookies', 'accepted');
    banner.classList.remove('visible');
  });
})();

// ==========================================
// Blog System
// ==========================================
const SEED_POSTS = [
  {
    id: 'how-to-improve-app-ratings',
    title: 'How to Improve Your App Ratings: A Complete Guide',
    slug: 'how-to-improve-app-ratings',
    excerpt: 'Discover proven strategies to boost your app ratings on both Google Play and Apple App Store. From UX improvements to user engagement tactics.',
    category: 'App Growth',
    author: 'Revnexa Team',
    date: '2024-03-15',
    readTime: '8 min read',
    content: `<h2>Why App Ratings Matter More Than Ever</h2>
<p>In today's competitive mobile landscape, your app's rating is often the first thing potential users see. Studies show that apps with ratings below 4.0 stars lose up to 50% of potential downloads. A strong rating isn't just a vanity metric — it's a critical business driver.</p>

<h2>Understanding the Algorithm</h2>
<p>Both Google Play and Apple App Store use ratings as a key ranking factor. Higher-rated apps get more visibility, which leads to more organic downloads, which leads to more revenue. It's a virtuous cycle that starts with your rating.</p>

<h3>Key Ranking Factors</h3>
<ul>
<li>Average star rating (weighted toward recent reviews)</li>
<li>Total number of ratings and reviews</li>
<li>Review recency and velocity</li>
<li>Review quality and length</li>
<li>Developer response rate</li>
</ul>

<h2>Proven Strategies to Improve Ratings</h2>

<h3>1. Optimize Your In-App Review Prompt</h3>
<p>Timing is everything. Ask for reviews after positive experiences — completing a level, making a successful purchase, or after extended usage. Never interrupt critical user flows.</p>

<h3>2. Respond to Every Review</h3>
<p>Users who receive a response to their review are 33% more likely to update their rating. Make it personal, address their specific concern, and offer solutions.</p>

<h3>3. Focus on User Experience</h3>
<p>The #1 reason for negative reviews is poor UX. Invest in usability testing, fix bugs quickly, and iterate based on user feedback. Apps that update regularly tend to have higher ratings.</p>

<h3>4. Build a Feedback Loop</h3>
<p>Create channels for users to give feedback before they leave a negative review. In-app feedback forms, support chat, and community forums can intercept dissatisfied users.</p>

<blockquote>Pro Tip: The best time to ask for a review is right after a user has experienced a "wow moment" in your app.</blockquote>

<h2>How Revnexa Can Help</h2>
<p>At Revnexa, we specialize in helping apps improve their ratings through authentic user feedback and strategic reputation management. Our team of experts will create a custom strategy tailored to your app's unique needs.</p>

<p>Ready to improve your app's rating? <a href="contact.html">Get a free consultation today</a>.</p>`
  },
  {
    id: 'user-feedback-importance',
    title: 'Why User Feedback is the Secret Weapon for App Success',
    slug: 'user-feedback-importance',
    excerpt: 'Learn why collecting and acting on user feedback is the most powerful growth strategy for mobile apps in 2024.',
    category: 'User Feedback',
    author: 'Revnexa Team',
    date: '2024-03-08',
    readTime: '6 min read',
    content: `<h2>The Power of Listening to Your Users</h2>
<p>Every successful app has one thing in common: they listen to their users. User feedback isn't just nice to have — it's the foundation of product development, marketing strategy, and business growth.</p>

<h2>Types of User Feedback</h2>

<h3>1. Quantitative Feedback</h3>
<p>Star ratings, NPS scores, and usage metrics give you the "what" — what users think about your app in measurable terms.</p>

<h3>2. Qualitative Feedback</h3>
<p>Written reviews, survey responses, and user interviews give you the "why" — the deeper insights that drive meaningful improvements.</p>

<h3>3. Behavioral Feedback</h3>
<p>Analytics data, heatmaps, and session recordings show you the "how" — how users actually interact with your app versus how you designed it.</p>

<h2>Building a Feedback Strategy</h2>
<p>The most effective feedback strategies combine all three types to create a complete picture of the user experience. Here's how to build one:</p>

<ul>
<li><strong>Set clear goals:</strong> What do you want to learn from user feedback?</li>
<li><strong>Choose the right channels:</strong> In-app surveys, review platforms, social media, support tickets</li>
<li><strong>Create a feedback loop:</strong> Collect → Analyze → Act → Communicate</li>
<li><strong>Measure impact:</strong> Track how changes based on feedback affect key metrics</li>
</ul>

<blockquote>Companies that actively collect and act on user feedback grow 2x faster than those that don't.</blockquote>

<h2>Common Mistakes to Avoid</h2>
<p>Don't just collect feedback — act on it. The biggest mistake apps make is gathering tons of data but never using it to improve. Each piece of feedback is an opportunity to get closer to product-market fit.</p>

<p>Want help building a comprehensive feedback strategy? <a href="contact.html">Contact Revnexa today</a>.</p>`
  },
  {
    id: 'reputation-management-strategies',
    title: '10 Reputation Management Strategies That Actually Work in 2024',
    slug: 'reputation-management-strategies',
    excerpt: 'From proactive monitoring to crisis management, discover the top strategies for managing and improving your app's online reputation.',
    category: 'Reputation',
    author: 'Revnexa Team',
    date: '2024-02-28',
    readTime: '10 min read',
    content: `<h2>The State of App Reputation in 2024</h2>
<p>With over 5 million apps across Google Play and Apple App Store, standing out requires more than great features. Your app's reputation — encompassing ratings, reviews, and public perception — plays a decisive role in user acquisition and retention.</p>

<h2>The Top 10 Strategies</h2>

<h3>1. Proactive Review Monitoring</h3>
<p>Set up alerts for new reviews across all platforms. The faster you respond, the better the outcome. Aim to respond to all reviews within 24 hours.</p>

<h3>2. Strategic Review Response</h3>
<p>Every review is an opportunity. Thank positive reviewers, address concerns in negative reviews, and always maintain a professional, empathetic tone.</p>

<h3>3. In-App Feedback Channels</h3>
<p>Give dissatisfied users an alternative to leaving a negative review. In-app feedback forms and support chat can intercept issues before they become public.</p>

<h3>4. Competitive Benchmarking</h3>
<p>Monitor your competitors' ratings and reviews. Understanding their strengths and weaknesses helps you position your app more effectively.</p>

<h3>5. User Advocacy Programs</h3>
<p>Turn your happiest users into advocates. Beta testing programs, referral incentives, and community forums create a loyal user base.</p>

<h3>6. Regular App Updates</h3>
<p>Frequent updates signal active development and show users you care. Always communicate what's new in your release notes.</p>

<h3>7. ASO Optimization</h3>
<p>Your app store listing affects first impressions. Optimize screenshots, descriptions, and keywords to set proper expectations.</p>

<h3>8. Social Proof Integration</h3>
<p>Showcase positive reviews, awards, and media mentions within your app and marketing materials.</p>

<h3>9. Crisis Management Plan</h3>
<p>Have a plan ready for reputation crises. Quick, transparent communication can turn a potential disaster into a trust-building moment.</p>

<h3>10. Data-Driven Decisions</h3>
<p>Use analytics to track reputation metrics over time. Identify trends, set benchmarks, and measure the ROI of your reputation management efforts.</p>

<blockquote>Reputation isn't built overnight. It's the cumulative result of consistent effort, authentic engagement, and genuine care for your users.</blockquote>

<p>Need help implementing these strategies? <a href="contact.html">Schedule a free consultation with Revnexa</a>.</p>`
  }
];

// Blog rendering
(function initBlog() {
  const blogGrid = document.getElementById('blog-grid');
  const blogLoading = document.getElementById('blog-loading');
  const blogPostView = document.getElementById('blog-post-view');
  const blogPostContent = document.getElementById('blog-post-content');

  if (!blogGrid) return;

  // Check URL params for single post
  const urlParams = new URLSearchParams(window.location.search);
  const postSlug = urlParams.get('post');

  if (postSlug) {
    showPost(postSlug);
    return;
  }

  // Load all posts
  loadPosts();

  async function loadPosts() {
    let allPosts = [...SEED_POSTS];

    // Try to load from Firebase
    if (db) {
      try {
        const snapshot = await db.collection('posts').orderBy('date', 'desc').get();
        snapshot.forEach(doc => {
          const data = doc.data();
          if (!allPosts.find(p => p.slug === data.slug)) {
            allPosts.push({ id: doc.id, ...data });
          }
        });
      } catch (e) {
        console.warn('Failed to load blog posts from Firebase:', e);
      }
    }

    if (blogLoading) blogLoading.style.display = 'none';

    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    blogGrid.innerHTML = allPosts.map(post => `
      <article class="blog-card reveal">
        <div class="blog-thumb" style="background:linear-gradient(135deg,#${hashColor(post.slug)})">
          <span class="blog-category">${post.category || 'General'}</span>
        </div>
        <div class="blog-body">
          <div class="blog-meta">
            <span>📅 ${formatDate(post.date)}</span>
            <span>⏱️ ${post.readTime || '5 min read'}</span>
          </div>
          <h3><a href="blog.html?post=${post.slug}">${post.title}</a></h3>
          <p class="blog-excerpt">${post.excerpt}</p>
          <a href="blog.html?post=${post.slug}" class="read-more">Read More →</a>
        </div>
      </article>
    `).join('');

    // Re-observe new elements
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    blogGrid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  async function showPost(slug) {
    let post = SEED_POSTS.find(p => p.slug === slug);

    // Try Firebase
    if (!post && db) {
      try {
        const qs = await db.collection('posts').where('slug', '==', slug).get();
        if (!qs.empty) post = { id: qs.docs[0].id, ...qs.docs[0].data() };
      } catch (e) { console.warn(e); }
    }

    if (!post) {
      blogGrid.innerHTML = '<p class="text-center" style="grid-column:1/-1;padding:40px">Post not found. <a href="blog.html" style="color:var(--primary)">Back to blog</a></p>';
      if (blogLoading) blogLoading.style.display = 'none';
      return;
    }

    // Hide grid, show post
    blogGrid.parentElement.parentElement.style.display = 'none';
    if (blogLoading) blogLoading.style.display = 'none';
    if (blogPostView) {
      blogPostView.style.display = 'block';
      blogPostContent.innerHTML = `
        <a href="blog.html" style="color:var(--primary);font-weight:600;font-size:0.9rem;display:inline-flex;align-items:center;gap:6px;margin-bottom:24px">← Back to Blog</a>
        <h1>${post.title}</h1>
        <div class="blog-post-meta">
          <span>📅 ${formatDate(post.date)}</span>
          <span>✍️ ${post.author || 'Revnexa Team'}</span>
          <span>⏱️ ${post.readTime || '5 min read'}</span>
          <span>📂 ${post.category || 'General'}</span>
        </div>
        ${post.content}
        <div style="margin-top:48px;padding:32px;background:var(--primary-50);border-radius:var(--radius-lg);text-align:center">
          <h3 style="margin-bottom:12px">Liked this article?</h3>
          <p style="color:var(--dark-500)">Get expert insights delivered to your inbox weekly.</p>
          <div style="display:flex;gap:12px;max-width:400px;margin:16px auto 0">
            <a href="contact.html" class="btn btn-primary" style="flex:1">Get Started</a>
            <a href="blog.html" class="btn btn-outline-dark" style="flex:1">More Articles</a>
          </div>
        </div>
      `;
    }

    // Update page title
    document.title = `${post.title} — Revnexa Blog`;
  }
})();

// Helper functions
function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ['667eea,764ba2', '4facfe,00f2fe', 'f093fb,f5576c', 'a18cd1,fbc2eb', 'ffecd2,fcb69f', '89f7fe,66a6ff'];
  return colors[Math.abs(hash) % colors.length];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ==========================================
// Smooth page-hero parallax effect on scroll
// ==========================================
(function initParallax() {
  const hero = document.querySelector('.hero, .page-hero');
  if (!hero) return;
  const shapes = hero.querySelectorAll('.shape');

  window.addEventListener('scroll', () => {
    const st = window.scrollY;
    if (st > window.innerHeight) return;
    shapes.forEach((shape, i) => {
      const speed = 0.2 + (i * 0.1);
      shape.style.transform = `translateY(${st * speed}px)`;
    });
  }, { passive: true });
})();

// ==========================================
// Tilt effect on cards (subtle)
// ==========================================
document.querySelectorAll('.card, .pricing-card, .portfolio-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-8px) perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ==========================================
// Active nav link highlighting
// ==========================================
(function highlightNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    link.classList.toggle('active', href === page);
  });
})();

console.log('%c🚀 Revnexa — Reviews • Trust • Growth', 'color:#2563eb;font-size:16px;font-weight:700;font-family:sans-serif');
