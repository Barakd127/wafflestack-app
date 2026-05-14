/**
 * Vercel Edge Function: /api/tutor/chat
 *
 * Streams OpenAI responses as Server-Sent Events.
 * Reads OPENAI_API_KEY from environment.
 *
 * Wire protocol:
 *   POST { messages, profile, msv, turn }
 *   Response: text/event-stream, frames `data: {"type":"delta","delta":"..."}`
 *
 * Hard cap: 4096 output tokens.
 * OpenAI auto-caches stable prompt prefixes (>=1024 tokens), so we flatten
 * the 6-section prompt into a single system message — the API handles caching
 * transparently. Stable sections (persona/curriculum/tools/profile) come first;
 * volatile sections (MSV/turn) come last so the cache hits.
 */

import OpenAI from 'openai'
import {
  buildSystemPrompt,
  DEFAULT_MSV,
  DEFAULT_PROFILE,
  DEFAULT_TURN,
  flattenSystemPrompt,
  type TutorMSV,
  type TutorProfile,
  type TutorTurnContext,
} from '../../src/lib/tutorPrompt'

export const config = { runtime: 'edge' }

const MODEL = 'gpt-4o-mini'
const MAX_OUTPUT_TOKENS = 4096

interface ChatBody {
  messages?: { role: 'user' | 'assistant'; content: string }[]
  profile?: Partial<TutorProfile>
  msv?: Partial<TutorMSV>
  turn?: Partial<TutorTurnContext>
}

function sse(obj: Record<string, unknown>): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(obj)}\n\n`)
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = (globalThis as unknown as { process?: { env?: Record<string, string> } })
    .process?.env?.OPENAI_API_KEY
  if (!apiKey) {
    return new Response('Missing OPENAI_API_KEY', { status: 500 })
  }

  let body: ChatBody
  try {
    body = (await req.json()) as ChatBody
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const messages = Array.isArray(body.messages) ? body.messages : []
  if (messages.length === 0) {
    return new Response('Empty messages', { status: 400 })
  }
  // Filter to last 20 turns max
  const wireMessages = messages
    .slice(-20)
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')

  const profile: TutorProfile = { ...DEFAULT_PROFILE, ...(body.profile ?? {}) }
  const msv: TutorMSV = { ...DEFAULT_MSV, ...(body.msv ?? {}) }
  const turn: TutorTurnContext = { ...DEFAULT_TURN, ...(body.turn ?? {}) }

  // Flatten to single system string. Order preserved: stable prefix → volatile suffix.
  const system = flattenSystemPrompt(buildSystemPrompt(profile, msv, turn))

  const client = new OpenAI({ apiKey })

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = await client.chat.completions.create({
          model: MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          stream: true,
          messages: [
            { role: 'system', content: system },
            ...wireMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
        })

        for await (const chunk of response) {
          const delta = chunk.choices?.[0]?.delta?.content
          if (typeof delta === 'string' && delta.length > 0) {
            controller.enqueue(sse({ type: 'delta', delta }))
          }
        }
        controller.enqueue(sse({ type: 'done' }))
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        controller.enqueue(sse({ error: msg }))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
