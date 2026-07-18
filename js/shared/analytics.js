// Provider-agnostic analytics dispatch — the one place that knows how to
// hand an event to whatever analytics tool is (or isn't) installed. Pushes
// to window.dataLayer, the convention GTM/GA4/most providers already read
// from, so wiring up a real provider later needs no change here or in any
// caller. Callers only ever call track(name, payload); this never throws.

export function track(eventName, payload = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...payload });
  } catch {
    // Analytics must never break page functionality.
  }
}
