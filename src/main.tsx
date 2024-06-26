import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface SpotifyEmbedProps {
  uri: string;
  width?: string;
  height?: string;
  onReady?: (e: any) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  style?: React.CSSProperties;
}

const spotify = () => {
  const src = "https://open.spotify.com/embed/iframe-api/v1";
  if (!document.querySelector(`script[src="${src}"]`)) {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    return document.head.appendChild(script);
  }
};

const SpotifyEmbed = forwardRef((props: SpotifyEmbedProps, ref) => {
  const { uri, onReady, onPlay, onPause, onEnd } = props;
  const { width = '100%', height = '380', style } = props;
  const embedControllerRef = useRef<any>(null);
  const isPlayingRef = useRef<boolean>(false);
  const trackEndedRef = useRef<boolean>(false);
  const embedContainerRef = useRef<HTMLDivElement>(null);

  const spotifyReady = (IFrameAPI: any) => {
    (window as any).IFrameAPI = IFrameAPI;
    const container = embedContainerRef.current;
    const swapContainer = document.createElement("div");
    container?.appendChild(swapContainer);
    const options = { uri };

    const callback = (EmbedController: any) => {
      embedControllerRef.current = EmbedController;
      setListeners(EmbedController);
    };

    IFrameAPI.createController(swapContainer, options, callback);
  };

  const handleReady = () => {
    if (onReady) onReady(embedControllerRef.current);
  };

  const handlePlayback = ({ data }: { data: any }) => {
    const { duration, isBuffering, isPaused, position } = data;

    if (!isPaused && !isPlayingRef.current) {
      isPlayingRef.current = true;
      trackEndedRef.current = false;
      if (onPlay) onPlay();
    } else if (isPaused && isPlayingRef.current && !isBuffering) {
      isPlayingRef.current = false;
      if (onPause) onPause();
    } else if (position && position === duration) {
      // position check needed when user skip resets to 0
      trackEndedRef.current = true;
      isPlayingRef.current = false;
      if (onEnd) onEnd();
    }
  };

  const setListeners = (EmbedController: any) => {
    EmbedController.addListener('ready', handleReady);
    EmbedController.addListener('playback_update', handlePlayback);

    EmbedController.removeAllListeners = () => {
      EmbedController.removeListener('ready', handleReady);
      EmbedController.removeListener('playback_update', handlePlayback);
    };
  };

  useEffect(() => {
    if (!embedContainerRef.current) return;
    const apiReady = (window as any).onSpotifyIframeApiReady;
    const api = (window as any).IFrameAPI

    if (apiReady && api) {
      if (!document.querySelector('spotify-embed-iframe > iframe')) {
        spotifyReady(api);
      }
    } else {
      spotify();
      (window as any).onSpotifyIframeApiReady = spotifyReady;
    }

    return () => {
      embedControllerRef.current?.removeAllListeners?.();
      embedControllerRef.current?.destroy?.();
    };
  }, []);

  useEffect(() => {
    // Reset event listeners when props change
    if (embedControllerRef.current) {
      embedControllerRef.current?.removeAllListeners?.();
      setListeners(embedControllerRef.current);
    }
  }, [onReady, onPlay, onPause, onEnd]);

  useImperativeHandle(ref, () => embedControllerRef.current);

  return (
      <div
        style={{ width, height, ...style }}
        ref={embedContainerRef}
        id={"spotify-embed-iframe"}
      />
  )
});

export default SpotifyEmbed;