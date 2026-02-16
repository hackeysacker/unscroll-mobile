/**
 * Sound Manager - Wrapper around sound generator
 * Provides consistent sound API for challenges
 */

import { soundGenerator } from './sound-generator';
import type { SoundName } from '@/types/sounds';

/**
 * Sound manager with simplified API for challenges
 */
class SoundManager {
  async play(soundName: SoundName, volume?: number) {
    return soundGenerator.play(soundName, volume);
  }

  // Convenience methods for common sounds
  tap() {
    return this.play('tap');
  }

  error() {
    return this.play('error');
  }

  success() {
    return this.play('success');
  }

  warning() {
    return this.play('warning');
  }

  complete() {
    return this.play('complete');
  }

  targetAppear() {
    return this.play('target-appear');
  }

  targetHit() {
    return this.play('target-hit');
  }

  targetMiss() {
    return this.play('target-miss');
  }

  streak() {
    return this.play('streak');
  }

  combo() {
    return this.play('combo');
  }

  levelUp() {
    return this.play('level-up');
  }

  achievement() {
    return this.play('achievement');
  }

  reward() {
    return this.play('reward');
  }

  transition() {
    return this.play('transition');
  }

  back() {
    return this.play('back');
  }

  forward() {
    return this.play('forward');
  }

  countdown() {
    return this.play('countdown');
  }

  timerEnd() {
    return this.play('timer-end');
  }

  unlock() {
    return this.play('unlock');
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
