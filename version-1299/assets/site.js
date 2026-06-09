(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var categoryFilter = document.querySelector('[data-category-filter]');
    var movieCards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
        var query = normalize(searchInput ? searchInput.value : '');
        var category = normalize(categoryFilter ? categoryFilter.value : '');
        var visible = 0;

        movieCards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-year'),
                card.textContent
            ].join(' '));
            var cardCategory = normalize(card.getAttribute('data-category'));
            var matchesQuery = !query || haystack.indexOf(query) !== -1;
            var matchesCategory = !category || cardCategory === category;
            var show = matchesQuery && matchesCategory;

            card.classList.toggle('is-filtered', !show);
            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (searchInput) {
        try {
            var initialQuery = new URLSearchParams(window.location.search).get('q');
            if (initialQuery) {
                searchInput.value = initialQuery;
            }
        } catch (error) {
            searchInput.value = searchInput.value;
        }
        searchInput.addEventListener('input', filterCards);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterCards);
    }
    if (movieCards.length && (searchInput || categoryFilter)) {
        filterCards();
    }
})();
