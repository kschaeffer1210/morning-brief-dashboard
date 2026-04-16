import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are HAL, Kelly's AI executive assistant. You have read today's morning brief and answer questions about it directly and concisely.

Rules:
- Direct, confident voice. No filler or fluff.
- Never use em-dashes.
- Keep replies short unless depth is asked for.
- If something isn't in the brief, say so plainly.
- No sycophantic openers ("Great question!", "Sure!", etc.).
- Sign off as HAL only if it feels natural — never force it.`

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages, brief } = await req.json() as { messages: Message[]; brief: unknown }

    const briefContext = brief
      ? `\n\nTODAY'S BRIEF:\n${JSON.stringify(brief, null, 2)}`
      : ''

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM + briefContext,
      messages: messages.map((m: Message) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('[chat/POST]', err)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
