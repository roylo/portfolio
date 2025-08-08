/**
 * Analytics utility functions and helpers
 */

/**
 * Generate unique session ID for analytics tracking
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get current page path for analytics
 */
export const getCurrentPath = (): string => {
  if (typeof window === 'undefined') return '';
  return window.location.pathname;
};

/**
 * Get referrer information
 */
export const getReferrer = (): string => {
  if (typeof window === 'undefined') return '';
  return document.referrer || 'direct';
};

/**
 * Detect user device type
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
};

/**
 * Get browser information
 */
export const getBrowserInfo = (): {
  name: string;
  version: string;
  platform: string;
} => {
  if (typeof window === 'undefined') {
    return { name: 'unknown', version: 'unknown', platform: 'unknown' };
  }

  const userAgent = navigator.userAgent;
  let name = 'unknown';
  let version = 'unknown';
  
  // Detect browser
  if (userAgent.includes('Chrome')) name = 'Chrome';
  else if (userAgent.includes('Firefox')) name = 'Firefox';
  else if (userAgent.includes('Safari')) name = 'Safari';
  else if (userAgent.includes('Edge')) name = 'Edge';
  else if (userAgent.includes('Opera')) name = 'Opera';
  
  // Extract version (simplified)
  const versionMatch = userAgent.match(new RegExp(`${name}\\/(\\d+\\.\\d+)`));
  if (versionMatch) {
    version = versionMatch[1];
  }
  
  return {
    name,
    version,
    platform: navigator.platform || 'unknown'
  };
};

/**
 * Check if user has Do Not Track enabled
 */
export const hasDoNotTrack = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    navigator.doNotTrack === '1' ||
    // @ts-expect-error - some browsers use doNotTrack on window
    window.doNotTrack === '1' ||
    (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack === '1'
  );
};

/**
 * Check if user is likely a bot/crawler
 */
export const isBot = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  const botPatterns = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'facebookexternalhit', 'twitterbot', 'rogerbot',
    'linkedinbot', 'embedly', 'quora link preview', 'showyoubot',
    'outbrain', 'pinterest/0.', 'developers.google.com/+/web/snippet',
    'slackbot', 'vkshare', 'w3c_validator', 'redditbot', 'applebot',
    'whatsapp', 'flipboard', 'tumblr', 'bitlybot', 'skypeuripreview',
    'nuzzel', 'discordbot', 'google page speed', 'qwantify',
    'pinterestbot', 'bitrix link preview', 'xing-contenttabreceiver',
    'chrome-lighthouse', 'telegrambot'
  ];
  
  const userAgent = navigator.userAgent.toLowerCase();
  return botPatterns.some(pattern => userAgent.includes(pattern));
};

/**
 * Debounce function for tracking events that might fire frequently
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): T => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

/**
 * Throttle function for performance events
 */
export const throttle = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): T => {
  let lastCall = 0;
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  }) as T;
};

/**
 * Clean and truncate strings for analytics
 */
export const sanitizeForAnalytics = (str: string, maxLength: number = 100): string => {
  return str
    .replace(/[^\w\s.-]/g, '') // Remove special characters except basic ones
    .substring(0, maxLength)
    .trim();
};

/**
 * Format time duration for analytics
 */
export const formatDuration = (milliseconds: number): {
  seconds: number;
  minutes: number;
  formatted: string;
} => {
  const seconds = Math.round(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return {
    seconds,
    minutes,
    formatted: minutes > 0 
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`
  };
};

/**
 * Storage utilities for analytics preferences
 */
export const analyticsStorage = {
  setConsent: (granted: boolean): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('ga-consent', granted ? 'granted' : 'denied');
    localStorage.setItem('ga-consent-timestamp', new Date().toISOString());
  },
  
  getConsent: (): 'granted' | 'denied' | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('ga-consent') as 'granted' | 'denied' | null;
  },
  
  hasConsent: (): boolean => {
    return analyticsStorage.getConsent() === 'granted';
  },
  
  clearConsent: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('ga-consent');
    localStorage.removeItem('ga-consent-timestamp');
  }
};

/**
 * Privacy-safe data hashing for analytics
 */
export const hashForAnalytics = async (data: string): Promise<string> => {
  if (typeof crypto === 'undefined' || typeof crypto.subtle === 'undefined') {
    // Fallback for environments without crypto.subtle
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
};