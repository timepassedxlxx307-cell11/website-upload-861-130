(function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var container = panel.parentElement || document;
    var items = Array.prototype.slice.call(container.querySelectorAll("[data-search-item]"));
    var input = panel.querySelector("[data-search-input]");
    var typeSelect = panel.querySelector("[data-type-filter]");
    var regionSelect = panel.querySelector("[data-region-filter]");
    var yearSelect = panel.querySelector("[data-year-filter]");
    var emptyState = container.querySelector("[data-empty-state]");

    function uniqueValues(attribute) {
      var values = [];
      items.forEach(function (item) {
        var value = item.getAttribute(attribute) || "";
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
      return values.sort(function (a, b) {
        return b.localeCompare(a, "zh-CN", { numeric: true });
      });
    }

    function fillSelect(select, attribute) {
      if (!select) {
        return;
      }
      uniqueValues(attribute).forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var type = typeSelect ? typeSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      items.forEach(function (item) {
        var title = (item.getAttribute("data-title") || "").toLowerCase();
        var itemType = item.getAttribute("data-type") || "";
        var itemRegion = item.getAttribute("data-region") || "";
        var itemYear = item.getAttribute("data-year") || "";
        var tags = (item.getAttribute("data-tags") || "").toLowerCase();
        var text = [title, itemType, itemRegion, itemYear, tags].join(" ");
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (type && itemType !== type) {
          matched = false;
        }
        if (region && itemRegion !== region) {
          matched = false;
        }
        if (year && itemYear !== year) {
          matched = false;
        }

        item.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    fillSelect(typeSelect, "data-type");
    fillSelect(regionSelect, "data-region");
    fillSelect(yearSelect, "data-year");

    [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }
    applyFilter();
  });
})();
