'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle, X, Loader2, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CarouselCards, CarouselCardData } from '@/components/ui/carousel-cards';
import { useAnalytics } from '@/lib/analytics';
import { categorizeQuestion } from '@/lib/analytics/chatbot-events';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date | string;
  type?: 'text' | 'jd-analysis' | 'behavioral-question' | 'suggestion';
  metadata?: {
    relevanceScore?: number;
    matchedCompetencies?: string[];
    suggestedStories?: string[];
  };
  carouselCards?: {
    title: string;
    cards: CarouselCardData[];
  };
}

interface ChatbotProps {
  className?: string;
}

export function Chatbot({ className }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { trackChatbotSession } = useAnalytics();
  const requestStartTime = useRef<number>(0);

  // Initialize with welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Start analytics session when chatbot opens
      trackChatbotSession.start();
      
      // Use setTimeout to ensure this happens after hydration
      setTimeout(() => {
        const welcomeMessage: Message = {
          id: uuidv4(),
          content: "Hi! I'm Roy, or rather, my digital twin. I can help you:\n\n- **Analyze job descriptions** - See how my experience matches your role\n- **Answer behavioral questions** - Share specific examples from my background\n- **Discuss my experience** - Talk about my projects, skills, and career journey\n\nWhat would you like to know about me?",
          role: 'assistant',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages([welcomeMessage]);
        setIsInitialized(true);
      }, 100);
    }
  }, [isOpen, messages.length, trackChatbotSession]);

  // End analytics session when chatbot closes
  useEffect(() => {
    if (!isOpen && isInitialized) {
      trackChatbotSession.end();
    }
  }, [isOpen, isInitialized, trackChatbotSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      // Escape key to minimize if expanded, otherwise close
      if (event.key === 'Escape') {
        event.preventDefault();
        if (isExpanded) {
          setIsExpanded(false);
        } else {
          setIsOpen(false);
        }
      }
      
      // F11 or Cmd/Ctrl + Shift + F to toggle fullscreen
      if ((event.key === 'F11') || 
          ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'F')) {
        event.preventDefault();
        setIsExpanded(!isExpanded);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isExpanded]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    
    // Track message sending with analytics
    const questionCategory = categorizeQuestion(currentInput);
    trackChatbotSession.sendMessage(currentInput, questionCategory);
    requestStartTime.current = Date.now();

    // Add thinking indicator immediately
    const thinkingMessage: Message = {
      id: 'thinking-' + uuidv4(),
      content: 'thinking',
      role: 'assistant',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      // Try streaming response first
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput
        })
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response stream available');
      }

      setIsStreaming(true);

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === 'start') {
                  // Stream connection established - keep thinking indicator visible
                  
                } else if (data.type === 'paragraph_start') {
                  // Remove thinking indicator when first content arrives
                  setMessages(prev => prev.filter(msg => !msg.id.startsWith('thinking-')));
                  
                  // Create a new message bubble for each paragraph
                  const paragraphMessage: Message = {
                    id: data.messageId,
                    content: data.content,
                    role: 'assistant',
                    timestamp: new Date(data.timestamp),
                    type: 'text'
                  };
                  
                  setMessages(prev => [...prev, paragraphMessage]);
                  
                } else if (data.type === 'paragraph_complete') {
                  // Update the paragraph message with final data
                  const finalMessage = data.fullMessage;
                  
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === data.messageId
                        ? finalMessage
                        : msg
                    )
                  );
                  
                  // Track response analytics
                  const responseTime = Date.now() - requestStartTime.current;
                  trackChatbotSession.receiveResponse(
                    finalMessage.type || 'text',
                    responseTime,
                    finalMessage.metadata?.relevanceScore
                  );
                  
                } else if (data.type === 'complete') {
                  // Stream is fully complete
                  console.log('Streaming complete');
                  
                } else if (data.type === 'error') {
                  throw new Error(data.error || 'Streaming error occurred');
                }
                
              } catch (parseError) {
                console.warn('Failed to parse streaming chunk:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
        setIsStreaming(false);
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback to non-streaming response
      try {
        const fallbackResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: currentInput
          })
        });

        if (fallbackResponse.ok) {
          const botResponse: Message = await fallbackResponse.json();
          setMessages(prev => [...prev, botResponse]);
          
          // Track fallback response analytics
          const responseTime = Date.now() - requestStartTime.current;
          trackChatbotSession.receiveResponse(
            botResponse.type || 'text',
            responseTime,
            botResponse.metadata?.relevanceScore
          );
        } else {
          throw error;
        }
      } catch {
        const errorResponse: Message = {
          id: uuidv4(),
          content: "I'm experiencing some technical difficulties. Please try again or contact Roy directly.",
          role: 'assistant',
          timestamp: new Date(),
          type: 'text'
        };
        
        setMessages(prev => [...prev, errorResponse]);
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      // Clean up any remaining thinking messages
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('thinking-')));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    const isThinking = message.content === 'thinking';
    
    return (
      <div
        key={message.id}
        className={cn(
          "flex w-full",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "max-w-[85%] sm:max-w-[80%] md:max-w-[75%] rounded-lg px-4 py-2 text-sm overflow-hidden",
            isUser
              ? "bg-primary text-primary-foreground ml-4"
              : "bg-muted text-foreground mr-4"
          )}
        >
          {isThinking ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          ) : (
            <div className={cn(
              "prose prose-sm max-w-none break-words",
              isUser 
                ? "[&_*]:text-white dark:[&_*]:text-gray-900" // White text in light theme, dark text in dark theme for user messages
                : "dark:prose-invert" // Use dark prose for assistant messages
            )}>
              <ReactMarkdown 
                components={{
                  // Custom rendering for better formatting
                  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                  li: ({ children }) => <li className="ml-0">{children}</li>,
                  p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 underline break-all"
                    >
                      {children}
                    </a>
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          
          {/* Carousel Cards for Related Stories */}
          {message.carouselCards && (
            <div className="mt-3">
              <CarouselCards 
                title={message.carouselCards.title}
                cards={message.carouselCards.cards}
              />
            </div>
          )}
          
          {message.metadata && (
            <div className="mt-2 text-xs opacity-70">
              {message.metadata.relevanceScore && (
                <div>Match: {message.metadata.relevanceScore}%</div>
              )}
              {message.metadata.matchedCompetencies && (
                <div>Skills: {message.metadata.matchedCompetencies.join(', ')}</div>
              )}
            </div>
          )}
          <div className={cn(
            "text-xs mt-1 opacity-50",
            isUser ? "text-right" : "text-left"
          )}>
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all",
          className
        )}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Open chatbot</span>
      </Button>
    );
  }

  return (
    <>
      {/* Background overlay for expanded mode */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          style={{
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: 'fadeIn 0.3s ease-out',
          }}
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      <Card 
        className={cn(
          "fixed flex flex-col shadow-2xl z-50",
          "transform-gpu", // Force GPU acceleration
          isExpanded 
            ? "inset-4 w-auto h-auto animate-in fade-in-0 zoom-in-95 duration-300" // Nearly fullscreen with smooth animation
            : "bottom-6 right-6 w-80 sm:w-96 md:w-[420px] lg:w-[480px] xl:w-[520px] h-[500px] sm:h-[600px] lg:h-[700px]", // Original size
          className
        )}
        style={{
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', // Smoother easing
          transformOrigin: isExpanded ? 'center center' : 'bottom right', // Expand from correct corner
          willChange: 'transform, width, height, top, left, right, bottom',
          backfaceVisibility: 'hidden',
        }}>
      <CardHeader className="border-b py-2 transition-all duration-300 ease-out">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight transition-all duration-300">Roy&apos;s Digital Twin</CardTitle>
            <div className="text-xs text-muted-foreground transition-all duration-300">
              Chat directly with Roy about his experience
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 transition-all duration-200"
              title={isExpanded ? "Minimize chat" : "Expand chat"}
            >
              <div className="transition-transform duration-200">
                {isExpanded ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </div>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 transition-all duration-200"
              title="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {!isInitialized ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              {messages.map(renderMessage)}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <div className="border-t p-4">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize textarea
              if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
              }
            }}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about my experience..."
            disabled={isLoading || isStreaming || !isInitialized}
            className={cn(
              "flex-1 resize-none overflow-y-auto",
              isExpanded 
                ? "min-h-[60px] max-h-[200px]" // Larger in expanded mode
                : "min-h-[40px] max-h-[120px]" // Original size
            )}
            rows={isExpanded ? 2 : 1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || isStreaming || !isInitialized}
            size="icon"
            className="mb-0"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {isExpanded ? (
            <div className="flex flex-col gap-1">
              <div>Try: &ldquo;Analyze this JD&rdquo; or &ldquo;Tell me about your leadership experience&rdquo;</div>
              <div className="opacity-75">Press Esc to minimize • F11 or Cmd+Shift+F to toggle fullscreen</div>
            </div>
          ) : (
            <div>Try: &ldquo;Analyze this JD&rdquo; or &ldquo;Tell me about your leadership experience&rdquo;</div>
          )}
        </div>
      </div>
    </Card>
    </>
  );
}