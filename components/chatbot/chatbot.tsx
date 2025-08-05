'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

interface ChatbotProps {
  className?: string;
}

export function Chatbot({ className }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize with welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Use setTimeout to ensure this happens after hydration
      setTimeout(() => {
        const welcomeMessage: Message = {
          id: uuidv4(),
          content: "Hi! I'm Roy's AI assistant. I can help you:\n\n- **Analyze job descriptions** - See how Roy's experience matches your role\n- **Answer behavioral questions** - Get specific examples from Roy's background\n- **Suggest interaction approaches** - Learn how to best engage with Roy\n\nWhat would you like to know about Roy?",
          role: 'assistant',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages([welcomeMessage]);
        setIsInitialized(true);
      }, 100);
    }
  }, [isOpen, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput
        })
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const botResponse: Message = await response.json();
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorResponse: Message = {
        id: uuidv4(),
        content: "I&apos;m experiencing some technical difficulties. Please try again or contact Roy directly.",
        role: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
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
    <Card className={cn(
      "fixed bottom-6 right-6 w-80 sm:w-96 md:w-[420px] lg:w-[480px] xl:w-[520px] h-[500px] sm:h-[600px] lg:h-[700px] flex flex-col shadow-2xl",
      className
    )}>
      <CardHeader className="border-b py-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg leading-tight">Roy&apos;s AI Assistant</CardTitle>
            <div className="text-xs text-muted-foreground">
              Ask about Roy&apos;s experience & background
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
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
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground rounded-lg px-4 py-2 text-sm mr-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
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
            placeholder="Ask about Roy&apos;s experience..."
            disabled={isLoading || !isInitialized}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none overflow-y-auto"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !isInitialized}
            size="icon"
            className="mb-0"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Try: &ldquo;Analyze this JD&rdquo; or &ldquo;Tell me about Roy&apos;s leadership experience&rdquo;
        </div>
      </div>
    </Card>
  );
}