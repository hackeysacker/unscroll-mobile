/**
 * Sound Generator
 *
 * Generates simple beep sounds using expo-av
 * Uses tone generation for immediate playback without audio files
 */

import { Audio } from 'expo-av';
import type { SoundName } from '@/types/sounds';

// Sound profiles with frequency and duration
const SOUND_PROFILES: Record<SoundName, { frequency: number; duration: number }> = {
  // UI Interactions - High, quick tones
  tap: { frequency: 800, duration: 50 },
  toggle: { frequency: 600, duration: 80 },
  swipe: { frequency: 400, duration: 100 },
  select: { frequency: 700, duration: 60 },

  // Feedback - Mid-range, distinctive
  success: { frequency: 880, duration: 200 },
  error: { frequency: 200, duration: 150 },
  warning: { frequency: 440, duration: 180 },
  complete: { frequency: 1046, duration: 250 },

  // Challenge Events
  'target-appear': { frequency: 523, duration: 80 },
  'target-hit': { frequency: 659, duration: 100 },
  'target-miss': { frequency: 220, duration: 120 },
  streak: { frequency: 784, duration: 150 },
  combo: { frequency: 932, duration: 180 },

  // Achievements - High, celebratory
  'level-up': { frequency: 1318, duration: 300 },
  achievement: { frequency: 1175, duration: 280 },
  reward: { frequency: 1046, duration: 250 },

  // Navigation - Subtle, low
  transition: { frequency: 330, duration: 80 },
  back: { frequency: 293, duration: 70 },
  forward: { frequency: 370, duration: 70 },

  // Special
  countdown: { frequency: 440, duration: 100 },
  'timer-end': { frequency: 587, duration: 200 },
  unlock: { frequency: 1046, duration: 220 },
};

/**
 * Generate a simple beep tone
 * Since React Native doesn't have Web Audio API, we'll use Haptics as fallback
 * and create simple sound objects with expo-av
 */
class SoundGenerator {
  private isInitialized = false;
  private activeSound: Audio.Sound | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Set audio mode for the app
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  /**
   * Play a beep sound
   * Creates a simple audio tone using base64 encoded WAV data
   */
  async play(soundName: SoundName, volume: number = 0.5) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const profile = SOUND_PROFILES[soundName];
      if (!profile) {
        console.warn(`Unknown sound: ${soundName}`);
        return;
      }

      // Clean up previous sound if still playing
      if (this.activeSound) {
        try {
          await this.activeSound.stopAsync();
          await this.activeSound.unloadAsync();
        } catch (e) {
          // Ignore cleanup errors
        }
        this.activeSound = null;
      }

      // Generate a simple beep using a base64-encoded WAV file
      // This creates a pure sine wave tone
      const beepData = this.generateBeepWav(profile.frequency, profile.duration, volume);

      const { sound } = await Audio.Sound.createAsync(
        { uri: beepData },
        { volume, shouldPlay: true }
      );

      this.activeSound = sound;

      // Auto-cleanup after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          if (this.activeSound === sound) {
            this.activeSound = null;
          }
        }
      });

    } catch (error) {
      if (__DEV__) {
        console.error(`Failed to play sound ${soundName}:`, error);
      }
    }
  }

  /**
   * Generate a WAV file as base64 data URI
   * Creates a simple sine wave beep
   */
  private generateBeepWav(frequency: number, duration: number, volume: number): string {
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * (duration / 1000));
    const numChannels = 1;
    const bytesPerSample = 2;

    // WAV file header
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    // "RIFF" chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * numChannels * bytesPerSample, true);
    this.writeString(view, 8, 'WAVE');

    // "fmt " sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, 8 * bytesPerSample, true);

    // "data" sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, numSamples * numChannels * bytesPerSample, true);

    // Generate sine wave samples
    const samples = new Int16Array(numSamples);
    const amplitude = Math.min(32767 * volume, 32767);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Apply envelope (fade in/out) to avoid clicks
      const envelope = Math.min(1, i / (sampleRate * 0.01), (numSamples - i) / (sampleRate * 0.01));
      samples[i] = amplitude * envelope * Math.sin(2 * Math.PI * frequency * t);
    }

    // Combine header and samples
    const wavData = new Uint8Array(header.byteLength + samples.byteLength);
    wavData.set(new Uint8Array(header), 0);
    wavData.set(new Uint8Array(samples.buffer), header.byteLength);

    // Convert to base64
    const base64 = this.arrayBufferToBase64(wavData);
    return `data:audio/wav;base64,${base64}`;
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Cleanup
   */
  async cleanup() {
    if (this.activeSound) {
      try {
        await this.activeSound.stopAsync();
        await this.activeSound.unloadAsync();
      } catch (e) {
        // Ignore
      }
      this.activeSound = null;
    }
  }
}

// Export singleton instance
export const soundGenerator = new SoundGenerator();
