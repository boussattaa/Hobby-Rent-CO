/**
 * Universal Analytics & Conversion Event Dispatcher
 * Integrates with @vercel/analytics (va) and Google Analytics (gtag)
 */

export function trackEvent(eventName, properties = {}) {
    if (typeof window === 'undefined') return;

    try {
        // 1. Vercel Analytics custom event tracking
        if (window.va) {
            window.va('event', { name: eventName, data: properties });
        }

        // 2. Google Analytics 4 (gtag) event tracking
        if (typeof window.gtag === 'function') {
            window.gtag('event', eventName, properties);
        }

        // 3. Optional local debug logging
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics Event] ${eventName}:`, properties);
        }
    } catch (err) {
        // Analytics failures should never crash application UX
        console.warn(`[Analytics Error] Failed to track ${eventName}:`, err);
    }
}
