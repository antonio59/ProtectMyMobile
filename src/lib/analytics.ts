// Analytics tracking helper for ProtectMyMobile

type EventType =
  | 'security_checkup_started'
  | 'security_checkup_completed'
  | 'emergency_guide_viewed'
  | 'bank_contact_clicked'
  | 'provider_contact_clicked'
  | 'community_survey_completed'
  | 'scenario_viewed'
  | 'news_article_viewed';

interface EventMetadata {
  score?: number;
  scoreLevel?: string;
  bankName?: string;
  providerName?: string;
  scenarioId?: string;
  articleSlug?: string;
  categoryBreakdown?: string;
}

// Generate a cryptographically secure session ID for analytics
function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('pmm_session');
  if (!sessionId) {
    // Use crypto.randomUUID() for secure random ID generation
    sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
    sessionStorage.setItem('pmm_session', sessionId);
  }
  return sessionId;
}

// Track analytics event via Convex API
export async function trackEvent(eventType: EventType, metadata?: EventMetadata): Promise<void> {
  try {
    // Get Convex URL from window or env
    const CONVEX_URL = typeof window !== 'undefined'
      ? (window as any).__CONVEX_URL || ''
      : '';

    if (!CONVEX_URL) {
      console.debug('Analytics: No Convex URL configured');
      return;
    }

    await fetch(`${CONVEX_URL}/api/mutation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: 'analytics:trackEvent',
        args: {
          eventType,
          metadata,
          sessionId: getSessionId(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
        },
      }),
    });
  } catch (err) {
    // Silently fail - analytics shouldn't break the app
    console.debug('Analytics tracking failed:', err);
  }
}

// Convenience methods for specific events
export const analytics = {
  trackSecurityCheckupStarted: () => trackEvent('security_checkup_started'),

  trackSecurityCheckupCompleted: (score: number, scoreLevel: string, categoryBreakdown?: string) =>
    trackEvent('security_checkup_completed', { score, scoreLevel, categoryBreakdown }),

  trackEmergencyGuideViewed: () => trackEvent('emergency_guide_viewed'),

  trackBankContactClicked: (bankName: string) =>
    trackEvent('bank_contact_clicked', { bankName }),

  trackProviderContactClicked: (providerName: string) =>
    trackEvent('provider_contact_clicked', { providerName }),

  trackCommunitySurveyCompleted: () => trackEvent('community_survey_completed'),

  trackScenarioViewed: (scenarioId: string) =>
    trackEvent('scenario_viewed', { scenarioId }),

  trackNewsArticleViewed: (articleSlug: string) =>
    trackEvent('news_article_viewed', { articleSlug }),
};

// Initialize Convex URL from script tag or env
export function initAnalytics(convexUrl: string): void {
  if (typeof window !== 'undefined') {
    (window as any).__CONVEX_URL = convexUrl;
  }
}
