const meals = [
  { id: 'pandhal', restaurant: 'Pandhal Cake Shop', title: 'Surprise Bakery Bag', icon: '🥐', art: 'art-bread', tag: 'BAKERY RESCUE', price: 99, original: 349, distance: '0.8 km', pickup: '8:30–9:15 PM', qty: '3 bags left', veg: true, campus: false, free: false, category: 'Bakery', detail: 'A just-baked mix of pastries and savoury treats, packed fresh at closing.' },
  { id: 'bowl', restaurant: 'Green Bowl Kitchen', title: 'Garden Harvest Bowl', icon: '🥗', art: 'art-meal', tag: 'PURE VEG', price: 89, original: 299, distance: '1.1 km', pickup: '8:15–9:00 PM', qty: '5 bowls left', veg: true, campus: true, free: false, category: 'Veg bowls', detail: 'A hearty seasonal vegetable bowl with grains and a house-made dressing.' },
  { id: 'gurdwara', restaurant: 'Gurdwara Community Kitchen', title: 'Community Meal Pack', icon: '🌾', art: 'art-free', tag: '100% FREE', price: 0, original: 0, distance: '0.4 km', pickup: 'Ready for pickup', qty: '18 packs available', veg: true, campus: false, free: true, category: 'Community meal', detail: 'A nourishing, freshly prepared vegetarian meal shared by the community kitchen.' },
  { id: 'curry', restaurant: 'Aiyappa Bhavan', title: 'Homestyle Dinner Box', icon: '🍛', art: 'art-curry', tag: 'CLOSING DEAL', price: 79, original: 279, distance: '1.6 km', pickup: '8:45–9:30 PM', qty: '4 boxes left', veg: true, campus: false, free: false, category: 'Dinner', detail: 'A comforting rice and curry dinner, made fresh and packed for an easy pickup.' },
  { id: 'campus', restaurant: 'Campus Commons', title: 'Seasonal Meal Box', icon: '🍱', art: 'art-box', tag: 'CAMPUS PICKUP', price: 69, original: 229, distance: '0.6 km', pickup: '8:00–9:00 PM', qty: '7 boxes left', veg: true, campus: true, free: false, category: 'Campus meal', detail: 'A balanced campus dinner box made with today’s seasonal vegetables.' },
  { id: 'sourdough', restaurant: 'Sourdough House', title: 'Evening Bake Box', icon: '🥖', art: 'art-snack', tag: 'BAKERY RESCUE', price: 59, original: 199, distance: '1.3 km', pickup: '8:30–9:30 PM', qty: '6 boxes left', veg: true, campus: false, free: false, category: 'Bakery', detail: 'A small selection of the day’s sourdough and bakery favourites.' },
];

const state = { free: false, veg: false, campus: false, under100: false, query: '', view: 'list', selectedMeal: null, payment: 'Google Pay', amount: 25 };
const mealGrid = document.querySelector('#meal-grid');
const searchInput = document.querySelector('#search-food-input');
const mapView = document.querySelector('#map-view');
const emptyState = document.querySelector('#empty-state');
const resultsCount = document.querySelector('#results-count');
const dialog = document.querySelector('#app-dialog');
const dialogContent = document.querySelector('#dialog-content');
const toast = document.querySelector('#toast');

function formatPrice(value) { return value === 0 ? '₹0' : `₹${value}`; }
function visibleMeals() {
  return meals.filter((meal) => {
    const haystack = `${meal.restaurant} ${meal.title} ${meal.category} ${meal.detail}`.toLowerCase();
    return (!state.free || meal.free) && (!state.veg || meal.veg) && (!state.campus || meal.campus) && (!state.under100 || meal.price < 100) && (!state.query || haystack.includes(state.query));
  });
}

function renderMeals() {
  const filtered = visibleMeals();
  resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'fresh rescue' : 'fresh rescues'}`;
  emptyState.hidden = filtered.length !== 0;
  mealGrid.hidden = state.view === 'map' || filtered.length === 0;
  mapView.hidden = state.view !== 'map' || filtered.length === 0;
  mapView.querySelectorAll('[data-map-meal]').forEach((pin) => {
    pin.hidden = !filtered.some((meal) => meal.id === pin.dataset.mapMeal);
  });
  if (!filtered.length) return;

  mealGrid.innerHTML = filtered.map((meal) => `
    <article class="meal-card">
      <div class="meal-art ${meal.art}">
        <span class="${meal.free ? 'free-badge' : 'deal-badge'}">${meal.tag}</span>
        <button class="save-button" type="button" aria-label="Save ${meal.title}" aria-pressed="false" data-save="${meal.id}">♡</button>
        <span class="meal-art-emoji" aria-hidden="true">${meal.icon}</span>
        <span class="art-label">${meal.category.toUpperCase()}</span>
      </div>
      <div class="meal-info">
        <div class="meal-topline"><span class="meal-restaurant">${meal.restaurant}</span><span class="meal-distance">⌖ ${meal.distance}</span></div>
        <h3>${meal.title}</h3>
        <div class="meal-meta"><span><span class="veg-mark"></span> ${meal.veg ? 'Pure veg' : 'Mixed'}</span><span class="dot-sep">•</span><span>${meal.qty}</span></div>
        <div class="pickup-row"><span class="pickup-time"><span class="clock-icon">◷</span><b>${meal.pickup}</b></span><span>${meal.free ? 'No charge' : '−' + Math.round((1 - meal.price / meal.original) * 100) + '% off'}</span></div>
        <div class="meal-bottom"><div class="price-block"><small>${meal.free ? 'COMMUNITY MEAL' : 'RESCUE PRICE'}</small><span class="price">${formatPrice(meal.price)}</span>${meal.original ? `<span class="old-price">₹${meal.original}</span>` : ''}</div><button class="button ${meal.free ? 'button-free' : 'button-primary'}" type="button" data-reserve="${meal.id}">${meal.free ? 'Reserve free' : 'Reserve meal'} ↗</button></div>
      </div>
    </article>`).join('');
}

function syncFilters() {
  document.querySelector('#filter-donated-btn').setAttribute('aria-pressed', String(state.free));
  document.querySelector('#filter-veg-btn').setAttribute('aria-pressed', String(state.veg));
  document.querySelector('#filter-campus-btn').setAttribute('aria-pressed', String(state.campus));
  document.querySelector('#filter-price-btn').setAttribute('aria-pressed', String(state.under100));
  document.querySelector('#view-list-toggle').classList.toggle('is-selected', state.view === 'list');
  document.querySelector('#view-map-toggle').classList.toggle('is-selected', state.view === 'map');
  document.querySelector('#view-list-toggle').setAttribute('aria-pressed', String(state.view === 'list'));
  document.querySelector('#view-map-toggle').setAttribute('aria-pressed', String(state.view === 'map'));
  renderMeals();
}

function openDialog(content) {
  dialogContent.innerHTML = content;
  if (!dialog.open) dialog.showModal();
}
function closeDialog() { dialog.close(); }
function dialogHeader(kicker, title) {
  return `<div class="dialog-head"><div><p class="dialog-kicker">${kicker}</p><h2 id="dialog-title">${title}</h2></div><button class="dialog-close" type="button" data-close aria-label="Close dialog">×</button></div>`;
}
function artThumb(meal) { return `<div class="meal-art ${meal.art}"><span class="meal-art-emoji">${meal.icon}</span></div>`; }

function openReservation(id) {
  const meal = meals.find((item) => item.id === id);
  if (!meal) return;
  state.selectedMeal = meal;
  if (meal.free) {
    openDialog(`${dialogHeader('COMMUNITY FOOD RESCUE', 'Reserve a free meal')}
      <p class="dialog-copy">Your reservation helps the kitchen plan every pack with care. Choose a pickup name to continue.</p>
      <div class="dialog-meal">${artThumb(meal)}<span><b>${meal.title}</b><small>${meal.restaurant} · ${meal.qty}</small><small>${meal.pickup}</small></span></div>
      <label class="form-field">Name for pickup<input id="pickup-name" type="text" autocomplete="name" placeholder="Your name" required /></label>
      <button class="button button-primary dialog-full" type="button" data-confirm-free>Reserve free meal ↗</button>
      <p class="dialog-footnote">There is no charge for community meals.</p>`);
  } else {
    const total = meal.price + 5 + 2;
    openDialog(`${dialogHeader('FRESH SURPLUS RESCUE', 'Reserve for pickup')}
      <div class="dialog-meal">${artThumb(meal)}<span><b>${meal.title}</b><small>${meal.restaurant} · ${meal.distance}</small><small>Pickup ${meal.pickup}</small></span></div>
      <p class="dialog-copy">Packed fresh in an eco-friendly container. Please arrive within the pickup window.</p>
      <div class="bill-row"><span>Surplus meal</span><b>${formatPrice(meal.price)}</b></div><div class="bill-row"><span>Green operations fee</span><b>₹5</b></div><div class="bill-row"><span>Optional hunger relief contribution</span><b>₹2</b></div><div class="bill-row total"><span>Total due at checkout</span><b>₹${total}</b></div>
      <p class="payment-label">Choose a payment app</p><div class="payment-options"><button class="payment-option is-selected" type="button" data-payment="Google Pay">📱 Google Pay</button><button class="payment-option" type="button" data-payment="PhonePe">🟣 PhonePe</button><button class="payment-option" type="button" data-payment="Paytm / UPI">🟢 Paytm</button></div>
      <button class="button button-primary dialog-full" type="button" data-pay>Continue with ${state.payment} · ₹${total}</button>
      <p class="dialog-footnote">Demo checkout only — no payment will be processed.</p>`);
  }
}

function showPickupPass(meal) {
  const pin = String(Math.floor(100000 + Math.random() * 900000));
  openDialog(`${dialogHeader('RESERVATION CONFIRMED', 'Your meal is waiting')}
    <p class="dialog-copy">Your demo reservation is saved on this page. Show this pickup pass at the kitchen counter during the collection window.</p>
    <div class="pass-card"><span>🌾</span><small>PICKUP PASS · ${meal.restaurant.toUpperCase()}</small><strong>${pin}</strong><p>${meal.title} · ${meal.pickup}</p></div>
    <button class="button button-primary dialog-full" type="button" data-close>Done</button>`);
}

function openSponsor() {
  state.amount = 25;
  openDialog(`${dialogHeader('COMMUNITY SPONSORSHIP', 'Sponsor a meal')}
    <p class="dialog-copy">Help turn a good meal into a shared one. Choose a contribution and we’ll add it to the community meal fund.</p>
    <div class="amount-options">${[25, 50, 100, 250].map((amount, i) => `<button type="button" class="amount-option ${i === 0 ? 'is-selected' : ''}" data-amount="${amount}">₹${amount}</button>`).join('')}</div>
    <div class="dialog-meal"><span class="float-emoji">💛</span><span><b>Every contribution supports a free meal</b><small>Community food fund · ReServe Relief</small></span></div>
    <button class="button button-gold dialog-full" type="button" data-sponsor-confirm>Sponsor ₹25</button>
    <p class="dialog-footnote">Demo only — no money will be collected.</p>`);
}

function openRole(role) {
  const kitchen = role === 'Kitchen Partner';
  const ngo = role === 'NGO Relief Portal';
  const kicker = kitchen ? 'JOIN THE RESCUE NETWORK' : ngo ? 'COMMUNITY RELIEF PARTNER' : 'WELCOME TO RESERVE';
  const title = kitchen ? 'Share your surplus' : ngo ? 'Connect your relief team' : 'Find your next good meal';
  const description = kitchen ? 'Tell us a little about your kitchen. Our team can help you list surplus food for pickup and donation.' : ngo ? 'Register your relief team to receive community meal updates and coordinate collection.' : 'Browse fresh rescue bags and free community meals around your neighborhood.';
  openDialog(`${dialogHeader(kicker, title)}<p class="dialog-copy">${description}</p>
    ${!kitchen && !ngo ? `<div class="dialog-meal"><span class="float-emoji">🥣</span><span><b>Good food, close to home</b><small>Browse meals at ₹0–₹99</small></span></div><a class="button button-primary dialog-full" href="#discovery-section" data-close-link>Explore nearby meals ↗</a>` : `<form id="role-form"><label class="form-field">${kitchen ? 'Kitchen or bakery name' : 'Organization name'}<input name="org" required placeholder="Your organization" /></label><label class="form-field">Contact email<input name="email" type="email" autocomplete="email" required placeholder="you@example.org" /></label>${kitchen ? `<label class="form-field">FSSAI registration number <span style="font-weight:400">(optional for demo)</span><input name="fssai" placeholder="14-digit number" /></label>` : ''}<button class="button button-primary dialog-full" type="submit">Request ${kitchen ? 'kitchen' : 'NGO'} onboarding ↗</button></form><p class="dialog-footnote">Demo form — your details stay in this browser.</p>`}`);
}

function announce(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(announce.timer);
  announce.timer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
}

document.querySelectorAll('[data-sponsor]').forEach((button) => button.addEventListener('click', openSponsor));
document.querySelectorAll('[data-show-free]').forEach((link) => link.addEventListener('click', () => {
  state.free = true;
  syncFilters();
}));
document.querySelectorAll('[data-role]').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.role-button').forEach((item) => item.classList.toggle('is-active', item.dataset.role === button.dataset.role));
  openRole(button.dataset.role);
}));
document.querySelector('#filter-donated-btn').addEventListener('click', () => { state.free = !state.free; syncFilters(); });
document.querySelector('#filter-veg-btn').addEventListener('click', () => { state.veg = !state.veg; syncFilters(); });
document.querySelector('#filter-campus-btn').addEventListener('click', () => { state.campus = !state.campus; syncFilters(); });
document.querySelector('#filter-price-btn').addEventListener('click', () => { state.under100 = !state.under100; syncFilters(); });
document.querySelector('#view-list-toggle').addEventListener('click', () => { state.view = 'list'; syncFilters(); });
document.querySelector('#view-map-toggle').addEventListener('click', () => { state.view = 'map'; syncFilters(); });
document.querySelector('#clear-filters').addEventListener('click', () => { state.free = state.veg = state.campus = state.under100 = false; state.query = ''; searchInput.value = ''; syncFilters(); });
searchInput.addEventListener('input', (event) => { state.query = event.target.value.trim().toLowerCase(); renderMeals(); });
document.querySelector('[data-location]').addEventListener('click', () => announce('Showing sample meals for your community.'));
document.querySelector('#wave-toggle').addEventListener('click', (event) => {
  const active = event.currentTarget.getAttribute('aria-pressed') !== 'true';
  event.currentTarget.setAttribute('aria-pressed', String(active));
  event.currentTarget.closest('.floating-status').classList.toggle('is-off', !active);
  document.querySelector('.status-label').textContent = `3D Wave Grid: ${active ? 'Active' : 'Paused'}`;
  document.querySelector('#relief-grid').classList.toggle('grid-paused', !active);
});

document.addEventListener('click', (event) => {
  const reserveButton = event.target.closest('[data-reserve]');
  if (reserveButton) { openReservation(reserveButton.dataset.reserve); return; }
  const mapButton = event.target.closest('[data-map-meal]');
  if (mapButton) { openReservation(mapButton.dataset.mapMeal); return; }
  const saveButton = event.target.closest('[data-save]');
  if (saveButton) {
    const saved = saveButton.getAttribute('aria-pressed') !== 'true';
    saveButton.setAttribute('aria-pressed', String(saved));
    saveButton.textContent = saved ? '♥' : '♡';
    announce(saved ? 'Meal saved to your list.' : 'Meal removed from your saved list.');
    return;
  }
  if (event.target.closest('[data-close]')) closeDialog();
  if (event.target.closest('[data-close-link]')) closeDialog();
  const paymentButton = event.target.closest('[data-payment]');
  if (paymentButton) {
    state.payment = paymentButton.dataset.payment;
    dialogContent.querySelectorAll('.payment-option').forEach((button) => button.classList.toggle('is-selected', button === paymentButton));
    const total = state.selectedMeal.price + 7;
    dialogContent.querySelector('[data-pay]').textContent = `Continue with ${state.payment} · ₹${total}`;
  }
  const amountButton = event.target.closest('[data-amount]');
  if (amountButton) {
    state.amount = Number(amountButton.dataset.amount);
    dialogContent.querySelectorAll('.amount-option').forEach((button) => button.classList.toggle('is-selected', button === amountButton));
    dialogContent.querySelector('[data-sponsor-confirm]').textContent = `Sponsor ₹${state.amount}`;
  }
  if (event.target.closest('[data-sponsor-confirm]')) {
    const amount = state.amount;
    openDialog(`${dialogHeader('THANK YOU FOR SHARING', 'A meal moves forward')}
      <div class="pass-card"><span>💛</span><small>DEMO SPONSOR PLEDGE</small><strong>₹${amount}</strong><p>Your sample contribution can help provide a free community meal.</p></div>
      <p class="dialog-copy">This demo doesn’t process payments. The donation flow is ready to connect to a secure payment provider.</p><button class="button button-primary dialog-full" type="button" data-close>Done</button>`);
  }
  if (event.target.closest('[data-pay]')) showPickupPass(state.selectedMeal);
  if (event.target.closest('[data-confirm-free]')) {
    const name = dialogContent.querySelector('#pickup-name').value.trim();
    if (!name) { dialogContent.querySelector('#pickup-name').focus(); announce('Add a pickup name to reserve this meal.'); return; }
    showPickupPass(state.selectedMeal);
  }
});

document.addEventListener('submit', (event) => {
  if (event.target.id !== 'role-form') return;
  event.preventDefault();
  const role = document.querySelector('.role-button.is-active')?.dataset.role || 'partner';
  openDialog(`${dialogHeader('REQUEST RECEIVED', 'Thanks for joining us')}
    <div class="success-message">Your demo ${role.toLowerCase()} request is ready. In a live service, the ReServe team would follow up to complete onboarding.</div>
    <button class="button button-primary dialog-full" type="button" data-close>Done</button>`);
});

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchInput.focus(); }
  if (event.key === 'Escape' && dialog.open) closeDialog();
});
dialog.addEventListener('click', (event) => { if (event.target === dialog) closeDialog(); });

function paintGrid() {
  const canvas = document.querySelector('#relief-grid');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0; let height = 0; let animation = 0; let time = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize() {
    width = window.innerWidth; height = Math.max(260, window.innerHeight * .42);
    canvas.width = width * dpr; canvas.height = height * dpr;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw() {
    if (canvas.classList.contains('grid-paused')) { ctx.clearRect(0, 0, width, height); animation = 0; return; }
    ctx.clearRect(0, 0, width, height);
    const horizon = height * .25;
    const rows = 19; const cols = Math.max(16, Math.floor(width / 37));
    for (let r = 0; r <= rows; r++) {
      const depth = r / rows;
      const y = horizon + (height - horizon) * depth * depth;
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const x = (width / cols) * c;
        const wave = Math.sin(c * .44 + time + r * .34) * (depth * 10);
        const py = y + wave;
        if (!c) ctx.moveTo(x, py); else ctx.lineTo(x, py);
      }
      ctx.strokeStyle = `rgba(0, 99, 81, ${.035 + depth * .07})`;
      ctx.lineWidth = .7 + depth * .34;
      ctx.stroke();
    }
    for (let c = -2; c <= cols + 2; c++) {
      ctx.beginPath();
      for (let r = 0; r <= rows; r++) {
        const depth = r / rows;
        const spread = 1 + depth * 1.22;
        const x = width / 2 + (c - cols / 2) * (width / cols) * spread;
        const y = horizon + (height - horizon) * depth * depth + Math.sin(c * .44 + time + r * .34) * depth * 10;
        if (!r) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(201, 161, 77, .13)'; ctx.lineWidth = .65; ctx.stroke();
    }
    for (let r = 2; r <= rows; r += 2) {
      const depth = r / rows;
      const y = horizon + (height - horizon) * depth * depth;
      for (let c = 0; c <= cols; c += 2) {
        const x = (width / cols) * c;
        const radius = 1 + depth * 1.3;
        ctx.beginPath(); ctx.arc(x, y + Math.sin(c * .44 + time + r * .34) * depth * 10, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(208, 163, 73, ${.13 + depth * .28})`; ctx.fill();
      }
    }
    time += .0036;
    if (!reducedMotion) animation = requestAnimationFrame(draw);
  }
  resize(); draw();
  window.addEventListener('resize', () => { resize(); if (!reducedMotion && !animation) animation = requestAnimationFrame(draw); });
}

renderMeals();
paintGrid();
