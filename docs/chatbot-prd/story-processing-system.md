# Story Processing System - Technical Specification

## Overview

This system processes simple markdown story files and automatically extracts metadata, competencies, and structure needed for the AI chatbot. It uses a hybrid approach combining rule-based extraction with AI enhancement for optimal reliability and accuracy.

## Architecture

```
Simple .md files → Story Processor → Structured JSON → Chatbot Knowledge Base
     ↓              ↓                    ↓                ↓
User writes     Rule-based +         Auto-generated     AI consumes
natural        AI processing        rich metadata       structured data
stories
```

## File Structure

### Input: Simple Story Files
```
/content/stories/
├── leadership/
│   ├── culture-building-botbonnie.md
│   └── team-scaling-appier.md
├── product/
│   ├── llm-copilot-launch.md
│   └── ai-automation-rollout.md
└── business/
    └── market-expansion-asia.md
```

### Output: Processed Knowledge Base
```
/data/knowledge-base/
├── stories/
│   ├── leadership-examples.json
│   ├── product-innovation.json
│   └── business-growth.json
└── processed/
    ├── story-index.json
    └── competency-map.json
```

## Simple Story Format (User Input)

```yaml
---
title: "Rapid LLM Feature Launch Under Pressure"
summary: "Launched LLM copilot feature in 2 weeks achieving >50% client adoption"
company: "Appier"
role: "Senior Director of Product Management" 
timeframe: "2023"
---

# The Challenge

In 2023, enterprise clients were asking about AI capabilities after ChatGPT launched. We had competitive pressure to show innovation and client retention was at risk...

# What I Did

I assembled a cross-functional rapid response team and defined minimum viable feature scope. We implemented daily standups and created a rapid client feedback loop...

# The Results

We achieved >50% client adoption within the first quarter and improved customer support response rates significantly...
```

## Processing System Implementation

### 1. Core Story Processor

```typescript
// lib/story-processor.ts
import matter from 'gray-matter';
import OpenAI from 'openai';

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
}

export interface STARStructure {
  situation: string;
  task: string;
  actions: string[];
  results: string[];
}

export class StoryProcessor {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async processStory(filePath: string): Promise<ProcessedStory> {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);
    
    // Step 1: Rule-based extraction
    const ruleBasedData = this.extractRuleBased(content, frontmatter);
    
    // Step 2: AI enhancement for complex analysis
    const aiEnhancedData = await this.enhanceWithAI(content, frontmatter, ruleBasedData);
    
    // Step 3: Combine and validate
    return this.combineAndValidate(ruleBasedData, aiEnhancedData);
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
        'organization', 'retention', 'hire', 'mentor', 'coach'
      ],
      'product_management': [
        'product', 'feature', 'roadmap', 'launch', 'user', 'customer',
        'requirements', 'stakeholder', 'strategy', 'vision'
      ],
      'innovation': [
        'new', 'first', 'novel', 'innovative', 'creative', 'breakthrough',
        'pioneered', 'invented', 'developed from scratch'
      ],
      'crisis_management': [
        'crisis', 'emergency', 'urgent', 'pressure', 'deadline', 'critical',
        'risk', 'threat', 'challenge', 'problem'
      ],
      'growth': [
        'scale', 'expand', 'grow', 'increase', 'revenue', 'clients',
        'market', 'adoption', 'users'
      ],
      'technical': [
        'engineering', 'system', 'architecture', 'API', 'integration',
        'technical', 'development', 'code', 'platform'
      ]
    };

    const foundCompetencies: string[] = [];
    const contentLower = content.toLowerCase();

    for (const [competency, keywords] of Object.entries(competencyPatterns)) {
      const matches = keywords.filter(keyword => contentLower.includes(keyword));
      if (matches.length >= 2) { // Require at least 2 keyword matches
        foundCompetencies.push(competency);
      }
    }

    return foundCompetencies;
  }

  private extractMetrics(content: string): string[] {
    const metricPatterns = [
      /(\d+)%\s+(?:increase|improvement|growth|adoption|retention)/gi,
      /\$(\d+(?:,\d+)*)\s*(?:M|million|K|thousand)/gi,
      /(\d+)\s+(?:clients?|users?|people|team members?)/gi,
      /(\d+(?:,\d+)*)\s+(?:MAU|DAU|requests?|transactions?)/gi,
      /within\s+(\d+)\s+(?:weeks?|months?|days?)/gi,
    ];

    const metrics: string[] = [];
    metricPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        metrics.push(...matches);
      }
    });

    return [...new Set(metrics)]; // Remove duplicates
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
        if (currentSection.title) {
          sections.push(currentSection);
        }
        currentSection = { title: line.replace(/^#+\s*/, ''), content: '' };
      } else {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection.title) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  private async enhanceWithAI(
    content: string, 
    frontmatter: any, 
    ruleBasedData: any
  ): Promise<Partial<ProcessedStory>> {
    const prompt = `
Analyze this professional story and enhance the extracted data:

STORY METADATA:
${JSON.stringify(frontmatter, null, 2)}

STORY CONTENT:
${content}

RULE-BASED EXTRACTION:
${JSON.stringify(ruleBasedData, null, 2)}

Please provide:
1. Interview question types this story answers well
2. Additional competencies not caught by rules
3. Refined STAR structure components
4. Industry context and functional areas
5. Suggested behavioral interview categories

Return as JSON with these keys: interviewCategories, questionTypes, additionalCompetencies, refinedSTAR, industryContext
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.warn('AI enhancement failed, using rule-based data only:', error);
      return {};
    }
  }

  private combineAndValidate(ruleBasedData: any, aiEnhancedData: any): ProcessedStory {
    // Combine rule-based and AI-enhanced data with validation
    return {
      ...ruleBasedData,
      competencies: [...new Set([
        ...ruleBasedData.competencies,
        ...(aiEnhancedData.additionalCompetencies || [])
      ])],
      interviewCategories: aiEnhancedData.interviewCategories || [],
      questionTypes: aiEnhancedData.questionTypes || [],
      // ... combine other fields
    };
  }
}
```

### 2. Build Script

```typescript
// scripts/process-stories.ts
import fs from 'fs';
import path from 'path';
import { StoryProcessor } from '../lib/story-processor';

async function processAllStories() {
  const processor = new StoryProcessor();
  const storiesDir = path.join(process.cwd(), 'content/stories');
  const outputDir = path.join(process.cwd(), 'data/knowledge-base/stories');

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Process all .md files in stories directory
  const storyFiles = getAllMarkdownFiles(storiesDir);
  const processedStories: ProcessedStory[] = [];

  console.log(`Processing ${storyFiles.length} story files...`);

  for (const filePath of storyFiles) {
    try {
      console.log(`Processing: ${path.basename(filePath)}`);
      const processedStory = await processor.processStory(filePath);
      processedStories.push(processedStory);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }

  // Group stories by category
  const groupedStories = groupStoriesByCategory(processedStories);

  // Write processed stories to JSON files
  for (const [category, stories] of Object.entries(groupedStories)) {
    const outputPath = path.join(outputDir, `${category}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(stories, null, 2));
    console.log(`Written ${stories.length} stories to ${category}.json`);
  }

  // Create story index
  const storyIndex = createStoryIndex(processedStories);
  fs.writeFileSync(
    path.join(outputDir, '../story-index.json'),
    JSON.stringify(storyIndex, null, 2)
  );

  console.log('Story processing complete!');
}

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function groupStoriesByCategory(stories: ProcessedStory[]) {
  const groups: Record<string, ProcessedStory[]> = {
    leadership: [],
    product: [],
    technical: [],
    business: [],
    personal: []
  };

  for (const story of stories) {
    // Categorize based on primary competencies
    if (story.competencies.includes('leadership') || story.competencies.includes('team_management')) {
      groups.leadership.push(story);
    } else if (story.competencies.includes('product_management') || story.competencies.includes('innovation')) {
      groups.product.push(story);
    } else if (story.competencies.includes('technical') || story.competencies.includes('engineering')) {
      groups.technical.push(story);
    } else if (story.competencies.includes('growth') || story.competencies.includes('business_strategy')) {
      groups.business.push(story);
    } else {
      groups.personal.push(story);
    }
  }

  return groups;
}

function createStoryIndex(stories: ProcessedStory[]) {
  return {
    total_stories: stories.length,
    competencies: getUniqueCompetencies(stories),
    companies: getUniqueCompanies(stories),
    timeframes: getTimeframes(stories),
    last_updated: new Date().toISOString()
  };
}

// Run the script
if (require.main === module) {
  processAllStories().catch(console.error);
}
```

### 3. Integration with Build Process

```json
// package.json additions
{
  "scripts": {
    "process-stories": "tsx scripts/process-stories.ts",
    "build-knowledge": "npm run process-stories && tsx scripts/build-knowledge-base.ts",
    "dev": "npm run build-knowledge && next dev --turbopack",
    "build": "npm run build-knowledge && next build"
  }
}
```

### 4. Knowledge Base Loader

```typescript
// lib/knowledge-base.ts
import fs from 'fs';
import path from 'path';

export class KnowledgeBase {
  private storiesCache: Map<string, any> = new Map();
  private storyIndex: any = null;

  constructor() {
    this.loadStoryIndex();
  }

  private loadStoryIndex() {
    try {
      const indexPath = path.join(process.cwd(), 'data/knowledge-base/story-index.json');
      this.storyIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    } catch (error) {
      console.warn('Story index not found, run npm run process-stories');
    }
  }

  async getStoriesByCompetency(competencies: string[]): Promise<ProcessedStory[]> {
    const allStories: ProcessedStory[] = [];
    
    // Load all story categories
    const categories = ['leadership', 'product', 'technical', 'business', 'personal'];
    
    for (const category of categories) {
      const stories = await this.loadStoriesCategory(category);
      const matchingStories = stories.filter(story => 
        competencies.some(comp => story.competencies.includes(comp))
      );
      allStories.push(...matchingStories);
    }
    
    return allStories;
  }

  private async loadStoriesCategory(category: string): Promise<ProcessedStory[]> {
    if (this.storiesCache.has(category)) {
      return this.storiesCache.get(category);
    }

    try {
      const filePath = path.join(process.cwd(), `data/knowledge-base/stories/${category}.json`);
      const stories = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      this.storiesCache.set(category, stories);
      return stories;
    } catch (error) {
      console.warn(`Stories category ${category} not found`);
      return [];
    }
  }
}
```

## Usage Workflow

### For You (Story Creation)
1. **Write simple story**: Create `/content/stories/leadership/new-story.md`
2. **Add minimal metadata**: Just title, summary, company, role, timeframe
3. **Write naturally**: No special structure required
4. **Process**: Run `npm run process-stories`
5. **Deploy**: Structured data automatically available to chatbot

### For System (Automated Processing)
1. **Scan**: Find all `.md` files in `/content/stories/`
2. **Extract**: Use rules + AI to extract metadata and structure
3. **Validate**: Ensure data quality and completeness
4. **Group**: Organize by competency categories
5. **Index**: Create searchable index for fast retrieval
6. **Cache**: Load into memory for chatbot usage

## Benefits

- **Sustainable**: Works without manual intervention
- **Scalable**: Process hundreds of stories automatically
- **Reliable**: Hybrid approach ensures processing even if AI fails
- **Maintainable**: Integrates with your existing build process
- **Fast**: Rule-based extraction is instant, AI enhancement is optional

This system ensures you can continuously add stories in simple format while maintaining a rich, structured knowledge base for the chatbot.