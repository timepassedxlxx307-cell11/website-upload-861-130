(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-nav-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
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

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function setupRails() {
    document.querySelectorAll("[data-scroll-left]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll-left"));
        if (target) {
          target.scrollBy({ left: -420, behavior: "smooth" });
        }
      });
    });
    document.querySelectorAll("[data-scroll-right]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-scroll-right"));
        if (target) {
          target.scrollBy({ left: 420, behavior: "smooth" });
        }
      });
    });
  }

  function applyFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    if (!cards.length) {
      return;
    }
    var mainSearch = document.querySelector("[data-main-search]");
    var localSearch = document.querySelector("[data-local-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var noMatch = document.querySelector("[data-no-match]");
    var query = new URLSearchParams(window.location.search).get("q") || "";

    if (mainSearch && query) {
      mainSearch.value = query;
    }
    if (localSearch && query) {
      localSearch.value = query;
    }

    function filter() {
      var searchTerm = text(mainSearch ? mainSearch.value : localSearch ? localSearch.value : "");
      var typeValue = text(typeFilter ? typeFilter.value : "");
      var yearValue = text(yearFilter ? yearFilter.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = text([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var typeOk = !typeValue || text(card.getAttribute("data-type")) === typeValue;
        var yearOk = !yearValue || text(card.getAttribute("data-year")) === yearValue;
        var searchOk = !searchTerm || haystack.indexOf(searchTerm) !== -1;
        var ok = typeOk && yearOk && searchOk;
        card.classList.toggle("is-filtered-out", !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (noMatch) {
        noMatch.classList.toggle("is-visible", visible === 0);
      }
    }

    [mainSearch, localSearch, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filter);
        control.addEventListener("change", filter);
      }
    });

    filter();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupRails();
    applyFilters();
  });
})();
