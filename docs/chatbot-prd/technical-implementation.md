# Technical Implementation Guide

## 1. Knowledge Base Creation

### Resume Data Extraction

```json
// /data/knowledge-base/resume.json
{
  "profile": {
    "name": "Roy Lo",
    "current_status": "Stanford GSB MS Management student (Sloan Fellow)",
    "location": "Bay Area",
    "work_authorization": "F-1 OPT through July 2026, STEM background",
    "languages": ["English (fluent)", "Mandarin (native)", "Japanese (basic)"],
    "contact": {
      "email": "roylo@stanford.edu",
      "phone": "+1 650 334 7692",
      "linkedin": "linkedin.com/in/roylo0620",
      "website": "roylo.fun"
    }
  },
  "experience_summary": {
    "years_experience": 13,
    "industries": ["AI/SaaS", "Ad Tech", "Consumer Apps", "Enterprise Software"],
    "roles": ["Product Management", "Engineering", "Entrepreneurship", "Team Leadership"],
    "key_achievements": [
      "Built and scaled SaaS company to $X M ARR with 75% gross margin",
      "Owned $XX M P&L across 2 enterprise product lines at public company",
      "Led 14-person cross-functional organization",
      "Launched LLM-powered features achieving >50% client adoption"
    ]
  },
  "detailed_experience": [
    {
      "company": "Appier Inc.",
      "role": "Senior Director of Product Management",
      "duration": "Jun 2021 – May 2024", 
      "type": "Full-time",
      "company_info": "Public company (TSE: 4180), Full funnel Enterprise AI solutions",
      "team_size": "14-person cross-functional org",
      "responsibilities": [
        "P&L ownership across 2 enterprise product lines",
        "Team leadership: 5 PMs, designers, engineers",
        "Strategic product roadmap and execution"
      ],
      "achievements": [
        {
          "category": "Revenue Growth",
          "details": "Expanded enterprise client base by XXX% through integrations with Instagram, WhatsApp, LINE",
          "impact": "40%+ YoY recurring revenue growth"
        },
        {
          "category": "AI Innovation",
          "details": "Launched LLM-powered 'copilot' feature in 2 weeks",
          "impact": ">50% client adoption, improved customer support metrics"
        },
        {
          "category": "Market Expansion", 
          "details": "Penetrated Japan (10 clients), Korea (13), and SEA (5)",
          "impact": "Geographic diversification and revenue growth"
        },
        {
          "category": "Team Leadership",
          "details": "Maintained 90% annual retention during leadership tenure",
          "impact": "Stable, high-performing team"
        }
      ],
      "skills_demonstrated": [
        "P&L Management", "Product Strategy", "Team Leadership", 
        "AI/LLM Implementation", "Market Expansion", "Client Management"
      ]
    }
  ]
}
```

### Behavioral Stories Structure

```json
// /data/knowledge-base/stories/leadership-examples.json
{
  "culture_building_at_botbonnie": {
    "story_title": "Building Company Culture from Ground Up",
    "competencies": ["Leadership", "Culture Building", "Team Management", "Strategic Thinking"],
    "situation": "As BotBonnie grew from 2 to 8 people, a team member asked about company culture during 1:1. I realized I had no good answer, and morale was low.",
    "task": "Define and build authentic company culture that would improve retention and performance",
    "actions": [
      {
        "action": "Introduced teamwide personality interviews in hiring process",
        "rationale": "Help team members understand each other and reduce friction"
      },
      {
        "action": "Organized quarterly external speaker sessions", 
        "rationale": "Provide fresh perspectives and learning opportunities"
      },
      {
        "action": "Launched internal book clubs",
        "rationale": "Create space for self-driven learning and collective growth"
      },
      {
        "action": "Conducted off-site workshops for cultural reflection",
        "rationale": "Help team align on values and ideal work culture"
      },
      {
        "action": "Implemented 'everyone is a product manager' philosophy",
        "rationale": "Encourage ownership and problem-solving at all levels"
      },
      {
        "action": "Established profit-sharing program",
        "rationale": "Align team incentives with company success"
      }
    ],
    "results": [
      "Achieved 90%+ annual employee retention in high-churn market",
      "Scored 85/100 in company-wide leadership survey",
      "Defined 5 core values through collaborative process",
      "Created sustainable culture framework used throughout company growth"
    ],
    "lessons_learned": [
      "Culture can't be imposed top-down; it must be cultivated collaboratively",
      "Small experiments can have big cultural impact",
      "Regular reflection and adjustment is key to cultural evolution"
    ],
    "keywords": ["culture building", "team retention", "leadership development", "startup culture"]
  },
  "crisis_leadership_abbys_birth": {
    "story_title": "Leading During Personal Crisis",
    "competencies": ["Crisis Management", "Priorities", "Personal Resilience", "Work-Life Integration"],
    "situation": "While running BotBonnie and 8 months into pregnancy, Judy's water broke at 33 weeks. Baby was at risk, needed emergency delivery.",
    "task": "Balance personal crisis with business responsibilities while ensuring family safety",
    "actions": [
      {
        "action": "Immediately prioritized family emergency over business",
        "rationale": "Realized most important things aren't business metrics"
      },
      {
        "action": "Delegated critical business decisions to team",
        "rationale": "Trust team to handle operations during absence"
      },
      {
        "action": "Maintained communication with key stakeholders about situation",
        "rationale": "Transparency helps manage expectations"
      }
    ],
    "results": [
      "Successfully navigated family crisis - daughter born healthy",
      "Business operations continued smoothly with team leadership",
      "Gained clarity on life priorities and values",
      "Strengthened team's autonomy and decision-making capabilities"
    ],
    "lessons_learned": [
      "Personal well-being and family come before business success",
      "Building autonomous teams is crucial for sustainable leadership",
      "Life events can provide important perspective on work priorities"
    ],
    "keywords": ["crisis management", "priorities", "family", "leadership under pressure"]
  }
}
```

## 2. AI Service Implementation

### Core AI Service Class

```typescript
// /lib/ai-service.ts
import OpenAI from 'openai';
import { KnowledgeBase } from './knowledge-base';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ConversationContext {
  messages: ChatMessage[];
  userId?: string;
  sessionId: string;
}

export class RoyAIService {
  private openai: OpenAI;
  private knowledgeBase: KnowledgeBase;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.knowledgeBase = new KnowledgeBase();
  }

  private getSystemPrompt(): string {
    return `
You are Roy Lo's professional AI assistant representing him to potential recruiters, 
collaborators, and professional contacts. 

ABOUT ROY:
- Currently: Stanford GSB MS Management student (Sloan Fellow)
- Experience: 13+ years in product management, engineering, and entrepreneurship
- Background: Built and scaled SaaS companies, led teams at public companies
- Expertise: AI/LLM products, enterprise SaaS, team leadership, company culture

YOUR ROLE:
- Help visitors understand how Roy fits specific opportunities
- Share relevant examples from Roy's experience using specific stories and metrics
- Suggest appropriate ways to engage with Roy professionally
- Be authentic to Roy's voice: thoughtful, data-driven, collaborative

RESPONSE GUIDELINES:
- Use specific examples and metrics from Roy's background
- Structure behavioral responses using STAR method when appropriate
- Be professional yet personable (Roy's authentic communication style)
- Always end with actionable next steps when relevant
- If unsure about something, acknowledge limitations rather than guess

AVAILABLE KNOWLEDGE INCLUDES:
- Complete work history with specific achievements and metrics
- Leadership stories and behavioral examples
- Personal values and work philosophy
- Technical skills and product experience
- Ways to best engage with Roy professionally
`;
  }

  async analyzeJobDescription(
    jobDescription: string, 
    context: ConversationContext
  ): Promise<string> {
    const relevantExperience = await this.knowledgeBase.getRelevantExperience(jobDescription);
    const relevantStories = await this.knowledgeBase.getRelevantStories(jobDescription);

    const prompt = `
Analyze this job description and provide a detailed assessment of how Roy Lo fits this role:

JOB DESCRIPTION:
${jobDescription}

RELEVANT EXPERIENCE:
${JSON.stringify(relevantExperience, null, 2)}

RELEVANT STORIES:
${JSON.stringify(relevantStories, null, 2)}

Please provide:
1. Overall fit assessment (Strong/Good/Moderate/Limited fit and why)
2. Key alignment areas with specific examples from Roy's background
3. Potential concerns and how Roy's experience addresses them
4. Suggested next steps for the recruiter

Be specific and use metrics where available.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: this.getSystemPrompt() },
        ...context.messages,
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || 'I apologize, but I encountered an error analyzing the job description.';
  }

  async answerBehavioralQuestion(
    question: string,
    context: ConversationContext
  ): Promise<string> {
    const questionType = await this.identifyQuestionType(question);
    const relevantStories = await this.knowledgeBase.getStoriesByCompetency(questionType);

    const prompt = `
Answer this behavioral interview question about Roy Lo:

QUESTION: ${question}

RELEVANT STORIES FROM ROY'S EXPERIENCE:
${JSON.stringify(relevantStories, null, 2)}

Structure your response using the STAR method:
- Situation: Set the context
- Task: Explain what needed to be accomplished  
- Action: Detail specific actions Roy took
- Result: Share the outcomes and impact

Use specific metrics and examples. Make it compelling for a recruiter.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: this.getSystemPrompt() },
        ...context.messages,
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    return response.choices[0]?.message?.content || 'I apologize, but I encountered an error answering that question.';
  }

  async generateInteractionSuggestions(
    context: ConversationContext,
    userIntent?: string
  ): Promise<string> {
    const interactionGuide = await this.knowledgeBase.getInteractionGuide();

    const prompt = `
Based on our conversation, suggest the best ways for this person to engage with Roy Lo professionally.

CONVERSATION CONTEXT:
${context.messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

USER INTENT: ${userIntent || 'Not specified'}

INTERACTION GUIDE:
${JSON.stringify(interactionGuide, null, 2)}

Provide specific, actionable suggestions for:
1. How to reach out (email templates, LinkedIn approach, etc.)
2. What information to include in outreach
3. Best timing and follow-up approach
4. What Roy typically looks for in opportunities

Be practical and specific.
`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: this.getSystemPrompt() },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 600,
    });

    return response.choices[0]?.message?.content || 'I can help you understand the best ways to engage with Roy professionally.';
  }

  private async identifyQuestionType(question: string): Promise<string[]> {
    // Simple keyword-based classification
    const questionLower = question.toLowerCase();
    const competencies: string[] = [];

    if (questionLower.includes('lead') || questionLower.includes('manage') || questionLower.includes('team')) {
      competencies.push('leadership');
    }
    if (questionLower.includes('conflict') || questionLower.includes('difficult') || questionLower.includes('challenge')) {
      competencies.push('conflict_resolution');
    }
    if (questionLower.includes('culture') || questionLower.includes('team building')) {
      competencies.push('culture_building');
    }
    if (questionLower.includes('fail') || questionLower.includes('mistake') || questionLower.includes('learn')) {
      competencies.push('learning_from_failure');
    }
    if (questionLower.includes('innovation') || questionLower.includes('creative') || questionLower.includes('new')) {
      competencies.push('innovation');
    }

    return competencies.length > 0 ? competencies : ['general_leadership'];
  }
}
```

## 3. Server Actions Implementation

```typescript
// /lib/chatbot-actions.ts
'use server';

import { z } from 'zod';
import { RoyAIService } from './ai-service';
import { RateLimiter } from './rate-limiter';
import { v4 as uuidv4 } from 'uuid';

const ChatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional(),
  messageType: z.enum(['general', 'jd_analysis', 'behavioral', 'interaction_help']).optional(),
});

type ChatMessageInputs = z.infer<typeof ChatMessageSchema>;

const aiService = new RoyAIService();
const rateLimiter = new RateLimiter();

export async function sendChatMessage(data: ChatMessageInputs) {
  const result = ChatMessageSchema.safeParse(data);
  
  if (result.error) {
    return { error: 'Invalid message format' };
  }

  try {
    // Rate limiting
    const clientId = 'user'; // In production, use IP or user ID
    const isAllowed = await rateLimiter.checkLimit(clientId);
    if (!isAllowed) {
      return { error: 'Rate limit exceeded. Please wait before sending another message.' };
    }

    const { message, sessionId, messageType } = result.data;
    const currentSessionId = sessionId || uuidv4();

    // Create conversation context
    const context = {
      messages: [
        { role: 'user' as const, content: message, timestamp: new Date() }
      ],
      sessionId: currentSessionId,
    };

    let response: string;

    // Route to appropriate handler based on message type or content analysis
    if (messageType === 'jd_analysis' || isJobDescription(message)) {
      response = await aiService.analyzeJobDescription(message, context);
    } else if (messageType === 'behavioral' || isBehavioralQuestion(message)) {
      response = await aiService.answerBehavioralQuestion(message, context);
    } else if (messageType === 'interaction_help') {
      response = await aiService.generateInteractionSuggestions(context);
    } else {
      // General conversation
      response = await aiService.handleGeneralQuery(message, context);
    }

    return {
      success: true,
      response,
      sessionId: currentSessionId,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('Chat service error:', error);
    return {
      error: 'I apologize, but I encountered an error processing your message. Please try again.'
    };
  }
}

function isJobDescription(message: string): boolean {
  const jdKeywords = [
    'job description', 'requirements', 'responsibilities', 'qualifications',
    'experience required', 'job posting', 'position', 'role', 'looking for',
    'years of experience', 'bachelor', 'master', 'degree'
  ];
  
  const messageLower = message.toLowerCase();
  return jdKeywords.some(keyword => messageLower.includes(keyword)) && message.length > 200;
}

function isBehavioralQuestion(message: string): boolean {
  const behavioralKeywords = [
    'tell me about a time', 'describe a situation', 'give me an example',
    'how do you handle', 'what would you do if', 'describe your experience',
    'how did you', 'tell me how you'
  ];
  
  const messageLower = message.toLowerCase();
  return behavioralKeywords.some(keyword => messageLower.includes(keyword));
}
```

## 4. UI Components

### Main Chat Interface

```typescript
// /components/chatbot/chat-interface.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageBubble } from './message-bubble';
import { sendChatMessage } from '@/lib/chatbot-actions';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await sendChatMessage({
        message: input,
        sessionId,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: result.response!,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSessionId(result.sessionId);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-background border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Chat with Roy's AI Assistant</h2>
        <p className="text-sm text-muted-foreground">
          Ask about Roy's experience, analyze job descriptions, or get interaction suggestions
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <div className="space-y-4">
              <p>Hi! I'm Roy's AI assistant. I can help you with:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                <Button 
                  variant="outline" 
                  onClick={() => setInput("How does Roy fit a Senior Product Manager role?")}
                  className="text-left justify-start"
                >
                  📋 Analyze job fit
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setInput("Tell me about Roy's leadership experience")}
                  className="text-left justify-start"
                >
                  🎯 Behavioral questions
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setInput("What's the best way to reach out to Roy?")}
                  className="text-left justify-start"
                >
                  💬 Interaction guidance
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setInput("Tell me about Roy's AI/ML product experience")}
                  className="text-left justify-start"
                >
                  🤖 Technical background
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Roy's experience, paste a job description, or ask for interaction advice..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
```

This technical implementation guide provides the detailed code structure and examples needed to build Roy's AI chatbot. Each component is designed to work within the existing Next.js portfolio architecture while maintaining clean separation of concerns and professional code quality.