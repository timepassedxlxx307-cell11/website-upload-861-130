(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function attachVideo(video) {
    var source = video.querySelector("source");
    if (!source) {
      return;
    }
    var src = source.getAttribute("src");
    if (!src) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = src;
    }
  }

  function setupButtons() {
    document.querySelectorAll(".player-start").forEach(function (button) {
      button.addEventListener("click", function () {
        var id = button.getAttribute("data-player-target");
        var video = document.getElementById(id);
        if (!video) {
          return;
        }
        button.classList.add("is-hidden");
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      });
    });
  }

  ready(function () {
    document.querySelectorAll("video.movie-player").forEach(attachVideo);
    setupButtons();
  });
})();
