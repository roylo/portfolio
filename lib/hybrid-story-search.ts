import { ProcessedStory } from './story-processor';
import { StoryDataAccess } from './story-utils';
import { SupabaseVectorStore, SupabaseSearchOptions, SupabaseVectorSearchResult } from './supabase-vector-store';

export type SearchOptions = SupabaseSearchOptions;
export type VectorSearchResult = SupabaseVectorSearchResult;

export interface HybridSearchResult {
  story: ProcessedStory;
  relevanceScore: number;
  source: 'vector' | 'keyword' | 'hybrid';
  vectorScore?: number;
  keywordScore?: number;
  searchMetadata?: {
    vectorAvailable: boolean;
    vectorDistance?: number;
    searchMethod: 'vector_only' | 'keyword_only' | 'hybrid' | 'fallback';
    fallbackReason?: string;
  };
}

export interface HybridSearchOptions extends SearchOptions {
  vectorWeight?: number;
  keywordWeight?: number;
  diversityBoost?: boolean;
  fallbackToKeyword?: boolean;
}

export class HybridStorySearch {
  private vectorStore: SupabaseVectorStore;
  private keywordStore: StoryDataAccess;

  constructor() {
    this.vectorStore = new SupabaseVectorStore();
    this.keywordStore = new StoryDataAccess();
  }

  /**
   * Initialize the hybrid search system
   */
  async initialize(): Promise<void> {
    await this.vectorStore.initialize();
  }

  /**
   * Check if vector search is available
   */
  async isVectorAvailable(): Promise<boolean> {
    return await this.vectorStore.isAvailable();
  }

  /**
   * Perform keyword-based search using existing system
   */
  private performKeywordSearch(
    query: string, 
    limit: number = 5
  ): { story: ProcessedStory; score: number }[] {
    const stories = this.keywordStore.findRelevantStories(query, limit * 2);
    
    // Convert to scored results
    return stories.map((story, index) => ({
      story,
      score: Math.max(0.1, 1 - (index / stories.length)) // Normalize score 0.1-1.0
    }));
  }

  /**
   * Normalize scores to 0-1 range
   */
  private normalizeScores(results: { score: number }[]): void {
    if (results.length === 0) return;

    const maxScore = Math.max(...results.map(r => r.score));
    const minScore = Math.min(...results.map(r => r.score));
    const range = maxScore - minScore;

    if (range > 0) {
      results.forEach(result => {
        result.score = (result.score - minScore) / range;
      });
    }
  }

  /**
   * Merge vector and keyword results using weighted scoring
   */
  private mergeResults(
    vectorResults: SupabaseVectorSearchResult[],
    keywordResults: { story: ProcessedStory; score: number }[],
    options: {
      vectorWeight: number;
      keywordWeight: number;
      diversityBoost: boolean;
    }
  ): HybridSearchResult[] {
    const { vectorWeight, keywordWeight, diversityBoost } = options;
    const mergedMap = new Map<string, HybridSearchResult>();

    // Add vector results
    vectorResults.forEach(result => {
      const fullStory = this.keywordStore.getStoryBySlug(result.story.slug);
      if (fullStory) {
        mergedMap.set(result.story.slug, {
          story: fullStory,
          relevanceScore: result.relevanceScore * vectorWeight,
          source: 'vector',
          vectorScore: result.relevanceScore,
          keywordScore: 0
        });
      }
    });

    // Add or enhance with keyword results
    keywordResults.forEach(result => {
      const existing = mergedMap.get(result.story.slug);
      
      if (existing) {
        // Combine scores for stories found by both methods
        existing.relevanceScore += result.score * keywordWeight;
        existing.keywordScore = result.score;
        existing.source = 'hybrid';
      } else {
        // Add keyword-only results
        mergedMap.set(result.story.slug, {
          story: result.story,
          relevanceScore: result.score * keywordWeight,
          source: 'keyword',
          vectorScore: 0,
          keywordScore: result.score
        });
      }
    });

    let results = Array.from(mergedMap.values());

    // Apply diversity boost
    if (diversityBoost) {
      results = this.applyDiversityBoost(results);
    }

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results;
  }

  /**
   * Apply diversity boost to avoid clustering similar stories
   * Uses progressive penalties and multiple diversity factors
   */
  private applyDiversityBoost(results: HybridSearchResult[]): HybridSearchResult[] {
    const companyCounts = new Map<string, number>();
    const competencyCounts = new Map<string, number>();
    const impactCounts = new Map<string, number>();
    const titleSimilarity = new Map<string, Set<string>>();

    // Track seen stories to avoid exact duplicates
    const seenStories = new Set<string>();
    const diverseResults: HybridSearchResult[] = [];

    results.forEach(result => {
      // Skip exact duplicates
      if (seenStories.has(result.story.slug)) {
        return;
      }
      seenStories.add(result.story.slug);

      const company = result.story.company;
      const primaryCompetency = result.story.competencies[0];
      const impactLevel = result.story.impactLevel;

      // Count occurrences for diversity tracking
      companyCounts.set(company, (companyCounts.get(company) || 0) + 1);
      impactCounts.set(impactLevel, (impactCounts.get(impactLevel) || 0) + 1);
      if (primaryCompetency) {
        competencyCounts.set(primaryCompetency, (competencyCounts.get(primaryCompetency) || 0) + 1);
      }

      // Calculate progressive diversity penalties
      let diversityMultiplier = 1.0;
      
      // Company diversity - stronger penalties for clustering
      const companyCount = companyCounts.get(company) || 1;
      if (companyCount > 1) {
        diversityMultiplier *= Math.max(0.4, 1 - (companyCount - 1) * 0.3); // 70%, 40%, 10%
      }

      // Competency diversity
      if (primaryCompetency) {
        const competencyCount = competencyCounts.get(primaryCompetency) || 1;
        if (competencyCount > 1) {
          diversityMultiplier *= Math.max(0.6, 1 - (competencyCount - 1) * 0.2); // 80%, 60%, 40%
        }
      }

      // Impact level diversity - encourage mix of high/medium impact
      const impactCount = impactCounts.get(impactLevel) || 1;
      if (impactLevel === 'high' && impactCount > 2) {
        diversityMultiplier *= 0.8; // Slight penalty for too many high-impact stories
      }

      // Title similarity check (simple word overlap)
      const currentWords = new Set(result.story.title.toLowerCase().split(' '));
      let similarityPenalty = 1.0;
      for (const existingWords of titleSimilarity.values()) {
        const overlap = [...currentWords].filter(word => existingWords.has(word)).length;
        const similarity = overlap / Math.min(currentWords.size, existingWords.size);
        if (similarity > 0.4) {
          similarityPenalty *= 0.85; // Penalize similar titles
        }
      }
      titleSimilarity.set(result.story.slug, currentWords);

      diverseResults.push({
        ...result,
        relevanceScore: result.relevanceScore * diversityMultiplier * similarityPenalty
      });
    });

    return diverseResults;
  }

  /**
   * Main search method that combines vector and keyword search
   */
  async searchStories(
    query: string,
    options: HybridSearchOptions = {}
  ): Promise<HybridSearchResult[]> {
    const {
      limit = 5,
      vectorWeight = 0.7,
      keywordWeight = 0.3,
      diversityBoost = true,
      fallbackToKeyword = true,
      useVector = true
    } = options;

    let vectorResults: SupabaseVectorSearchResult[] = [];
    let keywordResults: { story: ProcessedStory; score: number }[] = [];
    const searchMetadata = {
      vectorAvailable: false,
      searchMethod: 'keyword_only' as 'vector_only' | 'keyword_only' | 'hybrid' | 'fallback',
      fallbackReason: undefined as string | undefined
    };

    // Check vector availability
    const vectorAvailable = useVector && await this.isVectorAvailable();
    searchMetadata.vectorAvailable = vectorAvailable;

    console.log(`🔍 Hybrid Search Query: "${query}"`);
    console.log(`📊 Vector Available: ${vectorAvailable}, Use Vector: ${useVector}`);

    // Try vector search first if available and enabled
    if (vectorAvailable) {
      try {
        console.log('🔮 Attempting vector search...');
        vectorResults = await this.vectorStore.searchStories(query, {
          limit: Math.ceil(limit * 1.5), // Get more results for better merging
          threshold: 0.2, // Adjusted threshold based on typical scores (0.4-0.5 range)
          filters: options.filters
        });
        console.log(`✅ Vector search found ${vectorResults.length} results`);
        searchMetadata.searchMethod = 'vector_only';
      } catch (error) {
        console.warn('❌ Vector search failed, falling back to keyword search:', error);
        searchMetadata.fallbackReason = `Vector search error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        
        if (!fallbackToKeyword) {
          throw error;
        }
      }
    } else {
      if (!useVector) {
        searchMetadata.fallbackReason = 'Vector search disabled by options';
      } else {
        searchMetadata.fallbackReason = 'Supabase vector database not available or not initialized';
      }
      console.log(`⚠️  Vector search not available: ${searchMetadata.fallbackReason}`);
    }

    // Always perform keyword search for hybrid approach or as fallback
    console.log('🔤 Performing keyword search...');
    keywordResults = this.performKeywordSearch(query, Math.ceil(limit * 1.5));
    console.log(`✅ Keyword search found ${keywordResults.length} results`);

    // If vector search failed and we have no results, use keyword only
    if (vectorResults.length === 0 && keywordResults.length === 0) {
      console.warn('No search results found');
      return [];
    }

    // Determine final search method
    if (vectorResults.length === 0 && keywordResults.length > 0) {
      searchMetadata.searchMethod = 'keyword_only';
    } else if (vectorResults.length > 0 && keywordResults.length === 0) {
      searchMetadata.searchMethod = 'vector_only';
    } else if (vectorResults.length > 0 && keywordResults.length > 0) {
      searchMetadata.searchMethod = 'hybrid';
    } else {
      searchMetadata.searchMethod = 'fallback';
    }

    console.log(`📈 Final search method: ${searchMetadata.searchMethod}`);

    // If only one search method worked, use it exclusively
    if (vectorResults.length === 0) {
      console.log('🔤 Using keyword-only results');
      return keywordResults.slice(0, limit).map(result => ({
        story: result.story,
        relevanceScore: result.score,
        source: 'keyword' as const,
        keywordScore: result.score,
        vectorScore: 0,
        searchMetadata: {
          ...searchMetadata,
          vectorAvailable: searchMetadata.vectorAvailable
        }
      }));
    }

    if (keywordResults.length === 0) {
      console.log('🔮 Using vector-only results');
      return vectorResults.slice(0, limit).map(result => {
        const fullStory = this.keywordStore.getStoryBySlug(result.story.slug);
        return {
          story: fullStory || result.story,
          relevanceScore: result.relevanceScore,
          source: 'vector' as const,
          vectorScore: result.relevanceScore,
          keywordScore: 0,
          searchMetadata: {
            ...searchMetadata,
            vectorDistance: result.distance,
            vectorAvailable: searchMetadata.vectorAvailable
          }
        };
      });
    }

    // Merge both results
    console.log('🔄 Merging vector and keyword results');
    const mergedResults = this.mergeResults(vectorResults, keywordResults, {
      vectorWeight,
      keywordWeight,
      diversityBoost
    });

    // Add metadata to merged results
    const finalResults = mergedResults.slice(0, limit).map(result => ({
      ...result,
      searchMetadata: {
        ...searchMetadata,
        vectorAvailable: searchMetadata.vectorAvailable
      }
    }));

    console.log(`🎯 Returning ${finalResults.length} hybrid results`);
    return finalResults;
  }

  /**
   * Get search statistics and availability
   */
  async getStats() {
    const vectorStats = await this.vectorStore.getStats();
    const keywordStats = this.keywordStore.getStoryMetrics();

    return {
      vector: vectorStats,
      keyword: {
        available: true,
        count: keywordStats.totalStories,
        competencies: keywordStats.competenciesCount,
        companies: keywordStats.companiesCount
      }
    };
  }

  /**
   * Populate vector store with all existing stories
   */
  async populateVectorStore(): Promise<void> {
    if (!await this.isVectorAvailable()) {
      throw new Error('Vector store not available');
    }

    const allStories = this.keywordStore.getAllStories();
    console.log(`Populating vector store with ${allStories.length} stories...`);
    
    await this.vectorStore.addStories(allStories);
    console.log('Vector store population complete');
  }

  /**
   * Add a single story to both search systems
   */
  async addStory(story: ProcessedStory): Promise<void> {
    // Vector store handles its own addition
    if (await this.isVectorAvailable()) {
      await this.vectorStore.addStory(story);
    }
    
    // Keyword store is updated through file system (no API needed)
    console.log(`Story ${story.slug} added to search systems`);
  }

  /**
   * Clear vector store (keyword store is file-based)
   */
  async clearVectorStore(): Promise<void> {
    if (await this.isVectorAvailable()) {
      await this.vectorStore.clear();
      console.log('Vector store cleared');
    }
  }
}