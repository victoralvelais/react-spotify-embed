import React, { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import SpotifyEmbed from './main';

const App = () => {
  const spotifyEmbedRef = useRef<any>(null);

  const handlePlay = () => {
    console.log('Track is playing');
  };

  const handlePause = () => {
    console.log('Track is paused');
  };

  const handleEnd = () => {
    console.log('Track has ended');
  };

  const toggleTrack = () => {
    spotifyEmbedRef.current?.togglePlay();
  };

  const restartTrack = () => {
    spotifyEmbedRef.current?.play();
  };

  return (
    <div>
      <h1>My Spotify Playlist</h1>
      <SpotifyEmbed
        ref={spotifyEmbedRef}
        uri="spotify:track:0URbdJpIV9B54W2d9yeMwt"
        onPlay={handlePlay}
        onPause={handlePause}
        onEnd={handleEnd}
      />
      <button onClick={toggleTrack}>Pause/Resume</button>
      <button onClick={restartTrack}>Restart</button>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
} else {
    console.error('Root container not found');
}
