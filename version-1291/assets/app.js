(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupMobileNav() {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll('.poster-frame img, .horizontal-poster img, .hero-slide img').forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = image.closest('.poster-frame, .horizontal-poster');
        if (frame) {
          frame.classList.add('is-missing');
        }
        image.remove();
      });
    });
  }

  function setupHeroSlider() {
    var root = document.querySelector('.hero-slider');

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('.hero-prev');
    var next = root.querySelector('.hero-next');
    var active = 0;
    var timer = null;

    function show(index) {
      if (slides.length === 0) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var panel = document.querySelector('.filter-panel');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filterable-grid .movie-card, .home-search-wrap ~ .main-sections .movie-card'));

    if (!panel || cards.length === 0) {
      var countOnly = document.querySelector('[data-filter-count]');
      if (countOnly) {
        countOnly.textContent = String(document.querySelectorAll('.movie-card').length);
      }
      return;
    }

    var search = panel.querySelector('#movie-search');
    var region = panel.querySelector('#region-filter');
    var type = panel.querySelector('#type-filter');
    var year = panel.querySelector('#year-filter');
    var count = panel.querySelector('[data-filter-count]');

    function valueOf(input) {
      return input ? input.value.trim().toLowerCase() : '';
    }

    function apply() {
      var keyword = valueOf(search);
      var regionValue = valueOf(region);
      var typeValue = valueOf(type);
      var yearValue = valueOf(year);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (regionValue && String(card.dataset.region).toLowerCase() !== regionValue) {
          matched = false;
        }
        if (typeValue && String(card.dataset.type).toLowerCase() !== typeValue) {
          matched = false;
        }
        if (yearValue && String(card.dataset.year).toLowerCase() !== yearValue) {
          matched = false;
        }

        card.classList.toggle('hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [search, region, type, year].forEach(function (input) {
      if (input) {
        input.addEventListener('input', apply);
        input.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      var message = player.querySelector('.player-message');
      var hlsInstance = null;

      if (!video || !overlay) {
        return;
      }

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.hidden = false;
        message.textContent = text;
      }

      function playVideo() {
        var source = video.dataset.src;

        if (!source) {
          showMessage('未找到可播放的视频地址。');
          return;
        }

        overlay.hidden = true;

        if (hlsInstance) {
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
              hlsInstance = null;
              showMessage('播放器初始化失败，请稍后重试。');
            }
          });
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
          return;
        }

        showMessage('当前浏览器不支持 HLS 播放，请更换现代浏览器访问。');
      }

      overlay.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        overlay.hidden = true;
      });
    });
  }

  ready(function () {
    setupMobileNav();
    setupImageFallbacks();
    setupHeroSlider();
    setupFilters();
    setupPlayers();
  });
})();
