    
    import Hls from 'hls.js';
    export function loadVideo({videoEl, videoUrl}) {
      if (Hls.isSupported() && videoUrl.endsWith('.m3u8')) {
        if (videoEl.hls) videoEl.hls.destroy();
        const hls = new Hls();
        videoEl.hls = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(videoEl);
      } else if (videoEl.canPlayType('application/vnd.apple.mpegurl') && videoUrl.endsWith('.m3u8')) {
        videoEl.src = videoUrl;
      } else {
        videoEl.src = videoUrl;
      }
    }