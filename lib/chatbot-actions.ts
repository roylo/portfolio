'use server';

import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { ResumeDataAccess } from './resume-utils';
import { HybridStorySearch } from './hybrid-story-search';
import type { Message } from '@/components/chatbot';
import type { CarouselCardData } from '@/components/ui/carousel-cards';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Select diverse stories to avoid repetition using advanced selection algorithm
 */
function selectDiverseStories(stories: import('./story-processor').ProcessedStory[], limit: number): import('./story-processor').ProcessedStory[] {
  if (stories.length <= limit) return stories;

  const selected: import('./story-processor').ProcessedStory[] = [];
  const remaining = [...stories];

  // Always include the highest relevance story first
  selected.push(remaining.shift()!);

  // Select remaining stories using diversity scoring
  while (selected.length < limit && remaining.length > 0) {
    let bestIndex = 0;
    let bestDiversityScore = -1;

    remaining.forEach((candidate, index) => {
      let diversityScore = 0;

      // Check diversity against already selected stories
      selected.forEach(selectedStory => {
        // Company diversity bonus
        if (candidate.company !== selectedStory.company) {
          diversityScore += 3;
        }

        // Competency diversity bonus
        const sharedCompetencies = candidate.competencies.filter(c => 
          selectedStory.competencies.includes(c)
        ).length;
        diversityScore += Math.max(0, 5 - sharedCompetencies);

        // Impact diversity bonus
        if (candidate.impactLevel !== selectedStory.impactLevel) {
          diversityScore += 2;
        }

        // Title similarity penalty
        const candidateWords = new Set(candidate.title.toLowerCase().split(' '));
        const selectedWords = new Set(selectedStory.title.toLowerCase().split(' '));
        const commonWords = [...candidateWords].filter(word => selectedWords.has(word)).length;
        const similarity = commonWords / Math.min(candidateWords.size, selectedWords.size);
        diversityScore -= similarity * 3;
      });

      if (diversityScore > bestDiversityScore) {
        bestDiversityScore = diversityScore;
        bestIndex = index;
      }
    });

    selected.push(remaining.splice(bestIndex, 1)[0]);
  }

  return selected;
}

// Initialize hybrid search with fallback
let hybridSearch: HybridStorySearch | null = null;

async function getHybridSearch(): Promise<HybridStorySearch> {
  if (!hybridSearch) {
    hybridSearch = new HybridStorySearch();
    try {
      await hybridSearch.initialize();
    } catch (error) {
      console.warn('Failed to initialize vector search, using keyword fallback:', error);
    }
  }
  return hybridSearch;
}

export interface JDAnalysisResult {
  overallMatch: number; // 0-100
  matchedExperience: {
    company: string;
    role: string;
    relevance: string;
    keyHighlights: string[];
  }[];
  matchedCompetencies: {
    competency: string;
    strength: number;
    evidence: string[];
  }[];
  gapAnalysis: {
    missingSkills: string[];
    developmentAreas: string[];
    suggestions: string[];
  };
  summary: string;
  suggestedStories: string[];
}

export async function analyzeJobDescription(jobDescription: string): Promise<JDAnalysisResult> {
  const resumeAccess = new ResumeDataAccess();
  const hybridSearchInstance = await getHybridSearch();
  
  // Get relevant data
  const resume = resumeAccess.getFullResume();
  const relevantExp = resumeAccess.getRelevantExperienceForJD(jobDescription);
  const competencyProfile = resumeAccess.getCompetencyProfile();
  
  if (!resume) {
    throw new Error('Resume data not available');
  }

  // Enhanced AI analysis with semantic story search
  const searchResults = await hybridSearchInstance.searchStories(
    `job description requirements: ${jobDescription}`, 
    { 
      limit: 5,
      vectorWeight: 0.8, // Prioritize semantic similarity for JD matching
      keywordWeight: 0.2
    }
  );
  
  const relevantStoriesForJD = searchResults.map(result => result.story);
  
  const analysisPrompt = `You are an expert talent analyst. Provide a comprehensive job-candidate fit analysis for Roy Lo against this job description.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE: ROY LO - COMPLETE PROFILE:
${JSON.stringify({
    summary: resume.summary,
    workExperience: resume.workExperience,
    education: resume.education,
    competencyProfile: competencyProfile
  }, null, 2)}

RELEVANT SUCCESS STORIES & ACHIEVEMENTS:
${relevantStoriesForJD.map((story, i) => `
Story ${i+1}: ${story.title}
Company: ${story.company} | Role: ${story.role}
Impact: ${story.impactLevel}
Competencies: ${story.competencies.join(', ')}
Summary: ${story.summary}
Key Results: ${story.starStructure.results.join(' | ')}
`).join('\n')}

ANALYSIS REQUIREMENTS:
1. Calculate match percentage based on role requirements, skills, and experience level
2. Identify specific experiences that directly relate to job requirements
3. Highlight quantifiable achievements and metrics that align
4. Analyze competency gaps honestly and provide growth recommendations
5. Consider cultural fit based on company type and role level
6. Reference specific stories that demonstrate relevant capabilities

Provide a JSON response:
{
  "overallMatch": number (0-100, be realistic and specific),
  "matchedExperience": [
    {
      "company": "exact company name",
      "role": "exact role title", 
      "relevance": "detailed explanation of how this experience applies to the JD requirements",
      "keyHighlights": ["specific achievement 1 with metrics", "specific achievement 2 with metrics"]
    }
  ],
  "matchedCompetencies": [
    {
      "competency": "exact competency name",
      "strength": number (1-10, based on Roy's actual experience),
      "evidence": ["specific example 1", "specific example 2"]
    }
  ],
  "gapAnalysis": {
    "missingSkills": ["skill gaps that could be addressed"],
    "developmentAreas": ["areas for professional growth"],
    "suggestions": ["actionable recommendations for strengthening candidacy"]
  },
  "summary": "Detailed 3-4 sentence assessment covering strengths, fit level, and overall recommendation",
  "suggestedStories": ["story slugs that best demonstrate relevant experience"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: analysisPrompt }],
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    // Enhance with story suggestions from search results
    return {
      ...analysis,
      suggestedStories: relevantStoriesForJD.map(story => story.slug)
    };
  } catch (error) {
    console.error('JD analysis failed:', error);
    
    // Fallback to rule-based analysis
    return {
      overallMatch: relevantExp.relevanceScore,
      matchedExperience: relevantExp.relevantExperience.slice(0, 3).map(exp => ({
        company: exp.company,
        role: exp.role,
        relevance: `${exp.duration} experience in ${exp.competencies.join(', ')}`,
        keyHighlights: exp.achievements.slice(0, 2)
      })),
      matchedCompetencies: relevantExp.matchedCompetencies.map(comp => ({
        competency: comp,
        strength: competencyProfile[comp]?.strength || 5,
        evidence: competencyProfile[comp]?.examples || []
      })),
      gapAnalysis: {
        missingSkills: [],
        developmentAreas: [],
        suggestions: ["Consider highlighting relevant project experience", "Emphasize leadership and technical skills"]
      },
      summary: `Based on Roy's ${resume.summary.totalYearsExperience} years of experience in ${resume.summary.industryExperience.join(', ')}, there appears to be strong alignment with this role.`,
      suggestedStories: []
    };
  }
}

export async function answerBehavioralQuestion(question: string): Promise<{
  answer: string;
  relevantStories: {
    title: string;
    summary: string;
    slug: string;
    relevance: string;
  }[];
  confidence: number;
  fullStories?: import('./story-processor').ProcessedStory[];
}> {
  const hybridSearchInstance = await getHybridSearch();
  const resumeAccess = new ResumeDataAccess();
  
  // Find relevant stories using hybrid search for better semantic matching
  const searchResults = await hybridSearchInstance.searchStories(
    `behavioral interview question: ${question}`,
    {
      limit: 5, // Get more candidates for better diversity selection
      vectorWeight: 0.7, // Balanced approach - less dominant vector search
      keywordWeight: 0.3, // More keyword influence for varied matches
      diversityBoost: true // Ensure diverse story selection
    }
  );
  
  // Select the most diverse 3 stories from the 5 candidates
  const allCandidates = searchResults.map(result => result.story);
  console.log(`📚 Story Selection - Found ${allCandidates.length} candidates:`);
  allCandidates.forEach((story, i) => {
    console.log(`  ${i+1}. "${story.title}" (${story.company}) - Impact: ${story.impactLevel}`);
  });
  
  const selectedStories = selectDiverseStories(allCandidates, 3);
  console.log(`🎯 Selected ${selectedStories.length} diverse stories:`);
  selectedStories.forEach((story, i) => {
    console.log(`  ${i+1}. "${story.title}" (${story.company}) - Impact: ${story.impactLevel}`);
  });
  
  const relevantStories = selectedStories;
  
  if (relevantStories.length === 0) {
    return {
      answer: "I don't have a specific story that directly addresses this question, but my background shows strong experience in leadership, product management, and innovation. I'd be happy to discuss this further in more detail.",
      relevantStories: [],
      confidence: 20,
      fullStories: []
    };
  }

  // Use AI to craft personalized response with enhanced context
  const resume = resumeAccess.getFullResume();
  const answerPrompt = `You are Roy Lo answering this behavioral interview question. Use the STAR method (Situation, Task, Action, Result) and draw from the specific stories and experiences provided.

BEHAVIORAL QUESTION: ${question}

RELEVANT STORIES WITH FULL CONTEXT:
${relevantStories.map((story, i) => `
=== STORY ${i+1}: ${story.title} ===
Company: ${story.company}
Role: ${story.role}
Timeframe: ${Array.isArray(story.timeframe) ? story.timeframe.join('-') : story.timeframe}
Summary: ${story.summary}
Competencies Demonstrated: ${story.competencies.join(', ')}
Impact Level: ${story.impactLevel}
Question Types This Addresses: ${story.questionTypes.join(', ')}

FULL STORY CONTENT:
${story.content}

STAR STRUCTURE:
- Situation: ${story.starStructure.situation}
- Task: ${story.starStructure.task}  
- Actions: ${story.starStructure.actions.join(' | ')}
- Results: ${story.starStructure.results.join(' | ')}
`).join('\n\n')}

ROY'S COMPREHENSIVE BACKGROUND:
${JSON.stringify({
  summary: resume?.summary,
  workExperience: resume?.workExperience.slice(0, 3),
  competencyProfile: resume ? Object.entries(resume.competencyProfile)
    .sort(([,a], [,b]) => b.strength - a.strength)
    .slice(0, 6) : []
}, null, 2)}

INSTRUCTIONS:
1. Answer in first person as Roy ("I", "my experience", "when I was at...")
2. Use STAR method structure but make it conversational, not robotic
3. Choose the MOST relevant story that best answers the question
4. Include specific metrics, numbers, and concrete outcomes when available
5. Show learning and growth from the experience
6. Be authentic - acknowledge challenges and how you overcame them
7. Connect the experience to broader leadership/business principles
8. Length: 150-250 words for a comprehensive but focused answer

Provide a JSON response:
{
  "answer": "Your complete STAR-method response as Roy, speaking naturally and specifically about the chosen experience",
  "confidence": number (0-100) based on how well the stories match the question
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: answerPrompt }],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      answer: result.answer || "I'd be happy to discuss this further in person.",
      relevantStories: relevantStories.map(story => ({
        title: story.title,
        summary: story.summary,
        slug: story.slug,
        relevance: `This story demonstrates ${story.competencies.slice(0, 3).join(', ')}`
      })),
      confidence: result.confidence || 75,
      fullStories: relevantStories
    };
  } catch (error) {
    console.error('Behavioral question answering failed:', error);
    
    // Fallback response
    const primaryStory = relevantStories[0];
    return {
      answer: `Based on my experience, particularly at ${primaryStory.company}, ${primaryStory.summary}`,
      relevantStories: relevantStories.map(story => ({
        title: story.title,
        summary: story.summary,
        slug: story.slug,
        relevance: `Relevant experience in ${story.competencies.join(', ')}`
      })),
      confidence: 60,
      fullStories: relevantStories
    };
  }
}

export async function generateInteractionSuggestions(context: string): Promise<{
  suggestions: {
    category: string;
    items: string[];
  }[];
  personalityInsights: string[];
}> {
  const resumeAccess = new ResumeDataAccess();
  const resume = resumeAccess.getFullResume();
  
  if (!resume) {
    return {
      suggestions: [],
      personalityInsights: []
    };
  }

  const suggestionPrompt = `Based on Roy's background and the context provided, suggest effective ways to interact with him:

CONTEXT: ${context}

ROY'S PROFILE:
${JSON.stringify({
    summary: resume.summary,
    topCompetencies: Object.entries(resume.competencyProfile)
      .sort(([,a], [,b]) => b.strength - a.strength)
      .slice(0, 5),
    recentExperience: resume.workExperience.slice(0, 2)
  }, null, 2)}

Provide a JSON response:
{
  "suggestions": [
    {
      "category": "Interview Approach",
      "items": ["suggestion1", "suggestion2", "suggestion3"]
    },
    {
      "category": "Discussion Topics", 
      "items": ["topic1", "topic2", "topic3"]
    },
    {
      "category": "Questions to Ask",
      "items": ["question1", "question2", "question3"]
    }
  ],
  "personalityInsights": ["insight1", "insight2", "insight3"]
}

Focus on his leadership style, technical depth, and entrepreneurial experience.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', 
      messages: [{ role: 'user', content: suggestionPrompt }],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Suggestion generation failed:', error);
    
    // Fallback suggestions
    return {
      suggestions: [
        {
          category: "Interview Approach",
          items: [
            "Ask about specific product challenges and solutions",
            "Focus on leadership and team building experience", 
            "Discuss technical architecture decisions"
          ]
        },
        {
          category: "Discussion Topics",
          items: [
            "AI/ML product development experience",
            "Startup scaling and acquisition insights",
            "Cross-cultural team management"
          ]
        },
        {
          category: "Questions to Ask",
          items: [
            "How do you approach product-market fit validation?",
            "What's your experience with AI integration in products?",
            "How do you build and maintain high-performing teams?"
          ]
        }
      ],
      personalityInsights: [
        "Values data-driven decision making",
        "Strong focus on team culture and retention",
        "Combines technical depth with business strategy"
      ]
    };
  }
}

export async function processChatMessage(message: string): Promise<Message> {
  // Determine message intent
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('job description') || messageLower.includes('jd') || messageLower.includes('role')) {
    // JD Analysis
    const analysis = await analyzeJobDescription(message);
    
    return {
      id: uuidv4(),
      content: `## Job Description Analysis\n\n**Overall Match: ${analysis.overallMatch}%**\n\n${analysis.summary}\n\n### 🎯 Relevant Experience\n${analysis.matchedExperience.map(exp => 
        `**${exp.role}** at **${exp.company}**\n${exp.relevance}\n\n*Key Highlights:*\n${exp.keyHighlights.map(h => `- ${h}`).join('\n')}`
      ).join('\n\n')}\n\n### 💪 Key Competencies\n${analysis.matchedCompetencies.map(comp => 
        `**${comp.competency}** (Strength: ${comp.strength}/10)\n${comp.evidence.slice(0, 2).map(e => `- ${e}`).join('\n')}`
      ).join('\n\n')}${analysis.gapAnalysis.missingSkills.length > 0 ? `\n\n### 📈 Development Opportunities\n${analysis.gapAnalysis.suggestions.map(s => `- ${s}`).join('\n')}` : ''}`,
      role: 'assistant',
      timestamp: new Date(),
      type: 'jd-analysis',
      metadata: {
        relevanceScore: analysis.overallMatch,
        matchedCompetencies: analysis.matchedCompetencies.map(c => c.competency),
        suggestedStories: analysis.suggestedStories
      }
    };
  }
  
  if (messageLower.includes('behavioral') || messageLower.includes('interview') || 
      messageLower.includes('tell me about') || messageLower.includes('describe a time')) {
    // Behavioral Question
    const answer = await answerBehavioralQuestion(message);
    
    return {
      id: uuidv4(),
      content: answer.answer,
      role: 'assistant',
      timestamp: new Date(),
      type: 'behavioral-question',
      metadata: {
        relevanceScore: answer.confidence,
        suggestedStories: answer.relevantStories.map(s => s.slug)
      },
      carouselCards: answer.relevantStories.length > 0 ? {
        title: "Related Stories",
        cards: answer.relevantStories.map(story => {
          // Get the full story data to extract rich metadata
          const storyData = answer.fullStories?.find(s => s.slug === story.slug);
          return {
            id: story.slug,
            title: story.title,
            description: story.summary,
            details: story.relevance,
            metadata: {
              company: storyData?.company || (story.title.includes('at ') ? story.title.split('at ').pop()?.trim() : undefined),
              role: storyData?.role,
              impact: storyData?.impactLevel,
              competencies: storyData?.competencies.slice(0, 3) || [] // Show top 3 competencies
            }
          } as CarouselCardData;
        })
      } : undefined
    };
  }
  
  if (messageLower.includes('how to') || messageLower.includes('interact') || 
      messageLower.includes('approach') || messageLower.includes('suggest')) {
    // Interaction Suggestions
    const suggestions = await generateInteractionSuggestions(message);
    
    return {
      id: uuidv4(),
      content: `## Interaction Suggestions\n\n${suggestions.suggestions.map(cat => 
        `### ${cat.category}\n${cat.items.map(item => `- ${item}`).join('\n')}`
      ).join('\n\n')}\n\n### Personality Insights\n${suggestions.personalityInsights.map(insight => `- ${insight}`).join('\n')}`,
      role: 'assistant',
      timestamp: new Date(),
      type: 'suggestion'
    };
  }
  
  // Get comprehensive background data for better responses
  const resumeAccess = new ResumeDataAccess();
  const hybridSearchInstance = await getHybridSearch();
  
  const resume = resumeAccess.getFullResume();
  
  // Use hybrid search for better story relevance
  const searchResults = await hybridSearchInstance.searchStories(message, {
    limit: 3,
    vectorWeight: 0.6, // Balanced approach for general questions
    keywordWeight: 0.4,
    diversityBoost: true
  });
  
  const relevantStories = searchResults.map(result => result.story);
  
  if (!resume) {
    return {
      id: uuidv4(),
      content: "I don't have access to my complete background information right now. Please try again later.",
      role: 'assistant',
      timestamp: new Date(),
      type: 'text'
    };
  }

  // Enhanced general conversation with rich context
  const generalPrompt = `You are Roy Lo's digital twin. Answer this question as Roy himself using his comprehensive background and experiences.

QUESTION: ${message}

ROY'S DETAILED BACKGROUND:
${JSON.stringify({
  summary: resume.summary,
  workExperience: resume.workExperience.slice(0, 4), // Recent 4 roles
  education: resume.education,
  competencyProfile: Object.entries(resume.competencyProfile)
    .sort(([,a], [,b]) => b.strength - a.strength)
    .slice(0, 8) // Top 8 competencies
}, null, 2)}

${relevantStories.length > 0 ? `
RELEVANT STORIES & EXAMPLES:
${relevantStories.map((story, i) => `
Story ${i+1}: ${story.title}
Company: ${story.company} | Role: ${story.role}
Summary: ${story.summary}
Key Competencies: ${story.competencies.join(', ')}
Impact Level: ${story.impactLevel}
Content Preview: ${story.content.substring(0, 400)}...
`).join('\n')}
` : ''}

INSTRUCTIONS:
1. Answer as if you ARE Roy speaking in first person ("I have...", "In my experience...")
2. Use specific examples, metrics, and achievements from the background data
3. Reference relevant stories when they add value to your response
4. Be conversational but professional
5. If the question is about specific experiences, draw from the work history and stories
6. For technical questions, leverage the competency profile
7. Keep responses informative but concise (2-4 paragraphs max)
8. If you don't have specific information, acknowledge it honestly

Provide a helpful, detailed response that showcases Roy's expertise and personality.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: generalPrompt }]
    });

    return {
      id: uuidv4(),
      content: response.choices[0].message.content || "I'd be happy to discuss this further.",
      role: 'assistant',
      timestamp: new Date(),
      type: 'text'
    };
  } catch (error) {
    console.error('General chat failed:', error);
    
    return {
      id: uuidv4(),
      content: "I'm having trouble processing that request right now. Please try asking about Roy's experience, education, or specific competencies.",
      role: 'assistant',
      timestamp: new Date(),
      type: 'text'
    };
  }
}