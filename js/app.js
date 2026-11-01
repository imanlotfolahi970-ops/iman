/* ============================================================
   VoltMind AI — Application Script
   Vanilla JS: navigation, scroll effects, savings calculator,
   contact form validation, and icon bootstrapping.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. ICON BOOTSTRAP — render Lucide SVG icons on load
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    if (window.lucide) {
      window.lucide.createIcons();
    }
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initScrollReveal();
    initCalculator();
    initContactForm();
    initHeroLiveGain();
    setFooterYear();
  });

  /* ----------------------------------------------------------
     2. NAVBAR — add frosted "scrolled" state past 24px
     ---------------------------------------------------------- */
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    var shell = navbar ? navbar.querySelector('.nav-shell') : null;
    if (!shell) return;

    function onScroll() {
      shell.classList.toggle('is-scrolled', window.scrollY > 24);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set initial state
  }

  /* ----------------------------------------------------------
     3. MOBILE MENU — toggle dropdown visibility
     ---------------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.getElementById('menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var isOpen = !menu.classList.contains('hidden');
      menu.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', String(!isOpen));
    });

    // Auto-close when a link inside is clicked
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----------------------------------------------------------
     4. SMOOTH SCROLL — offset for fixed header on anchor links
     ---------------------------------------------------------- */
  function initSmoothScroll() {
    var HEADER_OFFSET = 96; // sticky nav clearance

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (event) {
        var href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        var target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ----------------------------------------------------------
     5. SCROLL REVEAL — fade sections/cards into view
     ---------------------------------------------------------- */
  function initScrollReveal() {
    var targets = document.querySelectorAll(
      '.feature-card, .pricing-card, .glass-card, section > div > div:first-child'
    );

    // Tag elements for animation (skip hero which already animates)
    targets.forEach(function (el) {
      if (el.closest('#hero')) return;
      el.classList.add('reveal');
    });

    if (!('IntersectionObserver' in window)) {
      // Fallback: reveal everything immediately
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ----------------------------------------------------------
     6. SAVINGS CALCULATOR — live energy-estimate engine
     ---------------------------------------------------------- */
  function initCalculator() {
    var billInput = document.getElementById('monthly-bill');
    var deviceInput = document.getElementById('device-count');
    var facilitySelect = document.getElementById('facility-type');
    var billOutput = document.getElementById('bill-output');
    var deviceOutput = document.getElementById('device-output');
    var annualEl = document.getElementById('annual-savings');
    var rateEl = document.getElementById('savings-rate');
    var paybackEl = document.getElementById('payback-period');
    var barEl = document.getElementById('savings-bar');
    var addons = document.querySelectorAll('.calc-addon');

    if (!billInput || !deviceInput || !facilitySelect) return;

    // Rough implementation-cost model used for payback period
    var BASE_PLATFORM_COST = 1800;

    function formatCurrency(value) {
      return '$' + Math.round(value).toLocaleString('en-US');
    }

    function calculate() {
      var monthlyBill = parseFloat(billInput.value);
      var devices = parseInt(deviceInput.value, 10);
      var facilityRate = parseFloat(facilitySelect.value);

      // Sum checked module boosts
      var addonBoost = 0;
      addons.forEach(function (box) {
        if (box.checked) addonBoost += parseFloat(box.dataset.boost || '0');
      });

      // Slight efficiency penalty for very large device fleets (diminishing returns)
      var scaleFactor = 1 - Math.min(devices / 100000, 0.05);

      var savingsRate = Math.min((facilityRate + addonBoost) * scaleFactor, 0.5); // cap at 50%
      var monthlySavings = monthlyBill * savingsRate;
      var annualSavings = monthlySavings * 12;

      // Payback = platform cost / monthly savings (floored at 1 month)
      var implementationCost = BASE_PLATFORM_COST + devices * 2.5;
      var paybackMonths = monthlySavings > 0 ? implementationCost / monthlySavings : 0;

      // Update DOM
      billOutput.textContent = formatCurrency(monthlyBill);
      deviceOutput.textContent = devices.toLocaleString('en-US');
      annualEl.textContent = formatCurrency(annualSavings);
      rateEl.textContent = (savingsRate * 100).toFixed(1) + '%';
      paybackEl.textContent =
        paybackMonths > 0 ? paybackMonths.toFixed(1) + ' months' : '—';
      barEl.style.width = Math.round(savingsRate * 200) + '%'; // bar scaled for visual punch (max ~100%)
    }

    // Recompute on every input/change event
    [billInput, deviceInput].forEach(function (input) {
      input.addEventListener('input', calculate);
    });
    facilitySelect.addEventListener('change', calculate);
    addons.forEach(function (box) {
      box.addEventListener('change', calculate);
    });

    calculate(); // initial render
  }

  /* ----------------------------------------------------------
     7. CONTACT FORM — client-side validation + success toast
     ---------------------------------------------------------- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    var status = document.getElementById('form-status');
    if (!form || !status) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var name = form.elements['name'];
      var email = form.elements['email'];
      var message = form.elements['message'];
      var valid = true;

      // Reset states
      [name, email, message].forEach(function (field) {
        field.classList.remove('is-invalid');
      });

      if (!name.value.trim()) {
        name.classList.add('is-invalid');
        valid = false;
      }

      // Simple email regex
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value.trim())) {
        email.classList.add('is-invalid');
        valid = false;
      }

      if (message.value.trim().length < 10) {
        message.classList.add('is-invalid');
        valid = false;
      }

      if (!valid) {
        status.textContent = 'Please correct the highlighted fields and try again.';
        status.className =
          'rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400';
        return;
      }

      // Simulate async submission (no backend in this demo)
      var submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      setTimeout(function () {
        status.textContent =
          "✓ Message sent! Our engineers will reply within one business day.";
        status.className =
          'rounded-xl border border-neon-500/30 bg-neon-500/10 px-4 py-3 text-sm text-neon-400';
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          'Send Message <i data-lucide="send" class="h-4 w-4"></i>';
        if (window.lucide) window.lucide.createIcons();
      }, 1200);
    });
  }

  /* ----------------------------------------------------------
     8. HERO LIVE GAUGE — animated fake telemetry number
     ---------------------------------------------------------- */
  function initHeroLiveGain() {
    var el = document.getElementById('hero-live-gain');
    if (!el) return;

    var base = 18.4;
    setInterval(function () {
      var jitter = base + (Math.random() * 2 - 1); // ±1.0 swing
      el.textContent = '+' + jitter.toFixed(1) + '%';
    }, 2200);
  }

  /* ----------------------------------------------------------
     9. FOOTER YEAR — keep copyright current
     ---------------------------------------------------------- */
  function setFooterYear() {
    var yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }
})();
