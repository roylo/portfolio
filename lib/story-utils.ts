import fs from 'fs';
import path from 'path';
import type { ProcessedStory } from './story-processor';

export class StoryDataAccess {
  private stories: ProcessedStory[] = [];
  private competencyMap: Record<string, unknown> = {};

  constructor() {
    this.loadStories();
    this.loadCompetencyMap();
  }

  private loadStories() {
    try {
      const storyDirs = ['leadership', 'product', 'business', 'personal'];
      const allStories: ProcessedStory[] = [];

      storyDirs.forEach(dir => {
        const dirPath = path.join(process.cwd(), 'data', 'knowledge-base', 'stories', `${dir}.json`);
        if (fs.existsSync(dirPath)) {
          const stories = JSON.parse(fs.readFileSync(dirPath, 'utf-8'));
          allStories.push(...stories);
        }
      });

      this.stories = allStories;
    } catch (error) {
      console.error('Failed to load stories:', error);
      this.stories = [];
    }
  }

  private loadCompetencyMap() {
    try {
      const mapPath = path.join(process.cwd(), 'data', 'knowledge-base', 'processed', 'competency-map.json');
      if (fs.existsSync(mapPath)) {
        this.competencyMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
      }
    } catch (error) {
      console.error('Failed to load competency map:', error);
      this.competencyMap = {};
    }
  }

  getAllStories(): ProcessedStory[] {
    return this.stories;
  }

  getStoryBySlug(slug: string): ProcessedStory | undefined {
    return this.stories.find(story => story.slug === slug);
  }

  getStoriesByCompetency(competency: string): ProcessedStory[] {
    return this.stories.filter(story => 
      story.competencies.includes(competency)
    );
  }

  getStoriesByCompany(company: string): ProcessedStory[] {
    return this.stories.filter(story => 
      story.company.toLowerCase().includes(company.toLowerCase())
    );
  }

  getAllCategories(): string[] {
    return Object.keys(this.competencyMap.story_mapping || {});
  }

  getMostCommonCompetencies(limit: number = 10): string[] {
    const mostCommon = this.competencyMap.most_common;
    if (Array.isArray(mostCommon)) {
      return mostCommon.slice(0, limit);
    }
    return [];
  }

  findRelevantStories(query: string, limit: number = 5): ProcessedStory[] {
    const queryLower = query.toLowerCase();
    const scoredStories: { story: ProcessedStory; score: number }[] = [];
    const seenStoryIds = new Set<string>();

    this.stories.forEach(story => {
      // Skip if we've already processed this story (deduplication)
      if (seenStoryIds.has(story.slug)) {
        return;
      }
      seenStoryIds.add(story.slug);

      let score = 0;

      // Check title match
      if (story.title.toLowerCase().includes(queryLower)) {
        score += 3;
      }

      // Check summary match  
      if (story.summary.toLowerCase().includes(queryLower)) {
        score += 2;
      }

      // Check competency match
      story.competencies.forEach(comp => {
        if (queryLower.includes(comp.replace('_', ' '))) {
          score += 2;
        }
      });

      // Check keyword match
      story.keywords.forEach(keyword => {
        if (queryLower.includes(keyword)) {
          score += 1;
        }
      });

      // Check interview categories
      story.interviewCategories.forEach(category => {
        if (queryLower.includes(category.toLowerCase())) {
          score += 2;
        }
      });

      // Check question types
      story.questionTypes.forEach(questionType => {
        if (this.hasSemanticMatch(queryLower, questionType.toLowerCase())) {
          score += 3;
        }
      });

      if (score > 0) {
        scoredStories.push({ story, score });
      }
    });

    // Sort by score with reduced impact bias to encourage diversity
    scoredStories.sort((a, b) => {
      // Reduced impact weighting to allow more variety
      const impactWeight = { high: 1.5, medium: 1.2, low: 1.0 };
      const scoreA = a.score * (impactWeight[a.story.impactLevel] || 1);
      const scoreB = b.score * (impactWeight[b.story.impactLevel] || 1);
      return scoreB - scoreA;
    });

    return scoredStories.slice(0, limit).map(item => item.story);
  }

  private hasSemanticMatch(query: string, questionType: string): boolean {
    // Simple semantic matching for common question patterns
    const patterns = [
      { keywords: ['time', 'when', 'example'], match: ['describe', 'tell', 'example'] },
      { keywords: ['challenge', 'difficult', 'problem'], match: ['challenge', 'difficult', 'obstacle'] },
      { keywords: ['lead', 'leadership', 'manage'], match: ['lead', 'manage', 'leadership'] },
      { keywords: ['team', 'teamwork', 'collaboration'], match: ['team', 'collaborate', 'work'] }
    ];

    return patterns.some(pattern => 
      pattern.keywords.some(keyword => query.includes(keyword)) &&
      pattern.match.some(match => questionType.includes(match))
    );
  }

  getStoryMetrics(): {
    totalStories: number;
    categoriesCount: number;
    competenciesCount: number;
    companiesCount: number;
  } {
    const companies = new Set(this.stories.map(s => s.company));
    const competencies = new Set(this.stories.flatMap(s => s.competencies));
    
    return {
      totalStories: this.stories.length,
      categoriesCount: Object.keys(this.competencyMap.story_mapping || {}).length,
      competenciesCount: competencies.size,
      companiesCount: companies.size
    };
  }

  // Format story for chatbot display
  formatStoryForChat(story: ProcessedStory, includeContent: boolean = false): string {
    let formatted = `**${story.title}**\n${story.summary}`;
    
    if (includeContent) {
      formatted += `\n\n${story.content.substring(0, 300)}...`;
    }
    
    formatted += `\n\n*${story.company} • ${story.role} • ${Array.isArray(story.timeframe) ? story.timeframe.join('-') : story.timeframe}*`;
    
    return formatted;
  }
}