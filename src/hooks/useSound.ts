/**
 * useSound Hook
 *
 * Provides sound playback that respects user settings
 * Automatically checks if sound is enabled before playing
 */

import { useSettings } from '@/contexts/SettingsContext';
import { soundGenerator } from '@/lib/sound-generator';
import type { SoundName } from '@/types/sounds';
import { SOUND_METADATA } from '@/types/sounds';
import { useEffect } from 'react';

export function useSound() {
  const { settings } = useSettings();

  // Initialize sound system on mount
  useEffect(() => {
    soundGenerator.initialize();
  }, []);

  /**
   * Play a sound effect
   * Automatically checks settings.soundEnabled
   */
  const play = (soundName: SoundName, volumeMultiplier: number = 1.0) => {
    if (!settings?.soundEnabled) {
      return;
    }

    const metadata = SOUND_METADATA[soundName];
    if (!metadata) {
      if (__DEV__) {
        console.warn(`Unknown sound: ${soundName}`);
      }
      return;
    }

    const finalVolume = metadata.volume * volumeMultiplier;
    soundGenerator.play(soundName, finalVolume);
  };

  /**
   * Play a sound with custom volume
   * Ignores the default volume from metadata
   */
  const playWithVolume = (soundName: SoundName, volume: number) => {
    if (!settings?.soundEnabled) {
      return;
    }

    soundGenerator.play(soundName, volume);
  };

  /**
   * Convenience methods for common sounds
   */

  // UI Sounds
  const tap = () => play('tap');
  const toggle = () => play('toggle');
  const swipe = () => play('swipe');
  const select = () => play('select');

  // Feedback Sounds
  const success = () => play('success');
  const error = () => play('error');
  const warning = () => play('warning');
  const complete = () => play('complete');

  // Challenge Sounds
  const targetAppear = () => play('target-appear');
  const targetHit = () => play('target-hit');
  const targetMiss = () => play('target-miss');
  const streak = () => play('streak');
  const combo = () => play('combo');

  // Achievement Sounds
  const levelUp = () => play('level-up');
  const achievement = () => play('achievement');
  const reward = () => play('reward');

  // Navigation Sounds
  const transition = () => play('transition');
  const back = () => play('back');
  const forward = () => play('forward');

  // Special Sounds
  const countdown = () => play('countdown');
  const timerEnd = () => play('timer-end');
  const unlock = () => play('unlock');

  return {
    // Core methods
    play,
    playWithVolume,

    // UI
    tap,
    toggle,
    swipe,
    select,

    // Feedback
    success,
    error,
    warning,
    complete,

    // Challenge
    targetAppear,
    targetHit,
    targetMiss,
    streak,
    combo,

    // Achievement
    levelUp,
    achievement,
    reward,

    // Navigation
    transition,
    back,
    forward,

    // Special
    countdown,
    timerEnd,
    unlock,

    // Status
    isEnabled: settings?.soundEnabled ?? true,
  };
}
