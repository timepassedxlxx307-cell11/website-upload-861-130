(function () {
  const video = document.getElementById('moviePlayer');
  const button = document.getElementById('playerStart');
  const data = window.playerData || {};
  let attached = false;
  let hlsInstance = null;

  if (!video || !button || !data.playUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = data.playUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(data.playUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = data.playUrl;
  }

  function startPlay() {
    attachStream();
    button.classList.add('is-hidden');
    video.controls = true;
    video.play().catch(function () {
      button.classList.remove('is-hidden');
    });
  }

  button.addEventListener('click', startPlay);

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlay();
    }
  });

  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });

  video.addEventListener('ended', function () {
    button.classList.remove('is-hidden');
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
