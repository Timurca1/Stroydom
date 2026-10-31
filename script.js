/* ============================================================
   СтройДом — общий скрипт сайта
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1. Бургер-меню ---------- */
  function initBurger() {
    var burger = document.querySelector('.burger');
    var nav = document.querySelector('.nav');
    if (!burger || !nav) return;

    burger.addEventListener('click', function () {
      burger.classList.toggle('active');
      nav.classList.toggle('open');
      var expanded = burger.classList.contains('active');
      burger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    // Закрыть меню при клике по ссылке
    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.classList.remove('active');
        nav.classList.remove('open');
      });
    });

    // Закрыть при клике вне меню
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('open')) return;
      if (!nav.contains(e.target) && !burger.contains(e.target)) {
        burger.classList.remove('active');
        nav.classList.remove('open');
      }
    });
  }

  /* ---------- 2. Подсветка активного пункта меню ---------- */
  function initActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ---------- 3. Анимации при скролле (IntersectionObserver) ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    items.forEach(function (el, i) {
      // небольшая задержка каскадом
      el.style.transitionDelay = (i % 4) * 0.08 + 's';
      observer.observe(el);
    });
  }

  /* ---------- 4. Маска телефона +7 (___) ___-__-__ ---------- */
  function applyPhoneMask(input) {
    function format(value) {
      var digits = value.replace(/\D/g, '');
      if (digits.startsWith('8')) digits = '7' + digits.slice(1);
      if (!digits.startsWith('7')) digits = '7' + digits;
      digits = digits.slice(0, 11);

      var res = '+7';
      if (digits.length > 1) res += ' (' + digits.slice(1, 4);
      if (digits.length >= 5) res += ') ' + digits.slice(4, 7);
      if (digits.length >= 8) res += '-' + digits.slice(7, 9);
      if (digits.length >= 10) res += '-' + digits.slice(9, 11);
      return res;
    }

    input.addEventListener('focus', function () {
      if (!input.value) input.value = '+7 (';
    });
    input.addEventListener('input', function () {
      input.value = format(input.value);
    });
    input.addEventListener('blur', function () {
      if (input.value === '+7 (' || input.value === '+7') input.value = '';
    });
  }

  function initPhoneMasks() {
    document.querySelectorAll('input[type="tel"], [data-phone]').forEach(applyPhoneMask);
  }

  /* ---------- 5. Фильтрация галереи в проектах ---------- */
  function initGalleryFilter() {
    var buttons = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('[data-category]');
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var filter = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          var match = filter === 'all' || card.getAttribute('data-category') === filter;
          if (match) {
            card.style.display = '';
            card.classList.remove('visible');
            // re-trigger animation
            void card.offsetWidth;
            card.classList.add('visible');
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ---------- 6. Валидация формы ---------- */
  function initFormValidation() {
    var form = document.querySelector('.form--validate');
    if (!form) return;

    var phoneRe = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showError(field, message) {
      field.classList.add('error');
      var err = field.parentNode.querySelector('.form__error');
      if (err) { err.textContent = message; err.classList.add('show'); }
    }
    function clearError(field) {
      field.classList.remove('error');
      var err = field.parentNode.querySelector('.form__error');
      if (err) err.classList.remove('show');
    }

    form.addEventListener('submit', function (e) {
      var valid = true;
      var name = form.querySelector('[name="name"]');
      var phone = form.querySelector('[name="phone"]');
      var email = form.querySelector('[name="email"]');

      [name, phone, email].forEach(function (f) { if (f) clearError(f); });

      if (name && name.value.trim().length < 2) {
        showError(name, 'Укажите имя (минимум 2 символа)');
        valid = false;
      }
      if (phone && !phoneRe.test(phone.value.trim())) {
        showError(phone, 'Формат: +7 (391) 555-77-77');
        valid = false;
      }
      if (email && email.value.trim() && !emailRe.test(email.value.trim())) {
        showError(email, 'Проверьте адрес электронной почты');
        valid = false;
      }

      if (!valid) {
        e.preventDefault();
        return;
      }

      // Если форма не отправляется на реальный сервер (placeholder) —
      // показываем сообщение об успехе без перезагрузки.
      if (form.getAttribute('action').indexOf('placeholder') !== -1) {
        e.preventDefault();
        var success = form.querySelector('.form__success');
        if (success) success.classList.add('show');
        form.reset();
        setTimeout(function () {
          if (success) success.classList.remove('show');
        }, 6000);
      }
    });

    // Живая очистка ошибок
    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('input', function () { clearError(field); });
    });
  }

  /* ---------- 7. Тень у шапки при скролле ---------- */
  function initHeaderScroll() {
    var header = document.querySelector('.header');
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 20) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Инициализация ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeaderScroll();
    initBurger();
    initActiveNav();
    initReveal();
    initPhoneMasks();
    initGalleryFilter();
    initFormValidation();
  });
})();
