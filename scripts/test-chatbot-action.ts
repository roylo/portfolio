#!/usr/bin/env tsx

/**
 * Test script to verify actual chatbot actions work without ONNX runtime errors
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { answerBehavioralQuestion } from '../lib/chatbot-actions';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function testChatbotActions() {
  console.log('🎯 Testing chatbot server actions...');
  
  try {
    console.log('\n🧪 Testing behavioral question answering...');
    
    const question = "Tell me about a time you had to lead a team through a challenging situation";
    console.log(`Question: "${question}"`);
    
    const result = await answerBehavioralQuestion(question);
    
    console.log(`✅ Answer generated successfully!`);
    console.log(`Confidence: ${result.confidence}%`);
    console.log(`Relevant stories found: ${result.relevantStories.length}`);
    
    result.relevantStories.forEach((story, index) => {
      console.log(`   ${index + 1}. ${story.title} - ${story.relevance}`);
    });
    
    console.log('\n🎉 Chatbot actions working perfectly!');
    
  } catch (error) {
    console.error('❌ Chatbot action failed:', error);
    if (error instanceof Error && error.message.includes('onnxruntime')) {
      console.log('\n💡 ONNX runtime error detected in server actions.');
    }
  }
}

testChatbotActions().catch(console.error);