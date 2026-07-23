/* ==========================================================================
   "Tac" Ultra-Luxury 5-Star Hotel - Interactive Application Logic
   ========================================================================== */

// Rooms Master Database
const ROOMS_DATA = {
  'royal-penthouse': {
    id: 'royal-penthouse',
    name: 'Royal Penthouse Suite',
    price: 1200,
    size: '180 m²',
    bed: '1 Royal King Bed',
    view: '360° Panoramik Dəniz Və Şəhər Mənzərəsi',
    image: './assets/cat.jpg',
    description: 'Tac hotelinin ən yüksək mərtəbəsində yerləşən bu royal penthouse 24/7 personal butler xidməti, xüsusi açıq hava terrasındakı dəniz mənzərəli cakuzi və Hermes luxury hamam ləvazimatları ilə təmin olunub.',
    amenities: ['24/7 Personal Butler', 'Özəl Terras Və Cakuzi', 'Hermes Luxury Amenities', 'Şəxsi Şərab Kolleksiyası', 'VIP Helipad Girişi', 'Pazı Çıxış Və Giriş']
  },
  'executive-suite': {
    id: 'executive-suite',
    name: 'Executive Suite',
    price: 650,
    size: '95 m²',
    bed: '1 Super King Bed',
    view: 'Dəniz Və Park Mənzərəsi',
    image: './assets/tac_executive_suite.jpg',
    description: 'Zərif dizayn olunmuş geniş qonaq otağı, xüsusi mərkəzi iş masası, minibar dəsti və ultra-sürətli Wi-Fi ilə biznes və istirahət üçün ideal mühit.',
    amenities: ['Geniş Qonaq Salonu', 'Premium Minibar', '55" OLED OLED TV', '24/7 Otaq Xidməti', 'Eksklüziv Nespresso Maşını']
  },
  'crown-villa': {
    id: 'crown-villa',
    name: 'Crown Presidential Villa',
    price: 1800,
    size: '350 m²',
    bed: '3 King Bedrooms',
    view: 'Özəl Çimərlik Və Bağça',
    image: './assets/tac_hotel_hero.jpg',
    description: 'Tamamilə müstəqil lüks villa, özəl qızdırılan hovuz, şəxsi çimərlik sahəsi və şəxsi aşpaz xidməti.',
    amenities: ['Özəl Qızdırılan Hovuz', 'Şəxsi Aşpaz Xidməti', 'Müstəqil Giriş', 'Lüks Avtomobil Qarajı', 'Sauna Və Buxar Otağı']
  },
  'deluxe-suite': {
    id: 'deluxe-suite',
    name: 'Deluxe Sea View Suite',
    price: 450,
    size: '65 m²',
    bed: '1 King Və Ya 2 Twin Beds',
    view: 'Dəniz Mənzərəsi',
    image: './assets/tac_executive_suite.jpg',
    description: 'Balkonlu geniş dəniz mənzərəli suit otaq. Zərif məxməri mebel və komfortlu yataq dəsti.',
    amenities: ['Dəniz Mənzərəli Balkon', 'Smart İqlim Nəzarəti', 'Lüks Hamam Xalatları', 'Minibar']
  }
};

// Global App State
let state = {
  currentUser: JSON.parse(localStorage.getItem('tac_user')) || null,
  pendingAction: null,
  activeDraft: {
    checkin: '',
    checkout: '',
    nights: 1,
    roomTypeId: 'executive-suite',
    roomName: 'Executive Suite',
    roomPrice: 650,
    roomsCount: 1,
    adults: 2,
    children: 0,
    breakfast: false,
    transfer: false,
    spa: false,
    totalPrice: 650,
    specialRequests: ''
  },
  selectedVehicle: {
    type: 'vip-sedan',
    name: 'VIP Executive Sedan',
    price: 120,
    airport: '',
    flight: '',
    time: '',
    pickupName: ''
  }
};

// Initialize Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initDates();
  initHeaderScroll();
  updateUserBadgeUI();
  calculatePrice();
});

// Initialize Date Picker Controls
function initDates() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const checkinInput = document.getElementById('checkin-date');
  const checkoutInput = document.getElementById('checkout-date');

  const todayStr = formatDateForInput(today);
  const tomorrowStr = formatDateForInput(tomorrow);

  checkinInput.min = todayStr;
  checkinInput.value = todayStr;

  checkoutInput.min = tomorrowStr;
  checkoutInput.value = tomorrowStr;

  state.activeDraft.checkin = todayStr;
  state.activeDraft.checkout = tomorrowStr;
}

function formatDateForInput(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Header Scroll Effect
function initHeaderScroll() {
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

// Update User UI Status
function updateUserBadgeUI() {
  const badgeText = document.getElementById('user-badge-text');
  if (state.currentUser) {
    badgeText.textContent = `${state.currentUser.firstName} (${state.currentUser.points || 0} pts)`;
  } else {
    badgeText.textContent = 'Giriş / Qeydiyyat';
  }
}

// Counter Updates (+ / -)
function updateCounter(type, change) {
  if (type === 'rooms') {
    state.activeDraft.roomsCount = Math.max(1, state.activeDraft.roomsCount + change);
    document.getElementById('counter-rooms').textContent = state.activeDraft.roomsCount;
  } else if (type === 'adults') {
    state.activeDraft.adults = Math.max(1, state.activeDraft.adults + change);
    document.getElementById('counter-adults').textContent = state.activeDraft.adults;
  } else if (type === 'children') {
    state.activeDraft.children = Math.max(0, state.activeDraft.children + change);
    document.getElementById('counter-children').textContent = state.activeDraft.children;
  }
  calculatePrice();
}

// Live Price Calculator
function calculatePrice(scrollToResult = false) {
  const checkinVal = document.getElementById('checkin-date').value;
  const checkoutVal = document.getElementById('checkout-date').value;
  const roomSelect = document.getElementById('room-type-select');
  const selectedOption = roomSelect.options[roomSelect.selectedIndex];
  
  const roomPrice = parseFloat(selectedOption.getAttribute('data-price')) || 650;
  const roomTypeId = roomSelect.value;
  const roomName = ROOMS_DATA[roomTypeId] ? ROOMS_DATA[roomTypeId].name : selectedOption.text.split('(')[0].trim();

  // Date difference calculation
  const date1 = new Date(checkinVal);
  const date2 = new Date(checkoutVal);
  
  let nights = 1;
  if (!isNaN(date1) && !isNaN(date2)) {
    const diffTime = date2.getTime() - date1.getTime();
    nights = Math.max(1, Math.ceil(diffTime / (1000 * 3600 * 24)));
  }

  // Extras
  const bfast = document.getElementById('extra-breakfast').checked;
  const transfer = document.getElementById('extra-transfer').checked;
  const spa = document.getElementById('extra-spa').checked;

  // Total Math
  let roomSubtotal = roomPrice * state.activeDraft.roomsCount * nights;
  let breakfastTotal = bfast ? (45 * state.activeDraft.adults * nights) : 0;
  let transferTotal = transfer ? 120 : 0;
  let spaTotal = spa ? 80 : 0;

  let grandTotal = roomSubtotal + breakfastTotal + transferTotal + spaTotal;

  // Save to State
  state.activeDraft.checkin = checkinVal;
  state.activeDraft.checkout = checkoutVal;
  state.activeDraft.nights = nights;
  state.activeDraft.roomTypeId = roomTypeId;
  state.activeDraft.roomName = roomName;
  state.activeDraft.roomPrice = roomPrice;
  state.activeDraft.breakfast = bfast;
  state.activeDraft.transfer = transfer;
  state.activeDraft.spa = spa;
  state.activeDraft.totalPrice = grandTotal;

  // Update Result DOM Elements
  document.getElementById('calc-nights').textContent = nights;
  document.getElementById('calc-total-price').textContent = `${grandTotal} ₼`;
  document.getElementById('calc-breakdown-text').textContent = `${roomName} • ${state.activeDraft.adults} Qonaq • ${nights} Gecə • Vergilər Və Xidmət Haqqı Daxildir`;

  if (scrollToResult) {
    document.getElementById('calc-result-box').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Discover Filter Tabs
function filterDiscover(category) {
  const tabs = document.querySelectorAll('.tabs-nav .tab-btn');
  tabs.forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');

  const cards = document.querySelectorAll('.discover-item');
  cards.forEach(card => {
    if (category === 'all') {
      card.style.display = 'block';
    } else {
      if (card.classList.contains(`category-${category}`)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    }
  });
}

// Room Detail Modal
function openRoomDetailModal(roomId) {
  const room = ROOMS_DATA[roomId];
  if (!room) return;

  const content = document.getElementById('room-modal-content');
  content.innerHTML = `
    <div style="position: relative;">
      <img src="${room.image}" alt="${room.name}" style="width: 100%; height: 320px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 20px;">
      <span class="card-price-badge" style="top: 16px; right: 16px; bottom: auto; font-size: 1.1rem;">${room.price} ₼ / gecə</span>
    </div>

    <h2 class="font-serif" style="color: var(--gold-light); font-size: 1.8rem; margin-bottom: 12px;">${room.name}</h2>
    <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 0.95rem;">${room.description}</p>

    <div class="card-specs" style="margin-bottom: 24px; font-size: 0.9rem;">
      <span>📐 Sahə: ${room.size}</span>
      <span>🛏️ Çarpayı: ${room.bed}</span>
      <span>🌊 Mənzərə: ${room.view}</span>
    </div>

    <h4 class="font-serif" style="color: var(--gold-primary); margin-bottom: 12px;">Otaq Üstünlükləri & Xidmətlər:</h4>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 28px;">
      ${room.amenities.map(item => `<div style="color: var(--text-champagne); font-size: 0.88rem;">✨ ${item}</div>`).join('')}
    </div>

    <div style="display: flex; gap: 16px;">
      <button class="btn btn-primary" style="flex: 1;" onclick="selectRoomFromModal('${room.id}')">Bu Otağı Bron Et (${room.price} ₼)</button>
      <button class="btn btn-outline" onclick="closeModal('room-detail-modal')">Bağla</button>
    </div>
  `;

  openModal('room-detail-modal');
}

function selectRoomFromModal(roomId) {
  closeModal('room-detail-modal');
  document.getElementById('room-type-select').value = roomId;
  calculatePrice();
  proceedToBookingFromCalc();
}

// VIP Transfer Selection Logic
function selectVehicle(type, price, element) {
  const cards = document.querySelectorAll('.vehicle-card');
  cards.forEach(c => c.classList.remove('selected'));
  element.classList.add('selected');

  const radio = element.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;

  state.selectedVehicle.type = type;
  state.selectedVehicle.price = price;
  state.selectedVehicle.name = element.querySelector('.vehicle-title').textContent;

  document.getElementById('transfer-fields').classList.add('active');
}

function confirmVIPTransferBooking() {
  const airport = document.getElementById('tr-airport').value.trim();
  const flight = document.getElementById('tr-flight').value.trim();
  const time = document.getElementById('tr-time').value.trim();
  const name = document.getElementById('tr-name').value.trim();

  if (!airport || !flight || !time || !name) {
    alert('Zəhmət olmasa bütün məcburi VIP transfer sahələrini doldurun: Hava limanı, Uçuş No, Gəliş saatı və Qarşılama adı.');
    return;
  }

  state.selectedVehicle.airport = airport;
  state.selectedVehicle.flight = flight;
  state.selectedVehicle.time = time;
  state.selectedVehicle.pickupName = name;

  // Add transfer to active draft
  state.activeDraft.transfer = true;
  state.activeDraft.totalPrice += state.selectedVehicle.price;

  alert(`VIP Transfer təsdiqləndi: ${state.selectedVehicle.name} (${state.selectedVehicle.price} ₼).\nQarşılama Lövhəsi: "${name}"`);
  proceedToBookingFromCalc();
}

// Event & Dining Handlers
function bookEvent(eventName) {
  alert(`"${eventName}" üçün 1 bilet ayrıldı. Ödəniş və təsdiq üçün rezervasiya səhifəsinə keçid edilir.`);
  state.activeDraft.roomName = `Tədbir Bileti: ${eventName}`;
  state.activeDraft.totalPrice = 250;
  proceedToBookingFromCalc();
}

function bookTableModal(restaurantName) {
  alert(`"${restaurantName}" restoranında masa rezervasiyası üçün sorğunuz qəbul edildi. Tezliklə sizinlə əlaqə saxlanılacaqdır.`);
}

function selectGiftAmount(amount) {
  state.activeDraft.roomName = `Rəqəmsal Gift Card (${amount} ₼)`;
  state.activeDraft.totalPrice = amount;
  proceedToBookingFromCalc();
}

function openGiftModal() {
  selectGiftAmount(500);
}

// Authentication & Modal Handlers
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function openAuthModal() {
  openModal('auth-modal');
}

function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const loginBtn = document.getElementById('tab-login-btn');
  const regBtn = document.getElementById('tab-reg-btn');

  if (tab === 'login') {
    loginForm.style.display = 'block';
    regForm.style.display = 'none';
    loginBtn.classList.add('active');
    regBtn.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    regForm.style.display = 'block';
    regBtn.classList.add('active');
    loginBtn.classList.remove('active');
  }
}

// Handle Login
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  
  state.currentUser = {
    firstName: email.split('@')[0],
    email: email,
    points: 150,
    tier: 'Gold Crown'
  };

  localStorage.setItem('tac_user', JSON.stringify(state.currentUser));
  updateUserBadgeUI();
  closeModal('auth-modal');

  if (state.pendingAction) {
    const action = state.pendingAction;
    state.pendingAction = null;
    action();
  }
}

// Handle Register
function handleRegister(event) {
  event.preventDefault();
  const fname = document.getElementById('reg-fname').value;
  const lname = document.getElementById('reg-lname').value;
  const phone = document.getElementById('reg-phone').value;
  const email = document.getElementById('reg-email').value;

  state.currentUser = {
    firstName: fname,
    lastName: lname,
    phone: phone,
    email: email,
    points: 500, // Welcome bonus points!
    tier: 'Silver Crown'
  };

  localStorage.setItem('tac_user', JSON.stringify(state.currentUser));
  updateUserBadgeUI();
  closeModal('auth-modal');

  alert(`Xoş gəldiniz, ${fname} ${lname}! Qeydiyyatınız uğurla tamamlandı və sizə 500 Crown loyallıq xalı hədiyyə edildi.`);

  if (state.pendingAction) {
    const action = state.pendingAction;
    state.pendingAction = null;
    action();
  }
}

// Proceed to Booking Workflow with Mandatory Registration Gate
function proceedToBookingFromCalc() {
  if (!state.currentUser) {
    state.pendingAction = () => openCheckoutModal();
    switchAuthTab('register');
    openAuthModal();
  } else {
    openCheckoutModal();
  }
}

// Checkout & Payment Modal
function openCheckoutModal() {
  const summaryText = `${state.activeDraft.roomName} • ${state.activeDraft.nights} Gecə • ${state.activeDraft.adults} Qonaq`;
  document.getElementById('checkout-summary-text').textContent = summaryText;
  document.getElementById('checkout-summary-total').textContent = `${state.activeDraft.totalPrice} ₼`;
  document.getElementById('pay-btn-amount').textContent = `${state.activeDraft.totalPrice} ₼`;

  if (state.currentUser) {
    document.getElementById('pay-card-name').value = `${state.currentUser.firstName} ${state.currentUser.lastName || ''}`.toUpperCase().trim();
    document.getElementById('card-holder-disp').textContent = document.getElementById('pay-card-name').value || 'AD SOYAD';
  }

  openModal('checkout-modal');
}

// Credit Card Live Formatting
function formatCardNum(input) {
  let val = input.value.replace(/\D/g, '');
  val = val.substring(0, 16);
  let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
  input.value = formatted;

  document.getElementById('card-num-disp').textContent = formatted || '•••• •••• •••• ••••';
}

function formatCardExp(input) {
  let val = input.value.replace(/\D/g, '');
  val = val.substring(0, 4);
  if (val.length >= 3) {
    input.value = val.substring(0, 2) + '/' + val.substring(2);
  } else {
    input.value = val;
  }
  document.getElementById('card-exp-disp').textContent = input.value || 'MM/YY';
}

function updateCardPreview() {
  const name = document.getElementById('pay-card-name').value;
  document.getElementById('card-holder-disp').textContent = name.toUpperCase() || 'AD SOYAD';
}

// Process Payment & Complete Booking
function processPayment(event) {
  event.preventDefault();

  const specialReq = document.getElementById('special-requests').value;
  state.activeDraft.specialRequests = specialReq;

  // Show loading on button
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '⚡ Ödəniş Həyata Keçirilir...';

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
    closeModal('checkout-modal');

    // Generate unique confirmation code
    const refCode = 'REF-TAC-' + Math.floor(10000 + Math.random() * 90000);
    document.getElementById('conf-ref-code').textContent = refCode;

    // Add Loyalty points to user
    if (state.currentUser) {
      const addedPoints = Math.floor(state.activeDraft.totalPrice / 10);
      state.currentUser.points = (state.currentUser.points || 0) + addedPoints;
      localStorage.setItem('tac_user', JSON.stringify(state.currentUser));
      updateUserBadgeUI();
    }

    // Save reservation history
    const history = JSON.parse(localStorage.getItem('tac_reservations')) || [];
    history.push({
      refCode: refCode,
      date: new Date().toISOString(),
      booking: { ...state.activeDraft },
      user: { ...state.currentUser }
    });
    localStorage.setItem('tac_reservations', JSON.stringify(history));

    // Open Confirmation Success Modal
    openModal('confirmation-modal');
  }, 1500);
}

/* ==========================================================================
   360° Interactive Virtual Panorama Viewer Engine
   ========================================================================== */
let panoramaState = {
  activeRoomId: 'royal-penthouse',
  currentX: 0,
  isDragging: false,
  startX: 0,
  autoRotate: true,
  animId: null
};

function open360Panorama(roomId) {
  const room = ROOMS_DATA[roomId] || ROOMS_DATA['royal-penthouse'];
  panoramaState.activeRoomId = roomId;
  panoramaState.currentX = 0;
  panoramaState.autoRotate = true;

  document.getElementById('pano-modal-title').textContent = `${room.name} - 360° Virtual Tur`;
  document.getElementById('pano-modal-specs').textContent = `${room.size} • ${room.bed} • ${room.view}`;
  
  const track = document.getElementById('panorama-track');
  // Duplicate panoramic image 3 times for seamless 360 rotation loop
  track.innerHTML = `
    <img src="${room.image}" alt="${room.name}">
    <img src="${room.image}" alt="${room.name}">
    <img src="${room.image}" alt="${room.name}">
  `;

  openModal('panorama-modal');
  initPanoramaDragSystem();
  startPanoramaAutoRotate();
}

function initPanoramaDragSystem() {
  const viewport = document.getElementById('panorama-viewport');
  const track = document.getElementById('panorama-track');

  if (!viewport || viewport.dataset.bound === 'true') return;
  viewport.dataset.bound = 'true';

  const onDragStart = (e) => {
    panoramaState.isDragging = true;
    panoramaState.startX = (e.touches ? e.touches[0].clientX : e.clientX) - panoramaState.currentX;
  };

  const onDragMove = (e) => {
    if (!panoramaState.isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    panoramaState.currentX = clientX - panoramaState.startX;
    updatePanoramaTransform();
  };

  const onDragEnd = () => {
    panoramaState.isDragging = false;
  };

  viewport.addEventListener('mousedown', onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);

  viewport.addEventListener('touchstart', onDragStart, { passive: true });
  window.addEventListener('touchmove', onDragMove, { passive: true });
  window.addEventListener('touchend', onDragEnd);
}

function updatePanoramaTransform() {
  const track = document.getElementById('panorama-track');
  if (!track) return;
  
  // Wrap around seamlessly
  const singleWidth = track.clientWidth / 3;
  if (panoramaState.currentX < -singleWidth) {
    panoramaState.currentX += singleWidth;
    if (panoramaState.isDragging) panoramaState.startX += singleWidth;
  } else if (panoramaState.currentX > 0) {
    panoramaState.currentX -= singleWidth;
    if (panoramaState.isDragging) panoramaState.startX -= singleWidth;
  }

  track.style.transform = `translateX(${panoramaState.currentX}px)`;
}

function startPanoramaAutoRotate() {
  if (panoramaState.animId) cancelAnimationFrame(panoramaState.animId);

  function loop() {
    if (panoramaState.autoRotate && !panoramaState.isDragging) {
      panoramaState.currentX -= 1.2;
      updatePanoramaTransform();
    }
    panoramaState.animId = requestAnimationFrame(loop);
  }
  loop();
}

function togglePanoramaAutoRotate() {
  panoramaState.autoRotate = !panoramaState.autoRotate;
}

function resetPanoramaView() {
  panoramaState.currentX = 0;
  updatePanoramaTransform();
}

function proceedFromPanoModal() {
  closeModal('panorama-modal');
  selectRoomFromModal(panoramaState.activeRoomId);
}

