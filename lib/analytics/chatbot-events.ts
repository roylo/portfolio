/**
 * Chatbot-specific analytics events
 */

import { trackEvent, trackConversion } from './gtag';
import { EVENT_CATEGORIES } from './events';

// Chatbot Event Types
export const CHATBOT_EVENTS = {
  SESSION_START: 'chatbot_session_start',
  MESSAGE_SENT: 'chatbot_message_sent',
  RESPONSE_RECEIVED: 'chatbot_response_received',
  STORY_CLICKED: 'chatbot_story_clicked',
  CAROUSEL_INTERACTION: 'chatbot_carousel_interaction',
  JD_ANALYSIS: 'chatbot_jd_analysis',
  BEHAVIORAL_QUESTION: 'chatbot_behavioral_question',
  SESSION_END: 'chatbot_session_end',
  ERROR_OCCURRED: 'chatbot_error'
} as const;

// Question Categories for Analysis
export const QUESTION_CATEGORIES = {
  BEHAVIORAL: 'behavioral',
  TECHNICAL: 'technical',
  JD_ANALYSIS: 'jd_analysis',
  GENERAL: 'general',
  EXPERIENCE: 'experience',
  SKILLS: 'skills',
  PROJECTS: 'projects'
} as const;

export const chatbotEvents = {
  /**
   * Track chatbot session start
   */
  startSession: (sessionId: string) => {
    trackEvent(CHATBOT_EVENTS.SESSION_START, {
      event_category: EVENT_CATEGORIES.CHATBOT,
      event_label: 'new_session',
      custom_parameters: {
        session_id: sessionId,
        timestamp: new Date().toISOString()
      }
    });
  },

  /**
   * Track user messages sent to chatbot
   */
  sendMessage: (
    sessionId: string,
    messageLength: number,
    questionCategory: keyof typeof QUESTION_CATEGORIES,
    messageNumber: number
  ) => {
    trackEvent(CHATBOT_EVENTS.MESSAGE_SENT, {
      event_category: EVENT_CATEGORIES.CHATBOT,
      event_label: questionCategory,
      value: messageNumber,
      custom_parameters: {
        session_id: sessionId,
        message_length: messageLength,
        question_category: questionCategory,
        message_number: messageNumber,
        character_count: messageLength
      }
    });
  },

  /**
   * Track chatbot responses
   */
  receiveResponse: (
    sessionId: string,
    responseType: 'text' | 'jd-analysis' | 'behavioral-question' | 'suggestion',
    responseTime: number,
    confidence?: number,
    storiesCount?: number
  ) => {
    trackEvent(CHATBOT_EVENTS.RESPONSE_RECEIVED, {
      event_category: EVENT_CATEGORIES.CHATBOT,
      event_label: responseType,
      value: Math.round(responseTime),
      custom_parameters: {
        session_id: sessionId,
        response_type: responseType,
        response_time_ms: responseTime,
        confidence_score: confidence,
        related_stories_count: storiesCount,
        timestamp: new Date().toISOString()
      }
    });
  },

  /**
   * Track JD analysis usage
   */
  analyzeJobDescription: (
    sessionId: string,
    jdLength: number,
    overallMatch: number,
    matchedExperience: number,
    processingTime: number
  ) => {
    // High-value conversion event
    trackConversion('jd_analysis_completed', overallMatch);
    
    trackEvent(CHATBOT_EVENTS.JD_ANALYSIS, {
      event_category: EVENT_CATEGORIES.CHATBOT,
      event_label: 'jd_analysis_complete',
      value: overallMatch,
      custom_parameters: {
        session_id: sessionId,
        jd_character_count: jdLength,
        overall_match_score: overallMatch,
        matched_experiences_count: matchedExperience,
        processing_time_ms: processingTime,
        high_match: overallMatch > 75,
        conversion_type: 'jd_analysis'
      }
    });
  },

  /**
   * Track behavioral question responses
   */
  answerBehavioralQuestion: (
    sessionId: string,
    questionLength: number,
    confidence: number,
    storiesFound: number,
    responseTime: number,
    questionType?: string
  ) => {
    trackEvent(CHATBOT_EVENTS.BEHAVIORAL_QUESTION, {
      event_category: EVENT_CATEGORIES.CHATBOT,
      event_label: questionType || 'behavioral_general',
      value: confidence,
      custom_parameters: {
        session_id: sessionId,
        question_length: questionLength,
        confidence_score: confidence,
        stories_found: storiesFound,
        response_time_ms: responseTime,
        high_confidence: confidence > 80
      }
    });
  },

  /**
   * Track story clicks from chatbot responses
   */
  clickStory: (
    sessionId: string,
    storySlug: string,
    storyTitle: string,
    clickSource: 'carousel' | 'text_link' | 'suggestion',
    position?: number
  ) => {
    trackEvent(CHATBOT_EVENTS.STORY_CLICKED, {
      event_category: EVENT_CATEGORIES.CHATBOT,
      event_label: `story_${clickSource}`,
      value: position,
      custom_parameters: {
        session_id: sessionId,
        story_slug: storySlug,
        story_title: storyTitle,
        click_source: clickSource,
        position: position,
        conversion_type: 'story_engagement'
      }
    });
  },

  /**
   * Track carousel interactions
   */
  interactWithCarousel: (
    sessionId: string,
    action: 'next' | 'prev' | 'dot_click' | 'card_click',
    cardIndex: number,
    totalCards: number,
    cardTitle?: string
  ) => {
    trackEvent(CHATBOT_EVENTS.CAROUSEL_INTERACTION, {
      event_category: EVENT_CATEGORIES.CHATBOT,
      event_label: `carousel_${action}`,
      value: cardIndex,
      custom_parameters: {
        session_id: sessionId,
        carousel_action: action,
        card_index: cardIndex,
        total_cards: totalCards,
        card_title: cardTitle,
        engagement_depth: cardIndex + 1
      }
    });
  },

  /**
   * Track chatbot errors
   */
  trackError: (
    sessionId: string,
    errorType: 'api_error' | 'search_error' | 'processing_error' | 'timeout',
    errorMessage: string,
    context?: string
  ) => {
    trackEvent(CHATBOT_EVENTS.ERROR_OCCURRED, {
      event_category: EVENT_CATEGORIES.CHATBOT,
      event_label: errorType,
      custom_parameters: {
        session_id: sessionId,
        error_type: errorType,
        error_message: errorMessage.substring(0, 200),
        error_context: context,
        timestamp: new Date().toISOString()
      }
    });
  },

  /**
   * Track session end with summary metrics
   */
  endSession: (
    sessionId: string,
    duration: number,
    messageCount: number,
    conversionsCount: number,
    lastActivity: string
  ) => {
    trackEvent(CHATBOT_EVENTS.SESSION_END, {
      event_category: EVENT_CATEGORIES.CHATBOT,
      event_label: 'session_complete',
      value: Math.round(duration / 1000), // Duration in seconds
      custom_parameters: {
        session_id: sessionId,
        session_duration_ms: duration,
        total_messages: messageCount,
        conversions_count: conversionsCount,
        last_activity: lastActivity,
        engagement_level: messageCount > 5 ? 'high' : messageCount > 2 ? 'medium' : 'low'
      }
    });
  },

  /**
   * Track search queries within chatbot
   */
  searchStories: (
    sessionId: string,
    query: string,
    resultsCount: number,
    searchType: 'vector' | 'keyword' | 'hybrid',
    responseTime: number
  ) => {
    trackEvent('chatbot_search', {
      event_category: EVENT_CATEGORIES.CHATBOT,
      event_label: searchType,
      value: resultsCount,
      custom_parameters: {
        session_id: sessionId,
        search_query: query.substring(0, 100), // Limit for privacy
        results_count: resultsCount,
        search_type: searchType,
        response_time_ms: responseTime,
        no_results: resultsCount === 0
      }
    });
  }
};

/**
 * Categorize questions based on content for analytics
 */
export const categorizeQuestion = (question: string): keyof typeof QUESTION_CATEGORIES => {
  const lowerQuestion = question.toLowerCase();
  
  // JD Analysis patterns
  if (lowerQuestion.includes('job description') || 
      lowerQuestion.includes('role') && lowerQuestion.includes('requirements') ||
      lowerQuestion.includes('jd')) {
    return 'JD_ANALYSIS';
  }
  
  // Behavioral question patterns
  if (lowerQuestion.includes('tell me about') ||
      lowerQuestion.includes('describe a time') ||
      lowerQuestion.includes('give me an example') ||
      lowerQuestion.includes('behavioral')) {
    return 'BEHAVIORAL';
  }
  
  // Technical patterns
  if (lowerQuestion.includes('technical') ||
      lowerQuestion.includes('technology') ||
      lowerQuestion.includes('programming') ||
      lowerQuestion.includes('architecture') ||
      lowerQuestion.includes('system')) {
    return 'TECHNICAL';
  }
  
  // Experience patterns
  if (lowerQuestion.includes('experience') ||
      lowerQuestion.includes('background') ||
      lowerQuestion.includes('worked') ||
      lowerQuestion.includes('career')) {
    return 'EXPERIENCE';
  }
  
  // Skills patterns
  if (lowerQuestion.includes('skills') ||
      lowerQuestion.includes('competenc') ||
      lowerQuestion.includes('ability') ||
      lowerQuestion.includes('expertise')) {
    return 'SKILLS';
  }
  
  // Projects patterns
  if (lowerQuestion.includes('project') ||
      lowerQuestion.includes('built') ||
      lowerQuestion.includes('developed') ||
      lowerQuestion.includes('created')) {
    return 'PROJECTS';
  }
  
  return 'GENERAL';
};