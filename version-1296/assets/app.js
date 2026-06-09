(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        stop();
        show(current);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        stop();
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        stop();
        show(index + 1);
        start();
      });
    }

    start();
  }

  function initRails() {
    document.querySelectorAll('.rail-box').forEach(function (box) {
      var rail = box.querySelector('[data-rail]');
      var left = box.querySelector('[data-scroll-left]');
      var right = box.querySelector('[data-scroll-right]');
      if (!rail) {
        return;
      }
      if (left) {
        left.addEventListener('click', function () {
          rail.scrollBy({ left: -420, behavior: 'smooth' });
        });
      }
      if (right) {
        right.addEventListener('click', function () {
          rail.scrollBy({ left: 420, behavior: 'smooth' });
        });
      }
    });
  }

  function attachStream(video, stream) {
    if (!video || !stream) {
      return null;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return null;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return hls;
    }
    video.src = stream;
    return null;
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play]');
      var stream = player.getAttribute('data-stream');
      var loaded = false;
      var hlsInstance = null;

      function startPlayback() {
        if (!loaded) {
          hlsInstance = attachStream(video, stream);
          loaded = true;
        }
        if (button) {
          button.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }

      if (button) {
        button.addEventListener('click', startPlayback);
      }
      if (video) {
        video.addEventListener('play', function () {
          if (button) {
            button.classList.add('is-hidden');
          }
        });
        video.addEventListener('pause', function () {
          if (button && video.currentTime === 0) {
            button.classList.remove('is-hidden');
          }
        });
        video.addEventListener('error', function () {
          if (hlsInstance && hlsInstance.destroy) {
            hlsInstance.destroy();
          }
        });
      }
    });
  }

  function movieCard(movie) {
    return [
      '<a class="movie-card" href="' + movie.href + '">',
      '<span class="poster-frame">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="badge top-left">' + escapeHtml(movie.category) + '</span>',
      '<span class="badge top-right">' + escapeHtml(movie.rating) + '</span>',
      '<span class="badge bottom-right">' + escapeHtml(movie.duration) + '</span>',
      '</span>',
      '<span class="card-body">',
      '<strong>' + escapeHtml(movie.title) + '</strong>',
      '<em>' + escapeHtml(movie.oneLine) + '</em>',
      '<span class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></span>',
      '</span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initSearch() {
    var form = document.querySelector('[data-search-form]');
    var result = document.querySelector('[data-search-results]');
    var status = document.querySelector('[data-search-status]');
    if (!form || !result || !window.filmIndex) {
      return;
    }
    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function render(query) {
      var keyword = String(query || '').trim().toLowerCase();
      if (!keyword) {
        if (status) {
          status.textContent = '热门内容';
        }
        result.innerHTML = '<div class="movie-grid">' + window.filmIndex.slice(0, 24).map(movieCard).join('') + '</div>';
        return;
      }
      var items = window.filmIndex.filter(function (movie) {
        var text = [movie.title, movie.year, movie.region, movie.type, movie.category, movie.genre, movie.oneLine].join(' ').toLowerCase();
        return text.indexOf(keyword) !== -1;
      }).slice(0, 120);
      if (status) {
        status.textContent = items.length ? '搜索结果' : '暂无匹配内容';
      }
      result.innerHTML = items.length ? '<div class="movie-grid">' + items.map(movieCard).join('') + '</div>' : '<div class="empty-state">换一个关键词试试</div>';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input ? input.value : '';
      var url = new URL(window.location.href);
      if (query.trim()) {
        url.searchParams.set('q', query.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
      render(query);
    });

    render(initial);
  }

  ready(function () {
    initMenu();
    initHero();
    initRails();
    initPlayers();
    initSearch();
  });
}());
