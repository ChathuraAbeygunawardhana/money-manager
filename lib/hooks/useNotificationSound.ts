import { useRef, useCallback } from 'react';

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      // Try to load the notification.mp3 file first
      audioRef.current = new Audio('/notification.mp3');
      audioRef.current.volume = 0.5; // Set volume to 50%
      audioRef.current.preload = 'auto';
      
      // If the file fails to load, create a simple beep sound as fallback
      audioRef.current.addEventListener('error', () => {
        // Create a simple beep sound using Web Audio API as fallback
        console.log('Notification sound file not found, using fallback beep');
      });
    }
  }, []);

  // Create a simple beep sound using Web Audio API as fallback
  const createBeepSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz tone
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Low volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Could not create beep sound:', error);
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      initializeAudio();
      if (audioRef.current) {
        // Reset audio to beginning in case it was played recently
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((error) => {
          // If MP3 fails, try the beep fallback
          console.log('Could not play notification sound file, using beep fallback:', error);
          createBeepSound();
        });
      } else {
        // If no audio element, use beep fallback
        createBeepSound();
      }
    } catch (error) {
      console.log('Error playing notification sound:', error);
      // Last resort: try beep fallback
      createBeepSound();
    }
  }, [initializeAudio, createBeepSound]);

  return { playNotificationSound };
}