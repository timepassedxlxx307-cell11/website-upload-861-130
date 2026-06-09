(function () {
    "use strict";

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function uniqueSorted(values) {
        return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
            return String(b).localeCompare(String(a), "zh-CN");
        });
    }

    function fillSelect(select, values) {
        if (!select || select.dataset.ready === "1") {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
        select.dataset.ready = "1";
    }

    function setupMobileNavigation() {
        var button = document.querySelector(".mobile-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("is-open");
            button.classList.toggle("is-open", isOpen);
            button.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setupImages() {
        document.querySelectorAll("img[data-cover]").forEach(function (image) {
            function hideImage() {
                image.classList.add("image-hidden");
            }
            image.addEventListener("error", hideImage);
            if (image.complete && image.naturalWidth === 0) {
                hideImage();
            }
        });
    }

    function setupHeroCarousel() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.from(slider.querySelectorAll(".hero-slide"));
        var dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
                dot.setAttribute("aria-pressed", dotIndex === index ? "true" : "false");
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
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
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var cards = Array.from(scope.querySelectorAll("[data-card='movie']"));
            var input = scope.querySelector(".js-search-input");
            var region = scope.querySelector(".js-region-filter");
            var type = scope.querySelector(".js-type-filter");
            var year = scope.querySelector(".js-year-filter");
            var empty = scope.querySelector("[data-empty-message]");

            fillSelect(region, uniqueSorted(cards.map(function (card) { return card.dataset.region; })));
            fillSelect(type, uniqueSorted(cards.map(function (card) { return card.dataset.type; })));
            fillSelect(year, uniqueSorted(cards.map(function (card) { return card.dataset.year; })));

            function apply() {
                var keyword = normalize(input && input.value);
                var regionValue = region ? region.value : "";
                var typeValue = type ? type.value : "";
                var yearValue = year ? year.value : "";
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.textContent + " " + card.dataset.title + " " + card.dataset.genre + " " + card.dataset.category);
                    var matched = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (regionValue && card.dataset.region !== regionValue) {
                        matched = false;
                    }
                    if (typeValue && card.dataset.type !== typeValue) {
                        matched = false;
                    }
                    if (yearValue && card.dataset.year !== yearValue) {
                        matched = false;
                    }
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visibleCount === 0);
                }
            }

            [input, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function mountPlayer(id, source) {
        var shell = document.getElementById(id);
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var overlay = shell.querySelector(".player-overlay");
        var loaded = false;
        var hls = null;

        function load() {
            if (!video || !source) {
                return;
            }
            if (!loaded) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                loaded = true;
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", load);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!loaded || video.paused) {
                    load();
                }
            });
        }
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.JYPlayer = {
        mount: mountPlayer
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileNavigation();
        setupImages();
        setupHeroCarousel();
        setupFilters();
    });
})();
