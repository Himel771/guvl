import { useEffect, useRef } from 'react';

export const useClickSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Pre-load the audio for instant playback
    audioRef.current = new Audio('/sounds/click.wav');
    audioRef.current.volume = 0.3;
    audioRef.current.preload = 'auto';

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if clicked element is interactive
      const isInteractive = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('[role="tab"]') ||
        target.closest('[role="menuitem"]') ||
        target.closest('[data-clickable]') ||
        target.classList.contains('cursor-pointer') ||
        getComputedStyle(target).cursor === 'pointer';

      if (isInteractive) {
        // Clone and play for overlapping sounds without lag
        const sound = audioRef.current?.cloneNode() as HTMLAudioElement;
        if (sound) {
          sound.volume = 0.3;
          sound.play().catch(() => {});
        }
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);
};
