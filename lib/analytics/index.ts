/**
 * Main analytics interface - single import for all analytics functionality
 */

// Core gtag functionality
export {
  initGA,
  trackPageView,
  trackEvent,
  trackConversion,
  setUserProperty,
  isGAAvailable,
  GA_MEASUREMENT_ID
} from './gtag';

// Event tracking functions
export {
  portfolioEvents,
  engagementEvents,
  navigationEvents,
  performanceEvents,
  EVENT_CATEGORIES
} from './events';

// Chatbot-specific events
export {
  chatbotEvents,
  categorizeQuestion,
  CHATBOT_EVENTS,
  QUESTION_CATEGORIES
} from './chatbot-events';

// Utility functions
export {
  generateSessionId,
  getCurrentPath,
  getReferrer,
  getDeviceType,
  getBrowserInfo,
  hasDoNotTrack,
  isBot,
  debounce,
  throttle,
  sanitizeForAnalytics,
  formatDuration,
  analyticsStorage,
  hashForAnalytics
} from './utils';

// React components and hooks
export { GoogleAnalytics, useAnalyticsConsent } from '@/components/analytics/google-analytics';
export { CookieConsent, PrivacyNotice } from '@/components/analytics/cookie-consent';
export { AnalyticsProvider, useAnalytics, useScrollTracking } from '@/components/analytics/analytics-provider';