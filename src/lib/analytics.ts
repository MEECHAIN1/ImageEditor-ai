// Lightweight tracking helper — attempt gtag, otherwise POST to /api/analytics (optional)
export async function trackEvent(name: string, props: Record<string, any> = {}) {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, props);
      return;
    }
    // Best-effort fallback to a server-side endpoint (if you implement one)
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: name, props }),
    }).catch(() => {});
  } catch {
    // ignore tracking errors
  }
}
