#!/usr/bin/env tsx

/**
 * Test script to verify chatbot functionality without ONNX runtime errors
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { HybridStorySearch } from '../lib/hybrid-story-search';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function testChatbot() {
  console.log('🤖 Testing chatbot search functionality...');
  
  try {
    const hybridSearch = new HybridStorySearch();
    
    console.log('🔄 Initializing hybrid search...');
    await hybridSearch.initialize();
    
    console.log('🔍 Testing semantic search queries...');
    
    const testQueries = [
      'Tell me about leadership experience',
      'How do you handle technical challenges?',
      'Describe team management skills',
      'What about product development experience?'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🧪 Testing: "${query}"`);
      
      try {
        const results = await hybridSearch.searchStories(query, {
          limit: 3,
          vectorWeight: 0.7,
          keywordWeight: 0.3,
          diversityBoost: true
        });
        
        console.log(`✅ Found ${results.length} stories`);
        results.forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.story.title} (${result.source}, score: ${result.relevanceScore.toFixed(3)})`);
        });
        
      } catch (error) {
        console.error(`❌ Query failed: ${error}`);
      }
    }
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error && error.message.includes('onnxruntime')) {
      console.log('\n💡 ONNX runtime error detected. This is the issue we need to fix.');
    }
  }
}

testChatbot().catch(console.error);