'use client';

import dynamic from 'next/dynamic';

// Import Chatbot with no SSR to prevent hydration issues
const ChatbotComponent = dynamic(() => import('./chatbot').then(mod => ({ default: mod.Chatbot })), {
  ssr: false,
  loading: () => null
});

export function ChatbotWrapper() {
  return <ChatbotComponent />;
}