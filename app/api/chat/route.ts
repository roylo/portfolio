import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { processChatMessage } from '@/lib/chatbot-actions';

// Prevent metadata generation for API routes
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { message }: { 
      message: string; 
    } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await processChatMessage(message);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        id: uuidv4(),
        content: "I'm experiencing technical difficulties. Please try again later or contact Roy directly.",
        role: 'assistant' as const,
        timestamp: new Date(),
        type: 'text' as const
      },
      { status: 500 }
    );
  }
}