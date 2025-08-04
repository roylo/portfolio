# Roy's Portfolio AI Chatbot - Product Requirements Document

## Executive Summary

This document outlines the implementation of an AI-powered chatbot for Roy Lo's portfolio website that serves as an intelligent recruiting assistant. The chatbot will analyze job descriptions, answer behavioral questions using Roy's background stories, and provide interaction suggestions to potential recruiters and collaborators.

## Problem Statement

Recruiters and potential collaborators visiting Roy's portfolio often have specific questions about:
- How Roy's experience aligns with specific job requirements
- Roy's past experiences and behavioral examples
- Best ways to engage with Roy professionally

Currently, this information is scattered across resume PDFs, blog posts, and project descriptions, making it difficult for visitors to quickly find relevant information.

## User Stories & Core Requirements

### Primary User Stories

1. **JD Analysis**: "As a recruiter, I want to paste a job description and get a detailed analysis of how Roy fits this role, so I can quickly assess candidate-role alignment."

2. **Behavioral Questions**: "As a hiring manager, I want to ask behavioral questions and get specific examples from Roy's past experiences, so I can evaluate his soft skills and cultural fit."

3. **Interaction Guidance**: "As a potential collaborator, I want to understand the best ways to engage with Roy, so I can approach him appropriately for opportunities."

### Secondary User Stories

4. "As a visitor, I want to have a natural conversation about Roy's background without searching through multiple pages."
5. "As Roy, I want the chatbot to represent me accurately and professionally."

## Technical Architecture

### High-Level Architecture

```
Frontend (Next.js React) 
    ↓
Server Actions (/lib/actions.ts)
    ↓
AI Service Layer (/lib/ai-service.ts)
    ↓
Knowledge Base (/data/knowledge-base/)
    ↓
External AI API (OpenAI GPT-4 or Anthropic Claude)
```

### Core Components

1. **Knowledge Base System** (`/data/knowledge-base/`)
   - Structured data files containing Roy's information
   - Resume data, project details, personal stories
   - Pre-processed and optimized for AI consumption

2. **AI Service Layer** (`/lib/ai-service.ts`)
   - Handles AI API integration
   - Prompt engineering and context management
   - Response processing and formatting

3. **Chatbot UI Components** (`/components/chatbot/`)
   - Chat interface with message history
   - Input handling and response display
   - Loading states and error handling

4. **Server Actions** (`/lib/actions.ts`)
   - Chat message processing
   - Context management for conversations
   - Rate limiting and security

## Data Structure Design

### Knowledge Base Structure

```
/data/knowledge-base/
├── resume.json              # Structured resume data
├── experiences/
│   ├── appier.json         # Detailed Appier experience
│   ├── botbonnie.json      # BotBonnie founding story
│   ├── fitribe.json        # Fitribe experience
│   └── yahoo-intowow.json  # Early career
├── stories/
│   ├── leadership.json     # Leadership examples
│   ├── culture-building.json # Company culture stories
│   ├── personal.json       # Personal stories (Abby's birth)
│   └── challenges.json     # Overcoming challenges
├── skills/
│   ├── technical.json      # Technical skills & examples
│   ├── product.json        # Product management examples
│   └── leadership.json     # Leadership competencies
└── interaction-guide.json  # How to engage with Roy
```

### Example Data Structure

```json
// /data/knowledge-base/resume.json
{
  "personal": {
    "name": "Roy Lo",
    "location": "Bay Area (Stanford GSB)",
    "email": "roylo@stanford.edu",
    "phone": "+1 650 334 7692",
    "linkedin": "linkedin.com/in/roylo0620",
    "website": "roylo.fun"
  },
  "summary": "Product leader with 8+ years building AI/SaaS products...",
  "experiences": [
    {
      "company": "Appier Inc.",
      "role": "Senior Director of Product Management",
      "duration": "Jun '21 – May '24",
      "achievements": [
        "Owned $XX m P&L across 2 enterprise product lines",
        "Launched LLM-powered copilot feature achieving >50% adoption"
      ]
    }
  ]
}
```

```json
// /data/knowledge-base/stories/leadership.json
{
  "culture_building": {
    "context": "Building company culture at BotBonnie",
    "challenge": "Team asking about company culture, low morale",
    "actions": [
      "Introduced teamwide personality interviews",
      "Organized external speaker sessions",
      "Launched book clubs"
    ],
    "outcome": "90% annual retention, defined core values",
    "skills_demonstrated": ["leadership", "culture_building", "team_management"]
  }
}
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up knowledge base structure
- [ ] Create structured data files from resume and blog posts
- [ ] Implement basic AI service integration
- [ ] Create simple chat UI component

### Phase 2: Core Features (Week 2)
- [ ] Implement JD analysis functionality
- [ ] Build behavioral question answering system
- [ ] Add conversation context management
- [ ] Create interaction suggestions feature

### Phase 3: Enhancement (Week 3)
- [ ] Integrate chatbot into portfolio website
- [ ] Add advanced UI features (typing indicators, etc.)
- [ ] Implement conversation history
- [ ] Add rate limiting and security measures

### Phase 4: Testing & Refinement (Week 4)
- [ ] Comprehensive testing with various scenarios
- [ ] Fine-tune AI prompts and responses
- [ ] Performance optimization
- [ ] User experience polish

## Detailed Implementation Steps

### Step 1: Knowledge Base Creation

1. **Extract Resume Data**
   - Parse PDF content into structured JSON
   - Include achievements, skills, metrics
   - Add contextual information for AI understanding

2. **Process Blog Posts**
   - Extract behavioral examples from posts
   - Categorize stories by competencies (leadership, problem-solving, etc.)
   - Create searchable metadata

3. **Structure Project Information**
   - Detail technical and business achievements
   - Include technologies used and impact metrics
   - Link to portfolio project pages

### Step 2: AI Service Implementation

1. **Prompt Engineering**
   ```typescript
   const systemPrompt = `
   You are Roy Lo's professional AI assistant. You represent Roy, a Stanford GSB 
   student and experienced product leader with expertise in AI/SaaS products.
   
   Your knowledge includes:
   - Roy's complete work history and achievements
   - Personal stories demonstrating leadership and problem-solving
   - Technical skills and product management experience
   - Ways to engage with Roy professionally
   
   Guidelines:
   - Be professional but personable
   - Use specific examples from Roy's experience
   - Provide actionable insights for recruiters
   - Suggest concrete next steps when appropriate
   `;
   ```

2. **Context Management**
   - Maintain conversation history
   - Include relevant knowledge base context
   - Handle follow-up questions intelligently

### Step 3: UI Component Design

1. **Chat Interface Requirements**
   - Clean, professional design matching portfolio theme
   - Message bubbles with Roy's branding
   - Typing indicators and loading states
   - Mobile-responsive design

2. **Integration Points**
   - Floating chat button on portfolio pages
   - Dedicated chatbot page at `/chat`
   - Optional embed on contact page

### Step 4: Specialized Features

1. **JD Analysis Function**
   ```typescript
   async function analyzeJobDescription(jd: string, context: ConversationContext) {
     // Parse JD for key requirements
     // Match against Roy's experience
     // Generate fit analysis with specific examples
     // Suggest potential concerns and mitigations
   }
   ```

2. **Behavioral Question Handler**
   ```typescript
   async function answerBehavioralQuestion(question: string, context: ConversationContext) {
     // Identify question type (leadership, conflict, etc.)
     // Search relevant stories from knowledge base
     // Structure response using STAR method
     // Include specific metrics and outcomes
   }
   ```

## UI/UX Design Specifications

### Chat Interface Layout
- **Header**: "Chat with Roy's AI Assistant"
- **Message Area**: Scrollable conversation history
- **Input Area**: Text input with send button
- **Suggested Prompts**: Quick-start conversation starters

### Sample Conversation Starters
- "How does Roy fit a Senior Product Manager role at [Company]?"
- "Tell me about Roy's leadership experience"
- "What's the best way to reach out to Roy about opportunities?"
- "Describe Roy's experience with AI/ML products"

### Visual Design
- Consistent with portfolio's dark/light theme
- Roy's profile photo for assistant messages
- Professional color scheme
- Smooth animations and transitions

## Testing Strategy

### Functional Testing
1. **JD Analysis Tests**
   - Real job descriptions from different industries
   - Various seniority levels (PM, Director, VP)
   - Edge cases (completely unrelated roles)

2. **Behavioral Question Tests**
   - Standard interview questions
   - Situational questions
   - Follow-up question handling

3. **Conversation Flow Tests**
   - Multi-turn conversations
   - Context switching
   - Error recovery

### Performance Testing
- Response time under 3 seconds
- Concurrent user handling
- AI API rate limit management

### Security Testing
- Input sanitization
- Rate limiting effectiveness
- Conversation data privacy

## Success Metrics

### Primary Metrics
- **Engagement Rate**: % of visitors who interact with chatbot
- **Conversation Length**: Average messages per conversation
- **User Satisfaction**: Thumbs up/down on responses

### Secondary Metrics
- **Feature Usage**: JD analysis vs behavioral questions vs general chat
- **Conversion**: Chatbot users who contact Roy directly
- **Performance**: Average response time and uptime

## Risk Assessment & Mitigation

### Technical Risks
1. **AI Response Quality**
   - Risk: Inaccurate or inappropriate responses
   - Mitigation: Extensive prompt testing, response validation

2. **API Costs**
   - Risk: High OpenAI/Claude API usage costs
   - Mitigation: Request caching, rate limiting, usage monitoring

3. **Performance Issues**
   - Risk: Slow response times affecting UX
   - Mitigation: Response streaming, caching, CDN usage

### Business Risks
1. **Misrepresentation**
   - Risk: AI providing incorrect information about Roy
   - Mitigation: Comprehensive knowledge base validation, regular reviews

2. **Privacy Concerns**
   - Risk: Conversation data handling issues
   - Mitigation: Clear privacy policy, data minimization

## Environment Variables Required

```env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key (alternative)
CHATBOT_RATE_LIMIT=10 # requests per minute per user
ENABLE_CONVERSATION_LOGGING=false # for privacy
```

## Dependencies to Add

```json
{
  "dependencies": {
    "openai": "^4.x.x",
    "@anthropic-ai/sdk": "^0.x.x",
    "rate-limiter-flexible": "^3.x.x",
    "uuid": "^9.x.x"
  }
}
```

## File Structure After Implementation

```
/app/
├── chat/
│   └── page.tsx                 # Dedicated chat page
/components/
├── chatbot/
│   ├── chat-interface.tsx       # Main chat component
│   ├── message-bubble.tsx       # Individual message display
│   ├── chat-input.tsx          # Message input component
│   └── floating-chat-button.tsx # Site-wide chat access
/data/
└── knowledge-base/              # Roy's structured data
/lib/
├── ai-service.ts               # AI integration logic
├── chatbot-actions.ts          # Server actions for chat
└── rate-limiter.ts            # Rate limiting utility
```

This PRD provides a comprehensive roadmap for implementing Roy's AI chatbot. Each phase builds upon the previous one, ensuring a systematic and thorough implementation process.

Would you like me to elaborate on any specific section or make adjustments to the implementation plan?