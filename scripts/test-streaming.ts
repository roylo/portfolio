#!/usr/bin/env tsx

/**
 * Test script for streaming chatbot responses
 */

async function testStreamingResponse() {
  console.log('🧪 Testing streaming chatbot response...\n');
  
  const testMessage = "Tell me about Roy's leadership experience";
  
  try {
    const response = await fetch('http://localhost:3000/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: testMessage })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ Stream response initiated');
    console.log(`📤 Test message: "${testMessage}"`);
    console.log('📦 Receiving chunks:\n');

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('No response stream available');
    }

    let chunkCount = 0;
    let fullContent = '';

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
              chunkCount++;

              if (data.type === 'start') {
                console.log(`🚀 [${chunkCount}] Stream started (ID: ${data.messageId})`);
                
              } else if (data.type === 'paragraph_start') {
                console.log(`📝 [${chunkCount}] New paragraph ${data.paragraphIndex + 1}/${data.totalParagraphs}:`);
                console.log(`   Content: "${data.content.slice(0, 100)}..."`);
                fullContent += (fullContent ? '\n\n' : '') + data.content;
                
              } else if (data.type === 'paragraph_complete') {
                console.log(`✅ [${chunkCount}] Paragraph complete (ID: ${data.messageId})`);
                
              } else if (data.type === 'complete') {
                console.log(`🎯 [${chunkCount}] Stream complete`);
                console.log(`   Final message type: ${data.fullMessage?.type || 'unknown'}`);
                
              } else if (data.type === 'error') {
                console.log(`❌ [${chunkCount}] Stream error: ${data.error}`);
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

    console.log(`\n📊 Stream Summary:`);
    console.log(`   Chunks received: ${chunkCount}`);
    console.log(`   Content length: ${fullContent.length} characters`);
    console.log(`   Content preview: "${fullContent.slice(0, 100)}..."`);

  } catch (error) {
    console.error('❌ Streaming test failed:', error);
    process.exit(1);
  }
}

// Run the test
testStreamingResponse()
  .then(() => {
    console.log('\n✅ Streaming test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Streaming test failed:', error);
    process.exit(1);
  });