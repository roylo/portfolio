import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { ProcessedStory } from './story-processor';

export interface SupabaseSearchFilters {
  company?: string;
  role?: string;
  competencies?: string[];
  impactLevel?: 'low' | 'medium' | 'high';
  seniorityLevel?: 'junior' | 'mid' | 'senior' | 'executive';
  timeframe?: string[];
}

export interface SupabaseSearchOptions {
  limit?: number;
  threshold?: number;
  useVector?: boolean;
  filters?: SupabaseSearchFilters;
}

export interface SupabaseVectorSearchResult {
  story: ProcessedStory;
  distance: number;
  relevanceScore: number;
}

// Database types for Supabase
export interface StoryRow {
  id: string;
  title: string;
  content: string;
  embedding: string; // PostgreSQL vector as string
  metadata: {
    slug: string;
    company: string;
    role: string;
    timeframe: string;
    seniorityLevel: string;
    impactLevel: string;
    competencies: string;
    interviewCategories: string;
    questionTypes: string;
    hasMetrics: boolean;
    hasResults: boolean;
    competencyCount: number;
  };
  created_at: string;
}

export class SupabaseVectorStore {
  private supabase: SupabaseClient;
  private openai: OpenAI;
  private isInitialized = false;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    // Prefer service role key for admin operations, fallback to anon key
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key are required. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Test connection
      const { error } = await this.supabase
        .from('stories')
        .select('count', { count: 'exact', head: true });

      if (error && !error.message.includes('relation "stories" does not exist')) {
        console.warn('Supabase connection issue:', error);
        this.isInitialized = false;
        return;
      }

      this.isInitialized = true;
      console.log('Supabase vector store initialized successfully');
    } catch (error) {
      console.warn('Supabase not available, vector search disabled:', error);
      this.isInitialized = false;
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.isInitialized;
  }

  /**
   * Create rich context string for embedding generation
   */
  private createRichContext(story: ProcessedStory): string {
    const timeframe = Array.isArray(story.timeframe) 
      ? story.timeframe.join('-') 
      : story.timeframe;

    return `
      Title: ${story.title}
      Summary: ${story.summary}
      
      Context: ${story.starStructure.situation}
      Challenge: ${story.starStructure.task}
      Actions: ${story.starStructure.actions.join('. ')}
      Results: ${story.starStructure.results.join('. ')}
      
      Company: ${story.company} (${timeframe})
      Role: ${story.role} 
      Seniority: ${story.seniorityLevel}
      Impact: ${story.impactLevel}
      
      Competencies: ${story.competencies.join(', ')}
      Interview Categories: ${story.interviewCategories.join(', ')}
      Question Types: ${story.questionTypes.join(', ')}
      
      Key Metrics: ${story.metrics.join(', ')}
      Keywords: ${story.keywords.join(', ')}
    `.trim();
  }

  /**
   * Extract metadata for filtering and ranking
   */
  private extractMetadata(story: ProcessedStory) {
    const timeframe = Array.isArray(story.timeframe) 
      ? story.timeframe.join('-') 
      : story.timeframe;

    return {
      slug: story.slug,
      company: story.company,
      role: story.role,
      timeframe: timeframe,
      seniorityLevel: story.seniorityLevel,
      impactLevel: story.impactLevel,
      // Convert arrays to comma-separated strings for PostgreSQL compatibility
      competencies: story.competencies.join(','),
      interviewCategories: story.interviewCategories.join(','),
      questionTypes: story.questionTypes.join(','),
      // Add relevance boosting factors
      hasMetrics: story.metrics.length > 0,
      hasResults: story.starStructure.results.length > 0,
      competencyCount: story.competencies.length
    };
  }

  /**
   * Generate embedding for text using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw new Error('Embedding generation failed');
    }
  }

  /**
   * Add a story to the vector store
   */
  async addStory(story: ProcessedStory): Promise<void> {
    if (!await this.isAvailable()) {
      throw new Error('Supabase vector store not available');
    }

    const context = this.createRichContext(story);
    const embedding = await this.generateEmbedding(context);
    const metadata = this.extractMetadata(story);

    // Convert embedding array to PostgreSQL vector format
    const embeddingVector = `[${embedding.join(',')}]`;

    const { error } = await this.supabase
      .from('stories')
      .upsert({
        id: story.slug,
        title: story.title,
        content: context,
        embedding: embeddingVector,
        metadata: metadata
      });

    if (error) {
      console.error('Failed to add story to Supabase:', error);
      throw new Error(`Failed to add story: ${error.message}`);
    }

    console.log(`Added story to Supabase vector store: ${story.slug}`);
  }

  /**
   * Add multiple stories in batch
   */
  async addStories(stories: ProcessedStory[]): Promise<void> {
    if (!await this.isAvailable()) {
      throw new Error('Supabase vector store not available');
    }

    console.log(`Processing ${stories.length} stories for Supabase vector store...`);

    // Process in batches to avoid rate limits and payload size limits
    const batchSize = 5;
    for (let i = 0; i < stories.length; i += batchSize) {
      const batch = stories.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(stories.length/batchSize)}`);
      
      const batchData = [];
      
      for (const story of batch) {
        const context = this.createRichContext(story);
        const embedding = await this.generateEmbedding(context);
        const metadata = this.extractMetadata(story);

        batchData.push({
          id: story.slug,
          title: story.title,
          content: context,
          embedding: `[${embedding.join(',')}]`,
          metadata: metadata
        });
      }

      const { error } = await this.supabase
        .from('stories')
        .upsert(batchData);

      if (error) {
        console.error('Failed to add batch to Supabase:', error);
        throw new Error(`Failed to add batch: ${error.message}`);
      }

      // Rate limiting - wait between batches
      if (i + batchSize < stories.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Successfully added ${stories.length} stories to Supabase vector store`);
  }

  /**
   * Search stories using vector similarity
   */
  async searchStories(
    query: string, 
    options: SupabaseSearchOptions = {}
  ): Promise<SupabaseVectorSearchResult[]> {
    if (!await this.isAvailable()) {
      throw new Error('Supabase vector store not available');
    }

    const {
      limit = 5,
      threshold = 0.2,
      filters
    } = options;

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      const embeddingVector = `[${queryEmbedding.join(',')}]`;

      // Build the query with vector similarity search
      let query_builder = this.supabase
        .rpc('search_stories', {
          query_embedding: embeddingVector,
          match_threshold: threshold,
          match_count: limit * 2 // Get more results for filtering
        });

      // Apply filters if provided
      if (filters?.company) {
        query_builder = query_builder.eq('metadata->>company', filters.company);
      }
      if (filters?.role) {
        query_builder = query_builder.eq('metadata->>role', filters.role);
      }
      if (filters?.impactLevel) {
        query_builder = query_builder.eq('metadata->>impactLevel', filters.impactLevel);
      }
      if (filters?.seniorityLevel) {
        query_builder = query_builder.eq('metadata->>seniorityLevel', filters.seniorityLevel);
      }

      const { data, error } = await query_builder;

      if (error) {
        console.error('Supabase vector search failed:', error);
        throw new Error(`Vector search failed: ${error.message}`);
      }

      // Convert results to our format
      const vectorResults: SupabaseVectorSearchResult[] = [];
      
      if (data) {
        for (const row of data) {
          const distance = row.distance || 1.0;
          const relevanceScore = Math.max(0, 1 / (1 + distance)); // Convert distance to similarity score

          // Apply threshold filtering
          if (relevanceScore >= threshold) {
            // Reconstruct story object from metadata
            const metadata = row.metadata;
            const story: ProcessedStory = {
              slug: metadata.slug,
              title: row.title,
              summary: '', // Will be filled from actual story data
              company: metadata.company,
              role: metadata.role,
              timeframe: metadata.timeframe,
              competencies: metadata.competencies?.split(',') || [],
              interviewCategories: metadata.interviewCategories?.split(',') || [],
              questionTypes: metadata.questionTypes?.split(',') || [],
              metrics: [],
              keywords: [],
              starStructure: {
                situation: '',
                task: '',
                actions: [],
                results: []
              },
              impactLevel: metadata.impactLevel as 'low' | 'medium' | 'high',
              seniorityLevel: metadata.seniorityLevel as 'junior' | 'mid' | 'senior' | 'executive',
              content: row.content || ''
            };

            vectorResults.push({
              story,
              distance,
              relevanceScore
            });
          }
        }
      }

      // Sort by relevance score (highest first)
      vectorResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      return vectorResults.slice(0, limit);

    } catch (error) {
      console.error('Supabase vector search failed:', error);
      throw new Error('Vector search failed');
    }
  }

  /**
   * Get collection statistics
   */
  async getStats() {
    if (!await this.isAvailable()) {
      return { available: false, count: 0 };
    }

    try {
      const { count, error } = await this.supabase
        .from('stories')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Failed to get Supabase stats:', error);
        return { available: false, count: 0, error: error };
      }

      return {
        available: true,
        count: count || 0,
        database: 'supabase-postgresql'
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return { available: false, count: 0, error: error };
    }
  }

  /**
   * Clear all stories from the vector store
   */
  async clear(): Promise<void> {
    if (!await this.isAvailable()) {
      throw new Error('Supabase vector store not available');
    }

    try {
      const { error } = await this.supabase
        .from('stories')
        .delete()
        .neq('id', ''); // Delete all rows

      if (error) {
        console.error('Failed to clear Supabase vector store:', error);
        throw error;
      }

      console.log('Supabase vector store cleared');
    } catch (error) {
      console.error('Failed to clear vector store:', error);
      throw error;
    }
  }
}