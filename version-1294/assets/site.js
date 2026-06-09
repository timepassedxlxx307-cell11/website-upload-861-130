(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var year = scope.querySelector("[data-year-filter]");
      var container = scope.parentElement || document;
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));
      var empty = scope.querySelector("[data-empty-state]");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (input && query) {
        input.value = query;
      }

      function apply() {
        var text = normalize(input ? input.value : "");
        var selectedYear = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-keywords") + " " + card.getAttribute("data-title"));
          var cardYear = card.getAttribute("data-year") || "";
          var okText = !text || haystack.indexOf(text) !== -1;
          var okYear = !selectedYear || cardYear === selectedYear;
          var showCard = okText && okYear;
          card.classList.toggle("is-hidden", !showCard);
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      apply();
    });
  }

  function beginPlayback(video, streamUrl, overlay) {
    if (!video || !streamUrl) {
      return;
    }
    if (overlay) {
      overlay.classList.add("hidden");
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (video.hlsInstance) {
        video.hlsInstance.destroy();
      }
      var hls = new window.Hls({ enableWorker: true });
      video.hlsInstance = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }
    video.src = streamUrl;
    video.play().catch(function () {});
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");
    if (!video) {
      return;
    }
    if (overlay) {
      overlay.addEventListener("click", function () {
        beginPlayback(video, streamUrl, overlay);
      });
    }
    video.addEventListener("click", function () {
      if (!video.src) {
        beginPlayback(video, streamUrl, overlay);
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
