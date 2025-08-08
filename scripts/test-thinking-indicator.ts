#!/usr/bin/env tsx

/**
 * Test script to verify thinking indicator behavior
 */

async function testThinkingIndicator() {
  console.log('🧪 Testing thinking indicator...\n');
  
  const testMessage = "What is Roy's experience with AI?";
  
  try {
    // Start the request
    console.log('📤 Sending message:', testMessage);
    console.log('⏱️  Timing analysis:\n');
    
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: testMessage })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`✅ Response initiated after: ${Date.now() - startTime}ms`);
    console.log('📡 Stream events:\n');

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('No response stream available');
    }

    let eventCount = 0;
    let firstContentTime = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              eventCount++;
              const elapsed = Date.now() - startTime;

              if (data.type === 'start') {
                console.log(`🚀 [${elapsed}ms] Stream connection established - thinking indicator should REMAIN VISIBLE`);
                
              } else if (data.type === 'paragraph_start') {
                if (firstContentTime === 0) {
                  firstContentTime = elapsed;
                  console.log(`📝 [${elapsed}ms] First content received - thinking indicator should NOW DISAPPEAR`);
                  console.log(`⏳ Thinking indicator was visible for: ${elapsed}ms (including AI processing time)`);
                } else {
                  console.log(`📝 [${elapsed}ms] Additional paragraph received`);
                }
                
              } else if (data.type === 'complete') {
                console.log(`🎯 [${elapsed}ms] Stream complete`);
              }
              
            } catch (parseError) {
              console.warn(`⚠️  Failed to parse chunk: ${parseError}`);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    const totalTime = Date.now() - startTime;
    
    console.log(`\n📊 Timing Summary:`);
    console.log(`   Total response time: ${totalTime}ms`);
    console.log(`   Thinking indicator duration: ${firstContentTime}ms`);
    console.log(`   Events processed: ${eventCount}`);
    
    if (firstContentTime > 0) {
      console.log(`\n✅ Thinking indicator should work correctly!`);
      console.log(`   - Appears immediately when message sent`);
      console.log(`   - Visible for ${firstContentTime}ms while processing`);
      console.log(`   - Disappears when first content arrives`);
    } else {
      console.log(`\n⚠️  No content received - check server logs`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testThinkingIndicator()
  .then(() => {
    console.log('\n✅ Thinking indicator test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });