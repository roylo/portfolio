'use client';

/**
 * Clean, minimal cookie consent component with smooth animations
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, Cookie, ExternalLink, X } from 'lucide-react';
import { useAnalyticsConsent } from './google-analytics';
import { cn } from '@/lib/utils';

interface CookieConsentProps {
  className?: string;
}

export function CookieConsent({ className }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { grantConsent, denyConsent, getConsentStatus } = useAnalyticsConsent();
  
  useEffect(() => {
    const consentStatus = getConsentStatus();
    if (consentStatus === null) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 2000); // Slightly longer delay for better UX
      return () => clearTimeout(timer);
    }
  }, [getConsentStatus]);
  
  const handleAccept = () => {
    grantConsent();
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };
  
  const handleDecline = () => {
    denyConsent();
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className={cn(
      "fixed bottom-4 left-4 right-4 md:right-auto md:max-w-md lg:max-w-lg z-50 transition-all duration-500 ease-out",
      isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
      className
    )}>
      {/* Main Consent Card */}
      <div className="bg-background border border-border shadow-xl rounded-lg overflow-hidden">
        {/* Compact Main Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold mb-1">Analytics & Privacy</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Help improve this portfolio with privacy-first analytics.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2 flex-1">
                  <Button
                    variant="outline"
                    size="sm" 
                    onClick={handleDecline}
                    className="flex-1 sm:flex-none h-8 text-xs"
                  >
                    Decline
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={handleAccept}
                    className="flex-1 sm:flex-none h-8 text-xs"
                  >
                    Accept
                  </Button>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs h-8 px-2"
                  >
                    Details
                    <ChevronUp className={cn(
                      "h-3 w-3 ml-1 transition-transform duration-200",
                      showDetails ? "rotate-180" : ""
                    )} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDecline}
                    className="h-8 w-8"
                    aria-label="Close"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
            
        
        {/* Expandable Details */}
        <div className={cn(
          "overflow-hidden transition-all duration-300 ease-out",
          showDetails 
            ? "max-h-80 opacity-100 border-t border-border/30" 
            : "max-h-0 opacity-0"
        )}>
          <div className="p-4 bg-muted/20">
            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-medium text-xs mb-2 text-foreground">What&apos;s tracked:</h4>
                <ul className="space-y-0.5 text-muted-foreground text-xs">
                  <li>• Page views and user journeys</li>
                  <li>• Chatbot interactions & question types</li>
                  <li>• Project engagement & resume downloads</li>
                  <li>• Performance metrics & error tracking</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-xs mb-2 text-foreground">Privacy protections:</h4>
                <ul className="space-y-0.5 text-muted-foreground text-xs">
                  <li>• IP addresses anonymized</li>
                  <li>• No advertising or remarketing</li>
                  <li>• Data used only for portfolio improvement</li>
                  <li>• Full compliance with privacy regulations</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-border/20">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Powered by Google Analytics 4</span>
                  <a 
                    href="https://policies.google.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Change preferences anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Smaller privacy notice for footer or settings
 */
export function PrivacyNotice() {
  const { getConsentStatus } = useAnalyticsConsent();
  const [consentStatus, setConsentStatus] = useState<'granted' | 'denied' | null>(null);
  
  useEffect(() => {
    setConsentStatus(getConsentStatus());
  }, [getConsentStatus]);
  
  return (
    <div className="text-xs text-muted-foreground">
      Analytics: {consentStatus === 'granted' ? 'Enabled' : consentStatus === 'denied' ? 'Disabled' : 'Pending'}
      {consentStatus && (
        <button 
          onClick={() => window.location.reload()} 
          className="ml-2 underline hover:text-foreground"
        >
          Change
        </button>
      )}
    </div>
  );
}