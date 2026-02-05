/**
 * Booking State Machine
 * Handles transitions and validation for booking statuses.
 * 
 * Flow:
 * pending -> approved -> paid -> completed
 * pending -> cancelled (by user)
 * pending -> rejected (by owner)
 * approved -> cancelled (by user or owner, refund logic applies. Not handled here)
 */

const BOOKING_STATES = {
    PENDING: 'pending',
    APPROVED: 'approved',
    PAID: 'paid',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected'
};

const TRANSITIONS = {
    [BOOKING_STATES.PENDING]: [BOOKING_STATES.APPROVED, BOOKING_STATES.CANCELLED, BOOKING_STATES.REJECTED],
    [BOOKING_STATES.APPROVED]: [BOOKING_STATES.PAID, BOOKING_STATES.CANCELLED],
    [BOOKING_STATES.PAID]: [BOOKING_STATES.COMPLETED, BOOKING_STATES.CANCELLED], // Refund if cancelled
    [BOOKING_STATES.COMPLETED]: [],
    [BOOKING_STATES.CANCELLED]: [],
    [BOOKING_STATES.REJECTED]: []
};

/**
 * Validates if a transition is allowed
 * @param {string} current 
 * @param {string} next 
 * @returns {boolean}
 */
export function canTransition(current, next) {
    const allowed = TRANSITIONS[current] || [];
    return allowed.includes(next);
}

/**
 * Get human readable label for status
 * @param {string} status 
 * @returns {string}
 */
export function getStatusLabel(status) {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Get color for status badge
 * @param {string} status 
 * @returns {string} Tailwind color class or similar
 */
export function getStatusColor(status) {
    switch (status) {
        case BOOKING_STATES.PENDING: return 'text-yellow-600 bg-yellow-100';
        case BOOKING_STATES.APPROVED: return 'text-blue-600 bg-blue-100';
        case BOOKING_STATES.PAID: return 'text-green-600 bg-green-100';
        case BOOKING_STATES.COMPLETED: return 'text-gray-600 bg-gray-100';
        case BOOKING_STATES.CANCELLED: case BOOKING_STATES.REJECTED: return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
    }
}
