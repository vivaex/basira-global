// hooks/useSound.ts
'use client';

import { useCallback } from 'react';

const SOUNDS = {
  click:   'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  levelUp: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
  coin:    'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
};

export function useSound() {
  const play = useCallback((soundName: keyof typeof SOUNDS) => {
    if (typeof window === 'undefined') return;
    try {
      const url = SOUNDS[soundName];
      if (!url) return;
      
      const audio = new Audio(url);
      audio.volume = 0.3;
      // Use a promise-friendly play catch
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Silent catch for autoplay restrictions or interrupted loads
        });
      }
    } catch (err) {
      // Ignore audio errors to prevent UI crashes
    }
  }, []);

  return { play };
}
