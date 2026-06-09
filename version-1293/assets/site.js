(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    restart();
  });

  const searchItems = Array.isArray(window.movieSearchData) ? window.movieSearchData : [];

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderSearch(box, query) {
    const results = box.querySelector('[data-search-results]');

    if (!results) {
      return;
    }

    const term = normalize(query);

    if (!term) {
      results.classList.remove('is-open');
      results.innerHTML = '';
      return;
    }

    const matched = searchItems.filter(function (item) {
      const text = normalize([item.title, item.year, item.region, item.type, item.category].join(' '));
      return text.indexOf(term) !== -1;
    }).slice(0, 8);

    if (!matched.length) {
      results.innerHTML = '<div class="search-empty">没有找到匹配内容</div>';
      results.classList.add('is-open');
      return;
    }

    results.innerHTML = matched.map(function (item) {
      return '<a class="search-result" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span>' +
        '</a>';
    }).join('');
    results.classList.add('is-open');
  }

  document.querySelectorAll('.search-box').forEach(function (box) {
    const input = box.querySelector('[data-search-input]');

    if (!input) {
      return;
    }

    input.addEventListener('input', function () {
      renderSearch(box, input.value);
    });

    input.addEventListener('focus', function () {
      renderSearch(box, input.value);
    });
  });

  document.addEventListener('click', function (event) {
    document.querySelectorAll('.search-box').forEach(function (box) {
      if (!box.contains(event.target)) {
        const results = box.querySelector('[data-search-results]');
        if (results) {
          results.classList.remove('is-open');
        }
      }
    });
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const input = scope.querySelector('[data-page-filter]');
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    const buttons = Array.from(scope.querySelectorAll('[data-year-filter]'));
    let yearMode = 'all';

    function matchesYear(card) {
      const year = parseInt(card.getAttribute('data-year') || '0', 10);

      if (yearMode === '2020') {
        return year >= 2020;
      }

      if (yearMode === '2010') {
        return year >= 2010;
      }

      if (yearMode === 'classic') {
        return year > 0 && year < 2010;
      }

      return true;
    }

    function applyFilter() {
      const term = normalize(input ? input.value : '');

      cards.forEach(function (card) {
        const text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' '));
        const visible = text.indexOf(term) !== -1 && matchesYear(card);
        card.classList.toggle('is-hidden', !visible);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        yearMode = button.getAttribute('data-year-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilter();
      });
    });
  });
})();
