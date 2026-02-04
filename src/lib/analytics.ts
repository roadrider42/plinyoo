/**
 * Analytics stub for SpoonUp
 * Provides basic event tracking functionality with console logging in development
 * Can be extended later with real analytics providers (PostHog, GA4, etc.)
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

/**
 * Track an analytics event
 * @param event - Event name
 * @param properties - Optional event properties
 */
export const track = (event: string, properties?: Record<string, any>): void => {
  const analyticsEvent: AnalyticsEvent = {
    event,
    properties,
    timestamp: Date.now()
  };

  // Development logging
  if (import.meta.env.DEV) {
    console.log("[Analytics]", analyticsEvent);
  }

  // TODO: Integrate with real analytics provider
  // Example integrations:
  // - PostHog: posthog.capture(event, properties)
  // - GA4: gtag('event', event, properties)
  // - Custom API: sendToAnalytics(analyticsEvent)
};

/**
 * Quiz-specific analytics events
 */
export const QuizAnalytics = {
  view: (step: number, total: number) => 
    track("quiz_view", { step, total }),
  
  select: (step: number, optionId: string) => 
    track("quiz_select", { step, optionId }),
  
  next: (step: number, selected: string | null) => 
    track("quiz_next", { step, selected }),
  
  back: (step: number) => 
    track("quiz_back", { step }),
  
  complete: (total: number, answers: Record<number, string>) => 
    track("quiz_complete", { total, answers }),
  
  abandon: (step: number, total: number) => 
    track("quiz_abandon", { step, total })
};

/**
 * Hook for using analytics in React components
 */
export const useAnalytics = () => {
  return { track, QuizAnalytics };
};
