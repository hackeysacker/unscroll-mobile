/**
 * UNIT TESTS FOR CHALLENGE UTILS
 *
 * Score calculation, score presentation, and formatting helpers.
 */

import {
  calculateScore,
  getScoreColor,
  getScoreEmoji,
  formatTime,
  formatDuration,
  getAccessibilityLabel,
  CHALLENGE_COLORS,
} from '../challenge-utils';

describe('Challenge Utils', () => {
  describe('calculateScore', () => {
    it('returns a percentage of the max score', () => {
      expect(calculateScore(8, 10)).toBe(80);
    });

    it('rounds fractional scores', () => {
      expect(calculateScore(1, 3)).toBe(33);
    });

    it('returns 0 when there are no attempts', () => {
      expect(calculateScore(0, 0)).toBe(0);
    });

    it('never exceeds the max score', () => {
      expect(calculateScore(10, 10)).toBe(100);
      expect(calculateScore(15, 10)).toBe(100);
    });

    it('honours a custom max score', () => {
      expect(calculateScore(5, 10, 50)).toBe(25);
      expect(calculateScore(10, 10, 50)).toBe(50);
    });
  });

  describe('getScoreColor', () => {
    it('maps score bands to colors', () => {
      expect(getScoreColor(100)).toBe(CHALLENGE_COLORS.success);
      expect(getScoreColor(95)).toBe(CHALLENGE_COLORS.success);
      expect(getScoreColor(80)).toBe(CHALLENGE_COLORS.warning);
      expect(getScoreColor(79)).toBe(CHALLENGE_COLORS.error);
      expect(getScoreColor(0)).toBe(CHALLENGE_COLORS.error);
    });
  });

  describe('getScoreEmoji', () => {
    it('maps score bands to emoji', () => {
      expect(getScoreEmoji(100)).toBe('🎉');
      expect(getScoreEmoji(80)).toBe('⭐');
      expect(getScoreEmoji(60)).toBe('👍');
      expect(getScoreEmoji(10)).toBe('💪');
    });
  });

  describe('formatTime', () => {
    it('formats sub-minute durations in seconds', () => {
      expect(formatTime(45)).toBe('45s');
    });

    it('formats minutes and seconds', () => {
      expect(formatTime(60)).toBe('1m 0s');
      expect(formatTime(125)).toBe('2m 5s');
    });
  });

  describe('formatDuration', () => {
    it('converts milliseconds to a formatted duration', () => {
      expect(formatDuration(45000)).toBe('45s');
      expect(formatDuration(125000)).toBe('2m 5s');
    });

    it('truncates partial seconds', () => {
      expect(formatDuration(1999)).toBe('1s');
    });
  });

  describe('getAccessibilityLabel', () => {
    it('builds a label with challenge name and action', () => {
      expect(getAccessibilityLabel('Focus Hold', 'Tap to begin')).toBe(
        'Focus Hold challenge. Tap to begin'
      );
    });

    it('includes state when provided', () => {
      expect(getAccessibilityLabel('Focus Hold', 'Tap to begin', 'in progress')).toBe(
        'Focus Hold challenge, in progress. Tap to begin'
      );
    });
  });
});
