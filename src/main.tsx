import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface SpotifyEmbedProps {
  uri: string;
  width?: string;
  height?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
}

const SpotifyEmbed = forwardRef((props: SpotifyEmbedProps, ref) => {
  const { uri, width = '100%', height = '380', onPlay, onPause, onEnd } = props;
  const embedControllerRef = useRef<any>(null);
  const isPlayingRef = useRef<boolean>(false);
  const trackEndedRef = useRef<boolean>(false);

  useEffect(() => {
    const onSpotifyIframeApiReady = (IFrameAPI: any) => {
      const element = document.getElementById('spotify-embed-iframe');
      const options = { uri };

      const callback = (EmbedController: any) => {
        embedControllerRef.current = EmbedController;
        setupEventListeners(EmbedController);

        if (ref && typeof ref === 'object') {
          ref.current = embedControllerRef.current;
        }
      };

      IFrameAPI.createController(element, options, callback);
    };

    spotifyScript();
    (window as any).onSpotifyIframeApiReady = onSpotifyIframeApiReady;
  }, []);

  const setupEventListeners = (EmbedController: any) => {
    EmbedController.addListener('playback_update', ({ data }: { data: any }) => {
      const { duration, isBuffering, isPaused, position } = data;

      if (!isPaused && !isPlayingRef.current) {
        isPlayingRef.current = true;
        trackEndedRef.current = false;
        if (onPlay) onPlay();
      } else if (isPaused && isPlayingRef.current && !isBuffering) {
        isPlayingRef.current = false;
        if (onPause) onPause();
      } else if (position === duration) {
        trackEndedRef.current = true;
        isPlayingRef.current = false;
        if (onEnd) onEnd();
      }
    });
  };

  useImperativeHandle(ref, () => ({
    play: () =>
      embedControllerRef.current?.play?.(),
    togglePlay: () =>
      embedControllerRef.current?.togglePlay?.(),
    loadUri: (newUri: string) =>
      embedControllerRef.current?.loadUri?.(newUri),
  }));


  return <div ref={embedControllerRef} id="spotify-embed-iframe" style={{ width, height }}></div>;
});

const spotifyScript = () => {
  const src = "https://open.spotify.com/embed/iframe-api/v1"
  if (!document.querySelector(`script[src="${src}"]`)) {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    return document.head.appendChild(script);
  }
}

export default SpotifyEmbed;