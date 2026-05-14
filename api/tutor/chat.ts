/**
 * Vercel Edge Function: /api/tutor/chat
 *
 * Streams Claude responses as Server-Sent Events.
 * Reads ANTHROPIC_API_KEY from environment.
 *
 * Wire protocol:
 *   POST { messages, profile, msv, turn }
 *   Response: text/event-stream, frames `data: {"type":"delta","delta":"..."}`
 *
 * Hard cap: 4096 output tokens.
 */

import Anthropic from '@anthropic-ai/sdk'
import {
  buildSystemPrompt,
  DEFAULT_MSV,
  DEFAULT_PROFILE,
  DEFAULT_TURN,
  type TutorMSV,
  type TutorProfile,
  type TutorTurnContext,
} from '../../src/lib/tutorPrompt'

export const config = { runtime: 'edge' }

const MODEL = 'claude-sonnet-4-5'
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
    .process?.env?.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response('Missing ANTHROPIC_API_KEY', { status: 500 })
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

  const system = buildSystemPrompt(profile, msv, turn)

  const client = new Anthropic({ apiKey })

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = await client.messages.stream({
          model: MODEL,
          max_tokens: MAX_OUTPUT_TOKENS,
          system,
          messages: wireMessages,
        })

        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(sse({ type: 'delta', delta: event.delta.text }))
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
