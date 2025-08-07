#!/usr/bin/env tsx

/**
 * Script to populate the Supabase vector store with existing processed stories
 * Usage: npm run populate-supabase-vector-store
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { HybridStorySearch } from '../lib/hybrid-story-search';
import { StoryDataAccess } from '../lib/story-utils';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function populateSupabaseVectorStore() {
  console.log('🚀 Starting Supabase vector store population...');
  
  const hybridSearch = new HybridStorySearch();
  const storyAccess = new StoryDataAccess();

  try {
    // Initialize the hybrid search system
    console.log('📊 Initializing search systems...');
    await hybridSearch.initialize();

    // Check if vector store is available
    const isAvailable = await hybridSearch.isVectorAvailable();
    if (!isAvailable) {
      console.error('❌ Supabase vector store not available. Please check:');
      console.log('   1. NEXT_PUBLIC_SUPABASE_URL is set correctly');
      console.log('   2. SUPABASE_ANON_KEY is set correctly');
      console.log('   3. Database schema is created (run the SQL from SUPABASE_SETUP.md)');
      console.log('   4. pgvector extension is enabled');
      process.exit(1);
    }

    // Get current stats
    const initialStats = await hybridSearch.getStats();
    console.log('📈 Current stats:', JSON.stringify(initialStats, null, 2));

    // Clear existing vector store if it has data
    if (initialStats.vector.count > 0) {
      console.log(`🗑️  Clearing existing ${initialStats.vector.count} stories from Supabase...`);
      await hybridSearch.clearVectorStore();
    }

    // Get all stories
    const allStories = storyAccess.getAllStories();
    console.log(`📚 Found ${allStories.length} stories to process`);

    if (allStories.length === 0) {
      console.log('⚠️  No stories found. Run `npm run process-stories` first.');
      process.exit(0);
    }

    // Populate vector store
    console.log('🔄 Populating Supabase vector store with embeddings...');
    console.log('   This may take a few minutes depending on the number of stories.');
    console.log('   💰 Cost: ~$0.001 for OpenAI embeddings');
    
    const startTime = Date.now();
    await hybridSearch.populateVectorStore();
    const endTime = Date.now();

    // Get final stats
    const finalStats = await hybridSearch.getStats();
    
    console.log('✅ Supabase vector store population complete!');
    console.log(`⏱️  Time taken: ${((endTime - startTime) / 1000).toFixed(2)} seconds`);
    console.log('📊 Final stats:', JSON.stringify(finalStats, null, 2));

    // Test search functionality
    console.log('\n🧪 Testing Supabase vector search functionality...');
    
    const testQueries = [
      'leadership experience',
      'technical challenges',
      'team management',
      'product development'
    ];

    for (const query of testQueries) {
      console.log(`\n🔍 Testing query: "${query}"`);
      
      try {
        const results = await hybridSearch.searchStories(query, { limit: 3 });
        console.log(`   Found ${results.length} relevant stories:`);
        
        results.forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.story.title} (${result.source}, score: ${result.relevanceScore.toFixed(3)})`);
        });
        
        // Check if we're getting vector results
        const hasVectorResults = results.some(r => r.source === 'vector' || r.source === 'hybrid');
        if (hasVectorResults) {
          console.log('   ✅ Vector search working!');
        } else {
          console.log('   ⚠️  Only keyword results - check Supabase connection');
        }
        
      } catch (error) {
        console.error(`   ❌ Search failed:`, error);
      }
    }

    console.log('\n🎉 Supabase vector store setup complete!');
    console.log('🚀 Your chatbot now has enhanced semantic search capabilities via Supabase!');
    console.log('📱 Ready for Vercel production deployment!');
    
  } catch (error) {
    console.error('❌ Failed to populate Supabase vector store:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Supabase URL and key are required')) {
        console.log('\n💡 Environment variables missing. Please add to .env.local:');
        console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
        console.log('   SUPABASE_ANON_KEY=your-anon-key-here');
      } else if (error.message.includes('relation "stories" does not exist')) {
        console.log('\n💡 Database schema not created. Please:');
        console.log('   1. Go to your Supabase SQL Editor');
        console.log('   2. Run the SQL from docs/SUPABASE_SETUP.md');
      } else if (error.message.includes('OpenAI')) {
        console.log('\n💡 OpenAI API issue. Please check your OPENAI_API_KEY environment variable.');
      } else if (error.message.includes('extension "vector" does not exist')) {
        console.log('\n💡 pgvector extension not enabled. Please run:');
        console.log('   CREATE EXTENSION IF NOT EXISTS vector;');
      }
    }
    
    process.exit(1);
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateSupabaseVectorStore().catch(console.error);
}

export { populateSupabaseVectorStore };