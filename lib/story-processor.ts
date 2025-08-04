import matter from 'gray-matter';
import OpenAI from 'openai';
import fs from 'fs';

export interface ProcessedStory {
  // Original metadata
  title: string;
  summary: string;
  company: string;
  role: string;
  timeframe: string;
  
  // Extracted metadata
  competencies: string[];
  interviewCategories: string[];
  questionTypes: string[];
  metrics: string[];
  keywords: string[];
  starStructure: STARStructure;
  impactLevel: 'low' | 'medium' | 'high';
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'executive';
  
  // Content
  content: string;
  slug: string;
}

export interface STARStructure {
  situation: string;
  task: string;
  actions: string[];
  results: string[];
}

export class StoryProcessor {
  private openai?: OpenAI;
  
  constructor() {
    // Only initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  async processStory(filePath: string): Promise<ProcessedStory> {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);
    
    // Validate required frontmatter
    if (!frontmatter.title || !frontmatter.summary || !frontmatter.company || !frontmatter.role) {
      throw new Error(`Missing required frontmatter in ${filePath}`);
    }
    
    // Step 1: Rule-based extraction
    const ruleBasedData = this.extractRuleBased(content, frontmatter);
    
    // Step 2: AI enhancement for complex analysis (if available)
    const aiEnhancedData = await this.enhanceWithAI(content, frontmatter, ruleBasedData);
    
    // Step 3: Combine and validate
    return this.combineAndValidate(content, frontmatter, ruleBasedData, aiEnhancedData, filePath);
  }

  private extractRuleBased(content: string, frontmatter: any) {
    return {
      competencies: this.extractCompetencies(content),
      metrics: this.extractMetrics(content),
      keywords: this.extractKeywords(content),
      starStructure: this.identifySTARStructure(content),
      impactLevel: this.assessImpactLevel(content),
      seniorityLevel: this.determineSeniorityLevel(frontmatter.role, content)
    };
  }

  private extractCompetencies(content: string): string[] {
    const competencyPatterns = {
      'leadership': [
        'lead', 'manage', 'team', 'culture', 'people', 'direct reports',
        'organization', 'retention', 'hire', 'mentor', 'coach', 'vision'
      ],
      'product_management': [
        'product', 'feature', 'roadmap', 'launch', 'user', 'customer',
        'requirements', 'stakeholder', 'strategy', 'vision', 'mvp'
      ],
      'innovation': [
        'new', 'first', 'novel', 'innovative', 'creative', 'breakthrough',
        'pioneered', 'invented', 'developed from scratch', 'ai', 'llm'
      ],
      'crisis_management': [
        'crisis', 'emergency', 'urgent', 'pressure', 'deadline', 'critical',
        'risk', 'threat', 'challenge', 'problem', 'weeks'
      ],
      'growth': [
        'scale', 'expand', 'grow', 'increase', 'revenue', 'clients',
        'market', 'adoption', 'users', 'arr', 'yoy'
      ],
      'technical': [
        'engineering', 'system', 'architecture', 'api', 'integration',
        'technical', 'development', 'code', 'platform', 'sdk'
      ],
      'culture_building': [
        'culture', 'values', 'retention', 'morale', 'team building',
        'onboarding', 'survey', 'feedback', 'collaboration'
      ],
      'international': [
        'japan', 'korea', 'asia', 'global', 'international', 'market expansion',
        'localization', 'regional', 'geographic'
      ]
    };

    const foundCompetencies: string[] = [];
    const contentLower = content.toLowerCase();

    for (const [competency, keywords] of Object.entries(competencyPatterns)) {
      const matches = keywords.filter(keyword => contentLower.includes(keyword.toLowerCase()));
      if (matches.length >= 2) { // Require at least 2 keyword matches
        foundCompetencies.push(competency);
      }
    }

    return foundCompetencies;
  }

  private extractMetrics(content: string): string[] {
    const metricPatterns = [
      /(\d+)%\s*(?:increase|improvement|growth|adoption|retention|client|annual)/gi,
      /\$(\d+(?:,\d+)*)\s*(?:M|million|K|thousand)/gi,
      /(\d+)\s*(?:clients?|users?|people|team members?|reports?)/gi,
      /(\d+(?:,\d+)*)\s*(?:MAU|DAU|requests?|transactions?)/gi,
      /(?:within|in)\s*(\d+)\s*(?:weeks?|months?|days?)/gi,
      /(\d+(?:\.\d+)?)\s*(?:M|million)\s*(?:ARR|revenue)/gi,
      /(\d+)/g // Extract any numbers for potential metrics
    ];

    const metrics: string[] = [];
    metricPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        // Filter out very small numbers that are likely not metrics
        const filteredMatches = matches.filter(match => {
          const num = parseInt(match.replace(/\D/g, ''));
          return num > 1; // Only include numbers > 1
        });
        metrics.push(...filteredMatches);
      }
    });

    return [...new Set(metrics)].slice(0, 10); // Remove duplicates and limit
  }

  private extractKeywords(content: string): string[] {
    // Extract important keywords for search/matching
    const importantWords = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'but', 'have', 'this', 'that', 'with', 'from', 'they', 'were', 'been', 'have', 'their', 'said', 'each', 'which', 'will', 'what', 'there', 'when', 'make', 'like', 'time', 'very', 'just', 'into', 'more', 'then', 'some', 'would', 'could', 'other'].includes(word)
      );

    // Count frequency and return top keywords
    const wordCount: Record<string, number> = {};
    importantWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);
  }

  private identifySTARStructure(content: string): STARStructure {
    const sections = this.splitIntoSections(content);
    
    return {
      situation: this.findSituationSection(sections),
      task: this.findTaskSection(sections),
      actions: this.findActionSections(sections),
      results: this.findResultSections(sections)
    };
  }

  private splitIntoSections(content: string): Array<{title: string, content: string}> {
    const sections: Array<{title: string, content: string}> = [];
    const lines = content.split('\n');
    
    let currentSection = { title: '', content: '' };
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        if (currentSection.title || currentSection.content.trim()) {
          sections.push(currentSection);
        }
        currentSection = { title: line.replace(/^#+\s*/, ''), content: '' };
      } else {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection.title || currentSection.content.trim()) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  private findSituationSection(sections: Array<{title: string, content: string}>): string {
    // Look for sections that describe the context/situation
    const situationKeywords = ['situation', 'context', 'background', 'challenge', 'problem'];
    
    for (const section of sections) {
      const titleLower = section.title.toLowerCase();
      if (situationKeywords.some(keyword => titleLower.includes(keyword))) {
        return section.content.trim();
      }
    }
    
    // If no explicit situation section, use first paragraph
    const firstSection = sections[0];
    if (firstSection) {
      const firstParagraph = firstSection.content.split('\n\n')[0];
      return firstParagraph.trim();
    }
    
    return '';
  }

  private findTaskSection(sections: Array<{title: string, content: string}>): string {
    const taskKeywords = ['task', 'goal', 'objective', 'needed', 'had to'];
    
    for (const section of sections) {
      const titleLower = section.title.toLowerCase();
      if (taskKeywords.some(keyword => titleLower.includes(keyword))) {
        return section.content.trim();
      }
    }
    
    // Look for task-indicating phrases in content
    for (const section of sections) {
      const contentLower = section.content.toLowerCase();
      if (contentLower.includes('needed to') || contentLower.includes('had to') || contentLower.includes('goal was')) {
        const sentences = section.content.split('.');
        const taskSentence = sentences.find(s => 
          s.toLowerCase().includes('needed to') || 
          s.toLowerCase().includes('had to') ||
          s.toLowerCase().includes('goal was')
        );
        if (taskSentence) return taskSentence.trim();
      }
    }
    
    return '';
  }

  private findActionSections(sections: Array<{title: string, content: string}>): string[] {
    const actionKeywords = ['action', 'did', 'approach', 'solution', 'implemented', 'steps'];
    const actions: string[] = [];
    
    for (const section of sections) {
      const titleLower = section.title.toLowerCase();
      if (actionKeywords.some(keyword => titleLower.includes(keyword))) {
        // Split content into action items
        const actionItems = section.content
          .split(/\n/)
          .filter(line => line.trim() && (line.includes('-') || line.includes('*') || line.includes('1.')))
          .map(line => line.replace(/^[\s\-\*\d\.]+/, '').trim())
          .filter(line => line.length > 10);
        
        actions.push(...actionItems);
      }
    }
    
    return actions.slice(0, 8); // Limit to reasonable number
  }

  private findResultSections(sections: Array<{title: string, content: string}>): string[] {
    const resultKeywords = ['result', 'outcome', 'impact', 'achieved', 'success'];
    const results: string[] = [];
    
    for (const section of sections) {
      const titleLower = section.title.toLowerCase();
      if (resultKeywords.some(keyword => titleLower.includes(keyword))) {
        // Extract results, look for metrics and achievements
        const resultItems = section.content
          .split(/\n/)
          .filter(line => line.trim() && (line.includes('-') || line.includes('*') || line.match(/\d+%/) || line.includes('achieved')))
          .map(line => line.replace(/^[\s\-\*\d\.]+/, '').trim())
          .filter(line => line.length > 5);
        
        results.push(...resultItems);
      }
    }
    
    // Also extract metrics from any section
    const allMetrics = this.extractMetrics(sections.map(s => s.content).join('\n'));
    results.push(...allMetrics.slice(0, 5));
    
    return [...new Set(results)].slice(0, 8); // Remove duplicates and limit
  }

  private assessImpactLevel(content: string): 'low' | 'medium' | 'high' {
    const contentLower = content.toLowerCase();
    
    // High impact indicators
    if (
      contentLower.includes('million') ||
      contentLower.includes('company') ||
      contentLower.includes('organization') ||
      contentLower.includes('strategic') ||
      /\d+%/.test(contentLower) && (contentLower.includes('growth') || contentLower.includes('increase'))
    ) {
      return 'high';
    }
    
    // Medium impact indicators
    if (
      contentLower.includes('team') ||
      contentLower.includes('department') ||
      contentLower.includes('product') ||
      contentLower.includes('client')
    ) {
      return 'medium';
    }
    
    return 'low';
  }

  private determineSeniorityLevel(role: string, content: string): 'junior' | 'mid' | 'senior' | 'executive' {
    const roleLower = role.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (
      roleLower.includes('director') ||
      roleLower.includes('vp') ||
      roleLower.includes('ceo') ||
      roleLower.includes('cto') ||
      roleLower.includes('founder') ||
      contentLower.includes('organization') ||
      contentLower.includes('company-wide')
    ) {
      return 'executive';
    }
    
    if (
      roleLower.includes('senior') ||
      roleLower.includes('lead') ||
      roleLower.includes('principal') ||
      contentLower.includes('team') && contentLower.includes('manage')
    ) {
      return 'senior';
    }
    
    if (
      roleLower.includes('manager') ||
      contentLower.includes('project')
    ) {
      return 'mid';
    }
    
    return 'junior';
  }

  private async enhanceWithAI(
    content: string, 
    frontmatter: any, 
    ruleBasedData: any
  ): Promise<Partial<ProcessedStory>> {
    // If OpenAI is not available, return empty enhancement
    if (!this.openai) {
      console.log('OpenAI not available, using rule-based processing only');
      return {};
    }

    const prompt = `
Analyze this professional story and enhance the extracted data:

STORY METADATA:
${JSON.stringify(frontmatter, null, 2)}

STORY CONTENT:
${content}

RULE-BASED EXTRACTION:
${JSON.stringify(ruleBasedData, null, 2)}

Please provide additional analysis in JSON format with these keys:
- interviewCategories: Array of behavioral interview categories this story addresses
- questionTypes: Array of specific interview questions this story answers well
- additionalCompetencies: Array of competencies not caught by rules
- industryContext: Array of relevant industries/contexts

Focus on behavioral interview applications and keep responses concise.
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 800
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.warn('AI enhancement failed, using rule-based data only:', error);
      return {};
    }
  }

  private combineAndValidate(
    content: string,
    frontmatter: any,
    ruleBasedData: any, 
    aiEnhancedData: any,
    filePath: string
  ): ProcessedStory {
    // Generate slug from file path
    const slug = filePath.split('/').pop()?.replace('.md', '') || 'unknown';
    
    return {
      // Original metadata
      title: frontmatter.title,
      summary: frontmatter.summary,
      company: frontmatter.company,
      role: frontmatter.role,
      timeframe: frontmatter.timeframe || 'Unknown',
      
      // Combined extracted data
      competencies: [...new Set([
        ...ruleBasedData.competencies,
        ...(aiEnhancedData.additionalCompetencies || [])
      ])],
      interviewCategories: aiEnhancedData.interviewCategories || this.generateDefaultInterviewCategories(ruleBasedData.competencies),
      questionTypes: aiEnhancedData.questionTypes || this.generateDefaultQuestionTypes(ruleBasedData.competencies),
      metrics: ruleBasedData.metrics,
      keywords: ruleBasedData.keywords,
      starStructure: ruleBasedData.starStructure,
      impactLevel: ruleBasedData.impactLevel,
      seniorityLevel: ruleBasedData.seniorityLevel,
      
      // Content
      content,
      slug
    };
  }

  private generateDefaultInterviewCategories(competencies: string[]): string[] {
    const categoryMap: Record<string, string[]> = {
      'leadership': ['leadership_and_management', 'team_building'],
      'crisis_management': ['working_under_pressure', 'problem_solving'],
      'innovation': ['driving_innovation', 'leading_change'],
      'growth': ['scaling_business', 'achieving_results'],
      'culture_building': ['building_team_culture', 'employee_development']
    };

    const categories: string[] = [];
    competencies.forEach(comp => {
      if (categoryMap[comp]) {
        categories.push(...categoryMap[comp]);
      }
    });

    return [...new Set(categories)];
  }

  private generateDefaultQuestionTypes(competencies: string[]): string[] {
    const questionMap: Record<string, string[]> = {
      'leadership': ['Tell me about a time you led a team', 'How do you motivate people?'],
      'crisis_management': ['Describe a time you worked under pressure', 'Tell me about a challenging situation'],
      'innovation': ['Give an example of when you innovated', 'How do you approach new challenges?'],
      'growth': ['Tell me about a time you achieved significant results', 'How do you drive growth?']
    };

    const questions: string[] = [];
    competencies.forEach(comp => {
      if (questionMap[comp]) {
        questions.push(...questionMap[comp]);
      }
    });

    return [...new Set(questions)];
  }
}