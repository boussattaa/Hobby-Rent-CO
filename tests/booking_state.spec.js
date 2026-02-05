import { test, expect } from '@playwright/test';
import { canTransition, getStatusColor } from '../utils/bookingStateMachine';

test.describe('Booking State Machine', () => {
    test('allows valid transitions', () => {
        expect(canTransition('pending', 'approved')).toBe(true);
        expect(canTransition('approved', 'paid')).toBe(true);
        expect(canTransition('paid', 'completed')).toBe(true);
    });

    test('blocks invalid transitions', () => {
        expect(canTransition('pending', 'paid')).toBe(false); // Must be approved first
        expect(canTransition('completed', 'pending')).toBe(false); // Cannot go back
    });

    test('returns correct colors', () => {
        expect(getStatusColor('pending')).toContain('yellow');
        expect(getStatusColor('approved')).toContain('blue');
    });
});
