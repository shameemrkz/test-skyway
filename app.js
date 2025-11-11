/* app.js
   Complete front-end logic:
   - inject tour cards
   - open modal with details
   - validate booking form
   - save bookings to localStorage
*/

(() => {
  // Sample tour data (you can replace images with your own)
  const tours = [
    {
      id: 'beach001',
      title: 'Tropical Beach Escape — Maldives',
      desc: '5 days of sun, snorkel, and luxury overwater bungalows. Includes transfers & breakfast.',
      days: 5,
      price: 1299,
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      tags: ['Beach', 'Relaxation', 'Luxury']
    },
    {
      id: 'mountain001',
      title: 'Alpine Mountain Trek — Rockies',
      desc: '3-day guided trek through alpine meadows and lakes. Moderate difficulty, expert guide.',
      days: 3,
      price: 699,
      img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
      tags: ['Mountain', 'Hiking', 'Adventure']
    },
    {
      id: 'city001',
      title: 'City Highlights — New York Skyline Tour',
      desc: 'One-day curated city tour with rooftop views, local food stops and cultural highlights.',
      days: 1,
      price: 119,
      img: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
      tags: ['City', 'Culture', 'Photography']
    }
  ];

  // DOM references
  const toursGrid = document.getElementById('tours-grid');
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const bookingForm = document.getElementById('booking-form');
  const bookingMessage = document.getElementById('booking-message');
  const btnBookHeader = document.getElementById('btn-book');
  const ctaBook = document.getElementById('cta-book');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const nav = document.querySelector('.nav');
  const yearSpan = document.getElementById('year');

  // Insert current year
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Render tours
  function renderTours() {
    toursGrid.innerHTML = '';
    tours.forEach(t => {
      const el = document.createElement('article');
      el.className = 'tour-card card';
      el.innerHTML = `
        <img src="${t.img}" alt="${escapeHtml(t.title)}">
        <div class="card-body">
          <h4>${escapeHtml(t.title)}</h4>
          <p>${escapeHtml(t.desc)}</p>
          <div class="tour-meta">
            <div>⏱ ${t.days} day${t.days>1 ? 's' : ''}</div>
            <div> • </div>
            <div>💲${t.price.toLocaleString()}</div>
          </div>
          <div class="tour-actions">
            <button class="btn btn-ghost btn-detail" data-id="${t.id}">View</button>
            <button class="btn btn-primary btn-start-book" data-id="${t.id}">Book</button>
          </div>
        </div>
      `;
      toursGrid.appendChild(el);
    });
  }

  // Safety helper
  function escapeHtml(s){ return String(s).replace(/[&<>"'`=\/]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'}[c]; }); }

  // Find tour by id
  function findTour(id){ return tours.find(t => t.id === id); }

  // Show modal
  function openModal(tourId) {
    const tour = findTour(tourId);
    if (!tour) return;
    // build detail
    const container = document.getElementById('tour-detail');
    container.innerHTML = `
      <img src="${tour.img}" alt="${escapeHtml(tour.title)}">
      <h4 style="margin:8px 0">${escapeHtml(tour.title)}</h4>
      <p style="color:var(--muted);margin:0 0 10px">${escapeHtml(tour.desc)}</p>
      <div style="color:var(--muted); font-weight:600">Duration: ${tour.days} day(s) • From $${tour.price}</div>
    `;
    // set hidden tourId
    const hidden = bookingForm.querySelector('input[name="tourId"]');
    hidden.value = tour.id;
    // clear previous
    bookingMessage.classList.add('hidden');
    bookingForm.classList.remove('hidden');
    // show modal
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    // focus
    bookingForm.querySelector('input[name="fullname"]').focus();
  }

  // Close modal
  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
  }

  // Save booking (localStorage)
  function saveBooking(obj) {
    const key = 'skyway_bookings_v1';
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift(obj);
    localStorage.setItem(key, JSON.stringify(existing));
  }

  // Simple client-side validation helpers
  function validateBooking(form) {
    const fullname = form.fullname.value.trim();
    const email = form.email.value.trim();
    const date = form.date.value;
    const guests = Number(form.guests.value);
    if (!fullname || fullname.length < 2) return 'Please provide your full name.';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please provide a valid email address.';
    if (!date) return 'Please choose a preferred date.';
    if (isNaN(guests) || guests < 1) return 'Number of travelers must be at least 1.';
    // optional: ensure date is >= today
    const chosen = new Date(date + 'T00:00:00');
    const today = new Date(); today.setHours(0,0,0,0);
    if (chosen < today) return 'Please select a future date.';
    return null;
  }

  // Event bindings
  function bindEvents() {
    // Detail & book buttons
    toursGrid.addEventListener('click', e => {
      const detail = e.target.closest('.btn-detail');
      const book = e.target.closest('.btn-start-book');
      if (detail) {
        const id = detail.dataset.id;
        openModal(id);
      } else if (book) {
        openModal(book.dataset.id);
      }
    });

    // header book
    [btnBookHeader, ctaBook].forEach(b => {
      if (b) b.addEventListener('click', () => {
        // open first tour for quick booking
        if (tours.length) openModal(tours[0].id);
      });
    });

    // contact form submit (demo)
    const contactForm = document.getElementById('contact-form');
    contactForm && contactForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(contactForm);
      contactForm.querySelector('button[type="submit"]').textContent = 'Sending...';
      setTimeout(() => {
        contactForm.reset();
        contactForm.querySelector('button[type="submit"]').textContent = 'Send Message';
        alert('Thanks! Your message was sent (demo). We will contact you within 24 hours.');
      }, 600);
    });

    // booking modal close
    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    // esc to close
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && modal.classList.contains('show')) closeModal();
    });

    // booking submit
    bookingForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const err = validateBooking(bookingForm);
      if (err) {
        showBookingMessage(err, 'error');
        return;
      }
      // collect
      const data = {
        id: 'BK' + Date.now(),
        tourId: bookingForm.tourId.value,
        tourTitle: findTour(bookingForm.tourId.value).title,
        fullname: bookingForm.fullname.value.trim(),
        email: bookingForm.email.value.trim(),
        date: bookingForm.date.value,
        guests: Number(bookingForm.guests.value),
        createdAt: (new Date()).toISOString()
      };
      saveBooking(data);
      bookingForm.reset();
      // show confirmation inside modal
      showBookingMessage(`Booking confirmed! Booking ID: <strong>${data.id}</strong><br/>
        ${data.tourTitle} — ${data.guests} traveler(s) on ${data.date}`, 'success');
      // small UX: auto-close after a few seconds
      setTimeout(() => {
        // keep it open so user sees confirmation; close after 2.4s
        closeModal();
      }, 2400);
    });

    // mobile menu toggle
    mobileMenuToggle && mobileMenuToggle.addEventListener('click', () => {
      nav.style.display = nav.style.display === 'flex' ? '' : 'flex';
    });

  }

  function showBookingMessage(msg, type='info') {
    bookingMessage.classList.remove('hidden');
    bookingMessage.innerHTML = `<div style="color:${type==='error' ? '#b91c1c' : '#065f46'}">${msg}</div>`;
    if (type === 'success') {
      bookingForm.classList.add('hidden');
    }
  }

  // Initialize
  function init() {
    renderTours();
    bindEvents();
  }

  // Run
  init();

})();
