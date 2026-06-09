(function () {
  function initHlsPlayer(videoId, buttonId, srcUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var attached = false;
    var hls = null;

    if (!video || !srcUrl) {
      return;
    }

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
    }

    function attach() {
      if (attached) {
        return;
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(srcUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = srcUrl;
      }
    }

    function play() {
      attach();
      hideButton();
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          video.controls = true;
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", hideButton);
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initHlsPlayer = initHlsPlayer;
})();
