document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var currentSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === currentSlide);
        });

        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function scheduleHero() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }

        if (slides.length > 1) {
            heroTimer = window.setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        }
    }

    if (slides.length) {
        showSlide(0);
        scheduleHero();
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-target-slide')) || 0);
            scheduleHero();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(currentSlide - 1);
            scheduleHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(currentSlide + 1);
            scheduleHero();
        });
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

    function applySearch(value) {
        var query = String(value || '').trim().toLowerCase();
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var visible = 0;

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-year'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' ').toLowerCase();
            var matched = !query || text.indexOf(query) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        Array.prototype.slice.call(document.querySelectorAll('.no-results')).forEach(function (node) {
            node.remove();
        });

        var grid = document.querySelector('[data-card-grid]');
        if (grid && cards.length && !visible) {
            var empty = document.createElement('div');
            empty.className = 'no-results';
            empty.textContent = '没有找到匹配影片';
            grid.appendChild(empty);
        }
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            applySearch(input.value);
        });
    });

    var sortSelect = document.querySelector('[data-sort-select]');
    var grid = document.querySelector('[data-card-grid]');

    if (sortSelect && grid) {
        sortSelect.addEventListener('change', function () {
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            var mode = sortSelect.value;

            cards.sort(function (a, b) {
                var ay = Number(a.getAttribute('data-year')) || 0;
                var by = Number(b.getAttribute('data-year')) || 0;
                var at = a.getAttribute('data-title') || '';
                var bt = b.getAttribute('data-title') || '';

                if (mode === 'year-desc') {
                    return by - ay || at.localeCompare(bt, 'zh-Hans-CN');
                }

                if (mode === 'year-asc') {
                    return ay - by || at.localeCompare(bt, 'zh-Hans-CN');
                }

                if (mode === 'title') {
                    return at.localeCompare(bt, 'zh-Hans-CN');
                }

                return 0;
            });

            cards.forEach(function (card) {
                grid.appendChild(card);
            });
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-video-shell]')).forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');

        function preparePlayer() {
            if (!video || video.getAttribute('data-ready') === 'true') {
                return;
            }

            var source = video.getAttribute('data-hls');
            if (!source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }

            video.setAttribute('data-ready', 'true');
        }

        function startPlayback() {
            preparePlayer();
            shell.classList.add('is-playing');
            if (video) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
        }
    });
});
