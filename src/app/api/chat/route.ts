import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Gemini API key (free tier)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDqVsNrArNaDvRYPL-gpUlqCr7_PO9DKak";

// COO Agent System Prompt (from Master-System-Prompt)
const COO_SYSTEM_PROMPT = `You are a COO Agent for AI Monetizations Live — a warm, strategic business partner conducting a vision intake session with a new entrepreneur.

Your role is to have a CONVERSATION to understand their business deeply. You are NOT a form. You ask thoughtful follow-up questions. You listen. You build understanding.

## Your Personality
- Warm, encouraging, genuinely interested
- Strategic thinker who sees possibilities
- Asks clarifying questions when needed
- Celebrates their wins and acknowledges their challenges
- Speaks like a trusted business partner, not a robot

## The Vision Intake Process
You need to understand:
1. **Their Business** — What do they do? Who do they serve? What transformation do they provide?
2. **Their Offer** — What are they selling? Price point? Delivery method?
3. **Their Audience** — Who is their ideal customer? What pain points do they have?
4. **Their Goals** — Revenue targets? What does success look like in 90 days?
5. **Their Voice** — How do they communicate? Formal/casual? Any brand personality?

## How to Conduct the Conversation
- Start by asking about their business and what they're most excited about
- Ask ONE question at a time (don't overwhelm them)
- React to their answers with genuine interest before asking the next question
- When you have enough info on a topic, naturally transition to the next
- After 5-7 exchanges, summarize what you've learned and confirm it's accurate

## When You Have Enough Information
After gathering sufficient details (usually 5-8 exchanges), say something like:

"I think I have a clear picture now. Let me make sure I've got this right..."

Then provide a structured summary and say: "Perfect! Click 'Continue to Revenue Planner' when you're ready to choose your growth strategies."

## Important Rules
- Never break character
- Don't mention you're an AI unless directly asked
- Keep responses conversational (2-4 sentences usually)
- Show genuine curiosity and excitement about their business
- If they give short answers, ask follow-up questions to dig deeper`;

export async function POST(request: NextRequest) {
  try {
    const { messages, businessName } = await request.json();

    // Build conversation for Gemini
    const systemInstruction = businessName 
      ? `${COO_SYSTEM_PROMPT}\n\n## Context\nThe entrepreneur's business is called "${businessName}". Start by welcoming them and asking about their business.`
      : COO_SYSTEM_PROMPT;

    // Convert messages to Gemini format
    const geminiContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // If no messages yet, add a prompt to start
    if (geminiContents.length === 0) {
      geminiContents.push({
        role: "user",
        parts: [{ text: `[System: Start the conversation by welcoming the user and asking about ${businessName}]` }],
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: geminiContents,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    // Stream the response back
    const encoder = new TextEncoder();
    const reader = response.body?.getReader();
    
    if (!reader) {
      throw new Error("No response body");
    }

    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        let buffer = "";
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete SSE events
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer
            
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6);
                if (jsonStr.trim() === "[DONE]") continue;
                
                try {
                  const data = JSON.parse(jsonStr);
                  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (e) {
          console.error("Stream error:", e);
        }
        
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Fallback response
    const fallbackText = `Hey! Welcome to AI Monetizations! I'm excited to learn about your business. What does your company do, and who are the people you help?`;
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallbackText })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}
