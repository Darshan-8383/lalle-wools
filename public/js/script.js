/* ═══════════════════════════════════════
   LALLEWOOLS — script.js (Full Rebuild)
═══════════════════════════════════════ */
'use strict';

/* ──────────────────────────────────────
   DATA
   PRODUCTS is now loaded from the backend (GET /api/products) in
   loadProducts() below, so prices/stock live in one place (server/data
   /products.js) instead of being hardcoded in the browser. FALLBACK_PRODUCTS
   keeps the site fully working even if the API is unreachable (e.g. static
   hosting preview without the Node server running).
────────────────────────────────────── */
const FALLBACK_PRODUCTS = [
  { id:1, type:'clothing', category:'artist', name:'Naruto Shippuden Oversized Tee', price:1299, oldPrice:1699, emoji:'🍃', badge:'new', sticker:'-24%', desc:'Premium 240GSM cotton. Boxy fit. Inspired by the leaf village culture. Double stitched hem, ribbed crew neck.', teeColor:'#fff', designText:'ナルト', designColor:'#FF6B00',image:'images/daali.jpg'  },
  { id:2, type:'clothing', category:'gaming', name:'GTA Vice City Acid Drop Tee', price:1399, oldPrice:null, emoji:'🎮', badge:'hot', sticker:null, desc:'Retro gaming nostalgia on a streetwear-ready oversized silhouette. Heavy cotton, dropped shoulders.', teeColor:'#1a0033', designText:'VICE\nCITY', designColor:'#FF00FF' },
  { id:3, type:'clothing', category:'streetwear', name:'Lallewools Core Logo Drop', price:999, oldPrice:null, emoji:'⚡', badge:null, sticker:null, desc:'The essential Lallewools piece. Clean logo front, signature neon back print. Oversized unisex fit.', teeColor:'#0A0A0A', designText:'ಲಲ್ಲೆ', designColor:'#C8FF00' },
  { id:4, type:'clothing', category:'movies', name:'Pulp Fiction Revisited', price:1499, oldPrice:null, emoji:'🎬', badge:'ltd', sticker:null, desc:'An homage to cinema\'s coolest. Graphic art inspired by the 1994 classic. Limited run.', teeColor:'#1a1a00', designText:'PULP\nFICTION', designColor:'#FFD700' },
  { id:5, type:'clothing', category:'minimal', name:'Void Series — Black on Black', price:1199, oldPrice:null, emoji:'🌑', badge:null, sticker:null, desc:'Tonal embroidery on 280GSM black cotton. The quietest loud thing you\'ll ever wear.', teeColor:'#111', designText:'VOID', designColor:'#222' },
  { id:6, type:'clothing', category:'artist', name:'Daft Punk Tribute Tee', price:1349, oldPrice:1699, emoji:'🤖', badge:'sale', sticker:'-21%', desc:'In memory of the robots. Holographic print on matte cotton. Oversized and perfect.', teeColor:'#c0c0c0', designText:'DAFT\nPUNK', designColor:'#0A0A0A' },
  { id:7, type:'clothing', category:'gaming', name:'Elden Ring — Tarnished Tee', price:1449, oldPrice:null, emoji:'⚔️', badge:'new', sticker:null, desc:'For those who have died a thousand times. Washed fabric, vintage feel, brutal art.', teeColor:'#1a1000', designText:'ELDEN\nRING', designColor:'#C8A800' },
  { id:8, type:'clothing', category:'streetwear', name:'Lallewools Patchwork Drop', price:1599, oldPrice:null, emoji:'🧩', badge:'hot', sticker:null, desc:'Multi-panel construction, tonal patch accents, utility aesthetic. This one does the talking.', teeColor:'#2d1a0a', designText:'PATCH\nWORK', designColor:'#FF6B35' },
  { id:9, type:'clothing', category:'minimal', name:'Typeset No. 3', price:899, oldPrice:null, emoji:'📝', badge:null, sticker:null, desc:'Just a typeface. Just a vibe. Clean, intentional, unforgettable.', teeColor:'#f5f5f0', designText:'TYPE\nSET 3', designColor:'#0A0A0A' },
  { id:10, type:'clothing', category:'movies', name:'Interstellar — Beyond Tee', price:1399, oldPrice:1799, emoji:'🪐', badge:'sale', sticker:'-22%', desc:'Space cowboy energy. Cosmic print with IMAX-scale vibes on cotton canvas.', teeColor:'#000020', designText:'INTER\nSTELLAR', designColor:'#4FC3F7' },
  { id:11, type:'clothing', category:'artist', name:'Kendrick Lamar — DAMN. Tee', price:1299, oldPrice:null, emoji:'🎵', badge:'new', sticker:null, desc:'Inspired by the greatest album of the decade. Washed cotton, relaxed fit, lyric artwork.', teeColor:'#1a0000', designText:'DAMN.', designColor:'#FF1A1A' },
  { id:12, type:'clothing', category:'gaming', name:'Among Us Crewmate Fit', price:999, oldPrice:null, emoji:'🔴', badge:null, sticker:null, desc:'Sus never looked this clean. Pop culture streetwear for the gamer gen.', teeColor:'#cc0000', designText:'SUS\n😳', designColor:'#fff' },
  { id:101, type:'poster', category:'fan', name:'Dr Rajkumar Poster', price:599, oldPrice:null, emoji:'⚡', badge:'new', sticker:null, size:'18×24"', desc:'High-resolution art print of the legend Dr. Rajkumar. Premium matte finish.', image:'images/dr-rajkumar.jpg' },
  { id:102, type:'poster', category:'fan', name:'Puneeth Rajkumar Poster', price:599, oldPrice:null, emoji:'⭐', badge:'new', sticker:null, size:'18×24"', desc:'High-resolution fan art print of Power Star Puneeth Rajkumar.', image:'images/appu.jpg' },
  { id:103, type:'poster', category:'fan', name:'Daali Dhananjaya Poster', price:599, oldPrice:null, emoji:'🔥', badge:'new', sticker:null, size:'18×24"', desc:'High-resolution fan art print of Daali Dhananjaya.', image:'images/daali.jpg' },
  { id:104, type:'poster', category:'originals', name:'Lallewools — Neon Genesis', price:799, oldPrice:null, emoji:'🔮', badge:'ltd', sticker:null, size:'20×30"', desc:'An original Lallewools art piece. Glitch art, neon overlays, and cyber-culture typography.' },
  { id:105, type:'poster', category:'custom', name:'Custom Fan Poster', price:999, oldPrice:null, emoji:'✏️', badge:null, sticker:null, size:'Custom', desc:'Send us your fandom. We design a bespoke art poster just for you. Signed, numbered, delivered.' },
  { id:106, type:'poster', category:'fan', name:'Game of Thrones — Winter Is Coming', price:649, oldPrice:699, emoji:'⚔️', badge:'hot', sticker:null, size:'18×24"', desc:'Epic fan art poster inspired by the world of Westeros. Premium matte finish.', image:'images/gameofthrones.jpg' },
  { id:107, type:'poster', category:'fan', name:'Minchina Ota', price:649, oldPrice:null, emoji:'🎭', badge:'hot', sticker:null, size:'24×36"', desc:'Fan tribute poster inspired by Minchina Ota. Cinematic style artwork.', image:'images/minchina-ota.jpg' },
  { id:108, type:'poster', category:'fan', name:'Darshan — The Challenging Star', price:599, oldPrice:null, emoji:'🔥', badge:'new', sticker:null, size:'18×24"', desc:'High-resolution fan art poster of Challenging Star Darshan. Mass style cinematic design.', image:'images/darshan.jpg' },
  { id:109, type:'poster', category:'originals', name:'Lallewools — Vaporwave No.5', price:749, oldPrice:null, emoji:'🌸', badge:null, sticker:null, size:'20×30"', desc:'Pastel sunsets, ancient ruins, pixel dreams. Pure Lallewools original aesthetic.' },
  { id:110, type:'poster', category:'fan', name:'The Boys — Homelander Poster', price:699, oldPrice:null, emoji:'⚡', badge:'hot', sticker:null, size:'18×24"', desc:'Dark cinematic fan art poster of Homelander from The Boys. Premium matte finish.', image:'images/homelander.jpg' },
  { id:111, type:'poster', category:'fan', name:'Bagheera Poster', price:699, oldPrice:null, emoji:'🐺', badge:'new', sticker:null, size:'24×36"', desc:'High-resolution cinematic fan art poster inspired by Bagheera.', image:'images/Bagheera.jpg' },
  { id:112, type:'poster', category:'artist', name:'Playboi Carti — Whole Lotta Red', price:549, oldPrice:699, emoji:'🔴', badge:'sale', sticker:null, size:'18×24"', desc:'Red on red on red. Fan tribute to the most chaotic album of the era. Bold typographic art.' },
];

let PRODUCTS = FALLBACK_PRODUCTS.slice();

/** Fetch the live catalog from the backend; silently keep the fallback on failure. */
async function loadProducts() {
  try {
    const fresh = await Api.getProducts();
    if (Array.isArray(fresh) && fresh.length) PRODUCTS = fresh;
  } catch (err) {
    console.warn('[LALLEWOOLS] Could not reach backend, using bundled product data:', err.message);
  }
}

/* ──────────────────────────────────────
   CART & WISHLIST STATE
────────────────────────────────────── */
let cart = JSON.parse(localStorage.getItem('lallewools_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('lallewools_wishlist') || '[]');
let selectedProductSize = 'M';
let currentPaymentMethod = '';

function saveCart() { localStorage.setItem('lallewools_cart', JSON.stringify(cart)); }
function saveWishlist() { localStorage.setItem('lallewools_wishlist', JSON.stringify(wishlist)); }
function getTotal() { return cart.reduce((sum, i) => sum + i.price * i.qty, 0); }

/* ──────────────────────────────────────
   CART UI
────────────────────────────────────── */
function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cart-count');
  el.textContent = count;
  el.classList.toggle('visible', count > 0);

  const itemsEl = document.getElementById('cart-items');
  if (!cart.length) {
    itemsEl.innerHTML = '<div class="cart-empty">Your bag is empty.<br/>Add something dope.</div>';
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-sub">${item.size !== 'NA' ? 'Size: '+item.size+' · ' : ''}Qty: ${item.qty}</div>
          <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
          <button class="cart-item-remove" onclick="removeFromCart(${item.id},'${item.size}')">REMOVE</button>
        </div>
      </div>
    `).join('');
  }
  document.getElementById('cart-total-price').textContent = '₹' + getTotal().toLocaleString('en-IN');
}

function addToCart(productId, size) {
  const p = PRODUCTS.find(pr => pr.id === productId);
  if (!p) return;
  const existing = cart.find(i => i.id === productId && i.size === (size || 'NA'));
  if (existing) { existing.qty++; }
  else { cart.push({ id: productId, name: p.name, price: p.price, emoji: p.emoji, size: size || 'NA', qty: 1 }); }
  saveCart(); updateCartUI();
  showToast('✓ Added — ' + p.name);
  // open cart sidebar briefly
  const sidebar = document.getElementById('cart-sidebar');
  const bg = document.getElementById('cart-overlay-bg');
  sidebar.classList.add('open'); bg.classList.add('open');
  document.body.classList.add('no-scroll');
}

function removeFromCart(id, size) {
  cart = cart.filter(i => !(i.id === id && i.size === size));
  saveCart(); updateCartUI();
}

/* ──────────────────────────────────────
   WISHLIST UI
────────────────────────────────────── */
function updateWishlistUI() {
  const count = wishlist.length;
  const el = document.getElementById('wishlist-count');
  el.textContent = count;
  el.classList.toggle('visible', count > 0);
  document.getElementById('wishlist-btn').classList.toggle('has-items', count > 0);

  const itemsEl = document.getElementById('wishlist-items');
  if (!wishlist.length) {
    itemsEl.innerHTML = '<div class="cart-empty">Your wishlist is empty.<br/>Tap ❤ on any product.</div>';
    return;
  }
  itemsEl.innerHTML = wishlist.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
        <div style="display:flex;gap:8px;margin-top:4px">
          <button class="cart-item-remove" style="color:var(--lime)" onclick="moveToCart(${item.id})">ADD TO BAG</button>
          <button class="cart-item-remove" onclick="removeFromWishlist(${item.id})">REMOVE</button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleWishlist(productId) {
  const p = PRODUCTS.find(pr => pr.id === productId);
  if (!p) return;
  const idx = wishlist.findIndex(i => i.id === productId);
  if (idx > -1) { wishlist.splice(idx, 1); showToast('Removed from wishlist'); }
  else { wishlist.push({ id: p.id, name: p.name, price: p.price, emoji: p.emoji }); showToast('❤ Added to wishlist!'); }
  saveWishlist(); updateWishlistUI();
  // update all wish buttons
  document.querySelectorAll(`[data-wish-id="${productId}"]`).forEach(btn => {
    btn.classList.toggle('wished', wishlist.some(i => i.id === productId));
    btn.innerHTML = wishlist.some(i => i.id === productId) ? '❤' : '♡';
  });
}

function removeFromWishlist(id) { wishlist = wishlist.filter(i => i.id !== id); saveWishlist(); updateWishlistUI(); }
function moveToCart(id) { addToCart(id, 'M'); removeFromWishlist(id); }
function isWishlisted(id) { return wishlist.some(i => i.id === id); }

/* ──────────────────────────────────────
   INTRO (LOGO GLITCH)
────────────────────────────────────── */
function initFabricCanvas() {
  const canvas = document.getElementById('fabric-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const lines = Array.from({ length: 50 }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
    len: Math.random() * 100 + 30, angle: Math.random() * Math.PI,
    vangle: (Math.random() - 0.5) * 0.008, opacity: Math.random() * 0.4 + 0.1
  }));
  let animId;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach(l => {
      l.x += l.vx; l.y += l.vy; l.angle += l.vangle;
      if (l.x < 0 || l.x > canvas.width) l.vx *= -1;
      if (l.y < 0 || l.y > canvas.height) l.vy *= -1;
      ctx.strokeStyle = `rgba(200,255,0,${l.opacity})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(l.x + Math.cos(l.angle) * l.len, l.y + Math.sin(l.angle) * l.len);
      ctx.stroke();
    });
    animId = requestAnimationFrame(draw);
  }
  draw();
  return animId;
}

function startIntro() {
  const overlay = document.getElementById('intro-overlay');
  const animId = initFabricCanvas();
  document.body.classList.add('no-scroll');
  setTimeout(() => {
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.classList.remove('no-scroll');
      cancelAnimationFrame(animId);
      animateHero();
    }, 800);
  }, 3000);
}

function animateHero() {
  const els = document.querySelectorAll('.hero-eyebrow,.hero-title,.hero-subtitle,.hero-cta-group');
  els.forEach((el, i) => {
    el.style.cssText = `opacity:0;transform:translateY(32px);transition:opacity .8s ease ${i*0.15}s,transform .8s ease ${i*0.15}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.opacity='1'; el.style.transform='translateY(0)'; }));
  });
}

/* ──────────────────────────────────────
   HERO SLIDER
────────────────────────────────────── */
let currentSlide = 0;
const slides = () => document.querySelectorAll('.hero-slide');
const dots = () => document.querySelectorAll('.slider-dots .dot');

function goSlide(n) {
  slides().forEach((s, i) => s.classList.toggle('active', i === n));
  dots().forEach((d, i) => d.classList.toggle('active', i === n));
  currentSlide = n;
}
function slideHero(dir) {
  const len = slides().length;
  goSlide((currentSlide + dir + len) % len);
}

let sliderInterval = setInterval(() => slideHero(1), 5000);
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('hero-slider')?.addEventListener('mouseenter', () => clearInterval(sliderInterval));
  document.getElementById('hero-slider')?.addEventListener('mouseleave', () => { sliderInterval = setInterval(() => slideHero(1), 5000); });
});

/* ──────────────────────────────────────
   THEME TOGGLE
────────────────────────────────────── */
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (localStorage.getItem('lallewools_theme') === 'light')
    document.documentElement.setAttribute('data-theme', 'light');
  btn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('lallewools_theme','dark'); }
    else { document.documentElement.setAttribute('data-theme','light'); localStorage.setItem('lallewools_theme','light'); }
  });
}

/* ──────────────────────────────────────
   NAVBAR
────────────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
}

/* ──────────────────────────────────────
   MOBILE MENU
────────────────────────────────────── */
function closeMobileMenu() {
  document.getElementById('mobile-menu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
  document.body.classList.remove('no-scroll');
}
function initMobileMenu() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    document.body.classList.toggle('no-scroll', open);
  });
  document.getElementById('mobile-close').addEventListener('click', closeMobileMenu);
}

/* ──────────────────────────────────────
   SEARCH
────────────────────────────────────── */
function openSearch() {
  document.getElementById('search-overlay').classList.add('open');
  document.body.classList.add('no-scroll');
  setTimeout(() => document.getElementById('search-input').focus(), 200);
}
function closeSearch() {
  document.getElementById('search-overlay').classList.remove('open');
  document.body.classList.remove('no-scroll');
  document.getElementById('search-input').value = '';
  document.getElementById('search-results').innerHTML = '';
}
function fillSearch(term) {
  const input = document.getElementById('search-input');
  input.value = term;
  input.dispatchEvent(new Event('input'));
}

function initSearch() {
  document.getElementById('nav-search-bar').addEventListener('click', openSearch);
  document.getElementById('search-close').addEventListener('click', closeSearch);
  document.getElementById('search-overlay').addEventListener('click', e => { if (e.target === document.getElementById('search-overlay')) closeSearch(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });

  document.getElementById('search-input').addEventListener('input', () => {
    const q = document.getElementById('search-input').value.toLowerCase().trim();
    const resultsEl = document.getElementById('search-results');
    if (!q) { resultsEl.innerHTML = ''; return; }
    const results = PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 6);
    if (!results.length) { resultsEl.innerHTML = '<div style="color:var(--white-dim);font-size:.85rem;padding:12px">No results found.</div>'; return; }
    resultsEl.innerHTML = results.map(p => `
      <div class="search-result-item" onclick="closeSearchAndOpen(${p.id})">
        <span style="font-size:1.5rem">${p.emoji}</span>
        <div>
          <div style="font-size:.9rem;font-weight:600">${p.name}</div>
          <div style="font-size:.72rem;color:var(--white-dim)">${p.type==='clothing'?'Clothing':'Poster'} · ₹${p.price}</div>
        </div>
      </div>
    `).join('');
  });
}

function closeSearchAndOpen(id) {
  closeSearch();
  setTimeout(() => openProductModal(id), 300);
}

/* ──────────────────────────────────────
   VOICE SEARCH
────────────────────────────────────── */
let recognition = null;

function initVoiceSearch() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    document.querySelectorAll('.mic-btn,.mic-btn-lg').forEach(b => b.style.opacity = '.3');
    return;
  }
  recognition = new SpeechRec();
  recognition.lang = 'en-IN';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = e => {
    const transcript = e.results[0][0].transcript;
    stopVoice();
    openSearch();
    setTimeout(() => { fillSearch(transcript); showToast('🎤 Searching: ' + transcript); }, 200);
  };
  recognition.onerror = () => stopVoice();
  recognition.onend = () => stopVoice();

  document.getElementById('mic-btn').addEventListener('click', startVoice);
  document.getElementById('mic-btn-search').addEventListener('click', startVoice);
}

function startVoice() {
  if (!recognition) { showToast('Voice search not supported in this browser'); return; }
  document.getElementById('voice-status').style.display = 'flex';
  document.getElementById('mic-btn').classList.add('listening');
  recognition.start();
}
function stopVoice() {
  document.getElementById('voice-status').style.display = 'none';
  document.getElementById('mic-btn').classList.remove('listening');
  try { recognition && recognition.stop(); } catch(e) {}
}

/* ──────────────────────────────────────
   CART SIDEBAR
────────────────────────────────────── */
function initCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const bg = document.getElementById('cart-overlay-bg');
  const openCart = () => { sidebar.classList.add('open'); bg.classList.add('open'); document.body.classList.add('no-scroll'); };
  const closeCart = () => { sidebar.classList.remove('open'); bg.classList.remove('open'); document.body.classList.remove('no-scroll'); };
  document.getElementById('cart-btn').addEventListener('click', openCart);
  document.getElementById('cart-close').addEventListener('click', closeCart);
  bg.addEventListener('click', closeCart);
}

/* ──────────────────────────────────────
   WISHLIST SIDEBAR
────────────────────────────────────── */
function initWishlist() {
  const sidebar = document.getElementById('wishlist-sidebar');
  const bg = document.getElementById('cart-overlay-bg');
  document.getElementById('wishlist-btn').addEventListener('click', () => {
    sidebar.classList.add('open'); bg.classList.add('open'); document.body.classList.add('no-scroll');
  });
  document.getElementById('wishlist-close').addEventListener('click', () => {
    sidebar.classList.remove('open'); bg.classList.remove('open'); document.body.classList.remove('no-scroll');
  });
}

/* ──────────────────────────────────────
   PRODUCT CARD HTML (with mockup tee)
────────────────────────────────────── */
function productCardHTML(p) {
  const badge = p.badge ? `<div class="product-badge badge-${p.badge}">${p.badge.toUpperCase()}</div>` : '';
  const sticker = p.sticker ? `<div class="product-sticker">${p.sticker}</div>` : '';
  const oldPrice = p.oldPrice ? `<span class="product-price-old">₹${p.oldPrice}</span>` : '';
  const wished = isWishlisted(p.id);

  // Tee mockup visual
  const teeCol = p.teeColor || '#fff';
  const designCol = p.designColor || '#0A0A0A';
  const designTxt = (p.designText || p.emoji).replace(/\n/g, '<br>');
  const visual = `
    <div class="card-tee-wrap">
      <div class="card-mockup-tee">
        <div class="card-mockup-body" style="background:${teeCol}">
          <div class="card-mockup-design" style="color:${designCol}">${designTxt}</div>
        </div>
      </div>
    </div>`;

  return `
    <div class="product-card reveal" onclick="openProductModal(${p.id})">
      <div class="product-img">
        <div class="product-img-inner has-mockup">${visual}</div>
        ${badge}
        <div class="product-quick-add" onclick="event.stopPropagation();addToCart(${p.id},'M')">+ ADD TO BAG</div>
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price-row">
          <span class="product-price">₹${p.price}</span>
          ${oldPrice}${sticker}
          <button class="product-wish-btn ${wished?'wished':''}" data-wish-id="${p.id}"
            onclick="event.stopPropagation();toggleWishlist(${p.id})">${wished?'❤':'♡'}</button>
        </div>
      </div>
    </div>`;
}

function posterCardHTML(p) {
  const badge = p.badge ? `<div class="product-badge badge-${p.badge}">${p.badge.toUpperCase()}</div>` : '';
  const wished = isWishlisted(p.id);

  const imgContent = p.image
    ? `<img src="${p.image}" class="poster-product-img" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    + `<div class="poster-emoji" style="display:none">${p.emoji}</div>`
    : `<div class="poster-emoji">${p.emoji}</div>`;

  return `
    <div class="poster-card reveal" onclick="openProductModal(${p.id})">
      <div class="poster-img">${imgContent}${badge}</div>
      <div class="poster-info">
        <div class="poster-category">${p.category}</div>
        <div class="poster-name">${p.name}</div>
        <div class="poster-size">${p.size || '18×24"'}</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div class="poster-price">₹${p.price}</div>
          <button class="product-wish-btn ${wished?'wished':''}" data-wish-id="${p.id}"
            onclick="event.stopPropagation();toggleWishlist(${p.id})">${wished?'❤':'♡'}</button>
        </div>
      </div>
    </div>`;
}

function gradientForProduct(p) {
  return { artist:'linear-gradient(135deg,#1a1a2e,#16213e)', gaming:'linear-gradient(135deg,#0d1b2a,#1b4332)', streetwear:'linear-gradient(135deg,#1a1a1a,#2d2d2d)', movies:'linear-gradient(135deg,#1a0a2e,#2d1a4d)', minimal:'linear-gradient(135deg,#111,#1c1c1c)', fan:'linear-gradient(135deg,#0f1923,#1a3a5c)', originals:'linear-gradient(135deg,#0a2e1a,#1a4d2a)', custom:'linear-gradient(135deg,#2e1a0a,#4d3520)' }[p.category] || 'linear-gradient(135deg,#161616,#202020)';
}

/* ──────────────────────────────────────
   RENDER SECTIONS
────────────────────────────────────── */
function renderTrending() {
  const trending = PRODUCTS.filter(p => p.type==='clothing' && (p.badge==='hot'||p.badge==='new')).slice(0,4);
  document.getElementById('trending-grid').innerHTML = trending.map(productCardHTML).join('');
}
function renderClothing(filter = 'all') {
  const filtered = PRODUCTS.filter(p => p.type==='clothing' && (filter==='all'||p.category===filter));
  document.getElementById('clothing-grid').innerHTML = filtered.map(productCardHTML).join('');
  initReveal();
}
function renderPosters(filter = 'all') {
  const filtered = PRODUCTS.filter(p => p.type==='poster' && (filter==='all'||p.category===filter));
  document.getElementById('posters-grid').innerHTML = filtered.map(posterCardHTML).join('');
  initReveal();
}

/* ──────────────────────────────────────
   FILTERS
────────────────────────────────────── */
function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderClothing(btn.dataset.filter);
    });
  });
  document.querySelectorAll('.poster-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.poster-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderPosters(tab.dataset.ptab);
    });
  });
}

/* ──────────────────────────────────────
   PRODUCT MODAL (with mockup display)
────────────────────────────────────── */
function openProductModal(id) {
  const p = PRODUCTS.find(pr => pr.id === id);
  if (!p) return;
  selectedProductSize = 'M';

  const sizes = p.type === 'clothing' ? ['XS','S','M','L','XL','XXL'] : ['A4','A3','18×24"','24×36"'];
  const sizeHTML = sizes.map(s => `<button class="modal-size-btn${s===selectedProductSize?' active':''}" onclick="selectModalSize(this,'${s}')">${s}</button>`).join('');
  const oldPriceHTML = p.oldPrice ? `<del style="color:var(--text-dim);font-size:1rem;margin-left:8px">₹${p.oldPrice}</del>` : '';
  const wished = isWishlisted(p.id);

  // Visual — tee mockup or poster image
  let visualHTML;
  if (p.type === 'clothing') {
    const teeCol = p.teeColor || '#fff';
    const designCol = p.designColor || '#0A0A0A';
    const designTxt = (p.designText || p.emoji).replace(/\n/g, '<br>');
    visualHTML = `
      <div class="product-modal-img" style="background:${gradientForProduct(p)}">
        <div class="modal-tee-wrap">
          <div style="position:relative;width:180px;height:215px">
            <div style="width:100%;height:100%;background:${teeCol};
              clip-path:polygon(20% 0%,80% 0%,100% 13%,100% 100%,0% 100%,0% 13%);
              display:flex;align-items:center;justify-content:center;
              box-shadow:0 12px 48px rgba(0,0,0,.6);">
              <div style="font-size:1.6rem;font-weight:800;text-align:center;color:${designCol};
                font-family:'Space Grotesk',sans-serif;letter-spacing:-.02em;line-height:1.2">${designTxt}</div>
            </div>
          </div>
        </div>
      </div>`;
  } else if (p.image) {
    visualHTML = `
      <div class="product-modal-img" style="padding:0;overflow:hidden">
        <img src="${p.image}" class="modal-poster-img" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" />
      </div>`;
  } else {
    visualHTML = `<div class="product-modal-img" style="background:${gradientForProduct(p)};font-size:5rem">${p.emoji}</div>`;
  }

  document.getElementById('product-modal-content').innerHTML = `
    <div class="product-modal-inner">
      ${visualHTML}
      <div class="product-modal-info">
        <div class="product-modal-category">${p.type==='clothing'?'Clothing':'Poster'} · ${p.category}</div>
        <h2 class="product-modal-name">${p.name}</h2>
        <div style="display:flex;align-items:center;margin-bottom:1.2rem">
          <span class="product-modal-price">₹${p.price}</span>${oldPriceHTML}
        </div>
        <p class="product-modal-desc">${p.desc}</p>
        <div class="product-modal-sizes">
          <label>${p.type==='clothing'?'SELECT SIZE':'SELECT FORMAT'}</label>
          <div class="modal-size-group">${sizeHTML}</div>
        </div>
        <button class="product-modal-add" onclick="addToCart(${p.id},selectedProductSize);closeProductModal()">
          ADD TO BAG — ₹${p.price.toLocaleString('en-IN')}
        </button>
        <div class="product-modal-actions">
          <button class="modal-wishlist-btn ${wished?'wished':''}" id="modal-wish-btn"
            onclick="toggleWishlist(${p.id});document.getElementById('modal-wish-btn').classList.toggle('wished');document.getElementById('modal-wish-btn').innerHTML=isWishlisted(${p.id})?'❤ Wishlisted':'♡ Add to Wishlist'">
            ${wished?'❤ Wishlisted':'♡ Add to Wishlist'}
          </button>
        </div>
      </div>
    </div>`;

  document.getElementById('product-modal').classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('open');
  document.body.classList.remove('no-scroll');
}
function selectModalSize(btn, size) {
  selectedProductSize = size;
  document.querySelectorAll('.modal-size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ──────────────────────────────────────
   TEE BUILDER
────────────────────────────────────── */
function openTeeBuilder() {
  document.getElementById('tee-builder-modal').classList.add('open');
  document.body.classList.add('no-scroll');
}
function closeTeeBuilder() {
  document.getElementById('tee-builder-modal').classList.remove('open');
  document.body.classList.remove('no-scroll');
}
function previewTee(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('tshirt-design-img').innerHTML = `<img src="${e.target.result}" alt="Your design" style="width:100%;height:100%;object-fit:contain;border-radius:8px" />`;
  };
  reader.readAsDataURL(file);
}
function setTeeColor(btn, color) {
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tshirt-preview').style.setProperty('--tee-col', color);
}
function addCustomTeeToCart() {
  const size = document.querySelector('.size-btn.active')?.textContent || 'M';
  cart.push({ id: 'custom_' + Date.now(), name: 'Custom Lallewools Tee', price: 1499, emoji: '👕', size, qty: 1 });
  saveCart(); updateCartUI(); closeTeeBuilder();
  showToast('Custom tee added to bag!');
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('size-btn')) {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
  }
});

/* ──────────────────────────────────────
   CHECKOUT
────────────────────────────────────── */
let checkoutStep = 1;

function openCheckout() {
  if (!cart.length) { showToast('Your bag is empty!'); return; }
  // close cart sidebar
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay-bg').classList.remove('open');
  checkoutStep = 1;
  updateCheckoutStep(1);
  document.getElementById('co-subtotal').textContent = '₹' + getTotal().toLocaleString('en-IN');
  document.getElementById('co-total').textContent = '₹' + getTotal().toLocaleString('en-IN');
  document.getElementById('checkout-modal').classList.add('open');
}
function closeCheckout() {
  document.getElementById('checkout-modal').classList.remove('open');
  document.body.classList.remove('no-scroll');
  if (checkoutStep === 4) { cart = []; saveCart(); updateCartUI(); checkoutStep = 1; }
}

function updateCheckoutStep(n) {
  checkoutStep = n;
  // Update panes
  document.querySelectorAll('.checkout-pane').forEach((p, i) => p.classList.toggle('active', i+1 === n));
  // Update step indicators
  document.querySelectorAll('.cs-step').forEach((s, i) => {
    s.classList.toggle('active', i+1 === n);
    s.classList.toggle('done', i+1 < n);
  });
  document.querySelectorAll('.cs-line').forEach((l, i) => l.classList.toggle('done', i+1 < n));
}

function collectAddress() {
  return {
    name: document.getElementById('co-name').value.trim(),
    phone: document.getElementById('co-phone').value.trim(),
    line1: document.getElementById('co-addr1').value.trim(),
    line2: document.getElementById('co-addr2').value.trim(),
    city: document.getElementById('co-city').value.trim(),
    pincode: document.getElementById('co-pin').value.trim(),
    state: document.getElementById('co-state').value,
  };
}

async function goCheckoutStep(n) {
  if (n === 2) {
    const a = collectAddress();
    if (!a.name || !a.phone || !a.line1 || !a.city || !a.pincode || !a.state) {
      showToast('⚠ Please fill all required fields'); return;
    }
    updateCheckoutStep(2);
    // Live shipping estimate for the pincode they just entered — this is the
    // same check-pincode endpoint that talks to Shiprocket once configured.
    const etaEl = document.getElementById('shipping-eta');
    etaEl.textContent = 'Checking delivery estimate…';
    try {
      const estimate = await Api.checkPincode(a.pincode, getTotal(), 0.3);
      if (estimate.serviceable) {
        etaEl.textContent = `📦 Estimated delivery: ${estimate.etaLabel} to ${a.pincode}${estimate.mock ? '' : ' via ' + estimate.courierName}`;
        etaEl.style.color = 'var(--lime)';
      } else {
        etaEl.textContent = `⚠ ${estimate.reason || 'We may not be able to deliver to this PIN code yet.'}`;
        etaEl.style.color = 'var(--red)';
      }
    } catch (err) {
      etaEl.textContent = '';
    }
    return;
  }
  if (n === 3) {
    if (!currentPaymentMethod) { showToast('⚠ Please select a payment method'); return; }
    buildOrderReview();
  }
  updateCheckoutStep(n);
}

function selectPayment(method) {
  currentPaymentMethod = method;
  // Update UI
  document.querySelectorAll('.payment-opt').forEach(o => o.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  document.querySelectorAll('.po-radio').forEach(r => r.classList.remove('checked'));
  document.getElementById(`po-${method}`).classList.add('checked');
  // Show/hide sub-fields
  document.querySelectorAll('.payment-sub-field').forEach(f => f.style.display = 'none');
  if (method === 'upi') document.getElementById('upi-field').style.display = 'flex';
  if (method === 'card') document.getElementById('card-field').style.display = 'flex';
  // COD fee
  const isCOD = method === 'cod';
  document.getElementById('cod-fee-row').style.display = isCOD ? 'flex' : 'none';
  const total = getTotal() + (isCOD ? 40 : 0);
  document.getElementById('co-total').textContent = '₹' + total.toLocaleString('en-IN');
}

function buildOrderReview() {
  const name = document.getElementById('co-name').value.trim();
  const addr = `${document.getElementById('co-addr1').value}, ${document.getElementById('co-addr2').value}, ${document.getElementById('co-city').value} - ${document.getElementById('co-pin').value}, ${document.getElementById('co-state').value}`;
  const isCOD = currentPaymentMethod === 'cod';
  const total = getTotal() + (isCOD ? 40 : 0);

  const paymentLabels = { upi:'UPI / GPay / PhonePe', card:'Credit / Debit Card', netbanking:'Net Banking', cod:'Cash on Delivery' };

  const itemsHTML = cart.map(i => `
    <div class="order-review-row">
      <span>${i.emoji} ${i.name} ${i.size!=='NA'?'('+i.size+')':''} × ${i.qty}</span>
      <span>₹${(i.price*i.qty).toLocaleString('en-IN')}</span>
    </div>`).join('');

  document.getElementById('order-review-content').innerHTML = `
    <div style="background:var(--surface2);border-radius:12px;padding:16px;margin-bottom:16px">
      ${itemsHTML}
      ${isCOD?'<div class="order-review-row"><span>COD Fee</span><span>₹40</span></div>':''}
      <div class="order-review-row" style="font-weight:800;color:var(--lime);border-top:1px solid var(--border);margin-top:4px;padding-top:12px">
        <span>TOTAL</span><span>₹${total.toLocaleString('en-IN')}</span>
      </div>
    </div>
    <div style="font-size:.85rem;color:var(--text-dim);line-height:1.8">
      <div><strong style="color:var(--text)">Deliver to:</strong> ${name}</div>
      <div>${addr}</div>
      <div style="margin-top:6px"><strong style="color:var(--text)">Payment:</strong> ${paymentLabels[currentPaymentMethod]}</div>
    </div>`;
}

function setPlacingOrder(isPlacing) {
  const btn = document.getElementById('place-order-btn');
  if (!btn) return;
  btn.disabled = isPlacing;
  btn.textContent = isPlacing ? 'PROCESSING…' : 'PLACE ORDER 🎉';
}

function showOrderSuccess(order) {
  document.getElementById('order-id-display').textContent = order.id;
  updateCheckoutStep(4);
  showToast('🎉 Order placed successfully!');
}

/**
 * Real checkout flow:
 *  1. POST /api/orders — server re-prices the cart (never trusts client
 *     prices), validates the address, and either confirms it immediately
 *     (Cash on Delivery) or leaves it "awaiting_payment".
 *  2. For online payment methods, POST /api/payment/create-order to get a
 *     Razorpay order, open Razorpay's own secure Checkout modal, then
 *     POST /api/payment/verify with what it returns.
 *  3. On success, clear the cart and show the confirmation screen.
 */
async function placeOrder() {
  if (!cart.length) { showToast('Your bag is empty!'); return; }
  setPlacingOrder(true);
  try {
    const items = cart.map(i => ({ id: i.id, size: i.size, qty: i.qty }));
    const address = collectAddress();
    const order = await Api.createOrder({ items, address, paymentMethod: currentPaymentMethod });

    if (currentPaymentMethod === 'cod') {
      cart = []; saveCart(); updateCartUI();
      showOrderSuccess(order);
      return;
    }

    await payForOrderWithRazorpay(order, address);
  } catch (err) {
    showToast('⚠ ' + err.message);
  } finally {
    setPlacingOrder(false);
  }
}

function payForOrderWithRazorpay(order, address) {
  return Api.createPaymentOrder(order.id).then(gw => {
    // MOCK MODE: no real gateway keys configured on the backend yet.
    // Skips the real Razorpay modal and simulates an instant successful
    // payment so the whole flow (including shipment booking) can still be
    // tested end-to-end. Set RAZORPAY_KEY_ID/SECRET in the server's .env to
    // switch this to a real payment automatically — no frontend change needed.
    if (gw.mock) {
      showToast('💳 Simulating payment (mock mode — add Razorpay keys to go live)');
      return Api.verifyPayment({
        orderId: order.id,
        gatewayOrderId: gw.gatewayOrderId,
        gatewayPaymentId: 'mock_payment_' + order.id,
        signature: 'mock_signature',
      }).then(() => {
        cart = []; saveCart(); updateCartUI();
        showOrderSuccess(order);
      });
    }

    // LIVE MODE: open Razorpay's real Checkout modal.
    return new Promise((resolve, reject) => {
      if (typeof Razorpay === 'undefined') {
        reject(new Error('Payment gateway script failed to load. Check your connection and try again.'));
        return;
      }
      const rzp = new Razorpay({
        key: gw.keyId,
        amount: gw.amountPaise,
        currency: gw.currency,
        name: 'LALLEWOOLS',
        description: `Order ${order.id}`,
        order_id: gw.gatewayOrderId,
        prefill: { name: address.name, contact: address.phone, email: address.email || '' },
        theme: { color: '#C8FF00' },
        handler: function (response) {
          Api.verifyPayment({
            orderId: order.id,
            gatewayOrderId: response.razorpay_order_id,
            gatewayPaymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }).then(() => {
            cart = []; saveCart(); updateCartUI();
            showOrderSuccess(order);
            resolve();
          }).catch(reject);
        },
        modal: {
          ondismiss: function () { reject(new Error('Payment cancelled')); },
        },
      });
      rzp.on('payment.failed', function (resp) {
        reject(new Error(resp.error && resp.error.description ? resp.error.description : 'Payment failed'));
      });
      rzp.open();
    });
  });
}

/* ──────────────────────────────────────
   AI PHOTO MATCH
────────────────────────────────────── */
const STYLE_MATCHES = {
  energetic: { label: '🔥 Your Vibe: BOLD & ENERGETIC', products: [1, 2, 7, 8] },
  chill: { label: '😎 Your Vibe: CHILL & MINIMAL', products: [5, 9, 3, 12] },
  artistic: { label: '🎨 Your Vibe: ARTISTIC & EXPRESSIVE', products: [6, 4, 11, 1] },
  gamer: { label: '🎮 Your Vibe: GAMING CULTURE', products: [2, 7, 12, 3] },
};

function handleMatchUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById('match-photo');
    img.src = e.target.result;
    img.style.display = 'block';
    document.getElementById('match-placeholder').style.display = 'none';
    runStyleMatch();
  };
  reader.readAsDataURL(file);
}

function runStyleMatch() {
  const resultsEl = document.getElementById('match-results');
  resultsEl.style.display = 'block';
  resultsEl.innerHTML = `
    <div class="match-loading">
      <div class="match-spinner"></div>
      <p>Analyzing your style DNA...</p>
    </div>`;

  // Simulated AI analysis with delay
  const vibes = Object.keys(STYLE_MATCHES);
  const chosen = STYLE_MATCHES[vibes[Math.floor(Math.random() * vibes.length)]];

  setTimeout(() => {
    const matchedProducts = chosen.products.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
    resultsEl.innerHTML = `
      <div class="match-result-label">${chosen.label}</div>
      <div class="match-result-products">
        ${matchedProducts.map(p => `
          <div class="match-result-card" onclick="openProductModal(${p.id})">
            <div class="mrc-emoji">${p.emoji}</div>
            <div class="mrc-name">${p.name}</div>
            <div class="mrc-price">₹${p.price}</div>
          </div>
        `).join('')}
      </div>
      <button class="btn-primary" style="width:100%;margin-top:12px;font-size:.8rem" onclick="scrollToSection('clothing-section')">SEE ALL STYLES →</button>`;
  }, 2200);
}

/* ──────────────────────────────────────
   COUNTDOWN
────────────────────────────────────── */
function initCountdown() {
  const end = Date.now() + (23 * 3600 + 47 * 60 + 12) * 1000;
  function tick() {
    const diff = Math.max(0, end - Date.now());
    const fmt = n => String(Math.floor(n)).padStart(2,'0');
    const hEl = document.getElementById('cd-h');
    const mEl = document.getElementById('cd-m');
    const sEl = document.getElementById('cd-s');
    if (hEl) hEl.textContent = fmt(diff / 3600000);
    if (mEl) mEl.textContent = fmt((diff % 3600000) / 60000);
    if (sEl) sEl.textContent = fmt((diff % 60000) / 1000);
  }
  tick();
  setInterval(tick, 1000);
}

/* ──────────────────────────────────────
   NEWSLETTER
────────────────────────────────────── */
function subscribeNewsletter() {
  const email = document.getElementById('email-input').value.trim();
  const msg = document.getElementById('newsletter-msg');
  if (!email || !email.includes('@')) {
    msg.textContent = 'Please enter a valid email.';
    msg.style.color = 'var(--red)';
    return;
  }
  msg.textContent = '🔥 You\'re in the fam! Early drops incoming.';
  msg.style.color = 'var(--lime)';
  document.getElementById('email-input').value = '';
}

/* ──────────────────────────────────────
   REVEAL ON SCROLL
────────────────────────────────────── */
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(el => { if (el.isIntersecting) { el.target.classList.add('visible'); observer.unobserve(el.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────
   DRAG & DROP FOR MATCH UPLOAD
────────────────────────────────────── */
function initMatchDragDrop() {
  const area = document.getElementById('match-preview-area');
  if (!area) return;
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => {
    e.preventDefault();
    area.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const input = document.getElementById('match-upload-input');
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      handleMatchUpload({ target: input });
    }
  });
}

/* ──────────────────────────────────────
   HELPERS
────────────────────────────────────── */
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
function scrollToSection(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }

let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show', 'toast-success');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show', 'toast-success'), 2800);
}

// Close modals on outside click
document.addEventListener('click', e => {
  if (e.target === document.getElementById('product-modal')) closeProductModal();
  if (e.target === document.getElementById('tee-builder-modal')) closeTeeBuilder();
  if (e.target === document.getElementById('checkout-modal')) closeCheckout();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeProductModal(); closeTeeBuilder(); closeCheckout(); closeSearch(); }
});

/* ──────────────────────────────────────
   INIT
────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  initThemeToggle();
  startIntro();
  initNavbar();
  initMobileMenu();
  initSearch();
  initCart();
  initWishlist();
  initCountdown();
  initVoiceSearch();
  initMatchDragDrop();

  await loadProducts();
  initFilters();

  renderTrending();
  renderClothing();
  renderPosters();

  updateCartUI();
  updateWishlistUI();

  // Mark all section headers for reveal
  document.querySelectorAll('.section-title,.section-subtitle,.section-eyebrow,.category-strip,.custom-tee-banner,.newsletter-box,.community-card,.limited-banner').forEach(el => {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
  });

  setTimeout(initReveal, 200);

  // Stagger product cards
  document.querySelectorAll('.products-grid .product-card,.posters-grid .poster-card').forEach((card, i) => {
    card.style.transitionDelay = `${(i % 4) * 0.06}s`;
  });
});
