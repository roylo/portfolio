import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { processChatMessage } from '@/lib/chatbot-actions';

export const runtime = 'nodejs';

// Helper to create streaming response chunks
function createChunk(data: Record<string, unknown>) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// Helper to split text into paragraphs for separate message bubbles
function splitIntoParagraphs(text: string): string[] {
  // First split by double newlines (paragraph breaks)
  let paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
  
  // If no paragraph breaks, split by single newlines
  if (paragraphs.length === 1) {
    paragraphs = text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
  }
  
  // If still one paragraph, check for markdown section breaks
  if (paragraphs.length === 1) {
    const sections = text.split(/###\s+/).map(p => p.trim()).filter(p => p.length > 0);
    if (sections.length > 1) {
      paragraphs = sections.map((section, index) => 
        index === 0 ? section : `### ${section}`
      );
    }
  }
  
  // If still one long paragraph, split by sentences to create natural breaks
  if (paragraphs.length === 1 && paragraphs[0].length > 300) {
    const sentences = paragraphs[0].match(/[^\.!?]+[\.!?]+/g) || [paragraphs[0]];
    const newParagraphs: string[] = [];
    let currentPara = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;
      
      // If adding this sentence would make paragraph too long, start new one
      if (currentPara && (currentPara + ' ' + trimmedSentence).length > 200) {
        newParagraphs.push(currentPara.trim());
        currentPara = trimmedSentence;
      } else {
        currentPara = currentPara ? currentPara + ' ' + trimmedSentence : trimmedSentence;
      }
    }
    
    if (currentPara.trim()) {
      newParagraphs.push(currentPara.trim());
    }
    
    paragraphs = newParagraphs.length > 0 ? newParagraphs : paragraphs;
  }
  
  return paragraphs.length > 0 ? paragraphs : [text];
}

export async function POST(request: NextRequest) {
  try {
    const { message }: { message: string } = await request.json();

    if (!message?.trim()) {
      return new Response('Message is required', { status: 400 });
    }

    // Create a readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial chunk with message metadata
          const messageId = uuidv4();
          
          // Small delay to ensure client receives message before stream starts
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const startChunk = createChunk({
            type: 'start',
            messageId,
            timestamp: new Date().toISOString()
          });
          controller.enqueue(encoder.encode(startChunk));

          // Get the complete response
          const fullResponse = await processChatMessage(message);
          
          // Split the response content into paragraphs for separate messages
          const paragraphs = splitIntoParagraphs(fullResponse.content);
          
          // Stream each paragraph as a separate message
          for (let i = 0; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i];
            
            // Add a natural delay between paragraphs to simulate human thinking/typing
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
            }
            
            const paragraphMessageId = `${messageId}-para-${i}`;
            
            // Send paragraph start
            const paragraphStartChunk = createChunk({
              type: 'paragraph_start',
              messageId: paragraphMessageId,
              parentMessageId: messageId,
              content: paragraph,
              paragraphIndex: i,
              totalParagraphs: paragraphs.length,
              timestamp: new Date().toISOString()
            });
            
            controller.enqueue(encoder.encode(paragraphStartChunk));
            
            // Send paragraph complete (for UI to finalize the message)
            const paragraphCompleteChunk = createChunk({
              type: 'paragraph_complete',
              messageId: paragraphMessageId,
              parentMessageId: messageId,
              fullMessage: {
                id: paragraphMessageId,
                content: paragraph,
                role: 'assistant',
                timestamp: new Date(),
                type: fullResponse.type,
                metadata: i === paragraphs.length - 1 ? fullResponse.metadata : undefined
              }
            });
            
            controller.enqueue(encoder.encode(paragraphCompleteChunk));
          }

          // Send final metadata
          const endChunk = createChunk({
            type: 'complete',
            messageId,
            fullMessage: {
              id: fullResponse.id,
              content: fullResponse.content,
              role: fullResponse.role,
              timestamp: fullResponse.timestamp,
              type: fullResponse.type,
              metadata: fullResponse.metadata
            }
          });
          controller.enqueue(encoder.encode(endChunk));
          
          // Close the stream
          controller.close();
          
        } catch (error) {
          console.error('Streaming error:', error);
          
          const errorChunk = createChunk({
            type: 'error',
            messageId: uuidv4(),
            error: "I'm experiencing some technical difficulties. Please try again or contact Roy directly."
          });
          controller.enqueue(encoder.encode(errorChunk));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat stream API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}