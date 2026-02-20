/**
 * SyncIndicator Component Tests
 *
 * Tests for sync indicator styling logic (Brutalist).
 */

import {
  getSyncStatusColor,
  getSyncStatusLabel,
  getIndicatorSize,
  getVariantStyles,
} from './SyncIndicator';
import { COLORS, SPACING, BORDER_RADIUS, BORDERS } from '../../config/theme';

describe('SyncIndicator', () => {
  describe('getSyncStatusColor', () => {
    it('returns success color for synced', () => {
      expect(getSyncStatusColor('synced')).toBe(COLORS.success);
    });

    it('returns info color for syncing', () => {
      expect(getSyncStatusColor('syncing')).toBe(COLORS.info);
    });

    it('returns warning color for pending', () => {
      expect(getSyncStatusColor('pending')).toBe(COLORS.warning);
    });

    it('returns warning color for offline', () => {
      expect(getSyncStatusColor('offline')).toBe(COLORS.warning);
    });

    it('returns destructive color for error', () => {
      expect(getSyncStatusColor('error')).toBe(COLORS.destructive);
    });
  });

  describe('getSyncStatusLabel', () => {
    describe('Croatian labels', () => {
      it('returns "Sinkronizirano" for synced', () => {
        expect(getSyncStatusLabel('synced', true)).toBe('Sinkronizirano');
      });

      it('returns "Sinkronizacija..." for syncing', () => {
        expect(getSyncStatusLabel('syncing', true)).toBe('Sinkronizacija...');
      });

      it('returns "Na čekanju" for pending', () => {
        expect(getSyncStatusLabel('pending', true)).toBe('Na čekanju');
      });

      it('returns "Na čekanju (3)" for pending with count', () => {
        expect(getSyncStatusLabel('pending', true, 3)).toBe('Na čekanju (3)');
      });

      it('returns "Offline" for offline', () => {
        expect(getSyncStatusLabel('offline', true)).toBe('Offline');
      });

      it('returns "Greška" for error', () => {
        expect(getSyncStatusLabel('error', true)).toBe('Greška');
      });
    });

    describe('English labels', () => {
      it('returns "Synced" for synced', () => {
        expect(getSyncStatusLabel('synced', false)).toBe('Synced');
      });

      it('returns "Syncing..." for syncing', () => {
        expect(getSyncStatusLabel('syncing', false)).toBe('Syncing...');
      });

      it('returns "Pending" for pending', () => {
        expect(getSyncStatusLabel('pending', false)).toBe('Pending');
      });

      it('returns "Pending (5)" for pending with count', () => {
        expect(getSyncStatusLabel('pending', false, 5)).toBe('Pending (5)');
      });

      it('returns "Offline" for offline', () => {
        expect(getSyncStatusLabel('offline', false)).toBe('Offline');
      });

      it('returns "Error" for error', () => {
        expect(getSyncStatusLabel('error', false)).toBe('Error');
      });
    });
  });

  describe('getIndicatorSize', () => {
    it('returns 8 for dot variant', () => {
      expect(getIndicatorSize('dot')).toBe(8);
    });

    it('returns 10 for pill variant', () => {
      expect(getIndicatorSize('pill')).toBe(10);
    });

    it('returns 16 for icon-only variant', () => {
      expect(getIndicatorSize('icon-only')).toBe(16);
    });
  });

  describe('getVariantStyles', () => {
    describe('dot variant', () => {
      const styles = getVariantStyles('dot', COLORS.success);

      it('has row flex direction', () => {
        expect(styles.flexDirection).toBe('row');
      });

      it('aligns items to center', () => {
        expect(styles.alignItems).toBe('center');
      });

      it('has no background color', () => {
        expect(styles.backgroundColor).toBeUndefined();
      });
    });

    describe('pill variant', () => {
      const color = COLORS.success;
      const styles = getVariantStyles('pill', color);

      it('has row flex direction', () => {
        expect(styles.flexDirection).toBe('row');
      });

      it('has transparent background with color tint', () => {
        expect(styles.backgroundColor).toBe(`${color}15`);
      });

      it('has horizontal padding', () => {
        expect(styles.paddingHorizontal).toBe(SPACING.sm);
      });

      it('has vertical padding', () => {
        expect(styles.paddingVertical).toBe(SPACING.xs);
      });

      it('has no border radius (brutalist)', () => {
        expect(styles.borderRadius).toBe(BORDER_RADIUS.none);
      });

      it('has border (brutalist)', () => {
        expect(styles.borderWidth).toBe(BORDERS.thin);
        expect(styles.borderColor).toBe(COLORS.foreground);
      });
    });

    describe('icon-only variant', () => {
      const styles = getVariantStyles('icon-only', COLORS.success);

      it('has row flex direction', () => {
        expect(styles.flexDirection).toBe('row');
      });

      it('has no background color', () => {
        expect(styles.backgroundColor).toBeUndefined();
      });
    });
  });

  describe('color and variant combinations', () => {
    it('synced with pill variant', () => {
      const color = getSyncStatusColor('synced');
      const styles = getVariantStyles('pill', color);

      expect(color).toBe(COLORS.success);
      expect(styles.backgroundColor).toBe(`${COLORS.success}15`);
    });

    it('error with pill variant', () => {
      const color = getSyncStatusColor('error');
      const styles = getVariantStyles('pill', color);

      expect(color).toBe(COLORS.destructive);
      expect(styles.backgroundColor).toBe(`${COLORS.destructive}15`);
    });

    it('offline with dot variant', () => {
      const color = getSyncStatusColor('offline');
      const size = getIndicatorSize('dot');
      const label = getSyncStatusLabel('offline', true);

      expect(color).toBe(COLORS.warning);
      expect(size).toBe(8);
      expect(label).toBe('Offline');
    });
  });
});
